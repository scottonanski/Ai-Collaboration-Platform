// collaborationTypes.ts

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemNode[];
  path: string;
  fileType?: string;
}

export interface ChatMessage {
  id: string; // Changed from number to string
  senderName: string;
  role: "user" | "assistant" | "system";
  message: string;
  createdAt: string;
  type: "message" | "system";
  streaming?: boolean; // Optional flag for streaming animation
}

export interface MemoryChunk {
  timestamp: string;
  summary: string;
}

export interface MemorySystemState {
  workingMemory: ChatMessage[];
  strategicMemory?: any[]; // Add strategicMemory property  
}

export interface CollaborationControlState {
  currentModel?: string;
  otherModel?: string;
  isCollaborating: boolean;
  isPaused: boolean;
  currentPhase: 'idle' | 'processing' | 'awaitingInput' | 'reviewing' | 'completed' | 'error';
  currentRole?: 'worker' | 'reviewer';
  currentTurn: number;
  totalTurns: number;
}

export type MessagePart = 
  | { type: 'text'; content: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'incompleteCode'; language: string; code: string };

export interface CollaborationState {
  messages: ChatMessage[];
  memory: MemorySystemState;
  control: CollaborationControlState;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  settings: {
    provider: string;
    worker1Model: string;
    worker2Model: string;
    refinerModel: string;
  };
}

export interface CollaborationTask {
  worker1Model: string;
  worker2Model: string;
  worker1Name: string;
  worker2Name: string;
  worker1Role: 'worker' | 'reviewer';
  worker2Role: 'worker' | 'reviewer';
  turns: number;
}

// Actions interface for CollaborationService
export interface CollaborationServiceActions {
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, partial: Partial<ChatMessage>) => void;
  setControl: (control: Partial<CollaborationControlState>) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected') => void;
  // setMessages: (messages: ChatMessage[]) => void; // Usually not needed directly by service
  
  // File system actions
  addFile: (file: FileSystemNode) => void;
  setCodeContent: (content: { html: string; css: string; js: string }) => void;
}