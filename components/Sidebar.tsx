import React, { useContext } from 'react';
import { Task, Overlay, ClearanceLevel } from '../types';
import { AuthContext } from '../contexts/AuthProvider';
import { ConfigContext } from '../contexts/ConfigProvider';
import { MessageSquare, Image, Video, Film, Speaker, Microphone, BrainCircuit, Lock, Crane, XIcon, Bulldozer, Gear, Palette } from './common/Icons';

interface SidebarProps {
  activeTask: Task;
  setActiveTask: (task: Task) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeOverlay: Overlay;
  setActiveOverlay: (overlay: Overlay) => void;
}

interface NavItemType {
  id: Task | Overlay;
  icon: React.ReactNode;
  label: string;
  minLevel: ClearanceLevel;
  simulated?: boolean;
  isTask: boolean;
}


const Sidebar: React.FC<SidebarProps> = ({ 
  activeTask, setActiveTask, isSidebarOpen, setIsSidebarOpen, activeOverlay, setActiveOverlay 
}) => {
  const { clearance } = useContext(AuthContext);
  const { devMode } = useContext(ConfigContext);

  const mainNavItems: NavItemType[] = [
    { id: Task.Chat, icon: <MessageSquare className="h-6 w-6" />, label: 'Chat Interface', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.LiveConversation, icon: <Microphone className="h-6 w-6" />, label: 'Live Conversation', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.TextToImage, icon: <Image className="h-6 w-6" />, label: 'Image Synthesis', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.ImageEdit, icon: <Gear className="h-6 w-6" />, label: 'Image Editor', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.TextToVideo, icon: <Video className="h-6 w-6" />, label: 'Video Generation', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.ImageToVideo, icon: <Film className="h-6 w-6" />, label: 'Image to Video', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.TextToSpeech, icon: <Speaker className="h-6 w-6" />, label: 'Speech Synthesis', minLevel: ClearanceLevel.STANDARD, isTask: true },
    { id: Task.Theme, icon: <Palette className="h-6 w-6" />, label: 'Theme Studio', minLevel: ClearanceLevel.STANDARD, isTask: true },
  ];
  
  const advancedNavItems: NavItemType[] = [
    { id: Task.Comparison, icon: <BrainCircuit className="h-6 w-6" />, label: 'Comparison Matrix', minLevel: ClearanceLevel.CLASSIFIED, isTask: true },
    { id: Task.Pipeline, icon: <Bulldozer className="h-6 w-6" />, label: 'Pipeline Automation', minLevel: ClearanceLevel.STANDARD, isTask: true },
  ];

  const guestNavItems: NavItemType[] = [
    { id: Task.OpenAIChat, icon: <MessageSquare className="h-6 w-6" />, label: 'OpenAI Chat', minLevel: ClearanceLevel.CLASSIFIED, isTask: true },
    { id: Task.OpenAITextToImage, icon: <Image className="h-6 w-6" />, label: 'DALL-E Forge', minLevel: ClearanceLevel.CLASSIFIED, isTask: true },
    { id: Task.OpenAITextToVideo, icon: <Video className="h-6 w-6" />, label: 'Sora Synth', minLevel: ClearanceLevel.CLASSIFIED, simulated: true, isTask: true },
    { id: Task.GrokChat, icon: <MessageSquare className="h-6 w-6" />, label: 'Grok Chat', minLevel: ClearanceLevel.CLASSIFIED, isTask: true },
    { id: Task.GrokTextToImage, icon: <Image className="h-6 w-6" />, label: 'X-Corp Forge', minLevel: ClearanceLevel.CLASSIFIED, simulated: true, isTask: true },
    { id: Task.GrokImageToVideo, icon: <Film className="h-6 w-6" />, label: 'X-Corp Motion', minLevel: ClearanceLevel.CLASSIFIED, simulated: true, isTask: true },
  ];

  const overlayItems: NavItemType[] = [
      { id: 'manifest', icon: <Crane className="h-6 w-6" />, label: 'Asset Manifest', minLevel: ClearanceLevel.STANDARD, isTask: false },
      { id: 'logs', icon: <MessageSquare className="h-6 w-6" />, label: 'System Logs', minLevel: ClearanceLevel.STANDARD, isTask: false },
      { id: 'security', icon: <Lock className="h-6 w-6" />, label: 'Security', minLevel: ClearanceLevel.STANDARD, isTask: false },
  ];

  const handleNavClick = (item: NavItemType) => {
    if (item.isTask) {
        setActiveTask(item.id as Task);
    } else {
        setActiveOverlay(item.id as Overlay);
    }
    setIsSidebarOpen(false);
  };
  
  const NavItem: React.FC<{ item: NavItemType }> = ({ item }) => {
    const isActive = (item.isTask && activeTask === item.id && !activeOverlay) || (!item.isTask && activeOverlay === item.id);
    const isLocked = clearance < item.minLevel || (item.simulated && !devMode);

    return (
      <li>
        <button
          onClick={() => !isLocked && handleNavClick(item)}
          className={`w-full flex items-center p-3 rounded-md transition-all duration-200 relative overflow-hidden group text-lg ${
            isLocked ? 'opacity-30 cursor-not-allowed' :
            isActive ? `bg-aura-violet text-white shadow-[0_0_15px_var(--aura-violet)]` :
            'text-aura-gray hover:text-aura-light hover:bg-aura-mauve/40'
          }`}
          disabled={isLocked}
        >
          <div className={`absolute top-0 left-0 bottom-0 w-1 bg-aura-cyan transition-transform duration-300 ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></div>
          <div className="ml-3 mr-4">
            {isLocked ? <Lock className="h-5 w-5" /> : item.icon}
          </div>
          <span className="font-body text-sm flex-1 text-left">
            {item.label}
            {item.simulated && <span className="text-yellow-500 text-[10px] ml-2">(SIM)</span>}
          </span>
          {isLocked && <span className="text-[9px] border border-aura-mauve px-1.5 py-0.5 rounded-sm">LOCKED</span>}
        </button>
      </li>
    );
  };

  const NavList: React.FC<{ items: ReadonlyArray<NavItemType> }> = ({ items }) => (
    <ul className="space-y-2">
      {items.map((item) => <NavItem key={item.id} item={item} />)}
    </ul>
  );

  const NavHeader: React.FC<{ title: string }> = ({ title }) => (
      <h2 className="px-3 pt-6 pb-2 text-[10px] font-body text-aura-mauve uppercase tracking-[0.2em]">{title}</h2>
  );

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden animate-in fade-in-0 duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <nav className={`fixed inset-y-0 left-0 z-50 w-72 bg-aura-slate/80 backdrop-blur-xl border-r border-aura-mauve/50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 flex flex-col items-center border-b border-aura-mauve/50">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 md:hidden text-aura-gray hover:text-aura-light"
          >
            <XIcon className="h-6 w-6" />
          </button>
          <div className="text-center font-heading py-4">
            <h1 className="text-5xl font-black text-aura-light tracking-tighter">AURA</h1>
            <p className="text-[10px] font-body text-aura-violet tracking-widest mt-2 uppercase">Core Interface</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <NavHeader title="Mainframe" />
          <NavList items={mainNavItems} />
          
          <NavHeader title="Advanced" />
          <NavList items={advancedNavItems} />

          <NavHeader title="Guest Systems" />
          <NavList items={guestNavItems} />

          <NavHeader title="System" />
          <NavList items={overlayItems} />
        </div>

        <div className="p-4 border-t border-aura-mauve/50">
          <div className="flex items-center gap-3 bg-aura-indigo p-3 rounded-md">
            <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${clearance > 0 ? 'bg-green-400' : 'bg-red-500'}`} style={{boxShadow: `0 0 8px ${clearance > 0 ? '#4ade80' : '#ef4444'}`}}></div>
            <p className="text-xs font-body text-aura-gray uppercase tracking-widest">
              Lvl {clearance}: <span className={clearance > 0 ? 'text-green-400' : 'text-red-400'}>{ClearanceLevel[clearance]}</span>
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
