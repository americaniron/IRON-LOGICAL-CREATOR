import React from 'react';
import { Gear } from './Icons';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6" role="status" aria-live="polite">
      <div className="relative">
        <Gear className="animate-[spin_4s_linear_infinite] h-20 w-20 text-[#FFD300]" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Gear className="animate-[spin_3s_linear_infinite_reverse] h-10 w-10 text-[#3F4042]" />
        </div>
        <div className="absolute -inset-4 border-2 border-dashed border-[#FFD300]/20 rounded-full animate-spin-slow"></div>
      </div>
      {text && (
        <div className="space-y-1 text-center">
            <p className="text-[#FFD300] font-['Roboto_Mono'] text-xs uppercase tracking-[0.5em] font-black animate-pulse">
                {text}
            </p>
            <div className="h-1 w-48 bg-gray-900 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-[#FFD300] animate-[load-shimmer_1.5s_infinite]"></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Spinner;