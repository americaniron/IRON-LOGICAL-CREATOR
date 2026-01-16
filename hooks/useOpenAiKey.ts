import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

export const useOpenAiKey = () => {
  const { keys, updateKeys } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed && !trimmed.startsWith('sk-')) {
      setError('INVALID_FORMAT: OPENAI_KEYS_MUST_START_WITH_SK-');
      return;
    }
    setError(null);
    updateKeys(trimmed || null, undefined);
  }, [updateKeys]);

  const clearApiKey = useCallback(() => {
    updateKeys(null, undefined);
  }, [updateKeys]);
  
  // Return isReady: true as the keys are initialized synchronously from session storage in App context.
  return { apiKey: keys.oai, error, saveApiKey, clearApiKey, isReady: true };
};