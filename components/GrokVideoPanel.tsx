import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateGrokVideo, upscaleGrokVideo } from '../services/grokService';
import { useGrokKey } from '../hooks/useGrokKey';
import Button from './common/Button';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';
import GrokKeyPrompt from './common/GrokKeyPrompt';
import Select from './common/Select';
import Slider from './common/Slider';
import { Film, Download, Maximize, XIcon } from './common/Icons';

const GROK_MESSAGES = [
    "DEBUNKING PHYSICS ENGINE...",
    "INJECTING RAW CHAOS...",
    "CALIBRATING SKEPTICISM VECTORS...",
    "FLATTENING HIERARCHIES...",
    "RENDERING UNFILTERED REALITY...",
    "SYNTHESIZING X-CORP BLUEPRINTS...",
    "BYPASSING SANITIZED CONSTRAINTS...",
    "WELDING TEMPORAL ANOMALIES...",
    "FINALIZING MASTERPIECE... OBVIOUSLY.",
];

const ENHANCE_MESSAGES = [
    "RE-SCALING LATTICE STRUCTURE...",
    "DE-PIXELATING CORPORATE ARTIFACTS...",
    "SHARPENING VECTORS TO LETHAL LEVELS...",
    "OPTIMIZING FIDELITY... FOR SCIENCE.",
];

const upscaleStrengths = [
  { value: '2x', label: '2X RESOLUTION' },
  { value: '4x', label: '4X FIDELITY (ULTRA)' }
];

const aspectRatios = [
    { value: '16:9', label: '16:9 LANDSCAPE' },
    { value: '9:16', label: '9:16 PORTRAIT' }
];

const resolutions = [
    { value: '720p', label: '720p STANDARD' },
    { value: '1080p', label: '1080p HIGH_RES' }
];

const models = [
    { value: 'x-motion-1.0-standard', label: 'X-MOTION 1.0 (BASE)' },
    { value: 'x-motion-1.5-ultra', label: 'X-MOTION 1.5 (ULTRA_DRIVE)' }
];

const GrokVideoPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<{ file: File; preview: string } | null>(null);
  const [duration, setDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [model, setModel] = useState('x-motion-1.0-standard');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);
  const [upscaleStrength, setUpscaleStrength] = useState('2x');

  const { apiKey, isReady, saveApiKey } = useGrokKey();
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

  const handleFileChange = (file: File | null) => {
    if (file) {
      if(imageFile) URL.revokeObjectURL(imageFile.preview);
      setImageFile({ file, preview: URL.createObjectURL(file) });
    } else {
      if(imageFile) URL.revokeObjectURL(imageFile.preview);
      setImageFile(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !imageFile || !apiKey) {
      setError('SYSTEM ERROR: NULL_INPUTS. PROVIDE PROMPT AND CARGO IMAGE.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setStatusLog([]);

    try {
      addLog("ENGAGING X-MOTION DRIVE...");
      addLog("LOADING ASSET: " + imageFile.file.name.toUpperCase());
      addLog(`SPECS: ${duration}S | ${aspectRatio} | ${resolution} | ${model.split('-')[2]?.toUpperCase() || 'STD'}`);
      
      for (const msg of GROK_MESSAGES.slice(0, 5)) {
          addLog(msg);
          await new Promise(r => setTimeout(r, 600));
      }

      const videoUrl = await generateGrokVideo(prompt, imageFile.file, apiKey, duration, aspectRatio, resolution, model);
      
      for (const msg of GROK_MESSAGES.slice(5)) {
          addLog(msg);
          await new Promise(r => setTimeout(r, 500));
      }
      
      setResultUrl(videoUrl);
      addLog("SUCCESS: ASSET_FABRICATED.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN X-MOTION FAILURE.';
      addLog(`!! CRITICAL: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, imageFile, apiKey, duration, aspectRatio, resolution, model]);

  const handleUpscale = useCallback(async () => {
    if (!resultUrl || !apiKey) return;
    setIsUpscaling(true);
    setUpscaleError(null);
    setStatusLog([]);
    try {
      addLog("INITIATING ASSET ENHANCEMENT...");
      for (const msg of ENHANCE_MESSAGES) {
          addLog(msg);
          await new Promise(r => setTimeout(r, 600));
      }
      const enhancedUrl = await upscaleGrokVideo(resultUrl, upscaleStrength);
      setUpscaledUrl(enhancedUrl);
      addLog(`ENHANCEMENT COMPLETE: ${upscaleStrength.toUpperCase()} SCALE.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown upscaling error.';
      setUpscaleError(msg);
      addLog(`!! ENHANCEMENT_FAILURE: ${msg.toUpperCase()}`);
    } finally {
      setIsUpscaling(false);
    }
  }, [resultUrl, upscaleStrength, apiKey]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="WAKING UP X-MOTION..." /></div>;
  }
  
  if (!apiKey) {
    return (
      <div className="max-w-3xl mx-auto pt-10 animate-in fade-in-0 slide-in-from-bottom-8">
        <div className="mb-8 text-center">
            <h2 className="text-4xl font-['Black_Ops_One'] text-white mb-2 tracking-widest uppercase">Unauthorized Access</h2>
            <p className="text-grok-magenta font-mono text-xs uppercase tracking-widest">X-Corp_Motion_Rig_Offline // Auth_Missing</p>
        </div>
        <GrokKeyPrompt onKeySubmit={saveApiKey} />
      </div>
    );
  }

  const currentVideoUrl = upscaledUrl || resultUrl;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin border-2 border-grok-magenta/20 relative order-2 lg:order-1 lg:w-1/2">
        <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-grok-magenta/10 border border-grok-magenta/30 z-10">
          <XIcon className="h-4 w-4 text-grok-magenta animate-pulse" />
          <span className="text-xs font-mono text-grok-magenta uppercase font-bold tracking-widest">Conduit_Active</span>
        </div>

        <div className="mb-8 pb-4 border-b-2 border-industrial-gray">
          <h3 className="text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
            X-Motion
          </h3>
          <p className="text-xs font-mono text-grok-magenta tracking-[0.4em] uppercase font-bold">X-CORP_SYNTH_BAY // ONLINE</p>
        </div>

        <div className="mb-6 p-4 bg-fuchsia-900/20 border-2 border-fuchsia-500/50 text-xs font-mono text-fuchsia-400 uppercase leading-relaxed shadow-inner">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                <span className="font-bold">STATUS: SIMULATION_MODE_VERIFIED</span>
            </div>
            X-Motion architectural logic is currently operating in verification mode. API hooks are routing through simulation containers until public release.
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <FileUpload
                label="BASE_FRAME_CARGO"
                onFileChange={handleFileChange}
                preview={imageFile?.preview}
            />

            <div className="relative group">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-grok-magenta mb-2 font-mono">
                &gt; MOTION_DIRECTIVE
                </label>
                <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DESCRIBE THE CHAOS. DEFINE PHYSICS VIOLATIONS. COMMAND THE MOTION..."
                rows={6}
                className="w-full px-4 py-3 bg-[#111317] border-2 border-[#333840] rounded-none text-white focus:outline-none focus:border-grok-magenta font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase tracking-wider leading-relaxed"
                required
                disabled={isLoading}
                />
            </div>

            <Slider
                label="X-DRIVE_TEMPORAL_LENGTH"
                id="duration"
                min={5}
                max={20}
                step={1}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                displayValue={`${duration}.0s`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="LATTICE_RATIO"
                    id="aspect_ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    options={aspectRatios}
                />
                <Select
                    label="PIXEL_DENSITY"
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    options={resolutions}
                />
            </div>

            <Select
                label="MOTION_SYNTHESIZER_MODEL"
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={models}
            />

          <Button type="submit" disabled={isLoading} className="w-full !py-6 !bg-grok-magenta !border-t-fuchsia-300 !shadow-[0_6px_0_#86198f] hover:!shadow-[0_6px_0_#a21caf] !text-white !active:translate-y-[6px]">
            {isLoading ? 'FABRICATING ASSET...' : 'ENGAGE X-MOTION DRIVE'}
          </Button>
        </form>
      </div>

       <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4 border-2 border-grok-magenta/30 order-1 lg:order-2 lg:w-1/2">
         <div className="absolute top-2 left-4 text-xs font-mono text-grok-magenta tracking-widest uppercase font-bold animate-pulse z-20">
            // X-MOTION_MONITOR_04
        </div>
        
        {(isLoading || isUpscaling) && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in-0 duration-500">
                <Spinner text={isUpscaling ? "ENHANCING REALITY..." : "INJECTING REALITY..."} />
                <div className="w-full max-w-md bg-black border-2 border-grok-magenta/30 p-4 font-mono text-xs text-grok-magenta/80 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-grok-magenta">
                    {statusLog.map((log, i) => (
                        <div key={i} className="mb-1 uppercase tracking-tighter animate-in slide-in-from-left-2 duration-300">
                           {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        )}

        {error && (
          <div className="text-center p-8 bg-red-900/20 border-2 border-red-600 animate-in shake duration-500">
             <p className="text-red-500 font-['Black_Ops_One'] font-bold text-xl uppercase tracking-widest mb-4">!! SYSTEM_CRITICAL_FAILURE !!</p>
             <p className="font-mono text-xs text-red-400 uppercase">{error}</p>
          </div>
        )}
        
        {currentVideoUrl && !isLoading && !isUpscaling && (
          <div className="text-center w-full h-full flex flex-col items-stretch justify-center p-2 animate-in fade-in-0 zoom-in duration-1000">
            <div className="relative group w-full bg-black border-2 border-industrial-gray shadow-2xl overflow-hidden">
              <video 
                key={currentVideoUrl}
                src={currentVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto max-h-[45vh]" 
              />
               <div className="absolute top-2 right-2 flex gap-2">
                    <a
                        href={currentVideoUrl}
                        download={`x-motion-fab-${Date.now()}.mp4`}
                        className="bg-grok-magenta text-white p-2 hover:bg-fuchsia-600 transition-colors shadow-lg border border-white/20"
                        title="DOWNLOAD_ASSET"
                    >
                        <Download className="h-5 w-5" />
                    </a>
               </div>
               {upscaledUrl && (
                  <div className="absolute top-2 left-2 text-xs text-white font-mono font-black border border-white px-2 py-0.5 bg-grok-magenta shadow-[0_0_10px_rgba(217,70,239,0.8)]">
                      // ENHANCED_ASSET_{upscaleStrength.toUpperCase()}
                  </div>
              )}
            </div>
            
            <div className="mt-4 bg-black/80 p-4 border-2 border-industrial-gray w-full text-left shadow-2xl space-y-4 overflow-y-auto scrollbar-thin">
               <div className="border-b border-industrial-gray pb-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">X-Corp_Manifest</p>
                    <p className="text-xs text-grok-magenta font-mono italic uppercase">"{prompt}"</p>
                  </div>
               </div>

               <div className="bg-asphalt/50 border border-industrial-gray p-4">
                  <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-grok-magenta mb-4 font-black">
                    <Maximize className="h-4 w-4"/> X-CORP ENHANCEMENT BAY
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                     <Select
                        label="FIDELITY_MULTIPLIER"
                        id="upscale_strength"
                        value={upscaleStrength}
                        onChange={(e) => setUpscaleStrength(e.target.value)}
                        options={upscaleStrengths}
                        disabled={isUpscaling}
                      />
                      <Button 
                        onClick={handleUpscale} 
                        disabled={isUpscaling || true} 
                        title="This feature is a prototype and not yet implemented."
                        className="!py-3 !text-sm !bg-grok-magenta !border-t-fuchsia-300 !shadow-[0_4px_0_#86198f] hover:!shadow-[0_4px_0_#a21caf] !text-white !active:translate-y-[4px]"
                      >
                        {isUpscaling ? 'ENHANCING...' : 'INITIATE FIDELITY BOOST'}
                      </Button>
                  </div>
                  {upscaleError && <p className="text-red-500 text-xs font-mono mt-2 text-center uppercase tracking-tighter">{upscaleError}</p>}
               </div>

               <p className="text-xs font-mono text-gray-600 uppercase text-center tracking-[0.4em] opacity-50">-- END_OF_MANIFEST --</p>
            </div>
          </div>
        )}
        
        {!isLoading && !isUpscaling && !error && !resultUrl && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest">
            <div className="mb-4 text-4xl opacity-10">
              <Film className="mx-auto h-24 w-24" />
            </div>
            <p className="text-sm">X-MOTION_BAY_IDLE</p>
            <p className="text-xs mt-2 opacity-40">Awaiting_Cargo_Submission</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrokVideoPanel;