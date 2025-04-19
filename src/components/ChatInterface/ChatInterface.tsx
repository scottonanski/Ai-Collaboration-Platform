import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../ChatBubbles/ChatBubbles.tsx";
import ChatTextAreaInput from "../ChatTextAreaInput/ChatTextAreaInput.tsx";
import SettingsDrawer from "../Drawers/SettingsDrawer.tsx";
import { Settings, Folder, EyeIcon, Send, Pause, Play, ArrowDown10, UserCog } from "lucide-react";
import LLMStatusIndicator from "../LLMStatusIndicator/LLMStatusIndicator.tsx";
import CollaborationSettings from "../Drawers/CollaborationSettings.tsx";

// --- Type definitions and constants ---
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
// --- End of definitions ---

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
  const [tempPlaceholder, setTempPlaceholder] = useState<string | undefined>(undefined); // New state for temporary placeholder
  const feedbackTimeoutRef = useRef<number | null>(null);

  // --- Helper functions ---
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

  // --- Action Handlers ---
  const handlePause = () => {
    console.log("Pausing...");
    setIsPaused(true);
    setInputValue(""); // Clear input field when pausing
    // TODO: Signal AI workers to pause
  };

  const handleResume = () => {
    console.log("Resuming...");
    setIsPaused(false);
    setInputValue(""); // Clear input
    // TODO: Signal AI workers to resume
  };

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    if (isPaused) {
      console.log("Send/Enter while paused: Triggering resume with interjection");
      // Add interjection message
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        senderName: "User",
        role: "user",
        message: trimmedInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      // Set temporary placeholder instead of inputValue
      setTempPlaceholder("Interjection submitted to the collaboration");
      setInputValue(""); // Clear the input immediately
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setTempPlaceholder(undefined);
        feedbackTimeoutRef.current = null;
      }, 4000); // Clear placeholder after 4s
      setIsPaused(false);
      // TODO: Signal AI workers to resume with interjection
    } else {
      console.log("Send/Enter while active: Sending normally");
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        senderName: "User",
        role: "user",
        message: trimmedInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setInputValue("");
      // TODO: Signal AI workers to process the message
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  // Cleanup timeout on component unmount
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
        {/* Chat History Section */}
        <section
          className="flex flex-col-reverse gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
          aria-label="Chat History" role="log" aria-live="polite"
        >
          {messages.map((msg) => (
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

        {/* Chat Input Section */}
        <form
          id="ChatInputContainer"
          className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
          aria-label="Chat Input Area" role="region"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          {/* Text Area Input */}
          <div
            id="ChatTextAreaInputContainer"
            className="flex flex-row w-full mb-2"
            aria-label="Chat Text Input" role="group"
          >
            <ChatTextAreaInput
              placeholder="Type your message..."
              onChange={(value) => setInputValue(value)}
              onKeyDown={handleKeyDown}
              rows={2}
              value={inputValue}
              disabled={false}
              isPaused={isPaused}
              tempPlaceholder={tempPlaceholder} // Pass the temporary placeholder
              ariaControls="chat-send-button"
            />
          </div>

          {/* Button Navigation */}
          <nav
            id="ChatTextInputButtonContainer"
            className="flex flex-row items-center justify-between w-full"
            aria-label="Chat Controls" role="navigation"
          >
            {/* Left Buttons */}
            <div id="chat-settings-buttons" className="flex flex-row gap-2">
              <label htmlFor={folderDrawerId} className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top" data-tip="Browse Files" aria-label="Open Folder Drawer">
                <Folder size={16} />
              </label>
              <SettingsDrawer trigger={settingsTrigger}>
                <CollaborationSettings />
              </SettingsDrawer>
              <label htmlFor={previewDrawerId} className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top" data-tip="Preview Project" aria-label="Open Preview Drawer">
                <EyeIcon size={16} />
              </label>
            </div>

            {/* LLM Status Indicator */}
            <div id="llm-model-status-indicator" className="flex flex-row items-center justify-center flex-grow" role="region" aria-label="LLM Model Status">
              <LLMStatusIndicator status="disconnected" />
            </div>

            {/* Right Buttons */}
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