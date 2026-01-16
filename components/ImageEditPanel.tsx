import React, { useState, useContext, useCallback, useEffect } from 'react';
import { AssetContext } from '../contexts/AssetProvider';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { editImage } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';
import WorkbenchHeader from './common/WorkbenchHeader';
import FileUpload from './common/FileUpload';

const ImageEditPanel: React.FC = () => {
  const { pipedImage, pipedParentId, setPipe, addAsset } = useContext(AssetContext);
  const { notify } = useContext(SystemStatusContext);

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<{ file: File; preview: string } | null>(null);

  const sourceImage = localImage?.preview || pipedImage;

  useEffect(() => {
    if (pipedImage && localImage) {
      URL.revokeObjectURL(localImage.preview);
      setLocalImage(null);
    }
  }, [pipedImage, localImage]);

  useEffect(() => {
    return () => {
      if (localImage) {
        URL.revokeObjectURL(localImage.preview);
      }
    };
  }, [localImage]);


  const handlePatch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceImage || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    notify("INITIATING_NEURAL_PATCH_SEQUENCE", "info");

    try {
      const editedUrl = await editImage(prompt, sourceImage);
      setResult(editedUrl);
      addAsset({
        type: 'image',
        url: editedUrl,
        prompt: `PATCHED: ${prompt}`,
        provider: 'iron',
        parentId: localImage ? undefined : pipedParentId
      });
      notify("NEURAL_PATCH_APPLIED_SUCCESSFULLY", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown patch failure.';
      setError(msg.toUpperCase());
      notify(`PATCH_FAULT: ${msg}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, [sourceImage, prompt, pipedParentId, addAsset, notify, localImage]);
  
  const handleFileChange = (file: File | null) => {
    if (file) {
      setPipe('', null, null); 
      if (localImage) URL.revokeObjectURL(localImage.preview);
      setLocalImage({ file, preview: URL.createObjectURL(file) });
    } else {
      if (localImage) URL.revokeObjectURL(localImage.preview);
      setLocalImage(null);
    }
  };
  
  const handleClear = () => {
    setPipe('', null, null);
    if (localImage) URL.revokeObjectURL(localImage.preview);
    setLocalImage(null);
    setResult(null);
    setError(null);
    setPrompt('');
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-fit order-2 lg:order-1 lg:w-1/2">
        <WorkbenchHeader title="Neural Patch Bay" station="RIG_MOD_01" provider="iron" piped={!!pipedImage} />
        
        {!sourceImage ? (
           <div className="animate-in fade-in-0 duration-500">
             <FileUpload label="UPLOAD_SOURCE_ASSET" onFileChange={handleFileChange} />
             <p className="text-center font-mono text-xs text-gray-700 mt-4 uppercase">...Or pipe an asset from the Manifest</p>
           </div>
        ) : (
          <>
            <div className="mb-8 p-4 bg-purple-900/10 border border-purple-500/30 text-[10px] font-mono text-purple-400 uppercase leading-relaxed shadow-inner">
              <span className="font-black text-white underline">DIRECTIVE:</span> Provide instructions to modify the source asset. The engine will attempt to maintain structural coherence while applying your requested divergence.
            </div>

            <form onSubmit={handlePatch} className="space-y-8">
              <div className="relative">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-2 font-mono">
                    &gt; ALTERATION_DIRECTIVE
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.G. ADD A RED SKATEBOARD, CHANGE WEATHER TO RAINY..."
                    rows={5}
                    className="w-full px-4 py-3 bg-[#111317] border-2 border-industrial-gray rounded-none text-white focus:outline-none focus:border-purple-500 font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase"
                    required
                    disabled={isLoading}
                  />
              </div>
              
              <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} provider="meta" className="flex-1 !py-4 !text-sm">
                    {isLoading ? 'PATCHING...' : 'EXECUTE NEURAL PATCH'}
                  </Button>
                   <Button type="button" onClick={handleClear} variant="danger" className="!px-6 !py-4 !text-sm">
                    Clear Bay
                  </Button>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="monitor-screen flex flex-col p-6 border-4 border-industrial-gray min-h-[500px] order-1 lg:order-2 lg:w-1/2">
         <div className="absolute top-4 left-6 text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold animate-pulse z-20">
            // NEURAL_SYNC_MONITOR
        </div>

        <div className="grid grid-rows-2 gap-6 h-full">
           <div className="relative group border-2 border-industrial-gray bg-black flex items-center justify-center overflow-hidden">
              {sourceImage ? (
                 <img src={sourceImage} alt="Source" className="max-h-full object-contain opacity-50 grayscale" />
              ) : (
                <p className="font-mono text-gray-800 uppercase tracking-widest">Awaiting Source...</p>
              )}
              <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[8px] font-mono text-gray-500 uppercase border border-industrial-gray">
                 SOURCE_INPUT
              </div>
           </div>
           
           <div className="relative group border-2 border-purple-500/30 bg-black flex items-center justify-center overflow-hidden blueprint-grid">
              {isLoading ? (
                <Spinner text="SYNCING LATTICE..." />
              ) : result ? (
                <img src={result} alt="Patched Result" className="max-h-full object-contain animate-in fade-in-0 zoom-in duration-500" />
              ) : error ? (
                <div className="text-red-500 font-mono text-xs uppercase p-4 text-center border border-red-500/30 bg-red-500/5">
                   !! {error} !!
                </div>
              ) : (
                <div className="text-gray-800 font-mono uppercase tracking-[0.2em] text-sm animate-pulse">
                   Awaiting_Synthesis...
                </div>
              )}
              <div className="absolute top-2 left-2 bg-purple-600 px-2 py-1 text-[8px] font-mono text-white uppercase border border-black shadow-lg">
                 PATCH_OUTPUT
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditPanel;