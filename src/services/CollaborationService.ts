import { CollaborationState, ChatMessage } from "../collaborationTypes";
import { CollaborationStateManager } from "./CollaborationStateManager";
import { MemoryController } from "./MemoryController";
import { generateOllamaResponse } from "./ollamaServices";

type StateUpdateCallback = (newState: CollaborationState) => void;

interface CollaborationConfig {
  turns: number;
  worker1Model: string;
  worker2Model: string;
  worker1Name: string;
  worker2Name: string;
}

export class CollaborationService {
  private state: CollaborationState;
  private onStateUpdate: StateUpdateCallback;
  private abortPausePromise: (() => void) | null = null;

  constructor(updateCallback: StateUpdateCallback) {
    this.onStateUpdate = updateCallback;
    this.state = this.loadInitialState();
    this.notifyStateUpdate();
  }

  private loadInitialState(): CollaborationState {
    const loadedState = CollaborationStateManager.load();
    if (loadedState) {
      console.log("Loaded existing collaboration state.");
      return loadedState;
    }
    console.log("Initializing new collaboration state.");
    return {
      memory: { workingMemory: [], strategicMemory: [] },
      control: {
        currentTurn: 0,
        totalTurns: 0,
        currentModel: "",
        otherModel: "",
        isCollaborating: false,
        isPaused: false,
      },
    };
  }

  private notifyStateUpdate(): void {
    this.onStateUpdate(this.state);
    CollaborationStateManager.save(this.state);
  }

  public getState(): CollaborationState {
    return this.state;
  }

  public async startCollaboration(task: string, config: CollaborationConfig): Promise<void> {
    console.log("Service: Starting collaboration...", task, config);
    this.state = {
      memory: { workingMemory: [], strategicMemory: [] },
      control: {
        currentTurn: 0,
        totalTurns: config.turns * 2,
        currentModel: config.worker1Model,
        otherModel: config.worker2Model,
        isCollaborating: true,
        isPaused: false,
      },
    };
    this.state.memory.workingMemory.push({
      id: Date.now(),
      senderName: "User",
      role: "user",
      message: task,
      createdAt: new Date().toISOString(),
      type: "message",
    });
    this.notifyStateUpdate();

    try {
      await this.runCollaborationLoop(task, config.worker1Name, config.worker2Name);
    } catch (error) {
      console.error("Collaboration failed:", error);
      const errorMessage: ChatMessage = {
        id: Date.now(),
        senderName: "System",
        role: "user",
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        createdAt: new Date().toISOString(),
        type: "message",
      };
      this.state.memory.workingMemory.push(errorMessage);
    } finally {
      this.state.control.isCollaborating = false;
      this.notifyStateUpdate();
      console.log("Service: Collaboration loop finished.");
    }
  }

  private async runCollaborationLoop(task: string, worker1Name: string, worker2Name: string): Promise<void> {
    while (this.state.control.currentTurn < this.state.control.totalTurns) {
      if (this.state.control.isPaused) {
        console.log("Service Loop: Paused, waiting for resume signal...");
        await new Promise<void>((resolve) => {
          this.abortPausePromise = resolve;
        });
        console.log("Service Loop: Resumed.");
        this.abortPausePromise = null;
        this.notifyStateUpdate();
        if (!this.state.control.isCollaborating || this.state.control.isPaused) {
          console.log("Service Loop: Aborting post-pause.");
          break;
        }
      }

      const currentTurn = this.state.control.currentTurn + 1;
      console.log(`Service Loop: Starting Turn ${currentTurn}/${this.state.control.totalTurns}`);

      const currentRole = this.state.control.currentTurn % 2 === 0 ? "worker1" : "worker2";
      const currentWorkerName = currentRole === "worker1" ? worker1Name : worker2Name;
      const currentModel = this.state.control.currentModel;

      const promptHeader = `Task: ${task}\nCurrent Role: ${currentRole}\nTurn: ${currentTurn}/${this.state.control.totalTurns}`;
      const prompt = MemoryController.getContext(this.state, promptHeader);

      let responseContent: string;
      try {
        responseContent = await generateOllamaResponse(currentModel, prompt);
      } catch (error) {
        console.error(`Error during turn ${currentTurn}:`, error);
        responseContent = `Failed to respond: ${error instanceof Error ? error.message : String(error)}`;
        const errorMessage: ChatMessage = {
          id: Date.now(),
          senderName: currentWorkerName,
          role: currentRole,
          message: responseContent,
          createdAt: new Date().toISOString(),
          type: "message",
          turn: currentTurn,
        };
        this.state.memory.workingMemory.push(errorMessage);
        this.notifyStateUpdate();
        throw error;
      }

      const assistantMessage: ChatMessage = {
        id: Date.now(),
        senderName: currentWorkerName,
        role: currentRole,
        message: responseContent,
        createdAt: new Date().toISOString(),
        type: "message",
        turn: currentTurn,
      };
      this.state.memory.workingMemory.push(assistantMessage);

      this.state.control.currentTurn++;
      [this.state.control.currentModel, this.state.control.otherModel] = [
        this.state.control.otherModel,
        this.state.control.currentModel,
      ];

      this.notifyStateUpdate();

      if (this.state.memory.workingMemory.length > 5) {
        console.log("Service Loop: Compressing memory...");
        const { compressed, remaining } = MemoryController.compress(this.state.memory.workingMemory);
        if (compressed.summary) {
          this.state.memory.strategicMemory.push(compressed);
        }
        this.state.memory.workingMemory = remaining;
        this.notifyStateUpdate();
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  public pauseCollaboration(): void {
    if (!this.state.control.isCollaborating || this.state.control.isPaused) return;
    console.log("Service: Signaling pause.");
    this.state.control.isPaused = true;
    this.notifyStateUpdate();
  }

  public resumeCollaboration(): void {
    if (!this.state.control.isCollaborating || !this.state.control.isPaused) return;
    console.log("Service: Signaling resume.");
    this.state.control.isPaused = false;
    if (this.abortPausePromise) {
      this.abortPausePromise();
    } else {
      console.log("Service: Resume signal sent, loop will continue on next check.");
    }
  }

  public injectMessage(message: string): void {
    if (!this.state.control.isCollaborating || !this.state.control.isPaused) {
      console.warn("Cannot inject message: Collaboration not paused.");
      return;
    }
    console.log("Service: Injecting message:", message);
    this.state.memory.workingMemory.push({
      id: Date.now(),
      senderName: "User (Injection)",
      role: "user",
      message: `--- Task Master Injection ---\n${message}\n--- End Injection ---`,
      createdAt: new Date().toISOString(),
      type: "message",
    });
    this.notifyStateUpdate();
  }
}