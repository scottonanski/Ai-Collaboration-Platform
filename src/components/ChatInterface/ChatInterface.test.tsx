import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom"; // Import jest-dom matchers
import ChatInterface from "./ChatInterface";
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as React from 'react';

// Define the mocked methods directly
const mockCollaborationService = {
  getState: vi.fn(),
  startCollaboration: vi.fn(),
  pauseCollaboration: vi.fn(),
  resumeCollaboration: vi.fn(),
  injectMessage: vi.fn(),
};

// Store the updateCallback to trigger state updates in tests
let stateUpdateCallback: ((state: any) => void) | null = null;

// Mock the CollaborationService module
vi.mock("../../services/CollaborationService", () => {
  return {
    CollaborationService: vi.fn().mockImplementation((updateCallback: (state: any) => void) => {
      // Store the callback so we can trigger it later
      stateUpdateCallback = updateCallback;
      // Set default mock return value for getState
      mockCollaborationService.getState.mockImplementation(() => ({
        memory: { workingMemory: [], strategicMemory: [] },
        control: {
          currentTurn: 0,
          totalTurns: 0,
          currentModel: "",
          otherModel: "",
          isCollaborating: false,
          isPaused: false,
        },
      }));
      updateCallback(mockCollaborationService.getState());
      return mockCollaborationService;
    }),
  };
});

// Mock the ollamaServices module
vi.mock("../../services/ollamaServices", () => ({
  checkOllamaConnection: vi.fn(),
  fetchOllamaModels: vi.fn(),
}));

describe("ChatInterface", () => {
  let CollaborationService: ReturnType<typeof vi.fn>;
  let checkOllamaConnection: ReturnType<typeof vi.fn>;
  let fetchOllamaModels: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const collaborationServiceModule = await import("../../services/CollaborationService");
    const ollamaServicesModule = await import("../../services/ollamaServices");

    CollaborationService = collaborationServiceModule.CollaborationService as ReturnType<typeof vi.fn>;
    checkOllamaConnection = ollamaServicesModule.checkOllamaConnection as ReturnType<typeof vi.fn>;
    fetchOllamaModels = ollamaServicesModule.fetchOllamaModels as ReturnType<typeof vi.fn>;

    // Clear mocks
    CollaborationService.mockClear();
    checkOllamaConnection.mockClear();
    fetchOllamaModels.mockClear();
    mockCollaborationService.getState.mockClear();
    mockCollaborationService.startCollaboration.mockClear();
    mockCollaborationService.pauseCollaboration.mockClear();
    mockCollaborationService.resumeCollaboration.mockClear();
    mockCollaborationService.injectMessage.mockClear();
    stateUpdateCallback = null; // Reset the callback

    // Set default mock behavior
    checkOllamaConnection.mockResolvedValue("connected");
    fetchOllamaModels.mockResolvedValue(["model1", "model2"]);
  });

  it("renders chat interface and initializes service", async () => {
    await act(async () => {
      render(<ChatInterface folderDrawerId="folder" previewDrawerId="preview" />);
    });

    expect(screen.getByRole("main", { name: "Chat Interface" })).toBeInTheDocument();
    expect(CollaborationService).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByLabelText("LLM Model Status")).toHaveTextContent("connected");
    }, { timeout: 3000 });
  });

  it("sends a message to start collaboration", async () => {
    await act(async () => {
      render(<ChatInterface folderDrawerId="folder" previewDrawerId="preview" />);
    });

    // Wait for the component to fetch models and update state
    await waitFor(() => {
      expect(fetchOllamaModels).toHaveBeenCalled();
    }, { timeout: 3000 });

    const textarea = screen.getByPlaceholderText("Type your message...");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.submit(screen.getByRole("region", { name: "Chat Input Area" }));
    });

    await waitFor(() => {
      expect(mockCollaborationService.startCollaboration).toHaveBeenCalledWith("Hello", {
        turns: 1,
        worker1Model: "model1",
        worker2Model: "model1",
        worker1Name: "Worker 1",
        worker2Name: "Worker 2",
      });
    }, { timeout: 3000 });
    expect(textarea).toHaveValue("");
  });

  it("injects a message during pause and resumes", async () => {
    await act(async () => {
      render(<ChatInterface folderDrawerId="folder" previewDrawerId="preview" />);
    });

    // Wait for the component to fetch models and update state
    await waitFor(() => {
      expect(fetchOllamaModels).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Mock the state to simulate a paused collaboration
    mockCollaborationService.getState.mockImplementation(() => ({
      memory: { workingMemory: [], strategicMemory: [] },
      control: {
        currentTurn: 0,
        totalTurns: 2,
        currentModel: "model1",
        otherModel: "model2",
        isCollaborating: true,
        isPaused: true,
      },
    }));

    // Trigger the state update manually
    await act(async () => {
      if (stateUpdateCallback) {
        stateUpdateCallback(mockCollaborationService.getState());
      }
    });

    // Ensure the component recognizes the paused state
    await waitFor(() => {
      expect(mockCollaborationService.getState).toHaveBeenCalled();
      expect(screen.getByLabelText("Resume")).not.toBeDisabled();
    }, { timeout: 3000 });

    const textarea = screen.getByPlaceholderText("Collaboration Paused: Please interject...");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Interjection" } });
      fireEvent.submit(screen.getByRole("region", { name: "Chat Input Area" }));
    });

    await waitFor(() => {
      expect(mockCollaborationService.injectMessage).toHaveBeenCalledWith("Interjection");
      expect(mockCollaborationService.resumeCollaboration).toHaveBeenCalled();
      expect(textarea).toHaveAttribute('placeholder', 'Interjection submitted to the collaboration');
    }, { timeout: 3000 });
  });

  it("disables pause/resume buttons and input based on state", async () => {
    await act(async () => {
      render(<ChatInterface folderDrawerId="folder" previewDrawerId="preview" />);
    });

    // Mock the state to simulate a running collaboration
    mockCollaborationService.getState.mockImplementation(() => ({
      memory: { workingMemory: [], strategicMemory: [] },
      control: {
        currentTurn: 0,
        totalTurns: 2,
        currentModel: "model1",
        otherModel: "model2",
        isCollaborating: true,
        isPaused: false,
      },
    }));

    // Trigger the state update manually
    await act(async () => {
      if (stateUpdateCallback) {
        stateUpdateCallback(mockCollaborationService.getState());
      }
    });

    // Wait for the state to propagate and UI to update
    await waitFor(() => {
      expect(mockCollaborationService.getState).toHaveBeenCalled();
      expect(screen.getByText("Collaborating...")).toBeInTheDocument();
    }, { timeout: 3000 });

    const textarea = screen.getByPlaceholderText("Type your message...");
    const pauseButton = screen.getByLabelText("Pause");
    const resumeButton = screen.getByLabelText("Resume");
    expect(textarea).toBeDisabled();
    expect(pauseButton).not.toBeDisabled();
    expect(resumeButton).toBeDisabled();
  });

  it("displays error messages in chat", async () => {
    await act(async () => {
      render(<ChatInterface folderDrawerId="folder" previewDrawerId="preview" />);
    });

    // Mock the state with an error message
    mockCollaborationService.getState.mockImplementation(() => ({
      memory: {
        workingMemory: [
          {
            id: 1,
            senderName: "System",
            role: "user",
            message: "Error: LLM failure",
            createdAt: new Date().toISOString(),
            type: "message",
          },
        ],
        strategicMemory: [],
      },
      control: {
        currentTurn: 0,
        totalTurns: 0,
        currentModel: "",
        otherModel: "",
        isCollaborating: false,
        isPaused: false,
      },
    }));

    // Trigger the state update manually
    await act(async () => {
      if (stateUpdateCallback) {
        stateUpdateCallback(mockCollaborationService.getState());
      }
    });

    // Wait for the state to propagate and messages to render
    await waitFor(() => {
      expect(mockCollaborationService.getState).toHaveBeenCalled();
      const chatHistory = screen.getByRole("log", { name: "Chat HistoryDEB" });
      expect(chatHistory).toHaveTextContent("Error: LLM failure");
    }, { timeout: 3000 });
  });
});