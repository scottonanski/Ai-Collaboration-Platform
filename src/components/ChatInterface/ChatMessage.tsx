import React from "react";
import { ChatMessage as ChatMessageType } from "../../collaborationTypes";

import DOMPurify from "dompurify";

const sanitize = (html: string) => {
  return DOMPurify.sanitize(html);
};

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const sanitize = (html: string) => {
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic sanitization
  };

  return (
    <div
      className={`chat ${message.role === "user" ? "chat-end" : message.role === "system" ? "chat-start" : "chat-middle"}`}
      role="article"
      aria-label={`${message.senderName} message`}
    >
      <div className="chat-header">
        {message.senderName} at {new Date(message.createdAt).toLocaleString()}
      </div>
      <div
        className="chat-bubble"
        dangerouslySetInnerHTML={{ __html: sanitize(message.message) }}
      />
    </div>
  );
};

export default ChatMessage;