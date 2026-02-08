import React, { useRef } from 'react';
import { Task } from '../types';
import { MessageSquare, Image, Video, Film, Speaker, Microphone, UploadCloud, BrainCircuit, XIcon, Crane, Gear, Sun, Moon } from './common/Icons';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Sidebar: React.FC = () => {
  const { activeTask, setActiveTask, isSidebarOpen, setIsSidebarOpen, isAdmin, logout, theme, toggleTheme, currentUser } = useAppContext();
  const [customLogo, setCustomLogo] = useLocalStorage<string | null>('im_custom_logo', null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geminiNavItems = [
    { id: Task.Chat, icon: <MessageSquare className="h-5 w-5" />, label: 'Gemini Chat' },
    { id: Task.LiveConversation, icon: <Microphone className="h-5 w-5" />, label: 'Live Conversation' },
    { id: Task.TextToImage, icon: <Image className="h-5 w-5" />, label: 'Image Generation' },
    { id: Task.TextToVideo, icon: <Video className="h-5 w-5" />, label: 'Text-to-Video' },
    { id: Task.ImageToVideo, icon: <Film className="h-5 w-5" />, label: 'Image-to-Video' },
    { id: Task.TextToSpeech, icon: <Speaker className="h-5 w-5" />, label: 'Text-to-Speech' },
    { id: Task.AssetBay, icon: <Crane className="h-5 w-5" />, label: 'Asset Library' },
  ];
  
  const openAINavItems = [
    { id: Task.OpenAIChat, icon: <MessageSquare className="h-5 w-5" />, label: 'OpenAI Chat' },
    { id: Task.OpenAITextToImage, icon: <Image className="h-5 w-5" />, label: 'DALL-E' },
    { id: Task.OpenAITextToVideo, icon: <Video className="h-5 w-5" />, label: 'Sora' },
  ];

  const grokNavItems = [
    { id: Task.GrokChat, icon: <MessageSquare className="h-5 w-5" />, label: 'Grok Chat' },
    { id: Task.GrokTextToImage, icon: <Image className="h-5 w-5" />, label: 'Grok Image' },
    { id: Task.GrokTextToVideo, icon: <Video className="h-5 w-5" />, label: 'Grok Video' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTaskClick = (task: Task) => {
    setActiveTask(task);
    setIsSidebarOpen(false);
  };
  
  const NavList = ({ items }: { items: ReadonlyArray<{id: Task, icon: React.ReactNode, label: string}> }) => (
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleTaskClick(item.id)}
              className={`w-full flex items-center p-3 rounded-md transition-colors text-sm ${
                activeTask === item.id
                  ? `bg-[var(--accent-primary)] text-white font-semibold`
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <div className={`mr-3 ${activeTask === item.id ? 'text-white' : 'text-[var(--accent-secondary)]'}`}>
                {item.icon}
              </div>
              <span>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <nav className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      <div className="p-4 flex flex-col items-center border-b border-[var(--border-primary)]">
        <div 
          onClick={triggerUpload}
          className="w-20 h-20 mb-3 border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer flex flex-col items-center justify-center bg-[var(--bg-primary)] rounded-full group overflow-hidden"
        >
          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
          {customLogo ? (
            <img src={customLogo} alt="Custom Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors">
              <UploadCloud className="h-8 w-8" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{currentUser?.name || 'AI Studio'}</h1>
          <p className="text-xs text-[var(--text-muted)] capitalize">{currentUser?.plan} Plan</p>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {isAdmin && (
            <div className="p-1 mb-2">
                <button
                  onClick={() => handleTaskClick(Task.AdminPanel)}
                  className={`w-full flex items-center p-3 rounded-md text-sm transition-all border-2 ${activeTask === Task.AdminPanel ? 'bg-[var(--accent-primary)] text-white font-semibold border-[var(--accent-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'}`}
                >
                    <Gear className={`h-5 w-5 mr-3 ${activeTask === Task.AdminPanel ? 'animate-spin-slow' : ''}`} />
                    Admin Dashboard
                </button>
            </div>
        )}

        <div className="space-y-6">
            <div>
              <h2 className="px-3 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Gemini
              </h2>
              <NavList items={geminiNavItems} />
            </div>

            <div>
              <h2 className="px-3 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                OpenAI
              </h2>
              <NavList items={openAINavItems} />
            </div>

            <div>
              <h2 className="px-3 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Grok
              </h2>
              <NavList items={grokNavItems} />
            </div>
        </div>
      </div>

      <div className="p-4 bg-black/20 border-t border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
            <button onClick={logout} className="text-sm text-[var(--text-secondary)] hover:text-[var(--danger-primary)] transition-colors">
                Sign Out
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all" 
              aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;