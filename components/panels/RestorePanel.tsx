import React from 'react';
import Switch from '../shared/Switch';
import PanelSection from './PanelSection';
import AiEngineSelector from './AiEngineSelector';
import { AiProvider } from '../../types';

interface RestorePanelProps {
  settings: {
    provider: AiProvider;
    model: string;
    autoClean: boolean;
    hyperRealSkin: boolean;
    hairAndFabricDetails: boolean;

    resolution: string;
    autoStudioLight: boolean;
    lightStyle: string;
    modernAutoColor: boolean;
    autoWhiteBalance: boolean;
    backgroundProcessing: string;
    studioBackdrop: string;
    context: string;
  };
  onSettingsChange: (newSettings: Partial<RestorePanelProps['settings']>) => void;
}

const ButtonGroup: React.FC<{ options: string[], selected: string, onSelect: (option: string) => void }> = ({ options, selected, onSelect }) => (
    <div className="grid grid-cols-3 gap-2">
        {options.map(option => (
            <button
                key={option}
                onClick={() => onSelect(option)}
                className={`py-2 px-1 text-xs rounded transition-colors ${selected === option ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
                {option}
            </button>
        ))}
    </div>
);


const RestorePanel: React.FC<RestorePanelProps> = ({ settings, onSettingsChange }) => {
  const isGemini = settings.provider === AiProvider.GEMINI;

  return (
    <div className="flex flex-col gap-4">
      <PanelSection title="AI Engine">
        <AiEngineSelector 
          provider={settings.provider}
          model={settings.model}
          onSettingsChange={onSettingsChange}
        />
         {!isGemini && (
            <div className="text-xs bg-yellow-800/30 border border-yellow-500 text-yellow-300 p-2 rounded-lg">
              Chế độ OpenAI/DALL-E sẽ tạo ra một ảnh mới dựa trên mô tả, không phục chế ảnh gốc.
            </div>
          )}
      </PanelSection>

      <div className={!isGemini ? 'opacity-50 pointer-events-none' : ''}>
        <PanelSection title="Bước 1: Phân Tích & Làm Sạch">
          <div className="text-sm bg-gray-700/80 p-3 rounded-lg">
            <p className="font-bold text-white">Trạng thái phân tích:</p>
            <p className="text-xs text-gray-300">AI sẽ tự động quét và xác định các hư tổn như xước, mốc, và nhiễu hạt khi bạn tạo ảnh.</p>
          </div>
          <Switch 
            label="Khử Hư Hỏng & Nhiễu Tự Động"
            enabled={settings.autoClean}
            setEnabled={(e) => onSettingsChange({ autoClean: e })}
            tooltip="Tự động xóa xước, mốc, vết ố và nhiễu hạt để chuẩn bị cho bước tái tạo."
          />
        </PanelSection>

        <PanelSection title="Bước 2: Tái Tạo Cốt Lõi">
          <div className="text-sm bg-green-800/30 border border-green-500 text-green-300 font-semibold p-3 rounded-lg text-center">
            ✅ Đã khóa 100% Danh Tính Gốc (3DMM)
          </div>
          <Switch 
            label="Da Siêu Thực"
            enabled={settings.hyperRealSkin}
            setEnabled={(e) => onSettingsChange({ hyperRealSkin: e })}
            tooltip="Tái tạo chi tiết da thật như lỗ chân lông để có kết quả chân thực nhất."
          />
          <Switch 
            label="Chi Tiết Tóc & Sợi Vải"
            enabled={settings.hairAndFabricDetails}
            setEnabled={(e) => onSettingsChange({ hairAndFabricDetails: e })}
            tooltip="Tạo ra các sợi tóc và kết cấu vải rõ nét, thay thế các vùng bị mờ."
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Độ Phân Giải Đầu Ra</label>
            <ButtonGroup options={['2x', '4K', '8K']} selected={settings.resolution} onSelect={(v) => onSettingsChange({ resolution: v })} />
          </div>
        </PanelSection>

        <PanelSection title="Bước 3: Hoàn Thiện Studio">
          <h4 className="text-sm font-semibold text-gray-300 -mt-1 mb-2">Ánh Sáng Studio</h4>
          <Switch 
            label="Cân Bằng Ánh Sáng Tự Động"
            enabled={settings.autoStudioLight}
            setEnabled={(e) => onSettingsChange({ autoStudioLight: e })}
            tooltip="Xóa bỏ ánh sáng cũ và chiếu sáng lại chủ thể bằng hệ thống ánh sáng studio ảo để tạo chiều sâu."
          />
          <div className="w-full">
              <label className={`text-sm font-medium transition-colors ${settings.autoStudioLight ? 'text-gray-300' : 'text-gray-500'}`}>Kiểu Ánh Sáng</label>
              <select
                  value={settings.lightStyle}
                  onChange={(e) => onSettingsChange({ lightStyle: e.target.value })}
                  disabled={!settings.autoStudioLight}
                  className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <option value="3-point">Ánh sáng 3 điểm</option>
                  <option value="butterfly">Ánh sáng Butterfly</option>
                  <option value="rembrandt">Ánh sáng Rembrandt</option>
                  <option value="original">Giữ ánh sáng gốc</option>
              </select>
          </div>

          <div className="border-t border-gray-700 my-2"></div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Màu Sắc & Nền</h4>
          <Switch 
            label="Tự động lên màu Hiện Đại"
            enabled={settings.modernAutoColor}
            setEnabled={(e) => onSettingsChange({ modernAutoColor: e })}
            tooltip="Tạo ra màu sắc sống động, chính xác như máy ảnh hiện đại, thay vì màu giả cổ."
          />
          <Switch 
            label="Tự động Cân Bằng Trắng"
            enabled={settings.autoWhiteBalance}
            setEnabled={(e) => onSettingsChange({ autoWhiteBalance: e })}
            tooltip="Đảm bảo da có tông màu chuẩn, không bị ám màu."
          />

          <div className="w-full">
              <label className="text-sm font-medium text-gray-300">Xử Lý Nền</label>
              <select
                  value={settings.backgroundProcessing}
                  onChange={(e) => onSettingsChange({ backgroundProcessing: e.target.value })}
                  className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                  <option value="remaster">Tái Tạo Nền Gốc</option>
                  <option value="new_studio">Tạo Nền Studio Mới</option>
              </select>
          </div>
          {settings.backgroundProcessing === 'new_studio' && (
              <div className="w-full">
                  <label className="text-sm font-medium text-gray-300">Kiểu Nền Studio</label>
                  <select
                      value={settings.studioBackdrop}
                      onChange={(e) => onSettingsChange({ studioBackdrop: e.target.value })}
                      className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                      <option value="grey">Phông xám trơn</option>
                      <option value="white">Trắng vô cực</option>
                      <option value="bokeh">Bokeh mờ ảo</option>
                  </select>
              </div>
          )}
        </PanelSection>
      </div>
      
       <PanelSection title="Bối Cảnh Bổ Sung">
        <textarea
          placeholder="Cung cấp bối cảnh (ví dụ: 'Ảnh chụp tại Hà Nội năm 1970', 'Trang phục áo dài truyền thống')..."
          value={settings.context}
          onChange={(e) => onSettingsChange({ context: e.target.value })}
          className="w-full bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
        />
      </PanelSection>

    </div>
  );
};

export default RestorePanel;