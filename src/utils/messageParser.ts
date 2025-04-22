export type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'inlineCode'; content: string }
  | { type: 'code'; language: string; code: string };

export const parseBotMessage = (message: string): MessagePart[] => {
  const parts: MessagePart[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```|([^`]+)/g;
  let remainingMessage = message;
  let match;

  while ((match = codeBlockRegex.exec(message)) !== null) {
    if (match[3]) {
      let text = match[3].trim();
      if (text) {
        // First, parse inline code (e.g., `text`)
        const inlineCodeRegex = /`([^`]+)`|([^`]+)/g;
        let textRemaining = text;
        let inlineMatch;

        while ((inlineMatch = inlineCodeRegex.exec(text)) !== null) {
          if (inlineMatch[1]) {
            // Inline code (e.g., `text`)
            const inlineCodeContent = inlineMatch[1].trim();
            if (inlineCodeContent) {
              parts.push({ type: 'inlineCode', content: inlineCodeContent });
            }
          } else if (inlineMatch[2]) {
            // Text that might contain bold sections
            const subText = inlineMatch[2];
            // Parse bold sections within this text (e.g., **bold**)
            const boldRegex = /\*\*([^\*]+)\*\*|([^\*]+)/g;
            let subTextRemaining = subText;
            let boldMatch;

            while ((boldMatch = boldRegex.exec(subText)) !== null) {
              if (boldMatch[1]) {
                const boldContent = boldMatch[1].trim();
                if (boldContent) {
                  parts.push({ type: 'bold', content: boldContent });
                }
              } else if (boldMatch[2]) {
                const regularText = boldMatch[2].trim();
                if (regularText) {
                  parts.push({ type: 'text', content: regularText });
                }
              }
              subTextRemaining = subTextRemaining.slice(boldMatch.index + boldMatch[0].length);
            }

            if (subTextRemaining.trim()) {
              parts.push({ type: 'text', content: subTextRemaining.trim() });
            }
          }
          textRemaining = textRemaining.slice(inlineMatch.index + inlineMatch[0].length);
        }

        if (textRemaining.trim()) {
          parts.push({ type: 'text', content: textRemaining.trim() });
        }
      }
    } else {
      const language = match[1] || 'text';
      const code = match[2] ? match[2].trim() : '';
      parts.push({ type: 'code', language, code });
    }
    remainingMessage = remainingMessage.slice(match.index + match[0].length);
  }

  if (remainingMessage.trim()) {
    parts.push({ type: 'text', content: remainingMessage.trim() });
  }

  return parts;
};