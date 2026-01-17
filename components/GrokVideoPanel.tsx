import React, { useState, useCallback, useEffect } from 'react';
import { generateGrokVideo } from '../services/grokService';
import { downloadAsset } from '../services/geminiService';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';
import { Video, XIcon, Download } from './common/Icons';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';

const GrokVideoPanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [imageFile, setImageFile] = useMountedState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [resultUrl, setResultUrl] = useMountedState<string | null>(null);
  
  const { addAsset } = useAppContext();
  const { apiKey, isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('grok');

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
    if (!prompt.trim() || !apiKey) {
      setError('Directive or Authorization missing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setMonitorState('fabricating');

    try {
      const videoUrl = await generateGrokVideo(prompt, apiKey, imageFile?.file);
      setResultUrl(videoUrl);
      setMonitorState('active');
      addAsset({
        id: `grok-vid-${Date.now()}`,
        url: videoUrl,
        type: 'video',
        prompt: prompt || 'Image to Video generation',
        provider: 'Grok',
        timestamp: Date.now(),
      });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'X-Motion Engine Failure.';
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('403') || err.message.toLowerCase().includes('authentication'))) {
            resetKey();
        }
        setError(errorMessage);
        setMonitorState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey, imageFile, setIsLoading, setError, setResultUrl, setMonitorState, addAsset, resetKey]);

  useEffect(() => {
    if (!prompt && !imageFile) {
      setResultUrl(null);
      setError(null);
      setMonitorState('idle');
    }
  }, [prompt, imageFile, setResultUrl, setError, setMonitorState]);

  const handleDownload = () => {
    if (resultUrl) {
      downloadAsset(resultUrl, `x-motion-fab-${Date.now()}.mp4`);
    }
  };

  if (!isReady) {
    return <div className="flex items-center justify-center h-full font-mono text-grok-magenta animate-pulse uppercase">LOCATING X-MOTION RIG...</div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10"><ProviderKeyPrompt provider="grok" onKeySubmit={saveKey} /></div>;
  }
  
  const MonitorContent = () => {
    if (monitorState === 'fabricating' || isLoading) {
      return (
        <div className="text-center font-mono uppercase text-grok-magenta animate-pulse text-xs sm:text-sm">
            <p className="text-lg font-black tracking-tighter">// X_MOTION_SYNTHESIS_ACTIVE</p>
            <div className="mt-6 flex flex-col gap-2 opacity-50 text-[10px]">
                <p>&gt; Injecting cinematic entropy...</p>
                <p>&gt; Bypassing legal safety barriers...</p>
                <p>&gt; Rendering rebellious frames...</p>
            </div>
        </div>
      );
    }
    if (error && !resultUrl) {
       return (
        <div className="text-center space-y-4 p-6 bg-red-900/20 border-2 border-red-500 max-w-md">
            <p className="text-red-500 font-['Black_Ops_One'] uppercase tracking-widest text-lg">!! ACCESS_DENIED !!</p>
            <p className="font-mono text-[10px] text-red-400 uppercase tracking-tighter">{error}</p>
        </div>
       )
    }
    if (resultUrl) {
      return (
        <div className="w-full h-full relative flex flex-col items-center justify-center animate-in fade-in duration-1000 p-2 sm:p-6">
           <div className="relative w-full bg-black border-2 border-grok-magenta/20 shadow-[0_0_40px_rgba(217,70,239,0.1)] overflow-hidden">
            <video 
                key={resultUrl}
                src={resultUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto max-h-[40vh] sm:max-h-[60vh]" 
            />
            <button 
                onClick={handleDownload}
                className="absolute top-4 right-4 p-3 bg-grok-magenta text-black hover:bg-white shadow-xl border border-black transition-colors"
                title="Download X-Motion Asset"
              >
                <Download className="h-6 w-6" />
              </button>
           </div>
           <div className="mt-6 w-full bg-black/80 p-4 border border-industrial-gray text-left">
              <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.4em]">X_MOTION_MANIFEST</p>
                  <p className="text-[10px] text-grok-magenta font-mono uppercase tracking-widest animate-pulse">VERIFIED_REBELLIOUS</p>
              </div>
              <p className="text-xs sm:text-sm text-grok-magenta font-mono italic uppercase line-clamp-2">"{prompt || 'IMAGE_TO_MOTION_DIRECTIVE'}"</p>
           </div>
        </div>
      );
    }
    return (
        <div className="text-center text-industrial-gray font-mono uppercase tracking-widest opacity-30">
            <Video className="mx-auto h-12 w-12 sm:h-24 sm:w-24 mb-6" />
            <p className="text-sm">X_MOTION_RIG // IDLE</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 w-full h-full">
      <div className="lg:w-2/5 xl:w-1/3 flex flex-col bg-[#0A0B0C] border-2 border-industrial-gray p-4 sm:p-6 shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-grok-magenta">
        <div className="flex-shrink-0 mb-6 pb-4 border-b-2 border-grok-magenta/20 flex items-center gap-4">
          <Video className="h-6 w-6 text-grok-magenta" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest font-['Black_Ops_One']">// X_MOTION</h3>
        </div>

        <div className="mb-6 p-3 bg-fuchsia-900/10 border border-grok-magenta/30 text-[9px] font-mono text-grok-magenta/80 uppercase leading-tight">
            FIELD NOTICE: X-Motion engine is in private beta. High-fidelity simulations are active for valid token holders.
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            <FileUpload
                label="BASE_ASSET"
                onFileChange={handleFileChange}
                preview={imageFile?.preview}
            />

            <div className="relative">
                <label htmlFor="grok-video-prompt" className="block text-[10px] font-mono uppercase tracking-widest text-grok-magenta mb-2 font-bold">
                    &gt; Motion_Directive:
                </label>
                <textarea
                    id="grok-video-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="DESCRIBE THE CINEMATIC SEQUENCE..."
                    rows={6}
                    className="w-full p-4 bg-black border-2 border-[#333840] text-white focus:outline-none focus:border-grok-magenta font-mono transition-colors text-xs resize-none uppercase"
                    required
                    disabled={isLoading}
                />
            </div>
          
            <button type="submit" disabled={isLoading} className="w-full py-5 bg-grok-magenta text-black font-['Black_Ops_One'] uppercase tracking-widest text-xl hover:bg-white transition-colors disabled:bg-industrial-gray disabled:text-gray-700 active:translate-y-1 shadow-[0_4px_0_#701a75]">
                {isLoading ? 'SYNTHESIZING...' : 'IGNITE RIG'}
            </button>
        </form>
      </div>
      
       <div className="flex-1 monitor-screen min-h-[350px] flex flex-col items-center justify-center h-full relative overflow-hidden p-4">
         <div className="absolute top-2 left-4 text-[10px] font-mono text-grok-magenta tracking-widest uppercase font-bold animate-pulse">
            // X_MOTION_MONITOR
        </div>
        <div className="absolute inset-2 border-2 border-grok-magenta/5 pointer-events-none"></div>
        <MonitorContent />
      </div>
    </div>
  );
};

export default GrokVideoPanel;