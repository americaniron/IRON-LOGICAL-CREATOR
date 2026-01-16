import React, { createContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { ClearanceLevel } from '../types';

interface Keys {
  oai: string | null;
  grok: string | null;
}

interface AuthContextType {
  keys: Keys;
  updateKeys: (oaiKey: string | null | undefined, grokKey: string | null | undefined) => void;
  clearance: ClearanceLevel;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<Keys>(() => {
    try {
      const storedKeys = sessionStorage.getItem('IRON_KEYS');
      return storedKeys ? JSON.parse(storedKeys) : { oai: null, grok: null };
    } catch {
      return { oai: null, grok: null };
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('IRON_KEYS', JSON.stringify(keys));
    } catch (error) {
      console.error("Failed to save keys to sessionStorage", error);
    }
  }, [keys]);

  const updateKeys = useCallback((oaiKey: string | null | undefined, grokKey: string | null | undefined) => {
    setKeys(prev => ({
      oai: oaiKey === undefined ? prev.oai : oaiKey,
      grok: grokKey === undefined ? prev.grok : grokKey,
    }));
  }, []);

  const clearance = useMemo(() => {
    // This is a placeholder for a real Gemini key check.
    // For this app's logic, we assume a Gemini key is always available for STANDARD access.
    // CLASSIFIED requires both guest keys.
    const geminiKeyPresent = true; 
    if (!geminiKeyPresent) return ClearanceLevel.UNAUTHORIZED;
    if (keys.oai && keys.grok) return ClearanceLevel.CLASSIFIED;
    return ClearanceLevel.STANDARD;
  }, [keys]);

  const value = useMemo(() => ({ keys, updateKeys, clearance }), [keys, updateKeys, clearance]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
