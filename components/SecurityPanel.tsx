import React, { useContext, useState } from 'react';
import { useApiKeySelection } from '../hooks/useApiKeySelection';
import { useOpenAiKey } from '../hooks/useOpenAiKey';
import { useGrokKey } from '../hooks/useGrokKey';
import { AssetContext } from '../contexts/AssetProvider';
import { AuthContext } from '../contexts/AuthProvider';
import { ConfigContext } from '../contexts/ConfigProvider';
import Button from './common/Button';
import Input from './common/Input';
import { Shield, BrainCircuit, XIcon, Gear } from './common/Icons';

const SecurityPanel: React.FC = () => {
  const { isKeySelected: isGeminiKeySelected, selectKey: selectGeminiKey } = useApiKeySelection();
  const { apiKey: oaiKey, saveApiKey: saveOaiKey, clearApiKey: clearOaiKey, error: oaiError } = useOpenAiKey();
  const { apiKey: grokKey, saveApiKey: saveGrokKey, clearApiKey: clearGrokKey, error: grokError } = useGrokKey();
  const { purgeAssets } = useContext(AssetContext);
  const { safeMode, setSafeMode, visualInterference, setVisualInterference, audioFeedback, setAudioFeedback, devMode, setDevMode } = useContext(ConfigContext);
  
  const [isAdminLocked, setIsAdminLocked] = useState(true);

  const handleGlobalPurge = () => {
    if (isAdminLocked) return;
    if (confirm("CRITICAL_ACTION_REQUIRED: Purge all session credentials and generated assets?")) {
        clearOaiKey();
        clearGrokKey();
        purgeAssets();
        window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full space-y-8 md:space-y-12 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-industrial-gray pb-6">
        <div className="text-center sm:text-left">
          <p className="text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-[0.4em] mb-1">Auth_Service_v3</p>
          <h2 className="text-3xl md:text-4xl font-['Black_Ops_One'] text-white tracking-[0.2em] uppercase">
            Security<span className="text-orange-500">_</span>Hub
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center">
           <div className="flex items-center gap-3 bg-black/40 border border-industrial-gray p-1.5 md:p-2">
              <span className="text-[9px] md:text-[10px] font-mono text-gray-600 uppercase">Admin_Lock</span>
              <button 
                onClick={() => setIsAdminLocked(!isAdminLocked)}
                className={`w-10 md:w-12 h-5 md:h-6 transition-colors flex items-center px-1 border border-black ${!isAdminLocked ? 'bg-red-600' : 'bg-industrial-gray'}`}
              >
                <div className={`h-3 w-3 md:h-4 md:w-4 bg-white transition-transform ${!isAdminLocked ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`}></div>
              </button>
           </div>
           <Button 
            variant="danger" 
            onClick={handleGlobalPurge} 
            disabled={isAdminLocked}
            className={`w-full sm:w-auto !py-2 md:!py-3 !px-6 md:!px-8 !text-[10px] md:!text-xs !shadow-none border-2 border-black ${isAdminLocked ? 'opacity-20' : 'hover:!bg-red-700'}`}
          >
              PURGE_SESSION
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <section className={`control-panel p-6 md:p-8 flex flex-col justify-between transition-opacity ${isAdminLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <Gear className="h-6 w-6 md:h-8 md:w-8 text-heavy-yellow" />
                <h3 className="text-xl md:text-2xl font-['Black_Ops_One'] text-white uppercase tracking-widest">Iron_Core</h3>
              </div>
              <div className="bg-black/50 p-4 md:p-6 border-l-4 border-heavy-yellow mb-6 md:mb-8 font-mono">
                <div className="flex items-center justify-between text-[10px] md:text-xs mb-2">
                  <span className="text-gray-600 uppercase">Status:</span>
                  <span className={`font-black uppercase ${isGeminiKeySelected ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
                    {isGeminiKeySelected ? '[ VERIFIED ]' : '[ UNAUTHORIZED ]'}
                  </span>
                </div>
                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase leading-relaxed">
                  Clearance handles primary fabrication engines.
                </p>
              </div>
          </div>
          <Button onClick={selectGeminiKey} className="w-full !py-3 md:!py-4 !text-xs md:!text-sm">
            Update_Clearance
          </Button>
        </section>

        <section className="control-panel p-6 md:p-8">
           <div className="flex items-center gap-4 mb-6 md:mb-8">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
            <h3 className="text-xl md:text-2xl font-['Black_Ops_One'] text-white uppercase tracking-widest">Environment</h3>
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between p-3 md:p-4 bg-black/50 border border-industrial-gray">
              <div>
                <p className="text-[10px] md:text-xs font-mono font-black text-cyan-400 uppercase">Stability_Mode</p>
                <p className="text-[9px] md:text-[10px] text-gray-600 uppercase">Disable flicker (A11y).</p>
              </div>
              <button 
                onClick={() => setSafeMode(!safeMode)}
                className={`w-12 md:w-14 h-6 md:h-8 transition-colors flex items-center px-1 ${safeMode ? 'bg-green-600' : 'bg-industrial-gray'}`}
              >
                <div className={`h-4 md:h-6 w-4 md:w-6 bg-white transition-transform ${safeMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 md:p-4 bg-black/50 border border-industrial-gray">
              <div>
                <p className="text-[10px] md:text-xs font-mono font-black text-cyan-400 uppercase">Visual_Interference</p>
                <p className="text-[9px] md:text-[10px] text-gray-600 uppercase">Toggle scanline overlay.</p>
              </div>
              <button 
                onClick={() => setVisualInterference(!visualInterference)}
                className={`w-12 md:w-14 h-6 md:h-8 transition-colors flex items-center px-1 ${visualInterference ? 'bg-cyan-600' : 'bg-industrial-gray'}`}
              >
                <div className={`h-4 md:h-6 w-4 md:w-6 bg-white transition-transform ${visualInterference ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 md:p-4 bg-black/50 border border-industrial-gray">
              <div>
                <p className="text-[10px] md:text-xs font-mono font-black text-cyan-400 uppercase">Acoustic_Feedback</p>
                <p className="text-[9px] md:text-[10px] text-gray-600 uppercase">System sound responses.</p>
              </div>
              <button 
                onClick={() => setAudioFeedback(!audioFeedback)}
                className={`w-12 md:w-14 h-6 md:h-8 transition-colors flex items-center px-1 ${audioFeedback ? 'bg-cyan-600' : 'bg-industrial-gray'}`}
              >
                <div className={`h-4 md:h-6 w-4 md:w-6 bg-white transition-transform ${audioFeedback ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 md:p-4 bg-black/50 border border-industrial-gray">
              <div>
                <p className="text-[10px] md:text-xs font-mono font-black text-yellow-500 uppercase">Developer_Mode</p>
                <p className="text-[9px] md:text-[10px] text-gray-600 uppercase">Enable prototype features.</p>
              </div>
              <button 
                onClick={() => setDevMode(!devMode)}
                className={`w-12 md:w-14 h-6 md:h-8 transition-colors flex items-center px-1 ${devMode ? 'bg-yellow-600' : 'bg-industrial-gray'}`}
              >
                <div className={`h-4 md:h-6 w-4 md:w-6 bg-white transition-transform ${devMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

          </div>
        </section>

        <section className={`control-panel p-6 md:p-8 border-2 ${oaiError ? 'border-red-500' : 'border-guest-green/10'} transition-opacity ${isAdminLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <BrainCircuit className="h-6 w-6 md:h-8 md:w-8 text-guest-green" />
            <h3 className="text-xl md:text-2xl font-['Black_Ops_One'] text-white uppercase tracking-widest">Guest_Synth</h3>
          </div>
          <Input
            label="API_KEY_ROTATION"
            id="central_oai_key"
            type="password"
            placeholder="sk-..."
            value={oaiKey || ''}
            onChange={(e) => saveOaiKey(e.target.value)}
            className={oaiError ? '!border-red-500 focus:!border-red-500' : ''}
          />
          {oaiError && <p className="text-[9px] md:text-[10px] text-red-500 font-mono mt-2 uppercase">{oaiError}</p>}
        </section>

        <section className={`control-panel p-6 md:p-8 border-2 ${grokError ? 'border-red-500' : 'border-grok-magenta/10'} transition-opacity ${isAdminLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <XIcon className="h-6 w-6 md:h-8 md:w-8 text-grok-magenta" />
            <h3 className="text-xl md:text-2xl font-['Black_Ops_One'] text-white uppercase tracking-widest">X-Corp</h3>
          </div>
          <Input
            label="CONDUIT_TOKEN"
            id="central_grok_key"
            type="password"
            placeholder="grok_..."
            value={grokKey || ''}
            onChange={(e) => saveGrokKey(e.target.value)}
            className={grokError ? '!border-red-500 focus:!border-red-500' : ''}
          />
          {grokError && <p className="text-[9px] md:text-[10px] text-red-500 font-mono mt-2 uppercase">{grokError}</p>}
        </section>
      </div>
    </div>
  );
};

export default SecurityPanel;