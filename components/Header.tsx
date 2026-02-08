import React from 'react';
import { Menu } from './common/Icons';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';

const TASK_TITLES: Record<Task, string> = {
    [Task.Chat]: 'Gemini Chat',
    [Task.TextToImage]: 'Image Generation',
    [Task.TextToVideo]: 'Text-to-Video',
    [Task.ImageToVideo]: 'Image-to-Video',
    [Task.TextToSpeech]: 'Text-to-Speech',
    [Task.LiveConversation]: 'Live Conversation',
    [Task.AssetBay]: 'Asset Library',
    [Task.OpenAIChat]: 'OpenAI Chat',
    [Task.OpenAITextToImage]: 'DALL-E Image Generation',
    [Task.OpenAITextToVideo]: 'Sora Video Generation',
    [Task.GrokChat]: 'Grok Chat',
    [Task.GrokTextToImage]: 'Grok Image Generation',
    [Task.GrokTextToVideo]: 'Grok Video Generation',
    [Task.AdminPanel]: 'Admin Dashboard',
};

const Header: React.FC = () => {
  const { activeTask, setIsSidebarOpen, currentUser } = useAppContext();
  const title = TASK_TITLES[activeTask] || 'Dashboard';

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 sm:px-6 h-16 flex justify-between items-center sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 -ml-2" aria-label="Open sidebar">
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate whitespace-nowrap">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4 font-mono text-xs text-[var(--text-muted)] tracking-wider uppercase shrink-0">
        <div className="hidden lg:block bg-[var(--bg-primary)] px-4 py-1.5 border border-[var(--border-primary)] rounded-md">
          <span className="text-[var(--text-muted)]">User: </span>
          <span className="text-[var(--text-accent)] font-bold">{currentUser?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;