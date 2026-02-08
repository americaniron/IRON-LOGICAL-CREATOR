import React from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { BrainCircuit, XIcon, Gear } from './common/Icons';

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Welcome to the AI Creative Suite">
      <div className="space-y-6 text-[var(--text-primary)]">
        <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Getting Started</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                This is an integrated suite for multimedia generation. You can interface with multiple leading AI models to execute your creative tasks.
            </p>
        </div>

        <div className="border-t border-[var(--border-primary)] pt-4 space-y-4">
            <h4 className="text-md font-bold text-[var(--text-primary)]">Available AI Services:</h4>
            <div className="space-y-3">
                <div className="flex items-start gap-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg">
                    <div className="p-2 bg-[var(--accent-primary)] rounded-md mt-1"><Gear className="h-5 w-5 text-white" /></div>
                    <div>
                        <p className="font-semibold text-white">Google Gemini</p>
                        <p className="text-xs text-[var(--text-secondary)]">The primary, high-performance engine for core tasks. Advanced video and image generation require a paid Google Cloud API key.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg">
                    <div className="p-2 bg-[var(--accent-primary)] rounded-md mt-1"><BrainCircuit className="h-5 w-5 text-white" /></div>
                    <div>
                        <p className="font-semibold text-white">OpenAI</p>
                        <p className="text-xs text-[var(--text-secondary)]">Integrates with models like GPT and DALL-E. This service requires a user-provided OpenAI API key.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg">
                    <div className="p-2 bg-[var(--accent-primary)] rounded-md mt-1"><XIcon className="h-5 w-5 text-white" /></div>
                    <div>
                        <p className="font-semibold text-white">Grok</p>
                        <p className="text-xs text-[var(--text-secondary)]">Provides access to Grok's unfiltered AI for chat and generative tasks. This service requires a user-provided Grok API key.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-end">
            <Button onClick={onClose} className="!py-2 !px-6 !text-sm">
                Get Started
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;