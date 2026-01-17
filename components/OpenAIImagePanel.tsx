import React, { useState, useCallback } from 'react';
import { generateOpenAIImage } from '../services/openAIService';
import { downloadAsset } from '../services/geminiService';
import { ImageResult } from '../types';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Spinner from './common/Spinner';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import { Image, BrainCircuit, Download } from './common/Icons';

const models = [
    { value: 'dall-e-3', label: 'DALL-E 3 (MAX)' }, 
    { value: 'dall-e-2', label: 'DALL-E 2 (RAPID)' }
];
const qualities = [
    { value: 'standard', label: 'Standard' }, 
    { value: 'hd', label: 'HD (D3)' }
];
const styles = [
    { value: 'vivid', label: 'Vivid' }, 
    { value: 'natural', label: 'Natural' }
];


const OpenAIImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [model, setModel] = useMountedState<'dall-e-2' | 'dall-e-3'>('dall-e-3');
  const [quality, setQuality] = useMountedState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useMountedState<'vivid' | 'natural'>('vivid');
  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [result, setResult] = useMountedState<ImageResult | null>(null);
  
  const { addAsset } = useAppContext();
  const { apiKey, isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('openai');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !apiKey) {
      setError('SYSTEM ERROR: NULL_PROMPT_OR_KEY.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageUrl = await generateOpenAIImage(prompt, apiKey, model, quality, style);
      setResult({ url: imageUrl, prompt: prompt });
      addAsset({
        id: `openai-img-${Date.now()}`,
        url: imageUrl,
        type: 'image',
        prompt: prompt,
        provider: 'OpenAI',
        timestamp: Date.now(),
      });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN GUEST FORGE FAILURE.';
        if (err instanceof Error && (err.message.includes('401') || err.message.toLowerCase().includes('incorrect api key'))) {
            resetKey();
        }
        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey, model, quality, style, setIsLoading, setError, setResult, addAsset, resetKey]);

  const handleDownload = () => {
    if (result) {
      downloadAsset(result.url, `oai-fab-${Date.now()}.png`);
    }
  };

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="INITIALIZING GUEST SYSTEMS..." /></div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10"><ProviderKeyPrompt provider="openai" onKeySubmit={saveKey} /></div>;
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 w-full h-full">
      <div className="control-panel p-4 sm:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin border-2 border-guest-green/20">
        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-industrial-gray">
          <div>
              <h3 className="text-2xl sm:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                DALL-E Forge
              </h3>
              <p className="text-[10px] font-mono text-guest-green tracking-[0.4em] uppercase font-bold">GUEST_SYSTEM // ONLINE</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Input
            label="FORGE_PROMPT"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="PROTOTYPE DESIGN..."
            required
          />
          <Select
              label="ENGINE"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value as 'dall-e-2' | 'dall-e-3')}
              options={models}
            />
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Select
              label="QUALITY"
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as 'standard' | 'hd')}
              options={qualities}
              disabled={model === 'dall-e-2'}
            />
            <Select
              label="STYLE"
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value as 'vivid' | 'natural')}
              options={styles}
              disabled={model === 'dall-e-2'}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full !py-4 sm:!py-6 !bg-guest-green !border-t-green-300 !shadow-[0_4px_0_#15803d] hover:!shadow-[0_4px_0_#16a34a] !text-black">
            {isLoading ? 'FORGING...' : 'EXECUTE'}
          </Button>
        </form>
      </div>
       <div className="monitor-screen min-h-[300px] flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4">
         <div className="absolute top-2 left-4 text-[10px] font-mono text-guest-green tracking-widest uppercase font-bold animate-pulse">
            // GUEST_FAB_MONITOR_02
        </div>
        
        {isLoading && <Spinner text="SYNTHESIZING..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest text-xs">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-4 animate-in fade-in duration-500">
            <div className="relative p-1 bg-industrial-gray border-b-4 sm:border-b-8 border-black shadow-2xl">
              <img src={result.url} alt={result.prompt} className="max-w-full max-h-[40vh] sm:max-h-[60vh] lg:max-h-[500px] mx-auto object-contain" />
              <button 
                onClick={handleDownload}
                className="absolute bottom-2 right-2 p-2 bg-guest-green text-black hover:bg-white shadow-lg border border-black transition-colors"
                title="Download Guest Asset"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-black/80 p-3 border border-industrial-gray">
               <p className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-1">Manifest_Log</p>
               <p className="text-[10px] text-guest-green font-mono italic uppercase line-clamp-2">"{result.prompt}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest opacity-50">
            <BrainCircuit className="mx-auto h-12 w-12 sm:h-20 sm:w-20 mb-4" />
            <p className="text-xs">GUEST_BAY_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAIImagePanel;