// ollamaServices.stream.tsx

/**
 * Fetches a response from the Ollama API endpoint as a stream of text chunks.
 * @param model - The model name to use.
 * @param prompt - The full prompt or conversation history context.
 * @param signal - An AbortSignal to abort the fetch request.
 * @returns An async generator yielding response text chunks.
 */
export async function* fetchOllamaResponseStream(
  model: string,
  prompt: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: true }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.status} ${await response.text()}`);
    }

    if (!response.body) {
      throw new Error("Ollama response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            if (json.response) {
              yield json.response;
            }
          } catch (e) {
            console.error("Error parsing final JSON chunk:", buffer, e);
          }
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (line) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              yield json.response;
            }
            if (json.done) {
              return;
            }
          } catch (e) {
            console.error("Error parsing JSON chunk:", line, e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching Ollama stream:", error);
    yield `[Error fetching response: ${error instanceof Error ? error.message : String(error)}]`;
    throw error;
  }
}
