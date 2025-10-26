import React, { useState } from 'react';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: string[];
  activeApiKey: string | null;
  onAddKeys: (keys: string[]) => Promise<{ added: string[]; failed: string[] }>;
  onDeleteKey: (key: string) => void;
  onSetActiveKey: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, apiKeys, activeApiKey, onAddKeys, onDeleteKey, onSetActiveKey }) => {
  const [newKeysInput, setNewKeysInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddClick = async () => {
    const keysToAdd = newKeysInput.split(/[\n, ]+/).map(k => k.trim()).filter(Boolean);
    if (keysToAdd.length === 0) {
      setFeedbackMessage('Vui lòng nhập ít nhất một API key.');
      return;
    }

    setIsProcessing(true);
    setFeedbackMessage(null);

    const { added, failed } = await onAddKeys(keysToAdd);
    
    let message = '';
    if (added.length > 0) {
      message += `Đã thêm thành công ${added.length} key. `;
    }
    if (failed.length > 0) {
      message += `Không thể xác thực ${failed.length} key. Vui lòng kiểm tra lại.`;
    }
    setFeedbackMessage(message);

    setIsProcessing(false);
    setNewKeysInput('');
  };

  const maskKey = (key: string) => `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl text-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quản lý API Keys</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Keys Section */}
        <div className="mb-6">
          <label htmlFor="key-input" className="block text-sm font-medium text-gray-300 mb-2">Thêm API key mới</label>
          <p className="text-xs text-gray-400 mb-2">Bạn có thể dán nhiều key, mỗi key trên một dòng hoặc cách nhau bằng dấu phẩy/khoảng trắng.</p>
          <textarea
            id="key-input"
            rows={4}
            value={newKeysInput}
            onChange={(e) => setNewKeysInput(e.target.value)}
            disabled={isProcessing}
            placeholder="Dán API key của bạn vào đây..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
          />
          <button
            onClick={handleAddClick}
            disabled={isProcessing || newKeysInput.trim() === ''}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Đang xác thực...</span>
              </>
            ) : "Thêm và Xác thực Keys"}
          </button>
          {feedbackMessage && <p className="text-sm text-yellow-300 mt-2 text-center">{feedbackMessage}</p>}
        </div>

        {/* Key List Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-300 mb-3">API Keys đã lưu</h3>
          <div className="max-h-60 overflow-y-auto bg-gray-900/50 p-2 rounded-lg flex flex-col gap-2">
            {apiKeys.length > 0 ? apiKeys.map(key => (
              <div key={key} className={`flex items-center justify-between p-3 rounded-md ${activeApiKey === key ? 'bg-green-600/20 border border-green-500' : 'bg-gray-700/50'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                   {activeApiKey === key ? (
                     <span className="text-xs flex-shrink-0 font-bold text-green-400 bg-green-900 px-2 py-1 rounded-full">ĐANG DÙNG</span>
                   ) : (
                     <button 
                       onClick={() => onSetActiveKey(key)}
                       className="text-xs flex-shrink-0 font-semibold text-blue-300 bg-blue-900 px-2 py-1 rounded-full hover:bg-blue-800 transition-colors"
                     >
                       SỬ DỤNG
                     </button>
                   )}
                  <span className="font-mono text-sm text-gray-400 truncate">{maskKey(key)}</span>
                </div>
                <button
                  onClick={() => onDeleteKey(key)}
                  className="p-1.5 flex-shrink-0 rounded-full text-gray-400 hover:bg-red-600/50 hover:text-white transition-colors"
                  aria-label="Xóa key"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-4">Chưa có API key nào được lưu.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
