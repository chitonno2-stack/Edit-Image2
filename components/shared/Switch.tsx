
import React from 'react';
import Tooltip from './Tooltip';

interface SwitchProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  tooltip?: string;
}

const Switch: React.FC<SwitchProps> = ({ label, enabled, setEnabled, tooltip }) => {
  const content = (
    <label className="flex items-center justify-between cursor-pointer w-full">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        <div className={`block w-12 h-6 rounded-full transition ${enabled ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  );

  if (tooltip) {
    return <Tooltip text={tooltip}>{content}</Tooltip>;
  }

  return content;
};

export default Switch;
