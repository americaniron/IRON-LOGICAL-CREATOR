import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateOpenAIImage } from '../services/openAIService';
import { ImageResult } from '../types';
import { useOpenAiKey } from '../hooks/useOpenAiKey';
import Button from './common/Button';
import Select from './common/Select';
import Spinner from './common/Spinner';
import OpenAiKeyPrompt from './common/OpenAiKeyPrompt';
import WorkbenchHeader from './common/WorkbenchHeader';
import { Download, Image } from './common/Icons';

const FORGE_MESSAGES = [
    "INITIATING GUEST FORGE PROTOCOLS...",
    "CALIBRATING NEURAL LATTICE...",
    "INJECTING PHOTONIC VECTORS...",
    "WELDING PIXEL CONTINUITY...",
    "ASSEMBLING COMPOSITION LAYERS...",
    "FINALIZING TEXTURE MAPS...",
    "EXTRACTING ASSET FROM VORTEX...",
];

const models = [
    { value: 'dall-e-3', label: 'DALL-E 3 (TITAN CLASS)' }, 
    { value: 'dall-e-2', label: 'DALL-E 2 (UTILITY CLASS)' }
];
const qualities = [
    { value: 'standard', label: 'Standard' }, 
    { value: 'hd', label: 'HD (HIGH_FIDELITY)' }
];
const styles = [
    { value: 'vivid', label: 'Vivid (STYLIZED)' }, 
    { value: 'natural', label: 'Natural (PHOTOREAL)' }
];

const OpenAIImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'dall-e-2' | 'dall-e-3'>('dall-e-3');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  
  const { apiKey, isReady, saveApiKey } = useOpenAiKey();
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
      setError('SYSTEM ERROR: NULL_PROMPT_OR_KEY.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setStatusLog([]);

    try {
      addLog("ACCESSING GUEST FORGE RIG...");
      addLog(`MODEL_SELECTION: ${model.toUpperCase()}`);
      
      await new Promise(r => setTimeout(r, 600));
      addLog(FORGE_MESSAGES[1]);
      
      const imageUrl = await generateOpenAIImage(prompt, apiKey, model, quality, style);
      
      addLog(FORGE_MESSAGES[3]);
      await new Promise(r => setTimeout(r, 400));
      addLog(FORGE_MESSAGES[5]);

      setResult({ url: imageUrl, prompt: prompt });
      addLog("SUCCESS: ASSET_FABRICATED.");
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN GUEST FORGE FAILURE.';
        addLog(`!! CRITICAL_ERROR: ${errorMessage}`);
        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey, model, quality, style]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="INITIALIZING GUEST FORGE..." /></div>;
  }
  
  if (!apiKey) {
    return (
        <div className="max-w-3xl mx-auto pt-10 animate-in fade-in-0 slide-in-from-bottom-8">
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-['Black_Ops_One'] text-white mb-2 tracking-widest uppercase">Forge Access Required</h2>
                <p className="text-guest-green font-mono text-xs uppercase tracking-widest">Guest_Forge_System_Locked // Credentials_Needed</p>
            </div>
            <OpenAiKeyPrompt onKeySubmit={saveApiKey} />
        </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin border-2 border-guest-green/20 order-2 lg:order-1 lg:w-1/2">
        <WorkbenchHeader title="DALL-E Forge" station="GUEST_SYSTEM" provider="guest" />
        
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-guest-green mb-2 font-mono">
                &gt; FABRICATION_BLUEPRINT
                </label>
                <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DEFINE VISUAL PARAMETERS, LIGHTING, AND SUBJECT GEOMETRY..."
                rows={6}
                className="w-full px-4 py-3 bg-[#111317] border-2 border-[#333840] rounded-none text-white focus:outline-none focus:border-guest-green font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase tracking-wider leading-relaxed focus-ring"
                required
                disabled={isLoading}
                />
            </div>

          <Select
              label="FORGE_MODEL_VERSION"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value as 'dall-e-2' | 'dall-e-3')}
              options={models}
              disabled={isLoading}
            />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={model === 'dall-e-2' ? 'opacity-30 pointer-events-none' : ''}>
                <Select
                label="OUTPUT_QUALITY"
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value as 'standard' | 'hd')}
                options={qualities}
                disabled={model === 'dall-e-2' || isLoading}
                />
            </div>
            <div className={model === 'dall-e-2' ? 'opacity-30 pointer-events-none' : ''}>
                <Select
                label="AESTHETIC_STYLE"
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as 'vivid' | 'natural')}
                options={styles}
                disabled={model === 'dall-e-2' || isLoading}
                />
            </div>
          </div>

          <Button type="submit" size="xl" disabled={isLoading} provider="guest" className="w-full">
            {isLoading ? 'FORGING...' : 'INITIALIZE FABRICATION'}
          </Button>
        </form>
      </div>

       <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4 border-2 border-guest-green/30 order-1 lg:order-2 lg:w-1/2">
         <div className="absolute top-2 left-4 text-xs font-mono text-guest-green tracking-widest uppercase font-bold animate-pulse z-20">
            // FORGE_MONITOR_02 (GUEST)
        </div>
        
        {isLoading && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in-0 duration-500">
                <Spinner text="SYNTHESIZING VECTORS..." />
                <div className="w-full max-w-md bg-black border-2 border-guest-green/30 p-4 font-mono text-[10px] text-guest-green/80 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-guest-green">
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
                        className="bg-guest-green text-black p-2 hover:bg-green-300 transition-colors shadow-lg"
                        title="DOWNLOAD_ASSET"
                    >
                        <Download className="h-5 w-5" />
                    </a>
               </div>
               <div className="absolute bottom-2 left-2 text-[10px] text-black font-mono font-black border border-black px-2 py-0.5 bg-guest-green">
                    // FORGE_OUTPUT_{model.toUpperCase()}
               </div>
            </div>
            <div className="mt-4 bg-black/80 p-4 border-2 border-industrial-gray w-full text-left shadow-2xl space-y-4">
               <div className="border-b border-industrial-gray pb-3">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">Manifest_Log</p>
                  <p className="text-xs text-guest-green font-mono italic uppercase">"{result.prompt}"</p>
               </div>
               <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-gray-600 uppercase">
                  <div>Model: {model}</div>
                  <div>Quality: {quality}</div>
                  <div>Style: {style}</div>
               </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest">
            <div className="mb-4 text-4xl opacity-10">
              <Image className="mx-auto h-20 w-20" />
            </div>
            <p className="text-sm">GUEST_FORGE_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAIImagePanel;