import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../ChatBubbles/ChatBubbles";
import ChatTextAreaInput from "../ChatTextAreaInput/ChatTextAreaInput";
import SettingsDrawer from "../Drawers/SettingsDrawer";
import { Settings, Folder, EyeIcon, Send, Pause, Play, ArrowDown10, UserCog } from "lucide-react";
import LLMStatusIndicator, { LLMStatus } from "../LLMStatusIndicator/LLMStatusIndicator";
import CollaborationSettings from "../Drawers/CollaborationSettings";
import { checkOllamaConnection, fetchOllamaModels, generateOllamaResponse } from "../../services/ollamaServices";
import { encoding_for_model } from "tiktoken";

type ChatMessage = {
  id: number;
  senderName: string;
  role: "user" | "worker1" | "worker2";
  message: string;
  createdAt: string;
  footerText?: string;
  type: "message" | "summary";
  turn?: number;
};

const userBubbleColor = "info";
const worker1BubbleColor = "warning";
const worker2BubbleColor = "success";

const initialChatMessages: ChatMessage[] = [
  { id: 1, senderName: "Worker 1", role: "worker1", message: "Not much. Just waiting on the user...", createdAt: "2025-04-20T12:45:00Z", footerText: "Delivered", type: "message" },
  { id: 2, senderName: "System User", role: "user", message: "One moment please...", createdAt: "2025-04-20T12:46:00Z", footerText: "Seen at 12:46", type: "message" },
  { id: 3, senderName: "Worker 2", role: "worker2", message: "Sup?", createdAt: "2025-04-20T12:47:00Z", type: "message" },
];

interface ChatInterfaceProps {
  folderDrawerId: string;
  previewDrawerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  folderDrawerId,
  previewDrawerId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputValue, setInputValue] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [tempPlaceholder, setTempPlaceholder] = useState<string | undefined>(undefined);
  const [llmStatus, setLlmStatus] = useState<LLMStatus>("disconnected");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [worker1Name, setWorker1Name] = useState('Worker 1');
  const [worker1Model, setWorker1Model] = useState('');
  const [worker2Name, setWorker2Name] = useState('Worker 2');
  const [worker2Model, setWorker2Model] = useState('');
  const [api1Provider, setApi1Provider] = useState('');
  const [api2Provider, setApi2Provider] = useState('');
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [resumeOnInterjection, setResumeOnInterjection] = useState(true);
  const [summaryModel, setSummaryModel] = useState<string>('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const nextIdRef = useRef(4);

  // Token management setup
  const MAX_TOKENS = 4000;
  const tokenizer = encoding_for_model("gpt-3.5-turbo");

  const countTokens = (text: string): number => {
    try {
      const encoded = tokenizer.encode(text);
      return encoded.length;
    } catch (error) {
      console.error("Token counting failed:", error);
      return text.length;
    }
  };

  const truncateConversationHistory = (history: string): string => {
    let tokenCount = countTokens(history);
    if (tokenCount <= MAX_TOKENS) return history;

    let truncatedHistory = history;
    const lines = truncatedHistory.split("\n");

    while (tokenCount > MAX_TOKENS && lines.length > 0) {
      lines.shift();
      truncatedHistory = lines.join("\n");
      tokenCount = countTokens(truncatedHistory);
    }

    return truncatedHistory;
  };

  const generateId = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  const formatMessageTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const models = await fetchOllamaModels();
        console.log('Fetched models in ChatInterface:', models);
        const safeModels = Array.isArray(models) ? models : [];
        setAvailableModels(safeModels);
        if (safeModels.length > 0) {
          if (!worker1Model) setWorker1Model(safeModels[0]);
          if (!worker2Model) setWorker2Model(safeModels[0]);
          if (!summaryModel) setSummaryModel(safeModels[0]);
        }
      } catch (error) {
        console.error('Failed to fetch Ollama models:', error);
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

  const getBubbleColor = (role: ChatMessage["role"]): string => {
    switch (role) {
      case "user": return userBubbleColor;
      case "worker1": return worker1BubbleColor;
      case "worker2": return worker2BubbleColor;
      default: return '';
    }
  };

  const getAvatarIcon = (role: ChatMessage["role"]) => {
    const iconSize = 18;
    switch (role) {
      case "user": return <UserCog size={iconSize} />;
      case "worker1": return <ArrowDown10 size={iconSize} />;
      case "worker2": return <Play size={iconSize} />;
      default: return null;
    }
  };

  const handlePause = () => {
    console.log("Pausing...");
    setIsPaused(true);
    setInputValue("");
  };

  const handleResume = () => {
    console.log("Resuming...");
    setIsPaused(false);
    setInputValue("");
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      senderName: "User",
      role: "user",
      message: trimmedInput,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");

    if (isPaused) {
      console.log("Send/Enter while paused: Triggering resume with interjection");
      setTempPlaceholder("Interjection submitted to the collaboration");
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setTempPlaceholder(undefined);
        feedbackTimeoutRef.current = null;
      }, 4000);
      if (resumeOnInterjection) {
        setIsPaused(false);
      }
    }

    let conversationHistory = trimmedInput;
    conversationHistory = truncateConversationHistory(conversationHistory);

    for (let turn = 1; turn <= turns; turn++) {
      const worker1Prompt = `You are ${worker1Name} (Worker 1). The user said: "${trimmedInput}". The conversation so far: "${conversationHistory}". Respond as Worker 1 in turn ${turn} of ${turns}.`;
      let worker1Response: string;
      try {
        const startTime = performance.now();
        worker1Response = await generateOllamaResponse(worker1Model, worker1Prompt);
        const duration = performance.now() - startTime;
        console.log(`Worker 1 response time: ${duration.toFixed(2)}ms`);
      } catch (error) {
        console.error(`Worker 1 failed to respond:`, error);
        worker1Response = `Failed to respond: ${error instanceof Error ? error.message : String(error)}`;
        const errorMessage: ChatMessage = {
          id: generateId(),
          senderName: worker1Name,
          role: "worker1",
          message: worker1Response,
          createdAt: new Date().toISOString(),
          footerText: "Error",
          type: "message",
          turn,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        continue;
      }

      const worker1Message: ChatMessage = {
        id: generateId(),
        senderName: worker1Name,
        role: "worker1",
        message: worker1Response,
        createdAt: new Date().toISOString(),
        type: "message",
        turn,
      };
      setMessages((prevMessages) => [...prevMessages, worker1Message]);
      conversationHistory += `\n${worker1Name}: """${worker1Response}"""`;
      conversationHistory = truncateConversationHistory(conversationHistory);

      const worker2Prompt = `You are ${worker2Name} (Worker 2). The user said: "${trimmedInput}". The conversation so far: "${conversationHistory}". Respond as Worker 2 in turn ${turn} of ${turns}, building on Worker 1's response.`;
      let worker2Response: string;
      try {
        const startTime = performance.now();
        worker2Response = await generateOllamaResponse(worker2Model, worker2Prompt);
        const duration = performance.now() - startTime;
        console.log(`Worker 2 response time: ${duration.toFixed(2)}ms`);
      } catch (error) {
        console.error(`Worker 2 failed to respond:`, error);
        worker2Response = `Failed to respond: ${error instanceof Error ? error.message : String(error)}`;
        const errorMessage: ChatMessage = {
          id: generateId(),
          senderName: worker2Name,
          role: "worker2",
          message: worker2Response,
          createdAt: new Date().toISOString(),
          footerText: "Error",
          type: "message",
          turn,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        continue;
      }

      const worker2Message: ChatMessage = {
        id: generateId(),
        senderName: worker2Name,
        role: "worker2",
        message: worker2Response,
        createdAt: new Date().toISOString(),
        type: "message",
        turn,
      };
      setMessages((prevMessages) => [...prevMessages, worker2Message]);
      conversationHistory += `\n${worker2Name}: """${worker2Response}"""`;
      conversationHistory = truncateConversationHistory(conversationHistory);
    }

    if (requestSummary) {
      const summaryPrompt = `Summarize the conversation: "${conversationHistory}".`;
      const modelToUse = summaryModel || worker1Model;
      let summaryResponse: string;
      try {
        const startTime = performance.now();
        summaryResponse = await generateOllamaResponse(modelToUse, summaryPrompt);
        const duration = performance.now() - startTime;
        console.log(`Summary response time: ${duration.toFixed(2)}ms`);
      } catch (error) {
        console.error(`Summary failed:`, error);
        summaryResponse = `Failed to summarize: ${error instanceof Error ? error.message : String(error)}`;
        const errorMessage: ChatMessage = {
          id: generateId(),
          senderName: "Summary",
          role: "worker1",
          message: summaryResponse,
          createdAt: new Date().toISOString(),
          footerText: "Error",
          type: "message",
          turn: turns,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        return;
      }

      const summaryMessage: ChatMessage = {
        id: generateId(),
        senderName: "Summary",
        role: "worker1",
        message: summaryResponse,
        createdAt: new Date().toISOString(),
        footerText: "Conversation Summary",
        type: "summary",
        turn: turns,
      };
      setMessages((prevMessages) => [...prevMessages, summaryMessage]);
    }
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
  }, [messages]);

  useEffect(() => {
    return () => {
      tokenizer.free();
    };
  }, []);

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
          aria-label="Chat History"
          role="log"
          aria-live="polite"
        >
          {[...messages]
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
                  avatarIcon={getAvatarIcon(msg.role)}
                  footerText={msg.footerText}
                  isSender={msg.role === "user"}
                  bubbleColor={getBubbleColor(msg.role)}
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
              disabled={false}
              isPaused={isPaused}
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
                worker1Model={worker1Model}
                worker2Name={worker2Name}
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
                disabled={isPaused}
              >
                <Pause size={16} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Resume Chat"
                aria-label="Resume"
                onClick={handleResume}
                disabled={!isPaused}
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