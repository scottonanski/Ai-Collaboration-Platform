import React, { ReactNode, useState } from 'react';
import { Settings, X } from 'lucide-react';

interface SettingsDrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  // Add props for the settings state
  worker1Name: string;
  worker1Model: string;
  worker2Name: string;
  worker2Model: string;
  turns: number;
  requestSummary: boolean;
  apiKey1: string;
  apiKey2: string;
  api1Provider: string;
  api2Provider: string;
  isAccepted: boolean;
  setIsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  onAcceptSettings: () => void; // Callback to handle additional logic in CollaborationSettings if needed
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  trigger,
  children,
  className = '',
  style,
  zIndex = 1050,
  worker1Name,
  worker1Model,
  worker2Name,
  worker2Model,
  turns,
  requestSummary,
  apiKey1,
  apiKey2,
  api1Provider,
  api2Provider,
  isAccepted,
  setIsAccepted,
  onAcceptSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Style for the overlay
  const overlayStyle: React.CSSProperties = {
    zIndex: zIndex,
  };

  // Style for the main centering container
  const containerStyle: React.CSSProperties = {
    zIndex: zIndex + 1,
  };

  // Style for the inner panel (merges incoming style)
  const panelStyle: React.CSSProperties = {
    ...style,
  };

  // Function for handling settings acceptance
  const handleAcceptSettings = () => {
    console.log("Collaboration Settings Accepted:", {
      worker1Name,
      worker1Model,
      worker2Name,
      worker2Model,
      turns,
      requestSummary,
      apiKey1: apiKey1 ? '******' : '',
      apiKey2: apiKey2 ? '******' : '',
      api1Provider,
      api2Provider,
    });

    // Set accepted state to true for visual feedback
    setIsAccepted(true);

    // Reset the feedback state after a short delay (e.g., 1500ms)
    setTimeout(() => {
      setIsAccepted(false);
    }, 1500);

    // Call the onAcceptSettings callback for additional logic in CollaborationSettings
    onAcceptSettings();
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
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
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
          <header className="flex items-center justify-between mb-2 border-b border-base-content/20 pb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings size={16} />
              Application Settings
            </h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setIsOpen(false)}
              aria-label="Close Settings"
            >
              <X size={15} />
            </button>
          </header>
          <div className="py-4 flex-grow">{children}</div>
          <section>
            {/* Apply Options Button - Fixed at the bottom */}
            <div className="mt-4">
              {/* --- Section 5: Accept Button --- */}
              <section
                role="region"
                aria-labelledby="accept-settings-heading"
                className="pt-6 border-t border-base-content/10"
              >
                <h3 id="accept-settings-heading" className="sr-only">Accept Settings</h3>
                <button
                  type="button"
                  className={`btn w-full ${isAccepted ? 'btn-success' : 'btn-primary'} text-white`}
                  onClick={handleAcceptSettings}
                  aria-label={isAccepted ? 'Settings Applied!' : 'Apply Collaboration Settings?'}
                >
                  {isAccepted ? 'Settings Applied!' : 'Apply Collaboration Settings?'}
                </button>
              </section>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;