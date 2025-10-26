
import React from 'react';

interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
}

const PanelSection: React.FC<PanelSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex flex-col gap-4 bg-gray-800/50 p-4 rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default PanelSection;
