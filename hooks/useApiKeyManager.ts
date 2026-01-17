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

export type ApiProvider = 'gemini_pro' | 'openai' | 'grok';

const STORAGE_KEYS: Record<Exclude<ApiProvider, 'gemini_pro'>, string> = {
  openai: 'openai_api_key',
  grok: 'grok_api_key',
};

export const useApiKeyManager = (provider: ApiProvider) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeyRequired, setIsKeyRequired] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const checkKey = useCallback(async () => {
    setIsReady(false);
    if (provider === 'gemini_pro') {
      if (!window.aistudio) {
        // Dev environment, assume key is present
        setIsKeyRequired(false);
        setApiKey('dev_gemini_key');
      } else {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsKeyRequired(!hasKey);
          if (hasKey) setApiKey('gemini_pro_key_selected');
        } catch (e) {
          console.error(`Error checking Gemini Pro key:`, e);
          setIsKeyRequired(true);
        }
      }
    } else {
      try {
        const storedKey = localStorage.getItem(STORAGE_KEYS[provider]);
        if (storedKey) {
          setApiKey(storedKey);
          setIsKeyRequired(false);
        } else {
          setIsKeyRequired(true);
        }
      } catch (e) {
        console.error(`Could not access local storage for ${provider}:`, e);
        setIsKeyRequired(true);
      }
    }
    setIsReady(true);
  }, [provider]);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const saveKey = useCallback(async (key: string) => {
    if (provider === 'gemini_pro') {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Optimistically set to true
        setIsKeyRequired(false);
        setApiKey('gemini_pro_key_selected');
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS[provider], key);
        setApiKey(key);
        setIsKeyRequired(false);
      } catch (e) {
        console.error(`Could not save key for ${provider}:`, e);
      }
    }
  }, [provider]);
  
  const resetKey = useCallback(() => {
    setIsKeyRequired(true);
    setApiKey(null);
  }, []);

  return { apiKey, isKeyRequired, isReady, saveKey, resetKey };
};
