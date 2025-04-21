import React, { useEffect, useState } from "react";
import { CollaborationService, CollaborationState } from "../../services/CollaborationService";
import ChatMessage from "./ChatMessage";
import StrategicMemoryChunkComponent from "./StrategicMemoryChunk";
import { checkOllamaConnection, fetchOllamaModels } from "../../services/ollamaServices";
import SettingsDrawer from "../Drawers/SettingsDrawer";
import CollaborationSettings from "../Drawers/CollaborationSettings";

interface ChatInterfaceProps {
  folderDrawerId: string;
  previewDrawerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ folderDrawerId, previewDrawerId }) => {
  const [collabService, setCollabService] = useState<CollaborationService | null>(null);
  const [collabState, setCollabState] = useState<CollaborationState | null>(null);
  const [message, setMessage] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<"connected" | "disconnected">("disconnected");

  // Settings state
  const [worker1Name, setWorker1Name] = useState("Worker 1");
  const [worker1Model, setWorker1Model] = useState("");
  const [worker2Name, setWorker2Name] = useState("Worker 2");
  const [worker2Model, setWorker2Model] = useState("");
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);
  const [api1Provider, setApi1Provider] = useState("ollama");
  const [api2Provider, setApi2Provider] = useState("ollama");
  const [apiKey1, setApiKey1] = useState("");
  const [apiKey2, setApiKey2] = useState("");
  const [resumeOnInterjection, setResumeOnInterjection] = useState(true);
  const [summaryModel, setSummaryModel] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  const handleStateUpdate = (newState: CollaborationState) => {
    setCollabState(newState);
  };

  useEffect(() => {
    const service = new CollaborationService(handleStateUpdate, requestSummary);
    setCollabService(service);
  
    const initializeOllama = async () => {
      setIsLoadingModels(true);
      const status = await checkOllamaConnection();
      console.log("Ollama connection status:", status);
      setOllamaStatus(status);
  
      if (status === "connected") {
        const fetchedModels = await fetchOllamaModels();
        console.log("Fetched models in ChatInterface:", fetchedModels);
        setModels(fetchedModels);
        if (fetchedModels.length > 0) {
          setWorker1Model(fetchedModels[0]);
          setWorker2Model(fetchedModels.length > 1 ? fetchedModels[1] : fetchedModels[0]);
          setSummaryModel(fetchedModels[0]);
        }
      }
      setIsLoadingModels(false);
    };
  
    initializeOllama();
  
    return () => {
      console.log("CollaborationService instance cleanup (if necessary)");
    };
  }, [requestSummary]); // Add requestSummary to dependencies

  const messagesToDisplay = collabState?.memory.workingMemory ?? [];

  const canPause = collabState?.control.isCollaborating && !collabState?.control.isPaused;
  const canResume = collabState?.control.isCollaborating && collabState?.control.isPaused;
  const canSubmit =
    (!collabState?.control.isCollaborating || collabState?.control.isPaused) &&
    message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabService || !canSubmit) return;

    if (collabState?.control.isPaused) {
      console.log("UI: Injecting message during pause.");
      collabService.injectMessage(message);
      if (resumeOnInterjection) {
        collabService.resumeCollaboration();
      }
      setMessage("");
    } else {
      console.log("UI: Starting new collaboration.");
      collabService.startCollaboration(message, {
        turns,
        worker1Model,
        worker2Model,
        worker1Name,
        worker2Name,
      });
      setMessage("");
    }
  };

  let placeholderText = "Type your message...";
  let ariaLabel = "Type your message...";
  if (collabState?.control.isPaused) {
    placeholderText = "Collaboration Paused: Please interject...";
    ariaLabel = "Collaboration Paused: Please interject...";
  } else if (collabState?.control.isCollaborating) {
    placeholderText = "Collaboration in progress...";
    ariaLabel = "Collaboration in progress...";
  }
  if (collabState?.control.isPaused && message.trim().length > 0) {
    placeholderText = "Interjection submitted to the collaboration";
    ariaLabel = "Interjection submitted to the collaboration";
  }

  let statusMessage = "";
  if (collabState?.control.currentPhase === "idle") {
    statusMessage = "Ready to start collaboration.";
  } else if (collabState?.control.currentPhase === "processing") {
    statusMessage = "Collaborating...";
  } else if (collabState?.control.currentPhase === "awaitingInput") {
    statusMessage = "Paused: Awaiting your input...";
  }

  return (
    <main
      className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
      role="main"
      aria-label="Chat Interface"
      data-component="ChatInterface"
    >
      <div
        className="flex flex-col gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
        role="log"
        aria-label="Chat HistoryDEB"
        aria-live="polite"
      >
        {messagesToDisplay.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4">
        <h3 className="text-lg font-semibold">Strategic Memory</h3>
        {collabState?.memory.strategicMemory.length ? (
          collabState.memory.strategicMemory.map((chunk) => (
            <StrategicMemoryChunkComponent key={chunk.timestamp} chunk={chunk} />
          ))
        ) : (
          <p className="text-sm text-base-content/50">No strategic memory yet.</p>
        )}
      </div>

      <form
  onSubmit={handleSubmit}
  className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
  role="region"
  aria-label="Chat Input Area"
  id="ChatInputContainer"
>
  <div
    className="flex flex-row w-full mb-2"
    role="group"
    id="ChatTextAreaInputContainer"
    aria-label="Chat Text Input"
  >
    <textarea
      rows={2}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder={placeholderText}
      aria-label={ariaLabel}
      aria-controls="chat-send-button"
      disabled={collabState?.control.isCollaborating && !collabState?.control.isPaused}
      className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-zinc-800 text-base-content placeholder:text-base-content/50 resize-none"
    />
  </div>
  {collabState?.control.isCollaborating && !collabState?.control.isPaused && (
    <div className="flex items-center gap-2 mt-2">
      <span className="loading loading-spinner loading-sm"></span>
      <span>Collaborating...</span>
    </div>
  )}
  <nav
    className="flex flex-row items-center justify-between w-full"
    role="navigation"
    id="ChatTextInputButtonContainer"
    aria-label="Chat Controls"
  >
    <div className="flex flex-row gap-2" id="chat-settings-buttons">
      <label
        htmlFor={folderDrawerId}
        className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
        data-tip="Browse Files"
        aria-label="Open Folder Drawer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-folder"
        >
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
      </label>
      <SettingsDrawer
        trigger={
          <button
            className="btn btn-sm btn-ghost tooltip tooltip-top"
            data-tip="Settings"
            aria-label="Open Settings Drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-settings"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        }
        worker1Name={worker1Name}
        worker1Model={worker1Model}
        worker2Name={worker2Name}
        worker2Model={worker2Model}
        turns={turns}
        onAcceptSettings={() => {
          console.log("Settings accepted:", {
            worker1Name,
            worker1Model,
            worker2Name,
            worker2Model,
            turns,
          });
        }}
      >
        <CollaborationSettings
          worker1Name={worker1Name}
          setWorker1Name={setWorker1Name}
          worker1Model={worker1Model}
          setWorker1Model={setWorker1Model}
          worker2Name={worker2Name}
          setWorker2Name={setWorker2Name}
          worker2Model={worker2Model}
          setWorker2Model={setWorker2Model}
          availableModels={models}
          api1Provider={api1Provider}
          setApi1Provider={setApi1Provider}
          api2Provider={api2Provider}
          setApi2Provider={setApi2Provider}
          turns={turns}
          setTurns={setTurns}
          requestSummary={requestSummary}
          setRequestSummary={setRequestSummary}
          apiKey1={apiKey1}
          setApiKey1={setApiKey1}
          apiKey2={apiKey2}
          setApiKey2={setApiKey2}
          isLoadingModels={isLoadingModels}
          resumeOnInterjection={resumeOnInterjection}
          setResumeOnInterjection={setResumeOnInterjection}
          summaryModel={summaryModel}
          setSummaryModel={setSummaryModel}
        />
      </SettingsDrawer>
    </div>
    <div className="flex flex-row gap-2" id="chat-control-buttons">
      <div style={{ display: "inline-block" }}>
        <button
          type="button"
          disabled={!canPause}
          onClick={() => collabService?.pauseCollaboration()}
          className="btn btn-sm btn-ghost tooltip tooltip-top"
          data-tip="Pause Chat"
          aria-label="Pause"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-pause"
          >
            <rect x="14" y="4" width="4" height="16" rx="1" />
            <rect x="6" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      </div>
      <div style={{ display: "inline-block" }}>
        <button
          type="button"
          disabled={!canResume}
          onClick={() => collabService?.resumeCollaboration()}
          className="btn btn-sm btn-ghost tooltip tooltip-top"
          data-tip="Resume Chat"
          aria-label="Resume"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-play"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </button>
      </div>
      <div style={{ display: "inline-block" }}>
        <button
          type="submit"
          disabled={!canSubmit}
          id="chat-send-button"
          className="btn btn-sm btn-ghost tooltip tooltip-top"
          data-tip="Send Message"
          aria-label="Send Message"
        >
          <svg
            xmlns="http://www3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-send"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
      <div style={{ display: "inline-block" }}>
        <span
          className="text-base-content/50 text-sm tooltip tooltip-top"
          data-tip="LLM Model Status"
          aria-label="LLM Model Status"
        >
          {ollamaStatus}
        </span>
      </div>
    </div>
  </nav>
  <span className="text-base-content/50 text-sm mt-2">{statusMessage}</span>
</form>
    </main>
  );
};

export default ChatInterface;