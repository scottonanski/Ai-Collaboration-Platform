import React, { useEffect, useState } from 'react';
import { CollaborationService, CollaborationState } from '../../services/CollaborationService';
import ChatMessage from './ChatMessage';
import StrategicMemoryChunkComponent from './StrategicMemoryChunk';
import { checkOllamaConnection, fetchOllamaModels } from '../../services/ollamaServices';
import SettingsDrawer from '../Drawers/SettingsDrawer';
import CollaborationSettings from '../Drawers/CollaborationSettings';
import { CollaborationStateManager } from '../../utils/CollaborationStateManager';
import ResizableDrawer from '../Drawers/ResizableDrawer';
import { Settings, FolderCode, ScanEye } from 'lucide-react';

interface ChatInterfaceProps {
  folderDrawerId: string;
  previewDrawerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ folderDrawerId, previewDrawerId }) => {
  const [collabService, setCollabService] = useState<CollaborationService | null>(null);
  const [collabState, setCollabState] = useState<CollaborationState | null>(null);
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [isGenerating, setIsGenerating] = useState(false); // New state for loading

  // Settings state
  const [worker1Name, setWorker1Name] = useState('Worker 1');
  const [worker1Model, setWorker1Model] = useState('');
  const [worker2Name, setWorker2Name] = useState('Worker 2');
  const [worker2Model, setWorker2Model] = useState('');
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);
  const [api1Provider, setApi1Provider] = useState('ollama');
  const [api2Provider, setApi2Provider] = useState('ollama');
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [resumeOnInterjection, setResumeOnInterjection] = useState(true);
  const [summaryModel, setSummaryModel] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  const handleStateUpdate = (newState: CollaborationState) => {
    setCollabState(newState);
  };

  useEffect(() => {
    const service = new CollaborationService(handleStateUpdate, requestSummary);
    setCollabService(service);

    // Load saved state on mount
    const savedState = CollaborationStateManager.load();
    if (savedState) {
      setCollabState(savedState);
      service.startCollaboration('', {
        turns: savedState.control.totalTurns / 2,
        worker1Model: savedState.control.currentModel,
        worker2Model: savedState.control.otherModel,
        worker1Name:
          savedState.memory.workingMemory.find((msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 1'))
            ?.senderName || 'Worker 1',
        worker2Name:
          savedState.memory.workingMemory.find((msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 2'))
            ?.senderName || 'Worker 2',
      });
    }

    const checkConnection = async () => {
      const status = await checkOllamaConnection();
      console.log('Ollama connection status:', status);
      setOllamaStatus(status);

      if (status === 'connected') {
        const fetchedModels = await fetchOllamaModels();
        console.log('Fetched models in ChatInterface:', fetchedModels);
        setModels(fetchedModels);
        if (fetchedModels.length > 0 && !savedState) {
          setWorker1Model(fetchedModels[0]);
          setWorker2Model(fetchedModels.length > 1 ? fetchedModels[1] : fetchedModels[0]);
          setSummaryModel(fetchedModels[0]);
        }
      }
      setIsLoadingModels(false);
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => {
      console.log('CollaborationService instance cleanup (if necessary)');
      clearInterval(interval);
    };
  }, [requestSummary]);

  useEffect(() => {
    const service = new CollaborationService(handleStateUpdate, requestSummary);
    setCollabService(service);

    const checkConnection = async () => {
      const status = await checkOllamaConnection();
      console.log('Ollama connection status:', status);
      setOllamaStatus(status);

      if (status === 'connected') {
        const fetchedModels = await fetchOllamaModels();
        console.log('Fetched models in ChatInterface:', fetchedModels);
        setModels(fetchedModels);
        if (fetchedModels.length > 0) {
          // Load saved state but don't start collaboration
          const savedState = CollaborationStateManager.load();
          if (savedState) {
            setCollabState(savedState);
            // Update settings to reflect the restored state
            setWorker1Model(savedState.control.currentModel);
            setWorker2Model(savedState.control.otherModel);
            setWorker1Name(
              savedState.memory.workingMemory.find(
                (msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 1')
              )?.senderName || 'Worker 1'
            );
            setWorker2Name(
              savedState.memory.workingMemory.find(
                (msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 2')
              )?.senderName || 'Worker 2'
            );
            setTurns(savedState.control.totalTurns / 2);
          } else {
            // Set default models only if no saved state
            setWorker1Model(fetchedModels[0]);
            setWorker2Model(fetchedModels.length > 1 ? fetchedModels[1] : fetchedModels[0]);
            setSummaryModel(fetchedModels[0]);
          }
        }
      }
      setIsLoadingModels(false);
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => {
      console.log('CollaborationService instance cleanup (if necessary)');
      clearInterval(interval);
    };
  }, [requestSummary]);

  const messagesToDisplay = collabState?.memory.workingMemory ?? [];

  const canPause = collabState?.control.isCollaborating && !collabState?.control.isPaused;
  const canResume = collabState?.control.isCollaborating && collabState?.control.isPaused;
  const canSubmit =
    (!collabState?.control.isCollaborating || collabState?.control.isPaused) &&
    message.trim().length > 0 &&
    ollamaStatus === 'connected' && // Prevent submission if Ollama is disconnected
    !isGenerating; // Prevent submission during generation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabService || !canSubmit) return;

    if (collabState?.control.isPaused) {
      console.log('UI: Injecting message during pause.');
      collabService.injectMessage(message);
      if (resumeOnInterjection) {
        collabService.resumeCollaboration();
      }
      setMessage('');
    } else {
      console.log('UI: Starting new collaboration.');
      setIsGenerating(true); // Set loading state
      await collabService.startCollaboration(message, {
        turns,
        worker1Model,
        worker2Model,
        worker1Name,
        worker2Name,
      });
      setIsGenerating(false); // Clear loading state
      setMessage('');
    }
  };

  let placeholderText = 'Type your message...';
  let ariaLabel = 'Type your message...';
  if (collabState?.control.isPaused) {
    placeholderText = 'Collaboration Paused: Please interject...';
    ariaLabel = 'Collaboration Paused: Please interject...';
  } else if (collabState?.control.isCollaborating || isGenerating) {
    placeholderText = 'Collaboration in progress...';
    ariaLabel = 'Collaboration in progress...';
  }
  if (collabState?.control.isPaused && message.trim().length > 0) {
    placeholderText = 'Interjection submitted to the collaboration';
    ariaLabel = 'Interjection submitted to the collaboration';
  }
  if (ollamaStatus === 'disconnected') {
    placeholderText = 'Ollama disconnected. Please check your server.';
    ariaLabel = 'Ollama disconnected. Please check your server.';
  }

  let statusMessage = '';
  if (collabState?.control.currentPhase === 'idle' && !isGenerating) {
    statusMessage = 'Ready to start collaboration.';
  } else if (collabState?.control.currentPhase === 'processing' || isGenerating) {
    statusMessage = 'Collaborating...';
  } else if (collabState?.control.currentPhase === 'awaitingInput') {
    statusMessage = 'Paused: Awaiting your input...';
  }

  return (
    <main
      className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
      role="main"
      aria-label="Chat Interface"
      data-component="ChatInterface"
    >
      <div
        className="flex flex-col gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
        role="log"
        aria-label="Chat HistoryDEB"
        aria-live="polite"
      >
        {messagesToDisplay.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
        role="region"
        aria-label="Chat Input Area"
        id="ChatInputContainer"
      >
        <div
          className="flex flex-row w-full mb-2"
          role="group"
          id="ChatTextAreaInputContainer"
          aria-label="Chat Text Input"
        >
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholderText}
            aria-label={ariaLabel}
            aria-controls="chat-send-button"
            disabled={
              isGenerating ||
              (collabState?.control.isCollaborating && !collabState?.control.isPaused) ||
              ollamaStatus === 'disconnected'
            }
            className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-zinc-800 text-base-content placeholder:text-base-content/50 resize-none"
          />
        </div>
        {(collabState?.control.isCollaborating || isGenerating) && !collabState?.control.isPaused && (
          <div className="flex items-center gap-2 mt-2">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        )}
        <nav
          className="flex flex-row items-center justify-between w-full"
          role="navigation"
          id="ChatTextInputButtonContainer"
          aria-label="Chat Controls"
        >
          <div className="flex flex-row gap-2" id="chat-settings-buttons">
            <label
              htmlFor={folderDrawerId}
              className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
              data-tip="Files"
              aria-label="Open Folder Drawer"
            >
              <FolderCode />
            </label>
            <SettingsDrawer
              trigger={
                <button
                  className="btn btn-sm btn-ghost tooltip tooltip-top"
                  data-tip="Settings"
                  aria-label="Open Settings Drawer"
                >
                  <Settings size={16} />
                </button>
              }
              worker1Name={worker1Name}
              worker1Model={worker1Model}
              worker2Name={worker2Name}
              worker2Model={worker2Model}
              turns={turns}
              onAcceptSettings={() => {
                console.log('Settings accepted:', {
                  worker1Name,
                  worker1Model,
                  worker2Name,
                  worker2Model,
                  turns,
                });
              }}
            >
              <CollaborationSettings
                worker1Name={worker1Name}
                setWorker1Name={setWorker1Name}
                worker1Model={worker1Model}
                setWorker1Model={setWorker1Model}
                worker2Name={worker2Name}
                setWorker2Name={setWorker2Name}
                worker2Model={worker2Model}
                setWorker2Model={setWorker2Model}
                availableModels={models}
                api1Provider={api1Provider}
                setApi1Provider={setApi1Provider}
                api2Provider={api2Provider}
                setApi2Provider={setApi2Provider}
                turns={turns}
                setTurns={setTurns}
                requestSummary={requestSummary}
                setRequestSummary={setRequestSummary}
                apiKey1={apiKey1}
                setApiKey1={setApiKey1}
                apiKey2={apiKey2}
                setApiKey2={setApiKey2}
                isLoadingModels={isLoadingModels}
                resumeOnInterjection={resumeOnInterjection}
                setResumeOnInterjection={setResumeOnInterjection}
                summaryModel={summaryModel}
                setSummaryModel={setSummaryModel}
              />
            </SettingsDrawer>

            <ResizableDrawer
              id="chat-preview-drawer"
              mainContent={
                <label
                  htmlFor="chat-preview-drawer"
                  className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
                  data-tip="Preview"
                  aria-label="Open Preview Drawer"
                >
                  <ScanEye size={16} />
                </label>
              }
              strategicMemory={collabState?.memory.strategicMemory || []}
            />
            
          </div>
          <div className="flex flex-row gap-2" id="chat-control-buttons">
            <div style={{ display: 'inline-block' }}>
              <button
                type="button"
                disabled={!canPause}
                onClick={() => collabService?.pauseCollaboration()}
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Pause Chat"
                aria-label="Pause"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pause"
                >
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            </div>
            <div style={{ display: 'inline-block' }}>
              <button
                type="button"
                disabled={!canResume}
                onClick={() => collabService?.resumeCollaboration()}
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Resume Chat"
                aria-label="Resume"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </button>
            </div>
            <div style={{ display: 'inline-block' }}>
              <button
                type="submit"
                disabled={!canSubmit}
                id="chat-send-button"
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Send Message"
                aria-label="Send Message"
              >
                <svg
                  xmlns="http://www3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-send"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <div style={{ display: 'inline-block' }}>
              <span
                className="text-base-content/50 text-sm tooltip tooltip-top"
                data-tip="LLM Model Status"
                aria-label="LLM Model Status"
              >
                {ollamaStatus}
              </span>
            </div>
          </div>
        </nav>
        <span className="text-base-content/50 text-sm mt-2">{statusMessage}</span>
      </form>
    </main>
  );
};

export default ChatInterface;
