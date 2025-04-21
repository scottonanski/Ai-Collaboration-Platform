// ollamaServices.ts

// Existing functions
export const checkOllamaConnection = async (): Promise<"connected" | "disconnected"> => {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    return response.ok ? "connected" : "disconnected";
  } catch {
    return "disconnected";
  }
};

export const fetchOllamaModels = async (): Promise<string[]> => {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    const data = await response.json();
    return data.models.map((model: { name: string }) => model.name);
  } catch {
    return [];
  }
};

// New function for fetching Ollama responses
export const fetchOllamaResponse = async (
  model: string,
  context: string[], // Full conversation history
  retries = 3
): Promise<{ response: string; error: null | string }> => {
  try {
    const prompt = `${context.join("\n")}\nContinue the collaboration:`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return { response: data.response, error: null };
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchOllamaResponse(model, context, retries - 1);
    }
    return { response: "", error: error instanceof Error ? error.message : "API failure" };
  }
};