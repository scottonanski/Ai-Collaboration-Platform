import { create } from 'zustand';
import { ChatMessage, CollaborationControlState, CollaborationState } from '../collaborationTypes';

interface CollaborationStoreState {
  messages: ChatMessage[];
  control: CollaborationControlState;
  connectionStatus: 'connected' | 'disconnected';
  settings: Record<string, any>;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, update: Partial<ChatMessage>) => void;
  setControl: (control: Partial<CollaborationControlState>) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected') => void;
  setSettings: (settings: Record<string, any>) => void;
  reset: () => void;
}

export const useCollaborationStore = create<CollaborationStoreState>((set, get) => ({
  messages: [],
  control: {
    currentModel: '',
    otherModel: '',
    isCollaborating: false,
    isPaused: false,
    currentPhase: 'idle',
    currentRole: 'worker',
    currentTurn: 0,
    totalTurns: 0,
  },
  connectionStatus: 'disconnected',
  settings: {},

  setMessages: (messages: ChatMessage[]) => set({ messages }),
  addMessage: (message: ChatMessage) => set((state: CollaborationStoreState) => ({ messages: [...state.messages, message] })),
  updateMessage: (id: string, update: Partial<ChatMessage>) => set((state: CollaborationStoreState) => ({
    messages: state.messages.map((msg: ChatMessage) => (msg.id === id ? { ...msg, ...update } : msg)),
  })),
  setControl: (control: Partial<CollaborationControlState>) => set((state: CollaborationStoreState) => ({
    control: { ...state.control, ...control },
  })),
  setConnectionStatus: (status: 'connected' | 'disconnected') => set({ connectionStatus: status }),
  setSettings: (settings: Record<string, any>) => set({ settings }),
  reset: () => set({
    messages: [],
    control: {
      currentModel: '',
      otherModel: '',
      isCollaborating: false,
      isPaused: false,
      currentPhase: 'idle',
      currentRole: 'worker',
      currentTurn: 0,
      totalTurns: 0,
    },
    connectionStatus: 'disconnected',
    settings: {},
  }),
}));
