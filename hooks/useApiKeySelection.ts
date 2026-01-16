import { useState, useEffect, useCallback } from 'react';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export const useApiKeySelection = () => {
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkApiKey = useCallback(async () => {
    if (!window.aistudio) {
        setIsKeySelected(true); // Assume key is present in non-aistudio env
        setIsChecking(false);
        return;
    }
    
    setIsChecking(true);
    try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
    } catch (e) {
        console.error("Error checking for API key:", e);
        setIsKeySelected(false);
    } finally {
        setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const selectKey = useCallback(async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success and update UI immediately to avoid race condition
      setIsKeySelected(true); 
    }
  }, []);

  const resetKeySelection = useCallback(() => {
    setIsKeySelected(false);
  }, []);

  return { isKeySelected, isChecking, selectKey, resetKeySelection };
};
