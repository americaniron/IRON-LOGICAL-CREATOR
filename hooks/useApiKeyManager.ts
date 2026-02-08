
import { useCallback } from 'react';

export type ApiProvider = 'gemini_pro' | 'openai' | 'grok';

interface ApiKeyManagerOptions {
  model?: string;
}

/**
 * A simplified API key manager that assumes all keys are provided via environment variables.
 * This hook is designed for a production environment to prevent the application from
 * ever prompting the user for an API key. All features will rely on keys being
 * pre-configured on the server or in the build environment.
 */
export const useApiKeyManager = (provider: ApiProvider, options: ApiKeyManagerOptions = {}) => {
  return {
    isKeyRequired: false, // Never require a key from the user.
    isReady: true, // Always ready to proceed.
    saveKey: useCallback(() => {
      console.warn('API key submission is disabled. Keys must be configured in the environment.');
    }, []),
    resetKey: useCallback(() => {
      console.warn('API key reset is disabled. Keys must be configured in the environment.');
    }, []),
  };
};
