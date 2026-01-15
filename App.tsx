
import React, { useState } from 'react';
import { Task } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import ImagePanel from './components/ImagePanel';
import VideoPanel from './components/VideoPanel';
import SpeechPanel from './components/SpeechPanel';
import LiveConversationPanel from './components/LiveConversationPanel';

const App: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Task>(Task.Chat);

  const renderContent = () => {
    switch (activeTask) {
      case Task.TextToImage:
        return <ImagePanel />;
      case Task.TextToVideo:
        return <VideoPanel task={Task.TextToVideo} />;
      case Task.ImageToVideo:
        return <VideoPanel task={Task.ImageToVideo} />;
      case Task.TextToSpeech:
        return <SpeechPanel />;
      case Task.LiveConversation:
        return <LiveConversationPanel />;
      case Task.Chat:
      default:
        return <ChatPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1A1B] text-gray-100 font-sans industrial-grid overflow-hidden">
      <Sidebar activeTask={activeTask} setActiveTask={setActiveTask} />
      <div className="flex flex-col flex-1 relative overflow-hidden">
        {/* Structural frame for the main view */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-[#2D2E30] z-30 opacity-50"></div>
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative z-10">
          <div className="max-w-[1600px] mx-auto h-full">
            {renderContent()}
          </div>
        </main>
        
        {/* Industrial Footer Status Bar */}
        <footer className="h-8 bg-[#111] border-t-4 border-[#2D2E30] flex items-center px-6 z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Core_Engine: Active</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#EBB700] shadow-[0_0_5px_#EBB700]"></div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Hydraulics: 100%</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
