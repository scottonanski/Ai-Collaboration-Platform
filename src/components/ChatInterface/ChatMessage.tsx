import React, { useEffect, useState, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessagePart } from '../../collaborationTypes';
import { parseBotMessage, groupIntoParagraphs } from '../../utils/messageParser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  const [showCursor, setShowCursor] = useState(true);
  const cursorRef = useRef<number | null>(null);

  useEffect(() => {
    if (message.streaming) {
      const intervalId = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500); // Blink speed
      return () => clearInterval(intervalId);
    } else {
      setShowCursor(false);
    }
  }, [message.streaming]);

  const parts = parseBotMessage(message.message);
  const paragraphs = groupIntoParagraphs(parts);

  useEffect(() => {
    console.log("ChatMessage Props:", { message });
    console.log("Parsed Parts:", parts);
    console.log("Grouped Paragraphs:", paragraphs);
  }, [message, parts, paragraphs]);

  useEffect(() => {
    if (message.role === 'assistant' && message.message.includes('* **')) {
      console.log("--- Bot Message with potential list ---");
      console.log("Raw Content:\n", message.message);
      console.log("Parsed Parts:", parts);
      console.log("Grouped Paragraphs:", paragraphs);
      message.message.split('\n').forEach((line: string, index: number) => {
          console.log(`Line ${index}:`, JSON.stringify(line));
      });
      console.log("---------------------------------------");
    }
  }, [message, parts, paragraphs]);

  // Helper to get badge style and title based on role
  const getRoleStyle = (role: 'user' | 'assistant' | 'system') => {
    switch (role) {
      case 'user':
        return { title: 'User', badgeClass: 'badge-primary' };
      case 'assistant': // Assuming Assistant is Worker 1
        return { title: 'Worker 1', badgeClass: 'badge-success' };
      case 'system': // Assuming System is Worker 2
        return { title: 'Worker 2', badgeClass: 'badge-warning text-gray-900' }; // Added dark text for warning
      default:
        return { title: 'Unknown', badgeClass: 'badge-ghost' };
    }
  };

  const { title, badgeClass } = getRoleStyle(message.role);

  return (
    <div className="w-full py-3 px-4"> 
      {/* Role Label Badge */} 
      <div className="mb-1">
        <span className={`badge badge-xs ${badgeClass}`}>{title}</span>
      </div>
      {/* Message Content Area */} 
      <div className="w-full rounded-lg whitespace-pre-wrap break-words text-gray-200 bg-neutral p-4"> 
        {paragraphs.map((paragraph: MessagePart[], index: number) => {
          const isSinglePartParagraph = paragraph.length === 1;
          const part = isSinglePartParagraph ? paragraph[0] : null;
          const isCodeBlock = part && (part.type === 'code' || part.type === 'incompleteCode');

          return (
            <div key={index} className="mb-2 last:mb-0">
              {isCodeBlock ? (
                (() => {
                  const codePart = part as Extract<MessagePart, { type: 'code' | 'incompleteCode' }>;
                  const codeContent = codePart.code || '';
                  const language = codePart.language || 'plaintext';

                  return (
                    <div
                      className="mockup-code max-w-5xl mx-auto my-2 rounded-lg text-left bg-[#1a1a1a] overflow-hidden"
                    >
                      <SyntaxHighlighter
                        language={language === 'text' ? 'plaintext' : language}
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
                        aria-label={`Code block in ${language || 'unknown'}`}
                      >
                        {codeContent.trimEnd()} 
                      </SyntaxHighlighter>
                      {message.streaming && part.type === 'incompleteCode' && (
                        <div style={{ padding: '1rem 2rem', color: '#bbb' }}>
                          <span>Receiving code...</span>
                          <span className={`ml-1 transition-opacity duration-300 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div> 
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} {...props} />,
                      code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match; 

                        if (isInline) {
                          return <code className={className} style={{ overflowWrap: 'break-word', wordBreak: 'break-all', whiteSpace: 'normal' }} {...props}>{children}</code>;
                        }
                        return <code className={className} {...props}>{children}</code>;
                      },
                      a: ({ node, ...props }) => <a style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} {...props} />,
                    }}
                  >
                    {paragraph.filter(p => p.type === 'text').map(p => p.content).join('')}
                  </ReactMarkdown>
                  {message.streaming && index === paragraphs.length - 1 && !isCodeBlock && (
                    <span className={`ml-1 transition-opacity duration-300 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatMessage;