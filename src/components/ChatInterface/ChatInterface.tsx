import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCollaborationStore } from '../../store/collaborationStore';
import { ChatMessage, CollaborationState, CollaborationServiceActions } from '../../collaborationTypes';
import { CollaborationService } from '../../services/CollaborationService';
import ChatMessageComponent from './ChatMessage';
import { checkOllamaConnection, fetchOllamaModels } from '../../services/ollamaServices';
import SettingsDrawer from '../Drawers/SettingsDrawer';
import CollaborationSettings from '../Drawers/CollaborationSettings';
// Import icons
import { Settings, Folder, Eye, SendHorizontal, Pause, Play, Trash2, Zap, Brain, Sparkles, Upload } from 'lucide-react';
// Use nanoid for message IDs
import { nanoid } from 'nanoid';

interface ChatInterfaceProps {
  folderDrawerId: string;
  previewDrawerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ folderDrawerId, previewDrawerId }) => {
  const messages = useCollaborationStore((state) => state.messages);
  const control = useCollaborationStore((state) => state.control);
  const connectionStatus = useCollaborationStore((state) => state.connectionStatus);
  const addMessage = useCollaborationStore((state) => state.addMessage);
  const updateMessage = useCollaborationStore((state) => state.updateMessage);
  const setConnectionStatus = useCollaborationStore((state) => state.setConnectionStatus);
  const setControl = useCollaborationStore((state) => state.setControl);
  const setMessages = useCollaborationStore((state) => state.setMessages);
  const aiWorkers = useCollaborationStore((state) => state.aiWorkers);
  const addUploadedFile = useCollaborationStore((state) => state.addUploadedFile);
  const uploadedFiles = useCollaborationStore((state) => state.uploadedFiles);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const submissionLock = useRef(false);
  const lastSubmissionTime = useRef(0);
  const [models, setModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [worker1Name, setWorker1Name] = useState(aiWorkers.worker1.name);
  const [worker1Model, setWorker1Model] = useState('');
  const [worker2Name, setWorker2Name] = useState(aiWorkers.worker2.name);
  const [worker2Model, setWorker2Model] = useState('');
  const [turns, setTurns] = useState(3);
  const [requestSummary, setRequestSummary] = useState(true);
  const [api1Provider, setApi1Provider] = useState('ollama');
  const [api2Provider, setApi2Provider] = useState('ollama');
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [resumeOnInterjection, setResumeOnInterjection] = useState(true);
  const [summaryModel, setSummaryModel] = useState('');
  
  // Advanced features
  const [collaborationMode, setCollaborationMode] = useState<'turn-based' | 'parallel' | 'hierarchical'>('turn-based');
  const [isMultiModal, setIsMultiModal] = useState(false);

  // Ref to access CollaborationService instance methods
  const collaborationServiceRef = useRef<CollaborationService | null>(null);

  // Ref for textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to initialize and store the service instance
  useEffect(() => {
    const storeActions: CollaborationServiceActions = {
      addMessage: useCollaborationStore.getState().addMessage,
      updateMessage: useCollaborationStore.getState().updateMessage,
      setControl: useCollaborationStore.getState().setControl,
      setConnectionStatus: useCollaborationStore.getState().setConnectionStatus,
    };
    collaborationServiceRef.current = new CollaborationService(storeActions, requestSummary);
  }, [requestSummary]);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoadingModels(true);
      const status = await checkOllamaConnection();
      console.log('Ollama connection status:', status);
      setConnectionStatus(status);

      if (status === 'connected') {
        try {
          const fetchedModels = await fetchOllamaModels();
          console.log('Fetched models in ChatInterface:', fetchedModels);
          setModels(fetchedModels);
          if (fetchedModels.length > 0) {
            if (!worker1Model) setWorker1Model(fetchedModels[0]);
            if (!worker2Model) setWorker2Model(fetchedModels.length > 1 ? fetchedModels[1] : fetchedModels[0]);
            if (!summaryModel) setSummaryModel(fetchedModels[0]);
          }
        } catch (error) {
          console.error("Failed to fetch Ollama models:", error);
          setConnectionStatus('disconnected');
        }
      }
      setIsLoadingModels(false);
    };

    checkConnection();
  }, [setConnectionStatus]);

  const messagesToDisplay = messages;

  const isPaused = control.isPaused;
  const isCollaborating = control.isCollaborating;

  const canSubmit = !(control.isCollaborating && !control.isPaused) && 
                   message.trim().length > 0 && 
                   connectionStatus === 'connected' && 
                   (!control.isCollaborating || control.isPaused) &&
                   !isSending;
  const canPause = control.isCollaborating && !control.isPaused;
  const canResume = control.isCollaborating && control.isPaused;

  // Enhanced submission with better debouncing and safety
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    const now = Date.now();
    const submitTimestamp = now;
    console.log(`[${submitTimestamp}] --- Submit Handler Triggered ---`);
    e?.preventDefault();

    // Enhanced double-submit prevention
    if (submissionLock.current || isSending || (now - lastSubmissionTime.current < 500)) {
      console.warn(`[${submitTimestamp}] Submission BLOCKED (Lock: ${submissionLock.current}, Sending: ${isSending}, Time: ${now - lastSubmissionTime.current}ms)`);
      return;
    }

    submissionLock.current = true;
    lastSubmissionTime.current = now;
    setIsSending(true);
    console.log(`[${submitTimestamp}] Submission LOCK ACQUIRED, isSending SET true`);

    try {
      if (!collaborationServiceRef.current || !message.trim()) {
        console.log(`[${submitTimestamp}] Submission cancelled (invalid state)`);
        return;
      }

      const currentMessage = message.trim();
      console.log(`[${submitTimestamp}] Processing message: "${currentMessage}"`);

      // Enhanced message with attachments if multimodal
      const messageContent = isMultiModal && uploadedFiles.length > 0 
        ? `${currentMessage}\n\n[Attached Files: ${uploadedFiles.map(f => f.name).join(', ')}]`
        : currentMessage;

      const newUserMessage: ChatMessage = {
        id: nanoid(),
        senderName: "User",
        role: "user",
        message: messageContent,
        createdAt: new Date().toISOString(),
        type: "message",
      };
      
      addMessage(newUserMessage);
      setMessage('');

      if (control.isPaused) {
        console.log(`[${submitTimestamp}] Injecting message during pause`);
        collaborationServiceRef.current.injectMessage(currentMessage);
        if (resumeOnInterjection) {
          collaborationServiceRef.current.resumeCollaboration();
        }
      } else if (!control.isCollaborating) {
        console.log(`[${submitTimestamp}] Starting new collaboration`);
        
        // Enhanced task configuration
        const task = {
          turns,
          worker1Model,
          worker2Model,
          worker1Name,
          worker2Name,
          worker1Role: aiWorkers.worker1.role as 'worker' | 'reviewer',
          worker2Role: aiWorkers.worker2.role as 'worker' | 'reviewer',
          collaborationMode,
          specializations: {
            worker1: aiWorkers.worker1.specialization,
            worker2: aiWorkers.worker2.specialization
          },
          customInstructions: {
            worker1: aiWorkers.worker1.customInstructions,
            worker2: aiWorkers.worker2.customInstructions
          }
        };
        
        await collaborationServiceRef.current.startCollaboration(currentMessage, task);
        console.log(`[${submitTimestamp}] startCollaboration awaited`);
      } else {
        console.warn(`[${submitTimestamp}] Attempted to send while active`);
      }
    } catch (error) {
      console.error(`[${submitTimestamp}] Submission error:`, error);
    } finally {
      console.log(`[${submitTimestamp}] Submission FINALLY block reached`);
      // Add delay before releasing lock to prevent rapid resubmission
      setTimeout(() => {
        submissionLock.current = false;
        setIsSending(false);
        console.log(`[${submitTimestamp}] Submission LOCK RELEASED, isSending SET false`);
      }, 300);
    }
  }, [isSending, message, control.isPaused, control.isCollaborating, resumeOnInterjection, turns, worker1Model, worker2Model, worker1Name, worker2Name, addMessage, setMessage, collaborationMode, aiWorkers, isMultiModal, uploadedFiles]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handlePause = useCallback(() => {
    collaborationServiceRef.current?.pauseCollaboration();
  }, [collaborationServiceRef]);

  const handleResume = useCallback(() => {
    collaborationServiceRef.current?.resumeCollaboration();
  }, [collaborationServiceRef]);

  const handleClearChat = useCallback(() => {
    if (confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      setControl({ isCollaborating: false, isPaused: false, currentTurn: 0 });
    }
  }, [setMessages, setControl]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => addUploadedFile(file));
    setIsMultiModal(true);
  };

  const handleSmartSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  let placeholderText = 'Type your message...';
  if (control.isPaused) {
    placeholderText = '⏸️ Collaboration Paused: Type your message to interject...';
  } else if (control.isCollaborating) {
    placeholderText = '🤖 Collaboration in progress... Waiting for response...';
  }
  if (connectionStatus !== 'connected') {
    placeholderText = '❌ Model Connection Error. Please check settings/server.';
  }

  let statusMessage = '';
  if (!control.isCollaborating && !(control.isCollaborating && !control.isPaused)) {
    statusMessage = '✅ Ready to start collaboration.';
  } else if (control.currentPhase === 'processing' || (control.isCollaborating && !control.isPaused)) {
    statusMessage = `🔄 Collaborating... (Turn ${control.currentTurn || '?'}/${control.totalTurns || '?'}) Processing...`;
  } else if (control.isPaused) {
    statusMessage = '⏸️ Paused: Awaiting your input...';
  } else if (control.isCollaborating) {
    statusMessage = `🤖 Collaborating... (Phase: ${control.currentPhase})`;
  }

  // Smart suggestions based on context
  const smartSuggestions = [
    "💡 Help me brainstorm ideas for...",
    "🔍 Analyze and improve this code...",
    "📝 Create a plan for...",
    "🚀 Build a prototype of...",
    "🔧 Debug this issue...",
    "📊 Compare different approaches to..."
  ];

  return (
    <main
      className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
      role="main" aria-label="Chat Interface" data-component="ChatInterface"
    >
      {/* Enhanced Header with quick actions */}
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar-group -space-x-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs">{worker1Name[0]}</span>
                  </div>
                </div>
                <div className="avatar placeholder">
                  <div className="bg-secondary text-secondary-content rounded-full w-8">
                    <span className="text-xs">{worker2Name[0]}</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-sm">🤖 AI Collaboration Session</h2>
                <p className="text-xs text-base-content/70">{worker1Name} & {worker2Name} • {collaborationMode} mode</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`badge badge-sm ${connectionStatus === 'connected' ? 'badge-success' : 'badge-error'}`}>
                {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-xs btn-ghost">⚡</label>
                <div className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <div className="menu-title">Quick Actions</div>
                  {smartSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <li key={idx}>
                      <a onClick={() => handleSmartSuggestion(suggestion)} className="text-xs">
                        {suggestion}
                      </a>
                    </li>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
        role="log" aria-label="Chat History" aria-live="polite"
        style={{ minHeight: '300px' }}
      >
        {messagesToDisplay.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">
            <Brain size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">🚀 Ready for AI Collaboration!</h3>
            <p className="mb-4">Start a conversation and watch two AI workers collaborate to solve your problem.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {smartSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSmartSuggestion(suggestion)}
                  className="btn btn-sm btn-ghost border border-dashed border-base-content/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messagesToDisplay.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))
        )}
      </div>

      {/* Enhanced Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-lg p-4 z-10 flex-none shadow-lg"
        role="region" aria-label="Chat Input Area" id="ChatInputContainer"
      >
        {/* File upload indicator */}
        {isMultiModal && uploadedFiles.length > 0 && (
          <div className="w-full mb-2 p-2 bg-primary/10 rounded border border-primary/30">
            <div className="flex items-center gap-2 text-sm">
              <Upload size={14} className="text-primary" />
              <span>📎 Attached: {uploadedFiles.map(f => f.name).join(', ')}</span>
              <button
                type="button"
                onClick={() => setIsMultiModal(false)}
                className="btn btn-xs btn-ghost ml-auto"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-row w-full mb-2" role="group" id="ChatTextAreaInputContainer" aria-label="Chat Text Input">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            placeholder={placeholderText}
            className={`textarea flex-grow resize-none rounded-md p-3 bg-base-300 border border-transparent focus:border-primary focus:ring-primary transition-all duration-200 ${
              control.isCollaborating && !control.isPaused ? 'bg-base-100 text-base-content/60' : ''
            }`}
            rows={message.split('\n').length > 1 ? Math.min(message.split('\n').length, 4) : 1}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSubmit) {
                  (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }
            }}
            disabled={connectionStatus !== 'connected' || (control.isCollaborating && !control.isPaused)}
          />
        </div>
        
        <nav className="flex flex-row items-center justify-between w-full mt-1" role="navigation" id="ChatTextInputButtonContainer" aria-label="Chat Controls">
          <div className="flex flex-row gap-2" id="chat-settings-buttons">
            <label htmlFor={folderDrawerId} className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top" data-tip="📁 Project Files" aria-label="Open Folder Drawer">
              <Folder size={16} />
            </label>
            
            <SettingsDrawer
              trigger={ 
                <button className="btn btn-sm btn-ghost p-1 tooltip tooltip-top" data-tip="⚙️ Settings" aria-label="Open Settings Drawer">
                  <Settings size={16} />
                </button> 
              }
              worker1Name={worker1Name} worker1Model={worker1Model} worker1Role={'worker'}
              worker2Name={worker2Name} worker2Model={worker2Model} worker2Role={'reviewer'}
              turns={turns}
              onAcceptSettings={() => {
                console.log('Settings accepted:', { worker1Name, worker1Model, worker2Name, worker2Model, turns });
              }}
            >
              <CollaborationSettings
                worker1Name={worker1Name} setWorker1Name={setWorker1Name}
                worker1Model={worker1Model} setWorker1Model={setWorker1Model}
                worker2Name={worker2Name} setWorker2Name={setWorker2Name}
                worker2Model={worker2Model} setWorker2Model={setWorker2Model}
                availableModels={models} isLoadingModels={isLoadingModels}
                api1Provider={api1Provider} setApi1Provider={setApi1Provider}
                api2Provider={api2Provider} setApi2Provider={setApi2Provider}
                turns={turns} setTurns={setTurns}
                requestSummary={requestSummary} setRequestSummary={setRequestSummary}
                apiKey1={apiKey1} setApiKey1={setApiKey1}
                apiKey2={apiKey2} setApiKey2={setApiKey2}
                resumeOnInterjection={resumeOnInterjection} setResumeOnInterjection={setResumeOnInterjection}
                summaryModel={summaryModel} setSummaryModel={setSummaryModel}
              />
            </SettingsDrawer>
            
            <label htmlFor={previewDrawerId} className="btn btn-sm btn-ghost p-1 tooltip tooltip-top" data-tip="👁️ Preview & Tools" aria-label="Open Preview Drawer">
              <Eye size={16} />
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.csv"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-ghost tooltip tooltip-top"
              data-tip="📎 Upload Files"
            >
              <Upload size={16} />
            </button>
          </div>
          
          <span className={`text-xs h-4 flex-grow text-center px-4 ${connectionStatus === 'connected' ? 'text-success' : 'text-error'}`}>
            {connectionStatus === 'connected' ? statusMessage : '❌ Failed to connect'}
          </span>
          
          <div className="flex flex-col items-end" id="chat-control-buttons-wrapper">
            <div className="flex flex-row gap-2">
              <button 
                type="button" 
                onClick={handleClearChat}
                className="btn btn-xs btn-ghost p-1 tooltip tooltip-top" 
                data-tip="🗑️ Clear Chat"
              >
                <Trash2 size={14} />
              </button>
              
              <button 
                type="button" 
                disabled={!canPause} 
                onClick={handlePause} 
                className="btn btn-xs btn-ghost p-1 tooltip tooltip-top" 
                data-tip="⏸️ Pause Chat" 
                aria-label="Pause Collaboration"
              >
                <Pause size={14} />
              </button>
              
              <button 
                type="button" 
                disabled={!canResume} 
                onClick={handleResume} 
                className="btn btn-xs btn-ghost p-1 tooltip tooltip-top" 
                data-tip="▶️ Resume Chat" 
                aria-label="Resume Collaboration"
              >
                <Play size={14} />
              </button>
              
              <button 
                type="submit" 
                disabled={!canSubmit} 
                id="chat-send-button" 
                className={`btn btn-xs btn-primary p-1 transition-all ${isSending ? 'loading' : ''}`} 
                aria-label="Send Message"
              >
                {isSending ? <span className="loading loading-spinner loading-xs"></span> : <SendHorizontal size={14} />}
              </button>
            </div>
          </div>
        </nav>
      </form>
    </main>
  );
};

export default ChatInterface;