import React, { useState, useMemo, useEffect } from 'react';
import ControlCenter from './components/ControlCenter';
import Workspace from './components/Workspace';
import ContextualPanel from './components/ContextualPanel';
import ApiKeyManager from './components/ApiKeyManager';
import { WorkMode, TextOverlay, AiProvider } from './types';
import { generateImage, validateApiKey, ApiKeyError } from './services/aiService';
import { flattenTextOverlays } from './services/imageUtils';
import { AI_MODELS } from './constants';

const initialSettings = {
  [WorkMode.PORTRAIT]: {
    provider: AiProvider.GEMINI,
    model: AI_MODELS[AiProvider.GEMINI][0].value,
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
    provider: AiProvider.GEMINI,
    model: AI_MODELS[AiProvider.GEMINI][0].value,
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
    provider: AiProvider.GEMINI,
    model: AI_MODELS[AiProvider.GEMINI][0].value,
    // Workflow 1: Studio Swap
    subjectIsolated: false,
    backgroundPrompt: '',
    // Workflow 2: Full-Body Generation
    fullBodyPrompt: '',
  },
  [WorkMode.COMPOSITE]: {
    provider: AiProvider.GEMINI,
    model: AI_MODELS[AiProvider.GEMINI][0].value,
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
  const [apiKeys, setApiKeys] = useState<{ [key in AiProvider]: string[] }>({ [AiProvider.GEMINI]: [], [AiProvider.OPENAI]: [] });
  const [activeApiKey, setActiveApiKey] = useState<{ provider: AiProvider, key: string } | null>(null);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);

  // State for Identity Lock/Masking feature
  const [isMasking, setIsMasking] = useState(false);
  const [identityMask, setIdentityMask] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(40);

  // State for Text Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(null);

  const findAndSetNewActiveKey = (keys: { [key in AiProvider]: string[] }) => {
    let newActiveKey: { provider: AiProvider, key: string } | null = null;
    if (keys[AiProvider.GEMINI].length > 0) {
        newActiveKey = { provider: AiProvider.GEMINI, key: keys[AiProvider.GEMINI][0] };
    } else if (keys[AiProvider.OPENAI].length > 0) {
        newActiveKey = { provider: AiProvider.OPENAI, key: keys[AiProvider.OPENAI][0] };
    }
    setActiveApiKey(newActiveKey);
    if(newActiveKey) {
        localStorage.setItem('activeApiKey', JSON.stringify(newActiveKey));
    } else {
        localStorage.removeItem('activeApiKey');
    }
  };

  // Load keys from localStorage on initial render
  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem('userApiKeys');
      const storedActiveKey = localStorage.getItem('activeApiKey');
      
      let parsedKeys = { [AiProvider.GEMINI]: [], [AiProvider.OPENAI]: [] };
      if (storedKeys) {
        // Ensure both provider keys exist even if storage is old
        const fromStorage = JSON.parse(storedKeys);
        parsedKeys = { ...parsedKeys, ...fromStorage };
        setApiKeys(parsedKeys);
      }
      
      if (storedActiveKey) {
          const parsedActiveKey = JSON.parse(storedActiveKey) as { provider: AiProvider, key: string };
          // Validate that the active key actually exists in our list
          if (parsedKeys[parsedActiveKey.provider]?.includes(parsedActiveKey.key)) {
              setActiveApiKey(parsedActiveKey);
          } else {
              // Active key is invalid, try to find a fallback
              findAndSetNewActiveKey(parsedKeys);
          }
      } else if (parsedKeys[AiProvider.GEMINI].length > 0 || parsedKeys[AiProvider.OPENAI].length > 0) {
        // No active key stored, find one
        findAndSetNewActiveKey(parsedKeys);
      } else {
        // No keys at all, open manager
        setIsApiKeyManagerOpen(true);
      }
    } catch (error) {
      console.error("Failed to load API keys from localStorage", error);
      localStorage.removeItem('userApiKeys');
      localStorage.removeItem('activeApiKey');
    }
  }, []);

  // API Key Manager Handlers
  const handleAddApiKeys = async (keysToAdd: string[], provider: AiProvider) => {
    const existingKeys = apiKeys[provider];
    const uniqueNewKeys = [...new Set(keysToAdd.filter(k => !existingKeys.includes(k)))];
    if (uniqueNewKeys.length === 0) {
      return { added: [], failed: keysToAdd };
    }
    
    const validationPromises = uniqueNewKeys.map(key => validateApiKey(key, provider).then(isValid => ({ key, isValid })));
    
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
      const updatedKeysForProvider = [...existingKeys, ...added];
      const updatedKeys = { ...apiKeys, [provider]: updatedKeysForProvider };
      setApiKeys(updatedKeys);
      localStorage.setItem('userApiKeys', JSON.stringify(updatedKeys));
      
      if (!activeApiKey) {
        const newActiveKey = { provider, key: added[0] };
        setActiveApiKey(newActiveKey);
        localStorage.setItem('activeApiKey', JSON.stringify(newActiveKey));
      }
    }
    
    return { added, failed };
  };

  const handleDeleteApiKey = (keyToDelete: string, provider: AiProvider) => {
    const updatedKeysForProvider = apiKeys[provider].filter(k => k !== keyToDelete);
    const updatedKeys = { ...apiKeys, [provider]: updatedKeysForProvider };
    setApiKeys(updatedKeys);
    localStorage.setItem('userApiKeys', JSON.stringify(updatedKeys));
    
    if (activeApiKey?.key === keyToDelete && activeApiKey?.provider === provider) {
        findAndSetNewActiveKey(updatedKeys);
    }
  };

  const handleSetActiveApiKey = (key: string, provider: AiProvider) => {
    const newActiveKey = { provider, key };
    setActiveApiKey(newActiveKey);
    localStorage.setItem('activeApiKey', JSON.stringify(newActiveKey));
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
    const targetProvider = activeSettings.provider;

    // For OpenAI text-to-image, an initial image is not required
    if (!image && targetProvider === AiProvider.GEMINI) return;
    
    // --- START OF FIX ---
    // Dynamically find a valid API key for the selected provider.
    let keyForRequest: string | null = null;

    // 1. Check if the currently active key is suitable for the request.
    if (activeApiKey && activeApiKey.provider === targetProvider) {
      keyForRequest = activeApiKey.key;
    } 
    // 2. If not, find the first available key for the required provider.
    else if (apiKeys[targetProvider].length > 0) {
      keyForRequest = apiKeys[targetProvider][0];
      // Automatically set this key as active for a smoother user experience.
      handleSetActiveApiKey(keyForRequest, targetProvider);
    }

    // 3. If no key is found for the provider, alert the user.
    if (!keyForRequest) {
      alert(`Vui lòng vào "Quản lý API Key" để thêm và chọn một key cho ${targetProvider}.`);
      setIsApiKeyManagerOpen(true);
      return;
    }
    // --- END OF FIX ---

    setIsLoading(true);
    setResultImage(null);
    
    try {
      const imageWithText = (image && textOverlays.length > 0)
        ? await flattenTextOverlays(image, textOverlays)
        : image;
        
      const mimeType = imageWithText?.substring(imageWithText.indexOf(':') + 1, imageWithText.indexOf(';')) || 'image/jpeg';
      
      const generatedImage = await generateImage({
        apiKey: keyForRequest,
        provider: targetProvider,
        model: activeSettings.model,
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
          // Use the key and provider that actually failed.
          if(keyForRequest) handleDeleteApiKey(keyForRequest, targetProvider); 
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
        // Keep provider and model but reset other settings
        const currentProvider = settings[WorkMode.CREATIVE].provider;
        const currentModel = settings[WorkMode.CREATIVE].model;
        const newCreativeSettings = { ...initialSettings[WorkMode.CREATIVE], provider: currentProvider, model: currentModel };
        handleSettingsChange(newCreativeSettings);
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
          activeModeSettings={activeSettings}
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