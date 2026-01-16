import React, { useContext } from 'react';
import { AssetContext } from '../contexts/AssetProvider';
import { OrchestratorAsset, Task } from '../types';
import { Crane, Download, XIcon, Film, Gear } from './common/Icons';
import Button from './common/Button';

const ManifestPanel: React.FC = () => {
  const { assets, revokeAsset, setPipe } = useContext(AssetContext);

  const getProviderColor = (provider: string) => {
    switch(provider) {
      case 'iron': return 'text-cyan-400';
      case 'guest': return 'text-guest-green';
      case 'xcorp': return 'text-grok-magenta';
      default: return 'text-gray-400';
    }
  };

  const handlePipeToRig = (asset: OrchestratorAsset, task: Task) => {
    setPipe(asset.prompt, asset.type === 'image' ? asset.url : undefined, asset.id);
    window.location.hash = `#/${task}`;
  };

  const findParent = (parentId?: string) => {
    if (!parentId) return null;
    return assets.find(a => a.id === parentId);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-4 border-industrial-gray pb-8 mb-10">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.4em] mb-1">Archive_System_01</p>
          <h2 className="text-4xl font-['Black_Ops_One'] text-white tracking-widest uppercase">
            Asset<span className="text-orange-500">_</span>Manifest
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin">
        {assets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 py-32">
            <Crane className="h-48 w-48 mb-8" />
            <p className="font-['Black_Ops_One'] text-3xl tracking-[0.5em] uppercase">No_Asset_Record</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
            {assets.map((asset) => {
              const parent = findParent(asset.parentId);
              const isExpired = asset.status === 'expired';

              return (
                <div key={asset.id} className={`control-panel group hover:border-orange-500 transition-all duration-300 flex flex-col overflow-hidden relative shadow-2xl ${isExpired ? 'opacity-60 grayscale' : ''}`}>
                  <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => revokeAsset(asset.id)} className="bg-red-600 text-white p-2 border border-black hover:bg-red-500">
                          <XIcon className="h-4 w-4" />
                      </button>
                      {!isExpired && (
                        <a href={asset.url} download className="bg-orange-500 text-black p-2 border border-black hover:bg-orange-400">
                            <Download className="h-4 w-4" />
                        </a>
                      )}
                  </div>

                  <div className="aspect-video bg-[#000] flex items-center justify-center relative overflow-hidden border-b border-industrial-gray group-hover:scale-[1.02] transition-transform">
                    {isExpired ? (
                      <div className="text-center p-4">
                        <XIcon className="h-12 w-12 mx-auto text-red-500 opacity-50 mb-2" />
                        <span className="text-[10px] font-mono text-red-500 uppercase font-black">EXPIRED_SESSION_DATA</span>
                      </div>
                    ) : (
                      <>
                        {asset.type === 'image' && <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />}
                        {asset.type === 'video' && <video src={asset.url} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />}
                        {asset.type === 'audio' && <div className="p-10"><Crane className="h-16 w-16 text-cyan-400 animate-pulse" /></div>}
                      </>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/90 text-[9px] font-mono uppercase tracking-[0.2em] border border-industrial-gray font-black">
                      {asset.type}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/30">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                         <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${getProviderColor(asset.provider)}`}>
                           // {asset.provider}_UNIT
                         </span>
                         <span className="text-[9px] font-mono text-gray-700">
                           {new Date(asset.timestamp).toLocaleTimeString([], { hour12: false })}
                         </span>
                      </div>
                      
                      {parent && (
                        <div className="mb-2 p-1.5 bg-black/40 border border-industrial-gray flex items-center gap-2">
                           <Crane className="h-3 w-3 text-orange-500" />
                           <span className="text-[8px] font-mono text-orange-500 uppercase font-black">Lineage: Derivative of {parent.type}_{parent.id.substring(0,4)}</span>
                        </div>
                      )}

                      <p className="text-[11px] font-mono text-gray-400 uppercase line-clamp-3 italic leading-relaxed">
                        "{asset.prompt}"
                      </p>
                    </div>
                    
                    {!isExpired && asset.type === 'image' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handlePipeToRig(asset, Task.ImageEdit)}
                          className="py-2 border border-industrial-gray text-[9px] font-mono uppercase hover:bg-purple-600 hover:text-white transition-all font-black tracking-widest flex items-center justify-center gap-1"
                        >
                          <Gear className="h-3 w-3" /> Patch Bay
                        </button>
                        <button 
                          onClick={() => handlePipeToRig(asset, Task.ImageToVideo)}
                          className="py-2 border border-industrial-gray text-[9px] font-mono uppercase hover:bg-heavy-yellow hover:text-black transition-all font-black tracking-widest flex items-center justify-center gap-1"
                        >
                          <Film className="h-3 w-3" /> To VFX Rig
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="caution-stripes h-1 opacity-10 group-hover:opacity-30 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManifestPanel;