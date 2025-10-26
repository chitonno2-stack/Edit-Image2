import React from 'react';
import { TextOverlay } from '../types';

interface TextToolbarProps {
  overlay: TextOverlay;
  onUpdate: (id: string, updates: Partial<TextOverlay>) => void;
  onDelete: (id: string) => void;
}

const fonts = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Impact', 'Comic Sans MS'];

const TextToolbar: React.FC<TextToolbarProps> = ({ overlay, onUpdate, onDelete }) => {
    
  const handleUpdate = (updates: Partial<TextOverlay>) => {
    onUpdate(overlay.id, updates);
  };
    
  return (
    <div 
      className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[500px] bg-gray-800/80 backdrop-blur-md border border-gray-600/50 rounded-lg shadow-2xl p-3 flex flex-col gap-3 z-30 animate-fade-in-up"
      onClick={(e) => e.stopPropagation()} // Prevent deselecting when clicking the toolbar
    >
        {/* Row 1: Text Content */}
        <textarea
            value={overlay.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-full bg-gray-700/80 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={2}
            placeholder="Nhập văn bản..."
        />
        {/* Row 2: Font Styling */}
        <div className="flex items-center gap-3">
             <select
                value={overlay.fontFamily}
                onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                className="bg-gray-700/80 border border-gray-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow"
                style={{ fontFamily: overlay.fontFamily }}
             >
                {fonts.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
             </select>
            <div className="flex items-center bg-gray-700/80 border border-gray-600 rounded-md p-0.5">
                 <input
                    type="number"
                    value={overlay.fontSize}
                    onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value, 10) || 1 })}
                    className="w-12 bg-transparent text-white text-center text-xs focus:outline-none"
                    min="1"
                 />
                 <span className="text-gray-400 text-xs pr-1">%</span>
            </div>
             <div className="relative">
                <input
                    type="color"
                    value={overlay.color}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                    className="w-8 h-8 p-0 border-none cursor-pointer opacity-0 absolute inset-0"
                />
                <div className="w-7 h-7 rounded border border-gray-500" style={{ backgroundColor: overlay.color }}></div>
            </div>
        </div>
         {/* Row 3: Alignment & Actions */}
        <div className="flex justify-between items-center">
            <div className="flex items-center bg-gray-700/80 border border-gray-600 rounded-md p-0.5">
                <button onClick={() => handleUpdate({ textAlign: 'left' })} className={`p-1 rounded ${overlay.textAlign === 'left' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
                </button>
                 <button onClick={() => handleUpdate({ textAlign: 'center' })} className={`p-1 rounded ${overlay.textAlign === 'center' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm5 5.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
                 </button>
                 <button onClick={() => handleUpdate({ textAlign: 'right' })} className={`p-1 rounded ${overlay.textAlign === 'right' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm10 5.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
                 </button>
            </div>
             <button
                onClick={() => onDelete(overlay.id)}
                className="p-1.5 rounded-md bg-red-600/50 hover:bg-red-600 transition-colors"
                aria-label="Delete Text"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
        </div>

    </div>
  );
};

export default TextToolbar;
