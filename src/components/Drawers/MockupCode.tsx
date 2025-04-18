import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MockupCodeProps {
  code: string;
  language: string;
  className?: string;
}

const MockupCode: React.FC<MockupCodeProps> = ({ code, language, className = "" }) => (
  <div className={`mockup-code w-full h-full bg-zinc-900 rounded-md shadow-inner ${className}`}>
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      showLineNumbers
      customStyle={{
        height: "100%",
        width: "100%",
        margin: 0,
        background: "transparent",
        fontSize: "0.85rem",
        fontFamily: "Fira Mono, Menlo, monospace",
        padding: "0.85rem",
        textAlign: "left", // Force left alignment
        boxSizing: "border-box",
      }}
      codeTagProps={{
        style: { fontFamily: "inherit", textAlign: "left" }
      }}
      lineNumberStyle={{ minWidth: "2.5em", textAlign: "right", paddingRight: "1.5em" }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
);

export default MockupCode;