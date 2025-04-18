// src/ts/components/ChatInput.tsx
import React, { FormEvent, useEffect, useState, useRef, KeyboardEvent } from "react";
import {
  Eye,
  Folder,
  Settings,
  Send,
  Code,
  Eye as LivePreviewIcon,
  MessageSquare,
  Pause,
  Play,
} from "lucide-react";
import { marked } from "marked";
import hljs from "highlight.js";
import { getCodeContent, conversationHistory } from "../exports.ts";
import OllamaStatusIndicator, { OllamaStatus } from './OllamaStatusIndicator';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSettingsToggle: () => void;
  onPreviewDrawerChange: (isDrawerOpening: boolean) => void;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  placeholder: string;
  ollamaStatus: OllamaStatus;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onSettingsToggle,
  onPreviewDrawerChange,
  isPaused,
  onPause,
  onResume,
  placeholder,
  ollamaStatus // This prop is correctly received from Chat.tsx
}) => {
  // ... rest of the component is fine ...

  const [activeTab, setActiveTab] = useState<"code" | "live" | "history">(
    "code"
  );
  const [activeCodeSubTab, setActiveCodeSubTab] = useState<
    "html" | "css" | "js"
  >("html");
  const [livePreviewContent, setLivePreviewContent] = useState("");
  const [drawerWidth, setDrawerWidth] = useState<number>(384);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Form submit handler (Send button click)
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isPaused) {
      console.log("Send button clicked while paused: Triggering onResume");
      onResume();
    } else {
      console.log("Send button clicked while active: Triggering onSubmit");
      onSubmit();
    }
  };

  // Keydown handler for textarea (Enter key)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isPaused) {
        console.log("Enter pressed while paused: Triggering onResume");
        onResume();
      } else {
        console.log("Enter pressed while active: Triggering onSubmit");
        onSubmit();
      }
    }
  };

  // ... (other useEffect hooks remain the same) ...

  // Format chat history as Markdown
  const renderChatHistory = () => {
    // ... (renderChatHistory remains the same) ...
    const logEntries = conversationHistory.map((entry) => {
      const role =
        entry.role === "user"
          ? "User"
          : entry.role === "assistant"
          ? "AI"
          : "System";
      return `**${role}**: ${entry.content}`;
    });
    const markdownContent =
      logEntries.length > 0
        ? logEntries.join("\n\n")
        : "*No chat history available.*";
    return marked.parse(markdownContent);
  };


  return (
    // The main container for ChatInput starts here
    <div className="relative flex flex-col mb-4 bg-base-200 rounded-md p-4">

      <textarea
        className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-base-200 text-base-content placeholder:text-base-content/50 resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between relative pt-2">
        <div className="flex gap-2">

          {/* ... (Gear, Folder, Eye buttons with tooltips) ... */}
          <div className="tooltip tooltip-top" data-tip="Settings">
            <button
              onClick={onSettingsToggle}
              className="btn btn-circle btn-ghost"
            >
              <Settings
                size={18}
                strokeWidth={1.25}
                className="text-zinc-400"
              />
            </button>
          </div>

          {/* Folder Button with Tooltip */}
          <div className="tooltip tooltip-top" data-tip="Files">
            <div className="drawer drawer-start">
              <input
                id="folder-drawer"
                type="checkbox"
                className="drawer-toggle"
              />
              <label
                htmlFor="folder-drawer"
                className="btn btn-circle btn-ghost"
              >
                <Folder
                  size={18}
                  strokeWidth={1.25}
                  className="text-zinc-400"
                />
              </label>
              <div className="drawer-side z-100">
                <label htmlFor="folder-drawer" className="drawer-overlay" />
                <div className="menu bg-base-200 min-h-full w-80 p-4">
                  <h3 className="font-bold text-lg mb-4">Folder Structure</h3>
                  <ul className="menu">
                    <li>
                      <details open>
                        <summary>project</summary>
                        <ul>
                          <li>
                            <a>index.html</a>
                          </li>
                          <li>
                            <a>style.css</a>
                          </li>
                          <li>
                            <a>script.js</a>
                          </li>
                        </ul>
                      </details>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Eye Button with Tooltip */}
          <div className="tooltip tooltip-top" data-tip="Preview">
            <div className="drawer drawer-end">
              <input
                id="preview-drawer"
                type="checkbox"
                className="drawer-toggle"
                onChange={(e) => onPreviewDrawerChange(e.target.checked)}
              />
              <label
                htmlFor="preview-drawer"
                className="btn btn-circle btn-ghost"
              >
                <Eye size={18} strokeWidth={1.25} className="text-zinc-400" />
              </label>
              <div className="drawer-side z-100">
                <label htmlFor="preview-drawer" className="drawer-overlay" />
                <div
                  ref={drawerContentRef}
                  className="menu bg-base-200 min-h-full p-4 relative"
                  style={{ width: `${drawerWidth}px`, minWidth: "25%" }}
                >
                  {/* ... (Resize Handle and drawer content) ... */}
                   {/* Resize Handle */}
                  <div
                    className="absolute top-0 left-0 w-2 h-full bg-gray-500 cursor-ew-resize z-10"
                    onMouseDown={(e) => {
                      console.log("Resize Handle: onMouseDown triggered");
                      e.preventDefault();

                      const currentDrawerWidth =
                        drawerContentRef.current?.getBoundingClientRect()
                          .width ?? drawerWidth;
                      console.log(
                        `Resize Handle: Start - StateWidth: ${drawerWidth}, ActualWidth: ${currentDrawerWidth}`
                      );

                      const startX = e.clientX;
                      const startWidth = currentDrawerWidth;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const newWidth =
                          startWidth + (startX - moveEvent.clientX);
                        setDrawerWidth(Math.max(newWidth, 200));
                      };

                      const onMouseUp = () => {
                        window.removeEventListener("mousemove", onMouseMove);
                        window.removeEventListener("mouseup", onMouseUp);
                        console.log("Resize Handle: Listeners removed");
                      };

                      console.log(
                        "Resize Handle: Adding mousemove and mouseup listeners"
                      );
                      window.addEventListener("mousemove", onMouseMove);
                      window.addEventListener("mouseup", onMouseUp);
                    }}
                  />
                  <h3 className="font-bold text-lg mb-4">Preview</h3>
                  {/* DaisyUI Tabs */}
                  <div className="tabs tabs-boxed mb-4">
                    <a
                      className={`tab tab-lifted ${
                        activeTab === "code" ? "tab-active" : ""
                      }`}
                      onClick={() => setActiveTab("code")}
                    >
                      <Code size={16} className="mr-2" /> Code
                    </a>
                    <a
                      className={`tab tab-lifted ${
                        activeTab === "live" ? "tab-active" : ""
                      }`}
                      onClick={() => setActiveTab("live")}
                    >
                      <LivePreviewIcon size={16} className="mr-2" /> Live
                      Preview
                    </a>
                    <a
                      className={`tab tab-lifted ${
                        activeTab === "history" ? "tab-active" : ""
                      }`}
                      onClick={() => setActiveTab("history")}
                    >
                      <MessageSquare size={16} className="mr-2" /> Chat History
                    </a>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "code" && (
                    <div>
                      {/* Sub-Tabs for Code Output */}
                      <div className="tabs tabs-boxed mb-2">
                        <a
                          className={`tab ${
                            activeCodeSubTab === "html" ? "tab-active" : ""
                          }`}
                          onClick={() => setActiveCodeSubTab("html")}
                        >
                          HTML
                        </a>
                        <a
                          className={`tab ${
                            activeCodeSubTab === "css" ? "tab-active" : ""
                          }`}
                          onClick={() => setActiveCodeSubTab("css")}
                        >
                          CSS
                        </a>
                        <a
                          className={`tab ${
                            activeCodeSubTab === "js" ? "tab-active" : ""
                          }`}
                          onClick={() => setActiveCodeSubTab("js")}
                        >
                          JavaScript
                        </a>
                      </div>
                      <div className="bg-base-300 p-4 rounded-md max-h-[70vh] overflow-auto">
                        <pre>
                          <code
                            className={`language-${activeCodeSubTab}`}
                            dangerouslySetInnerHTML={{
                              __html: hljs.highlight(
                                getCodeContent(
                                  activeCodeSubTab === "js"
                                    ? "javascript"
                                    : activeCodeSubTab
                                ) || "// No Code has been generated (yet!)",
                                {
                                  language:
                                    activeCodeSubTab === "js"
                                      ? "javascript"
                                      : activeCodeSubTab,
                                }
                              ).value,
                            }}
                          />
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === "live" && (
                    <div className="bg-base-300 p-4 rounded-md max-h-[70vh] overflow-auto">
                      <iframe
                        className="w-full h-96 border-none"
                        srcDoc={livePreviewContent}
                        title="Live Preview"
                        sandbox="allow-scripts"
                      />
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="bg-base-300 p-4 rounded-md max-h-[70vh] overflow-auto prose prose-invert">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderChatHistory(),
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div> {/* End of Left Buttons Group */}

        {/* Ollama Status Indicator - Placed between button groups */}
        <div className="flex-grow flex justify-center items-center px-2">
            <OllamaStatusIndicator status={ollamaStatus} />
        </div>


        {/* Right buttons */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          {/* ... Pause, Resume, Send buttons ... */}
          {/* Pause Button with Tooltip */}
          <div className="tooltip tooltip-top" data-tip="Pause">
            <button
              type="button"
              className="btn btn-circle btn-ghost"
              onClick={onPause}
              aria-label="Pause generation"
              disabled={isPaused}
            >
              <Pause size={18} strokeWidth={1.25} className="text-zinc-400" />
            </button>
          </div>

          {/* Resume Button */}
          <div className="tooltip tooltip-top" data-tip="Resume">
            <button
              type="button"
              className="btn btn-circle btn-ghost"
              onClick={onResume}
              aria-label="Resume generation"
              disabled={!isPaused}
            >
              <Play size={18} strokeWidth={1.25} className="text-zinc-400" />
            </button>
          </div>

          {/* Send Button */}
          <div className="tooltip tooltip-top" data-tip="Send">
            <button
              type="submit"
              className="btn btn-circle btn-ghost"
              aria-label="Send message"
              // No longer needs to be disabled when paused
            >
              <Send size={18} strokeWidth={1.25} className="text-zinc-400" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
