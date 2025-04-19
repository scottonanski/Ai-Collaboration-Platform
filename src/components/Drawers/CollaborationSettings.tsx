import React, { useState } from 'react';
import { Key } from 'lucide-react';

const CollaborationSettings: React.FC = () => {
  // State for Worker names
  const [worker1Name, setWorker1Name] = useState('Worker 1');
  const [worker2Name, setWorker2Name] = useState('Worker 2');

  // State for selected models
  const [worker1Model, setWorker1Model] = useState('');
  const [worker2Model, setWorker2Model] = useState('');

  // State for selected API providers
  const [api1Provider, setApi1Provider] = useState('');
  const [api2Provider, setApi2Provider] = useState('');

  // State for turns and summary
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);

  // State for API Keys
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');

  // State for button feedback
  const [isAccepted, setIsAccepted] = useState(false);

  // Placeholder for available Ollama models and API providers
  const availableModels = ['llama3', 'mistral', 'codegemma', 'phi3'];
  const apiProviders = ['OpenAI', 'Google', 'Anthropic'];

  // Function to handle additional logic on settings acceptance
  const onAcceptSettings = () => {
    // Add any additional logic here if needed (e.g., saving settings to a server)
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Options Container - Scrollable */}
      <div
        className="flex-1 overflow-y-auto pr-2"
        tabIndex={0}
        aria-label="Collaboration Settings Options"
      >
        {/* --- Section 1: Worker 1 Config --- */}
        <section
          role="region"
          aria-labelledby="worker1-config-heading"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
        >
          <h3 id="worker1-config-heading" className="sr-only">Worker 1 Configuration</h3>
          {/* Worker 1 Name */}
          <div className="form-control">
            <label className="label">
              <span className="text-sm label-text mb-3">Worker 1 Name</span>
            </label>
            <input
              type="text"
              value={worker1Name}
              onChange={(e) => setWorker1Name(e.target.value)}
              className="input input-sm input-bordered w-full"
              aria-label="Worker 1 Name"
            />
          </div>
          {/* Worker 1 Model Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="text-sm label-text mb-3">Worker 1 Model</span>
            </label>
            <button
              className="btn btn-sm w-full text-left"
              popoverTarget="worker1-model-dropdown"
              style={{ anchorName: "--worker1-model-anchor" } as React.CSSProperties}
              aria-label={`Select Worker 1 Model, current selection: ${worker1Model || 'None'}`}
            >
              {worker1Model || 'Select Model'}
            </button>
            <ul
              className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
              popover="auto"
              id="worker1-model-dropdown"
              style={{ positionAnchor: "--worker1-model-anchor" } as React.CSSProperties}
              role="menu"
              aria-label="Worker 1 Model Options"
            >
              {availableModels.map(model => (
                <li key={`w1-${model}`} role="menuitem">
                  <a onClick={() => setWorker1Model(model)}>{model}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --- Section 2: Worker 2 Config --- */}
        <section
          role="region"
          aria-labelledby="worker2-config-heading"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pb-6"
        >
          <h3 id="worker2-config-heading" className="sr-only">Worker 2 Configuration</h3>
          {/* Worker 2 Name */}
          <div className="form-control">
            <label className="label">
              <span className="text-sm label-text mb-3">Worker 2 Name</span>
            </label>
            <input
              type="text"
              value={worker2Name}
              onChange={(e) => setWorker2Name(e.target.value)}
              className="input input-sm input-bordered w-full"
              aria-label="Worker 2 Name"
            />
          </div>
          {/* Worker 2 Model Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="text-sm label-text mb-3">Worker 2 Model</span>
            </label>
            <button
              className="btn btn-sm w-full text-left"
              popoverTarget="worker2-model-dropdown"
              style={{ anchorName: "--worker2-model-anchor" } as React.CSSProperties}
              aria-label={`Select Worker 2 Model, current selection: ${worker2Model || 'None'}`}
            >
              {worker2Model || 'Select Model'}
            </button>
            <ul
              className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
              popover="auto"
              id="worker2-model-dropdown"
              style={{ positionAnchor: "--worker2-model-anchor" } as React.CSSProperties}
              role="menu"
              aria-label="Worker 2 Model Options"
            >
              {availableModels.map(model => (
                <li key={`w2-${model}`} role="menuitem">
                  <a onClick={() => setWorker2Model(model)}>{model}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --- Section 3: Turns & Summary --- */}
        <section
          role="region"
          aria-labelledby="turns-summary-heading"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-t border-base-content/10 py-6"
        >
          <h3 id="turns-summary-heading" className="sr-only">Turns and Summary Settings</h3>
          {/* Turns Control */}
          <div className="form-control">
            <label className="label mr-3">
              <span className="text-sm label-text">Turns</span>
            </label>
            <input
              type="number"
              min="1"
              value={turns}
              onChange={(e) => setTurns(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="input input-bordered input-sm w-full max-w-[100px]"
              aria-label="Number of turns"
            />
          </div>

          {/* Summary Checkbox */}
          <div className="form-control">
            <label className="label cursor-pointer gap-3">
              <span className="text-sm label-text">Summary Turn</span>
              <input
                type="checkbox"
                checked={requestSummary}
                onChange={(e) => setRequestSummary(e.target.checked)}
                className="checkbox checkbox-sm"
                aria-label="Request summary turn"
              />
            </label>
          </div>
        </section>

        {/* --- Section 4: API Keys --- */}
        <section
          role="region"
          aria-labelledby="api-keys-heading"
          className="space-y-4 border-t border-base-content/10 pt-6"
        >
          <h3 id="api-keys-heading" className="sr-only">API Keys Configuration</h3>
          {/* API Key 1 Input with Provider Dropdown */}
          <div className="form-control w-full mb-8">
            <div className="flex justify-between items-center py-3">
              <label className="label">
                <span className="text-sm label-text">API Key 1 (Optional)</span>
              </label>
              <div className="w-52">
                <button
                  className="btn btn-sm w-full text-left"
                  popoverTarget="api1-provider-dropdown"
                  style={{ anchorName: "--api1-provider-anchor" } as React.CSSProperties}
                  aria-label={`Select API Provider for API Key 1, current selection: ${api1Provider || 'None'}`}
                >
                  {api1Provider || 'Select Provider'}
                </button>
                <ul
                  className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                  popover="auto"
                  id="api1-provider-dropdown"
                  style={{ positionAnchor: "--api1-provider-anchor" } as React.CSSProperties}
                  role="menu"
                  aria-label="API Provider Options for API Key 1"
                >
                  {apiProviders.map(provider => (
                    <li key={`api1-${provider}`} role="menuitem">
                      <a onClick={() => setApi1Provider(provider)}>{provider}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <label className="input input-bordered input-sm flex items-center gap-2 w-full">
              <Key size={16} className="opacity-70" />
              <input
                type="password"
                className="grow w-full"
                placeholder="API Key 1"
                value={apiKey1}
                onChange={(e) => setApiKey1(e.target.value)}
                aria-label="API Key 1"
              />
            </label>
          </div>

          {/* API Key 2 Input with Provider Dropdown */}
          <div className="form-control w-full">
            <div className="flex justify-between items-center py-3">
              <label className="label">
                <span className="text-sm label-text">API Key 2 (Optional)</span>
              </label>
              <div className="w-52">
                <button
                  className="btn btn-sm w-full text-left"
                  popoverTarget="api2-provider-dropdown"
                  style={{ anchorName: "--api2-provider-anchor" } as React.CSSProperties}
                  aria-label={`Select API Provider for API Key 2, current selection: ${api2Provider || 'None'}`}
                >
                  {api2Provider || 'Select Provider'}
                </button>
                <ul
                  className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                  popover="auto"
                  id="api2-provider-dropdown"
                  style={{ positionAnchor: "--api2-provider-anchor" } as React.CSSProperties}
                  role="menu"
                  aria-label="API Provider Options for API Key 2"
                >
                  {apiProviders.map(provider => (
                    <li key={`api2-${provider}`} role="menuitem">
                      <a onClick={() => setApi2Provider(provider)}>{provider}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <label className="input input-bordered input-sm flex items-center gap-2 w-full">
              <Key size={16} className="opacity-70" />
              <input
                type="password"
                className="grow w-full"
                placeholder="API Key 2"
                value={apiKey2}
                onChange={(e) => setApiKey2(e.target.value)}
                aria-label="API Key 2"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CollaborationSettings;