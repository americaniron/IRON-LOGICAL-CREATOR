
import React, { useState, useCallback, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageResult } from '../types';
import { useApiKeySelection } from '../hooks/useApiKeySelection';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Spinner from './common/Spinner';
import ApiKeyPrompt from './common/ApiKeyPrompt';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
const resolutions = ["1K", "2K", "4K"];

const ImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [resolution, setResolution] = useState('1K');
  const [seed, setSeed] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);

  const { isKeySelected, isChecking, selectKey, resetKeySelection } = useApiKeySelection();

  const isProModel = model === 'gemini-3-pro-image-preview';

  useEffect(() => {
    if (!isProModel) {
      setUseGoogleSearch(false);
      setResolution('1K');
    }
  }, [isProModel]);

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
        aspectRatio, 
        model, 
        isProModel && useGoogleSearch,
        isProModel ? resolution : undefined,
        seedValue
      );
      setResult({ url: imageUrl, prompt: prompt });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('PERMISSION_DENIED') || err.message.includes('403'))) {
        resetKeySelection();
        setError('ACCESS DENIED: AUTHORIZE_PAID_KEY_REQUIRED.');
      } else {
        setError(err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN_ENGINE_FAILURE.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, model, isProModel, useGoogleSearch, resolution, seed, resetKeySelection]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto industrial-grid p-4">
      <div className="bg-[#2D2E30] p-8 border-4 border-[#3F4042] relative shadow-2xl">
        <div className="caution-stripes h-2 absolute top-0 left-0 right-0"></div>
        <h3 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase">// FABRICATION_UNIT_01 _</h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          {isProModel && !isChecking && !isKeySelected && (
            <ApiKeyPrompt modelName="Gemini Pro Vision" onSelectKey={selectKey} />
          )}
          <Input
            label="SITE_PROMPT"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A FUTURISTIC SKYSCRAPER UNDER CONSTRUCTION..."
            required
          />
          <Input
            label="EXCLUSION_DATA (NEGATIVE)"
            id="negative_prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="LOW_QUALITY, ARTIFACTS..."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="FRAME_RATIO"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
            />
            <Select
              label="MACHINE_MODEL"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ value: m, label: m.toUpperCase().replace(/-/g, '_') }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isProModel ? (
              <Select
                label="ENGINE_OUTPUT_SCALE"
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                options={resolutions.map(r => ({ value: r, label: r }))}
              />
            ) : <div />}
             <Input
                label="ITERATION_SEED"
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="RND_INTEGER"
              />
          </div>
          {isProModel && (
            <div className="flex items-center space-x-3 bg-black/40 p-4 border border-[#3F4042]">
                <input
                    type="checkbox"
                    id="google_search"
                    checked={useGoogleSearch}
                    onChange={(e) => setUseGoogleSearch(e.target.checked)}
                    className="h-5 w-5 rounded-none border-2 border-[#EBB700] bg-black text-[#EBB700] focus:ring-offset-0 focus:ring-0 cursor-pointer"
                    disabled={!isKeySelected}
                />
                <label htmlFor="google_search" className="text-xs font-mono font-bold text-[#EBB700] uppercase tracking-wider cursor-pointer">
                    ENABLE_REAL_TIME_GROUNDING_SEARCH
                </label>
            </div>
          )}
          <Button type="submit" disabled={isLoading || (isProModel && !isKeySelected)} className="w-full py-4 text-xl">
            {isLoading ? 'FABRICATING...' : 'EXECUTE GENERATION'}
          </Button>
        </form>
      </div>
      <div className="bg-[#111] border-4 border-[#3F4042] p-8 flex items-center justify-center min-h-[400px] relative">
        <div className="rivet absolute top-2 left-2"></div>
        <div className="rivet absolute top-2 right-2"></div>
        <div className="rivet absolute bottom-2 left-2"></div>
        <div className="rivet absolute bottom-2 right-2"></div>
        
        {isLoading && <Spinner text="CONSTRUCTING PIXELS..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-6">
            <div className="p-2 bg-[#2D2E30] border-b-8 border-black shadow-2xl">
              <img src={result.url} alt={result.prompt} className="max-w-full max-h-[500px] mx-auto grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="bg-black p-4 border border-[#3F4042]">
               <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">Manifest_Log</p>
               <p className="text-xs text-[#EBB700] font-mono italic uppercase">"{result.prompt}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-700 font-mono uppercase tracking-widest">
            <div className="mb-4 text-4xl opacity-10">
              <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm">ASSET_BAY_READY: STANDING BY FOR INPUT</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;
