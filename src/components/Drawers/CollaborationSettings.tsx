import React from "react";

interface CollaborationSettingsProps {
  worker1Name: string;
  setWorker1Name: React.Dispatch<React.SetStateAction<string>>;
  worker1Model: string;
  setWorker1Model: React.Dispatch<React.SetStateAction<string>>;
  worker2Name: string;
  setWorker2Name: React.Dispatch<React.SetStateAction<string>>;
  worker2Model: string;
  setWorker2Model: React.Dispatch<React.SetStateAction<string>>;
  availableModels: string[];
  api1Provider: string;
  setApi1Provider: React.Dispatch<React.SetStateAction<string>>;
  api2Provider: string;
  setApi2Provider: React.Dispatch<React.SetStateAction<string>>;
  turns: number;
  setTurns: React.Dispatch<React.SetStateAction<number>>;
  requestSummary: boolean;
  setRequestSummary: React.Dispatch<React.SetStateAction<boolean>>;
  apiKey1: string;
  setApiKey1: React.Dispatch<React.SetStateAction<string>>;
  apiKey2: string;
  setApiKey2: React.Dispatch<React.SetStateAction<string>>;
  isLoadingModels: boolean;
  resumeOnInterjection: boolean;
  setResumeOnInterjection: React.Dispatch<React.SetStateAction<boolean>>;
  summaryModel: string;
  setSummaryModel: React.Dispatch<React.SetStateAction<string>>;
}

const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  worker1Name,
  setWorker1Name,
  worker1Model,
  setWorker1Model,
  worker2Name,
  setWorker2Name,
  worker2Model,
  setWorker2Model,
  availableModels = [],
  api1Provider,
  setApi1Provider,
  api2Provider,
  setApi2Provider,
  turns,
  setTurns,
  requestSummary,
  setRequestSummary,
  apiKey1,
  setApiKey1,
  apiKey2,
  setApiKey2,
  isLoadingModels,
  resumeOnInterjection,
  setResumeOnInterjection,
  summaryModel,
  setSummaryModel,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Worker 1 Settings */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 1 Name</span>
        </label>
        <input
          type="text"
          value={worker1Name}
          onChange={(e) => setWorker1Name(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Worker 1"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 1 Model</span>
        </label>
        <select
          value={worker1Model}
          onChange={(e) => setWorker1Model(e.target.value)}
          className="select select-bordered w-full"
          disabled={isLoadingModels || availableModels.length === 0}
        >
          {isLoadingModels ? (
            <option>Loading models...</option>
          ) : availableModels.length === 0 ? (
            <option>No models available</option>
          ) : (
            availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 1 API Provider</span>
        </label>
        <input
          type="text"
          value={api1Provider}
          onChange={(e) => setApi1Provider(e.target.value)}
          className="input input-bordered w-full"
          placeholder="API Provider"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 1 API Key</span>
        </label>
        <input
          type="password"
          value={apiKey1}
          onChange={(e) => setApiKey1(e.target.value)}
          className="input input-bordered w-full"
          placeholder="API Key"
        />
      </div>

      {/* Worker 2 Settings */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 2 Name</span>
        </label>
        <input
          type="text"
          value={worker2Name}
          onChange={(e) => setWorker2Name(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Worker 2"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 2 Model</span>
        </label>
        <select
          value={worker2Model}
          onChange={(e) => setWorker2Model(e.target.value)}
          className="select select-bordered w-full"
          disabled={isLoadingModels || availableModels.length === 0}
        >
          {isLoadingModels ? (
            <option>Loading models...</option>
          ) : availableModels.length === 0 ? (
            <option>No models available</option>
          ) : (
            availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 2 API Provider</span>
        </label>
        <input
          type="text"
          value={api2Provider}
          onChange={(e) => setApi2Provider(e.target.value)}
          className="input input-bordered w-full"
          placeholder="API Provider"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Worker 2 API Key</span>
        </label>
        <input
          type="password"
          value={apiKey2}
          onChange={(e) => setApiKey2(e.target.value)}
          className="input input-bordered w-full"
          placeholder="API Key"
        />
      </div>

      {/* Turn Settings */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Number of Turns</span>
        </label>
        <input
          type="number"
          value={turns}
          onChange={(e) => setTurns(Number(e.target.value))}
          className="input input-bordered w-full"
          min="1"
        />
      </div>

      {/* Summary Settings */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Request Summary</span>
          <input
            type="checkbox"
            checked={requestSummary}
            onChange={(e) => setRequestSummary(e.target.checked)}
            className="checkbox checkbox-primary"
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Summary Model</span>
        </label>
        <select
          value={summaryModel}
          onChange={(e) => setSummaryModel(e.target.value)}
          className="select select-bordered w-full"
          disabled={isLoadingModels || availableModels.length === 0}
        >
          {isLoadingModels ? (
            <option>Loading models...</option>
          ) : availableModels.length === 0 ? (
            <option>No models available</option>
          ) : (
            availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Pause/Resume Settings */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Resume on Interjection</span>
          <input
            type="checkbox"
            checked={resumeOnInterjection}
            onChange={(e) => setResumeOnInterjection(e.target.checked)}
            className="checkbox checkbox-primary"
          />
        </label>
      </div>
    </div>
  );
};

export default CollaborationSettings;