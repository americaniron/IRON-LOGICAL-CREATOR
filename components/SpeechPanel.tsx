
import React, { useState, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';
import { AudioResult } from '../types';
import Button from './common/Button';
import Select from './common/Select';
import Spinner from './common/Spinner';

const voices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

const SpeechPanel: React.FC = () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNIDENTIFIED AUDIO ENGINE ERROR.');
    } finally {
      setIsLoading(false);
    }
  }, [text, voice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto industrial-grid p-4">
      <div className="bg-[#2D2E30] p-8 border-4 border-[#3F4042] relative shadow-2xl">
        <div className="caution-stripes h-2 absolute top-0 left-0 right-0"></div>
        <h3 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase">// SYNTH_ENGINE_V2 _</h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <label htmlFor="tts-text" className="block text-xs font-black uppercase tracking-widest text-[#EBB700] mb-4 font-mono">
              // DATA_INPUT _
            </label>
            <textarea
              id="tts-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="INPUT BROADCAST MESSAGE..."
              className="w-full px-6 py-4 bg-black border-2 border-[#3F4042] rounded-none text-white focus:outline-none focus:border-[#EBB700] font-mono text-sm uppercase"
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
          <Button type="submit" disabled={isLoading} className="w-full py-4 text-xl">
            {isLoading ? 'TRANSMITTING...' : 'START BROADCAST'}
          </Button>
        </form>
      </div>
      <div className="bg-[#111] border-4 border-[#3F4042] p-8 flex items-center justify-center min-h-[400px] relative">
        <div className="rivet absolute top-2 left-2"></div>
        <div className="rivet absolute top-2 right-2"></div>
        <div className="rivet absolute bottom-2 left-2"></div>
        <div className="rivet absolute bottom-2 right-2"></div>
        
        {isLoading && <Spinner text="MODULATING FREQUENCIES..." />}
        {error && <p className="text-red-500 font-mono font-bold text-center border-2 border-red-500 p-4 bg-red-500/10 uppercase tracking-widest">{error}</p>}
        {result && !isLoading && (
          <div className="text-center w-full space-y-8">
            <div className="bg-[#2D2E30] p-6 border-b-8 border-black shadow-inner">
               <audio src={result.url} controls autoPlay className="w-full custom-audio-player" />
            </div>
            <div className="bg-black p-4 border border-[#3F4042]">
               <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] mb-2">Transcript_Log</p>
               <p className="text-xs text-[#EBB700] font-mono italic uppercase">"{result.text}"</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-center text-gray-700 font-mono uppercase tracking-widest">
            <div className="mb-4 text-4xl opacity-10">(( )))</div>
            <p className="text-sm">RECEIVER_IDLE: STANDING BY FOR AUDIO DATA</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechPanel;
