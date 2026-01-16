import React, { useState, useCallback } from 'react';
import { generateGrokImage } from '../services/grokService';
import { ImageResult } from '../types';
import { useGrokKey } from '../hooks/useGrokKey';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';
import GrokKeyPrompt from './common/GrokKeyPrompt';
import { XIcon } from './common/Icons';

const GrokImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const { apiKey, isReady, saveApiKey } = useGrokKey();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !apiKey) {
      setError('Prompt or API key is missing. Figure it out.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulation behavior: provide a varied placeholder image
      const seed = Math.floor(Math.random() * 1000);
      const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;
      
      // Artificial delay for industrial feel
      await new Promise(r => setTimeout(r, 2000));
      
      setResult({ url: imageUrl, prompt: prompt });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Some unpredictable cosmic event occurred.';
        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="Locating X-Forge..." /></div>;
  }
  
  if (!apiKey) {
    return <div className="max-w-3xl mx-auto pt-10"><GrokKeyPrompt onKeySubmit={saveApiKey} /></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin order-2 lg:order-1 lg:w-1/2">
        <div className="flex justify-between items-end mb-4 pb-4 border-b-2 border-industrial-gray">
          <div>
              <h3 className="text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                X-Forge
              </h3>
              <p className="text-[10px] font-mono text-grok-magenta tracking-[0.4em] uppercase font-bold">X-CORP_SYSTEM // ONLINE</p>
          </div>
        </div>
         <div className="mb-8 p-4 bg-fuchsia-900/20 border-2 border-fuchsia-500/50 text-xs font-mono text-fuchsia-400 uppercase leading-relaxed shadow-inner">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                <span className="font-bold">STATUS: SIMULATION_BAY_ACTIVE</span>
            </div>
            X-Corp Forge architectural logic is operating in verification mode. Generations use cached neural weights for blueprint testing until public API release.
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Image Directive"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A realistic photo of a cat programming a quantum computer..."
            required
            autoComplete="off"
          />
          
          <div className="pt-4">
            <p className="text-center font-mono text-xs text-gray-600 uppercase">-- Parameters are for the weak. Just type what you want. --</p>
          </div>

          <Button type="submit" size="xl" disabled={isLoading} provider="xcorp" className="w-full">
            {isLoading ? 'Doing the thing...' : 'Generate'}
          </Button>
        </form>
      </div>
       <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4 order-1 lg:order-2 lg:w-1/2">
         <div className="absolute top-2 left-4 text-xs font-mono text-grok-magenta tracking-widest uppercase font-bold animate-pulse">
            // FORGE_MONITOR_X (GROK)
        </div>
        
        {isLoading && <Spinner text="Creating masterpiece..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-6 animate-in fade-in-0 zoom-in duration-500">
            <div className="p-2 bg-industrial-gray border-b-8 border-black shadow-2xl relative">
              <div className="caution-stripes h-1 absolute top-0 left-0 right-0 opacity-20"></div>
              <img src={result.url} alt={result.prompt} className="max-w-full max-h-[60vh] lg:max-h-[500px] mx-auto object-contain border border-black shadow-inner" />
            </div>
            <div className="bg-black/80 p-4 border border-industrial-gray">
               <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">PROMPT_LOG</p>
               <p className="text-xs text-grok-magenta font-mono italic">"{result.prompt}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest">
            <div className="mb-4 text-4xl opacity-10">
              <XIcon className="mx-auto h-20 w-20" />
            </div>
            <p className="text-sm">X-FORGE_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrokImagePanel;