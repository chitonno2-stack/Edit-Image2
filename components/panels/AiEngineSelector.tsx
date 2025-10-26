import React from 'react';
import { AiProvider } from '../../types';
import { AI_MODELS } from '../../constants';

interface AiEngineSelectorProps {
  provider: AiProvider;
  model: string;
  onSettingsChange: (settings: { provider?: AiProvider; model?: string }) => void;
  disabled?: boolean;
}

const AiEngineSelector: React.FC<AiEngineSelectorProps> = ({ provider, model, onSettingsChange, disabled }) => {
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AiProvider;
    const defaultModelForProvider = AI_MODELS[newProvider][0].value;
    onSettingsChange({ provider: newProvider, model: defaultModelForProvider });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ model: e.target.value });
  };

  const modelsForProvider = AI_MODELS[provider] || [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-gray-300">Nhà cung cấp AI</label>
        <select
          value={provider}
          onChange={handleProviderChange}
          disabled={disabled}
          className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {Object.values(AiProvider).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-300">Mô hình AI</label>
        <select
          value={model}
          onChange={handleModelChange}
          disabled={disabled || modelsForProvider.length <= 1}
          className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {modelsForProvider.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AiEngineSelector;
