
import { useState, useEffect, useCallback } from 'react';

// Define the AIStudio interface to match the environment's expectations
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
    // If aistudio is not available, we can assume we're in a dev environment
    // where the key is provided via other means, so we default to true.
    if (!window.aistudio) {
        setIsKeySelected(true);
        setIsChecking(false);
        return;
    }
    
    setIsChecking(true);
    try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
    } catch (e) {
        console.error("Error checking for API key:", e);
        // Default to false on error
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
      // Optimistically set to true to avoid race conditions.
      // If the key is invalid, the API call will fail and we'll reset.
      setIsKeySelected(true);
    }
  }, []);

  const resetKeySelection = useCallback(() => {
    setIsKeySelected(false);
  }, []);

  return { isKeySelected, isChecking, selectKey, resetKeySelection };
};
