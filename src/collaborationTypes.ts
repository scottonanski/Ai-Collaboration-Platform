interface ChatMessage {
  id: number;
  senderName: string;
  role: "user" | "assistant" | "system";
  message: string;
  createdAt: string;
  footerText?: string;
  type: "message" | "summary";
  turn?: number;
}

interface MemoryChunk {
  summary: string;
  timestamp: string; // Changed to string to match CollaborationService
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
  currentPhase: "idle" | "processing" | "awaitingInput";
}

interface CollaborationState {
  memory: MemorySystemState;
  control: CollaborationControlState;
}

interface CollaborationTask {
  turns: number;
  worker1Model: string;
  worker2Model: string;
  worker1Name: string;
  worker2Name: string;
}

export type { ChatMessage, MemoryChunk, MemorySystemState, CollaborationControlState, CollaborationState, CollaborationTask };