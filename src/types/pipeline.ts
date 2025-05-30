// Pipeline types for AI chat integration

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
