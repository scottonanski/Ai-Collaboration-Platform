import { nanoid } from "nanoid"; // Import nanoid for unique message IDs
import { ChatMessage, MemoryChunk, CollaborationControlState, CollaborationState, CollaborationTask } from "../collaborationTypes";
import { fetchOllamaResponse } from "../services/ollamaServices"; // Import the new function

export class CollaborationService {
  private state: CollaborationState;
  private updateCallback: (state: CollaborationState) => void;
  private shouldPause: boolean = false;
  private shouldResume: boolean = false;
  private requestSummary: boolean;

  constructor(updateCallback: (state: CollaborationState) => void, requestSummary: boolean) {
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
    this.requestSummary = requestSummary;
    this.notifyUpdate();
  }

  private notifyUpdate() {
    this.updateCallback({ ...this.state, memory: { ...this.state.memory }, control: { ...this.state.control } });
  }

  private async compressMemory() {
    console.log("Service Loop: Compressing memory...");
    console.log("Total messages in workingMemory:", this.state.memory.workingMemory.length);
    if (this.state.memory.workingMemory.length < 5) {
      console.log("Not enough messages to compress (less than 5).");
      return;
    }

    const messagesToSummarize = this.state.memory.workingMemory.slice(0, -2);
    console.log("Messages to summarize:", messagesToSummarize.map(msg => `${msg.senderName}: ${msg.message}`));
    const summary = messagesToSummarize
      .map((msg) => `${msg.senderName}: ${msg.message}`)
      .join("; ");
    const newChunk: MemoryChunk = {
      timestamp: new Date().toISOString(),
      summary: `Summary: ${summary}`,
    };
    const remainingMessages = this.state.memory.workingMemory.slice(-2);
    console.log("Remaining messages in workingMemory:", remainingMessages.map(msg => `${msg.senderName}: ${msg.message}`));
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        strategicMemory: [...this.state.memory.strategicMemory, newChunk],
        workingMemory: remainingMessages,
      },
    };
    this.notifyUpdate();
  }

  private checkMemoryLimit() {
    if (this.state.memory.workingMemory.length > 10) {
      this.compressMemory();
    }
  }

  getState(): CollaborationState {
    return { ...this.state, memory: { ...this.state.memory }, control: { ...this.state.control } };
  }

  async startCollaboration(message: string, task: CollaborationTask) {
    console.log("Service: Starting collaboration... Task:", task);
    const newControl: CollaborationControlState = {
      currentTurn: 0,
      totalTurns: task.turns * 2,
      currentModel: task.worker1Model,
      otherModel: task.worker2Model,
      isCollaborating: true,
      isPaused: false,
      currentPhase: "processing",
    };
    const newMessage: ChatMessage = {
      id: nanoid(), // Now type-compatible (string)
      senderName: "User",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        workingMemory: [...this.state.memory.workingMemory, newMessage],
      },
      control: newControl,
    };
    this.notifyUpdate();
    await this.runCollaborationLoop(task.worker1Name, task.worker2Name);
  }

  pauseCollaboration() {
    console.log("Service: Signaling pause.");
    this.shouldPause = true;
    this.state = {
      ...this.state,
      control: {
        ...this.state.control,
        isPaused: true,
        currentPhase: "awaitingInput",
      },
    };
    this.notifyUpdate();
  }

  resumeCollaboration() {
    console.log("Service: Signaling resume.");
    this.shouldResume = true;
    this.state = {
      ...this.state,
      control: {
        ...this.state.control,
        isPaused: false,
        currentPhase: "processing",
      },
    };
    this.notifyUpdate();
  }

  injectMessage(message: string) {
    console.log("Service: Injecting message:", message);
    const newMessage: ChatMessage = {
      id: nanoid(), // Now type-compatible (string)
      senderName: "User (Injection)",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        workingMemory: [...this.state.memory.workingMemory, newMessage],
      },
    };
    this.notifyUpdate();
  }

  private async runCollaborationLoop(worker1Name: string, worker2Name: string) {
    for (let turn = 1; turn <= this.state.control.totalTurns; turn++) {
      this.state = {
        ...this.state,
        control: {
          ...this.state.control,
          currentTurn: turn,
        },
      };
      console.log(`Service Loop: Starting Turn ${turn}/${this.state.control.totalTurns}`);

      if (this.shouldPause) {
        this.shouldPause = false;
        while (!this.shouldResume) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.shouldResume = false;
        this.state = {
          ...this.state,
          control: {
            ...this.state.control,
            isPaused: false,
          },
        };
        this.notifyUpdate();
      }

      const isWorker1 = turn % 2 !== 0;
      const senderName = isWorker1 ? worker1Name : worker2Name;
      const currentModel = isWorker1 ? this.state.control.currentModel : this.state.control.otherModel;

      try {
        const context = this.state.memory.workingMemory.map(msg => `${msg.senderName}: ${msg.message}`);
        const { response, error } = await fetchOllamaResponse(currentModel, context);

        if (error) {
          const errorMessage: ChatMessage = {
            id: nanoid(), // Now type-compatible (string)
            senderName: "System",
            role: "system",
            message: `Error in ${senderName}: ${error}`,
            createdAt: new Date().toISOString(),
            type: "message",
          };
          this.state = {
            ...this.state,
            memory: {
              ...this.state.memory,
              workingMemory: [...this.state.memory.workingMemory, errorMessage],
            },
          };
        } else {
          const newMessage: ChatMessage = {
            id: nanoid(), // Now type-compatible (string)
            senderName,
            role: "assistant",
            message: response,
            createdAt: new Date().toISOString(),
            type: "message",
          };
          this.state = {
            ...this.state,
            memory: {
              ...this.state.memory,
              workingMemory: [...this.state.memory.workingMemory, newMessage],
            },
          };
        }
        this.checkMemoryLimit();
        this.notifyUpdate();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error during turn ${turn}:`, errorMessage);
        const errorMsg: ChatMessage = {
          id: nanoid(), // Now type-compatible (string)
          senderName: "System",
          role: "system",
          message: `Error: ${senderName} failed - ${errorMessage}`,
          createdAt: new Date().toISOString(),
          type: "message",
        };
        this.state = {
          ...this.state,
          memory: {
            ...this.state.memory,
            workingMemory: [...this.state.memory.workingMemory, errorMsg],
          },
        };
        this.notifyUpdate();
        throw new Error(`Collaboration failed: ${errorMessage}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.requestSummary && this.state.memory.workingMemory.length >= 5) {
      await this.compressMemory();
    }

    this.state = {
      ...this.state,
      control: {
        ...this.state.control,
        isCollaborating: false,
        currentPhase: "idle",
      },
    };
    console.log("Service: Collaboration loop finished.");
    this.notifyUpdate();
  }
}

export type { CollaborationState };