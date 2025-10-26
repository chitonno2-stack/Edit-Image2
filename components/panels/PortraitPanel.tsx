import React from 'react';
import Slider from '../shared/Slider';
import Switch from '../shared/Switch';
import PanelSection from './PanelSection';
import { HAIR_STYLE_SUGGESTIONS, MAKEUP_STYLE_SUGGESTIONS } from '../../constants';

interface PortraitPanelProps {
  settings: {
    targetResolution: string;
    autoSkinTexture: boolean;
    autoHairDetail: boolean;
    autoBalanceLighting: boolean;
    lightStyle: string;
    lightIntensity: number;
    autoBokeh: boolean;
    lensProfile: string;
    backgroundBlur: number;
    chromaticAberration: boolean;
    skinSmoothing: number;
    removeBlemishes: boolean;
    removeWrinkles: boolean;
    removeDarkCircles: boolean;
    makeup: string;
    hair: string;
  };
  onSettingsChange: (newSettings: Partial<PortraitPanelProps['settings']>) => void;
  onGenerate: (prompt: string) => void;
}

const ButtonGroup: React.FC<{ options: {value: string, label: string}[], selected: string, onSelect: (option: string) => void }> = ({ options, selected, onSelect }) => (
    <div className="grid grid-cols-3 gap-2">
        {options.map(option => (
            <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className={`py-2 px-1 text-xs rounded transition-colors ${selected === option.value ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
                {option.label}
            </button>
        ))}
    </div>
);


const PortraitPanel: React.FC<PortraitPanelProps> = ({ settings, onSettingsChange, onGenerate }) => {
  
  const handleInstantRemaster = () => {
    onGenerate("INSTANT_STUDIO_REMASTER");
  }

  const handleApplyStyle = () => {
    let prompt = "Áp dụng các thay đổi phong cách đã chọn.";
    const styles = [];
    if (settings.makeup) styles.push(`phong cách trang điểm "${settings.makeup}"`);
    if (settings.hair) styles.push(`kiểu tóc "${settings.hair}"`);

    if (styles.length > 0) {
      prompt = `Áp dụng ${styles.join(' và ')}.`;
    }
    
    onGenerate(prompt);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="p-2">
        <button 
          onClick={handleInstantRemaster}
          className="w-full font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-lg py-3 transition-all text-white shadow-lg"
        >
          🚀 TÁI TẠO STUDIO TỨC THÌ
        </button>
      </div>

      <PanelSection title="Cốt Lõi: Danh Tính & Chi Tiết">
        <div className="text-sm bg-green-800/30 border border-green-500 text-green-300 font-semibold p-3 rounded-lg text-center">
          ✅ Đã khóa 100% Danh Tính Gốc (3DMM)
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Độ Phân Giải Mục Tiêu</label>
          <ButtonGroup 
            options={[{value: 'original', label: 'Gốc'}, {value: '4K', label: '4K'}, {value: '8K', label: '8K'}]} 
            selected={settings.targetResolution} 
            onSelect={(v) => onSettingsChange({ targetResolution: v })} 
          />
        </div>
        <Switch 
          label="Tự động tái tạo Lỗ Chân Lông"
          enabled={settings.autoSkinTexture}
          setEnabled={(e) => onSettingsChange({ autoSkinTexture: e })}
        />
        <Switch 
          label="Tự động làm nét Sợi Tóc"
          enabled={settings.autoHairDetail}
          setEnabled={(e) => onSettingsChange({ autoHairDetail: e })}
        />
      </PanelSection>

      <PanelSection title="Ánh Sáng Studio Động">
         <div className="text-sm bg-gray-700/80 p-3 rounded-lg">
          <p className="font-bold text-white">Phân Tích Ánh Sáng Gốc:</p>
          <p className="text-xs text-gray-300">Phát hiện: Chói sáng mạnh ở trán, bóng gắt dưới cằm.</p>
        </div>
        <Switch 
          label="Tự Động Cân Bằng"
          enabled={settings.autoBalanceLighting}
          setEnabled={(e) => onSettingsChange({ autoBalanceLighting: e })}
          tooltip="Tự động xóa ánh sáng gốc bị lỗi và chiếu lại bằng ánh sáng studio ảo."
        />
        <div className={`w-full transition-opacity ${settings.autoBalanceLighting ? 'opacity-100' : 'opacity-50'}`}>
            <label className="text-sm font-medium text-gray-300">Kiểu Ánh Sáng</label>
            <select
                value={settings.lightStyle}
                onChange={(e) => onSettingsChange({ lightStyle: e.target.value })}
                disabled={!settings.autoBalanceLighting}
                className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            >
                <option value="3-point">Ánh sáng 3 điểm</option>
                <option value="rim">Ánh sáng ven (Rim Light)</option>
                <option value="butterfly">Ánh sáng Butterfly</option>
            </select>
        </div>
        <Slider 
          label="Cường độ"
          value={settings.lightIntensity}
          setValue={(v) => onSettingsChange({ lightIntensity: v })}
        />
      </PanelSection>
      
      <PanelSection title="Hiệu Ứng Ống Kính">
        <Switch 
          label="Tự động Tách Nền & Xóa Phông"
          enabled={settings.autoBokeh}
          setEnabled={(e) => onSettingsChange({ autoBokeh: e })}
          tooltip="Tạo hiệu ứng chiều sâu trường ảnh (bokeh) chuyên nghiệp."
        />
        <div className={`w-full transition-opacity ${settings.autoBokeh ? 'opacity-100' : 'opacity-50'}`}>
            <label className="text-sm font-medium text-gray-300">Giả Lập Ống Kính</label>
            <select
                value={settings.lensProfile}
                onChange={(e) => onSettingsChange({ lensProfile: e.target.value })}
                disabled={!settings.autoBokeh}
                className="w-full mt-1 bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            >
                <option value="85mm f/1.4">85mm f/1.4 (Mờ ảo)</option>
                <option value="50mm f/1.8">50mm f/1.8 (Tự nhiên)</option>
                <option value="35mm f/2">35mm f/2 (Góc rộng nhẹ)</option>
            </select>
        </div>
        <Slider 
          label="Độ mờ hậu cảnh"
          value={settings.backgroundBlur}
          setValue={(v) => onSettingsChange({ backgroundBlur: v })}
          tooltip="Kiểm soát mức độ xóa phông của hậu cảnh."
        />
        <Switch 
          label="Thêm viền màu nhẹ"
          enabled={settings.chromaticAberration}
          setEnabled={(e) => onSettingsChange({ chromaticAberration: e })}
          tooltip="Thêm một chút lỗi quang học siêu nhỏ, khiến ảnh trông 'thật' hơn."
        />
      </PanelSection>
      
      <PanelSection title="Làm Đẹp & Phong Cách">
        <h4 className="text-sm font-semibold text-gray-300 -mt-1 mb-2">Da Siêu Thực</h4>
        <Slider 
          label="Làm mịn (Tự nhiên)"
          value={settings.skinSmoothing}
          setValue={(v) => onSettingsChange({ skinSmoothing: v })}
          tooltip="Không bao giờ làm bệt da, luôn giữ lại chi tiết."
        />
        <div className="flex flex-col gap-3">
          <Switch label="Xóa Mụn" enabled={settings.removeBlemishes} setEnabled={e => onSettingsChange({ removeBlemishes: e })} />
          <Switch label="Xóa Nếp nhăn" enabled={settings.removeWrinkles} setEnabled={e => onSettingsChange({ removeWrinkles: e })} />
          <Switch label="Xóa Quầng thâm" enabled={settings.removeDarkCircles} setEnabled={e => onSettingsChange({ removeDarkCircles: e })} />
        </div>
        <div className="border-t border-gray-700 my-2"></div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Tùy Chỉnh Phong Cách</h4>
        <div className="flex flex-col gap-3">
          <select 
            value={settings.makeup}
            onChange={(e) => onSettingsChange({ makeup: e.target.value })}
            className="w-full bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          >
            <option value="">-- Chọn phong cách trang điểm --</option>
            {MAKEUP_STYLE_SUGGESTIONS.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
          <select 
            value={settings.hair}
            onChange={(e) => onSettingsChange({ hair: e.target.value })}
            className="w-full bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          >
            <option value="">-- Chọn kiểu tóc --</option>
            {HAIR_STYLE_SUGGESTIONS.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
          <button
            onClick={handleApplyStyle}
            className="w-full mt-2 font-semibold bg-green-600 hover:bg-green-700 rounded-lg py-2 transition-colors text-white"
          >
            Áp Dụng Phong Cách
          </button>
        </div>
      </PanelSection>

    </div>
  );
};

export default PortraitPanel;