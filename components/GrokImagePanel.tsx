import React, { useState, useCallback, useEffect } from 'react';
import { generateGrokImage } from '../services/grokService';
import { downloadAsset } from '../services/geminiService';
import { ImageResult } from '../types';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';
import { Image, XIcon, Download, Gear } from './common/Icons';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import Button from './common/Button';
import Spinner from './common/Spinner';

const GrokImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [result, setResult] = useMountedState<ImageResult | null>(null);
  
  const { addAsset, handleApiError } = useAppContext();
  const { isKeyRequired, isReady, saveKey } = useApiKeyManager('grok');

  const [monitorState, setMonitorState] = useMountedState<'idle' | 'booting' | 'active'>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('DIRECTIVE MISSING. INPUT DATA REQUIRED.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMonitorState('booting');

    try {
      await new Promise(res => setTimeout(res, 1500));
      const imageUrl = await generateGrokImage(prompt);
      setResult({ url: imageUrl, prompt: prompt });
      setMonitorState('active');
      addAsset({
        url: imageUrl,
        type: 'image',
        prompt: prompt,
        provider: 'Grok',
      });
    } catch (err) {
        handleApiError(err, 'grok');
        const errorMessage = err instanceof Error ? err.message : 'FABRICATION CORE FAILURE.';
        setError(errorMessage.toUpperCase());
        setMonitorState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, setIsLoading, setError, setResult, setMonitorState, addAsset, handleApiError]);

  useEffect(() => {
    if (!prompt && !isLoading && !result) {
      setResult(null);
      setError(null);
      setMonitorState('idle');
    }
  }, [prompt, isLoading, result, setResult, setError, setMonitorState]);

  const handleDownload = () => {
    if (result) {
      downloadAsset(result.url, `grok-fab-${Date.now()}.png`);
    }
  };

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="LOCATING X-FORGE RIG..." /></div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10 px-4"><ProviderKeyPrompt provider="grok" onKeySubmit={saveKey} /></div>;
  }
  
  const MonitorContent = () => {
    if (monitorState === 'booting' || isLoading) {
      return (
        <div className="text-center">
            <div className="relative mb-8">
              <Gear className="h-20 w-20 text-heavy-yellow animate-[spin_4s_linear_infinite] mx-auto opacity-50" />
              <XIcon className="h-10 w-10 text-white absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-['Black_Ops_One'] text-heavy-yellow animate-pulse uppercase tracking-[0.2em]">Initialising_X-Forge_Core</p>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">&gt; Bypassing Artistic_Safety_Constraints...</p>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">&gt; Injecting_Rebellious_Parameters...</p>
            </div>
        </div>
      );
    }
    if (error && !result) {
       return (
         <div className="text-center p-8 border-4 border-red-600 bg-red-600/10 max-w-md animate-in fade-in duration-300">
           <p className="text-red-500 font-black font-mono text-2xl mb-4">!! CORE_FAILURE !!</p>
           <p className="text-red-400 font-mono text-xs uppercase tracking-tighter">{error}</p>
         </div>
       )
    }
    if (result) {
      return (
        <div className="w-full h-full relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000 p-4">
           <div className="relative p-2 bg-asphalt border-4 border-industrial-gray shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-heavy-yellow/5 to-transparent pointer-events-none"></div>
            <img src={result.url} alt={result.prompt} className="max-w-full max-h-[40vh] sm:max-h-[60vh] lg:max-h-[500px] object-contain relative z-10" />
            
            {/* HUD Elements on Image */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
               <div className="h-4 w-1 bg-heavy-yellow animate-pulse"></div>
               <span className="text-[10px] font-mono text-heavy-yellow uppercase font-bold tracking-tighter">X-FORGE_OUTPUT_SECURED</span>
            </div>

            <button 
                onClick={handleDownload}
                className="absolute bottom-4 right-4 p-4 bg-heavy-yellow text-black hover:bg-white shadow-2xl border-2 border-black transition-all active:scale-95 z-30 group"
                title="Export X-Asset"
              >
                <Download className="h-6 w-6 group-hover:translate-y-0.5 transition-transform" />
              </button>
           </div>
           
           <div className="mt-8 w-full max-w-2xl bg-black border-4 border-industrial-gray p-6 relative overflow-hidden shadow-2xl">
              <div className="caution-stripes h-1 absolute top-0 left-0 right-0 opacity-30"></div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.4em] font-bold">X_Asset_Manifest</p>
                <span className="text-[9px] font-mono text-heavy-yellow font-black animate-pulse">AUTHENTIC_GROK_FABRICATION</span>
              </div>
              <p className="text-xs sm:text-sm text-heavy-yellow font-mono italic uppercase line-clamp-2 leading-relaxed">&gt; "{result.prompt}"</p>
           </div>
        </div>
      );
    }
    return (
        <div className="text-center text-industrial-gray font-mono uppercase tracking-widest opacity-20 group">
            <XIcon className="mx-auto h-24 w-24 sm:h-40 sm:w-40 mb-8 transition-transform group-hover:rotate-90 duration-700" />
            <p className="text-lg font-black tracking-[0.5em]">X_Forge // Idle</p>
            <p className="text-[10px] mt-2 tracking-widest">Standing_By_For_Directives</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 w-full h-full">
      <div className="lg:w-[400px] flex flex-col control-panel p-0 border-4 border-industrial-gray bg-black shadow-2xl overflow-hidden">
        <div className="flex-shrink-0 p-6 bg-industrial-gray/20 border-b-4 border-industrial-gray flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-heavy-yellow">
              <Image className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-['Black_Ops_One'] text-white uppercase tracking-tighter">X_Forge_Rig</h3>
          </div>
          <div className="rivet"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 sm:p-8 gap-8">
            <div className="relative">
                <div className="flex justify-between items-end mb-3">
                  <label htmlFor="grok-prompt" className="block text-[10px] font-mono uppercase tracking-[0.3em] text-heavy-yellow font-black">
                      &gt; FABRICATION_BLUEPRINT:
                  </label>
                  <span className="text-[8px] text-gray-600 font-mono">Input_Required_ _</span>
                </div>
                <div className="relative">
                  <textarea
                      id="grok-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="DEFINE THE UNFILTERED VISION..."
                      rows={8}
                      className="w-full p-5 bg-asphalt border-4 border-industrial-gray text-white focus:outline-none focus:border-heavy-yellow font-mono transition-all text-xs resize-none uppercase tracking-wider shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]"
                      required
                      disabled={isLoading}
                  />
                  <div className="absolute bottom-4 right-4 h-2 w-2 bg-heavy-yellow animate-pulse"></div>
                </div>
            </div>

            <div className="bg-industrial-gray/10 p-4 border border-industrial-gray font-mono text-[9px] text-gray-500 uppercase leading-relaxed">
              <span className="text-heavy-yellow font-bold">WARNING:</span> THIS RIG BYPASSES STANDARD CORPORATE FILTERS. ALL FABRICATIONS ARE UNFILTERED AND HIGH-FIDELITY.
            </div>
          
            <Button type="submit" disabled={isLoading} className="w-full !py-6 !text-2xl mt-auto">
                {isLoading ? 'FABRICATING...' : 'EXECUTE FORGE'}
            </Button>
        </form>
      </div>
      
       <div className="flex-1 monitor-screen min-h-[400px] flex flex-col items-center justify-center h-full relative overflow-hidden p-6 border-4 border-industrial-gray">
         <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
            <div className="h-2 w-2 bg-heavy-yellow animate-ping"></div>
            <span className="text-[10px] font-mono text-heavy-yellow tracking-[0.3em] uppercase font-black">Forge_Monitor_Live</span>
        </div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 right-0 p-4 opacity-50"><div className="w-12 h-1 bg-heavy-yellow"></div><div className="w-1 h-12 bg-heavy-yellow ml-auto"></div></div>
        <div className="absolute bottom-0 left-0 p-4 opacity-50"><div className="w-1 h-12 bg-heavy-yellow"></div><div className="w-12 h-1 bg-heavy-yellow mt-auto"></div></div>

        <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none"></div>
        <MonitorContent />
      </div>
    </div>
  );
};

export default GrokImagePanel;