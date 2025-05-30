import React, { useEffect, useState, useMemo } from 'react';
import { ChatMessage as ChatMessageType, MessagePart } from '../../collaborationTypes';
import { parseBotMessage, groupIntoParagraphs } from '../../utils/messageParser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessageInternal: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  const [showCursor, setShowCursor] = useState(true);
  // cursorRef was unused, removed for now. If needed later, it can be re-added.
  // const cursorRef = useRef<number | null>(null); 

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

  const parts = useMemo(() => parseBotMessage(message.message), [message.message]);
  const paragraphs = useMemo(() => groupIntoParagraphs(parts), [parts]);

  // Removed useEffect hooks that contained console.log statements for performance.
  // If debugging is needed, they can be temporarily re-enabled.

  // Helper to get badge style and title based on role
  const getRoleStyle = (role: 'user' | 'assistant' | 'system') => {
    switch (role) {
      case 'user':
        return { title: 'User', badgeClass: 'badge-primary' };
      case 'assistant':
        return { title: 'Worker 1', badgeClass: 'badge-success' }; // Assuming Assistant maps to Worker 1
      case 'system':
        return { title: 'Worker 2', badgeClass: 'badge-warning text-gray-900' }; // Assuming System maps to Worker 2
      default:
        return { title: 'Unknown', badgeClass: 'badge-ghost' };
    }
  };

  const { title, badgeClass } = getRoleStyle(message.role);

  const markdownComponents = useMemo(() => ({
    // Typing for props can be more specific if needed, using 'any' for brevity here
    p: ({ node, ...props }: any) => <p style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} {...props} />,
    li: ({ node, ...props }: any) => <li style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} {...props} />,
    code: ({ node, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match; 

      if (isInline) {
        return <code className={className} style={{ overflowWrap: 'break-word', wordBreak: 'break-all', whiteSpace: 'normal' }} {...props}>{children}</code>;
      }
      // For block code, ReactMarkdown will typically wrap it in <pre><code>, 
      // SyntaxHighlighter handles styling for block code better.
      // This custom 'code' component is mainly for ensuring inline code wraps.
      // If ReactMarkdown is rendering block code here, ensure it doesn't clash with SyntaxHighlighter.
      // Based on current structure, ReactMarkdown is used for non-code-block paragraphs.
      return <code className={className} {...props}>{children}</code>;
    },
    a: ({ node, ...props }: any) => <a style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} {...props} />,
  }), []);


  return (
    <div className="w-full py-3 px-4"> 
      <div className="mb-1">
        <span className={`badge badge-xs ${badgeClass}`}>{title}</span>
      </div>
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
                    components={markdownComponents}
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

// Memoize the component
const ChatMessage = React.memo(ChatMessageInternal);

export default ChatMessage;