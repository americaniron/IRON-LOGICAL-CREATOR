import React, { useState, useCallback, useContext, useEffect } from 'react';
import { AssetContext } from '../contexts/AssetProvider';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { generateChatResponse, generateImage } from '../services/geminiService';
import { useVeo } from '../hooks/useVeo';
import { LogSeverity } from '../types';
import Button from './common/Button';
import Select from './common/Select';
import Spinner from './common/Spinner';
import WorkbenchHeader from './common/WorkbenchHeader';
import { Crane, Image, Video, Play } from './common/Icons';

type StepStatus = 'idle' | 'running' | 'complete' | 'error';

const imageAspectRatios = ["16:9", "9:16", "1:1", "4:3", "3:4"];
const videoAspectRatios = ["16:9", "9:16"];

const PipelinePanel: React.FC = () => {
  const { addAsset } = useContext(AssetContext);
  const { logOperation, notify } = useContext(SystemStatusContext);

  const [masterDirective, setMasterDirective] = useState('');
  
  const [imageAspectRatio, setImageAspectRatio] = useState('16:9');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  
  const [pipelineState, setPipelineState] = useState<{
    text: { status: StepStatus; output: string };
    image: { status: StepStatus; output: string };
    video: { status: StepStatus; output: string };
  }>({
    text: { status: 'idle', output: '' },
    image: { status: 'idle', output: '' },
    video: { status: 'idle', output: '' },
  });

  const { generateVideo, resultUrl: veoResult, error: veoError, progressMessage } = useVeo();

  useEffect(() => {
    const handleHalt = () => {
      setPipelineState({
        text: { status: 'idle', output: '' },
        image: { status: 'idle', output: '' },
        video: { status: 'idle', output: '' },
      });
      setMasterDirective('');
      // Potentially force-stop any running Veo generation if hook exposes a method
    };
    window.addEventListener('emergency-halt', handleHalt);
    return () => window.removeEventListener('emergency-halt', handleHalt);
  }, []);

  useEffect(() => {
    if (veoResult) {
      setPipelineState(prev => ({ ...prev, video: { status: 'complete', output: veoResult } }));
      addAsset({ type: 'video', url: veoResult, prompt: pipelineState.text.output, provider: 'iron' });
      notify("PIPELINE_JOB_SEQUENCE_FINISHED", "success");
    }
    if (veoError) {
      setPipelineState(prev => ({ ...prev, video: { status: 'error', output: veoError } }));
    }
  }, [veoResult, veoError, notify, addAsset, pipelineState.text.output]);

  const executePipeline = useCallback(async () => {
    if (!masterDirective.trim()) return;

    setPipelineState({
      text: { status: 'running', output: '' },
      image: { status: 'idle', output: '' },
      video: { status: 'idle', output: '' },
    });

    try {
      // Step 1: Scripting
      notify("PIPELINE_STEP_1: GENERATING_BLUEPRINT", "info");
      const script = await generateChatResponse(`CREATE A DETAILED VISUAL DESCRIPTION FOR: ${masterDirective}`);
      setPipelineState(prev => ({ ...prev, text: { status: 'complete', output: script } }));

      // Step 2: Fabrication
      notify("PIPELINE_STEP_2: FORGING_VISUAL_ASSET", "info");
      setPipelineState(prev => ({ ...prev, image: { status: 'running', output: '' } }));
      const imageUrl = await generateImage(script, "", imageAspectRatio, "gemini-2.5-flash-image", false);
      setPipelineState(prev => ({ ...prev, image: { status: 'complete', output: imageUrl } }));
      addAsset({ type: 'image', url: imageUrl, prompt: script, provider: 'iron' });

      // Step 3: Animation
      notify("PIPELINE_STEP_3: ASSEMBLING_MOTION_RIG", "info");
      setPipelineState(prev => ({ ...prev, video: { status: 'running', output: '' } }));
      await generateVideo({
        prompt: script,
        duration: 8,
        aspectRatio: videoAspectRatio,
        resolution: '720p',
        model: 'veo-3.1-fast-generate-preview',
        imageBase64: imageUrl,
      }, () => {});
      
    } catch (e: any) {
      notify(`PIPELINE_FAULT: ${e.message}`, "error");
      logOperation({ message: "Pipeline_Failure", severity: LogSeverity.ERROR, provider: 'system' });
      setPipelineState(prev => ({ ...prev, 
        text: { ...prev.text, status: prev.text.status === 'running' ? 'error' : prev.text.status },
        image: { ...prev.image, status: prev.image.status === 'running' ? 'error' : prev.image.status },
        video: { ...prev.video, status: prev.video.status === 'running' ? 'error' : prev.video.status },
      }));
    }
  }, [masterDirective, imageAspectRatio, videoAspectRatio, addAsset, generateVideo, logOperation, notify]);

  const PipelineStep = ({ num, title, status, icon: Icon, output }: { num: number; title: string; status: StepStatus; icon: any; output?: string }) => (
    <div className={`control-panel p-6 border-l-8 transition-all duration-500 ${
      status === 'running' ? 'border-heavy-yellow animate-pulse bg-heavy-yellow/5' : 
      status === 'complete' ? 'border-green-500 bg-green-900/5' : 
      status === 'error' ? 'border-red-600' : 'border-industrial-gray opacity-40'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-industrial-gray flex items-center justify-center font-['Black_Ops_One'] text-xs text-gray-500">
            {num}
          </div>
          <h4 className="font-['Black_Ops_One'] uppercase text-sm tracking-widest text-white flex items-center gap-2">
            <Icon className="h-4 w-4" /> {title}
          </h4>
        </div>
        <span className="text-[10px] font-mono font-black uppercase">[{status}]</span>
      </div>
      {status === 'running' && (num < 3 ? <Spinner text="PROCESSING..." /> : <Spinner text={progressMessage || "ASSEMBLING..."} />)}
      {status === 'complete' && output && (
        <div className="animate-in fade-in-0 duration-500">
          {num === 2 ? <img src={output} alt="Pipeline Step 2 Output" className="h-32 w-full object-cover border-2 border-black" /> : 
           num === 3 ? <video src={output} className="h-32 w-full object-cover border-2 border-black" muted autoPlay loop /> : 
           <p className="text-[10px] font-mono text-gray-500 uppercase line-clamp-3 italic">"{output}"</p>}
        </div>
      )}
      {status === 'error' && <p className="text-[10px] font-mono text-red-500 uppercase italic">Error: {output}</p>}
    </div>
  );

  const isRunning = pipelineState.text.status === 'running' || pipelineState.image.status === 'running' || pipelineState.video.status === 'running';

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full space-y-10">
      <WorkbenchHeader title="Assembly Line" station="UNIT_AUTOMATION_01" provider="iron" />

      <div className="bg-asphalt border-4 border-industrial-gray p-8 shadow-inner relative overflow-hidden">
        <div className="caution-stripes h-2 absolute top-0 left-0 right-0 opacity-10"></div>
        <div className="grid grid-cols-1 gap-6">
          <PipelineStep num={1} title="Script_Fabrication" status={pipelineState.text.status} output={pipelineState.text.output} icon={Crane} />
          <PipelineStep num={2} title="Visual_Forge" status={pipelineState.image.status} output={pipelineState.image.output} icon={Image} />
          <PipelineStep num={3} title="Final_Assembly" status={pipelineState.video.status} output={pipelineState.video.output} icon={Video} />
        </div>
      </div>

      <div className="control-panel p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Select 
            label="STEP_2_RATIO (IMAGE)" 
            id="image_aspect_ratio"
            value={imageAspectRatio}
            onChange={(e) => setImageAspectRatio(e.target.value)}
            options={imageAspectRatios.map(r => ({ value: r, label: `RATIO: ${r}` }))}
            disabled={isRunning}
          />
          <Select
            label="STEP_3_RATIO (VIDEO)"
            id="video_aspect_ratio"
            value={videoAspectRatio}
            onChange={(e) => setVideoAspectRatio(e.target.value)}
            options={videoAspectRatios.map(r => ({ value: r, label: `RATIO: ${r}` }))}
            disabled={isRunning}
          />
        </div>
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-4 font-black">// MASTER_PIPELINE_DIRECTIVE</p>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={masterDirective} 
            onChange={e => setMasterDirective(e.target.value)}
            placeholder="DEFINE TARGET MULTIMEDIA OUTPUT..."
            className="flex-1 bg-asphalt border-2 border-industrial-gray px-6 py-4 font-mono text-white focus:outline-none focus:border-cyan-400 uppercase tracking-widest text-sm"
            disabled={isRunning}
          />
          <Button onClick={executePipeline} disabled={isRunning} className="!px-12">
            <Play className="h-6 w-6 mr-2" /> Start_Job
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelinePanel;