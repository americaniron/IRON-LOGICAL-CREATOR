import React from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { BrainCircuit, XIcon, Gear } from './common/Icons';

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="System Briefing">
      <div className="space-y-6 text-[var(--text-primary)] font-mono">
        <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-[var(--accent-primary)] mb-2">Welcome, Commander.</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                You have been granted access to the IRON MEDIA ORCHESTRATOR, an enterprise-grade suite for heavy-duty multimedia fabrication. This system interfaces with multiple AI backbones to execute your creative directives.
            </p>
        </div>

        <div className="border-t-2 border-[var(--border-primary)] pt-4 space-y-4">
            <h4 className="text-md font-bold uppercase tracking-wider text-[var(--text-primary)]">Core Systems:</h4>
            <div className="space-y-3">
                <div className="flex items-start gap-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                    <div className="p-2 bg-[var(--accent-primary)] mt-1"><Gear className="h-5 w-5 text-black" /></div>
                    <div>
                        <p className="font-bold text-white">IRON MEDIA (GEMINI)</p>
                        <p className="text-xs text-[var(--text-secondary)]">The primary, high-performance engine for all core tasks. Requires a paid Google Cloud API key for advanced video and image fabrication.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                    <div className="p-2 bg-[var(--accent-primary)] mt-1"><BrainCircuit className="h-5 w-5 text-black" /></div>
                    <div>
                        <p className="font-bold text-white">GUEST SYSTEMS (OPENAI)</p>
                        <p className="text-xs text-[var(--text-secondary)]">Integrates with OpenAI models like GPT and DALL-E. Requires a separate, user-provided OpenAI API key.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                    <div className="p-2 bg-[var(--accent-primary)] mt-1"><XIcon className="h-5 w-5 text-black" /></div>
                    <div>
                        <p className="font-bold text-white">X-CORP SYSTEMS (GROK)</p>
                        <p className="text-xs text-[var(--text-secondary)]">Provides access to Grok's unfiltered AI for chat and generative tasks. Requires a separate, user-provided Grok API key.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-end">
            <Button onClick={onClose} className="!py-3 !px-8 !text-base">
                Acknowledge & Proceed
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;