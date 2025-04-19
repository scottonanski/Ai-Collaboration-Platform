// ..src/components/ChatBubbles/ChatBubbles.tsx
import React from "react";

interface ChatBubbleProps {
  message: string;
  senderName: string;
  time: string;
  avatarIcon: React.ReactNode;
  isSender?: boolean;
  footerText?: string;
  fontSize?: string;
  bubbleColor?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  senderName,
  time,
  avatarIcon,
  isSender = false,
  footerText,
  fontSize,
  bubbleColor,
}) => {
  const chatAlignment = isSender ? "chat-end" : "chat-start";
  const bubbleClass = `chat-bubble ${
    bubbleColor ? `chat-bubble-${bubbleColor}` : ""
  }`;

  return (
    <section
      className={`chat ${chatAlignment}`}
      role="group"
      aria-label={`Message from ${senderName}${isSender ? " (You)" : ""}`}
      data-component="ChatBubble"
    >
      <div className="chat-image avatar placeholder">
        <div className="rounded-full bg-zinc-800 text-zinc-400 p-3 flex items-center justify-center">
          {avatarIcon}
        </div>
      </div>
      <header className="chat-header" aria-label="Message Header">
        {senderName}
        <time
          className="text-xs opacity-30 ml-1"
          aria-label={`Sent at ${time}`}
        >
          {time}
        </time>
      </header>

      <div
        className={bubbleClass.trim()}
        aria-label="Message Content"
        style={{ fontSize: fontSize }}
      >
        {message}
      </div>
      {footerText && (
        <footer className="chat-footer opacity-30" aria-label="Message Footer">
          {footerText}
        </footer>
      )}
    </section>
  );
};

export default ChatBubble;
