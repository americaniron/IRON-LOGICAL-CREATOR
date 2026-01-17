import React, { createContext, ReactNode, useMemo, useCallback, useRef, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

interface ConfigContextType {
  safeMode: boolean;
  setSafeMode: (value: boolean) => void;
  visualInterference: boolean;
  setVisualInterference: (value: boolean) => void;
  audioFeedback: boolean;
  setAudioFeedback: (value: boolean) => void;
  devMode: boolean;
  setDevMode: (value: boolean) => void;
  playFeedback: (sound: 'click' | 'error' | 'success' | 'notification') => void;
}

export const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

const SOUNDS = {
  click: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhAAAAAEC/wr3Cv8K/woA=',
  error: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhAAAAAEC/wr3Cv8K/woA=',
  success: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhAAAAAEC/wr3Cv8K/woA=',
  notification: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhAAAAAEC/wr3Cv8K/woA='
};

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [safeMode, setSafeMode] = usePersistentState<boolean>('AURA_CONFIG_safeMode', false);
  const [visualInterference, setVisualInterference] = usePersistentState<boolean>('AURA_CONFIG_visualInterference', true);
  const [audioFeedback, setAudioFeedback] = usePersistentState<boolean>('AURA_CONFIG_audioFeedback', true);
  const [devMode, setDevMode] = usePersistentState<boolean>('AURA_CONFIG_devMode', false);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    Object.keys(SOUNDS).forEach(sound => {
      try {
        const audio = new Audio(SOUNDS[sound as keyof typeof SOUNDS]);
        audio.preload = 'auto';
        audioRefs.current[sound] = audio;
      } catch (e) {
        console.warn(`System_Acoustics: Failed to load patch ${sound}`);
      }
    });
  }, []);

  const playFeedback = useCallback((sound: 'click' | 'error' | 'success' | 'notification') => {
    if (audioFeedback && audioRefs.current[sound]) {
      const audio = audioRefs.current[sound];
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silent catch for user interaction requirements
      });
    }
  }, [audioFeedback]);

  const value = useMemo(() => ({
    safeMode, setSafeMode,
    visualInterference, setVisualInterference,
    audioFeedback, setAudioFeedback,
    devMode, setDevMode,
    playFeedback
  }), [safeMode, setSafeMode, visualInterference, setVisualInterference, audioFeedback, setAudioFeedback, devMode, setDevMode, playFeedback]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
