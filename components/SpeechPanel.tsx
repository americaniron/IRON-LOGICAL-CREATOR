import React, { useState, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';
import { AudioResult } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Button from './common/Button';
import Select from './common/Select';
import Spinner from './common/Spinner';
import CustomAudioPlayer from './common/CustomAudioPlayer';
import { Speaker } from './common/Icons';

const voices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

const SpeechPanel: React.FC = () => {
  const [text, setText] = useState('');
  
  // Persisted Preference
  const [voice, setVoice] = useLocalStorage('im_pref_tts_voice', 'Zephyr');
  
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNIDENTIFIED AUDIO ENGINE ERROR.');
    } finally {
      setIsLoading(false);
    }
  }, [text, voice]);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 w-full h-full">
      <div className="control-panel p-4 sm:p-8 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-end mb-6 sm:mb-8 pb-4 border-b-2 border-industrial-gray">
            <div>
              <h3 className="text-2xl sm:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase mb-1">
                PA_System
              </h3>
              <p className="text-[10px] font-mono text-heavy-yellow tracking-[0.4em] uppercase font-bold">SYNTH_ENGINE_V2 // ONLINE</p>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="relative">
            <label htmlFor="tts-text" className="block text-xs font-black uppercase tracking-[0.2em] text-heavy-yellow mb-2 font-mono">
              &gt; DATA_INPUT
            </label>
            <textarea
              id="tts-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="INPUT BROADCAST MESSAGE..."
              className="w-full px-4 py-3 bg-asphalt border-2 border-industrial-gray rounded-none text-white focus:outline-none focus:border-heavy-yellow font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase"
              required
            />
          </div>
          <Select
            label="VOICE_PATCH"
            id="voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            options={voices.map(v => ({ value: v, label: `PATCH_${v.toUpperCase()}` }))}
          />
          <Button type="submit" disabled={isLoading} className="w-full !py-4 sm:!py-6">
            {isLoading ? 'TRANSMITTING...' : 'GENERATE AUDIO'}
          </Button>
        </form>
      </div>
      <div className="monitor-screen min-h-[300px] flex flex-col items-center justify-center h-full relative overflow-hidden blueprint-grid p-4">
        <div className="absolute top-2 left-4 text-xs font-mono text-heavy-yellow tracking-widest uppercase font-bold animate-pulse">
            // AUDIO_MONITOR_01
        </div>
        
        {isLoading && <Spinner text="MODULATING FREQUENCIES..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-4 bg-red-500/10 uppercase tracking-widest">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-8 p-4 animate-in fade-in zoom-in-95 duration-500">
            <CustomAudioPlayer src={result.url} />
            <div className="bg-black/80 p-4 border border-industrial-gray">
               <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">Transcript_Log</p>
               <p className="text-xs text-heavy-yellow font-mono italic uppercase">"{result.text}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-800 font-mono uppercase tracking-widest">
            <div className="mb-4 text-4xl opacity-10">
              <Speaker className="mx-auto h-20 w-20" />
            </div>
            <p className="text-sm">RECEIVER_IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechPanel;