import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  const percentage = props.max ? ((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100 : 0;

  return (
    <div className="relative p-4 bg-black/50 border-2 border-industrial-gray shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor={id} className="block text-xs font-black uppercase tracking-[0.2em] text-heavy-yellow font-mono">
          &gt; {label}
        </label>
        <span className="text-sm font-mono font-black text-white bg-asphalt px-3 py-1 border border-industrial-gray">{displayValue}</span>
      </div>
      <div className="relative h-8 flex items-center group">
        <div className="absolute inset-x-0 top-3 h-2 bg-gradient-to-r from-heavy-yellow to-yellow-500" style={{ width: `${percentage}%` }}></div>
        <div className="absolute inset-x-0 top-3 h-2 bg-black/50 border border-industrial-gray pointer-events-none"></div>
        <input
          type="range"
          id={id}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-heavy-yellow relative z-10 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:bg-gradient-to-b
            [&::-webkit-slider-thumb]:from-[#FFD300]
            [&::-webkit-slider-thumb]:to-[#C7A600]
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,211,0,0.8)]"
          {...props}
        />
      </div>
    </div>
  );
};

export default Slider;