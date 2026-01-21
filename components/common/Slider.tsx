import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  const percentage = props.max ? ((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100 : 0;

  return (
    <div className="relative p-6 bg-black border-2 border-[#3F4042] shadow-[inset_0_4px_20px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-6">
        <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD300] font-mono">
          &gt; {label}
        </label>
        <div className="bg-[#FFD300] px-3 py-1 border-2 border-black">
           <span className="text-xs font-mono font-black text-black">{displayValue}</span>
        </div>
      </div>
      <div className="relative h-10 flex items-center group">
        <div className="absolute inset-x-0 h-4 bg-gray-900 border border-[#3F4042] rounded-none overflow-hidden">
          <div className="h-full bg-[#FFD300] opacity-30 shadow-[0_0_15px_rgba(255,211,0,0.5)] transition-all duration-300" style={{ width: `${percentage}%` }}></div>
        </div>
        <input
          type="range"
          id={id}
          className="w-full h-full bg-transparent appearance-none cursor-pointer relative z-10 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:h-10
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(255,255,255,0.4)]
            [&::-webkit-slider-thumb]:hover:bg-[#FFD300]"
          {...props}
        />
      </div>
      <div className="mt-2 flex justify-between opacity-20">
         {[...Array(10)].map((_, i) => (
             <div key={i} className="h-2 w-0.5 bg-white"></div>
         ))}
      </div>
    </div>
  );
};

export default Slider;