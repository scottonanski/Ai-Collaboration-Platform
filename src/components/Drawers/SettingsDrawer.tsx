import React, { ReactNode, useState } from 'react';
import { X } from 'lucide-react';

interface SettingsDrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  worker1Name: string;
  worker1Model: string;
  worker1Role: 'worker' | 'reviewer';
  worker2Name: string;
  worker2Model: string;
  worker2Role: 'worker' | 'reviewer';
  turns: number;
  onAcceptSettings: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  trigger,
  children,
  style,
  worker1Name,
  worker1Model,
  worker1Role,
  worker2Name,
  worker2Model,
  worker2Role,
  turns,
  onAcceptSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [localWorker1Role, setLocalWorker1Role] = useState<'worker' | 'reviewer'>(worker1Role);
  const [localWorker2Role, setLocalWorker2Role] = useState<'worker' | 'reviewer'>(worker2Role);

  const zIndex = 1050;

  const overlayStyle: React.CSSProperties = {
    zIndex: zIndex,
  };

  const containerStyle: React.CSSProperties = {
    zIndex: zIndex + 1,
  };

  const panelStyle: React.CSSProperties = {
    ...style,
  };

  const handleAccept = () => {
    setIsAccepted(true);
    onAcceptSettings();
    console.log('Settings accepted, drawer closed');

    // Close the drawer and reset feedback after 1500ms
    setTimeout(() => {
      setIsOpen(false);
      setIsAccepted(false);
    }, 1500);
  };

  const handleCancel = () => {
    setIsOpen(false);
    console.log('Settings cancelled, drawer closed');
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} style={{ display: 'inline-block' }}>{trigger}</div>

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
        <div
          className={`
            transform transition-all duration-800 ease-in-out
            bg-zinc-800 rounded-lg shadow-xl max-h-[80vh] w-full max-w-md
            overflow-y-auto p-4 flex flex-col
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          hidden={!isOpen}
        >
          <header className="flex items-center justify-between mb-2 border-b border-base-content/20 pb-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setIsOpen(false)}
              aria-label="Close Settings"
            >
              <X size={15} />
            </button>
          </header>
          <div className="py-4 flex-grow">
            {children}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Worker 1 Role</span>
              </label>
              <select 
                value={localWorker1Role}
                onChange={(e) => setLocalWorker1Role(e.target.value as 'worker' | 'reviewer')}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="worker">Worker</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Worker 2 Role</span>
              </label>
              <select
                value={localWorker2Role}
                onChange={(e) => setLocalWorker2Role(e.target.value as 'worker' | 'reviewer')}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="worker">Worker</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-auto pt-6 border-t border-base-content/10">
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleCancel}
              aria-label="Cancel Settings"
            >
              Cancel
            </button>
            <button
              className={`btn btn-sm ${isAccepted ? 'btn-success' : 'btn-primary'} w-24`}
              onClick={handleAccept}
              aria-label={isAccepted ? 'Applying Settings' : 'Accept Settings'}
            >
              {isAccepted ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                'Accept'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;