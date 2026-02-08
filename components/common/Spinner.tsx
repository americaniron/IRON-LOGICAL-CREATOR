import React from 'react';
import { Gear } from './Icons';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
      <Gear className="animate-spin h-8 w-8 text-[var(--accent-primary)]" />
      {text && (
        <p className="text-[var(--text-secondary)] font-medium text-sm">
            {text}
        </p>
      )}
    </div>
  );
};

export default Spinner;