
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#1A1A1B] border-b-4 border-[#2D2E30] px-8 py-6 flex justify-between items-center sticky top-0 z-20 shadow-xl industrial-grid">
      <div className="flex items-center gap-4">
        <div className="h-4 w-4 bg-red-600 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">
          // Command_Deck <span className="text-[#EBB700]">01</span> _
        </h2>
      </div>
      <div className="hidden lg:flex items-center gap-8 font-mono text-[10px] text-gray-500 tracking-[0.2em] uppercase">
        <div className="flex flex-col items-end">
          <span>Auth_Token</span>
          <span className="text-green-500">Verified_Secure</span>
        </div>
        <div className="flex flex-col items-end">
          <span>System_Uptime</span>
          <span className="text-white">99.98%</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
