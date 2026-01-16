import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateOpenAIVideo } from '../services/openAIService';
import { useOpenAiKey } from '../hooks/useOpenAiKey';
import Button from './common/Button';
import Spinner from './common/Spinner';
import OpenAiKeyPrompt from './common/OpenAiKeyPrompt';
import Select from './common/Select';
import WorkbenchHeader from './common/WorkbenchHeader';
import { Video, Maximize } from './common/Icons';

const upscaleStrengths = [{value: '2x', label: '2X RESOLUTION'}, {value: '4x', label: '4X FIDELITY'}];

const OpenAIVideoPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);
  const [upscaleStrength, setUpscaleStrength] = useState('2x');

  const { apiKey, isReady, saveApiKey } = useOpenAiKey();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUpscaledUrl(null);
    setUpscaleError(null);
  }, [resultUrl]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [statusLog]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setStatusLog(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('SYSTEM ERROR: NULL_PROMPT_BLUEPRINT.');
      return;
    }
    
    if (!apiKey) {
      setError('SYSTEM ERROR: UNAUTHORIZED_ACCESS. API_KEY_REQUIRED.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setStatusLog([]);

    try {
      addLog("INITIALIZING GUEST SYNTHESIZER RIG...");
      addLog("VALIDATING VORTEX_CREDENTIALS...");
      await new Promise(r => setTimeout(r, 800));
      
      addLog("ESTABLISHING ENCRYPTED LINK TO SORA CLUSTER...");
      addLog("UPLOADING CINEMATIC BLUEPRINT DATA...");
      await new Promise(r => setTimeout(r, 1200));

      addLog("SYNTHESIZING PIXEL VECTORS...");
      addLog("COMPUTING TEMPORAL CONTINUITY...");
      
      const videoUrl = await generateOpenAIVideo(prompt, apiKey);
      
      addLog("FABRICATION COMPLETE. WRAPPING ASSET CONTAINER...");
      await new Promise(r => setTimeout(r, 500));
      
      setResultUrl(videoUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN GUEST SYNTHESIZER FAILURE.';
      addLog(`!! CRITICAL_ERROR: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey]);
  
  const handleUpscale = useCallback(async () => {
    setIsUpscaling(true);
    setUpscaleError("GUEST NOTICE: ASSET_ENHANCEMENT IS CURRENTLY IN SIMULATION MODE.");
    await new Promise(r => setTimeout(r, 2000));
    setIsUpscaling(false);
  }, []);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="INITIALIZING GUEST SYSTEMS..." /></div>;
  }
  
  if (!apiKey) {
    return (
      <div className="max-w-3xl mx-auto pt-10 animate-in fade-in-0 slide-in-from-bottom-8">
        <OpenAiKeyPrompt onKeySubmit={saveApiKey} />
      </div>
    );
  }

  const currentVideoUrl = upscaledUrl || resultUrl;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin order-2 lg:order-1 lg:w-1/2">
        <WorkbenchHeader title="Sora Synth" station="GUEST_SYSTEM" provider="guest" />

        <div className="mb-6 p-4 bg-yellow-900/20 border-2 border-yellow-500/50 text-xs font-mono text-yellow-500 uppercase leading-relaxed shadow-inner">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="font-bold text-yellow-400">STATUS: SIMULATION_DRIVE_ACTIVE</span>
            </div>
            This module is a high-fidelity prototype. The OpenAI Sora API is currently in restricted preview. Generations use cached architectural logic for verification.
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-guest-green mb-2 font-mono">
                &gt; CINEMATIC_BLUEPRINT
                </label>
                <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DESCRIBE THE SCENE..."
                rows={10}
                className="w-full px-4 py-3 bg-[#111317] border-2 border-[#333840] rounded-none text-white focus:outline-none focus:border-guest-green font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase tracking-wider leading-relaxed focus-ring"
                required
                disabled={isLoading}
                />
            </div>

          <Button type="submit" disabled={isLoading} provider="guest" className="w-full !py-6">
            {isLoading ? 'SYNTHESIZING...' : 'INITIALIZE FABRICATION'}
          </Button>
        </form>
      </div>

       <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4 order-1 lg:order-2 lg:w-1/2">
         <div className="absolute top-2 left-4 text-xs font-mono text-guest-green tracking-widest uppercase font-bold animate-pulse z-20">
            // MONITOR_03 (GUEST)
        </div>
        
        {isLoading && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in-0 duration-500">
                <Spinner text="RENDERING..." />
                <div className="w-full max-w-md bg-black border-2 border-guest-green/30 p-4 font-mono text-xs text-guest-green/80 overflow-y-auto max-h-40 scrollbar-thin">
                    {statusLog.map((log, i) => (
                        <div key={i} className="mb-1 uppercase tracking-tighter animate-in slide-in-from-left-2 duration-300">{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        )}

        {isUpscaling && <Spinner text="ENHANCING..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest">{error}</p>}
        
        {currentVideoUrl && !isLoading && !isUpscaling && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center p-2 animate-in fade-in-0 zoom-in duration-1000">
            <div className="relative group w-full bg-black border-2 border-industrial-gray shadow-2xl overflow-hidden">
              <video key={currentVideoUrl} src={currentVideoUrl} controls autoPlay loop className="w-full h-auto max-h-[40vh]" />
            </div>
            <div className="mt-4 bg-black/80 p-4 border-2 border-industrial-gray w-full text-left shadow-2xl space-y-4">
               <div className="border-b border-industrial-gray pb-3 flex justify-between items-center">
                  <p className="text-[10px] text-guest-green font-mono uppercase tracking-[0.3em]">ASSET_SYNTHESIZED</p>
               </div>
                <div className="bg-asphalt/50 border border-industrial-gray p-4">
                  <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-guest-green mb-4">
                    <Maximize className="h-4 w-4"/> Fidelity Boost (Prototype)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                     <Select label="Strength" id="upscale_strength" value={upscaleStrength} onChange={(e) => setUpscaleStrength(e.target.value)} options={upscaleStrengths} />
                      <Button onClick={handleUpscale} provider="guest" className="!py-3 !text-sm" disabled title="This feature is a prototype and not yet implemented.">Initiate Enhancement</Button>
                  </div>
                  {upscaleError && <p className="text-guest-green text-[10px] font-mono mt-2 text-center uppercase">{upscaleError}</p>}
               </div>
            </div>
          </div>
        )}
        
        {!isLoading && !isUpscaling && !error && !resultUrl && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest">
            <Video className="mx-auto h-20 w-20 opacity-10 mb-4" />
            <p className="text-sm">GUEST_SYNTH_BAY_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAIVideoPanel;