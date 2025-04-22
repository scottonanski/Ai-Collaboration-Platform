import React from 'react';
import { ChatMessage as ChatMessageType } from '../../collaborationTypes';
import { parseBotMessage, MessagePart } from '../../utils/messageParser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  const parts: MessagePart[] = isBot
    ? parseBotMessage(message.message)
    : [{ type: 'text', content: message.message }];

  // Group parts into paragraphs by splitting on newlines
  const paragraphs: MessagePart[][] = [];
  let currentParagraph: MessagePart[] = [];

  parts.forEach((part) => {
    if (part.type === 'text' && part.content.includes('\n')) {
      const lines = part.content.split('\n');
      lines.forEach((line, index) => {
        if (line.trim()) {
          currentParagraph.push({ type: 'text', content: line.trim() });
        }
        if (index < lines.length - 1) {
          if (currentParagraph.length > 0) {
            paragraphs.push([...currentParagraph]);
            currentParagraph = [];
          }
        }
      });
    } else if (part.type === 'code') {
      if (currentParagraph.length > 0) {
        paragraphs.push([...currentParagraph]);
        currentParagraph = [];
      }
      paragraphs.push([part]);
    } else {
      currentParagraph.push(part);
    }
  });

  if (currentParagraph.length > 0) {
    paragraphs.push([...currentParagraph]);
  }

  return (
    <div
      className={`chat ${message.role === 'user' ? 'chat-end' : message.role === 'system' ? 'chat-start' : 'chat-middle'}`}
      role="article"
      aria-label={`${message.senderName} message`}
    >
      <div className="chat-header text-sm text-gray-500 mb-3">
        {message.senderName}{' '}
        <span
          className="tooltip"
          data-tip={new Date(message.createdAt).toLocaleString()}
        >
          ({new Date(message.createdAt).toLocaleTimeString()})
        </span>
      </div>
      <div className="chat-bubble p-6 rounded-lg whitespace-pre-wrap break-words text-gray-200">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="mb-2 last:mb-0">
            {paragraph.length === 1 && paragraph[0].type === 'code' ? (
              <div
                className="mockup-code my-4 rounded-lg text-left bg-[#1a1a1a] overflow-hidden"
              >
                <SyntaxHighlighter
                  language={paragraph[0].language === 'text' ? 'plaintext' : paragraph[0].language}
                  style={androidstudio}
                  wrapLines={true}
                  wrapLongLines={true}
                  customStyle={{
                    paddingLeft: '2rem',
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    margin: 0,
                    fontSize: '0.875rem',
                    background: 'transparent',
                  }}
                  role="region"
                  aria-label={`Code block in ${paragraph[0].language || 'unknown'}`}
                >
                  {typeof paragraph[0].code === 'string' ? paragraph[0].code.trim() : '[Code block incomplete]'}
                </SyntaxHighlighter>
              </div>
            ) : (
              <p>
                {paragraph.map((part, i) => {
                  if (part.type === 'text') {
                    return <span key={i}>{part.content}</span>;
                  } else if (part.type === 'bold') {
                    return (
                      <strong key={i} className="font-bold">
                        {part.content}
                      </strong>
                    );
                  } else if (part.type === 'inlineCode') {
                    return (
                      <code
                        key={i}
                        className="bg-gray-700 text-gray-100 px-1 rounded font-mono text-sm"
                      >
                        {part.content}
                      </code>
                    );
                  }
                  console.warn("Unknown message part type in paragraph:", part);
                  return null;
                })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatMessage;