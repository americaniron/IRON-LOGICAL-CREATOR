
import React from 'react';
import Button from './Button';

interface ApiKeyPromptProps {
  modelName: string;
  onSelectKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ modelName, onSelectKey }) => (
  <div className="bg-orange-600/20 border-l-8 border-orange-500 p-6 relative overflow-hidden group" role="alert">
    <div className="caution-stripes h-1 absolute top-0 left-0 right-0 opacity-20"></div>
    <div className="space-y-4">
        <div>
            <strong className="font-mono text-orange-500 uppercase tracking-[0.2em] block mb-2">!! ACCESS_PERMISSION_REQUIRED !!</strong>
            <p className="text-sm text-gray-300 font-mono">
                The <span className="text-white font-bold">{modelName.toUpperCase()}</span> assembly engine requires valid clearance (Paid API Key) from a registered Google Cloud project with active billing.
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button onClick={onSelectKey} variant="warning" className="text-xs !py-2">
            SUBMIT CLEARANCE
          </Button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] font-mono uppercase text-gray-500 hover:text-orange-400 underline transition-colors">
            Review_Billing_Documentation_Ref_402
          </a>
        </div>
    </div>
  </div>
);

export default ApiKeyPrompt;
