import React, { useState, useCallback, useEffect } from 'react';
import { generateGrokImage } from '../services/grokService';
import { downloadAsset } from '../services/geminiService';
import { ImageResult } from '../types';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';
import { Image, XIcon, Download } from './common/Icons';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';

const GrokImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [result, setResult] = useMountedState<ImageResult | null>(null);
  
  const { addAsset } = useAppContext();
  const { apiKey, isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('grok');

  const [monitorState, setMonitorState] = useMountedState<'idle' | 'booting' | 'active'>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !apiKey) {
      setError('Prompt or API key is missing. Figure it out.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMonitorState('booting');

    try {
      await new Promise(res => setTimeout(res, 1500));
      const imageUrl = await generateGrokImage(prompt, apiKey);
      setResult({ url: imageUrl, prompt: prompt });
      setMonitorState('active');
      addAsset({
        id: `grok-img-${Date.now()}`,
        url: imageUrl,
        type: 'image',
        prompt: prompt,
        provider: 'Grok',
        timestamp: Date.now(),
      });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Cosmic failure.';
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('403') || err.message.toLowerCase().includes('authentication'))) {
            resetKey();
        }
        setError(errorMessage);
        setMonitorState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey, setIsLoading, setError, setResult, setMonitorState, addAsset, resetKey]);

  useEffect(() => {
    if (!prompt) {
      setResult(null);
      setError(null);
      setMonitorState('idle');
    }
  }, [prompt, setResult, setError, setMonitorState]);

  const handleDownload = () => {
    if (result) {
      downloadAsset(result.url, `grok-fab-${Date.now()}.png`);
    }
  };

  if (!isReady) {
    return <div className="flex items-center justify-center h-full font-mono text-grok-magenta animate-pulse uppercase">LOCATING X-FORGE...</div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10"><ProviderKeyPrompt provider="grok" onKeySubmit={saveKey} /></div>;
  }
  
  const MonitorContent = () => {
    if (monitorState === 'booting' || isLoading) {
      return (
        <div className="text-center font-mono uppercase text-grok-magenta animate-pulse text-xs sm:text-sm">
            <p>// INITIALIZING FLUX...</p>
            <p className="mt-2 opacity-50 text-[10px]">&gt; Bypassing protocols...</p>
        </div>
      );
    }
    if (error && !result) {
       return <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-4 bg-red-500/10 uppercase tracking-widest text-[10px]">{error}</p>
    }
    if (result) {
      return (
        <div className="w-full h-full relative flex flex-col items-center justify-center animate-in fade-in duration-1000">
           <div className="relative p-1 bg-black border-2 border-grok-magenta/20 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
            <img src={result.url} alt={result.prompt} className="max-w-full max-h-[40vh] sm:max-h-[50vh] lg:max-h-[500px] object-contain" />
            <button 
                onClick={handleDownload}
                className="absolute bottom-2 right-2 p-2 bg-grok-magenta text-black hover:bg-white shadow-lg border border-black transition-colors"
                title="Download X-Asset"
              >
                <Download className="h-5 w-5" />
              </button>
           </div>
           <div className="mt-4 w-full bg-black/80 p-3 border border-industrial-gray text-left">
              <p className="text-[8px] text-gray-700 font-mono uppercase tracking-[0.3em] mb-1">X_MANIFEST</p>
              <p className="text-[10px] text-grok-magenta font-mono italic uppercase line-clamp-1">"{result.prompt}"</p>
           </div>
        </div>
      );
    }
    return (
        <div className="text-center text-industrial-gray font-mono uppercase tracking-widest opacity-50">
            <XIcon className="mx-auto h-12 w-12 sm:h-20 sm:w-20 mb-4" />
            <p className="text-xs">X_FORGE IDLE</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 w-full h-full">
      <div className="lg:w-2/5 xl:w-1/3 flex flex-col bg-[#0A0B0C] border-2 border-industrial-gray p-4 sm:p-6 shadow-2xl">
        <div className="flex-shrink-0 mb-6 pb-4 border-b-2 border-grok-magenta/20 flex items-center gap-4">
          <Image className="h-6 w-6 text-grok-magenta" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest font-['Black_Ops_One']">// X_FORGE</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            <div className="relative">
                <label htmlFor="grok-prompt" className="block text-[10px] font-mono uppercase tracking-widest text-grok-magenta mb-2">
                    &gt; Directive:
                </label>
                <textarea
                    id="grok-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="FABRICATION DETAILS..."
                    rows={6}
                    className="w-full p-4 bg-black border-2 border-[#333840] text-white focus:outline-none focus:border-grok-magenta font-mono transition-colors text-xs resize-none"
                    required
                    disabled={isLoading}
                />
            </div>
          
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-grok-magenta text-black font-['Black_Ops_One'] uppercase tracking-widest text-lg hover:bg-white transition-colors disabled:bg-industrial-gray disabled:text-gray-700">
                {isLoading ? 'FABRICATING...' : 'GENERATE'}
            </button>
        </form>
      </div>
      
       <div className="flex-1 monitor-screen min-h-[300px] flex flex-col items-center justify-center h-full relative overflow-hidden p-4">
         <div className="absolute top-2 left-4 text-[10px] font-mono text-grok-magenta tracking-widest uppercase font-bold animate-pulse">
            // X_FORGE_MONITOR
        </div>
        <div className="absolute inset-2 border-2 border-grok-magenta/5 pointer-events-none"></div>
        <MonitorContent />
      </div>
    </div>
  );
};

export default GrokImagePanel;