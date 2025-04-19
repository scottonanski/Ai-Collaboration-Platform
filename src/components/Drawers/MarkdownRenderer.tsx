import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  markdownContent: string;
  ariaLabel?: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdownContent,
  ariaLabel = "Rendered Markdown Content",
  className = "",
}) => {
  if (!markdownContent?.trim()) {
    return null;
  }

  return (
    <article
      className={`prose prose-sm max-w-none prose-invert ${className}`.trim()}
      aria-label={ariaLabel}
      data-component="MarkdownRenderer"
      // Add the inline style here
      style={{ fontSize: "0.90rem" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {markdownContent}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
