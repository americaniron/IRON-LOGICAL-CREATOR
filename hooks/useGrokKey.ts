
import { useState, useCallback, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'grok_api_key';

export const useGrokKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            setApiKey(storedKey);
        }
    } catch (e) {
        console.error("Could not access local storage:", e);
    } finally {
        setIsReady(true);
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    if (key) {
        try {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            setApiKey(key);
        } catch (e) {
            console.error("Could not save to local storage:", e);
        }
    }
  }, []);

  const clearApiKey = useCallback(() => {
    try {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKey(null);
    } catch (e) {
        console.error("Could not clear local storage:", e);
    }
  }, []);
  
  return { apiKey, isReady, saveApiKey, clearApiKey };
};
