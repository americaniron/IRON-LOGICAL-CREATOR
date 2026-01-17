import React, { useState, useCallback, useEffect, useContext } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageResult, Task } from '../types';
import { useApiKeySelection } from '../hooks/useApiKeySelection';
import { AssetContext } from '../contexts/AssetProvider';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { usePersistentState } from '../hooks/usePersistentState';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Spinner from './common/Spinner';
import ApiKeyPrompt from './common/ApiKeyPrompt';
import WorkbenchHeader from './common/WorkbenchHeader';
import { Gear, Film, Image } from './common/Icons';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
const resolutions = ["1K", "2K", "4K"];

const ImagePanel: React.FC = () => {
  const { addAsset, pipedPrompt, setPipe } = useContext(AssetContext);
  const { notify } = useContext(SystemStatusContext);

  const [prompt, setPrompt] = usePersistentState('image_prompt', '');
  const [negativePrompt, setNegativePrompt] = usePersistentState('image_neg_prompt', '');
  const [aspectRatio, setAspectRatio] = usePersistentState('image_aspect', '1:1');
  const [model, setModel] = usePersistentState('image_model', 'gemini-2.5-flash-image');
  const [resolution, setResolution] = usePersistentState('image_res', '1K');
  const [seed, setSeed] = usePersistentState('image_seed', '');
  const [useGoogleSearch, setUseGoogleSearch] = usePersistentState('image_search', false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [showProMods, setShowProMods] = useState(false);

  const { isKeySelected, isChecking, selectKey, resetKeySelection } = useApiKeySelection();

  const isProModel = model === 'gemini-3-pro-image-preview';

  useEffect(() => {
    if (pipedPrompt) {
      setPrompt(pipedPrompt);
      setPipe('', null, null); 
    }
  }, [pipedPrompt, setPipe, setPrompt]);

  useEffect(() => {
    if (!isProModel) {
      setUseGoogleSearch(false);
      setResolution('1K');
      setShowProMods(false);
    }
  }, [isProModel, setUseGoogleSearch, setResolution]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    notify("Image synthesis initiated", "info");

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
      
      const newResult = { url: imageUrl, prompt: prompt };
      setResult(newResult);
      addAsset({
        type: 'image',
        url: imageUrl,
        prompt: prompt,
        provider: 'iron'
      });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Requested entity was not found'))) {
        resetKeySelection();
        setError('Access Denied: Paid API Key required for this model.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, aspectRatio, model, isProModel, useGoogleSearch, resolution, seed, resetKeySelection, addAsset, notify]);
  
  const pipeToTask = (res: ImageResult, task: Task) => {
    setPipe(res.prompt, res.url);
    window.location.hash = `#/${task}`;
    notify(`Asset piped to ${task} module`, "info");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 md:gap-8 w-full h-full">
      <div className="control-panel p-4 md:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin order-2 xl:order-1 xl:w-1/2">
        <WorkbenchHeader title="Image Synthesis" station="Module_01" piped={!!pipedPrompt} />
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {isProModel && !isChecking && !isKeySelected && (
            <ApiKeyPrompt modelName="Gemini Pro Vision" onSelectKey={selectKey} />
          )}
          <Input
            label="Prompt"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic cityscape at dusk..."
            required
            autoComplete="off"
          />
          <Input
            label="Negative Prompt"
            id="negative_prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="blurry, low quality..."
            autoComplete="off"
          />
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <Select
              label="Aspect Ratio"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
            />
            <Select
              label="Model"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ value: m, label: m.replace('gemini-', '').replace('-image', '').replace('2.5', '2.5 Lite') }))}
            />
          </div>

          {isProModel && (
            <div className="bg-asphalt/50 border-2 border-industrial-gray">
              <button
                type="button"
                onClick={() => setShowProMods(!showProMods)}
                className="w-full p-3 md:p-4 flex justify-between items-center hover:bg-industrial-gray/20"
                disabled={!isKeySelected}
              >
                <div className="flex items-center gap-3">
                  <Gear className={`h-5 w-5 transition-transform ${showProMods ? 'rotate-90' : ''}`} />
                  <span className="font-heading uppercase tracking-widest text-sm md:text-base text-text-light">Advanced Options</span>
                </div>
                <span className="text-heavy-yellow font-body text-xs">{showProMods ? 'Collapse' : 'Expand'}</span>
              </button>
              {showProMods && (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-in fade-in-0 duration-300">
                  <Select
                    label="Resolution"
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    options={resolutions.map(r => ({ value: r, label: r }))}
                  />
                  <Input
                    label="Seed"
                    id="seed"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Random"
                  />
                  <div className="flex items-center space-x-3 bg-asphalt p-3 border-2 border-industrial-gray">
                      <input
                          type="checkbox"
                          id="google_search"
                          checked={useGoogleSearch}
                          onChange={(e) => setUseGoogleSearch(e.target.checked)}
                          className="h-5 w-5 border-2 border-heavy-yellow bg-steel text-heavy-yellow focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="google_search" className="font-body text-sm text-heavy-yellow uppercase tracking-wider cursor-pointer">
                          Enable Search Grounding
                      </label>
                  </div>
                </div>
              )}
            </div>
          )}
          <Button type="submit" size="xl" disabled={isLoading || (isProModel && !isKeySelected)} className="w-full">
            {isLoading ? 'Synthesizing...' : 'Generate Image'}
          </Button>
        </form>
      </div>
       <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden p-4 md:p-6 min-h-[300px] order-1 xl:order-2 xl:w-1/2 blueprint-grid">
         <div className="absolute top-4 left-6 text-xs font-body text-heavy-yellow tracking-widest uppercase font-bold animate-pulse z-20">
            // Synthesis Monitor
        </div>
        
        {isLoading && <Spinner text="Processing..." />}
        {error && <p className="text-red-400 font-body text-center border border-red-500/50 p-4 md:p-8 bg-red-500/10 uppercase text-xs md:text-sm">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full flex flex-col justify-center items-center space-y-4 md:space-y-6 animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="p-2 bg-asphalt border-2 border-black shadow-2xl relative">
               <img src={result.url} alt={result.prompt} className="max-w-full max-h-[40vh] md:max-h-[50vh] xl:max-h-full mx-auto object-contain" />
            </div>
            <div className="bg-steel/80 p-3 border-2 border-industrial-gray shadow-xl w-full max-w-lg">
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => pipeToTask(result, Task.ImageEdit)} variant="secondary" size="sm" className="!gap-1">
                        <Gear className="h-4 w-4" /> Pipe to Editor
                    </Button>
                     <Button onClick={() => pipeToTask(result, Task.ImageToVideo)} variant="secondary" size="sm" className="!gap-1">
                        <Film className="h-4 w-4" /> Pipe to Video
                    </Button>
                </div>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-industrial-gray font-body uppercase tracking-widest scale-75 md:scale-100">
            <div className="mb-4 md:mb-8 text-4xl">
              <Image className="mx-auto h-16 w-16 md:h-24 md:w-24 opacity-20" />
            </div>
            <p className="text-lg font-heading opacity-60 tracking-widest">Display Idle</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;