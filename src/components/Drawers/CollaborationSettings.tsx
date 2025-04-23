import React, { Dispatch, SetStateAction, useEffect } from 'react';
import WorkerForm from '../WorkerForm/WorkerForm';
import ApiKeyForm from '../ApiKeyForm/ApiKeyForm';


interface CollaborationSettingsProps {
  worker1Name: string;
  setWorker1Name: Dispatch<SetStateAction<string>>;
  worker1Model: string;
  setWorker1Model: Dispatch<SetStateAction<string>>;
  worker2Name: string;
  setWorker2Name: Dispatch<SetStateAction<string>>;
  worker2Model: string;
  setWorker2Model: Dispatch<SetStateAction<string>>;
  availableModels: string[];
  api1Provider: string;
  setApi1Provider: Dispatch<SetStateAction<string>>;
  api2Provider: string;
  setApi2Provider: Dispatch<SetStateAction<string>>;
  turns: number;
  setTurns: Dispatch<SetStateAction<number>>;

  requestSummary: boolean;
  setRequestSummary: Dispatch<SetStateAction<boolean>>;
  apiKey1: string;
  setApiKey1: Dispatch<SetStateAction<string>>;
  apiKey2: string;
  setApiKey2: Dispatch<SetStateAction<string>>;
  isLoadingModels: boolean;
  resumeOnInterjection: boolean;
  setResumeOnInterjection: Dispatch<SetStateAction<boolean>>;
  summaryModel: string;
  setSummaryModel: Dispatch<SetStateAction<string>>;
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
  availableModels,
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
  useEffect(() => {
    // Debug logging removed for production cleanliness
  }, [isLoadingModels, availableModels, worker1Model, worker2Model]);

  return (
    <div className="collaboration-settings flex flex-col gap-4">
      <WorkerForm
        workerId="worker1"
        workerLabel="Worker 1"
        workerName={worker1Name}
        setWorkerName={setWorker1Name}
        workerModel={worker1Model}
        setWorkerModel={setWorker1Model}
        availableModels={availableModels}
        isLoadingModels={isLoadingModels}
      />

      <ApiKeyForm
        apiProvider={api1Provider}
        setApiProvider={setApi1Provider}
        apiKey={apiKey1}
        setApiKey={setApiKey1}
        apiProviders={["ollama", "openai"]}
        label="Worker 1 API Key"
        ariaLabel="Worker 1 API Key"
      />

      <WorkerForm
        workerId="worker2"
        workerLabel="Worker 2"
        workerName={worker2Name}
        setWorkerName={setWorker2Name}
        workerModel={worker2Model}
        setWorkerModel={setWorker2Model}
        availableModels={availableModels}
        isLoadingModels={isLoadingModels}
      />

      <ApiKeyForm
        apiProvider={api2Provider}
        setApiProvider={setApi2Provider}
        apiKey={apiKey2}
        setApiKey={setApiKey2}
        apiProviders={["ollama", "openai"]}
        label="Worker 2 API Key"
        ariaLabel="Worker 2 API Key"
      />

      <div className="form-control">
        <label className="cursor-pointer label">
          <span className="label-text">Request Summary</span>
          <input
            type="checkbox"
            checked={requestSummary}
            onChange={(e) => setRequestSummary(e.target.checked)}
            className="checkbox"
            aria-label="Request Summary"
          />
        </label>
      </div>

      {requestSummary && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Summary Model</span>
          </label>
          {isLoadingModels ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span>Loading models...</span>
            </div>
          ) : availableModels.length > 0 ? (
            <select
              value={summaryModel}
              onChange={(e) => setSummaryModel(e.target.value)}
              className="select select-bordered w-full text-base-content"
              aria-label="Summary Model"
            >
              <option value="" disabled>
                Select a model
              </option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-error">No models available. Please check your connection.</p>
          )}
        </div>
      )}

      <div className="form-control">
        <label className="cursor-pointer label">
          <span className="label-text">Resume on Interjection</span>
          <input
            type="checkbox"
            checked={resumeOnInterjection}
            onChange={(e) => setResumeOnInterjection(e.target.checked)}
            className="checkbox"
            aria-label="Resume on Interjection"
          />
        </label>
      </div>
    </div>
  );
};

export default CollaborationSettings;