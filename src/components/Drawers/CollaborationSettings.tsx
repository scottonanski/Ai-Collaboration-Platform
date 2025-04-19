// src/ts/components/CollaborationSettings.tsx
import React, { useState } from 'react';
import { Key } from 'lucide-react';

const CollaborationSettings: React.FC = () => {
  // State for Worker names
  const [worker1Name, setWorker1Name] = useState('Worker 1');
  const [worker2Name, setWorker2Name] = useState('Worker 2');

  // State for selected models
  const [worker1Model, setWorker1Model] = useState('');
  const [worker2Model, setWorker2Model] = useState('');

  // State for turns and summary
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);

  // State for API Keys
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');

  // State for button feedback
  const [isAccepted, setIsAccepted] = useState(false); // <-- Add state for feedback

  // Placeholder for available Ollama models
  const availableModels = ['llama3', 'mistral', 'codegemma', 'phi3'];

  // Placeholder function for handling settings acceptance
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
    });

    // Set accepted state to true for visual feedback
    setIsAccepted(true);

    // Reset the feedback state after a short delay (e.g., 1500ms)
    setTimeout(() => {
      setIsAccepted(false);
    }, 1500);

    // Add logic here to actually save/apply the settings
  };

  return (
    <div className="space-y-6">
      {/* --- Section 1: Worker 1 Config --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Worker 1 Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text mb-3">Worker 1 Name</span>
          </label>
          <input
            type="text"
            value={worker1Name}
            onChange={(e) => setWorker1Name(e.target.value)}
            className="input input-sm input-bordered w-full"
            aria-label="Worker 1 Name"
          />
        </div>
        {/* Worker 1 Model */}
        <div className="form-control">
          <label className="label">
            <span className="label-text mb-3">Worker 1 Model</span>
          </label>
          <select
            className="select select-sm select-bordered w-full"
            value={worker1Model}
            onChange={(e) => setWorker1Model(e.target.value)}
            aria-label="Worker 1 Model"
          >
            <option value="" disabled>Select Model</option>
            {availableModels.map(model => (
              <option key={`w1-${model}`} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Section 2: Worker 2 Config --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Worker 2 Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text mb-3">Worker 2 Name</span>
          </label>
          <input
            type="text"
            value={worker2Name}
            onChange={(e) => setWorker2Name(e.target.value)}
            className="input input-sm input-bordered w-full"
            aria-label="Worker 2 Name"
          />
        </div>
        {/* Worker 2 Model */}
        <div className="form-control">
          <label className="label">
            <span className="label-text mb-3">Worker 2 Model</span>
          </label>
          <select
            className="select select-sm select-bordered w-full"
            value={worker2Model}
            onChange={(e) => setWorker2Model(e.target.value)}
            aria-label="Worker 2 Model"
          >
            <option value="" disabled>Select Model</option>
            {availableModels.map(model => (
              <option key={`w2-${model}`} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Section 3: Turns & Summary --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-t border-base-content/10 pt-6">
        {/* Turns Control */}
        <div className="form-control">
          <label className="label mr-3">
            <span className="label-text">Turns</span>
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
            <span className="label-text">Summary Turn</span>
            <input
              type="checkbox"
              checked={requestSummary}
              onChange={(e) => setRequestSummary(e.target.checked)}
              className="checkbox checkbox-sm"
              aria-label="Request summary turn"
            />
          </label>
        </div>
      </div>

      {/* --- Section 4: API Keys --- */}
      <div className="space-y-4 border-t border-base-content/10 pt-6">
        {/* API Key 1 Input */}
        <div className="form-control w-full mb-8">
          <label className="label">
            <span className="label-text mb-3">API Key 1 (Optional)</span>
          </label>
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

        {/* API Key 2 Input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-3">API Key 2 (Optional)</span>
          </label>
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
      </div>

      {/* --- Section 5: Accept Button --- */}
      <div className="pt-6 border-t border-base-content/10">
        <button
          type="button"
          // Conditionally apply btn-success class
          className={`btn w-full ${isAccepted ? 'btn-success' : 'btn-primary'} text-white`}
          onClick={handleAcceptSettings}
        >
          {/* Optionally change text on accept */}
          {isAccepted ? 'Settings Accepted!' : 'Accept Collaboration Settings'}
        </button>
      </div>

    </div>
  );
};

export default CollaborationSettings;