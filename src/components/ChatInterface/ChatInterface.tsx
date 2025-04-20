import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../ChatBubbles/ChatBubbles";
import ChatTextAreaInput from "../ChatTextAreaInput/ChatTextAreaInput";
import SettingsDrawer from "../Drawers/SettingsDrawer";
import { Settings, Folder, EyeIcon, Send, Pause, Play, ArrowDown10, UserCog, Loader2 } from "lucide-react";
import LLMStatusIndicator, { LLMStatus } from "../LLMStatusIndicator/LLMStatusIndicator";
import CollaborationSettings from "../Drawers/CollaborationSettings";
import { checkOllamaConnection, fetchOllamaModels } from "../../services/ollamaServices";
import { CollaborationState, ChatMessage } from "../../collaborationTypes";
import { CollaborationService } from "../../services/CollaborationService";

const userBubbleColor = "info";
const worker1BubbleColor = "warning";
const worker2BubbleColor = "success";

interface ChatInterfaceProps {
  folderDrawerId: string;
  previewDrawerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  folderDrawerId,
  previewDrawerId,
}) => {
  const [collabService, setCollabService] = useState<CollaborationService | null>(null);
  const [collabState, setCollabState] = useState<CollaborationState | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [tempPlaceholder, setTempPlaceholder] = useState<string | undefined>(undefined);
  const [llmStatus, setLlmStatus] = useState<LLMStatus>("disconnected");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [worker1Name, setWorker1Name] = useState("Worker 1");
  const [worker2Name, setWorker2Name] = useState("Worker 2");
  const [worker1Model, setWorker1Model] = useState("");
  const [worker2Model, setWorker2Model] = useState("");
  const [api1Provider, setApi1Provider] = useState("");
  const [api2Provider, setApi2Provider] = useState("");
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);
  const [apiKey1, setApiKey1] = useState("");
  const [apiKey2, setApiKey2] = useState("");
  const [resumeOnInterjection, setResumeOnInterjection] = useState(true);
  const [summaryModel, setSummaryModel] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const handleStateUpdate = (newState: CollaborationState) => {
    setCollabState(newState);
  };

  useEffect(() => {
    const service = new CollaborationService(handleStateUpdate);
    setCollabService(service);
    return () => {
      console.log("CollaborationService instance cleanup (if necessary)");
    };
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const models = await fetchOllamaModels();
        console.log("Fetched models in ChatInterface:", models);
        const safeModels = Array.isArray(models) ? models : [];
        setAvailableModels(safeModels);
        if (safeModels.length > 0) {
          if (!worker1Model) setWorker1Model(safeModels[0]);
          if (!worker2Model) setWorker2Model(safeModels[0]);
          if (!summaryModel) setSummaryModel(safeModels[0]);
        }
      } catch (error) {
        console.error("Failed to fetch Ollama models:", error);
        setAvailableModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  const updateOllamaStatus = async () => {
    const status = await checkOllamaConnection();
    console.log("Ollama connection status:", status);
    setLlmStatus(status);
  };

  useEffect(() => {
    updateOllamaStatus();
    const intervalId = setInterval(updateOllamaStatus, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const getBubbleColor = (message: ChatMessage): string => {
    const { role, senderName } = message;
    if (role === "user" && senderName === "User (Injection)") {
      return userBubbleColor;
    }
    if (role === "user" && senderName === "System") {
      return "error";
    }
    switch (role) {
      case "user":
        return userBubbleColor;
      case "worker1":
        return worker1BubbleColor;
      case "worker2":
        return worker2BubbleColor;
      default:
        return "";
    }
  };

  const getAvatarIcon = (message: ChatMessage) => {
    const { role, senderName } = message;
    const iconSize = 18;
    if (role === "user" && senderName === "User (Injection)") {
      return <UserCog size={iconSize} />;
    }
    if (role === "user" && senderName === "System") {
      return <UserCog size={iconSize} />;
    }
    switch (role) {
      case "user":
        return <UserCog size={iconSize} />;
      case "worker1":
        return <ArrowDown10 size={iconSize} />;
      case "worker2":
        return <Play size={iconSize} />;
      default:
        return null;
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || !collabService) return;

    if (collabState?.control.isCollaborating && collabState?.control.isPaused) {
      console.log("UI: Injecting message while paused.");
      collabService.injectMessage(trimmedInput);
      setTempPlaceholder("Interjection submitted to the collaboration");
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setTempPlaceholder(undefined);
        feedbackTimeoutRef.current = null;
      }, 4000);
      if (resumeOnInterjection) {
        collabService.resumeCollaboration();
      }
    } else if (!collabState?.control.isCollaborating) {
      console.log("UI: Starting new collaboration.");
      const config = {
        turns,
        worker1Model,
        worker2Model,
        worker1Name,
        worker2Name,
      };
      await collabService.startCollaboration(trimmedInput, config);
    } else {
      console.warn("UI: Cannot send message - collaboration in progress and not paused.");
    }
    setInputValue("");
  };

  const handlePause = () => {
    collabService?.pauseCollaboration();
  };

  const handleResume = () => {
    collabService?.resumeCollaboration();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAcceptSettings = () => {
    console.log("Settings accepted in ChatInterface", {
      worker1Name,
      worker1Model,
      worker2Name,
      worker2Model,
      api1Provider,
      apiKey1,
      api2Provider,
      apiKey2,
      turns,
      requestSummary,
      resumeOnInterjection,
      summaryModel,
    });
  };

  const settingsTrigger = (
    <button
      className="btn btn-sm btn-ghost tooltip tooltip-top"
      data-tip="Settings"
      aria-label="Open Settings Drawer"
    >
      <Settings size={16} />
    </button>
  );

  const messagesToDisplay = collabState?.memory.workingMemory ?? [];

  const canPause = collabState?.control.isCollaborating && !collabState?.control.isPaused;
  const canResume = collabState?.control.isCollaborating && collabState?.control.isPaused;

  const formatMessageTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      if (isNearBottom) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [messagesToDisplay]);

  return (
    <>
      <main
        className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
        data-component="ChatInterface"
        aria-label="Chat Interface"
        role="main"
      >
        <div
          ref={chatContainerRef}
          className="flex flex-col gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
          aria-label="Chat HistoryDEB"
          role="log"
          aria-live="polite"
        >
          {collabState?.control.isCollaborating && !collabState?.control.isPaused && (
            <div className="flex justify-center items-center p-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="ml-2">Collaborating...</span>
            </div>
          )}
          {messagesToDisplay
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((msg, i, sortedMessages) => {
              const prevRole = sortedMessages[i - 1]?.role;
              const nextRole = sortedMessages[i + 1]?.role;
              const isFirstInGroup = msg.role !== prevRole;
              const isLastInGroup = msg.role !== nextRole;

              return (
                <ChatBubble
                  key={msg.id}
                  fontSize="0.90rem"
                  senderName={msg.senderName}
                  time={formatMessageTime(msg.createdAt)}
                  message={msg.message}
                  avatarIcon={getAvatarIcon(msg)}
                  footerText={msg.footerText}
                  isSender={msg.role === "user"}
                  bubbleColor={getBubbleColor(msg)}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  type={msg.type}
                  turn={msg.turn}
                />
              );
            })}
        </div>

        <form
          id="ChatInputContainer"
          className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
          aria-label="Chat Input Area"
          role="region"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div
            id="ChatTextAreaInputContainer"
            className="flex flex-row w-full mb-2"
            aria-label="Chat Text Input"
            role="group"
          >
            <ChatTextAreaInput
              placeholder="Type your message..."
              onChange={(value: string) => setInputValue(value)}
              onKeyDown={handleKeyDown}
              rows={2}
              value={inputValue}
              disabled={collabState?.control.isCollaborating && !collabState?.control.isPaused}
              isPaused={collabState?.control.isPaused ?? false}
              tempPlaceholder={tempPlaceholder}
              ariaControls="chat-send-button"
            />
          </div>

          <nav
            id="ChatTextInputButtonContainer"
            className="flex flex-row items-center justify-between w-full"
            aria-label="Chat Controls"
            role="navigation"
          >
            <div id="chat-settings-buttons" className="flex flex-row gap-2">
              <label
                htmlFor={folderDrawerId}
                className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
                data-tip="Browse Files"
                aria-label="Open Folder Drawer"
              >
                <Folder size={16} />
              </label>
              <SettingsDrawer
                trigger={settingsTrigger}
                worker1Name={worker1Name}
                worker2Name={worker2Name}
                worker1Model={worker1Model}
                worker2Model={worker2Model}
                turns={turns}
                onAcceptSettings={handleAcceptSettings}
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
                  availableModels={availableModels}
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
              <label
                htmlFor={previewDrawerId}
                className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
                data-tip="Preview Project"
                aria-label="Open Preview Drawer"
              >
                <EyeIcon size={16} />
              </label>
            </div>
            <div
              id="llm-model-status-indicator"
              className="flex flex-row items-center justify-center flex-grow"
              role="region"
              aria-label="LLM Model Status"
            >
              <LLMStatusIndicator status={llmStatus} />
            </div>
            <div
              id="chat-action-buttons"
              className="flex flex-row gap-2 ml-auto"
              role="group"
              aria-label="Chat Actions"
            >
              <button
                type="button"
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Pause Chat"
                aria-label="Pause"
                onClick={handlePause}
                disabled={!canPause}
              >
                <Pause size={16} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Resume Chat"
                aria-label="Resume"
                onClick={handleResume}
                disabled={!canResume}
              >
                <Play size={16} />
              </button>
              <button
                id="chat-send-button"
                type="submit"
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Send Message"
                aria-label="Send Message"
                disabled={!inputValue.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </nav>
        </form>
      </main>
    </>
  );
};

export default ChatInterface;