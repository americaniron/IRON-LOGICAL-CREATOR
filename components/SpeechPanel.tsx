import React, { useState, useCallback, useContext } from 'react';
import { generateSpeech } from '../services/geminiService';
import { AudioResult } from '../types';
import { AssetContext } from '../contexts/AssetProvider';
import Button from './common/Button';
import Select from './common/Select';
import Spinner from './common/Spinner';
import CustomAudioPlayer from './common/CustomAudioPlayer';
import { Speaker } from './common/Icons';

const voices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

const SpeechPanel: React.FC = () => {
  const { addAsset } = useContext(AssetContext);
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Zephyr');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioResult | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('SYSTEM ERROR: NO TEXT DATA TO CONVERT.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const audioUrl = await generateSpeech(text, voice);
      setResult({ url: audioUrl, text: text });
      addAsset({
        type: 'audio',
        url: audioUrl,
        prompt: text,
        provider: 'iron'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNIDENTIFIED AUDIO ENGINE ERROR.');
    } finally {
      setIsLoading(false);
    }
  }, [text, voice, addAsset]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
      <div className="control-panel p-8 flex flex-col h-full overflow-y-auto scrollbar-thin shadow-2xl border-2 border-industrial-gray order-2 lg:order-1 lg:w-1/2">
        <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-industrial-gray">
            <div>
              <h3 className="text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                PA_System
              </h3>
              <p className="text-xs font-mono text-cyan-400 tracking-[0.4em] uppercase font-bold">SYNTH_ENGINE_V2 // ONLINE</p>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <label htmlFor="tts-text" className="block text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-2 font-mono">
              &gt; BROADCAST_MANIFEST
            </label>
            <textarea
              id="tts-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="INPUT BROADCAST MESSAGE..."
              className="w-full px-4 py-3 bg-[#111317] border-2 border-industrial-gray rounded-none text-white focus:outline-none focus:border-cyan-400 font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-base uppercase leading-relaxed"
              required
            />
          </div>
          <Select
            label="VOCAL_MODULATION_PATCH"
            id="voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            options={voices.map(v => ({ value: v, label: `PATCH_${v.toUpperCase()}` }))}
          />
          <Button type="submit" disabled={isLoading} className="w-full !py-6 shadow-xl">
            {isLoading ? 'TRANSMITTING...' : 'START BROADCAST'}
          </Button>
        </form>
      </div>
      <div className="monitor-screen flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-6 border-4 border-industrial-gray min-h-[400px] order-1 lg:order-2 lg:w-1/2">
        <div className="absolute top-4 left-6 text-xs font-mono text-cyan-400 tracking-widest uppercase font-bold animate-pulse z-20">
            // AUDIO_MONITOR_01
        </div>
        
        {isLoading && <Spinner text="MODULATING FREQUENCIES..." />}
        {error && <p className="text-red-500 font-mono font-black text-center border-2 border-red-500 p-6 bg-red-500/10 uppercase tracking-widest shadow-lg">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-8 p-4 animate-in fade-in-0 zoom-in-95 duration-500">
            <CustomAudioPlayer src={result.url} />
            <div className="bg-black/80 p-6 border border-industrial-gray shadow-xl">
               <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.3em] mb-3">Transmission_Transcript</p>
               <p className="text-sm text-cyan-400 font-mono italic uppercase leading-relaxed">"{result.text}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest">
            <div className="mb-10 text-6xl opacity-10">
              <Speaker className="mx-auto h-24 w-24" />
            </div>
            <p className="text-xl font-['Black_Ops_One'] opacity-40">AUDIO_RECEIVER_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechPanel;