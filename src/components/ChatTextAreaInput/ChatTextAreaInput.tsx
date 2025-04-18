import React from 'react';

interface ChatTextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  // Allow other standard textarea props
  [key: string]: any;
}

const ChatTextAreaInput: React.FC<ChatTextAreaInputProps> = ({
  value,
  onChange,
  placeholder,
  rows = 2,
  onKeyDown,
  className,
  ...rest
}) => {
  const defaultClasses =
    'textarea textarea-bordered w-full outline-none focus:outline-none border-none bg-zinc-800 text-base-content placeholder:text-base-content/50 resize-none';

  return (
    <section
      aria-label="Chat Text Input"
      role="group"
      data-component="ChatTextAreaInput"
      className="w-full"
    >
      <textarea
        className={`${defaultClasses} ${className || ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onKeyDown={onKeyDown}
        {...rest}
        aria-label={placeholder || "Chat Text Input"}
      />
    </section>
  );
};

export default ChatTextAreaInput;