import React, { useContext } from 'react';
import { Menu, XIcon } from './common/Icons';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  const { telemetry, isOnline, emergencyHalt } = useContext(SystemStatusContext);

  return (
    <header className="bg-steel/70 backdrop-blur-md border-b-2 border-black px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-20 shadow-lg">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-light active:scale-90 transition-transform" 
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className={`h-2.5 w-2.5 ${isOnline ? 'bg-heavy-yellow' : 'bg-red-500'} rounded-full shadow-[0_0_8px] animate-pulse`}></div>
        <h2 className="text-xl md:text-2xl font-heading text-text-light tracking-wider uppercase">
          Site<span className="text-heavy-yellow">_</span>Orchestrator
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4 font-body text-[10px] md:text-xs text-text-muted tracking-wider uppercase">
        <div className="text-center hidden sm:block">
          <span>OPERATIONS</span>
          <span className="text-text-light font-bold ml-2">{telemetry.totalOps}</span>
        </div>
        <div className="w-px h-6 bg-industrial-gray/50 hidden sm:block"></div>
        <div className="text-center hidden sm:block">
           <span>STABILITY</span>
           <span className={`${telemetry.errorCount > 0 ? 'text-red-500' : 'text-green-400'} font-bold ml-2`}>
             {telemetry.totalOps > 0 ? `${Math.max(0, 100 - (telemetry.errorCount / telemetry.totalOps * 100)).toFixed(1)}%` : '100%'}
           </span>
        </div>
        <button 
          onClick={emergencyHalt}
          className="bg-red-600/20 text-red-400 p-2 border-2 border-black border-t-red-500 border-l-red-500 hover:bg-red-600 hover:text-white active:scale-95 transition-all relative overflow-hidden"
          title="EMERGENCY_HALT"
        >
          <div className="caution-stripes h-full w-full absolute top-0 left-0 opacity-20 animate-pulse"></div>
          <XIcon className="h-5 w-5 relative z-10" />
        </button>
      </div>
    </header>
  );
};

export default Header;