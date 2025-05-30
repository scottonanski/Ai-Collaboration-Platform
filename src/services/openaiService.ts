import type { AiChatMessage } from '../types/pipeline';

// OpenAI Models Configuration
export const OPENAI_MODELS = [
  "gpt-4.1-nano-2025-04-14",
  "gpt-3.5-turbo-0125"
];

// Default Settings Configuration
export const DEFAULT_SETTINGS = {
  provider: "OpenAI",
  worker1Model: "gpt-3.5-turbo-0125",
  worker2Model: "gpt-4.1-nano-2025-04-14",
  refinerModel: "gpt-3.5-turbo-0125",
};

// OpenAI Message Interface (compatible with existing system)
interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function* streamOpenAIChat({
  model,
  messages,
  apiKey,
  signal
}: {
  model: string;
  messages: AiChatMessage[] | OpenAIMessage[];
  apiKey: string;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  };

  const body = JSON.stringify({
    model,
    messages,
    stream: true
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
    signal
  });

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch {}
    throw new Error(`[OpenAI] Error ${response.status}: ${errorBody}`);
  }

  if (!response.body) {
    throw new Error('[OpenAI] No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim().startsWith('data:')) {
          const json = line.replace(/^data:\s*/, '').trim();
          if (json === '[DONE]') {
            await reader.cancel().catch(() => {});
            return;
          }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (err) {
            // Ignore parse errors — sometimes partial data
          }
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

// Legacy support - keeping the original function name for backward compatibility
export async function* fetchOpenAIResponseStream(
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  yield* streamOpenAIChat({ model, messages, apiKey, signal });
}

// Utility function to load API keys from environment
export const getOpenAIApiKeys = () => {
  // In a Vite environment, environment variables are accessed via import.meta.env
  const worker1Key = import.meta?.env?.OPENAI_API_KEY_WORKER1 || '';
  const worker2Key = import.meta?.env?.OPENAI_API_KEY_WORKER2 || '';
  
  return {
    worker1: worker1Key,
    worker2: worker2Key
  };
};
