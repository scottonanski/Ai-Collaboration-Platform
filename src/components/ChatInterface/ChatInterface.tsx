// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/ChatInterface/ChatInterface.tsx
import React, { useState } from "react";
import ChatBubble from "../ChatBubbles/ChatBubbles.tsx";
import ChatTextAreaInput from "../ChatTextAreaInput/ChatTextAreaInput.tsx";
import SettingsDrawer from "../Drawers/SettingsDrawer.tsx";
import { Settings, Folder, EyeIcon, Send, Pause, Play, ArrowDown10, UserCog } from "lucide-react";
import LLMStatusIndicator from "../LLMStatusIndicator/LLMStatusIndicator.tsx";

// --- Ensure these are defined OUTSIDE the component function ---
type ChatMessage = {
  id: string;
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
  {
    id: "msg-2",
    senderName: "System User",
    role: "user",
    message: "I hate you!",
    time: "12:46",
    footerText: "Seen at 12:46",
  },
  {
    id: "msg-1",
    senderName: "Worker 1",
    role: "worker1",
    message: "You were the Chosen One!",
    time: "12:45",
    footerText: "Delivered",
  },
  {
    id: "msg-3",
    senderName: "Worker 2",
    role: "worker2",
    message: "Patience you must have.",
    time: "12:47",
  },
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
  // This line needs 'initialChatMessages' to be defined in the scope above
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputValue, setInputValue] = useState("");

  // Helper functions
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderName: "User", role: "user", message: inputValue,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([newMessage, ...messages]);
    setInputValue("");
  };

  // Define the trigger element for the SettingsDrawer
  const settingsTrigger = (
    <button
      className="btn btn-sm btn-ghost tooltip tooltip-top"
      data-tip="Settings"
      aria-label="Open Settings Drawer"
    >
      <Settings size={16} />
    </button>
  );

  return (
    <>
      <main
        className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
        data-component="ChatInterface" aria-label="Chat Interface" role="main"
      >
        {/* Chat History Section */}
        <section
          className="flex flex-col-reverse gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
          aria-label="Chat History" role="log"
        >
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id} fontSize="0.90rem" senderName={msg.senderName} time={msg.time}
              message={msg.message} avatarIcon={getAvatarIcon(msg.role)} footerText={msg.footerText}
              isSender={msg.role === "user"} bubbleColor={getBubbleColor(msg.role)}
            />
          ))}
        </section>

        {/* Chat Input Section */}
        <section
          id="ChatInputContainer"
          className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
          aria-label="Chat Input Area" role="region"
        >
          {/* Text Area Input */}
          <div
            id="ChatTextAreaInputContainer"
            className="flex flex-row w-full mb-2"
            aria-label="Chat Text Input" role="group"
          >
            <ChatTextAreaInput
              placeholder="Type your message..."
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              onChange={(value) => setInputValue(value)} rows={2} value={inputValue} disabled={false}
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

               {/* Settings Drawer Trigger */}
               <SettingsDrawer trigger={settingsTrigger}>
                 <p>Here you can configure various application settings.</p>
                 <div className="form-control">
                   <label className="label cursor-pointer">
                     <span className="label-text">Enable Dark Mode</span>
                     <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                   </label>
                   <label className="label cursor-pointer mt-4">
                     <span className="label-text">Notification Level</span>
                     <select className="select select-bordered select-sm">
                       <option>All</option> <option>Mentions</option> <option>None</option>
                     </select>
                   </label>
                 </div>
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
            <div id="chat-input-buttons" className="flex flex-row gap-2 ml-auto">
              <button className="btn btn-sm btn-ghost tooltip tooltip-top" data-tip="Pause Chat" aria-label="Pause"><Pause size={16} /></button>
              <button className="btn btn-sm btn-ghost tooltip tooltip-top" data-tip="Resume Chat" aria-label="Resume"><Play size={16} /></button>
              <button className="btn btn-sm btn-ghost tooltip tooltip-top" data-tip="Send Message" onClick={handleSendMessage} aria-label="Send Message" disabled={!inputValue.trim()}><Send size={16} /></button>
            </div>
          </nav>
        </section>
      </main>

      {/* SettingsDrawer is rendered inline now */}
    </>
  );
};

export default ChatInterface;
