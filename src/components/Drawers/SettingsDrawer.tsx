// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/Drawers/SettingsDrawer.tsx
import React, { ReactNode, useState } from 'react';
import { Settings, X } from 'lucide-react';

interface SettingsDrawerProps {
  trigger: ReactNode;      // e.g. a <button> to open
  children: ReactNode;
  className?: string; // Will be applied to the drawer panel
  style?: React.CSSProperties;
  zIndex?: number;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  trigger,
  children,
  className = '', // Default to empty string
  style, // Keep incoming style prop
  zIndex = 200, // Base z-index for the overlay
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Combine incoming style with the calculated z-index for the panel
  const panelStyle: React.CSSProperties = {
    ...style,
    zIndex: zIndex + 1, // Apply z-index directly via style
  };

  return (
    <>
      {/* Wrap the trigger and attach the onClick to open */}
      <div onClick={() => setIsOpen(true)} style={{ display: 'inline-block' }}>{trigger}</div>

      {/* Conditionally render overlay and drawer */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-100 transition-opacity duration-300"
            style={{ zIndex }} // Overlay uses the base zIndex
            onClick={() => setIsOpen(false)} // Close on overlay click
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            // Removed the dynamic z-index class
            className={`
              fixed top-0 left-0 right-0
              transform transition-transform duration-300 ease-in-out
              bg-base-200 shadow-xl max-h-[75vh] overflow-y-auto p-4
              ${isOpen ? 'translate-y-0' : '-translate-y-full'}
              ${className}
            `}
            style={panelStyle} // Apply combined style with z-index here
            role="dialog"
            aria-modal="true"
          >
            <header className="flex items-center justify-between mb-4 border-b border-base-content/20 pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings size={20} />
                Application Settings
              </h2>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsOpen(false)} // Close button
                aria-label="Close Settings"
              >
                <X size={20} />
              </button>
            </header>
            <div className="py-4">{children}</div>
          </div>
        </>
      )}
    </>
  );
};

export default SettingsDrawer;
