
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
  const { isKeyRequired, isReady, saveKey } = useApiKeyManager('gemini_pro', { model });

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
        url: imageUrl,
        type: 'image',
        prompt: prompt,
        provider: 'Gemini',
      });
    } catch (err) {
        setError(err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN_ENGINE_FAILURE.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, aspectRatio, model, isProModel, useGoogleSearch, resolution, seed, setError, setIsLoading, setResult, addAsset]);

  const handleDownload = () => {
    if (result) {
      downloadAsset(result.url, `gemini-fab-${Date.now()}.png`);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-8 w-full h-full pb-20 lg:pb-0">
      <div className="control-panel p-4 md:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-industrial-gray">
          <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                Fab_Shop
              </h3>
              <p className="text-[9px] md:text-[10px] font-mono text-heavy-yellow tracking-[0.4em] uppercase font-bold">UNIT_01 // ONLINE</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {isReady && isKeyRequired && (
            <div className="mb-4">
               <ProviderKeyPrompt provider="gemini_pro" onKeySubmit={saveKey} />
            </div>
          )}
          <Input
            label="BLUEPRINT"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A FUTURISTIC SKYSCRAPER..."
            required
            disabled={isKeyRequired}
          />
          <Input
            label="EXCLUSION_DATA"
            id="negative_prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="LOW_QUALITY..."
            disabled={isKeyRequired}
          />
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <Select
              label="FRAME_RATIO"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
              disabled={isKeyRequired}
            />
            <Select
              label="ENGINE_MODEL"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ value: m, label: m.toUpperCase().replace('GEMINI-', '').replace('-IMAGE', '').replace('2.5', 'LITE') }))}
              disabled={isKeyRequired}
            />
          </div>

          {isProModel && (
            <div className="bg-black/40 border-2 border-industrial-gray">
              <button
                type="button"
                onClick={() => setShowProMods(!showProMods)}
                className="w-full p-3 flex justify-between items-center bg-industrial-gray/50 hover:bg-industrial-gray/80 transition-colors"
                disabled={isKeyRequired}
              >
                <div className="flex items-center gap-3">
                  <Gear className={`h-4 w-4 transition-transform ${showProMods ? 'rotate-90' : ''}`} />
                  <span className="font-mono uppercase tracking-widest text-[9px] md:text-xs font-bold">Engine_Modifications</span>
                </div>
                <span className="text-heavy-yellow font-mono text-[9px]">{showProMods ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {showProMods && (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-in fade-in duration-300 border-t border-industrial-gray">
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
                      <label htmlFor="google_search" className="text-[9px] md:text-[10px] font-mono font-bold text-heavy-yellow uppercase tracking-wider cursor-pointer">
                          REAL_TIME_GROUNDING
                      </label>
                  </div>
                </div>
              )}
            </div>
          )}
          <Button type="submit" disabled={isLoading || isKeyRequired} className="w-full !py-4 md:!py-6">
            {isLoading ? 'FABRICATING...' : 'FABRICATE IMAGE'}
          </Button>
        </form>
      </div>

       <div className="monitor-screen min-h-[350px] lg:min-h-0 flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4 md:p-6 mt-4 lg:mt-0">
         <div className="absolute top-2 left-4 text-[9px] md:text-[10px] font-mono text-heavy-yellow tracking-widest uppercase font-bold animate-pulse">
            // FAB_MONITOR_01
        </div>
        
        {isLoading && <Spinner text="CONSTRUCTING PIXELS..." />}
        {error && <div className="text-center p-6 bg-red-900/20 border-2 border-red-500 max-w-sm">
            <p className="text-red-500 font-mono font-bold uppercase tracking-widest text-[10px] whitespace-pre-wrap">{error}</p>
        </div>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative p-1 bg-industrial-gray border-b-4 md:border-b-8 border-black shadow-2xl overflow-hidden">
              <img src={result.url} alt={result.prompt} className="max-w-full max-h-[45vh] lg:max-h-[500px] mx-auto object-contain" />
              <button 
                onClick={handleDownload}
                className="absolute bottom-2 right-2 p-2.5 bg-heavy-yellow text-black hover:bg-white shadow-lg border border-black transition-all active:scale-95"
                title="Download Asset"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-black/80 p-3 border border-industrial-gray max-w-lg mx-auto">
               <p className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-1">Manifest_Log</p>
               <p className="text-[10px] md:text-xs text-heavy-yellow font-mono italic uppercase line-clamp-2 leading-relaxed">"{result.prompt}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest opacity-50 p-10">
            <Image className="mx-auto h-12 w-12 md:h-20 md:w-20 mb-4" />
            <p className="text-[10px] md:text-xs">ASSET_BAY_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;