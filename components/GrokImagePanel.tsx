import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateGrokImage } from '../services/grokService';
import { ImageResult } from '../types';
import { useGrokKey } from '../hooks/useGrokKey';
import Button from './common/Button';
import Spinner from './common/Spinner';
import GrokKeyPrompt from './common/GrokKeyPrompt';
import { XIcon, Download } from './common/Icons';
import WorkbenchHeader from './common/WorkbenchHeader';

const FORGE_MESSAGES = [
    "DECRYPTING X-CORP FORGE PROTOCOLS...",
    "CALIBRATING UNCONVENTIONAL LATTICE...",
    "INJECTING RAW PROBABILITY VECTORS...",
    "WELDING EXISTENTIAL CONTINUITY...",
    "BYPASSING AESTHETIC FILTERS...",
    "FINALIZING TEXTURE PARADOXES...",
    "EXTRACTING ARTIFACT FROM THE VOID...",
];


const GrokImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  
  const { apiKey, isReady, saveApiKey } = useGrokKey();
  const logEndRef = useRef<HTMLDivElement>(null);

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
    if (!prompt.trim() || !apiKey) {
      setError('Prompt or API key is missing. Figure it out.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setStatusLog([]);

    try {
        addLog(FORGE_MESSAGES[0]);
        await new Promise(r => setTimeout(r, 500));
        addLog(FORGE_MESSAGES[1]);
        await generateGrokImage(prompt, apiKey);
        // This line will not be reached because generateGrokImage throws an error for the simulation.
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Some unpredictable cosmic event occurred.';
        addLog(`!! SIMULATION_NOTICE: ${errorMessage}`);
        await new Promise(r => setTimeout(r, 1000));

        addLog(FORGE_MESSAGES[2]);
        await new Promise(r => setTimeout(r, 500));
        addLog(FORGE_MESSAGES[4]);
        await new Promise(r => setTimeout(r, 500));

        // Fallback to placeholder image for simulation
        const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`;
        setResult({ url: imageUrl, prompt: prompt });
        addLog(FORGE_MESSAGES[6]);
        addLog("SUCCESS: ARTIFACT FABRICATED (SIMULATED).");

    } finally {
        setIsLoading(false);
    }
  }, [prompt, apiKey]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="Locating X-Forge..." /></div>;
  }
  
  if (!apiKey) {
    return (
        <div className="max-w-3xl mx-auto pt-10 animate-in fade-in-0 slide-in-from-bottom-8">
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-['Black_Ops_One'] text-white mb-2 tracking-widest uppercase">Forge Access Denied</h2>
                <p className="text-grok-magenta font-mono text-xs uppercase tracking-widest">X-Corp_System_Locked // Auth_Required</p>
            </div>
            <GrokKeyPrompt onKeySubmit={saveApiKey} />
        </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin border-2 border-grok-magenta/20 order-2 lg:order-1 lg:w-1/2">
        <WorkbenchHeader title="X-Corp Forge" station="GUEST_SYSTEM" provider="xcorp" />

         <div className="mb-8 p-4 bg-fuchsia-900/20 border-2 border-fuchsia-500/50 text-xs font-mono text-fuchsia-400 uppercase leading-relaxed shadow-inner">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                <span className="font-bold">STATUS: SIMULATION_BAY_ACTIVE</span>
            </div>
            X-Corp Forge architectural logic is operating in verification mode. Generations use cached neural weights for blueprint testing until public API release.
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-grok-magenta mb-2 font-mono">
                &gt; FABRICATION_DIRECTIVE
                </label>
                <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A realistic photo of a cat programming a quantum computer..."
                rows={8}
                className="w-full px-4 py-3 bg-[#111317] border-2 border-[#333840] rounded-none text-white focus:outline-none focus:border-grok-magenta font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase tracking-wider leading-relaxed"
                required
                disabled={isLoading}
                />
            </div>
          
          <Button type="submit" size="xl" disabled={isLoading} provider="xcorp" className="w-full">
            {isLoading ? 'Doing the thing...' : 'Generate'}
          </Button>
        </form>
      </div>
       <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4 border-2 border-grok-magenta/30 order-1 lg:order-2 lg:w-1/2">
         <div className="absolute top-2 left-4 text-xs font-mono text-grok-magenta tracking-widest uppercase font-bold animate-pulse z-20">
            // FORGE_MONITOR_X (GROK)
        </div>
        
        {isLoading && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in-0 duration-500">
                <Spinner text="FORGING REALITY..." />
                <div className="w-full max-w-md bg-black border-2 border-grok-magenta/30 p-4 font-mono text-[10px] text-grok-magenta/80 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-grok-magenta">
                    {statusLog.map((log, i) => (
                        <div key={i} className="mb-1 uppercase tracking-tighter animate-in slide-in-from-left-2 duration-300">
                           {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        )}

        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest">{error}</p>}
        
        {result && !isLoading && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center p-2 animate-in fade-in-0 zoom-in duration-1000">
            <div className="relative group w-full bg-black border-2 border-industrial-gray shadow-2xl overflow-hidden">
              <img src={result.url} alt={result.prompt} className="w-full h-auto max-h-[50vh] mx-auto object-contain" />
              <div className="absolute top-2 right-2 flex gap-2">
                    <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-grok-magenta text-white p-2 hover:bg-fuchsia-600 transition-colors shadow-lg"
                        title="DOWNLOAD_ASSET"
                    >
                        <Download className="h-5 w-5" />
                    </a>
               </div>
               <div className="absolute bottom-2 left-2 text-[10px] text-black font-mono font-black border border-black px-2 py-0.5 bg-grok-magenta">
                    // FORGE_OUTPUT_SIMULATED
               </div>
            </div>
            <div className="mt-4 bg-black/80 p-4 border-2 border-industrial-gray w-full text-left shadow-2xl">
               <div className="border-b border-industrial-gray pb-3">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">PROMPT_LOG</p>
                  <p className="text-xs text-grok-magenta font-mono italic uppercase">"{result.prompt}"</p>
               </div>
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