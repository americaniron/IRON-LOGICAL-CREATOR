
import React from 'react';
import { Menu } from './common/Icons';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';

const TASK_TITLES: Record<Task, string> = {
    [Task.Chat]: 'Control Deck',
    [Task.TextToImage]: 'Fabrication Shop',
    [Task.TextToVideo]: 'Assembly Line',
    [Task.ImageToVideo]: 'VFX Rig',
    [Task.TextToSpeech]: 'PA System',
    [Task.LiveConversation]: 'Comm Link',
    [Task.AssetBay]: 'Asset Bay',
    [Task.OpenAIChat]: 'GPT Command',
    [Task.OpenAITextToImage]: 'DALL-E Forge',
    [Task.OpenAITextToVideo]: 'Sora Synthesizer',
    [Task.GrokChat]: 'Grok Conduit',
    [Task.GrokTextToImage]: 'X-Forge',
    [Task.GrokTextToVideo]: 'X-Motion',
    [Task.AdminPanel]: 'Admin Command',
};

const Header: React.FC = () => {
  const { activeTask, setIsSidebarOpen } = useAppContext();
  const title = TASK_TITLES[activeTask] || 'Command_Deck';

  return (
    <header className="bg-gradient-to-b from-[#1F2328] to-[#111317] border-b-2 border-black px-4 md:px-8 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-20 shadow-xl">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white" aria-label="Open sidebar">
          <Menu className="h-6 w-6" />
        </button>
        <div className="h-4 w-4 bg-heavy-yellow rounded-none shadow-[var(--hud-glow)] animate-pulse hidden sm:block"></div>
        <h2 className="text-lg sm:text-2xl md:text-3xl font-['Black_Ops_One'] text-white tracking-widest uppercase">
          {title.replace(/ /g, '_')}<span className="text-heavy-yellow">_</span>
        </h2>
      </div>
      <div className="hidden sm:flex items-center gap-4 font-mono text-xs text-gray-500 tracking-wider uppercase">
        <div className="hidden lg:block bg-black/40 px-4 py-2 border border-industrial-gray shadow-inner">
          <span className="text-gray-500">AUTH_TOKEN: </span>
          <span className="text-heavy-yellow font-bold">VERIFIED_SECURE</span>
        </div>
        <div className="bg-black/40 px-4 py-2 border border-industrial-gray shadow-inner">
          <span className="text-gray-500">SYS_UPTIME: </span>
          <span className="text-white font-bold">99.98%</span>
        </div>
      </div>
    </header>
  );
};

export default Header;