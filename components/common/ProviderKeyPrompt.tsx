import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { BrainCircuit, XIcon } from './Icons';
import { ApiProvider } from '../../hooks/useApiKeyManager';

interface ProviderInfo {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  keyPlaceholder?: string;
  docsUrl: string;
  docsLabel: string;
  buttonText: string;
  theme: 'grok' | 'openai' | 'gemini';
}

const PROVIDER_CONFIG: Record<ApiProvider, ProviderInfo> = {
  openai: {
    Icon: BrainCircuit,
    title: 'Guest System Access',
    description: 'This module requires an OpenAI API key for operation. Your key is stored locally and never sent to our servers.',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'Procure_Access_Key_Ref_OAI',
    buttonText: 'Authorize Guest System',
    theme: 'openai',
  },
  grok: {
    Icon: XIcon,
    title: 'X-Corp Conduit Locked',
    description: 'Authorization required to interface with Grok systems. Or don\'t. See if I care.',
    keyPlaceholder: 'ENTER_API_KEY_ //',
    docsUrl: 'https://x.ai',
    docsLabel: 'Find_Yours_On_x.ai',
    buttonText: 'Authorize',
    theme: 'grok',
  },
  gemini_pro: {
    Icon: () => <div className="h-5 w-5 bg-heavy-yellow" />,
    title: '!! Access Permission Required !!',
    description: 'This enterprise engine requires valid clearance (Paid API Key) from a registered Google Cloud project with active billing.',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/billing',
    docsLabel: 'Review_Billing_Documentation_Ref_402',
    buttonText: 'Submit Clearance',
    theme: 'gemini',
  },
};

const THEME_CLASSES = {
  gemini: {
    container: 'bg-orange-600/20 border-l-8 border-orange-500',
    title: 'text-orange-500',
    link: 'text-gray-500 hover:text-orange-400',
    buttonVariant: 'warning' as const,
  },
  openai: {
    container: 'bg-green-900/20 border-l-8 border-guest-green',
    title: 'text-guest-green',
    link: 'text-gray-500 hover:text-guest-green',
    buttonVariant: 'primary' as const, // Custom button class will override this
  },
  grok: {
    container: 'bg-[#0A0B0C] border-2 border-grok-magenta/30 shadow-[0_0_30px_rgba(217,70,239,0.2)]',
    title: 'text-grok-magenta',
    link: 'hover:text-grok-magenta',
    buttonVariant: 'primary' as const, // Custom button class will override this
  },
};

interface ProviderKeyPromptProps {
  provider: ApiProvider;
  onKeySubmit: (key: string) => void;
}

const ProviderKeyPrompt: React.FC<ProviderKeyPromptProps> = ({ provider, onKeySubmit }) => {
  const [key, setKey] = useState('');
  const config = PROVIDER_CONFIG[provider];
  const theme = THEME_CLASSES[config.theme];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onKeySubmit(key.trim() || 'gemini_pro_dummy_key');
  };
  
  const getButtonClasses = () => {
    if (provider === 'openai') {
        return "!bg-guest-green !border-t-green-300 !shadow-[0_4px_0_#15803d] hover:!shadow-[0_4px_0_#16a34a] !text-black !active:translate-y-[4px]";
    }
    if (provider === 'grok') {
        return "!bg-grok-magenta !shadow-none !border-0 active:translate-y-1 !text-black";
    }
    return '';
  }

  return (
    <form onSubmit={handleSubmit} className={`p-6 relative overflow-hidden group ${theme.container}`} role="alert">
      <div className="space-y-4">
        <div>
          <strong className={`font-mono uppercase tracking-[0.2em] block mb-2 flex items-center gap-2 ${theme.title}`}>
            <config.Icon className="h-5 w-5" /> {config.title}
          </strong>
          <p className="text-sm text-gray-300 font-mono">{config.description}</p>
        </div>
        
        {config.keyPlaceholder && (
            <Input
                label={`${provider.toUpperCase()}_API_KEY`}
                id={`${provider}_key`}
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={config.keyPlaceholder}
                required
            />
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2 items-center">
          <Button type="submit" variant={theme.buttonVariant} className={`text-xs !py-3 !px-6 ${getButtonClasses()}`}>
            {config.buttonText}
          </Button>
          <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center text-[10px] font-mono uppercase underline transition-colors ${theme.link}`}>
            {config.docsLabel}
          </a>
        </div>
      </div>
    </form>
  );
};

export default ProviderKeyPrompt;
