import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Task, Asset } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  activeTask: Task;
  setActiveTask: (task: Task) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useLocalStorage<Task>('im_active_task', Task.Chat);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assets, setAssets] = useLocalStorage<Asset[]>('im_asset_bay', []);

  const addAsset = (newAsset: Asset) => {
    setAssets(prevAssets => [newAsset, ...prevAssets]);
  };

  const removeAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
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
        removeAsset 
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
