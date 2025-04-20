import React, { memo } from 'react';
import { Key } from 'lucide-react';

interface ApiKeyFormProps {
  apiProvider: string;
  setApiProvider: React.Dispatch<React.SetStateAction<string>>;
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  apiProviders: string[];
  label: string;
  ariaLabel: string;
  extraClass?: string;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = memo(
  ({ apiProvider, setApiProvider, apiKey, setApiKey, apiProviders, label, ariaLabel, extraClass }) => {
    return (
      <div className={`form-control w-full ${extraClass || ''}`}>
        <label className="label">
          <span className="text-sm label-text mb-5">{label}</span>
        </label>
        <div className="flex gap-4 mb-4">
          {apiProviders.map((provider) => (
            <label
              key={provider}
              className="flex items-center gap-2 cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 peer-checked:text-zinc-100"
            >
              <input
                type="radio"
                name={`api-provider-${label.replace(/\s+/g, '-')}`}
                checked={apiProvider === provider}
                onChange={() => setApiProvider(provider)}
                className="radio radio-sm peer"
                aria-label={`${provider} provider for ${ariaLabel}`}
              />
              <span>{provider}</span>
            </label>
          ))}
        </div>
        <label className="input input-bordered input-sm flex items-center gap-2 w-full">
          <Key size={16} className="opacity-70" />
          <input
            type="password"
            className="grow w-full"
            placeholder={label}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            aria-label={ariaLabel}
          />
        </label>
      </div>
    );
  }
);

export default ApiKeyForm;