// StrategicMemoryChunk stub
export interface StrategicMemoryChunk {
  id: string;
  content: string;
  timestamp: string;
  importance: number;
}

export const createMemoryChunk = (content: string): StrategicMemoryChunk => ({
  id: Math.random().toString(36).substr(2, 9),
  content,
  timestamp: new Date().toISOString(),
  importance: 1
});