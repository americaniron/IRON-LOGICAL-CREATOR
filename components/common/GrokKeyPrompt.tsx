
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
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
    <form onSubmit={handleSubmit} className="bg-fuchsia-900/20 border-l-8 border-grok-magenta p-6 relative overflow-hidden group" role="alert">
      <div className="space-y-4">
        <div>
          <strong className="font-mono text-grok-magenta uppercase tracking-[0.2em] block mb-2 flex items-center gap-2">
            <XIcon className="h-5 w-5" /> X-CORP SYSTEM AUTH
          </strong>
          <p className="text-sm text-gray-300 font-mono">
            This module requires an X-Corp (Grok) API key. It's stored locally. Obviously.
          </p>
        </div>
        <Input
          label="GROK_API_KEY"
          id="grok_key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="grok_..."
          required
        />
        <div className="flex flex-col sm:flex-row gap-4 pt-2 items-center">
          <Button type="submit" className="text-xs !py-3 !px-6 !bg-grok-magenta !border-t-fuchsia-300 !shadow-[0_4px_0_#86198f] hover:!shadow-[0_4px_0_#a21caf] !text-white !active:translate-y-[4px]">
            Engage System
          </Button>
          <a href="https://x.ai" target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] font-mono uppercase text-gray-500 hover:text-grok-magenta underline transition-colors">
            Get_An_API_Key_Or_Whatever
          </a>
        </div>
      </div>
    </form>
  );
};

export default GrokKeyPrompt;
