import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Task, Overlay } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import ImagePanel from './components/ImagePanel';
import VideoPanel from './components/VideoPanel';
import SpeechPanel from './components/SpeechPanel';
import LiveConversationPanel from './components/LiveConversationPanel';
import OpenAIChatPanel from './components/OpenAIChatPanel';
import OpenAIImagePanel from './components/OpenAIImagePanel';
import OpenAIVideoPanel from './components/OpenAIVideoPanel';
import GrokChatPanel from './components/GrokChatPanel';
import GrokImagePanel from './components/GrokImagePanel';
import GrokVideoPanel from './components/GrokVideoPanel';
import SecurityPanel from './components/SecurityPanel';
import ManifestPanel from './components/ManifestPanel';
import LogsPanel from './components/LogsPanel';
import NotificationSystem from './components/NotificationSystem';
import ImageEditPanel from './components/ImageEditPanel';
import ComparisonPanel from './components/ComparisonPanel';
import PipelinePanel from './components/PipelinePanel';
import ThemePanel from './components/ThemePanel';
import { XIcon } from './components/common/Icons';
import { AuthProvider } from './contexts/AuthProvider';
import { ConfigProvider, ConfigContext } from './contexts/ConfigProvider';
import { SystemStatusProvider } from './contexts/SystemStatusProvider';
import { AssetProvider } from './contexts/AssetProvider';


const App: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Task>(() => {
    const hash = window.location.hash.replace('#/', '');
    const validTasks = Object.values(Task) as string[];
    return validTasks.includes(hash) ? (hash as Task) : Task.Chat;
  });
  
  const [activeOverlay, setActiveOverlay] = useState<Overlay>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { playFeedback } = useContext(ConfigContext);

  const handleTaskChange = (task: Task) => {
    playFeedback('click');
    setActiveTask(task);
    setActiveOverlay(null);
    setIsSidebarOpen(false);
    window.location.hash = `#/${task}`;
  };

  const handleOverlayChange = (overlay: Overlay) => {
    playFeedback('click');
    setActiveOverlay(overlay);
    setIsSidebarOpen(false);
  };
  
  const getOverlayTitle = (overlay: Overlay) => {
      switch (overlay) {
          case 'security': return 'Security Interface';
          case 'logs': return 'System Telemetry';
          case 'manifest': return 'Asset Manifest';
          default: return '';
      }
  };
  
  const renderOverlayContent = (overlay: Overlay) => {
    switch (overlay) {
      case 'security': return <SecurityPanel />;
      case 'logs': return <LogsPanel />;
      case 'manifest': return <ManifestPanel />;
      default: return null;
    }
  };


  return (
      <div className="flex h-screen w-screen overflow-hidden hex-grid bg-aura-indigo">
        <Sidebar 
          activeTask={activeTask} setActiveTask={handleTaskChange} 
          isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
          activeOverlay={activeOverlay} setActiveOverlay={handleOverlayChange}
        />
        <div className="flex-1 flex flex-col min-w-0 relative">
          <Header setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin animate-in fade-in-0 duration-500">
            {renderPanel(activeTask)}
          </main>

          {activeOverlay && (
             <div className="fixed inset-0 z-40">
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
                    onClick={() => setActiveOverlay(null)}
                ></div>
                <div className="absolute top-0 right-0 h-full w-full max-w-4xl bg-aura-slate/80 backdrop-blur-lg border-l border-aura-mauve shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500">
                    <div className="flex justify-between items-center p-6 border-b border-aura-mauve/50">
                        <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-aura-violet rounded-full animate-pulse" style={{boxShadow: '0 0 10px var(--aura-violet)'}}></div>
                        <h3 className="font-heading uppercase text-xl tracking-widest text-aura-light">
                            {getOverlayTitle(activeOverlay)}
                        </h3>
                        </div>
                        <button onClick={() => setActiveOverlay(null)} className="p-2 rounded-full hover:bg-aura-mauve text-aura-gray hover:text-aura-light transition-colors">
                          <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                        {renderOverlayContent(activeOverlay)}
                    </div>
                </div>
            </div>
          )}
        </div>
        <NotificationSystem />
      </div>
  );
};

const renderPanel = (activeTask: Task) => {
  switch (activeTask) {
    case Task.Chat: return <ChatPanel />;
    case Task.TextToImage: return <ImagePanel />;
    case Task.TextToVideo: return <VideoPanel task={Task.TextToVideo} />;
    case Task.ImageToVideo: return <VideoPanel task={Task.ImageToVideo} />;
    case Task.TextToSpeech: return <SpeechPanel />;
    case Task.LiveConversation: return <LiveConversationPanel />;
    case Task.OpenAIChat: return <OpenAIChatPanel />;
    case Task.OpenAITextToImage: return <OpenAIImagePanel />;
    case Task.OpenAITextToVideo: return <OpenAIVideoPanel />;
    case Task.GrokChat: return <GrokChatPanel />;
    case Task.GrokTextToImage: return <GrokImagePanel />;
    case Task.GrokImageToVideo: return <GrokVideoPanel />;
    case Task.Comparison: return <ComparisonPanel />;
    case Task.Pipeline: return <PipelinePanel />;
    case Task.ImageEdit: return <ImageEditPanel />;
    case Task.Theme: return <ThemePanel />;
    default: return <ChatPanel />;
  }
};

const AppWithProviders: React.FC = () => (
  <ConfigProvider>
    <SystemStatusProvider>
      <AuthProvider>
        <AssetProvider>
          <App />
        </AssetProvider>
      </AuthProvider>
    </SystemStatusProvider>
  </ConfigProvider>
);

export default AppWithProviders;
