import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Task, Asset, AccessRequest, UserAccount, Message, UserSession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import * as backend from '../services/backendService';
import { ApiProvider } from '../hooks/useApiKeyManager';

interface AppContextType {
  // UI State
  activeTask: Task;
  setActiveTask: (task: Task) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Auth State
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: UserSession | null;
  login: (pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  
  // Admin State
  accessRequests: AccessRequest[];
  approveRequest: (id: string) => Promise<void>;
  denyRequest: (id: string) => Promise<void>;
  submitAccessRequest: (name: string, reason: string) => Promise<void>;

  // User Data State
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'timestamp'>) => Promise<void>;
  removeAsset: (assetId: string) => Promise<void>;
  
  chatHistories: Record<Task, Message[]>;
  addMessage: (task: Task.Chat | Task.OpenAIChat | Task.GrokChat, message: Message) => Promise<void>;

  // Onboarding
  showOnboarding: boolean;
  closeOnboarding: () => void;
  
  // API Error Handling
  handleApiError: (error: unknown, provider: ApiProvider) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // UI State
  const [activeTask, setActiveTask] = useLocalStorage<Task>('im_active_task', Task.Chat);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('im_theme', 'dark');

  // Auth State
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  // Admin State
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  // User Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [chatHistories, setChatHistories] = useState<Record<Task, Message[]>>({
      [Task.Chat]: [], [Task.OpenAIChat]: [], [Task.GrokChat]: []
  } as Record<Task, Message[]>);
  
  // Onboarding State
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('im_has_seen_onboarding', false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light-theme' : 'dark');
    root.classList.add(theme === 'dark' ? 'dark' : 'light-theme');
  }, [theme]);
  
  useEffect(() => {
    const verifySession = async () => {
        const session = await backend.checkSession();
        if (session) {
            await fetchAllUserData();
            setCurrentUser(session);
        }
        setIsAuthenticating(false);
    };
    verifySession();
  }, []);

  useEffect(() => {
    if(isAdmin) {
        const fetchRequests = async () => {
            const requests = await backend.getAccessRequests();
            setAccessRequests(requests);
        }
        fetchRequests();
    }
  }, [isAdmin]);

  // --- Methods ---

  const fetchAllUserData = async () => {
      const [userAssets, userChats, requests] = await Promise.all([
          backend.getAssets(),
          backend.getChatHistories(),
          backend.getAccessRequests() // Fetch for admin badge counts etc. in future
      ]);
      setAssets(userAssets);
      setChatHistories(userChats);
      setAccessRequests(requests);
  };
  
  const clearAllUserData = () => {
      setAssets([]);
      setChatHistories({ [Task.Chat]: [], [Task.OpenAIChat]: [], [Task.GrokChat]: [] } as Record<Task, Message[]>);
      setAccessRequests([]);
  };

  const login = async (pin: string) => {
    const result = await backend.login(pin);
    if (result.success && result.session) {
      setIsAuthenticating(true);
      setCurrentUser(result.session);
      await fetchAllUserData();
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
      setIsAuthenticating(false);
    }
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    await backend.logout();
    setCurrentUser(null);
    clearAllUserData();
  };
  
  const approveRequest = async (id: string) => {
      await backend.approveRequest(id);
      const requests = await backend.getAccessRequests();
      setAccessRequests(requests);
  };

  const denyRequest = async (id: string) => {
      await backend.denyRequest(id);
      const requests = await backend.getAccessRequests();
      setAccessRequests(requests);
  };
  
  const submitAccessRequest = async (name: string, reason: string) => {
      await backend.submitAccessRequest(name, reason);
  };

  const addAsset = async (assetData: Omit<Asset, 'id' | 'timestamp'>) => {
      const newAsset = await backend.addAsset(assetData);
      setAssets(prev => [newAsset, ...prev]);
  };

  const removeAsset = async (assetId: string) => {
      await backend.removeAsset(assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const addMessage = async (task: Task.Chat | Task.OpenAIChat | Task.GrokChat, message: Message) => {
      const updatedHistory = await backend.addMessage(task, message);
      setChatHistories(prev => ({...prev, [task]: updatedHistory}));
  };

  const closeOnboarding = () => {
      setShowOnboarding(false);
      setHasSeenOnboarding(true);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleApiError = useCallback((error: unknown, provider: ApiProvider) => {
      if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('permission_denied') || msg.includes('requested entity was not found')) {
              if (provider === 'gemini_pro') {
                  // This is a special case handled by window.aistudio
                  // The key reset is handled inside the component logic
              } else {
                  console.warn(`Authentication error for ${provider}. Forcing key re-entry.`);
                  backend.clearApiKey(provider);
                  // Force a reload to bring user back to the key prompt screen
                  window.location.reload();
              }
          }
      }
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        activeTask, setActiveTask, 
        isSidebarOpen, setIsSidebarOpen,
        theme, toggleTheme,
        isAuthenticating, isAuthenticated, isAdmin, currentUser,
        login, logout,
        accessRequests, approveRequest, denyRequest, submitAccessRequest,
        assets, addAsset, removeAsset,
        chatHistories, addMessage,
        showOnboarding, closeOnboarding,
        handleApiError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};