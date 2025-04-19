// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/ChatTextAreaInput/ChatTextAreaInput.tsx
import React, { ChangeEvent, KeyboardEvent } from 'react';

interface ChatTextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  isPaused?: boolean; // <-- Add isPaused prop
  ariaControls?: string; // For aria-controls attribute
}

const ChatTextAreaInput: React.FC<ChatTextAreaInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type your message...", // Default placeholder
  rows = 2,
  disabled = false,
  isPaused = false, // <-- Destructure isPaused
  ariaControls,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  // Determine the placeholder based on the paused state
  const currentPlaceholder = isPaused
    ? "Collaboration Paused: Please interject..."
    : placeholder;

  return (
    <textarea
      className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-base-200 text-base-content placeholder:text-base-content/50 resize-none"
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder={currentPlaceholder} // <-- Use dynamic placeholder
      rows={rows}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-label={currentPlaceholder} // Use placeholder as accessible label too
    />
  );
};

export default ChatTextAreaInput;
