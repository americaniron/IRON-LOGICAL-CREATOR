import React, { useState } from 'react';
import { XIcon } from './Icons';

interface GrokKeyPromptProps {
  onKeySubmit: (key: string) => void;
}

const GrokKeyPrompt: React.FC<GrokKeyPromptProps> = ({ onKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0A0B0C] border-2 border-grok-magenta/30 p-8 relative shadow-[0_0_30px_rgba(217,70,239,0.2)] animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute top-0 left-0 right-0 h-1 bg-grok-magenta/50"></div>
      <div className="text-center mb-8">
        <XIcon className="h-12 w-12 mx-auto text-grok-magenta mb-4" />
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2 font-['Black_Ops_One']">X-CORP CONDUIT LOCKED</h3>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
          Authorization required to interface with Grok systems.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="ENTER_API_KEY_ //"
          className="w-full px-4 py-3 bg-black border-2 border-[#333840] text-grok-magenta focus:outline-none focus:border-grok-magenta font-mono transition-colors text-sm"
        />
        <button type="submit" className="w-full py-3 bg-grok-magenta text-black font-['Black_Ops_One'] uppercase tracking-widest text-lg hover:bg-white transition-colors disabled:bg-gray-700 disabled:text-gray-500">
          Authorize
        </button>
      </div>
       <p className="text-center text-[10px] text-gray-700 font-mono mt-8">
          Key is stored locally. Find yours on <a href="https://x.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-grok-magenta">x.ai</a>. Or don't. See if I care.
       </p>
    </form>
  );
};

export default GrokKeyPrompt;