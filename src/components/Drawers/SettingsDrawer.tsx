// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/Drawers/SettingsDrawer.tsx
import React, { ReactNode, useState } from 'react';
import { Settings, X } from 'lucide-react';

interface SettingsDrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string; // Will be applied to the inner panel
  style?: React.CSSProperties; // Applied to the inner panel
  zIndex?: number;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  trigger,
  children,
  className = '',
  style,
  zIndex = 1050, // Base z-index for overlay
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Style for the overlay
  const overlayStyle: React.CSSProperties = {
    zIndex: zIndex,
  };

  // Style for the main centering container
  const containerStyle: React.CSSProperties = {
    zIndex: zIndex + 1, // Centering container above overlay
  };

  // Style for the inner panel (merges incoming style)
  const panelStyle: React.CSSProperties = {
    ...style,
    // z-index is handled by the container now
  };

  return (
    <>
      {/* Trigger remains the same */}
      <div onClick={() => setIsOpen(true)} style={{ display: 'inline-block' }}>{trigger}</div>

      {/* Overlay: Fades in/out */}
      <div
        className={`
          fixed inset-0 bg-black/60
          transition-opacity duration-500 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={overlayStyle}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Centering Container: Fixed, full viewport, flex center */}
      <div
        className={`
          fixed inset-0 flex items-center justify-center p-4
          transition-opacity duration-700 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={containerStyle}
        // Close if clicking outside the panel (but within the container)
        onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        aria-hidden={!isOpen}
      >
        {/* Inner Panel: Contains content, applies animation, background, etc. */}
        <div
          className={`
            transform transition-all duration-800 ease-in-out
            bg-zinc-800 rounded-lg shadow-xl max-h-[80vh] w-full max-w-md
            overflow-y-auto p-4 flex flex-col
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            ${className}
          `}
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          hidden={!isOpen}
        >
          <header className="flex items-center justify-between mb-4 border-b border-base-content/20 pb-2 flex-shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings size={20} />
              Application Settings
            </h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setIsOpen(false)}
              aria-label="Close Settings"
            >
              <X size={20} />
            </button>
          </header>
          <div className="py-4 overflow-y-auto flex-grow">{children}</div>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
