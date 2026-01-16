
import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(`IRON_PERSIST_${key}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to load persistence for", key);
      }
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(`IRON_PERSIST_${key}`, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
