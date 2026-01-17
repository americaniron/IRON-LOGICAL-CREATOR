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
  click: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhAAAAAEC/wr3Cv8K/woA=',
  error: 'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhLgAAAP//Aw8SEwAAAP/9/v4MAAMA//sB/f/6/v79/P/5//v/+wD9AP8A/wD//AACAAE=',
  success: 'data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhAAAAAEC/woA=',
  notification: 'data:audio/wav;base64,UklGRlAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhLAAAAPD/9wAJAAYABQAEAAcACQAHAAUAAgADAAIAAQACAAIAAf/+//7//v/8//4A//8A'
};

const THEME_STORAGE_KEY = 'IRON_CUSTOM_THEME';

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [safeMode, setSafeMode] = usePersistentState<boolean>('IRON_CONFIG_safeMode', false);
  const [visualInterference, setVisualInterference] = usePersistentState<boolean>('IRON_CONFIG_visualInterference', false);
  const [audioFeedback, setAudioFeedback] = usePersistentState<boolean>('IRON_CONFIG_audioFeedback', true);
  const [devMode, setDevMode] = usePersistentState<boolean>('IRON_CONFIG_devMode', false);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Load audio feedback sounds
    Object.keys(SOUNDS).forEach(sound => {
      try {
        const audio = new Audio(SOUNDS[sound as keyof typeof SOUNDS]);
        audio.preload = 'auto';
        audioRefs.current[sound] = audio;
      } catch (e) {
        console.warn(`System_Acoustics: Failed to load patch ${sound}`);
      }
    });

    // Load and apply theme from local storage on initial load
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;
        root.style.setProperty('--asphalt', theme.indigo);
        root.style.setProperty('--steel', theme.slate);
        root.style.setProperty('--industrial-gray', theme.mauve);
        root.style.setProperty('--heavy-yellow', theme.violet);
        root.style.setProperty('--safety-orange', theme.cyan);
        root.style.setProperty('--text-light', theme.light);
        root.style.setProperty('--text-muted', theme.gray);
        console.log(`[SYS_THEME] Custom theme "${theme.name}" loaded.`);
      }
    } catch (e) {
      console.warn("Failed to load or apply custom theme from localStorage.");
    }

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