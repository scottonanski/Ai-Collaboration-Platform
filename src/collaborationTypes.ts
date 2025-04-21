// collaborationTypes.ts

export interface ChatMessage {
  id: string; // Changed from number to string
  senderName: string;
  role: "user" | "assistant" | "system";
  message: string;
  createdAt: string;
  type: "message";
}

export interface MemoryChunk {
  timestamp: string;
  summary: string;
}

export interface MemorySystemState {
  workingMemory: ChatMessage[];
  strategicMemory: MemoryChunk[];
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
  memory: MemorySystemState;
  control: CollaborationControlState;
}

export interface CollaborationTask {
  turns: number;
  worker1Model: string;
  worker2Model: string;
  worker1Name: string;
  worker2Name: string;
}