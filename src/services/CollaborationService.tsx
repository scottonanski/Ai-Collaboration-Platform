import { nanoid } from "nanoid";
import { ChatMessage, CollaborationControlState, CollaborationTask, CollaborationServiceActions, MessagePart } from "../collaborationTypes";
import { fetchOpenAIResponseStream, getOpenAIApiKeys } from "./openaiService";
import { useCollaborationStore } from '../store/collaborationStore';
import { parseBotMessage } from '../utils/messageParser';

// Simple throttle utility function
function throttle(func: (messageId: string, content: string, streaming: boolean) => void, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastCallArgs: { messageId: string, content: string, streaming: boolean } | null = null;

    const execute = () => {
        if (lastCallArgs) {
            func(lastCallArgs.messageId, lastCallArgs.content, lastCallArgs.streaming);
            lastCallArgs = null;
        }
        timeoutId = null;
    };

    const throttled = (messageId: string, content: string, streaming: boolean) => {
        lastCallArgs = { messageId, content, streaming };
        if (timeoutId === null) {
            timeoutId = setTimeout(execute, delay);
        }
    };

    throttled.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastCallArgs = null;
    };

    return throttled;
}

export class CollaborationService {
  private abortController: AbortController | null = null;
  private actions: CollaborationServiceActions;
  private shouldPause: boolean = false;
  private resumeCallback?: () => void;
  private requestSummary: boolean;
  private apiKey1: string = '';
  private apiKey2: string = '';

  private throttledUpdateMessageHandler;
  private readonly STREAM_UPDATE_INTERVAL = 150; // ms, for batching stream updates

  constructor(
    actions: CollaborationServiceActions, 
    requestSummary: boolean,
    apiKey1?: string,
    apiKey2?: string
  ) {
    this.actions = actions;
    this.requestSummary = requestSummary;
    
    // Load API keys from environment if not provided
    const envKeys = getOpenAIApiKeys();
    this.apiKey1 = apiKey1 || envKeys.worker1;
    this.apiKey2 = apiKey2 || envKeys.worker2;

    this.throttledUpdateMessageHandler = throttle(
        (messageId, content, streaming) => {
            this.actions.updateMessage(messageId, { message: content, streaming });
        },
        this.STREAM_UPDATE_INTERVAL
    );
  }

  async startCollaboration(initialUserMessageContent: string, task: CollaborationTask, initialUserMessageId?: string) {
    const newControl: Partial<CollaborationControlState> = {
      currentModel: task.worker1Model,
      otherModel: task.worker2Model,
      isCollaborating: true,
      isPaused: false,
      currentPhase: "processing",
      currentTurn: 1,
      totalTurns: task.turns,
      currentRole: task.worker1Role,
    };
    this.actions.setControl(newControl);

    await this.runCollaborationLoop(task, initialUserMessageContent);
  }

  pauseCollaboration() {
    this.shouldPause = true;
    if (this.abortController) {
        this.abortController.abort();
    }
    this.actions.setControl({ isPaused: true, currentPhase: "awaitingInput" });
  }

  resumeCollaboration() {
    this.shouldPause = false; 
    this.actions.setControl({ isPaused: false, currentPhase: "processing" }); 
    
    if (this.resumeCallback) {
      this.resumeCallback();
      this.resumeCallback = undefined;
    }
  }

  injectMessage(messageContent: string, injectedMessageId?: string) {
    // The message is already added by ChatInterface.tsx.
    // The service will pick it up from the store history in runCollaborationLoop.
  }

  stopCollaboration() {
    this.shouldPause = true;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.actions.setControl({ isCollaborating: false, isPaused: false, currentPhase: 'idle', currentTurn: 0 });
  }

  private processCodeFromResponse(response: string) {
    console.log('=== processCodeFromResponse called ===');
    console.log('Raw response:', response);
    
    const parts = parseBotMessage(response);
    console.log('Parsed parts:', parts);
    
    const codeParts = parts.filter((part): part is Extract<MessagePart, { type: 'code' }> => part.type === 'code');
    console.log('Code parts found:', codeParts.length);

    codeParts.forEach((part, index) => {
      if (!part.code) return;

      // Determine file type and extension based on language hint or content
      let fileExt = 'js';
      let fileType = 'javascript';
      const language = part.language?.toLowerCase() || '';
      
      if (language) {
        // Map common language hints to file extensions
        const extensionMap: Record<string, { ext: string, type: string }> = {
          'javascript': { ext: 'js', type: 'javascript' },
          'js': { ext: 'js', type: 'javascript' },
          'typescript': { ext: 'ts', type: 'typescript' },
          'ts': { ext: 'ts', type: 'typescript' },
          'jsx': { ext: 'jsx', type: 'javascript' },
          'tsx': { ext: 'tsx', type: 'typescript' },
          'html': { ext: 'html', type: 'html' },
          'css': { ext: 'css', type: 'css' },
          'json': { ext: 'json', type: 'json' },
          'python': { ext: 'py', type: 'python' },
          'py': { ext: 'py', type: 'python' },
        };

        const mapping = extensionMap[language];
        if (mapping) {
          fileExt = mapping.ext;
          fileType = mapping.type;
        }
      }

      // Generate a meaningful filename
      const timestamp = new Date().getTime();
      const fileName = `code-${timestamp}-${index + 1}.${fileExt}`;
      const filePath = `/src/${fileName}`;

      // Create file object
      const file = {
        id: `file-${timestamp}-${index}`,
        name: fileName,
        type: 'file' as const,
        path: filePath,
        content: part.code,
        fileType,
      };

      // Add file to the file system
      console.log('Adding file to file system:', file);
      try {
        this.actions.addFile(file);
        console.log('File added successfully');
      } catch (error) {
        console.error('Error adding file:', error);
      }

      // Update code content for live preview if it's a web file
      if (['html', 'css', 'javascript', 'typescript'].includes(fileType)) {
        console.log('Updating code content for file type:', fileType);
        const currentContent = useCollaborationStore.getState().codeContent;
        const newContent = { ...currentContent };
        
        if (fileType === 'html') {
          newContent.html = part.code;
        } else if (fileType === 'css') {
          newContent.css = part.code;
        } else if (['javascript', 'typescript'].includes(fileType)) {
          newContent.js = part.code;
        }
        
        this.actions.setCodeContent(newContent);
      }
    });
  }

  private async runCollaborationLoop(task: CollaborationTask, initialPrompt?: string) {
    let currentTurn = useCollaborationStore.getState().control.currentTurn || 1;
    let firstIteration = true;

    try {
      while (useCollaborationStore.getState().control.isCollaborating && currentTurn <= task.turns) {
        if (this.shouldPause) {
          this.actions.setControl({ isPaused: true, currentPhase: "awaitingInput" });
          await new Promise<void>((resolve) => { this.resumeCallback = resolve; });
          
          if (!useCollaborationStore.getState().control.isCollaborating) break;
          this.actions.setControl({ isPaused: false, currentPhase: "processing" });
          this.shouldPause = false;
        }

        const controlState = useCollaborationStore.getState().control;
        const currentRole = controlState.currentRole || task.worker1Role;
        const isWorker1Turn = currentRole === task.worker1Role;

        const currentWorkerConfig = isWorker1Turn 
            ? { name: task.worker1Name, model: task.worker1Model, apiKey: this.apiKey1, role: task.worker1Role }
            : { name: task.worker2Name, model: task.worker2Model, apiKey: this.apiKey2, role: task.worker2Role };

        this.actions.setControl({ currentModel: currentWorkerConfig.model, currentPhase: "processing", currentTurn });
        
        const workingMemory = useCollaborationStore.getState().messages;
        let promptContent: string;

        if (firstIteration && initialPrompt) {
            promptContent = initialPrompt;
            firstIteration = false;
        } else {
            const lastMessage = workingMemory.length > 0 ? workingMemory[workingMemory.length - 1] : null;
            if (!lastMessage || lastMessage.senderName === currentWorkerConfig.name) {
                 promptContent = "Continue the task based on the full conversation history.";
            } else {
                promptContent = currentWorkerConfig.role === 'worker'
                ? `Based on the previous discussion, particularly "${lastMessage.message}", continue your work.`
                : `Review the latest work: "${lastMessage.message}", and provide feedback or next steps.`;
            }
        }
        
        const assistantMessageId = nanoid();
        const assistantMessagePlaceholder: ChatMessage = {
          id: assistantMessageId,
          senderName: currentWorkerConfig.name,
          role: 'assistant',
          message: '',
          createdAt: new Date().toISOString(),
          type: 'message',
          streaming: true,
        };
        this.actions.addMessage(assistantMessagePlaceholder);

        let accumulatedResponse = '';
        let streamError: Error | null = null;
        this.abortController = new AbortController();
        
        try {
          const messagesForApi = workingMemory.slice(-10).map((msg: ChatMessage) => ({
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.message
          }));
          messagesForApi.push({ role: 'user', content: promptContent });

          // Use OpenAI only - no provider switching
          if (!currentWorkerConfig.apiKey) {
            throw new Error(`OpenAI API key not available for ${currentWorkerConfig.name}`);
          }

          const stream = fetchOpenAIResponseStream(
            currentWorkerConfig.apiKey,
            currentWorkerConfig.model,
            messagesForApi,
            this.abortController.signal
          );

          for await (const chunk of stream) {
            if (this.abortController && this.abortController.signal.aborted) {
              break;
            }
            accumulatedResponse += chunk;
            this.throttledUpdateMessageHandler(assistantMessageId, accumulatedResponse, true);
          }
        } catch (error) {
          streamError = error instanceof Error ? error : new Error(String(error));
          console.error('Streaming error:', streamError);
          accumulatedResponse += `\n\n[ERROR: ${streamError.message}]`;
        } finally {
          this.throttledUpdateMessageHandler.cancel();
          this.actions.updateMessage(assistantMessageId, { 
            message: accumulatedResponse, 
            streaming: false 
          });
          
          // Process code blocks from the AI response
          this.processCodeFromResponse(accumulatedResponse);
          
          this.abortController = null;
        }

        if (streamError) {
            this.actions.setControl({ isCollaborating: false, currentPhase: 'error' });
            break; 
        }

        if (!useCollaborationStore.getState().control.isCollaborating || this.shouldPause) {
            break;
        }
        
        // Switch roles for next turn
        const nextRole = isWorker1Turn ? task.worker2Role : task.worker1Role;
        this.actions.setControl({ currentRole: nextRole });
        
        if (!isWorker1Turn) {
            currentTurn++;
             this.actions.setControl({ currentTurn });
        }
        
        if (currentTurn > task.turns) {
           this.actions.setControl({ isCollaborating: false, currentPhase: 'completed' });
        }
      }
    } catch (error) {
      console.error('Fatal error in collaboration loop:', error);
      this.actions.setControl({ isCollaborating: false, isPaused: false, currentPhase: 'error' });
    } finally {
      if (this.abortController) {
          this.abortController.abort();
          this.abortController = null;
      }
      const finalControlState = useCollaborationStore.getState().control;
      if (finalControlState.isCollaborating && finalControlState.currentPhase !== 'completed' && finalControlState.currentPhase !== 'error') {
        this.actions.setControl({ isCollaborating: false, isPaused: false, currentPhase: 'idle' });
      }
    }
  }
}