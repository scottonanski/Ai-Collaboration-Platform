import React from "react";

interface ChatBubbleProps {
  fontSize: string;
  senderName: string;
  time: string;
  message: string;
  avatarIcon: React.ReactNode;
  footerText?: string;
  isSender: boolean;
  bubbleColor: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  type: "message" | "summary";
  turn?: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  fontSize,
  senderName,
  time,
  message,
  avatarIcon,
  footerText,
  isSender,
  bubbleColor,
  isFirstInGroup,
  isLastInGroup,
  type,
  turn,
}) => {
  const isSummary = type === "summary";
  return (
    <div
      className={`chat ${isSender ? 'chat-end' : 'chat-start'} ${isSummary ? 'mt-4' : 'mt-1'}`}
      style={{ fontSize }}
    >
      {isFirstInGroup && (
        <div className="chat-header flex items-center gap-1">
          {avatarIcon}
          <span>{senderName}</span>
          {turn !== undefined && <span className="text-xs opacity-50">(Turn {turn})</span>}
          <time className="text-xs opacity-50">{time}</time>
        </div>
      )}
      <div
        className={`chat-bubble chat-bubble-${bubbleColor} ${isFirstInGroup ? 'rounded-t-lg' : ''} ${
          isLastInGroup ? 'rounded-b-lg' : ''
        } ${isSummary ? 'italic' : ''}`}
      >
        {message}
      </div>
      {isLastInGroup && footerText && (
        <div className="chat-footer opacity-50">{footerText}</div>
      )}
    </div>
  );
};

export default ChatBubble;