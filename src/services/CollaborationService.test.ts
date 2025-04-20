import { CollaborationService } from "./CollaborationService";
import { CollaborationStateManager } from "./CollaborationStateManager";
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the ollamaServices module
vi.mock("./ollamaServices", () => ({
  generateOllamaResponse: vi.fn(),
}));

describe("CollaborationService", () => {
  let collabService: CollaborationService;
  let mockUpdateCallback: ReturnType<typeof vi.fn>;
  let generateOllamaResponse: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const ollamaServices = await import("./ollamaServices");
    generateOllamaResponse = ollamaServices.generateOllamaResponse as ReturnType<typeof vi.fn>;
    CollaborationStateManager.clear();
    mockUpdateCallback = vi.fn();
    collabService = new CollaborationService(mockUpdateCallback);
    generateOllamaResponse.mockClear();
  });

  afterEach(() => {
    CollaborationStateManager.clear();
  });

  it("should initialize with default state", () => {
    const state = collabService.getState();
    expect(state.memory.workingMemory).toEqual([]);
    expect(state.memory.strategicMemory).toEqual([]);
    expect(state.control).toEqual({
      currentTurn: 0,
      totalTurns: 0,
      currentModel: "",
      otherModel: "",
      isCollaborating: false,
      isPaused: false,
    });
    expect(mockUpdateCallback).toHaveBeenCalledWith(state);
  });

  it("should run collaboration loop and alternate workers with custom names", async () => {
    generateOllamaResponse
      .mockResolvedValueOnce("Worker 1 response")
      .mockResolvedValueOnce("Worker 2 response");

    const config = {
      turns: 1,
      worker1Model: "model1",
      worker2Model: "model2",
      worker1Name: "Alice",
      worker2Name: "Bob",
    };
    await collabService.startCollaboration("Test task", config);

    const state = collabService.getState();
    expect(state.control.isCollaborating).toBe(false);
    expect(state.memory.workingMemory).toHaveLength(3);
    expect(state.memory.workingMemory[0]).toMatchObject({ role: "user", message: "Test task" });
    expect(state.memory.workingMemory[1]).toMatchObject({
      role: "worker1",
      senderName: "Alice",
      message: "Worker 1 response",
    });
    expect(state.memory.workingMemory[2]).toMatchObject({
      role: "worker2",
      senderName: "Bob",
      message: "Worker 2 response",
    });
  });

  it("should pause and resume collaboration", async () => {
    generateOllamaResponse.mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve("Response"), 100))
    );

    const config = {
      turns: 2,
      worker1Model: "model1",
      worker2Model: "model2",
      worker1Name: "Alice",
      worker2Name: "Bob",
    };
    const collabPromise = collabService.startCollaboration("Test task", config);

    await new Promise((resolve) => setTimeout(resolve, 50));
    collabService.pauseCollaboration();
    let state = collabService.getState();
    expect(state.control.isPaused).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    collabService.resumeCollaboration();
    await collabPromise;

    state = collabService.getState();
    expect(state.control.isPaused).toBe(false);
    expect(state.memory.workingMemory).toHaveLength(5);
  });

  it("should inject a message during pause", async () => {
    generateOllamaResponse.mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve("Response"), 100))
    );

    const config = {
      turns: 1,
      worker1Model: "model1",
      worker2Model: "model2",
      worker1Name: "Alice",
      worker2Name: "Bob",
    };
    const collabPromise = collabService.startCollaboration("Test task", config);

    await new Promise((resolve) => setTimeout(resolve, 50));
    collabService.pauseCollaboration();
    collabService.injectMessage("Injected message");

    let state = collabService.getState();
    expect(state.memory.workingMemory).toHaveLength(2);
    expect(state.memory.workingMemory[1]).toMatchObject({
      senderName: "User (Injection)",
      message: "--- Task Master Injection ---\nInjected message\n--- End Injection ---",
    });

    collabService.resumeCollaboration();
    await collabPromise;
  });

  it("should compress memory when exceeding limit", async () => {
    generateOllamaResponse.mockImplementation((prompt: string) => {
      if (prompt.includes("worker1")) return "Worker 1 response";
      return "Worker 2 response";
    });

    const config = {
      turns: 3,
      worker1Model: "model1",
      worker2Model: "model2",
      worker1Name: "Alice",
      worker2Name: "Bob",
    };
    await collabService.startCollaboration("Test task", config);

    const state = collabService.getState();
    expect(state.memory.workingMemory).toHaveLength(3);
    expect(state.memory.strategicMemory).toHaveLength(1);
    expect(state.memory.strategicMemory[0].summary).toContain("Summarized:");
  });

  it("should handle errors during collaboration", async () => {
    generateOllamaResponse.mockRejectedValue(new Error("LLM failure"));

    const config = {
      turns: 1,
      worker1Model: "model1",
      worker2Model: "model2",
      worker1Name: "Alice",
      worker2Name: "Bob",
    };
    await collabService.startCollaboration("Test task", config);

    const state = collabService.getState();
    expect(state.memory.workingMemory).toHaveLength(3);
    expect(state.memory.workingMemory[1]).toMatchObject({
      role: "worker1",
      senderName: "Alice",
      message: "Failed to respond: LLM failure",
    });
    expect(state.memory.workingMemory[2]).toMatchObject({
      senderName: "System",
      message: "Error: LLM failure",
    });
  });
});