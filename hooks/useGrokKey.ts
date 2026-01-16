import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

export const useGrokKey = () => {
  const { keys, updateKeys } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed && trimmed.length < 20) {
      setError('INVALID_FORMAT: GROK_CONDUIT_TOKEN_TOO_SHORT');
      return;
    }
    setError(null);
    updateKeys(undefined, trimmed || null);
  }, [updateKeys]);

  const clearApiKey = useCallback(() => {
    updateKeys(undefined, null);
  }, [updateKeys]);
  
  // Return isReady: true as the keys are initialized synchronously from session storage in App context.
  return { apiKey: keys.grok, error, saveApiKey, clearApiKey, isReady: true };
};