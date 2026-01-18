import React, { useState, useCallback, useEffect } from 'react';
import { generateOpenAIVideo, upscaleOpenAIVideo } from '../services/openAIService';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import { downloadAsset } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import Select from './common/Select';
import FileUpload from './common/FileUpload';
import { Video, Maximize, Download } from './common/Icons';

const upscaleStrengths = [{value: '2x', label: '2X RESOLUTION'}, {value: '4x', label: '4X FIDELITY'}];

const OpenAIVideoPanel: React.FC = () => {
  const [prompt, setPrompt] = useMountedState('');
  const [imageFile, setImageFile] = useMountedState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useMountedState(false);
  const [error, setError] = useMountedState<string | null>(null);
  const [resultUrl, setResultUrl] = useMountedState<string | null>(null);
  
  const [isUpscaling, setIsUpscaling] = useMountedState(false);
  const [upscaledUrl, setUpscaledUrl] = useMountedState<string | null>(null);
  const [upscaleError, setUpscaleError] = useMountedState<string | null>(null);
  
  // Persisted Preference
  const [upscaleStrength, setUpscaleStrength] = useLocalStorage('im_pref_oai_vid_upscale', '2x');

  const { addAsset } = useAppContext();
  const { apiKey, isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('openai');

  useEffect(() => {
    setUpscaledUrl(null);
    setUpscaleError(null);
  }, [resultUrl, setUpscaledUrl, setUpscaleError]);

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
      setError('SYSTEM ERROR: NULL_DIRECTIVE_DATA.');
      return;
    }
    if (!apiKey) return;

    setIsLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const videoUrl = await generateOpenAIVideo(prompt, apiKey);
      setResultUrl(videoUrl);
      addAsset({
        id: `openai-vid-${Date.now()}`,
        url: videoUrl,
        type: 'video',
        prompt: prompt || 'Image to Video generation',
        provider: 'OpenAI',
        timestamp: Date.now(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN GUEST SYNTHESIZER FAILURE.';
      if (err instanceof Error && (err.message.includes('401') || err.message.toLowerCase().includes('incorrect api key'))) {
        resetKey();
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey, imageFile, setIsLoading, setError, setResultUrl, addAsset, resetKey]);
  
  const handleUpscale = useCallback(async () => {
    if (!resultUrl || !apiKey) return;
    setIsUpscaling(true);
    setUpscaleError(null);
    try {
      const enhancedUrl = await upscaleOpenAIVideo(resultUrl, upscaleStrength);
      setUpscaledUrl(enhancedUrl);
    } catch (err) {
      setUpscaleError(err instanceof Error ? err.message : 'Unknown upscaling error.');
    } finally {
      setIsUpscaling(false);
    }
  }, [resultUrl, upscaleStrength, apiKey, setIsUpscaling, setUpscaleError, setUpscaledUrl]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="INITIALIZING SORA SYNTHESIZER..." /></div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10 px-4"><ProviderKeyPrompt provider="openai" onKeySubmit={saveKey} /></div>;
  }

  const currentVideoUrl = upscaledUrl || resultUrl;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 w-full h-full">
      <div className="control-panel p-4 sm:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-end mb-6 sm:mb-8 pb-4 border-b-2 border-industrial-gray">
          <div>
              <h3 className="text-2xl sm:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                Sora Synthesizer
              </h3>
              <p className="text-[10px] font-mono text-heavy-yellow tracking-[0.4em] uppercase font-bold">GUEST_SYSTEM // ONLINE</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <FileUpload
              label="BASE_FRAME (OPTIONAL)"
              onFileChange={handleFileChange}
              preview={imageFile?.preview}
            />

            <div className="relative group">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-heavy-yellow mb-2 font-mono">
                &gt; CINEMATIC_BLUEPRINT_DIRECTIVE
                </label>
                <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DEFINE SUBJECTS, ACTIONS, AND ENVIRONMENT..."
                rows={6}
                className="w-full px-4 py-3 bg-asphalt border-2 border-industrial-gray rounded-none text-white focus:outline-none focus:border-heavy-yellow font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-xs sm:text-sm uppercase tracking-wider"
                required={!imageFile}
                />
            </div>

          <Button type="submit" disabled={isLoading} className="w-full !py-4 sm:!py-6">
            {isLoading ? 'SYNTHESIZING...' : 'FABRICATE VIDEO'}
          </Button>
        </form>
      </div>

       <div className="monitor-screen min-h-[300px] flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4">
         <div className="absolute top-2 left-4 text-[10px] font-mono text-heavy-yellow tracking-widest uppercase font-bold animate-pulse">
            // SYNTH_MONITOR_03
        </div>
        
        {isLoading && <Spinner text="RENDERING TIMELINE..." />}
        {isUpscaling && <Spinner text="ENHANCING VISUAL DATA..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-4 sm:p-6 bg-red-500/10 uppercase tracking-widest text-xs">{error}</p>}
        
        {currentVideoUrl && !isLoading && !isUpscaling && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center animate-in fade-in duration-1000">
            <div className="relative group w-full bg-black border-2 border-industrial-gray shadow-2xl overflow-hidden">
              <video 
                key={currentVideoUrl}
                src={currentVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto max-h-[40vh] sm:max-h-[50vh]" 
              />
              <button 
                onClick={() => downloadAsset(currentVideoUrl, `oai-synth-${Date.now()}.mp4`)}
                className="absolute top-4 right-4 p-2 bg-heavy-yellow text-black hover:bg-white shadow-lg border border-black transition-colors"
                title="Download Synth Asset"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 bg-black/80 p-3 sm:p-4 border-2 border-industrial-gray w-full text-left shadow-2xl space-y-4">
                <div className="border-b border-industrial-gray pb-2">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-1">Manifest_Log</p>
                  <p className="text-[10px] sm:text-xs text-heavy-yellow font-mono italic uppercase line-clamp-2">"{prompt || 'IMAGE_TO_VIDEO_SYNTHESIS'}"</p>
                </div>
                <div className="bg-asphalt/50 border border-industrial-gray p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                     <Select
                        label="MOD_STRENGTH"
                        id="upscale_strength"
                        value={upscaleStrength}
                        onChange={(e) => setUpscaleStrength(e.target.value)}
                        options={upscaleStrengths}
                        disabled={isUpscaling}
                      />
                      <Button onClick={handleUpscale} disabled={isUpscaling} className="!py-2 !text-[10px]">
                        {isUpscaling ? 'ENHANCING...' : 'ENHANCE'}
                      </Button>
                  </div>
               </div>
            </div>
          </div>
        )}
        
        {!isLoading && !isUpscaling && !error && !resultUrl && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest opacity-50">
            <Video className="mx-auto h-12 w-12 sm:h-20 sm:w-20 mb-4" />
            <p className="text-xs">SYNTH_BAY_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAIVideoPanel;