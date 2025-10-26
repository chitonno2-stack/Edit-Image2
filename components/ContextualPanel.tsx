import React from 'react';
import { WorkMode } from '../types';
import { WORK_MODES } from '../constants';
import PortraitPanel from './panels/PortraitPanel';
import RestorePanel from './panels/RestorePanel';
import CreativePanel from './panels/CreativePanel';
import CompositePanel from './panels/CompositePanel';

interface ContextualPanelProps {
  activeMode: WorkMode;
  settings: any;
  onSettingsChange: (newSettings: any) => void;
  onBackgroundImageUpload: (file: File) => void;
  backgroundImage: string | null;
  onReferenceImageUpload: (file: File) => void;
  referenceImage: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onGenerate: (prompt: string) => void;
  // Masking props
  isMasking: boolean;
  onToggleMasking: () => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const ContextualPanel: React.FC<ContextualPanelProps> = ({ 
  activeMode, 
  settings, 
  onSettingsChange, 
  onBackgroundImageUpload, 
  backgroundImage, 
  onReferenceImageUpload,
  referenceImage,
  isCollapsed, 
  onToggleCollapse, 
  onGenerate,
  isMasking,
  onToggleMasking,
  brushSize,
  onBrushSizeChange
}) => {
  const activeModeInfo = WORK_MODES.find(m => m.id === activeMode);

  const renderPanel = () => {
    switch (activeMode) {
      case WorkMode.PORTRAIT:
        return <PortraitPanel settings={settings} onSettingsChange={onSettingsChange} onGenerate={onGenerate} />;
      case WorkMode.RESTORE:
        return <RestorePanel settings={settings} onSettingsChange={onSettingsChange} />;
      case WorkMode.CREATIVE:
        return <CreativePanel 
                  settings={settings} 
                  onSettingsChange={onSettingsChange} 
                  onGenerate={onGenerate} 
                  onReferenceImageUpload={onReferenceImageUpload}
                  referenceImage={referenceImage}
                  isMasking={isMasking}
                  onToggleMasking={onToggleMasking}
                  brushSize={brushSize}
                  onBrushSizeChange={onBrushSizeChange}
                />;
      case WorkMode.COMPOSITE:
        return <CompositePanel settings={settings} onSettingsChange={onSettingsChange} onBackgroundImageUpload={onBackgroundImageUpload} backgroundImage={backgroundImage} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-gray-700/50">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">{activeModeInfo?.name}</h2>
          <button onClick={onToggleCollapse} className="p-1 rounded-full hover:bg-gray-700 transition-colors" aria-label={isCollapsed ? "Mở rộng bảng điều khiển" : "Thu gọn bảng điều khiển"}>
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
            )}
          </button>
        </div>
        {!isCollapsed && (
          <p className="text-sm text-gray-400 mt-1">{activeModeInfo?.description}</p>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {renderPanel()}
        </div>
      )}
    </div>
  );
};

export default ContextualPanel;