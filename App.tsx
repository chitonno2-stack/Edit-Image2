import React, { useState, useMemo, useEffect } from 'react';
import ControlCenter from './components/ControlCenter';
import Workspace from './components/Workspace';
import ContextualPanel from './components/ContextualPanel';
import ApiKeyManager from './components/ApiKeyManager';
import { WorkMode, TextOverlay } from './types';
import { generateImageWithGemini, validateApiKey, ApiKeyError } from './services/geminiService';
import { flattenTextOverlays } from './services/imageUtils';

const initialSettings = {
  [WorkMode.PORTRAIT]: {
    // 2. Identity & Detail Engine
    targetResolution: '8K',
    autoSkinTexture: true,
    autoHairDetail: true,

    // 3. Dynamic Studio Relighting
    autoBalanceLighting: true,
    lightStyle: '3-point', // '3-point', 'rim', 'butterfly'
    lightIntensity: 70,

    // 4. Professional Lens FX
    autoBokeh: true,
    lensProfile: '85mm f/1.4', // '85mm f/1.4', '50mm f/1.8', '35mm f/2'
    backgroundBlur: 80,
    chromaticAberration: false,

    // 5. Beauty & Style
    skinSmoothing: 40,
    removeBlemishes: true,
    removeWrinkles: false,
    removeDarkCircles: true,
    makeup: '',
    hair: '',
  },
  [WorkMode.RESTORE]: {
    // Step 1: Clean
    autoClean: true,
    // Step 2: Remaster
    hyperRealSkin: true,
    hairAndFabricDetails: true,
    resolution: '4K',
    // Step 3: Studio Finish
    autoStudioLight: true,
    lightStyle: '3-point',
    modernAutoColor: true,
    autoWhiteBalance: true,
    backgroundProcessing: 'remaster',
    studioBackdrop: 'grey',
    // Context
    context: '',
  },
  [WorkMode.CREATIVE]: {
    // Workflow 1: Studio Swap
    subjectIsolated: false,
    backgroundPrompt: '',

    // Workflow 2: Full-Body Generation
    fullBodyPrompt: '',
  },
  [WorkMode.COMPOSITE]: {
    lightMatch: 85,
    colorTempMatch: 90,
    smartShadows: true,
    grainMatch: true,
    focusMatch: true,
    perspectiveMatch: true,
  },
};


const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<WorkMode>(WorkMode.PORTRAIT);
  const [image, setImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<typeof initialSettings>(initialSettings);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // New state for API Key Management
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [activeApiKey, setActiveApiKey] = useState<string | null>(null);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);

  // State for Identity Lock/Masking feature
  const [isMasking, setIsMasking] = useState(false);
  const [identityMask, setIdentityMask] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(40);

  // State for Text Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(null);

  // Load keys from localStorage on initial render
  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem('userApiKeys');
      const storedActiveKey = localStorage.getItem('activeApiKey');
      
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys) as string[];
        setApiKeys(parsedKeys);
        
        if (storedActiveKey && parsedKeys.includes(storedActiveKey)) {
          setActiveApiKey(storedActiveKey);
        } else if (parsedKeys.length > 0) {
          // If active key is invalid but others exist, set the first one
          const newActiveKey = parsedKeys[0];
          setActiveApiKey(newActiveKey);
          localStorage.setItem('activeApiKey', newActiveKey);
        }
      } else {
        // If no keys are stored, open the manager automatically for the first-time user.
        setIsApiKeyManagerOpen(true);
      }
    } catch (error) {
      console.error("Failed to load API keys from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('userApiKeys');
      localStorage.removeItem('activeApiKey');
    }
  }, []);

  // API Key Manager Handlers
  const handleAddApiKeys = async (keysToAdd: string[]) => {
    const uniqueNewKeys = [...new Set(keysToAdd.filter(k => !apiKeys.includes(k)))];
    if (uniqueNewKeys.length === 0) {
      return { added: [], failed: keysToAdd };
    }
    
    const validationPromises = uniqueNewKeys.map(key => validateApiKey(key).then(isValid => ({ key, isValid })));
    
    const results = await Promise.all(validationPromises);

    const added: string[] = [];
    const failed: string[] = [];
    
    results.forEach(({ key, isValid }) => {
      if (isValid) {
        added.push(key);
      } else {
        failed.push(key);
      }
    });

    if (added.length > 0) {
      const updatedKeys = [...apiKeys, ...added];
      setApiKeys(updatedKeys);
      localStorage.setItem('userApiKeys', JSON.stringify(updatedKeys));
      
      if (!activeApiKey) {
        const newActiveKey = added[0];
        setActiveApiKey(newActiveKey);
        localStorage.setItem('activeApiKey', newActiveKey);
      }
    }
    
    return { added, failed };
  };

  const handleDeleteApiKey = (keyToDelete: string) => {
    const updatedKeys = apiKeys.filter(k => k !== keyToDelete);
    setApiKeys(updatedKeys);
    localStorage.setItem('userApiKeys', JSON.stringify(updatedKeys));
    
    if (activeApiKey === keyToDelete) {
      const newActiveKey = updatedKeys.length > 0 ? updatedKeys[0] : null;
      setActiveApiKey(newActiveKey);
      if (newActiveKey) {
        localStorage.setItem('activeApiKey', newActiveKey);
      } else {
        localStorage.removeItem('activeApiKey');
      }
    }
  };

  const handleSetActiveApiKey = (key: string) => {
    setActiveApiKey(key);
    localStorage.setItem('activeApiKey', key);
    setIsApiKeyManagerOpen(false); // Close manager after selecting a key for better UX
  };

  const activeSettings = useMemo(() => settings[activeMode], [settings, activeMode]);

  const handleSettingsChange = (newSettings: Partial<typeof activeSettings>) => {
    setSettings(prev => ({
      ...prev,
      [activeMode]: {
        ...prev[activeMode],
        ...newSettings,
      },
    }));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setImage(imageData);
      setHistory([imageData]);
      setHistoryIndex(0);
      setResultImage(null);
      setIdentityMask(null); // Clear mask on new image
      setIsMasking(false);
      setTextOverlays([]); // Clear text overlays on new image
      setActiveTextOverlayId(null);
    };
    reader.readAsDataURL(file);
  };
  
  const handleClearImage = () => {
    setImage(null);
    setHistory([]);
    setHistoryIndex(-1);
    setResultImage(null);
    setBackgroundImage(null);
    setReferenceImage(null);
    setIdentityMask(null);
    setIsMasking(false);
    setTextOverlays([]);
    setActiveTextOverlayId(null);
  };

  const handleBackgroundImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReferenceImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleGenerate = async (prompt: string) => {
    if (!image) return;
    if (!activeApiKey) {
      alert("Vui lòng thiết lập một API Key đang hoạt động trước khi tạo ảnh.");
      setIsApiKeyManagerOpen(true);
      return;
    }

    setIsLoading(true);
    setResultImage(null);
    
    try {
      const imageWithText = textOverlays.length > 0
        ? await flattenTextOverlays(image, textOverlays)
        : image;
        
      const mimeType = imageWithText.substring(imageWithText.indexOf(':') + 1, imageWithText.indexOf(';'));
      const generatedImage = await generateImageWithGemini({
        apiKey: activeApiKey,
        base64Image: imageWithText,
        base64BackgroundImage: activeMode === WorkMode.COMPOSITE ? backgroundImage : undefined,
        base64ReferenceImage: activeMode === WorkMode.CREATIVE ? referenceImage : undefined,
        base64Mask: activeMode === WorkMode.CREATIVE && isMasking ? identityMask : undefined,
        mimeType,
        prompt,
        mode: activeMode,
        settings: activeSettings,
      });
      
      setResultImage(generatedImage);
    } catch (error) {
      if (error instanceof ApiKeyError) {
          alert(error.message);
          // The key might be invalid, let's remove it and prompt the user.
          if(activeApiKey) handleDeleteApiKey(activeApiKey); 
          setIsApiKeyManagerOpen(true);
      } else {
          console.error("An unexpected error occurred during image generation:", error);
          alert("An unexpected error occurred. Please check the console for details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: WorkMode) => {
    if (mode !== WorkMode.COMPOSITE) {
      setBackgroundImage(null);
    }
    if (mode !== WorkMode.CREATIVE) {
        setReferenceImage(null);
        setIdentityMask(null);
        setIsMasking(false);
    }
    // Reset creative mode workflow states when switching to it
    if (mode === WorkMode.CREATIVE) {
        handleSettingsChange(initialSettings[WorkMode.CREATIVE]);
    }
    setActiveMode(mode);
  }

  const handleCommitResult = () => {
    if (resultImage) {
      // If we've undone and are now making a new edit, discard the "redo" history.
      const newHistory = history.slice(0, historyIndex + 1);
      
      const updatedHistory = [...newHistory, resultImage];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setImage(resultImage);   // Promote result image to main image
      setResultImage(null);    // Clear the result pane
      setIdentityMask(null);   // Clear the mask after commit as it applies to the old image
      setIsMasking(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setImage(history[newIndex]);
      setResultImage(null);   // Clear any pending result when undoing
      setIdentityMask(null);
      setIsMasking(false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setImage(history[newIndex]);
      setResultImage(null); // Clear any pending result when redoing
      setIdentityMask(null);
      setIsMasking(false);
    }
  };
  
  // --- Text Overlay Handlers ---
  const handleAddText = () => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'Nhập văn bản',
      fontFamily: 'Arial',
      fontSize: 5, // 5% of image height
      color: '#FFFFFF',
      textAlign: 'center',
      x: 50,
      y: 50,
    };
    setTextOverlays(prev => [...prev, newText]);
    setActiveTextOverlayId(newText.id);
  };

  const handleUpdateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const handleDeleteTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
    if (activeTextOverlayId === id) {
      setActiveTextOverlayId(null);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex h-screen w-screen bg-gray-800/50">
      <aside className="w-80 flex flex-col bg-gray-900 border-r border-gray-700/50">
        <ControlCenter 
          activeMode={activeMode} 
          setActiveMode={handleModeChange} 
          activeApiKey={activeApiKey}
          onOpenApiKeyManager={() => setIsApiKeyManagerOpen(true)}
        />
        <ContextualPanel 
          activeMode={activeMode} 
          settings={activeSettings}
          onSettingsChange={handleSettingsChange}
          onBackgroundImageUpload={handleBackgroundImageUpload}
          backgroundImage={backgroundImage}
          onReferenceImageUpload={handleReferenceImageUpload}
          referenceImage={referenceImage}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(p => !p)}
          onGenerate={handleGenerate}
          // Masking props for Creative Panel
          isMasking={isMasking}
          onToggleMasking={() => setIsMasking(p => !p)}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
        />
      </aside>
      <main className="flex-1 flex flex-col p-4 gap-4">
        <Workspace 
          activeMode={activeMode}
          originalImage={image}
          resultImage={resultImage}
          backgroundImage={backgroundImage}
          onImageUpload={handleImageUpload}
          onClearImage={handleClearImage}
          isLoading={isLoading}
          onGenerate={handleGenerate}
          onCommitResult={handleCommitResult}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          // Masking props for Workspace
          isMasking={isMasking}
          identityMask={identityMask}
          onMaskChange={setIdentityMask}
          brushSize={brushSize}
          // Text Overlay props
          textOverlays={textOverlays}
          activeTextOverlayId={activeTextOverlayId}
          onAddText={handleAddText}
          onUpdateTextOverlay={handleUpdateTextOverlay}
          onDeleteTextOverlay={handleDeleteTextOverlay}
          onSelectTextOverlay={setActiveTextOverlayId}
        />
      </main>
      <ApiKeyManager 
        isOpen={isApiKeyManagerOpen}
        onClose={() => setIsApiKeyManagerOpen(false)}
        apiKeys={apiKeys}
        activeApiKey={activeApiKey}
        onAddKeys={handleAddApiKeys}
        onDeleteKey={handleDeleteApiKey}
        onSetActiveKey={handleSetActiveApiKey}
      />
    </div>
  );
};

export default App;