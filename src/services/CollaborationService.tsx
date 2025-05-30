import { nanoid } from "nanoid";
import { ChatMessage, CollaborationControlState, CollaborationTask, CollaborationServiceActions } from "../collaborationTypes";
import { fetchOllamaResponseStream } from "./ollamaServices.stream";
import { fetchOpenAIResponseStream } from "./openaiService";
import { useCollaborationStore } from '../store/collaborationStore'; // Keep for types if needed, but avoid direct use in class methods for testability

type ModelProvider = 'ollama' | 'openai';

// Simple throttle utility function
function throttle(func: (messageId: string, content: string, streaming: boolean) => void, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastCallArgs: { messageId: string, content: string, streaming: boolean } | null = null;

    const execute = () => {
        if (lastCallArgs) {
            func(lastCallArgs.messageId, lastCallArgs.content, lastCallArgs.streaming);
            lastCallArgs = null; // Clear after execution
        }
        timeoutId = null; // Allow new timeout to be set
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
        lastCallArgs = null; // Clear any pending args
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
  private provider1: ModelProvider = 'ollama';
  private provider2: ModelProvider = 'ollama';

  private throttledUpdateMessageHandler;
  private readonly STREAM_UPDATE_INTERVAL = 150; // ms, for batching stream updates

  constructor(
    actions: CollaborationServiceActions, 
    requestSummary: boolean,
    apiKey1: string = '',
    apiKey2: string = '',
    provider1: ModelProvider = 'ollama',
    provider2: ModelProvider = 'ollama'
  ) {
    this.actions = actions;
    this.requestSummary = requestSummary;
    this.apiKey1 = apiKey1;
    this.apiKey2 = apiKey2;
    this.provider1 = provider1;
    this.provider2 = provider2;

    this.throttledUpdateMessageHandler = throttle(
        (messageId, content, streaming) => {
            this.actions.updateMessage(messageId, { message: content, streaming });
        },
        this.STREAM_UPDATE_INTERVAL
    );
  }

  // Removed checkMemoryLimit as it was empty

  // Modified to accept initialUserMessageId to link with UI-added message
  async startCollaboration(initialUserMessageContent: string, task: CollaborationTask, initialUserMessageId?: string) {
    // console.log(`Service: startCollaboration called with message: "${initialUserMessageContent}"`);
    // console.log("Service: Starting collaboration... Task:", task);
    
    const newControl: Partial<CollaborationControlState> = {
      currentModel: task.worker1Model,
      otherModel: task.worker2Model,
      isCollaborating: true,
      isPaused: false,
      currentPhase: "processing",
      currentTurn: 1, // Start at turn 1
      totalTurns: task.turns,
      currentRole: task.worker1Role, // Initial role
    };
    this.actions.setControl(newControl);

    // The user message is already added by ChatInterface.tsx.
    // The service will use the existing messages from the store.
    
    await this.runCollaborationLoop(task, initialUserMessageContent);
  }

  pauseCollaboration() {
    // console.log("Service: Signaling pause.");
    this.shouldPause = true;
    if (this.abortController) {
        this.abortController.abort(); // Abort current stream
    }
    this.actions.setControl({ isPaused: true, currentPhase: "awaitingInput" });
  }

  resumeCollaboration() {
    // console.log("Service: Signaling resume.");
    this.shouldPause = false; 
    this.actions.setControl({ isPaused: false, currentPhase: "processing" }); 
    
    if (this.resumeCallback) {
      this.resumeCallback();
      this.resumeCallback = undefined;
    }
  }

  // Modified to accept injectedMessageId to link with UI-added message
  injectMessage(messageContent: string, injectedMessageId?: string) {
    // console.log(`Service: injectMessage called with message: "${messageContent}"`);
    // The message is already added by ChatInterface.tsx.
    // The service will pick it up from the store history in runCollaborationLoop.
    // If resumeOnInterjection is true, ChatInterface calls resumeCollaboration.
  }

  stopCollaboration() {
    this.shouldPause = true; // Ensure loop terminates gracefully
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.actions.setControl({ isCollaborating: false, isPaused: false, currentPhase: 'idle', currentTurn: 0 });
    // console.log("Service: Collaboration stopped.");
  }

  private async runCollaborationLoop(task: CollaborationTask, initialPrompt?: string) {
    let currentTurn = useCollaborationStore.getState().control.currentTurn || 1;
    let firstIteration = true;

    try {
      while (useCollaborationStore.getState().control.isCollaborating && currentTurn <= task.turns) {
        if (this.shouldPause) {
          // console.log("Service: Loop paused, awaiting resume.");
          this.actions.setControl({ isPaused: true, currentPhase: "awaitingInput" });
          await new Promise<void>((resolve) => { this.resumeCallback = resolve; });
          
          if (!useCollaborationStore.getState().control.isCollaborating) break; // Stopped during pause
          this.actions.setControl({ isPaused: false, currentPhase: "processing" });
          this.shouldPause = false; // Reset flag after resume
          // console.log("Service: Loop resumed.");
        }

        const controlState = useCollaborationStore.getState().control;
        const currentRole = controlState.currentRole || task.worker1Role; // Default to worker1Role if undefined
        const isWorker1Turn = currentRole === task.worker1Role; // Or determine by alternating logic if more complex

        const currentWorkerConfig = isWorker1Turn 
            ? { name: task.worker1Name, model: task.worker1Model, provider: this.provider1, apiKey: this.apiKey1, role: task.worker1Role }
            : { name: task.worker2Name, model: task.worker2Model, provider: this.provider2, apiKey: this.apiKey2, role: task.worker2Role };

        this.actions.setControl({ currentModel: currentWorkerConfig.model, currentPhase: "processing", currentTurn });
        
        const workingMemory = useCollaborationStore.getState().messages; // Get fresh messages
        let promptContent: string;

        if (firstIteration && initialPrompt) {
            promptContent = initialPrompt;
            firstIteration = false;
        } else {
            const lastMessage = workingMemory.length > 0 ? workingMemory[workingMemory.length - 1] : null;
            if (!lastMessage || lastMessage.role === currentWorkerConfig.role) { // Avoid talking to self if last msg was by same role
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
          role: 'assistant', // All AI responses are 'assistant' role for UI styling
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
          let stream;
          const messagesForApi = workingMemory.slice(-10).map((msg: ChatMessage) => ({ // Use last N messages for context
            role: msg.role === 'user' ? 'user' : 'assistant', // Simplify roles for API
            content: msg.message
          }));
          messagesForApi.push({ role: 'user', content: promptContent });


          if (currentWorkerConfig.provider === 'openai' && currentWorkerConfig.apiKey) {
            stream = fetchOpenAIResponseStream(
              currentWorkerConfig.apiKey,
              currentWorkerConfig.model,
              messagesForApi,
              this.abortController.signal
            );
          } else { // Default to Ollama
            // Ollama typically prefers a single string prompt. Constructing one:
            const ollamaPromptStr = messagesForApi.map(m => `${m.role}: ${m.content}`).join('\n\n');
            stream = fetchOllamaResponseStream(
              currentWorkerConfig.model,
              ollamaPromptStr, // Pass the constructed string prompt
              this.abortController.signal
            );
          }

          for await (const chunk of stream) {
            if (this.abortController.signal.aborted) {
              // console.log("Service: Stream aborted during chunk processing.");
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
          this.throttledUpdateMessageHandler.cancel(); // Cancel any pending throttled update
          this.actions.updateMessage(assistantMessageId, { 
            message: accumulatedResponse, 
            streaming: false 
          });
          this.abortController = null; // Clear controller
        }

        if (streamError && this.abortController?.signal.aborted) { // If error was due to abort (e.g. pause)
             // console.log("Service: Stream processing ended due to abort/pause.");
             // Loop will check shouldPause or isCollaborating at the top.
        } else if (streamError) {
            // console.log("Service: Stream processing ended with an error. Collaboration might halt or retry based on strategy (not implemented).");
            // For now, we'll just stop if a worker errors out.
            this.actions.setControl({ isCollaborating: false, currentPhase: 'error' });
            break; 
        }


        if (!useCollaborationStore.getState().control.isCollaborating || this.shouldPause) {
            break; // Exit if stopped or paused during processing
        }
        
        // Switch roles for next turn
        const nextRole = isWorker1Turn ? task.worker2Role : task.worker1Role;
        this.actions.setControl({ currentRole: nextRole });
        
        if (!isWorker1Turn) { // If worker 2 (e.g. reviewer) just finished
            currentTurn++;
             this.actions.setControl({ currentTurn });
        }
        
        if (currentTurn > task.turns) {
           // console.log("Service: All turns completed.");
           this.actions.setControl({ isCollaborating: false, currentPhase: 'completed' });
           // Optionally, trigger summary generation here
        }
        // Brief delay to allow state updates to propagate if needed, though usually not necessary with Zustand
        // await new Promise(resolve => setTimeout(resolve, 50)); 
      }
    } catch (error) {
      console.error('Fatal error in collaboration loop:', error);
      this.actions.setControl({ isCollaborating: false, isPaused: false, currentPhase: 'error' });
    } finally {
      // console.log("Service: Exiting collaboration loop.");
      if (this.abortController) { // Ensure any active abort controller is handled
          this.abortController.abort();
          this.abortController = null;
      }
      const finalControlState = useCollaborationStore.getState().control;
      if (finalControlState.isCollaborating && finalControlState.currentPhase !== 'completed' && finalControlState.currentPhase !== 'error') {
        // If loop exited prematurely without setting a final state
        this.actions.setControl({ isCollaborating: false, isPaused: false, currentPhase: 'idle' });
      }
    }
  }
}

// export type { CollaborationState }; // This seems to be a leftover type export, can be removed if CollaborationState is defined elsewhere or not needed here.