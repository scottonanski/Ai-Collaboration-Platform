import React from 'react';
import { Message } from '../../services/CollaborationService';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="chat-message p-2 border border-base-content/20 rounded">
      <p className="text-sm text-base-content/70">
        <strong>{message.senderName}</strong> at {new Date(message.createdAt).toLocaleString()}: {message.message}
      </p>
    </div>
  );
};

export default ChatMessage;