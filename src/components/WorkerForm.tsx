import React, { Dispatch, SetStateAction } from 'react';

interface WorkerFormProps {
  workerId: string;
  workerLabel: string;
  workerName: string;
  setWorkerName: Dispatch<SetStateAction<string>>;
  workerModel: string;
  setWorkerModel: Dispatch<SetStateAction<string>>;
  availableModels: string[];
  isLoadingModels: boolean;
}

const WorkerForm: React.FC<WorkerFormProps> = ({
  workerId,
  workerLabel,
  workerName,
  setWorkerName,
  workerModel,
  setWorkerModel,
  availableModels,
  isLoadingModels,
}) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{workerLabel} Name</span>
      </label>
      <input
        type="text"
        name={`${workerId}-name`}
        value={workerName}
        onChange={(e) => setWorkerName(e.target.value)}
        className="input input-bordered w-full"
        aria-label={`${workerLabel} Name`}
      />

      <label className="label">
        <span className="label-text">{workerLabel} Model</span>
      </label>
      {isLoadingModels ? (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm"></span>
          <span>Loading models...</span>
        </div>
      ) : availableModels.length > 0 ? (
        <select
          name={`${workerId}-model`}
          value={workerModel}
          onChange={(e) => setWorkerModel(e.target.value)}
          className="select select-bordered w-full text-base-content"
          aria-label={`${workerLabel} Model`}
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
  );
};

export default WorkerForm;