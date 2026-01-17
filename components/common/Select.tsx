
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-2 font-mono">
        &gt; {label}
      </label>
      <div className="relative group">
        <select
          id={id}
          className="w-full px-4 py-3 bg-[#111317] border-2 border-[#333840] rounded-none text-white focus:outline-none focus:border-cyan-400 font-mono appearance-none cursor-pointer shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase tracking-wider"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#111317] font-mono">
              {option.label.toUpperCase()}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-cyan-400 group-hover:animate-pulse">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;
