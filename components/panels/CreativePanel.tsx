import React, { useState, useEffect, useRef } from 'react';
import PanelSection from './PanelSection';
import { BACKGROUND_SUGGESTIONS } from '../../constants';
import Switch from '../shared/Switch';
import Slider from '../shared/Slider';
import AiEngineSelector from './AiEngineSelector';
import { AiProvider } from '../../types';


interface CreativePanelProps {
  settings: {
    provider: AiProvider;
    model: string;
    subjectIsolated: boolean;
    backgroundPrompt: string;
    fullBodyPrompt: string;
  };
  onSettingsChange: (newSettings: Partial<CreativePanelProps['settings']>) => void;
  onGenerate: (prompt: string) => void;
  onReferenceImageUpload: (file: File) => void;
  referenceImage: string | null;
  isMasking: boolean;
  onToggleMasking: () => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const ReferenceImageUpload: React.FC<{ onUpload: (file: File) => void; image: string | null; disabled?: boolean }> = ({ onUpload, image, disabled = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    const handleClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    return (
        <div onClick={handleClick} className={`cursor-pointer mt-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            {image ? (
                <div className="relative group">
                    <img src={image} alt="Reference" className="w-full rounded-lg object-cover h-24" />
                     {!disabled && (
                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <p className="text-white text-sm font-semibold">Thay đổi ảnh tham chiếu</p>
                        </div>
                     )}
                </div>
            ) : (
                <div className={`w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center  ${!disabled ? 'hover:border-blue-500 hover:bg-gray-800/50 transition-all' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    <p className="text-xs text-gray-400">Tải ảnh tham chiếu</p>
                    <p className="text-xs text-gray-500">(vd: quần áo, vật thể...)</p>
                </div>
            )}
        </div>
    );
}

const CreativePanel: React.FC<CreativePanelProps> = ({ 
    settings, onSettingsChange, onGenerate, onReferenceImageUpload, referenceImage,
    isMasking, onToggleMasking, brushSize, onBrushSizeChange
}) => {

  const [currentBackgroundSuggestions, setCurrentBackgroundSuggestions] = useState<string[]>([]);
  const isGemini = settings.provider === AiProvider.GEMINI;
  const isDalle2 = settings.provider === AiProvider.OPENAI && settings.model === 'dall-e-2';

  const loadNewSuggestions = () => {
      const shuffled = [...BACKGROUND_SUGGESTIONS].sort(() => 0.5 - Math.random());
      setCurrentBackgroundSuggestions(shuffled.slice(0, 20));
  };

  useEffect(() => {
      loadNewSuggestions();
  }, []);

  const handleStudioSwapGenerate = () => {
    onGenerate("STUDIO_SWAP");
  };

  const handleFullBodyGenerate = () => {
    onGenerate("FULL_BODY_GENERATION");
  }

  return (
    <div className="flex flex-col gap-6">
       <PanelSection title="AI Engine">
        <AiEngineSelector 
          provider={settings.provider}
          model={settings.model}
          onSettingsChange={onSettingsChange}
        />
      </PanelSection>

      {/* --- WORKFLOW : MASKING --- */}
      <PanelSection title="Công Cụ: Khóa Vùng / Sửa Vùng (Inpaint)">
        <div className="text-xs text-gray-400 -mt-2 mb-2">
            {isDalle2 ? 'Tô vào vùng cần AI vẽ lại theo mô tả.' : 'Bảo vệ các vùng quan trọng khỏi sự thay đổi của AI.'}
        </div>
        <Switch 
          label={isDalle2 ? 'Bật chế độ sửa vùng' : 'Bật chế độ khóa vùng'}
          enabled={isMasking}
          setEnabled={onToggleMasking}
          tooltip={isDalle2 ? 'Tô vào các vùng bạn muốn AI vẽ lại. Chỉ hoạt động với ảnh gốc.' : 'Tô lên các vùng bạn muốn AI giữ nguyên 100%.'}
        />
        {isMasking && (
           <Slider 
             label="Kích thước cọ"
             value={brushSize}
             setValue={onBrushSizeChange}
             min={10}
             max={100}
             step={5}
           />
        )}
         {isMasking && !isDalle2 && (
            <div className="text-xs bg-yellow-800/30 border border-yellow-500 text-yellow-300 p-2 rounded-lg">
              Tính năng này hoạt động tốt nhất với Gemini hoặc DALL-E 2. Các mô hình khác có thể không tuân thủ vùng khóa.
            </div>
          )}
      </PanelSection>
      
      <div className="text-center font-bold text-lg text-white -mt-2 -mb-2">
        TÁI TẠO SIÊU PHÀM
      </div>

      {/* --- WORKFLOW 1: FULL-BODY GENERATION --- */}
      <PanelSection title="Quy Trình 1: Mở Rộng Toàn Thân">
         <div className="text-xs text-gray-400 -mt-2 mb-2">Vẽ tiếp phần còn lại của nhân vật với chất lượng 8K sắc nét và chi tiết.</div>
        
        <div className={`text-sm p-3 rounded-lg text-center font-semibold ${isGemini ? 'bg-green-800/30 border border-green-500 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
            {isGemini ? '✅ Khóa Danh Tính 100% & Kích hoạt Tái Tạo 8K' : 'Chỉ hỗ trợ với Gemini'}
        </div>

        <input
            type="text"
            placeholder='Mô tả, vd: "mặc vest đen, đứng khoanh tay"'
            value={settings.fullBodyPrompt}
            onChange={(e) => onSettingsChange({ fullBodyPrompt: e.target.value })}
            className="w-full bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <ReferenceImageUpload onUpload={onReferenceImageUpload} image={referenceImage} disabled={!isGemini} />

        <button 
          onClick={handleFullBodyGenerate}
          disabled={!isGemini}
          className="w-full mt-2 font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg py-3 transition-colors text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          ✨ Tái Tạo Toàn Thân
        </button>

      </PanelSection>

      {/* --- WORKFLOW 2: STUDIO SWAP --- */}
      <PanelSection title="Quy Trình 2: Thay Đổi Bối Cảnh (Studio Swap)">
        <div className={`transition-opacity ${!isGemini ? 'opacity-50 pointer-events-none' : ''}`}>
          {!settings.subjectIsolated ? (
            <>
              <div className="text-xs text-gray-400 -mt-2 mb-2">Tách chủ thể khỏi nền với chi tiết tóc 100% và ghép vào bối cảnh mới một cách siêu thực.</div>
              <button
                  onClick={() => onSettingsChange({ subjectIsolated: true })}
                  className="w-full font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg py-3 transition-colors text-white"
              >
                  Bước 1: Tách Nền Siêu Chi Tiết
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-300 mb-2">Bước 1: Tách Nền</h4>
                  <div className="text-sm bg-green-800/30 border border-green-500 text-green-300 p-3 rounded-lg text-center font-semibold">
                      ✅ Đã tách chủ thể (Generative Matting)
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-300 mb-2">Bước 2: Tái Tạo Bối Cảnh</h4>
                  <div className="flex items-center gap-2">
                    <select
                        value={settings.backgroundPrompt}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                                onSettingsChange({ backgroundPrompt: value });
                            }
                        }}
                        className="flex-grow w-full bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Gợi ý bối cảnh --</option>
                        {currentBackgroundSuggestions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={loadNewSuggestions} className="p-2 flex-shrink-0 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors" aria-label="Tải gợi ý mới">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.696v4.992h-4.992" />
                      </svg>
                    </button>
                  </div>
                  <input
                      type="text"
                      placeholder='Hoặc nhập bối cảnh tùy chỉnh...'
                      value={settings.backgroundPrompt}
                      onChange={(e) => onSettingsChange({ backgroundPrompt: e.target.value })}
                      className="w-full bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-gray-300 mb-2">Bước 3: Lồng Ghép Siêu Thực</h4>
                  <button
                      onClick={handleStudioSwapGenerate}
                      className="w-full font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-lg py-3 transition-all text-white shadow-lg"
                  >
                      🚀 Thực thi Lồng ghép
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </PanelSection>
      
    </div>
  );
};

export default CreativePanel;