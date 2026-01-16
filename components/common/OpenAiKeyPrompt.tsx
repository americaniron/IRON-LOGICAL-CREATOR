
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { BrainCircuit } from './Icons';

interface OpenAiKeyPromptProps {
  onKeySubmit: (key: string) => void;
}

const OpenAiKeyPrompt: React.FC<OpenAiKeyPromptProps> = ({ onKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-green-900/20 border-l-8 border-guest-green p-6 relative overflow-hidden group" role="alert">
      <div className="space-y-4">
        <div>
          <strong className="font-mono text-guest-green uppercase tracking-[0.2em] block mb-2 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> GUEST SYSTEM ACCESS
          </strong>
          <p className="text-sm text-gray-300 font-mono">
            This module requires an OpenAI API key for operation. Your key is stored locally and never sent to our servers.
          </p>
        </div>
        <Input
          label="OPENAI_API_KEY"
          id="openai_key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          required
        />
        <div className="flex flex-col sm:flex-row gap-4 pt-2 items-center">
          <Button type="submit" className="text-xs !py-3 !px-6 !bg-guest-green !border-t-green-300 !shadow-[0_4px_0_#15803d] hover:!shadow-[0_4px_0_#16a34a] !text-black !active:translate-y-[4px]">
            Authorize Guest System
          </Button>
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] font-mono uppercase text-gray-500 hover:text-guest-green underline transition-colors">
            Procure_Access_Key_Ref_OAI
          </a>
        </div>
      </div>
    </form>
  );
};

export default OpenAiKeyPrompt;
