
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Task, Asset, AccessRequest, UserAccount } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  activeTask: Task;
  setActiveTask: (task: Task) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  // Auth Props
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: UserAccount | null;
  login: (pin: string) => { success: boolean; message?: string };
  logout: () => void;
  submitAccessRequest: (name: string, reason: string) => void;
  accessRequests: AccessRequest[];
  approveRequest: (id: string) => void;
  denyRequest: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_PIN = "01970";

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useLocalStorage<Task>('im_active_task', Task.Chat);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assets, setAssets] = useLocalStorage<Asset[]>('im_asset_bay', []);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // Storage for Requests and Approved Users (Simulating Backend)
  const [accessRequests, setAccessRequests] = useLocalStorage<AccessRequest[]>('im_access_requests', []);
  const [approvedUsers, setApprovedUsers] = useLocalStorage<UserAccount[]>('im_approved_users', []);

  const addAsset = (newAsset: Asset) => {
    setAssets(prevAssets => [newAsset, ...prevAssets]);
  };

  const removeAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
  };

  const login = (pin: string) => {
      if (pin === ADMIN_PIN) {
          setIsAuthenticated(true);
          setIsAdmin(true);
          setCurrentUser({ name: 'COMMANDER', pin: ADMIN_PIN, role: 'admin' });
          return { success: true };
      }

      const user = approvedUsers.find(u => u.pin === pin);
      if (user) {
          setIsAuthenticated(true);
          setIsAdmin(false);
          setCurrentUser(user);
          return { success: true };
      }

      return { success: false, message: 'INVALID CREDENTIALS' };
  };

  const logout = () => {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setCurrentUser(null);
  };

  const submitAccessRequest = (name: string, reason: string) => {
      const newRequest: AccessRequest = {
          id: Date.now().toString(),
          name,
          reason,
          timestamp: Date.now(),
          status: 'pending'
      };
      setAccessRequests(prev => [...prev, newRequest]);
  };

  const approveRequest = (id: string) => {
      // Generate a random 5 digit PIN that isn't the admin pin
      let newPin = Math.floor(10000 + Math.random() * 90000).toString();
      while(newPin === ADMIN_PIN) {
          newPin = Math.floor(10000 + Math.random() * 90000).toString();
      }

      setAccessRequests(prev => prev.map(req => {
          if (req.id === id) {
              // Create user account
              const newUser: UserAccount = {
                  name: req.name,
                  pin: newPin,
                  role: 'user'
              };
              setApprovedUsers(prevUsers => [...prevUsers, newUser]);
              return { ...req, status: 'approved', generatedPin: newPin };
          }
          return req;
      }));
  };

  const denyRequest = (id: string) => {
      setAccessRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'denied' } : req));
  };

  return (
    <AppContext.Provider 
      value={{ 
        activeTask, 
        setActiveTask, 
        isSidebarOpen, 
        setIsSidebarOpen,
        assets,
        addAsset,
        removeAsset,
        isAuthenticated,
        isAdmin,
        currentUser,
        login,
        logout,
        submitAccessRequest,
        accessRequests,
        approveRequest,
        denyRequest
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
