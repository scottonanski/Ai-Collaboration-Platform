import React from 'react';
import WorkerForm from '../WorkerForm/WorkerForm';
import ApiKeyForm from '../ApiKeyForm/ApiKeyForm';

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
  isLoadingModels?: boolean;
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
  isLoadingModels = false,
}) => {
  const apiProviders = ['OpenAI', 'Google', 'Anthropic'];

  return (
    <div className="flex flex-col h-full w-full">
      <div
        className="flex-1 overflow-y-auto p-5"
        tabIndex={0}
        aria-label="Collaboration Settings Options"
      >
        {/* Worker One Configuration */}
        <section className="flex gap-6 mb-10">
          <WorkerForm
            workerName={worker1Name}
            setWorkerName={setWorker1Name}
            workerModel={worker1Model}
            setWorkerModel={setWorker1Model}
            availableModels={availableModels}
            isLoadingModels={isLoadingModels}
            workerId="worker1"
            workerLabel="Worker 1"
          />
        </section>

        {/* Worker Two Configuration Options */}
        <section className="flex gap-6 mb-10">
          <WorkerForm
            workerName={worker2Name}
            setWorkerName={setWorker2Name}
            workerModel={worker2Model}
            setWorkerModel={setWorker2Model}
            availableModels={availableModels}
            isLoadingModels={isLoadingModels}
            workerId="worker2"
            workerLabel="Worker 2"
          />
        </section>

        {/* Amount of Turns per Model, and Summary Report Turn */}
        <section
          role="region"
          aria-labelledby="turns-summary-heading"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-t border-base-content/10 py-5"
        >
          <h3 id="turns-summary-heading" className="sr-only">
            Turns and Summary Settings
          </h3>
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

        {/* Options for using External APIs (Google, Anthropic, OpenAI) */}
        <section
          role="region"
          aria-labelledby="api-keys-heading"
          className="space-y-4 border-t border-base-content/10 pt-8"
        >
          <h3 id="api-keys-heading" className="sr-only">
            API Keys Configuration
          </h3>
          <ApiKeyForm
            apiProvider={api1Provider}
            setApiProvider={setApi1Provider}
            apiKey={apiKey1}
            setApiKey={setApiKey1}
            apiProviders={apiProviders}
            label="API Key 1 (Optional)"
            ariaLabel="API Key 1"
            extraClass="mb-10"
          />
          <ApiKeyForm
            apiProvider={api2Provider}
            setApiProvider={setApi2Provider}
            apiKey={apiKey2}
            setApiKey={setApiKey2}
            apiProviders={apiProviders}
            label="API Key 2 (Optional)"
            ariaLabel="API Key 2"
          />
        </section>
      </div>
    </div>
  );
};

export default CollaborationSettings;