import React, { Dispatch, SetStateAction, useEffect } from 'react';
import WorkerForm from '../WorkerForm/WorkerForm';

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
  turns: number;
  setTurns: Dispatch<SetStateAction<number>>;
  requestSummary: boolean;
  setRequestSummary: Dispatch<SetStateAction<boolean>>;
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
  turns,
  setTurns,
  requestSummary,
  setRequestSummary,
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
      <div className="form-control">
        <label className="label">
          <span className="label-text">👥 OpenAI Configuration</span>
        </label>
        <p className="text-xs text-base-content/70 mb-4">
          API keys are loaded from environment variables (.env.local)
        </p>
      </div>

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

      <div className="form-control">
        <label className="label">
          <span className="label-text">🔄 Collaboration Turns</span>
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={turns}
          onChange={(e) => setTurns(parseInt(e.target.value) || 1)}
          className="input input-bordered w-full"
          aria-label="Number of collaboration turns"
        />
      </div>

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
            <p className="text-error">No models available. Please check your OpenAI configuration.</p>
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