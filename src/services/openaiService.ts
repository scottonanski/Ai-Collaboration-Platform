interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function* fetchOpenAIResponseStream(
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${response.status} ${JSON.stringify(error)}`);
    }

    if (!response.body) {
      throw new Error('OpenAI response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process each complete line in the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.trim() === 'data: [DONE]') {
          return;
        }

        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error('Error parsing OpenAI stream chunk:', line, e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in OpenAI stream:', error);
    yield `[Error fetching response: ${error instanceof Error ? error.message : String(error)}]`;
    throw error;
  }
}
