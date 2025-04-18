import React from "react";

export type LLMStatus = "disconnected" | "connected" | "error";

interface LLMStatusIndicatorProps {
  status: LLMStatus;
}

const statusConfig: Record<
  LLMStatus,
  { color: string; text: string; ariaLabel: string; textColor: string }
> = {
  disconnected: {
    color: "bg-gray-500",
    text: "Models not connected...",
    ariaLabel: "Models are not connected",
    textColor: "text-gray-500",
  },
  connected: {
    color: "bg-green-500",
    text: "Models are connected! Ready!",
    ariaLabel: "Models are connected and ready",
    textColor: "text-green-500",
  },
  error: {
    color: "bg-red-500",
    text: "Models failed to connect!",
    ariaLabel: "Models failed to connect",
    textColor: "text-red-500",
  },
};

const LLMStatusIndicator: React.FC<LLMStatusIndicatorProps> = ({ status }) => {
    const { color, text, ariaLabel, textColor } = statusConfig[status];
  
    return (
      <section
        aria-label="LLM Connection Status"
        role="status"
        className="flex items-center gap-2"
        data-component="LLMStatusIndicator"
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${color}`}
          aria-hidden="true"
          data-element="status-dot"
        />
        <span className={`text-sm ${textColor}`} aria-live="polite" aria-label={ariaLabel}>
          {text}
        </span>
      </section>
    );
  };
  
  export default LLMStatusIndicator;