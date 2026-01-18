import React, { useState, useCallback, useEffect } from 'react';
import { generateImage, downloadAsset } from '../services/geminiService';
import { ImageResult } from '../types';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Spinner from './common/Spinner';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import { Gear, Image, Download } from './common/Icons';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
const resolutions = ["1K", "2K", "4K"];

const ImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [negativePrompt, setNegativePrompt] = useMountedState('');
  
  // Persisted Preferences
  const [aspectRatio, setAspectRatio] = useLocalStorage('im_pref_img_ar', '1:1');
  const [model, setModel] = useLocalStorage('im_pref_img_model', 'gemini-2.5-flash-image');
  const [resolution, setResolution] = useLocalStorage('im_pref_img_res', '1K');
  const [useGoogleSearch, setUseGoogleSearch] = useLocalStorage('im_pref_img_search', false);
  const [showProMods, setShowProMods] = useLocalStorage('im_pref_img_promods', false);
  const [seed, setSeed] = useMountedState('');

  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [result, setResult] = useMountedState<ImageResult | null>(null);

  const { addAsset } = useAppContext();
  const { isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('gemini_pro');

  const isProModel = model === 'gemini-3-pro-image-preview';

  useEffect(() => {
    if (!isProModel) {
      setUseGoogleSearch(false);
      setResolution('1K');
      setShowProMods(false);
    }
  }, [isProModel, setUseGoogleSearch, setResolution, setShowProMods]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('SYSTEM ERROR: NULL_PROMPT_DATA.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const seedValue = seed ? parseInt(seed, 10) : undefined;
      const imageUrl = await generateImage(
        prompt, 
        negativePrompt,
        aspectRatio, 
        model, 
        isProModel && useGoogleSearch,
        isProModel ? resolution : undefined,
        seedValue
      );
      setResult({ url: imageUrl, prompt: prompt });
      addAsset({
        id: `gemini-img-${Date.now()}`,
        url: imageUrl,
        type: 'image',
        prompt: prompt,
        provider: 'Gemini',
        timestamp: Date.now(),
      });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('PERMISSION_DENIED') || err.message.includes('403') || err.message.includes('Requested entity was not found'))) {
        resetKey();
        setError('ACCESS DENIED: AUTHORIZE_PAID_KEY_REQUIRED.');
      } else {
        setError(err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN_ENGINE_FAILURE.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, aspectRatio, model, isProModel, useGoogleSearch, resolution, seed, resetKey, setError, setIsLoading, setResult, addAsset]);

  const handleDownload = () => {
    if (result) {
      downloadAsset(result.url, `gemini-fab-${Date.now()}.png`);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 w-full h-full">
      <div className="control-panel p-4 sm:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-end mb-6 sm:mb-8 pb-4 border-b-2 border-industrial-gray">
          <div>
              <h3 className="text-2xl sm:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                Fab_Shop
              </h3>
              <p className="text-[10px] font-mono text-heavy-yellow tracking-[0.4em] uppercase font-bold">UNIT_01 // ONLINE</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {isProModel && isReady && isKeyRequired && (
            <ProviderKeyPrompt provider="gemini_pro" onKeySubmit={saveKey} />
          )}
          <Input
            label="BLUEPRINT"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A FUTURISTIC SKYSCRAPER..."
            required
          />
          <Input
            label="EXCLUSION_DATA"
            id="negative_prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="LOW_QUALITY..."
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Select
              label="FRAME_RATIO"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
            />
            <Select
              label="ENGINE_MODEL"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ value: m, label: m.toUpperCase().replace('GEMINI-', '').replace('-IMAGE', '').replace('2.5', 'LITE') }))}
            />
          </div>

          {isProModel && (
            <div className="bg-black/40 border-2 border-industrial-gray">
              <button
                type="button"
                onClick={() => setShowProMods(!showProMods)}
                className="w-full p-3 flex justify-between items-center bg-industrial-gray/50 hover:bg-industrial-gray/80"
                disabled={isKeyRequired}
              >
                <div className="flex items-center gap-3">
                  <Gear className={`h-4 w-4 transition-transform ${showProMods ? 'rotate-90' : ''}`} />
                  <span className="font-mono uppercase tracking-widest text-[10px] sm:text-xs font-bold">Engine_Modifications</span>
                </div>
                <span className="text-heavy-yellow font-mono text-[10px]">{showProMods ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {showProMods && (
                <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
                  <Select
                    label="SCALE"
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    options={resolutions.map(r => ({ value: r, label: r }))}
                  />
                  <div className="flex items-center space-x-3 bg-asphalt/50 p-3 border border-industrial-gray">
                      <input
                          type="checkbox"
                          id="google_search"
                          checked={useGoogleSearch}
                          onChange={(e) => setUseGoogleSearch(e.target.checked)}
                          className="h-4 w-4 rounded-none border-2 border-heavy-yellow bg-asphalt text-heavy-yellow focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="google_search" className="text-[10px] font-mono font-bold text-heavy-yellow uppercase tracking-wider cursor-pointer">
                          REAL_TIME_GROUNDING
                      </label>
                  </div>
                </div>
              )}
            </div>
          )}
          <Button type="submit" disabled={isLoading || (isProModel && isKeyRequired)} className="w-full !py-4 sm:!py-6">
            {isLoading ? 'FABRICATING...' : 'FABRICATE IMAGE'}
          </Button>
        </form>
      </div>
       <div className="monitor-screen min-h-[300px] flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4">
         <div className="absolute top-2 left-4 text-[10px] font-mono text-heavy-yellow tracking-widest uppercase font-bold animate-pulse">
            // FAB_MONITOR_01
        </div>
        
        {isLoading && <Spinner text="CONSTRUCTING PIXELS..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest text-xs">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative p-1 bg-industrial-gray border-b-4 sm:border-b-8 border-black shadow-2xl">
              <img src={result.url} alt={result.prompt} className="max-w-full max-h-[40vh] sm:max-h-[60vh] lg:max-h-[500px] mx-auto object-contain" />
              <button 
                onClick={handleDownload}
                className="absolute bottom-2 right-2 p-2 bg-heavy-yellow text-black hover:bg-white shadow-lg border border-black transition-colors"
                title="Download Asset"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-black/80 p-3 border border-industrial-gray">
               <p className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-1">Manifest_Log</p>
               <p className="text-[10px] sm:text-xs text-heavy-yellow font-mono italic uppercase line-clamp-2">"{result.prompt}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest opacity-50">
            <Image className="mx-auto h-12 w-12 sm:h-20 sm:w-20 mb-4" />
            <p className="text-xs">ASSET_BAY_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;