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
        <div className="flex items-center gap-2 md:gap-3 bg-[var(--bg-secondary)] px-3 py-1.5 border border-[var(--border-primary)] rounded-md hidden sm:flex">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] hidden lg:inline">Credits:</span>
            <div className="w-20 md:w-24 h-2 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[var(--accent-primary)] transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-primary)] font-bold">{userCredits}</span>
        </div>
    );
};

const AppContent: React.FC = () => {
  const { activeTask, isSidebarOpen, setIsSidebarOpen, isAuthenticated, isAuthenticating, showOnboarding, closeOnboarding } = useAppContext();

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex items-center justify-center">
        <Spinner text="Verifying Access..." />
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
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"></div>
      )}
      <div className="flex flex-col flex-1 relative overflow-hidden h-full">
        <Header />
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto relative z-10 scrollbar-thin bg-[var(--bg-primary)]">
          <div className="w-full h-full max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        <footer className="h-12 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex items-center px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Status: <span className="text-[var(--text-primary)]">Online</span></span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CreditGauge />
              <p className="text-xs font-mono text-[var(--text-muted)]">v1.0</p>
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