import React from 'react';
import { Gear } from './Icons';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
      <div className="relative">
        <Gear className="animate-[spin_4s_linear_infinite] h-12 w-12 text-[#EBB700]" />
        <Gear className="animate-[spin_3s_linear_infinite_reverse] h-6 w-6 text-[#3F4042] absolute -top-2 -right-2" />
      </div>
      {text && <p className="text-[#EBB700] font-mono text-xs uppercase tracking-widest font-bold">{text}</p>}
    </div>
  );
};

export default Spinner;