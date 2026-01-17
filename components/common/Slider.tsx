import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id:string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  return (
    <div className="relative p-4 bg-asphalt/50 border-2 border-industrial-gray">
      <div className="flex justify-between items-center mb-3">
        <label htmlFor={id} className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] text-heavy-yellow">
          &gt; {label}
        </label>
        <span className="text-sm font-body text-text-light bg-asphalt px-3 py-1 border border-industrial-gray font-bold">{displayValue}</span>
      </div>
      <div className="relative h-6 flex items-center group">
        <input
          type="range"
          id={id}
          className="w-full h-2 bg-asphalt appearance-none cursor-pointer accent-heavy-yellow border border-black focus-ring
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:bg-industrial-gray
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-black"
          {...props}
        />
      </div>
    </div>
  );
};

export default Slider;