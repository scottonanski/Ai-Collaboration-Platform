const OLLAMA_API_URL = "http://localhost:11434";

// Check if Ollama server is running
export const checkOllamaConnection = async (): Promise<"connected" | "disconnected"> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      method: "GET",
    });
    return response.ok ? "connected" : "disconnected";
  } catch (error) {
    console.error("Error checking Ollama connection:", error);
    return "disconnected";
  }
};

// Fetch available models from Ollama
export const fetchOllamaModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    if (!response.ok) {
      throw new Error("Failed to fetch models from Ollama");
    }
    const data = await response.json();
    return data.models.map((model: { name: string }) => model.name);
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    return [];
  }
};

// Call Ollama's /api/generate endpoint to get a response from a model
export const generateOllamaResponse = async (
  model: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate response from ${model}`);
    }

    const data = await response.json();
    return data.response || "No response from model";
  } catch (error) {
    console.error(`Error generating response from ${model}:`, error);
    return `Error: Unable to get response from ${model}`;
  }
};