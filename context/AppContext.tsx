
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Task, Asset, AccessRequest, UserAccount, Message, UserSession, FABRICATION_COSTS } from '../types';
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
  allUsers: UserAccount[];
  approveRequest: (id: string) => Promise<void>;
  denyRequest: (id: string) => Promise<void>;
  submitAccessRequest: (name: string, reason: string) => Promise<void>;
  allocateCredits: (userId: string, amount: number) => Promise<void>;

  // User Data State
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'timestamp'>) => Promise<void>;
  removeAsset: (assetId: string) => Promise<void>;
  
  chatHistories: Record<Task, Message[]>;
  addMessage: (task: Task.Chat | Task.OpenAIChat | Task.GrokChat, message: Message) => Promise<void>;
  
  // Credit Management
  userCredits: number;
  hasSufficientCredits: (task: Task) => boolean;
  consumeCredits: (task: Task) => Promise<boolean>;

  // Onboarding
  showOnboarding: boolean;
  closeOnboarding: () => void;
  
  // API Error Handling
  handleApiError: (error: unknown, provider: ApiProvider) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useLocalStorage<Task>('im_active_task', Task.Chat);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('im_theme', 'dark');

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [chatHistories, setChatHistories] = useState<Record<Task, Message[]>>({} as Record<Task, Message[]>);
  
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('im_has_seen_onboarding', false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light-theme' : 'dark');
    root.classList.add(theme === 'dark' ? 'dark' : 'light-theme');
  }, [theme]);
  
  // Fix: Added missing toggleTheme function definition to satisfy AppContextType and Provide value
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  const fetchAllUserData = useCallback(async () => {
      const [userAssets, userChats, requests, usersList] = await Promise.all([
          backend.getAssets(),
          backend.getChatHistories(),
          backend.getAccessRequests(),
          backend.getAllUsers()
      ]);
      setAssets(userAssets);
      setChatHistories(userChats);
      setAccessRequests(requests);
      setAllUsers(usersList);
  }, []);

  useEffect(() => {
    const verifySession = async () => {
        const session = await backend.checkSession();
        if (session) {
            setCurrentUser(session);
            await fetchAllUserData();
        }
        setIsAuthenticating(false);
    };
    verifySession();
  }, [fetchAllUserData]);

  const login = async (pin: string) => {
    const result = await backend.login(pin);
    if (result.success && result.session) {
      setCurrentUser(result.session);
      await fetchAllUserData();
      if (!hasSeenOnboarding) setShowOnboarding(true);
    }
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    await backend.logout();
    setCurrentUser(null);
    setAssets([]);
    setChatHistories({} as Record<Task, Message[]>);
  };

  const allocateCredits = async (userId: string, amount: number) => {
      await backend.addCreditsToUser(userId, amount);
      const updatedUsers = await backend.getAllUsers();
      setAllUsers(updatedUsers);
  };

  const hasSufficientCredits = (task: Task) => {
      const cost = (FABRICATION_COSTS as any)[task] || 0;
      return (currentUser?.credits || 0) >= cost;
  };

  const consumeCredits = async (task: Task) => {
      const cost = (FABRICATION_COSTS as any)[task] || 0;
      const success = await backend.deductCredits(cost);
      if (success && currentUser) {
          setCurrentUser({ ...currentUser, credits: currentUser.credits - cost });
      }
      return success;
  };

  const addAsset = async (assetData: Omit<Asset, 'id' | 'timestamp'>) => {
      const newAsset = await backend.addAsset(assetData);
      setAssets(prev => [newAsset, ...prev]);
  };

  const addMessage = async (task: Task.Chat | Task.OpenAIChat | Task.GrokChat, message: Message) => {
      const updatedHistory = await backend.addMessage(task, message);
      setChatHistories(prev => ({...prev, [task]: updatedHistory}));
  };

  const approveRequest = async (id: string) => {
      await backend.approveRequest(id);
      await fetchAllUserData();
  };

  const denyRequest = async (id: string) => {
      await backend.denyRequest(id);
      await fetchAllUserData();
  };

  const handleApiError = useCallback((error: unknown, provider: ApiProvider) => {
      if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized')) {
              backend.clearApiKey(provider);
              window.location.reload();
          }
      }
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        activeTask, setActiveTask, isSidebarOpen, setIsSidebarOpen, theme, toggleTheme,
        isAuthenticating, isAuthenticated, isAdmin, currentUser, login, logout,
        accessRequests, allUsers, approveRequest, denyRequest, submitAccessRequest: backend.submitAccessRequest, allocateCredits,
        assets, addAsset, removeAsset: backend.removeAsset, chatHistories, addMessage,
        userCredits: currentUser?.credits || 0, hasSufficientCredits, consumeCredits,
        showOnboarding, closeOnboarding: () => { setShowOnboarding(false); setHasSeenOnboarding(true); },
        handleApiError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
