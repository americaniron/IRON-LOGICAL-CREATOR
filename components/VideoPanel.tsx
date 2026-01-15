
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Task } from '../types';
import { useApiKeySelection } from '../hooks/useApiKeySelection';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Slider from './common/Slider';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';
import ApiKeyPrompt from './common/ApiKeyPrompt';
import { useVeo } from '../hooks/useVeo';

interface VideoPanelProps {
  task: Task.TextToVideo | Task.ImageToVideo;
}

const aspectRatios = ["16:9", "9:16"];
const resolutions = ["720p", "1080p"];
const models = ["veo-3.1-fast-generate-preview", "veo-3.1-generate-preview"];

const VideoPanel: React.FC<VideoPanelProps> = ({ task }) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [model, setModel] = useState('veo-3.1-fast-generate-preview');
  const [imageFile, setImageFile] = useState<{ file: File; preview: string } | null>(null);

  const { isKeySelected, isChecking, selectKey, resetKeySelection } = useApiKeySelection();
  const { isLoading, error, resultUrl, progressMessage, generateVideo } = useVeo();

  // Dynamic max duration based on model capabilities
  // Veo 3.1 Pro allows up to 60s, Fast allows up to 15s.
  const maxDuration = useMemo(() => {
    return model === 'veo-3.1-generate-preview' ? 60 : 15;
  }, [model]);

  // Ensure current duration stays within bounds when model changes
  useEffect(() => {
    if (duration > maxDuration) {
      setDuration(maxDuration);
    }
  }, [maxDuration, duration]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile({ file, preview: URL.createObjectURL(file) });
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && task === Task.TextToVideo) {
      return;
    }
    if (!imageFile && task === Task.ImageToVideo) {
      return;
    }
    
    // Enrich the prompt with duration intent
    const enrichedPrompt = prompt.trim() ? `${prompt.trim()}. The video should be approximately ${duration} seconds long.` : '';

    await generateVideo({
        prompt: enrichedPrompt,
        duration,
        aspectRatio,
        resolution,
        model,
        imageFile: imageFile?.file
    }, resetKeySelection);
  }, [prompt, duration, aspectRatio, resolution, model, imageFile, task, generateVideo, resetKeySelection]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto industrial-grid p-4 h-full">
      <div className="bg-[#2D2E30] p-8 border-4 border-[#3F4042] relative shadow-2xl overflow-y-auto max-h-full">
        <div className="caution-stripes h-2 absolute top-0 left-0 right-0"></div>
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
                // {task === Task.TextToVideo ? 'TEXT_ASSEMBLY_UNIT' : 'IMAGE_RIG_STATION'} _
            </h3>
            <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="h-3 w-1 bg-[#EBB700] rounded-sm"></div>)}
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 pb-4">
          {!isChecking && !isKeySelected && (
            <ApiKeyPrompt modelName="Veo Cinematic Engine" onSelectKey={selectKey} />
          )}
          
          {task === Task.ImageToVideo && (
            <FileUpload
              label="BASE_ASSET_LOADER"
              onFileChange={handleFileChange}
              preview={imageFile?.preview}
            />
          )}
          
          <Input
            label="ANIMATION_SEQUENCE_CODE (PROMPT)"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="DEFINE THE MOTION PATHWAYS..."
            required={task === Task.TextToVideo}
          />

          <div className="bg-black/40 p-6 border-2 border-[#3F4042] relative">
            <div className="absolute -top-3 left-4 bg-[#2D2E30] px-2 text-[10px] font-mono font-black text-[#EBB700] uppercase tracking-widest border border-[#3F4042]">
              HYDRAULIC_EXTENSION_VALVES
            </div>
            
            <div className="pt-4">
                <Slider
                  label="TARGET_VIDEO_DURATION"
                  id="duration"
                  min={1}
                  max={maxDuration}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  displayValue={`${duration}.0 SECONDS`}
                />
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-[9px] font-mono text-gray-600 uppercase">Short_Burst</span>
                    <span className="text-[9px] font-mono text-gray-600 uppercase">{maxDuration === 60 ? 'Full_Extension_Capacity' : 'Max_Loader_Capacity'}</span>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="SITE_ASPECT_RATIO"
              id="aspect_ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatios.map(r => ({ value: r, label: r }))}
            />
            <Select
                label="FRAME_RESOLUTION"
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                options={resolutions.map(r => ({ value: r, label: r }))}
            />
          </div>

          <Select
              label="HEAVY_EQUIPMENT_MODEL"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={models.map(m => ({ 
                  value: m, 
                  label: m.includes('fast') ? 'RAPID_LOADER_3.1 (15S MAX)' : 'HEAVY_CRANE_3.1 (60S MAX)' 
              }))}
            />

          <Button type="submit" disabled={isLoading || !isKeySelected} className="w-full !py-6 !text-2xl">
            {isLoading ? 'ASSEMBLING...' : 'IGNITE GENERATOR'}
          </Button>
        </form>
      </div>

      <div className="bg-[#111] border-4 border-[#3F4042] p-8 flex items-center justify-center min-h-[500px] relative overflow-hidden industrial-grid">
        <div className="rivet absolute top-4 left-4"></div>
        <div className="rivet absolute top-4 right-4"></div>
        <div className="rivet absolute bottom-4 left-4"></div>
        <div className="rivet absolute bottom-4 right-4"></div>
        
        {isLoading && <Spinner text={progressMessage.toUpperCase()} />}
        {error && (
            <div className="text-center space-y-4">
                <p className="text-red-600 font-black border-4 border-red-600 p-8 bg-red-600/10 uppercase tracking-widest text-lg shadow-2xl">
                    !! CRITICAL_ASSEMBLY_FAILURE !!
                </p>
                <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
        )}
        
        {resultUrl && !isLoading && (
          <div className="text-center w-full space-y-6 animate-in fade-in zoom-in duration-700">
            <div className="relative group p-2 bg-black border-b-[12px] border-[#EBB700] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <video 
                src={resultUrl} 
                controls 
                autoPlay 
                loop 
                className="max-w-full max-h-[600px] mx-auto grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-white/5"></div>
              <div className="absolute top-6 left-6 caution-stripes h-6 w-20 opacity-40"></div>
            </div>
            <div className="bg-black/80 p-6 border-2 border-[#3F4042] text-left">
               <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.4em]">Fabrication_Receipt_Log</p>
                    <span className="text-[10px] text-green-500 font-mono">STATUS: SUCCESSFUL</span>
               </div>
               <div className="grid grid-cols-3 gap-4 border-t border-[#3F4042] pt-4">
                    <div>
                        <p className="text-[8px] text-gray-600 uppercase font-bold">Duration</p>
                        <p className="text-sm font-mono text-[#EBB700]">{duration}.0s</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-gray-600 uppercase font-bold">Scale</p>
                        <p className="text-sm font-mono text-white">{resolution}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-gray-600 uppercase font-bold">Rig</p>
                        <p className="text-sm font-mono text-white">{model.split('-')[2].toUpperCase()}</p>
                    </div>
               </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !resultUrl && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-[0.3em]">
            <div className="mb-8 opacity-5">
                <svg className="mx-auto h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
            <p className="text-lg font-black text-gray-700">FABRICATION_BAY_31_IDLE</p>
            <p className="text-xs mt-2 opacity-50">STANDING BY FOR DESIGN SPECS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;
