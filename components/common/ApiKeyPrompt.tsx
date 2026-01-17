import React from 'react';
import Button from './Button';

interface ApiKeyPromptProps {
  modelName: string;
  onSelectKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ modelName, onSelectKey }) => (
  <div className="bg-orange-500/10 border-l-8 border-safety-orange p-6" role="alert">
    <div className="space-y-4">
        <div>
            <strong className="font-heading text-safety-orange uppercase tracking-wider block mb-2">Authorization Required</strong>
            <p className="text-sm text-text-muted font-body">
                The <span className="text-text-light font-bold">{modelName}</span> module requires a valid API Key from a Google Cloud project with billing enabled.
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button onClick={onSelectKey} variant="secondary" size="sm" className="!border-safety-orange !text-safety-orange hover:!bg-safety-orange/20">
            Select API Key
          </Button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-body uppercase text-text-muted hover:text-safety-orange underline transition-colors">
            Billing Documentation
          </a>
        </div>
    </div>
  </div>
);

export default ApiKeyPrompt;