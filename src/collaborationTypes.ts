interface ChatMessage {
    id: number;
    senderName: string;
    role: "user" | "worker1" | "worker2";
    message: string;
    createdAt: string;
    footerText?: string;
    type: "message" | "summary";
    turn?: number;
  }
  
  interface MemoryChunk {
    summary: string;
    timestamp: number;
  }
  
  interface MemorySystemState {
    workingMemory: ChatMessage[];
    strategicMemory: MemoryChunk[];
  }
  
  interface CollaborationControlState {
    currentTurn: number;
    totalTurns: number;
    currentModel: string;
    otherModel: string;
    isCollaborating: boolean;
    isPaused: boolean;
  }
  
  interface CollaborationState {
    memory: MemorySystemState;
    control: CollaborationControlState;
  }
  
  export type { ChatMessage, MemoryChunk, MemorySystemState, CollaborationControlState, CollaborationState };