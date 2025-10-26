
import React from 'react';
import Tooltip from './Tooltip';

interface SliderProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, setValue, min = 0, max = 100, step = 1, tooltip }) => {
  const content = (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="px-2 py-0.5 bg-gray-700 text-xs rounded-md">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );

  if (tooltip) {
    return <Tooltip text={tooltip}>{content}</Tooltip>;
  }

  return content;
};

export default Slider;
