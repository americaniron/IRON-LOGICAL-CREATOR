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

const CreditGauge: React.FC = () => {
    const { userCredits, currentUser } = useAppContext();
    const max = currentUser?.plan === 'commander' ? 999999 : (currentUser?.plan === 'pro' ? 5000 : 1000);
    const percentage = Math.min((userCredits / max) * 100, 100);
    
    return (
        <div className="flex items-center gap-4 bg-black/40 px-4 py-1.5 border border-industrial-gray shadow-inner hidden md:flex">
            <span className="text-[9px] font-mono text-heavy-yellow uppercase font-bold tracking-widest">System_Energy:</span>
            <div className="w-32 h-2 bg-gray-900 border border-industrial-gray relative overflow-hidden">
                <div 
                    className="h-full bg-heavy-yellow shadow-[0_0_10px_var(--heavy-yellow)] transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="text-[10px] font-mono text-white font-black">{userCredits} IC</span>
        </div>
    );
};

const AppContent: React.FC = () => {
  const { activeTask, isSidebarOpen, setIsSidebarOpen, isAuthenticated, isAuthenticating, showOnboarding, closeOnboarding } = useAppContext();

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--industrial-black)] flex items-center justify-center">
        <Spinner text="VERIFYING OPERATIVE CLEARANCE..." />
      </div>
    );
  }
  
  if (!isAuthenticated) return <AuthScreen />;

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
    <div className="flex h-full w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden">
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
      <Sidebar />
      {isSidebarOpen && (
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"></div>
      )}
      <div className="flex flex-col flex-1 relative overflow-hidden h-full">
        <div className="absolute inset-0 pointer-events-none border-4 sm:border-8 border-[var(--border-secondary)] z-30 hidden md:block"></div>
        <Header />
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto relative z-10 scrollbar-thin">
          <div className="w-full h-full max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
        <footer className="h-10 sm:h-12 bg-black border-t-2 border-industrial-gray flex items-center px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-heavy-yellow shadow-[0_0_8px_var(--heavy-yellow)] animate-pulse"></div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">LINK_STATUS: <span className="text-white">ENCRYPTED</span></span>
              </div>
              <CreditGauge />
            </div>
            <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">IM_ORCHESTRATOR_V6.1_LIVE</p>
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