import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import * as backend from '../services/backendService';

// Define the AIStudio interface to match the environment's expectations
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window { aistudio?: AIStudio }
}

export type ApiProvider = 'gemini_pro' | 'openai' | 'grok';

export const useApiKeyManager = (provider: ApiProvider) => {
  const { currentUser } = useAppContext();
  const [isKeyRequired, setIsKeyRequired] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const checkKey = useCallback(async () => {
    if (!currentUser) {
        setIsReady(true);
        return;
    };

    setIsReady(false);
    if (provider === 'gemini_pro') {
      if (!window.aistudio) {
        // Dev environment, assume key is present
        setIsKeyRequired(false);
      } else {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsKeyRequired(!hasKey);
        } catch (e) {
          console.error(`Error checking Gemini Pro key:`, e);
          setIsKeyRequired(true);
        }
      }
    } else {
      try {
        const hasKey = await backend.hasApiKey(provider);
        setIsKeyRequired(!hasKey);
      } catch (e) {
        console.error(`Could not check key for ${provider}:`, e);
        setIsKeyRequired(true);
      }
    }
    setIsReady(true);
  }, [provider, currentUser]);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const saveKey = useCallback(async (key: string) => {
    if (provider === 'gemini_pro') {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Optimistically set to true after dialog opens
        setIsKeyRequired(false);
      }
    } else {
      try {
        await backend.saveApiKey(provider, key);
        setIsKeyRequired(false);
      } catch (e) {
        console.error(`Could not save key for ${provider}:`, e);
      }
    }
  }, [provider]);
  
  // This is now handled globally by handleApiError in AppContext
  const resetKey = useCallback(() => {
      // The global error handler will force a reload which re-triggers the key check.
      console.log(`Resetting key state for ${provider}.`);
      setIsKeyRequired(true);
  }, [provider]);

  return { isKeyRequired, isReady, saveKey, resetKey };
};