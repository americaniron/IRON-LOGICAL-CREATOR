
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  return (
    <div className="relative p-4 bg-[#1A1A1B] border-2 border-[#3F4042]">
      <div className="rivet absolute -top-1 -left-1"></div>
      <div className="rivet absolute -bottom-1 -right-1"></div>
      <div className="flex justify-between items-center mb-4">
        <label htmlFor={id} className="block text-xs font-black uppercase tracking-widest text-[#EBB700] font-mono">
          // {label} _
        </label>
        <span className="text-sm font-mono font-black text-white bg-black px-2 border border-[#3F4042]">{displayValue}</span>
      </div>
      <div className="relative h-8 flex items-center">
        <div className="absolute inset-0 bg-black/50 border border-[#3F4042] h-2 top-3 pointer-events-none"></div>
        <input
          type="range"
          id={id}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-[#EBB700] relative z-10 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:h-6 
            [&::-webkit-slider-thumb]:w-10 
            [&::-webkit-slider-thumb]:bg-[#EBB700] 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(235,183,0,0.5)]"
          {...props}
        />
      </div>
    </div>
  );
};

export default Slider;
