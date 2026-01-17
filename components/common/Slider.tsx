
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  const percentage = props.max ? ((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100 : 0;

  return (
    <div className="relative p-4 bg-black/50 border-2 border-[#333840] shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor={id} className="block text-xs font-black uppercase tracking-[0.2em] text-cyan-400 font-mono">
          &gt; {label}
        </label>
        <span className="text-sm font-mono font-black text-white bg-[#111317] px-3 py-1 border border-[#333840]">{displayValue}</span>
      </div>
      <div className="relative h-8 flex items-center group">
        <div className="absolute inset-x-0 top-3 h-2 bg-gradient-to-r from-cyan-400 to-cyan-400" style={{ width: `${percentage}%` }}></div>
        <div className="absolute inset-x-0 top-3 h-2 bg-black/50 border border-[#333840] pointer-events-none"></div>
        <input
          type="range"
          id={id}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-cyan-400 relative z-10 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:bg-gradient-to-b
            [&::-webkit-slider-thumb]:from-[#EBB700]
            [&::-webkit-slider-thumb]:to-[#B38A00]
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(235,183,0,0.8)]"
          {...props}
        />
      </div>
    </div>
  );
};

export default Slider;
