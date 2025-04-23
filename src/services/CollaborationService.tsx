import { nanoid } from "nanoid";
import { ChatMessage, CollaborationControlState, CollaborationState, CollaborationTask, CollaborationServiceActions } from "../collaborationTypes";
import { fetchOllamaResponseStream } from "./ollamaServices.stream";
import { useCollaborationStore } from '../store/collaborationStore';

export class CollaborationService {
  private abortController: AbortController | null = null;

  private actions: CollaborationServiceActions;
  private shouldPause: boolean = false;
  private resumeCallback?: () => void;
  private requestSummary: boolean;

  constructor(actions: CollaborationServiceActions, requestSummary: boolean) {
    this.actions = actions;
    this.requestSummary = requestSummary;
  }

  private checkMemoryLimit() {
    // Removed the call to compressMemory
  }



  async startCollaboration(message: string, task: CollaborationTask) {
    const serviceTimestamp = Date.now();
    console.log(`[${serviceTimestamp}] Service: startCollaboration called with message: "${message}"`);
    console.log("Service: Starting collaboration... Task:", task);
    const newControl: Partial<CollaborationControlState> = {
      currentModel: task.worker1Model,
      otherModel: task.worker2Model,
      isCollaborating: true,
      isPaused: false,
      currentPhase: "processing",
      currentRole: task.worker1Role,
    };
    const newMessage: ChatMessage = {
      id: nanoid(),
      senderName: "User",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    this.actions.addMessage(newMessage);
    this.actions.setControl(newControl);
    await this.runCollaborationLoop(task.worker1Name, task.worker2Name, task.worker1Role, task.worker2Role);
  }

  pauseCollaboration() {
    console.log("Service: Signaling pause.");
    this.shouldPause = true;
    this.actions.setControl({ isPaused: true, currentPhase: "awaitingInput" });
  }

  resumeCollaboration() {
    console.log("Service: Signaling resume.");
    // Reset the pause flag
    this.shouldPause = false; 
    // Update the state to reflect resumption
    this.actions.setControl({ isPaused: false, currentPhase: "processing" }); 
    
    if (this.resumeCallback) {
      this.resumeCallback();
      this.resumeCallback = undefined;
    }
  }

  injectMessage(message: string) {
    const serviceTimestamp = Date.now();
    console.log(`[${serviceTimestamp}] Service: injectMessage called with message: "${message}"`);
    console.log("Service: Injecting message:", message);
    const newMessage: ChatMessage = {
      id: nanoid(),
      senderName: "User (Injection)",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    this.actions.addMessage(newMessage);
  }

  stopCollaboration() {
    this.shouldPause = false;
    this.actions.setControl({ isCollaborating: false, isPaused: false });
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private async runCollaborationLoop(worker1Name: string, worker2Name: string, worker1Role: 'worker' | 'reviewer', worker2Role: 'worker' | 'reviewer') {
    let isCollaborating = true;
    let currentRole: 'worker' | 'reviewer' = worker1Role;
    let currentModel = '';
    let otherModel = '';
    // Get initial models from control (assume store is source of truth)
    // You may want to pass models as arguments if needed
    while (isCollaborating) {
      try {
        if (this.shouldPause) {
          this.actions.setControl({ isPaused: true, currentPhase: "awaitingInput" });
          await new Promise<void>(resolve => {
            this.resumeCallback = resolve;
          });
          this.actions.setControl({ isPaused: false });
        }

        // Get latest control state from store
        const control = useCollaborationStore.getState().control;
        isCollaborating = control.isCollaborating;
        currentRole = control.currentRole as 'worker' | 'reviewer';
        currentModel = currentRole === 'worker' ? control.currentModel : control.otherModel;
        otherModel = currentRole === 'worker' ? control.otherModel : control.currentModel;

        const isWorker = currentRole === 'worker';
        const currentName = isWorker ? worker1Name : worker2Name;

        // Generate appropriate prompt based on role
        let prompt: string;
        const workingMemory = useCollaborationStore.getState().messages;
        if (isWorker) {
          prompt = `Continue working on: ${workingMemory[workingMemory.length - 1].message}`;
        } else {
          prompt = `Review this work and provide feedback: ${workingMemory[workingMemory.length - 1].message}`;
        }

        const context = workingMemory.map(msg => `${msg.senderName}: ${msg.message}`);
        // Use streaming function
        // Prevent duplicate assistant messages per turn
        const lastMsg = workingMemory[workingMemory.length - 1];
        let assistantMessageId: string;
        if (lastMsg && lastMsg.role === (isWorker ? 'assistant' : 'system') && lastMsg.streaming) {
          assistantMessageId = lastMsg.id;
        } else {
          assistantMessageId = nanoid();
          const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            senderName: currentName,
            role: isWorker ? 'assistant' : 'system',
            message: '',
            createdAt: new Date().toISOString(),
            type: 'message',
            streaming: true,
          };
          this.actions.addMessage(assistantMessage);
        }

        let accumulatedResponse = '';
        let streamError: Error | null = null;
        try {
          this.abortController = new AbortController();
          const stream = fetchOllamaResponseStream(currentModel, [...context, prompt].join('\n'), this.abortController.signal);
          for await (const chunk of stream) {
            accumulatedResponse += chunk;
            this.actions.updateMessage(assistantMessageId, { message: accumulatedResponse });
            if (this.shouldPause) {
              break;
            }
          }
        } catch (error) {
          streamError = error instanceof Error ? error : new Error(String(error));
          console.error('Streaming error:', streamError);
        } finally {
          if (streamError) {
            this.actions.updateMessage(assistantMessageId, { message: accumulatedResponse + `\n\n[STREAM ERROR: ${streamError.message}]` });
          }
          this.actions.updateMessage(assistantMessageId, { streaming: false });
        }
        // TODO: Implement memory limit/pruning if needed using store
        // Switch roles
        this.actions.setControl({ currentRole: isWorker ? 'reviewer' : 'worker' });
        await new Promise(resolve => setTimeout(resolve, 100));
        // Refresh isCollaborating for next loop
        isCollaborating = useCollaborationStore.getState().control.isCollaborating;
      } catch (error) {
        console.error('Error in collaboration loop:', error);
        this.actions.setControl({ isCollaborating: false });
        break;
      }
    }
    if (this.requestSummary) {
      // Removed the call to compressMemory
    }
  }
}

export type { CollaborationState }; 