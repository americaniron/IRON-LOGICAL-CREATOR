import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { Task } from '../types';
import { useApiKeySelection } from '../hooks/useApiKeySelection';
import { AssetContext } from '../contexts/AssetProvider';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import Button from './common/Button';
import Select from './common/Select';
import Slider from './common/Slider';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';
import ApiKeyPrompt from './common/ApiKeyPrompt';
import WorkbenchHeader from './common/WorkbenchHeader';
import { useVeo } from '../hooks/useVeo';
import { Download, Maximize, Video } from './common/Icons';

interface VideoPanelProps {
  task: Task.TextToVideo | Task.ImageToVideo;
}

const aspectRatios = ["16:9", "9:16"];
const resolutions = ["720p", "1024p"];
const models = ["veo-3.1-fast-generate-preview", "veo-3.1-generate-preview"];
const upscaleStrengths = [{value: '2x', label: '2X Resolution'}, {value: '4x', label: '4X Fidelity'}];

const VideoPanel: React.FC<VideoPanelProps> = ({ task }) => {
  const { addAsset, pipedPrompt, pipedImage, pipedParentId, setPipe } = useContext(AssetContext);
  const { notify } = useContext(SystemStatusContext);

  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(15);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [model, setModel] = useState('veo-3.1-generate-preview');
  const [imageFile, setImageFile] = useState<{ file: File | null; preview: string } | null>(null);
  
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);
  const [upscaleStrength, setUpscaleStrength] = useState('2x');

  const { isKeySelected, isChecking, selectKey, resetKeySelection } = useApiKeySelection();
  const { isLoading, error, resultUrl, progressMessage, generateVideo } = useVeo();

  const maxDuration = useMemo(() => {
    return model === 'veo-3.1-generate-preview' ? 60 : 15;
  }, [model]);

  useEffect(() => {
    const handleHalt = () => {
      window.location.reload(); 
    };
    window.addEventListener('emergency-halt', handleHalt);
    return () => window.removeEventListener('emergency-halt', handleHalt);
  }, []);

  useEffect(() => {
    if (pipedPrompt) setPrompt(pipedPrompt);
    if (pipedImage) setImageFile({ file: null, preview: pipedImage });
    
    if (pipedPrompt || pipedImage) setPipe('', null, null);
  }, [pipedPrompt, pipedImage, setPipe]);

  useEffect(() => {
    if (duration > maxDuration) {
      setDuration(maxDuration);
    }
    if (duration > 15 && model !== 'veo-3.1-generate-preview') {
      setModel('veo-3.1-generate-preview');
      notify("Model switched to Ultra for extended duration", "info");
    }
  }, [maxDuration, duration, model, notify]);
  
  useEffect(() => {
    setUpscaledUrl(null);
    setUpscaleError(null);
    if (resultUrl) {
      addAsset({
        type: 'video',
        url: resultUrl,
        prompt: prompt,
        provider: 'iron',
        parentId: pipedParentId || undefined
      });
    }
  }, [resultUrl, addAsset, prompt, pipedParentId]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile({ file, preview: URL.createObjectURL(file) });
    } else {
      if (imageFile) {
        URL.revokeObjectURL(imageFile.preview);
      }
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
        imageFile: imageFile?.file || (pipedImage ? undefined : null),
        imageBase64: pipedImage || undefined,
    }, resetKeySelection);
  }, [prompt, duration, aspectRatio, resolution, model, imageFile, task, generateVideo, resetKeySelection, pipedImage]);

  const handleUpscale = useCallback(async () => {
    setIsUpscaling(true);
    setUpscaleError("NOTICE: Video upscaling is currently a simulated feature.");
    await new Promise(r => setTimeout(r, 2000));
    setIsUpscaling(false);
  }, []);

  const currentVideoUrl = upscaledUrl || resultUrl;

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin order-2 xl:order-1 xl:w-1/2">
        <WorkbenchHeader 
          title={task === Task.TextToVideo ? 'Video Generation' : 'Image to Video'} 
          station="Module_02" 
          piped={!!pipedPrompt || !!pipedImage} 
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isChecking && !isKeySelected && (
            <ApiKeyPrompt modelName="AURA Video Synthesis" onSelectKey={selectKey} />
          )}
          
          {task === Task.ImageToVideo && (
            <FileUpload
              label="Source Frame"
              onFileChange={handleFileChange}
              preview={imageFile?.preview || pipedImage || undefined}
            />
          )}
          
          <div className="relative group">
            <label className="block text-xs font-heading uppercase tracking-widest text-aura-cyan mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the desired video output..."
              rows={8}
              className="w-full px-4 py-3 bg-aura-indigo border border-aura-mauve rounded-sm text-aura-light focus:outline-none transition-colors text-sm focus-ring"
              required={task === Task.TextToVideo}
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
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Aspect Ratio" id="aspect_ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} options={aspectRatios.map(r => ({ value: r, label: r }))} />
            <Select label="Resolution" id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} options={resolutions.map(r => ({ value: r, label: r }))} />
          </div>

          <Select 
            label="Generation Model" 
            id="model" 
            value={model} 
            onChange={(e) => setModel(e.target.value)} 
            options={models.map(m => ({ value: m, label: m.includes('fast') ? 'Veo 3.1 Fast' : 'Veo 3.1 Ultra' }))}
            disabled={duration > 15}
          />

          <Button type="submit" size="xl" disabled={isLoading || !isKeySelected} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Video'}
          </Button>
        </form>
      </div>

      <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden p-6 min-h-[400px] order-1 xl:order-2 xl:w-1/2">
        <div className="absolute top-4 left-6 text-xs font-body text-aura-violet tracking-widest uppercase font-bold animate-pulse z-20">
            // Synthesis Monitor
        </div>
        
        {isLoading && <Spinner text={progressMessage} />}
        {isUpscaling && <Spinner text="Upscaling..." />}
        
        {error && (
            <div className="text-center space-y-4 animate-in p-10 bg-red-900/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 font-heading uppercase tracking-widest text-2xl">Generation Failed</p>
                <p className="font-body text-xs text-red-300">{error}</p>
                <Button onClick={() => window.location.reload()} variant="danger" size="sm">Reset</Button>
            </div>
        )}
        
        {currentVideoUrl && !isLoading && !isUpscaling && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center p-2 animate-in fade-in-0 zoom-in duration-1000">
            <div className="relative group w-full bg-black border border-aura-mauve rounded-lg shadow-2xl overflow-hidden">
              <video key={currentVideoUrl} src={currentVideoUrl} controls autoPlay loop className="w-full h-auto max-h-[45vh]" />
            </div>
            
            <div className="mt-4 bg-aura-slate/80 p-5 border border-aura-mauve w-full text-left shadow-2xl rounded-lg space-y-4">
               <div className="flex justify-between items-center border-b border-aura-mauve/50 pb-4">
                    <p className="text-base text-aura-light font-heading uppercase tracking-wider">Asset Ready</p>
                    <a href={currentVideoUrl} download className="flex items-center gap-2 bg-aura-cyan text-black px-4 py-2 text-sm font-heading uppercase hover:bg-white rounded-md">
                        <Download className="h-5 w-5" /> Download
                    </a>
               </div>
               <div className="bg-aura-indigo/50 border border-aura-mauve p-5 rounded-md">
                  <h4 className="flex items-center gap-2 text-sm font-heading uppercase tracking-widest text-aura-cyan mb-5">
                    <Maximize className="h-5 w-5"/> Upscale (Prototype)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                     <Select label="Strength" id="upscale_strength" value={upscaleStrength} onChange={(e) => setUpscaleStrength(e.target.value)} options={upscaleStrengths} />
                      <Button onClick={handleUpscale} disabled size="md" variant="secondary">Execute</Button>
                  </div>
                  {upscaleError && <p className="text-yellow-400 text-xs font-body mt-3 text-center uppercase">{upscaleError}</p>}
               </div>
            </div>
          </div>
        )}
        
        {!isLoading && !isUpscaling && !error && !resultUrl && (
          <div className="text-center text-aura-mauve font-body uppercase tracking-widest">
            <Video className="mx-auto h-32 w-32 opacity-20 mb-8" />
            <p className="text-xl font-heading text-aura-gray tracking-widest">Display Idle</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;
