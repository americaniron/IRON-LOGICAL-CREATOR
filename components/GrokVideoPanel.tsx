import React, { useState, useCallback, useEffect } from 'react';
import { generateGrokVideo } from '../services/grokService';
import { downloadAsset } from '../services/geminiService';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';
import { Video, XIcon, Download, Film } from './common/Icons';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';
import Button from './common/Button';

const GrokVideoPanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [imageFile, setImageFile] = useMountedState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const { addAsset, handleApiError } = useAppContext();
  const { isKeyRequired, isReady, saveKey } = useApiKeyManager('grok');

  const [monitorState, setMonitorState] = useMountedState<'idle' | 'fabricating' | 'active'>('idle');

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile({ file, preview: URL.createObjectURL(file) });
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imageFile) {
      setError('DIRECTIVE MISSING. INPUT MOTION PARAMETERS.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setMonitorState('fabricating');

    try {
      const videoUrl = await generateGrokVideo(prompt, imageFile?.file);
      setResultUrl(videoUrl);
      setMonitorState('active');
      addAsset({
        url: videoUrl,
        type: 'video',
        prompt: prompt || 'X-Motion Synthesis Sequence',
        provider: 'Grok',
      });
    } catch (err) {
        handleApiError(err, 'grok');
        const errorMessage = err instanceof Error ? err.message : 'X-MOTION ENGINE FAILURE.';
        setError(errorMessage.toUpperCase());
        setMonitorState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, imageFile, setIsLoading, setError, setResultUrl, setMonitorState, addAsset, handleApiError]);

  useEffect(() => {
    if (!prompt && !imageFile && !isLoading && !resultUrl) {
      setResultUrl(null);
      setError(null);
      setMonitorState('idle');
    }
  }, [prompt, imageFile, isLoading, resultUrl, setResultUrl, setError, setMonitorState]);

  const handleDownload = () => {
    if (resultUrl) {
      downloadAsset(resultUrl, `x-motion-fab-${Date.now()}.mp4`);
    }
  };

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="SYNCING X-MOTION RIG..." /></div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10 px-4"><ProviderKeyPrompt provider="grok" onKeySubmit={saveKey} /></div>;
  }
  
  const MonitorContent = () => {
    if (monitorState === 'fabricating' || isLoading) {
      return (
        <div className="text-center p-12 bg-black border-4 border-heavy-yellow shadow-[0_0_60px_rgba(255,211,0,0.4)] animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-10 flex justify-center gap-4">
                <Film className="h-16 w-16 text-heavy-yellow animate-pulse" />
                <XIcon className="h-16 w-16 text-white animate-spin-slow" />
            </div>
            <p className="text-2xl font-['Black_Ops_One'] text-heavy-yellow uppercase tracking-[0.2em] mb-4">// Cinematic_Synthesis_Active</p>
            <div className="flex flex-col gap-3 opacity-80">
                <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">&gt; Calibrating Neural_Optics...</p>
                <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">&gt; Generating High-Contrast_Entropy...</p>
                <div className="h-2 w-full bg-asphalt border border-industrial-gray overflow-hidden">
                    <div className="h-full bg-heavy-yellow w-1/2 animate-[load-shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
      );
    }
    if (error && !resultUrl) {
       return (
        <div className="text-center p-10 border-4 border-red-600 bg-red-600/10 max-w-lg">
            <p className="text-red-500 font-['Black_Ops_One'] uppercase tracking-[0.3em] text-3xl mb-4">!! RIG_FAILURE !!</p>
            <p className="font-mono text-xs text-red-400 uppercase tracking-tighter leading-relaxed">{error}</p>
            <div className="mt-8 border-t border-red-600/20 pt-4">
                <Button onClick={() => window.location.reload()} variant="danger" className="mx-auto !text-xs !py-2">Emergency_Reset</Button>
            </div>
        </div>
       )
    }
    if (resultUrl) {
      return (
        <div className="w-full h-full relative flex flex-col items-center justify-center animate-in fade-in duration-1000 p-2 sm:p-10">
           <div className="relative w-full max-w-5xl bg-black border-4 border-industrial-gray shadow-[0_50px_100px_rgba(0,0,0,1)] group">
            <video 
                key={resultUrl}
                src={resultUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto max-h-[50vh] sm:max-h-[70vh] relative z-10" 
            />
            
            {/* Cinematic HUD Elements */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-1">
                <span className="text-[9px] font-mono text-heavy-yellow uppercase font-black bg-black/80 px-2 py-1 border border-heavy-yellow/50">REC // X-MOTION_LENS</span>
                <span className="text-[8px] font-mono text-white/50 bg-black/60 px-2 py-0.5">ISO_800 // 24FPS // 4K_UPRES_ENABLED</span>
            </div>

            <button 
                onClick={handleDownload}
                className="absolute top-6 right-6 p-4 bg-heavy-yellow text-black hover:bg-white shadow-2xl border-2 border-black transition-all active:scale-90 z-30"
                title="Export Cinematic Asset"
              >
                <Download className="h-8 w-8" />
              </button>
           </div>
           
           <div className="mt-8 w-full max-w-4xl bg-black/95 border-4 border-industrial-gray p-8 relative shadow-2xl">
              <div className="absolute top-0 right-0 p-2"><div className="rivet"></div></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 border-b border-industrial-gray pb-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.5em] mb-1">X_Motion_Manifest_Final</p>
                    <h4 className="text-white font-black uppercase text-sm tracking-widest">Enterprise_Cinematic_Unit</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-heavy-yellow animate-pulse"></span>
                    <span className="text-[10px] text-heavy-yellow font-black uppercase tracking-widest">Status: Verified_Synthesised</span>
                  </div>
              </div>
              <div className="bg-asphalt/80 border border-white/5 p-4">
                  <p className="text-xs sm:text-sm text-heavy-yellow font-mono italic uppercase line-clamp-2 leading-relaxed">&gt; "{prompt || 'IMAGE_TO_MOTION_SYNTHESIS_SEQUENCE'}"</p>
              </div>
           </div>
        </div>
      );
    }
    return (
        <div className="text-center text-industrial-gray font-mono uppercase tracking-widest opacity-20 group relative">
            <div className="relative inline-block mb-10">
               <Video className="mx-auto h-32 w-32 sm:h-56 sm:w-56 transition-all duration-700 group-hover:scale-110" />
               <XIcon className="h-16 w-16 text-white absolute bottom-0 right-0 transition-transform group-hover:rotate-180 duration-500" />
            </div>
            <p className="text-2xl font-black tracking-[0.8em]">X_Motion // Standby</p>
            <p className="text-xs mt-4 tracking-[0.4em] opacity-50">Industrial_Synthesizer_Online</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 w-full h-full">
      <div className="lg:w-[450px] flex flex-col control-panel p-0 border-4 border-industrial-gray bg-black shadow-2xl overflow-y-auto scrollbar-thin">
        <div className="flex-shrink-0 p-6 bg-industrial-gray/20 border-b-4 border-industrial-gray flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-heavy-yellow">
              <Film className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-['Black_Ops_One'] text-white uppercase tracking-tighter">X_Motion_Rig</h3>
          </div>
          <div className="flex gap-2">
            <div className="rivet"></div>
            <div className="rivet opacity-50"></div>
          </div>
        </div>

        <div className="p-4 bg-yellow-900/10 border-b border-heavy-yellow/10 flex gap-3 items-center">
            <div className="w-1 h-8 bg-heavy-yellow"></div>
            <p className="text-[9px] font-mono text-heavy-yellow uppercase leading-tight tracking-widest">
                RIG_NOTICE: UNFILTERED CINEMATIC SYNTHESIS IS ACTIVE. BYPASSING ALL STANDARD MOTION RESTRICTIONS.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 sm:p-10 gap-10">
            <div className="space-y-4">
                <FileUpload
                    label="MOTION_BASE_ASSET"
                    onFileChange={handleFileChange}
                    preview={imageFile?.preview}
                />
            </div>

            <div className="relative">
                <div className="flex justify-between items-end mb-3">
                  <label htmlFor="grok-video-prompt" className="block text-[10px] font-mono uppercase tracking-[0.3em] text-heavy-yellow font-black">
                      &gt; MOTION_SEQUENCE_DIRECTIVE:
                  </label>
                  <span className="text-[8px] text-gray-600 font-mono">Ready_ _</span>
                </div>
                <div className="relative">
                  <textarea
                      id="grok-video-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="DEFINE THE CINEMATIC ENTROPY..."
                      rows={8}
                      className="w-full p-6 bg-asphalt border-4 border-industrial-gray text-white focus:outline-none focus:border-heavy-yellow font-mono transition-all text-xs resize-none uppercase tracking-widest leading-relaxed shadow-[inset_0_4px_20px_rgba(0,0,0,0.9)]"
                      required
                      disabled={isLoading}
                  />
                  <div className="absolute top-0 right-0 w-1 h-4 bg-heavy-yellow/30"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-1 bg-heavy-yellow/30"></div>
                </div>
            </div>
          
            <Button type="submit" disabled={isLoading} className="w-full !py-8 !text-3xl mt-auto shadow-[0_10px_40px_rgba(255,211,0,0.2)]">
                {isLoading ? 'SYNTHESIZING...' : 'EXECUTE MOTION'}
            </Button>
        </form>
      </div>
      
       <div className="flex-1 monitor-screen min-h-[450px] flex flex-col items-center justify-center h-full relative overflow-hidden p-6 border-4 border-industrial-gray">
         <div className="absolute top-6 left-8 z-20 flex items-center gap-4">
            <div className="h-3 w-3 bg-red-600 animate-pulse border-2 border-black"></div>
            <span className="text-[12px] font-mono text-heavy-yellow tracking-[0.5em] uppercase font-black">X_Motion_Monitor_01_Cinematic</span>
        </div>
        
        {/* State of the art readout decorative elements */}
        <div className="absolute bottom-6 right-8 z-20 hidden lg:block opacity-30">
            <div className="font-mono text-[8px] text-white flex flex-col items-end gap-1">
                <span>BUFFER_STREAM: OPTIMAL</span>
                <span>DATA_RATE: 4.2GB/S</span>
                <span>X_CORP_SATELLITE_LOCK: 100%</span>
            </div>
        </div>

        <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none"></div>
        <MonitorContent />
      </div>
    </div>
  );
};

export default GrokVideoPanel;