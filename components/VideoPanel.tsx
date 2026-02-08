import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Task, FABRICATION_COSTS } from '../types';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Button from './common/Button';
import Select from './common/Select';
import Slider from './common/Slider';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import { useVeo } from '../hooks/useVeo';
import { upscaleVideo, downloadAsset } from '../services/geminiService';
import { Download, Maximize, Video, Gear } from './common/Icons';

interface VideoPanelProps {
  task: Task.TextToVideo | Task.ImageToVideo;
}

const aspectRatios = ["16:9", "9:16"];
const resolutions = ["720p", "1080p"];
const models = ["veo-3.1-fast-generate-preview", "veo-3.1-generate-preview"];
const upscaleStrengths = [{value: '2x', label: '2X Resolution'}, {value: '4x', label: '4X Fidelity'}];

const VideoPanel: React.FC<VideoPanelProps> = ({ task }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<{ file: File; preview: string } | null>(null);
  
  const [duration, setDuration] = useLocalStorage('im_pref_vid_duration', 15);
  const [aspectRatio, setAspectRatio] = useLocalStorage('im_pref_vid_ar', '16:9');
  const [resolution, setResolution] = useLocalStorage('im_pref_vid_res', '720p');
  const [model, setModel] = useLocalStorage('im_pref_vid_model', 'veo-3.1-generate-preview');
  const [upscaleStrength, setUpscaleStrength] = useLocalStorage('im_pref_vid_upscale', '2x');
  
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);

  const { addAsset, hasSufficientCredits, consumeCredits } = useAppContext();
  const { isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('gemini_pro', { model });
  const { isLoading, error, resultUrl, progressMessage, estimatedTimeRemaining, generateVideo } = useVeo();

  const cost = task === Task.TextToVideo ? FABRICATION_COSTS[Task.TextToVideo] : FABRICATION_COSTS[Task.ImageToVideo];

  const maxDuration = useMemo(() => {
    return model === 'veo-3.1-generate-preview' ? 60 : 15;
  }, [model]);

  const resolutionOptions = useMemo(() => {
    if (model === 'veo-3.1-generate-preview' || duration > 8) {
      return resolutions
        .filter(r => r === '720p')
        .map(r => ({ value: r, label: r }));
    }
    return resolutions.map(r => ({ value: r, label: r }));
  }, [model, duration]);

  useEffect(() => {
    const is1080pInvalid = model === 'veo-3.1-generate-preview' || duration > 8;
    if (is1080pInvalid && resolution === '1080p') {
      setResolution('720p');
    }
  }, [model, duration, resolution, setResolution]);

  useEffect(() => {
    if (duration > maxDuration) {
      setDuration(maxDuration);
    }
  }, [maxDuration, duration, setDuration]);
  
  useEffect(() => {
    setUpscaledUrl(null);
    setUpscaleError(null);
    if (resultUrl) {
        addAsset({
            url: resultUrl,
            type: 'video',
            prompt: prompt || 'Video generation',
            provider: 'Gemini',
        });
    }
  }, [resultUrl, addAsset, prompt]);

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
    
    if (!hasSufficientCredits(task)) {
        alert("You do not have enough credits for this action.");
        return;
    }

    const startSuccess = await consumeCredits(task);
    if (!startSuccess) return;

    await generateVideo({
        prompt: prompt.trim(),
        duration,
        aspectRatio,
        resolution,
        model,
        imageFile: imageFile?.file
    });
  }, [prompt, duration, aspectRatio, resolution, model, imageFile, task, generateVideo, hasSufficientCredits, consumeCredits]);

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

  const isQuotaError = useMemo(() => {
    if (!error) return false;
    const lowerError = error.toLowerCase();
    return lowerError.includes('quota') || lowerError.includes('429') || lowerError.includes('resource_exhausted') || lowerError.includes('limit');
  }, [error]);

  const isProjectError = useMemo(() => {
    if (!error) return false;
    const lowerError = error.toLowerCase();
    return lowerError.includes('project error') || lowerError.includes('404') || lowerError.includes('not found');
  }, [error]);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 w-full h-full">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm p-4 md:p-6 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
          {task === Task.TextToVideo ? 'Text-to-Video Settings' : 'Image-to-Video Settings'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {isReady && isKeyRequired && (
            <ProviderKeyPrompt provider="gemini_pro" onKeySubmit={saveKey} />
          )}
          
          {task === Task.ImageToVideo && (
            <FileUpload
              label="Starting Image"
              onFileChange={handleFileChange}
              preview={imageFile?.preview}
              disabled={isKeyRequired}
            />
          )}
          
          <div className="relative">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the scene and actions..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors text-sm"
              required={task === Task.TextToVideo}
              disabled={isKeyRequired}
            />
          </div>

          <Slider
            label="Duration"
            id="duration"
            min={5}
            max={maxDuration}
            step={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            displayValue={`${duration}s`}
            disabled={isKeyRequired}
          />

          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <Select
              label="Aspect Ratio"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
              disabled={isKeyRequired}
            />
            <Select
                label="Resolution"
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                options={resolutionOptions}
                disabled={isKeyRequired}
            />
          </div>

          <Select
              label="Model"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ 
                  value: m, 
                  label: m.includes('fast') ? 'Fast (15s max)' : 'High Quality (60s max)' 
              }))}
              disabled={isKeyRequired}
            />

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isLoading || isKeyRequired} className="flex-1 !py-3">
                {isLoading ? 'Generating...' : `Generate Video`}
            </Button>
            <div className="bg-[var(--bg-input)] px-4 py-2 border border-[var(--border-primary)] rounded-md text-center">
                <p className="text-xs text-[var(--text-muted)]">Cost</p>
                <p className="text-[var(--text-primary)] font-bold">{cost} Cr</p>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm min-h-[350px] lg:min-h-0 flex flex-col items-center justify-center h-full relative overflow-hidden p-4 md:p-6 mt-4 lg:mt-0">
        
        {isLoading && (
          <div className="text-center p-6">
            <Spinner text={progressMessage} />
            {estimatedTimeRemaining !== null && (
              <p className="mt-4 font-mono text-sm text-[var(--text-accent)] animate-pulse">
                Est. Time: {Math.floor(estimatedTimeRemaining / 60)}m {estimatedTimeRemaining % 60}s
              </p>
            )}
          </div>
        )}
        
        {isUpscaling && <Spinner text="Upscaling video..." />}
        
        {error && (
            <div className="text-center space-y-4 p-6 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto z-10">
                <p className="text-red-400 font-bold text-lg">Generation Failed</p>
                <div className="text-xs text-[var(--text-secondary)]">
                    {error}
                </div>
                
                <div className="flex flex-col gap-2 mt-4">
                  {(isQuotaError || isProjectError) && (
                    <Button 
                      onClick={() => resetKey()} 
                      className="mx-auto !text-xs !py-2 !px-4"
                    >
                      <Gear className="h-4 w-4 mr-2" />
                      Re-Select API Key
                    </Button>
                  )}
                </div>
                
                {isQuotaError && (
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block mt-2 text-xs text-[var(--text-muted)] underline hover:text-white transition-colors"
                  >
                    Review Billing Documentation
                  </a>
                )}
            </div>
        )}
        
        {currentVideoUrl && !isLoading && !isUpscaling && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center animate-in fade-in duration-700">
            <div className="relative group w-full bg-black rounded-lg shadow-lg overflow-hidden">
              <video 
                key={currentVideoUrl}
                src={currentVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto max-h-[60vh] lg:max-h-[50vh] object-contain" 
              />
            </div>
            
            <div className="mt-4 bg-[var(--bg-input)] p-3 md:p-4 border border-[var(--border-primary)] rounded-lg w-full text-left shadow-sm space-y-4">
               <div className="flex justify-between items-center">
                    <p className="text-sm text-[var(--text-primary)] font-semibold">Generated Asset</p>
                    <button
                        onClick={() => downloadAsset(currentVideoUrl, `ai-video-${Date.now()}.mp4`)}
                        className="flex items-center gap-2 bg-[var(--accent-primary)] text-white px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-[var(--accent-secondary)] transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </button>
               </div>
               <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                     <Select
                        label="Upscale"
                        id="upscale_strength"
                        value={upscaleStrength}
                        onChange={(e) => setUpscaleStrength(e.target.value)}
                        options={upscaleStrengths}
                        disabled={isUpscaling}
                      />
                      <Button onClick={handleUpscale} disabled={isUpscaling} className="!py-2 !text-xs w-full sm:w-auto">
                        {isUpscaling ? 'Upscaling...' : 'Apply Upscale'}
                      </Button>
                  </div>
               </div>
            </div>
          </div>
        )}
        
        {!isLoading && !isUpscaling && !error && !resultUrl && (
          <div className="text-center text-[var(--text-muted)] font-medium">
            <Video className="mx-auto h-16 w-16 mb-4 opacity-30" />
            <p>Your generated video will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;