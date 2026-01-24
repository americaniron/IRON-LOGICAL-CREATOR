import { useState, useEffect, useCallback } from 'react';
import { useMountedState } from './useMountedState';

export type ApiProvider = 'gemini_pro' | 'openai' | 'grok';

interface ApiKeyManagerOptions {
  model?: string;
}

const VEO_MODELS = ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview'];
const PRO_IMAGE_MODELS = ['gemini-3-pro-image-preview'];
const MODELS_REQUIRING_USER_KEY = [...VEO_MODELS, ...PRO_IMAGE_MODELS];

export const useApiKeyManager = (provider: ApiProvider, options: ApiKeyManagerOptions = {}) => {
  const { model } = options;
  const requiresUserKey = provider === 'gemini_pro' && !!model && MODELS_REQUIRING_USER_KEY.includes(model);

  const [isChecking, setIsChecking] = useMountedState(requiresUserKey);
  const [isKeySelected, setIsKeySelected] = useMountedState(false);
  
  const checkKey = useCallback(async () => {
    if (window.aistudio) {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        } catch (e) {
            console.error("Error checking for API key:", e);
            setIsKeySelected(false);
        } finally {
            setIsChecking(false);
        }
    } else {
        setTimeout(checkKey, 100);
    }
  }, [setIsKeySelected, setIsChecking]);

  useEffect(() => {
    if (requiresUserKey) {
      checkKey();
    }
  }, [requiresUserKey, checkKey]);

  const selectKey = useCallback(async () => {
    if (!requiresUserKey || !window.aistudio) return;
    try {
        await window.aistudio.openSelectKey();
        setIsKeySelected(true);
    } catch (e) {
        console.error("Error opening key selection dialog:", e);
    }
  }, [requiresUserKey, setIsKeySelected]);

  // For models/providers that DON'T require special user key selection.
  if (!requiresUserKey) {
    return {
      isKeyRequired: false,
      isReady: true,
      saveKey: useCallback(() => console.log('API key submission ignored; key is hardcoded.'), []),
      resetKey: useCallback(() => console.log('Key reset called; key is hardcoded.'), []),
    };
  }

  // For models that DO require user key selection (Veo, Pro Image)
  return {
    isKeyRequired: !isKeySelected,
    isReady: !isChecking,
    saveKey: selectKey,
    resetKey: selectKey,
  };
};