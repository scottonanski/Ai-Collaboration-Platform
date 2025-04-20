import React, { memo, useRef, useEffect } from 'react';

interface WorkerFormProps {
  workerName: string;
  setWorkerName: React.Dispatch<React.SetStateAction<string>>;
  workerModel: string;
  setWorkerModel: React.Dispatch<React.SetStateAction<string>>;
  availableModels: string[];
  isLoadingModels: boolean;
  workerId: string;
  workerLabel: string;
}

const WorkerForm: React.FC<WorkerFormProps> = memo(
  ({
    workerName,
    setWorkerName,
    workerModel,
    setWorkerModel,
    availableModels,
    isLoadingModels,
    workerId,
    workerLabel,
  }) => {
    const isNameEmpty = workerName.trim() === '';
    const detailsRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (!detailsRef.current || !detailsRef.current.open) return;

        const target = event.target as Node;
        const isClickInside = detailsRef.current.contains(target);

        if (!isClickInside) {
          detailsRef.current.open = false;
        }
      };

      const handleSummaryClick = (event: MouseEvent) => {
        event.stopPropagation();
      };

      document.addEventListener('mousedown', handleOutsideClick);
      const summary = detailsRef.current?.querySelector('summary');
      if (summary) {
        summary.addEventListener('click', handleSummaryClick);
      }

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        if (summary) {
          summary.removeEventListener('click', handleSummaryClick);
        }
      };
    }, []);

    return (
      <section
        role="region"
        aria-labelledby={`${workerId}-config-heading`}
        className="flex flex-col gap-6"
      >
        <h3 id={`${workerId}-config-heading`} className="sr-only">
          {workerLabel} Configuration
        </h3>
        <div className={`${workerId} form-control flex flex-col gap-6 md:flex-row md:gap-8`}>
          <div className="flex-1">
            <label className="label">
              <span className="text-sm label-text">{workerLabel} Name</span>
              {isNameEmpty && (
                <span className="text-sm text-error ml-2">Required</span>
              )}
            </label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className={`input input-sm w-full ${isNameEmpty ? 'input-error' : ''}`}
              aria-label={`${workerLabel} Name`}
              aria-invalid={isNameEmpty}
              aria-describedby={isNameEmpty ? `${workerId}-name-error` : undefined}
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="text-sm label-text">{workerLabel} Model</span>
            </label>
            <details className="dropdown w-full" ref={detailsRef}>
              <summary
                className={`btn btn-sm text-left w-full ${
                  isLoadingModels || availableModels.length === 0 ? 'btn-disabled' : ''
                }`}
                aria-label={`Select ${workerLabel} Model, current selection: ${workerModel || 'None'}`}
              >
                {isLoadingModels ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : workerModel || (availableModels.length === 0 ? 'No models available' : 'Select Model')}
              </summary>
              {!isLoadingModels && availableModels.length > 0 ? (
                <ul
                  className="flex flex-col dropdown-content bg-zinc-900 z-20 w-full shadow-lg mt-1 overflow-y-auto overflow-x-hidden max-h-[200px]"
                  role="menu"
                  aria-label={`${workerLabel} Model Options`}
                >
                  {availableModels.map((model) => (
                    <li key={`${workerId}-${model}`} role="menuitem" className="w-full">
                      <a
                        href="#"
                        className="block text-ellipsis text-sm overflow-hidden whitespace-nowrap my-1 p-1 pl-3 hover:bg-amber-800 transition-colors duration-200 ease-in-out"
                        onClick={(e) => {
                          e.preventDefault();
                          setWorkerModel(model);
                          const details = e.currentTarget.closest('details');
                          if (details) details.open = false;
                        }}
                      >
                        {model}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </details>
            {!workerModel && !isLoadingModels && availableModels.length > 0 && (
              <span className="text-xs text-gray-500 mt-2">
                Select a model to proceed
              </span>
            )}
          </div>
        </div>
      </section>
    );
  }
);

export default WorkerForm;