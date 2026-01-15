
import React from 'react';
import { Task } from '../types';
import { MessageSquare, Image, Video, Film, Speaker, Microphone, Crane } from './common/Icons';

interface SidebarProps {
  activeTask: Task;
  setActiveTask: (task: Task) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTask, setActiveTask }) => {
  const navItems = [
    { id: Task.Chat, icon: <MessageSquare className="h-6 w-6" />, label: 'Control Deck' },
    { id: Task.LiveConversation, icon: <Microphone className="h-6 w-6" />, label: 'Comm Link' },
    { id: Task.TextToImage, icon: <Image className="h-6 w-6" />, label: 'Fab Shop' },
    { id: Task.TextToVideo, icon: <Video className="h-6 w-6" />, label: 'Assembly Line' },
    { id: Task.ImageToVideo, icon: <Film className="h-6 w-6" />, label: 'VFX Rig' },
    { id: Task.TextToSpeech, icon: <Speaker className="h-6 w-6" />, label: 'PA System' },
  ];

  return (
    <nav className="w-16 md:w-72 bg-[#1A1A1B] border-r-8 border-[#2D2E30] flex flex-col shadow-2xl relative">
      <div className="absolute right-0 top-0 bottom-0 w-2 caution-stripes opacity-30"></div>
      
      <div className="p-4 md:p-8 flex items-center gap-4 border-b-4 border-[#2D2E30] bg-[#222]">
        <div className="p-2 bg-[#EBB700] rounded-sm shadow-lg">
          <Crane className="h-8 w-8 text-black" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-2xl font-black text-white tracking-tighter leading-none">SITE</h1>
          <p className="text-[10px] font-mono text-[#EBB700] tracking-widest mt-1 uppercase">Operations Manager</p>
        </div>
      </div>

      <ul className="flex-1 p-2 md:p-4 space-y-4 overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveTask(item.id)}
              className={`w-full flex items-center p-4 rounded-sm transition-all relative overflow-hidden group ${
                activeTask === item.id
                  ? 'bg-[#EBB700] text-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                  : 'text-gray-500 hover:text-white hover:bg-[#2D2E30]'
              }`}
            >
              <div className={`mr-4 transition-transform group-hover:scale-110 ${activeTask === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`font-black uppercase tracking-wider hidden md:block text-sm`}>
                {item.label}
              </span>
              {activeTask === item.id && (
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-black/20"></div>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t-4 border-[#2D2E30] bg-[#111] hidden md:block">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Hydraulic Pressure: Optimal</p>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
