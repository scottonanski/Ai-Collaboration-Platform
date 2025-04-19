import React, { ChangeEvent, KeyboardEvent } from 'react';

interface ChatTextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  isPaused?: boolean;
  tempPlaceholder?: string; // Add tempPlaceholder prop
  ariaControls?: string;
}

const ChatTextAreaInput: React.FC<ChatTextAreaInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type your message...",
  rows = 2,
  disabled = false,
  isPaused = false,
  tempPlaceholder, // Destructure tempPlaceholder
  ariaControls,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  // Determine the placeholder: tempPlaceholder takes priority, then isPaused logic
  const currentPlaceholder = tempPlaceholder
    ? tempPlaceholder
    : isPaused
    ? "Collaboration Paused: Please interject..."
    : placeholder;

  return (
    <textarea
      className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-zinc-800 text-base-content placeholder:text-base-content/50 resize-none"
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder={currentPlaceholder}
      rows={rows}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-label={currentPlaceholder}
    />
  );
};

export default ChatTextAreaInput;