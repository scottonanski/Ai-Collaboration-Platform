import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../ChatBubbles/ChatBubbles.tsx";
import ChatTextAreaInput from "../ChatTextAreaInput/ChatTextAreaInput.tsx";
import SettingsDrawer from "../Drawers/SettingsDrawer.tsx";
import { Settings, Folder, EyeIcon, Send, Pause, Play, ArrowDown10, UserCog } from "lucide-react";
import LLMStatusIndicator, { LLMStatus } from "../LLMStatusIndicator/LLMStatusIndicator.tsx";
import CollaborationSettings from "../Drawers/CollaborationSettings.tsx";
import { checkOllamaConnection, fetchOllamaModels, generateOllamaResponse } from "../../services/ollamaServices";

type ChatMessage = {
  id: number;
  senderName: string;
  role: "user" | "worker1" | "worker2";
  message: string;
  time: string;
  footerText?: string;
};

const userBubbleColor = "info";
const worker1BubbleColor = "warning";
const worker2BubbleColor = "success";

const initialChatMessages: ChatMessage[] = [
  { id: 2, senderName: "System User", role: "user", message: "One moment please...", time: "12:46", footerText: "Seen at 12:46" },
  { id: 1, senderName: "Worker 1", role: "worker1", message: "Not much. Just waiting on the user...", time: "12:45", footerText: "Delivered" },
  { id: 3, senderName: "Worker 2", role: "worker2", message: "Sup?", time: "12:47" },
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

  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      const models = await fetchOllamaModels();
      console.log('Fetched models in ChatInterface:', models);
      setAvailableModels(models);
      if (models.length > 0) {
        if (!worker1Model) setWorker1Model(models[0]);
        if (!worker2Model) setWorker2Model(models[0]);
      }
      setIsLoadingModels(false);
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
      case "worker2": return <ArrowDown10 size={iconSize} />;
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
      id: messages.length + 1,
      senderName: "User",
      role: "user",
      message: trimmedInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prevMessages: ChatMessage[]) => [userMessage, ...prevMessages]);
    setInputValue("");

    if (isPaused) {
      console.log("Send/Enter while paused: Triggering resume with interjection");
      setTempPlaceholder("Interjection submitted to the collaboration");
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setTempPlaceholder(undefined);
        feedbackTimeoutRef.current = null;
      }, 4000);
      setIsPaused(false);
    }

    let currentMessages = [...messages, userMessage];
    let conversationHistory = trimmedInput;

    for (let turn = 1; turn <= turns; turn++) {
      const worker1Prompt = `You are ${worker1Name} (Worker 1). The user said: "${trimmedInput}". The conversation so far: "${conversationHistory}". Respond as Worker 1 in turn ${turn} of ${turns}.`;
      const worker1Response = await generateOllamaResponse(worker1Model, worker1Prompt);
      const worker1Message: ChatMessage = {
        id: currentMessages.length + 1,
        senderName: worker1Name,
        role: "worker1",
        message: worker1Response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      currentMessages = [worker1Message, ...currentMessages];
      setMessages(currentMessages);
      conversationHistory += `\n${worker1Name}: ${worker1Response}`;

      const worker2Prompt = `You are ${worker2Name} (Worker 2). The user said: "${trimmedInput}". The conversation so far: "${conversationHistory}". Respond as Worker 2 in turn ${turn} of ${turns}, building on Worker 1's response.`;
      const worker2Response = await generateOllamaResponse(worker2Model, worker2Prompt);
      const worker2Message: ChatMessage = {
        id: currentMessages.length + 1,
        senderName: worker2Name,
        role: "worker2",
        message: worker2Response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      currentMessages = [worker2Message, ...currentMessages];
      setMessages(currentMessages);
      conversationHistory += `\n${worker2Name}: ${worker2Response}`;
    }

    if (requestSummary) {
      const summaryPrompt = `Summarize the conversation: "${conversationHistory}".`;
      const summaryModel = worker1Model;
      const summaryResponse = await generateOllamaResponse(summaryModel, summaryPrompt);
      const summaryMessage: ChatMessage = {
        id: currentMessages.length + 1,
        senderName: "Summary",
        role: "worker1",
        message: summaryResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        footerText: "Conversation Summary",
      };
      setMessages((prevMessages: ChatMessage[]) => [summaryMessage, ...prevMessages]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAcceptSettings = () => {
    console.log("Settings accepted in ChatInterface");
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

  const feedbackTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <main
        className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
        data-component="ChatInterface" aria-label="Chat Interface" role="main"
      >
        <section
          className="flex flex-col-reverse gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
          aria-label="Chat History" role="log" aria-live="polite"
        >
          {messages.map((msg: ChatMessage) => (
            <ChatBubble
              key={msg.id}
              fontSize="0.90rem"
              senderName={msg.senderName}
              time={msg.time}
              message={msg.message}
              avatarIcon={getAvatarIcon(msg.role)}
              footerText={msg.footerText}
              isSender={msg.role === "user"}
              bubbleColor={getBubbleColor(msg.role)}
            />
          ))}
        </section>

        <form
          id="ChatInputContainer"
          className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
          aria-label="Chat Input Area" role="region"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div
            id="ChatTextAreaInputContainer"
            className="flex flex-row w-full mb-2"
            aria-label="Chat Text Input" role="group"
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
            aria-label="Chat Controls" role="navigation"
          >
            <div id="chat-settings-buttons" className="flex flex-row gap-2">
              <label htmlFor={folderDrawerId} className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top" data-tip="Browse Files" aria-label="Open Folder Drawer">
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
                />
              </SettingsDrawer>
              <label htmlFor={previewDrawerId} className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top" data-tip="Preview Project" aria-label="Open Preview Drawer">
                <EyeIcon size={16} />
              </label>
            </div>
            <div id="llm-model-status-indicator" className="flex flex-row items-center justify-center flex-grow" role="region" aria-label="LLM Model Status">
              <LLMStatusIndicator status={llmStatus} />
            </div>
            <div id="chat-action-buttons" className="flex flex-row gap-2 ml-auto" role="group" aria-label="Chat Actions">
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