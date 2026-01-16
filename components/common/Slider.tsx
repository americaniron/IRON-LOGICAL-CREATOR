
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  const percentage = props.max ? ((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100 : 0;

  return (
    <div className="relative p-4 bg-aura-indigo/50 border border-aura-mauve rounded-sm">
      <div className="flex justify-between items-center mb-3">
        <label htmlFor={id} className="block text-xs font-heading uppercase tracking-widest text-aura-cyan">
          {label}
        </label>
        <span className="text-sm font-body text-aura-light bg-aura-slate px-3 py-1 border border-aura-mauve rounded-sm">{displayValue}</span>
      </div>
      <div className="relative h-6 flex items-center group">
        <input
          type="range"
          id={id}
          className="w-full h-1.5 bg-aura-mauve rounded-full appearance-none cursor-pointer accent-aura-violet focus-ring
            [&::-webkit-slider-runnable-track]:rounded-full
            [&::-webkit-slider-runnable-track]:h-1.5
            [&::-webkit-slider-runnable-track]:bg-aura-mauve
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:bg-aura-violet
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-aura-light
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--aura-violet)]"
          {...props}
        />
      </div>
    </div>
  );
};

export default Slider;
