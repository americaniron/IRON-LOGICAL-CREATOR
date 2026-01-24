import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { BrainCircuit, XIcon, Gear } from './Icons';
import { ApiProvider } from '../../hooks/useApiKeyManager';

interface ProviderInfo {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  keyPlaceholder?: string;
  docsUrl: string;
  docsLabel: string;
  buttonText: string;
}

const PROVIDER_CONFIG: Record<ApiProvider, ProviderInfo> = {
  openai: {
    Icon: BrainCircuit,
    title: 'OpenAI System Access',
    description: 'This module requires an OpenAI API key. Your key is stored securely and is only used to proxy requests from your account.',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'Procure Access Key (OpenAI)',
    buttonText: 'Authorize System',
  },
  grok: {
    Icon: XIcon,
    title: 'X-Corp Conduit Locked',
    description: 'Authorization required to interface with Grok systems. Or don\'t. See if I care.',
    keyPlaceholder: 'ENTER_API_KEY_ //',
    docsUrl: 'https://x.ai',
    docsLabel: 'Find API Key on x.ai',
    buttonText: 'Authorize Conduit',
  },
  gemini_pro: {
    Icon: Gear,
    title: '!! Enterprise Engine Authorization !!',
    description: 'This high-performance engine requires a user-selected API key from a Google Cloud project with billing enabled to function.',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/billing',
    docsLabel: 'Review Billing & Plan Documentation',
    buttonText: 'Select API Key',
  },
};


interface ProviderKeyPromptProps {
  provider: ApiProvider;
  onKeySubmit: (key: string) => void;
}

const ProviderKeyPrompt: React.FC<ProviderKeyPromptProps> = ({ provider, onKeySubmit }) => {
  const [key, setKey] = useState('');
  const config = PROVIDER_CONFIG[provider];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider === 'gemini_pro') {
      onKeySubmit(''); // No key to pass, just trigger the action from the hook
    } else {
      onKeySubmit(key.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 relative overflow-hidden group bg-[var(--bg-panel)] border-l-8 border-[var(--accent-primary)]`} role="alert" aria-labelledby={`${provider}-title`}>
      <div className="space-y-4">
        <div>
          <strong id={`${provider}-title`} className={`font-mono uppercase tracking-[0.2em] block mb-2 flex items-center gap-2 text-[var(--accent-primary)]`}>
            <config.Icon className="h-5 w-5" /> {config.title}
          </strong>
          <p className="text-sm text-[var(--text-secondary)] font-mono">{config.description}</p>
        </div>
        
        {config.keyPlaceholder ? (
            <Input
                label={`${provider.toUpperCase().replace('_PRO','').replace('GEMINI','ENTERPRISE')}_API_KEY`}
                id={`${provider}_key`}
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={config.keyPlaceholder}
                required
            />
        ) : (
             <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed bg-[var(--bg-tertiary)] p-3 border border-[var(--border-primary)]">
              Clicking '{config.buttonText}' will open a dialog to choose a key from your available Google Cloud projects.
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2 items-center">
          <Button type="submit" variant={'primary'} className={`text-xs !py-3 !px-6`}>
            {config.buttonText}
          </Button>
          <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center text-[10px] font-mono uppercase underline transition-colors text-[var(--text-muted)] hover:text-[var(--accent-primary)]`}>
            {config.docsLabel}
          </a>
        </div>
      </div>
    </form>
  );
};

export default ProviderKeyPrompt;