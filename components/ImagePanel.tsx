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
  
  const [aspectRatio, setAspectRatio] = useLocalStorage('im_pref_img_ar', '1:1');
  const [model, setModel] = useLocalStorage('im_pref_img_model', 'gemini-3-pro-image-preview');
  const [resolution, setResolution] = useLocalStorage('im_pref_img_res', '1K');
  const [useGoogleSearch, setUseGoogleSearch] = useLocalStorage('im_pref_img_search', false);
  const [showAdvanced, setShowAdvanced] = useLocalStorage('im_pref_img_advanced', false);
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
      setShowAdvanced(false);
    }
  }, [isProModel, setUseGoogleSearch, setResolution, setShowAdvanced]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
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
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, aspectRatio, model, isProModel, useGoogleSearch, resolution, seed, setError, setIsLoading, setResult, addAsset]);

  const handleDownload = () => {
    if (result) {
      downloadAsset(result.url, `gemini-image-${Date.now()}.png`);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 w-full h-full">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm p-4 md:p-6 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
          Image Generation Settings
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {isReady && isKeyRequired && (
            <div className="mb-4">
               <ProviderKeyPrompt provider="gemini_pro" onKeySubmit={saveKey} />
            </div>
          )}
          <Input
            label="Prompt"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic skyscraper..."
            required
            disabled={isKeyRequired}
          />
          <Input
            label="Negative Prompt (Optional)"
            id="negative_prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="low quality, blurry..."
            disabled={isKeyRequired}
          />
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <Select
              label="Aspect Ratio"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
              disabled={isKeyRequired}
            />
            <Select
              label="Model"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ value: m, label: m.replace('gemini-', '').replace('-image', '').replace('2.5', '2.5 Flash').replace('3-pro', '3 Pro') }))}
              disabled={isKeyRequired}
            />
          </div>

          {isProModel && (
            <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-3 flex justify-between items-center hover:bg-white/5 transition-colors"
                disabled={isKeyRequired}
              >
                <div className="flex items-center gap-3">
                  <Gear className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                  <span className="text-sm font-semibold">Advanced Settings</span>
                </div>
                <span className="text-[var(--text-accent)] text-xs font-bold">{showAdvanced ? 'Collapse' : 'Expand'}</span>
              </button>
              {showAdvanced && (
                <div className="p-4 md:p-5 space-y-4 md:space-y-5 border-t border-[var(--border-primary)] animate-in fade-in duration-300">
                  <Select
                    label="Resolution"
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    options={resolutions.map(r => ({ value: r, label: r }))}
                  />
                  <div className="flex items-center space-x-3 bg-[var(--bg-input)] p-3 border border-[var(--border-primary)] rounded-md">
                      <input
                          type="checkbox"
                          id="google_search"
                          checked={useGoogleSearch}
                          onChange={(e) => setUseGoogleSearch(e.target.checked)}
                          className="h-4 w-4 rounded border-2 border-[var(--border-primary)] bg-[var(--bg-input)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                      />
                      <label htmlFor="google_search" className="text-sm font-medium text-[var(--text-secondary)] cursor-pointer">
                          Ground with Google Search
                      </label>
                  </div>
                </div>
              )}
            </div>
          )}
          <Button type="submit" disabled={isLoading || isKeyRequired} className="w-full !py-3">
            {isLoading ? 'Generating...' : 'Generate Image'}
          </Button>
        </form>
      </div>

       <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm min-h-[350px] lg:min-h-0 flex flex-col items-center justify-center h-full relative overflow-hidden p-4 md:p-6 mt-4 lg:mt-0">
        {isLoading && <Spinner text="Generating image..." />}
        {error && <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg max-w-sm">
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{error}</p>
        </div>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative group">
              <img src={result.url} alt={result.prompt} className="max-w-full max-h-[60vh] lg:max-h-[500px] mx-auto object-contain rounded-lg shadow-lg" />
              <button 
                onClick={handleDownload}
                className="absolute bottom-3 right-3 p-2 bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm rounded-full transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                title="Download Image"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic line-clamp-2 leading-relaxed">"{result.prompt}"</p>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-[var(--text-muted)] font-medium">
            <Image className="mx-auto h-16 w-16 mb-4 opacity-30" />
            <p>Your generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;