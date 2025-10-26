import React from 'react';
import { WORK_MODES } from '../constants';
import type { WorkMode } from '../types';
import type { ModeInfo } from '../types';

interface ControlCenterProps {
  activeMode: WorkMode;
  setActiveMode: (mode: WorkMode) => void;
  isApiKeySet: boolean;
  onSelectApiKey: () => void;
}

const ControlCenter: React.FC<ControlCenterProps> = ({ activeMode, setActiveMode, isApiKeySet, onSelectApiKey }) => {
  return (
    <div className="p-4 flex flex-col gap-2">
      <h1 className="text-xl font-bold text-white mb-4">Ngô Tân AI</h1>
      <nav className="flex flex-col gap-2">
        {WORK_MODES.map((mode: ModeInfo) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
              activeMode === mode.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            {mode.icon}
            <span className="font-semibold">{mode.name}</span>
          </button>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <button
          onClick={onSelectApiKey}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isApiKeySet
              ? 'bg-green-600/20 text-green-300 border border-green-600'
              : 'bg-yellow-600/80 text-white hover:bg-yellow-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
          <span>{isApiKeySet ? 'API Key đã được đặt' : 'Thiết lập API Key'}</span>
        </button>
        {!isApiKeySet && <p className="text-xs text-yellow-400 mt-2 text-center">API Key là bắt buộc để sử dụng AI.</p>}
      </div>
    </div>
  );
};

export default ControlCenter;
