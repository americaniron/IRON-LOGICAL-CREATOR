import React, { useRef } from 'react';
import { Task } from '../types';
import { MessageSquare, Image, Video, Film, Speaker, Microphone, UploadCloud, BrainCircuit, XIcon, Crane, Gear, Sun, Moon } from './common/Icons';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Sidebar: React.FC = () => {
  const { activeTask, setActiveTask, isSidebarOpen, setIsSidebarOpen, isAdmin, logout, theme, toggleTheme } = useAppContext();
  const [customLogo, setCustomLogo] = useLocalStorage<string | null>('im_custom_logo', null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geminiNavItems = [
    { id: Task.Chat, icon: <MessageSquare className="h-5 w-5" />, label: 'Control Deck' },
    { id: Task.LiveConversation, icon: <Microphone className="h-5 w-5" />, label: 'Comm Link' },
    { id: Task.TextToImage, icon: <Image className="h-5 w-5" />, label: 'Fab Shop' },
    { id: Task.TextToVideo, icon: <Video className="h-5 w-5" />, label: 'Assembly Line' },
    { id: Task.ImageToVideo, icon: <Film className="h-5 w-5" />, label: 'VFX Rig' },
    { id: Task.TextToSpeech, icon: <Speaker className="h-5 w-5" />, label: 'PA System' },
    { id: Task.AssetBay, icon: <Crane className="h-5 w-5" />, label: 'Asset Bay' },
  ];
  
  const openAINavItems = [
    { id: Task.OpenAIChat, icon: <MessageSquare className="h-5 w-5" />, label: 'GPT Command' },
    { id: Task.OpenAITextToImage, icon: <Image className="h-5 w-5" />, label: 'DALL-E Forge' },
    { id: Task.OpenAITextToVideo, icon: <Video className="h-5 w-5" />, label: 'Sora Synthesizer' },
  ];

  const grokNavItems = [
    { id: Task.GrokChat, icon: <MessageSquare className="h-5 w-5" />, label: 'Grok Conduit' },
    { id: Task.GrokTextToImage, icon: <Image className="h-5 w-5" />, label: 'X-Forge' },
    { id: Task.GrokTextToVideo, icon: <Video className="h-5 w-5" />, label: 'X-Motion' },
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
      <ul className="space-y-0.5 sm:space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleTaskClick(item.id)}
              className={`w-full flex items-center p-2.5 sm:p-3 transition-all duration-75 relative group border-l-4 ${
                activeTask === item.id
                  ? `bg-[#FFD300] text-black border-black shadow-inner font-bold`
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <div className={`mr-3 transition-transform group-hover:scale-110 ${activeTask === item.id ? 'text-black' : 'text-[#FFD300]'}`}>
                {item.icon}
              </div>
              <span className={`font-['Roboto_Mono'] text-[10px] sm:text-[11px] uppercase tracking-widest truncate`}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <nav className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 md:w-80 bg-[#0F1115] border-r-4 border-black flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* BRANDING SECTION */}
      <div className="p-6 sm:p-8 flex flex-col items-center border-b-4 border-black relative overflow-hidden bg-gradient-to-b from-[#1F2228] to-[#0F1115]">
        <div className="absolute inset-0 blueprint-grid opacity-10"></div>
        
        <div 
          onClick={triggerUpload}
          className="w-32 h-16 sm:w-48 sm:h-24 mb-4 sm:mb-6 border-2 border-[#3F4042] hover:border-[#FFD300] transition-all cursor-pointer flex flex-col items-center justify-center bg-black relative group overflow-hidden shadow-inner"
        >
          {customLogo ? (
            <img src={customLogo} alt="LOGO" className="w-full h-full object-contain p-2 sm:p-3 grayscale group-hover:grayscale-0 transition-all" />
          ) : (
            <div className="flex flex-col items-center text-gray-700 group-hover:text-[#FFD300]">
              <UploadCloud className="h-6 w-6 sm:h-8 w-8 mb-1 sm:mb-2" />
              <p className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest">CARGO_UPLOAD</p>
            </div>
          )}
          <div className="rivet absolute top-1 left-1 opacity-50"></div>
          <div className="rivet absolute bottom-1 right-1 opacity-50"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="caution-stripes h-1 w-full mb-1 sm:mb-2 opacity-50"></div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-['Black_Ops_One'] tracking-tighter">IRON MEDIA</h1>
          <p className="text-[8px] sm:text-[9px] font-mono text-[#FFD300] tracking-[0.4em] mt-1 sm:mt-2 uppercase font-black">ORCHESTRATOR_V6</p>
        </div>
      </div>

      <div className="flex-1 p-0 overflow-y-auto scrollbar-thin">
        {isAdmin && (
            <div className="p-3 sm:p-4 border-b border-white/5">
                <button
                  onClick={() => handleTaskClick(Task.AdminPanel)}
                  className={`w-full flex items-center p-2.5 sm:p-3 border-2 border-[#FFD300] bg-[#FFD300]/5 text-[#FFD300] hover:bg-[#FFD300] hover:text-black transition-all ${activeTask === Task.AdminPanel ? 'bg-[#FFD300] text-black font-black' : ''}`}
                >
                    <Gear className={`h-4 w-4 mr-3 ${activeTask === Task.AdminPanel ? 'animate-spin' : ''}`} />
                    <span className="font-['Black_Ops_One'] text-[10px] sm:text-xs uppercase tracking-widest">ADMIN_CMD</span>
                </button>
            </div>
        )}

        <div className="p-3 sm:p-4 space-y-6 sm:space-y-8">
            <div>
              <h2 className="px-3 pb-2 text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-1 sm:mb-2 border-b border-white/5 flex justify-between">
                <span>GEMINI_CORE</span>
                <span className="text-green-500 animate-pulse">●</span>
              </h2>
              <NavList items={geminiNavItems} />
            </div>

            <div>
              <h2 className="px-3 pb-2 text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-1 sm:mb-2 border-b border-white/5 flex justify-between">
                <span>OPENAI_GUEST</span>
                <span className="text-blue-500">●</span>
              </h2>
              <NavList items={openAINavItems} />
            </div>

            <div>
              <h2 className="px-3 pb-2 text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-1 sm:mb-2 border-b border-white/5 flex justify-between">
                <span>GROK_X-CORP</span>
                <span className="text-purple-500">●</span>
              </h2>
              <NavList items={grokNavItems} />
            </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-black/50 border-t-4 border-black">
        <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#FFD300] animate-pulse"></div>
                    <p className="text-[9px] sm:text-[10px] font-mono text-gray-500 uppercase">OS_STATUS: <span className="text-white">NOMINAL</span></p>
                </div>
                <button 
                  onClick={toggleTheme} 
                  className="p-1.5 sm:p-2 bg-[#2D2E30] text-[#FFD300] border border-black hover:bg-[#FFD300] hover:text-black transition-all" 
                >
                    {theme === 'dark' ? <Sun className="h-3.5 w-3.5 sm:h-4 w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 w-4" />}
                </button>
            </div>
            <button onClick={logout} className="text-[8px] sm:text-[9px] font-mono text-red-600 hover:text-red-400 uppercase tracking-widest text-center py-2 bg-red-950/20 border border-red-900/30">
                [ TERMINATE_ORCHESTRATION ]
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;