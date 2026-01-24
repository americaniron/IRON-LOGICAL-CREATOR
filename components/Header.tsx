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
    <header className="bg-gradient-to-b from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)] border-b-2 border-[var(--border-secondary)] px-3 sm:px-6 md:px-8 py-2.5 sm:py-4 flex justify-between items-center sticky top-0 z-20 shadow-xl shrink-0">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 bg-black/20 border border-industrial-gray mr-1" aria-label="Open sidebar">
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="h-3 w-3 sm:h-4 sm:w-4 bg-[var(--accent-primary)] rounded-none shadow-[var(--accent-glow)] animate-pulse hidden sm:block shrink-0"></div>
        <h2 className="text-xs sm:text-base md:text-2xl lg:text-3xl font-['Black_Ops_One'] text-[var(--text-primary)] tracking-widest uppercase truncate whitespace-nowrap">
          {title.replace(/ /g, '_')}<span className="text-[var(--accent-primary)] hidden sm:inline">_</span>
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4 font-mono text-[8px] sm:text-[10px] md:text-xs text-[var(--text-muted)] tracking-wider uppercase shrink-0">
        <div className="hidden lg:block bg-black/40 px-3 py-1.5 sm:px-4 sm:py-2 border border-[var(--border-primary)] shadow-inner">
          <span className="text-[var(--text-muted)]">AUTH: </span>
          <span className="text-[var(--accent-primary)] font-bold">VERIFIED</span>
        </div>
        <div className="bg-black/40 px-3 py-1.5 sm:px-4 sm:py-2 border border-[var(--border-primary)] shadow-inner">
          <span className="text-[var(--text-muted)] hidden xs:inline">UPTIME: </span>
          <span className="text-[var(--text-primary)] font-bold">99.9%</span>
        </div>
      </div>
    </header>
  );
};

export default Header;