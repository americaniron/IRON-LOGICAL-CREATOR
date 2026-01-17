import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Task } from '../types';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import Select from './common/Select';
import Slider from './common/Slider';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import { useVeo } from '../hooks/useVeo';
import { upscaleVideo, downloadAsset } from '../services/geminiService';
import { Download, Maximize, Video } from './common/Icons';

interface VideoPanelProps {
  task: Task.TextToVideo | Task.ImageToVideo;
}

const aspectRatios = ["16:9", "9:16"];
const resolutions = ["720p", "1080p"];
const models = ["veo-3.1-fast-generate-preview", "veo-3.1-generate-preview"];
const upscaleStrengths = [{value: '2x', label: '2X RESOLUTION'}, {value: '4x', label: '4X FIDELITY'}];

const VideoPanel: React.FC<VideoPanelProps> = ({ task }) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(15);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [model, setModel] = useState('veo-3.1-generate-preview');
  const [imageFile, setImageFile] = useState<{ file: File; preview: string } | null>(null);
  
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);
  const [upscaleStrength, setUpscaleStrength] = useState('2x');

  const { addAsset } = useAppContext();
  const { isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('gemini_pro');
  const { isLoading, error, resultUrl, progressMessage, estimatedTimeRemaining, generateVideo } = useVeo();

  const maxDuration = useMemo(() => {
    return model === 'veo-3.1-generate-preview' ? 60 : 15;
  }, [model]);

  // Logic to lock resolution to 720p for long-form content (>8s)
  useEffect(() => {
    if (duration > 8 && resolution === '1080p') {
      setResolution('720p');
    }
  }, [duration, resolution]);

  useEffect(() => {
    if (duration > maxDuration) {
      setDuration(maxDuration);
    }
  }, [maxDuration, duration]);
  
  useEffect(() => {
    setUpscaledUrl(null);
    setUpscaleError(null);
    if (resultUrl) {
        addAsset({
            id: `gemini-vid-${Date.now()}`,
            url: resultUrl,
            type: 'video',
            prompt: prompt || 'Image to Video generation',
            provider: 'Gemini',
            timestamp: Date.now(),
        });
    }
  }, [resultUrl]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile({ file, preview: URL.createObjectURL(file) });
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && task === Task.TextToVideo) return;
    if (!imageFile && task === Task.ImageToVideo) return;
    
    await generateVideo({
        prompt: prompt.trim(),
        duration,
        aspectRatio,
        resolution,
        model,
        imageFile: imageFile?.file
    }, resetKey);
  }, [prompt, duration, aspectRatio, resolution, model, imageFile, task, generateVideo, resetKey]);

  const handleUpscale = useCallback(async () => {
    if (!resultUrl) return;
    setIsUpscaling(true);
    setUpscaleError(null);
    try {
      const enhancedUrl = await upscaleVideo(resultUrl, upscaleStrength);
      setUpscaledUrl(enhancedUrl);
    } catch (err) {
      setUpscaleError(err instanceof Error ? err.message : 'Upscale failure.');
    } finally {
      setIsUpscaling(false);
    }
  }, [resultUrl, upscaleStrength]);

  const currentVideoUrl = upscaledUrl || resultUrl;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 w-full h-full">
      <div className="control-panel p-4 sm:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-industrial-gray">
            <div>
              <h3 className="text-2xl sm:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                {task === Task.TextToVideo ? 'ASSEMBLY' : 'VFX_RIG'}
              </h3>
              <p className="text-[10px] font-mono text-cyan-400 tracking-[0.4em] uppercase font-bold">STATION_42 // ONLINE</p>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
          {isReady && isKeyRequired && (
            <ProviderKeyPrompt provider="gemini_pro" onKeySubmit={saveKey} />
          )}
          
          {task === Task.ImageToVideo && (
            <FileUpload
              label="BASE_FRAME"
              onFileChange={handleFileChange}
              preview={imageFile?.preview}
            />
          )}
          
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-2 font-mono">
              &gt; BLUEPRINT_DIRECTIVE
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ENTER SCENE SPECIFICATIONS..."
              rows={4}
              className="w-full px-4 py-3 bg-[#111317] border-2 border-[#333840] text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner transition-colors text-xs uppercase"
              required={task === Task.TextToVideo}
            />
          </div>

          <Slider
            label="TIMELINE_LENGTH"
            id="duration"
            min={5}
            max={maxDuration}
            step={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            displayValue={`${duration}s`}
          />

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Select
              label="RATIO"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
            />
            <Select
                label="FIDELITY"
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                options={resolutions.map(r => ({ 
                    value: r, 
                    label: r === '1080p' && duration > 8 ? `${r} (8S LIMIT)` : r 
                }))}
                disabled={duration > 8}
            />
          </div>

          <Select
              label="ENGINE"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ 
                  value: m, 
                  label: m.includes('fast') ? 'RAPID (15S MAX)' : 'ENTERPRISE (60S MAX)' 
              }))}
            />

          {duration > 8 && (
            <p className="text-[10px] font-mono text-orange-500 uppercase animate-pulse">
               // Notice: Long-form fabrication (>8s) requires 720p calibration.
            </p>
          )}

          <Button type="submit" disabled={isLoading || isKeyRequired} className="w-full !py-4 sm:!py-6">
            {isLoading ? 'ORCHESTRATING...' : 'INITIALIZE'}
          </Button>
        </form>
      </div>

      <div className="monitor-screen min-h-[300px] flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4">
        <div className="absolute top-2 left-4 text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold animate-pulse">
            // PROD_MONITOR_01
        </div>
        
        {isLoading && (
          <div className="text-center">
            <Spinner text={progressMessage.toUpperCase()} />
            {estimatedTimeRemaining !== null && (
              <p className="mt-4 font-mono text-[10px] text-cyan-400 animate-pulse tracking-widest">
                EST_TIME: {Math.floor(estimatedTimeRemaining / 60)}m {estimatedTimeRemaining % 60}s
              </p>
            )}
          </div>
        )}
        
        {isUpscaling && <Spinner text="ENHANCING VISUALS..." />}
        
        {error && (
            <div className="text-center space-y-4 p-6 bg-red-900/20 border-2 border-red-500">
                <p className="text-red-500 font-['Black_Ops_One'] uppercase tracking-widest text-lg">!! FAILURE !!</p>
                <p className="font-mono text-[8px] text-red-400 uppercase tracking-tighter">{error}</p>
                <Button onClick={() => window.location.reload()} variant="danger" className="mx-auto mt-4 !text-[10px] !py-2">RESET</Button>
            </div>
        )}
        
        {currentVideoUrl && !isLoading && !isUpscaling && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center animate-in fade-in duration-700">
            <div className="relative group w-full bg-black border-2 border-industrial-gray shadow-2xl overflow-hidden">
              <video 
                key={currentVideoUrl}
                src={currentVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto max-h-[40vh] sm:max-h-[50vh]" 
              />
              <div className="absolute top-4 right-4 caution-stripes h-4 w-16 opacity-30"></div>
            </div>
            
            <div className="mt-4 bg-black/80 p-3 sm:p-4 border-2 border-industrial-gray w-full text-left shadow-2xl space-y-4">
               <div className="flex justify-between items-center border-b border-industrial-gray pb-2">
                    <p className="text-[10px] text-white font-mono uppercase tracking-widest font-bold">ASSET_MANIFEST</p>
                    <button
                        onClick={() => downloadAsset(currentVideoUrl, `im-fab-${Date.now()}.mp4`)}
                        className="flex items-center gap-2 bg-cyan-400 text-black px-3 py-1.5 text-[10px] font-['Black_Ops_One'] uppercase tracking-widest hover:bg-white transition-colors"
                    >
                        <Download className="h-3 w-3" />
                        Export
                    </button>
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
            <p className="text-xs">PROD_BAY_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;
