
import React, { useRef } from 'react';
import { Task } from '../types';
import { MessageSquare, Image, Video, Film, Speaker, Microphone, UploadCloud, BrainCircuit, XIcon, Crane, Gear } from './common/Icons';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Sidebar: React.FC = () => {
  const { activeTask, setActiveTask, isSidebarOpen, setIsSidebarOpen, isAdmin, logout } = useAppContext();
  const [customLogo, setCustomLogo] = useLocalStorage<string | null>('im_custom_logo', null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geminiNavItems = [
    { id: Task.Chat, icon: <MessageSquare className="h-6 w-6" />, label: 'Control Deck' },
    { id: Task.LiveConversation, icon: <Microphone className="h-6 w-6" />, label: 'Comm Link' },
    { id: Task.TextToImage, icon: <Image className="h-6 w-6" />, label: 'Fab Shop' },
    { id: Task.TextToVideo, icon: <Video className="h-6 w-6" />, label: 'Assembly Line' },
    { id: Task.ImageToVideo, icon: <Film className="h-6 w-6" />, label: 'VFX Rig' },
    { id: Task.TextToSpeech, icon: <Speaker className="h-6 w-6" />, label: 'PA System' },
    { id: Task.AssetBay, icon: <Crane className="h-6 w-6" />, label: 'Asset Bay' },
  ];
  
  const openAINavItems = [
    { id: Task.OpenAIChat, icon: <MessageSquare className="h-6 w-6" />, label: 'GPT Command' },
    { id: Task.OpenAITextToImage, icon: <Image className="h-6 w-6" />, label: 'DALL-E Forge' },
    { id: Task.OpenAITextToVideo, icon: <Video className="h-6 w-6" />, label: 'Sora Synthesizer' },
  ];

  const grokNavItems = [
    { id: Task.GrokChat, icon: <MessageSquare className="h-6 w-6" />, label: 'Grok Conduit' },
    { id: Task.GrokTextToImage, icon: <Image className="h-6 w-6" />, label: 'X-Forge' },
    { id: Task.GrokTextToVideo, icon: <Video className="h-6 w-6" />, label: 'X-Motion' },
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
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };
  
  const NavList = ({ items }: { items: ReadonlyArray<{id: Task, icon: React.ReactNode, label: string}> }) => (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleTaskClick(item.id)}
              className={`w-full flex items-center p-3 rounded-none transition-all duration-200 relative overflow-hidden group text-base md:text-lg ${
                activeTask === item.id
                  ? `bg-heavy-yellow text-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]`
                  : 'text-gray-500 hover:text-white hover:bg-industrial-gray'
              }`}
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-heavy-yellow transition-transform duration-300 scale-y-0 group-hover:scale-y-100 ${activeTask === item.id ? 'scale-y-100' : ''}`}
                style={{boxShadow: 'var(--hud-glow)'}}
              ></div>
              <div className={`ml-3 mr-4 transition-transform group-hover:scale-110 ${activeTask === item.id ? 'scale-110 text-black' : 'text-heavy-yellow'}`}>
                {item.icon}
              </div>
              <span className={`font-['Black_Ops_One'] uppercase tracking-wider`}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <nav className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#1F2328] to-[#111317] border-r-2 border-black flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:w-80 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-heavy-yellow to-transparent opacity-20"></div>
      
      {/* BRANDING LOGO SECTION */}
      <div className="p-4 sm:p-6 flex flex-col items-center border-b-2 border-black bg-black/30 shadow-inner">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleLogoUpload} 
        />
        
        <div 
          onClick={triggerUpload}
          className="w-full max-w-[200px] h-32 mb-4 border-2 border-dashed border-industrial-gray hover:border-heavy-yellow transition-colors cursor-pointer flex flex-col items-center justify-center bg-asphalt relative group overflow-hidden"
        >
          {customLogo ? (
            <>
              <img 
                src={customLogo} 
                alt="CUSTOM LOGO" 
                className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <p className="font-['Black_Ops_One'] text-sm font-bold text-heavy-yellow uppercase tracking-widest">REPLACE</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-600 group-hover:text-heavy-yellow transition-colors">
              <UploadCloud className="h-10 w-10 mb-2" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-center px-2">UPLOAD_LOGO</p>
            </div>
          )}
          <div className="rivet absolute top-1.5 left-1.5"></div>
          <div className="rivet absolute bottom-1.5 right-1.5"></div>
        </div>
        
        <div className="text-center american-iron-font">
          <p className="text-xs font-black text-heavy-yellow tracking-[0.4em] uppercase mb-1">IRON</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">MEDIA</h1>
          <p className="text-[9px] font-mono text-gray-500 tracking-widest mt-3 uppercase border-t border-industrial-gray pt-2">SITE_ORCHESTRATOR</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto mt-4 space-y-6 scrollbar-thin">
        {isAdmin && (
            <div className="mb-4">
                <button
                onClick={() => handleTaskClick(Task.AdminPanel)}
                className={`w-full flex items-center p-3 border-2 border-heavy-yellow bg-heavy-yellow/10 text-heavy-yellow hover:bg-heavy-yellow hover:text-black transition-all ${activeTask === Task.AdminPanel ? 'bg-heavy-yellow text-black font-black' : ''}`}
                >
                    <Gear className={`h-5 w-5 mr-3 ${activeTask === Task.AdminPanel ? 'animate-spin' : ''}`} />
                    <span className="font-['Black_Ops_One'] uppercase tracking-widest">ADMIN COMMAND</span>
                </button>
            </div>
        )}

        <div>
          <h2 className="px-4 pb-2 text-xs font-mono text-gray-600 uppercase tracking-[0.3em] border-b border-industrial-gray">Iron Media (Gemini)</h2>
          <div className="mt-2">
            <NavList items={geminiNavItems} />
          </div>
        </div>
        <div>
          <h2 className="px-4 pb-2 text-xs font-mono text-gray-600 uppercase tracking-[0.3em] border-b border-industrial-gray flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-gray-500" />
            Guest Systems (OpenAI)
          </h2>
          <div className="mt-2">
            <NavList items={openAINavItems} />
          </div>
        </div>
        <div>
          <h2 className="px-4 pb-2 text-xs font-mono text-gray-600 uppercase tracking-[0.3em] border-b border-industrial-gray flex items-center gap-2">
            <XIcon className="h-4 w-4 text-gray-500" />
            X-Corp Systems (Grok)
          </h2>
          <div className="mt-2">
            <NavList items={grokNavItems} />
          </div>
        </div>
      </div>


      <div className="p-4 border-t-2 border-black bg-black/30">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-heavy-yellow animate-pulse"></div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">SYSTEM: <span className="text-heavy-yellow">NOMINAL</span></p>
            </div>
            <button onClick={logout} className="text-[10px] font-mono text-red-500 hover:text-white uppercase tracking-wider text-left hover:underline">
                [ Terminate_Session ]
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
