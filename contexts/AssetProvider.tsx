import React, { createContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { OrchestratorAsset } from '../types';

interface AssetContextType {
  assets: OrchestratorAsset[];
  addAsset: (asset: Omit<OrchestratorAsset, 'id' | 'timestamp'>) => void;
  revokeAsset: (id: string) => void;
  purgeAssets: () => void;
  setPipe: (prompt: string, image?: string | null, parentId?: string | null) => void;
  pipedPrompt: string;
  pipedImage: string | null;
  pipedParentId: string | null;
}

export const AssetContext = createContext<AssetContextType>({} as AssetContextType);

export const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<OrchestratorAsset[]>([]);
  const [pipedPrompt, setPipedPrompt] = useState<string>('');
  const [pipedImage, setPipedImage] = useState<string | null>(null);
  const [pipedParentId, setPipedParentId] = useState<string | null>(null);

  const addAsset = useCallback((assetData: Omit<OrchestratorAsset, 'id' | 'timestamp'>) => {
    const newAsset: OrchestratorAsset = {
      ...assetData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      status: 'active',
    };
    setAssets((prevAssets) => [newAsset, ...prevAssets]);
  }, []);

  const revokeAsset = useCallback((id: string) => {
    setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
  }, []);

  const purgeAssets = useCallback(() => {
    setAssets([]);
  }, []);

  const setPipe = useCallback((prompt: string, image: string | null = null, parentId: string | null = null) => {
    setPipedPrompt(prompt);
    setPipedImage(image);
    setPipedParentId(parentId);
  }, []);

  const value = useMemo(() => ({
    assets,
    addAsset,
    revokeAsset,
    purgeAssets,
    setPipe,
    pipedPrompt,
    pipedImage,
    pipedParentId,
  }), [assets, addAsset, revokeAsset, purgeAssets, setPipe, pipedPrompt, pipedImage, pipedParentId]);

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};
