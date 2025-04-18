import React from 'react';

// Define props for the component
interface ChatBubbleProps {
  message: string;
  senderName: string;
  time: string;
  avatarUrl: string;
  isSender?: boolean;
  footerText?: string;
  bubbleColor?: ' chat-bubble-accent' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  senderName,
  time,
  avatarUrl,
  isSender = false,
  footerText,
  bubbleColor,
}) => {
  const chatAlignment = isSender ? 'chat-end' : 'chat-start';
  const bubbleClass = bubbleColor ? ` chat-bubble-${bubbleColor}` : '';

  return (
    <section
      className={`chat ${chatAlignment}`}
      role="group"
      aria-label={`Message from ${senderName}${isSender ? " (You)" : ""}`}
      data-component="ChatBubble"
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt={`${senderName} avatar`}
            src={avatarUrl}
          />
        </div>
      </div>
      <header className="chat-header" aria-label="Message Header">
        {senderName}
        <time className="text-xs opacity-50 ml-1" aria-label={`Sent at ${time}`}>{time}</time>
      </header>
      <div className={`chat-bubble${bubbleClass}`} aria-label="Message Content">
        {message}
      </div>
      {footerText && (
        <footer className="chat-footer opacity-50" aria-label="Message Footer">
          {footerText}
        </footer>
      )}
    </section>
  );
};

export default ChatBubble;