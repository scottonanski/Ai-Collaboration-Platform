import React, { useState } from "react";
import ChatBubble from "../ChatBubbles/ChatBubbles.tsx";
import ChatTextAreaInput from "../ChatTextAreaInput/ChatTextAreaInput.tsx";
import SettingsModal from "../Modals/SettingsModal.tsx";
import { Settings, Folder, EyeIcon, Send, Pause, Play } from "lucide-react";
import LLMStatusIndicator from "../LLMStatusIndicator/LLMStatusIndicator.tsx";

// Define a type for our message objects
type ChatMessage = {
  id: number;
  senderName: string;
  role: "user" | "worker1" | "worker2";
  message: string;
  time: string;
  avatarUrl: string;
  footerText?: string;
};

// Define colors for each role
const userBubbleColor = "error";
const worker1BubbleColor = "success";
const worker2BubbleColor = "warning";

// Example Chat Data
const initialChatMessages: ChatMessage[] = [
  {
    id: 2,
    senderName: "System User",
    role: "user",
    message: "I hate you!",
    time: "12:46",
    avatarUrl:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    footerText: "Seen at 12:46",
  },
  {
    id: 1,
    senderName: "Worker 1",
    role: "worker1",
    message: "You were the Chosen One!",
    time: "12:45",
    avatarUrl:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    footerText: "Delivered",
  },
  {
    id: 3,
    senderName: "Worker 2",
    role: "worker2",
    message: "Patience you must have.",
    time: "12:47",
    avatarUrl:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  },
];

// Props for the ChatInterface component
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

  const settingsModalId = "app-settings-modal";

  // Function to open the modal
  const openSettingsModal = () => {
    const modal = document.getElementById(
      settingsModalId
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  // Helper function to get bubble color based on role
  const getBubbleColor = (role: ChatMessage["role"]) => {
    switch (role) {
      case "user":
        return userBubbleColor;
      case "worker1":
        return worker1BubbleColor;
      case "worker2":
        return worker2BubbleColor;
      default:
        return undefined;
    }
  };

  // Function to handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      senderName: "User",
      role: "user",
      message: inputValue,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatarUrl:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <>
      {/* Main container for the chat interface */}
      <main
        className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
        data-component="ChatInterface"
        aria-label="Chat Interface"
        role="main"
      >
        {/* Chat History Area */}
        <section
          className="flex flex-col gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
          aria-label="Chat History"
          role="log"
        >
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              senderName={msg.senderName}
              time={msg.time}
              message={msg.message}
              avatarUrl={msg.avatarUrl}
              footerText={msg.footerText}
              isSender={msg.role === "user"}
              bubbleColor={getBubbleColor(msg.role)}
            />
          ))}
        </section>
        {/* End Chat History Area */}

        {/* Chat Input Area */}
        <section
          id="ChatInputContainer"
          className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
          aria-label="Chat Input Area"
          role="region"
        >
          {/* Chat Text Area Input */}
          <div
            id="ChatTextAreaInputContainer"
            className="flex flex-row w-full mb-2"
            aria-label="Chat Text Input"
            role="group"
          >
            <ChatTextAreaInput
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onChange={(value) => setInputValue(value)}
              rows={2}
              value={inputValue}
              disabled={false}
            />
          </div>

          {/* Button Row */}
          <nav
            id="ChatTextInputButtonContainer"
            className="flex flex-row items-center justify-between w-full"
            aria-label="Chat Controls"
            role="navigation"
          >
            {/* Left Buttons */}
            <div id="chat-settings-buttons" className="flex flex-row gap-2">
              {/* Setting-Modal Trigger Button */}
              <button
                className="btn btn-sm btn-ghost"
                onClick={openSettingsModal}
                aria-label="Open Settings"
              >
                <Settings size={16} />
              </button>
              {/* Folder Drawer Trigger Button */}
              <label
                htmlFor={folderDrawerId}
                className="btn btn-sm btn-ghost drawer-button"
                aria-label="Open Folder Drawer"
              >
                <Folder size={16} />
              </label>
              {/* Preview Drawer Trigger Button */}
              <label
                htmlFor={previewDrawerId}
                className="btn btn-sm btn-ghost drawer-button"
                aria-label="Open Preview Drawer"
              >
                <EyeIcon size={16} />
              </label>
            </div>

            {/* Center LLM Status Indicator */}
            <div
              id="llm-model-status-indicator"
              className="flex flex-row items-center justify-center flex-grow"
              role="region"
              aria-label="LLM Model Status"
            >
              <LLMStatusIndicator status="disconnected" />
            </div>

            {/* Right Buttons */}
            <div id="chat-input-buttons" className="flex flex-row gap-2 ml-auto">
              {/* Pause Button */}
              <button className="btn btn-sm btn-ghost" aria-label="Pause">
                <Pause size={16} />
              </button>
              {/* Resume Button */}
              <button className="btn btn-sm btn-ghost" aria-label="Resume">
                <Play size={16} />
              </button>
              {/* Send Button */}
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleSendMessage}
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </div>
          </nav>
          {/* End Button Row */}
        </section>
        {/* End Chat Input Area */}
      </main>

      {/* Render the SettingsModal component (it's hidden until opened) */}
      <SettingsModal id={settingsModalId} title="Application Settings">
        {/* Content for your settings modal */}
        <p>Here you can configure various application settings.</p>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Enable Dark Mode</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              defaultChecked
            />
          </label>
        </div>
        {/* Add more settings controls here */}
      </SettingsModal>
    </>
  );
};

export default ChatInterface;