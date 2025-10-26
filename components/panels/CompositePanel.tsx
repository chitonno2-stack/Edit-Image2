import React, { useRef } from 'react';
import Slider from '../shared/Slider';
import Switch from '../shared/Switch';
import PanelSection from './PanelSection';
import AiEngineSelector from './AiEngineSelector';
import { AiProvider } from '../../types';

interface CompositePanelProps {
  settings: {
    provider: AiProvider;
    model: string;
    lightMatch: number;
    colorTempMatch: number;
    smartShadows: boolean;
    grainMatch: boolean;
    focusMatch: boolean;
    perspectiveMatch: boolean;
  };
  onSettingsChange: (newSettings: Partial<CompositePanelProps['settings']>) => void;
  onBackgroundImageUpload: (file: File) => void;
  backgroundImage: string | null;
}


const BackgroundUpload: React.FC<{ onUpload: (file: File) => void; image: string | null; disabled?: boolean }> = ({ onUpload, image, disabled = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    const handleClick = () => {
        if(disabled) return;
        fileInputRef.current?.click();
    };

    return (
        <div onClick={handleClick} className={`cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={disabled}
            />
            {image ? (
                <div className="relative group">
                    <img src={image} alt="Background" className="w-full rounded-lg object-cover h-24" />
                    {!disabled && (
                      <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <p className="text-white text-sm font-semibold">Thay đổi ảnh nền</p>
                      </div>
                    )}
                </div>
            ) : (
                <div className={`w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center ${!disabled ? 'hover:border-blue-500 hover:bg-gray-800/50 transition-all' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    <p className="text-xs text-gray-400">Tải ảnh nền</p>
                </div>
            )}
        </div>
    );
}

const CompositePanel: React.FC<CompositePanelProps> = ({ settings, onSettingsChange, onBackgroundImageUpload, backgroundImage }) => {
  const isGemini = settings.provider === AiProvider.GEMINI;
  
  return (
    <div className="flex flex-col gap-4">
      <PanelSection title="AI Engine">
        <AiEngineSelector 
          provider={settings.provider}
          model={settings.model}
          onSettingsChange={onSettingsChange}
        />
      </PanelSection>

      <div className={!isGemini ? 'opacity-50 pointer-events-none' : ''}>
        <PanelSection title="Ảnh Nền">
          <BackgroundUpload onUpload={onBackgroundImageUpload} image={backgroundImage} disabled={!isGemini} />
          {!isGemini && (
            <div className="text-xs bg-yellow-800/30 border border-yellow-500 text-yellow-300 p-2 rounded-lg mt-2">
              Lồng ghép chỉ hỗ trợ với Gemini. OpenAI sẽ tạo ảnh mới từ mô tả.
            </div>
          )}
        </PanelSection>
        <PanelSection title="Phân Tích Ánh Sáng Nền">
          <div className="text-sm bg-green-800/30 border border-green-500 text-green-300 p-2 rounded text-center">
          ✅ Đã tạo Bản đồ Môi trường HDR
          </div>
        </PanelSection>
        <PanelSection title="Hòa Trộn Ánh Sáng & Bóng Đổ">
          <Slider 
            label="Cường độ ánh sáng khớp" 
            value={settings.lightMatch} 
            setValue={(v) => onSettingsChange({ lightMatch: v })} 
            tooltip="Điều chỉnh mức độ mà ánh sáng trên chủ thể khớp với ánh sáng từ môi trường nền."
          />
          <Slider 
            label="Nhiệt độ màu khớp" 
            value={settings.colorTempMatch} 
            setValue={(v) => onSettingsChange({ colorTempMatch: v })} 
            tooltip="Đồng bộ tông màu (ấm/lạnh) của chủ thể với tông màu của ảnh nền để tạo sự hài hòa."
          />
          <Switch 
            label="Tạo bóng đổ thông minh" 
            enabled={settings.smartShadows} 
            setEnabled={(e) => onSettingsChange({ smartShadows: e })}
            tooltip="AI sẽ tự động phân tích nguồn sáng trong ảnh nền và tạo ra bóng đổ thực tế cho chủ thể."
          />
        </PanelSection>
        <PanelSection title="Hòa Hợp Chi Tiết">
          <Switch 
            label="Đồng bộ Nhiễu hạt" 
            enabled={settings.grainMatch} 
            setEnabled={(e) => onSettingsChange({ grainMatch: e })} 
            tooltip="Thêm một lớp nhiễu hạt (grain) lên chủ thể để khớp với nhiễu hạt có trong ảnh nền, giúp ảnh trông liền mạch hơn."
          />
          <Switch 
            label="Đồng bộ Độ nét" 
            enabled={settings.focusMatch} 
            setEnabled={(e) => onSettingsChange({ focusMatch: e })} 
            tooltip="Điều chỉnh độ sắc nét của chủ thể để phù hợp với độ sâu trường ảnh (focus) của nền."
          />
          <Switch 
            label="Đồng bộ Phối cảnh" 
            enabled={settings.perspectiveMatch} 
            setEnabled={(e) => onSettingsChange({ perspectiveMatch: e })}
            tooltip="Tự động điều chỉnh phối cảnh và tỷ lệ của chủ thể để khớp với phối cảnh của ảnh nền."
          />
          <button className="w-full text-sm bg-gray-700 hover:bg-gray-600 rounded py-2 transition-colors">
            Tinh chỉnh Phối cảnh...
          </button>
        </PanelSection>
      </div>
    </div>
  );
};

export default CompositePanel;