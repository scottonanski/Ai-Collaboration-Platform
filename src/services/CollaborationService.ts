import { nanoid } from "nanoid";

export interface Message {
  id: number;
  senderName: string;
  role: string;
  message: string;
  createdAt: string;
  type: "message";
}

export interface StrategicMemoryChunk {
  timestamp: string;
  summary: string;
}

export interface CollaborationMemory {
  workingMemory: Message[];
  strategicMemory: StrategicMemoryChunk[];
}

export interface CollaborationControlState {
  currentTurn: number;
  totalTurns: number;
  currentModel: string;
  otherModel: string;
  isCollaborating: boolean;
  isPaused: boolean;
  currentPhase: "idle" | "processing" | "awaitingInput";
}

export interface CollaborationState {
  memory: CollaborationMemory;
  control: CollaborationControlState;
}

export interface CollaborationTask {
  turns: number;
  worker1Model: string;
  worker2Model: string;
  worker1Name: string;
  worker2Name: string;
}

export class CollaborationService {
  private state: CollaborationState;
  private updateCallback: (state: CollaborationState) => void;
  private shouldPause: boolean = false;
  private shouldResume: boolean = false;

  constructor(updateCallback: (state: CollaborationState) => void) {
    console.log("Initializing new collaboration state.");
    this.state = {
      memory: {
        workingMemory: [],
        strategicMemory: [],
      },
      control: {
        currentTurn: 0,
        totalTurns: 0,
        currentModel: "",
        otherModel: "",
        isCollaborating: false,
        isPaused: false,
        currentPhase: "idle",
      },
    };
    this.updateCallback = updateCallback;
    this.notifyUpdate();
  }

  private notifyUpdate() {
    this.updateCallback(this.state);
  }

  private async compressMemory() {
    console.log("Service Loop: Compressing memory...");
    const summary = this.state.memory.workingMemory
      .map((msg) => `${msg.senderName}: ${msg.message}`)
      .join("; ");
    const newChunk: StrategicMemoryChunk = {
      timestamp: new Date().toISOString(),
      summary: `Summary: ${summary}`,
    };
    this.state.memory.strategicMemory.push(newChunk);
    this.state.memory.workingMemory = [];
    this.notifyUpdate();
  }

  private checkMemoryLimit() {
    if (this.state.memory.workingMemory.length > 10) {
      this.compressMemory();
    }
  }

  getState(): CollaborationState {
    return this.state;
  }

  async startCollaboration(message: string, task: CollaborationTask) {
    console.log("Service: Starting collaboration... Test task", task);
    this.state.control = {
      currentTurn: 0,
      totalTurns: task.turns * 2,
      currentModel: task.worker1Model,
      otherModel: task.worker2Model,
      isCollaborating: true,
      isPaused: false,
      currentPhase: "processing",
    };
    this.state.memory.workingMemory.push({
      id: this.state.memory.workingMemory.length + 1,
      senderName: "User",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    });
    this.notifyUpdate();
    await this.runCollaborationLoop(task.worker1Name, task.worker2Name);
  }

  pauseCollaboration() {
    console.log("Service: Signaling pause.");
    this.shouldPause = true;
    this.state.control.isPaused = true;
    this.state.control.currentPhase = "awaitingInput";
    this.notifyUpdate();
  }

  resumeCollaboration() {
    console.log("Service: Signaling resume.");
    this.shouldResume = true;
    this.state.control.currentPhase = "processing";
    this.notifyUpdate();
    console.log("Service: Resume signal sent, loop will continue on next check.");
  }

  injectMessage(message: string) {
    console.log("Service: Injecting message:", message);
    this.state.memory.workingMemory.push({
      id: this.state.memory.workingMemory.length + 1,
      senderName: "User",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    });
    this.notifyUpdate();
  }

  private async runCollaborationLoop(worker1Name: string, worker2Name: string) {
    for (let turn = 1; turn <= this.state.control.totalTurns; turn++) {
      this.state.control.currentTurn = turn;
      console.log(`Service Loop: Starting Turn ${turn}/${this.state.control.totalTurns}`);

      if (this.shouldPause) {
        this.shouldPause = false;
        while (!this.shouldResume) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.shouldResume = false;
        this.state.control.isPaused = false;
        this.notifyUpdate();
      }

      const isWorker1 = turn % 2 !== 0;
      const senderName = isWorker1 ? worker1Name : worker2Name;
      this.state.control.currentModel = isWorker1
        ? this.state.control.currentModel
        : this.state.control.otherModel;

      try {
        const response = `Response from ${senderName} using ${this.state.control.currentModel}`;
        this.state.memory.workingMemory.push({
          id: this.state.memory.workingMemory.length + 1,
          senderName,
          role: "assistant",
          message: response,
          createdAt: new Date().toISOString(),
          type: "message",
        });

        this.checkMemoryLimit();
        this.notifyUpdate();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error during turn ${turn}:`, errorMessage);
        this.state.memory.workingMemory.push({
          id: this.state.memory.workingMemory.length + 1,
          senderName: "System",
          role: "user",
          message: `Error: ${errorMessage}`,
          createdAt: new Date().toISOString(),
          type: "message",
        });
        this.notifyUpdate();
        throw new Error(`Collaboration failed: ${errorMessage}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.state.control.isCollaborating = false;
    this.state.control.currentPhase = "idle";
    console.log("Service: Collaboration loop finished.");
    this.notifyUpdate();
  }
}