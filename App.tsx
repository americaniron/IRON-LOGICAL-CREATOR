import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import ImagePanel from './components/ImagePanel';
import VideoPanel from './components/VideoPanel';
import SpeechPanel from './components/SpeechPanel';
import LiveConversationPanel from './components/LiveConversationPanel';
import AssetBayPanel from './components/AssetBayPanel';
import OpenAIChatPanel from './components/OpenAIChatPanel';
import OpenAIImagePanel from './components/OpenAIImagePanel';
import OpenAIVideoPanel from './components/OpenAIVideoPanel';
import GrokChatPanel from './components/GrokChatPanel';
import GrokImagePanel from './components/GrokImagePanel';
import GrokVideoPanel from './components/GrokVideoPanel';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import OnboardingModal from './components/OnboardingModal';
import { Task } from './types';
import Spinner from './components/common/Spinner';

const AppContent: React.FC = () => {
  const { activeTask, isSidebarOpen, setIsSidebarOpen, isAuthenticated, isAuthenticating, showOnboarding, closeOnboarding } = useAppContext();

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 z-[100] bg-asphalt flex items-center justify-center">
        <Spinner text="AUTHENTICATING..." />
      </div>
    );
  }
  
  // Guard Clause for Authentication
  if (!isAuthenticated) {
      return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeTask) {
      case Task.TextToImage: return <ImagePanel />;
      case Task.TextToVideo: return <VideoPanel task={Task.TextToVideo} />;
      case Task.ImageToVideo: return <VideoPanel task={Task.ImageToVideo} />;
      case Task.TextToSpeech: return <SpeechPanel />;
      case Task.LiveConversation: return <LiveConversationPanel />;
      case Task.AssetBay: return <AssetBayPanel />;
      case Task.OpenAIChat: return <OpenAIChatPanel />;
      case Task.OpenAITextToImage: return <OpenAIImagePanel />;
      case Task.OpenAITextToVideo: return <OpenAIVideoPanel />;
      case Task.GrokChat: return <GrokChatPanel />;
      case Task.GrokTextToImage: return <GrokImagePanel />;
      case Task.GrokTextToVideo: return <GrokVideoPanel />;
      case Task.AdminPanel: return <AdminPanel />;
      case Task.Chat:
      default: return <ChatPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden">
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
      <Sidebar />
      {isSidebarOpen && (
          <div 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
              aria-hidden="true"
          ></div>
      )}
      <div className="flex flex-col flex-1 relative overflow-hidden md:p-2">
        <div className="absolute inset-0 pointer-events-none border-4 sm:border-8 border-[var(--border-secondary)] z-30 hidden md:block" aria-hidden="true"></div>
        <div className="absolute inset-2 pointer-events-none border border-[var(--border-primary)] z-30 opacity-50 hidden md:block" aria-hidden="true"></div>
        
        <Header />
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto relative z-10 scrollbar-thin">
          <div className="w-full h-full max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
        
        <footer className="h-8 sm:h-10 bg-[var(--bg-tertiary)] border-t-2 border-[var(--border-primary)] flex items-center px-4 sm:px-6 z-20">
          <div className="flex items-center gap-4 sm:gap-8 w-full">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[var(--accent-primary)] shadow-[var(--accent-glow)] border border-yellow-900"></div>
              <span className="text-[8px] sm:text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest font-bold">CORE_LINK: <span className="text-[var(--accent-primary)]">ACTIVE</span></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF] border border-gray-900"></div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest font-bold">POWER: <span className="text-[var(--text-primary)]">NOMINAL</span></span>
            </div>
            <div className="flex-1 text-right">
                <p className="text-[8px] sm:text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">IM_ORCHESTRATOR_V6.0_PUBLIC_RELEASE</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;