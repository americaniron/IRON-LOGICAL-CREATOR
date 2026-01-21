import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => {
  return (
    <div className="relative group">
      <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-[0.3em] text-[#EBB700] mb-2 font-mono">
        // {label} _
      </label>
      <div className="relative">
        <select
          id={id}
          className="w-full px-5 py-4 bg-[#08090A] border-2 border-[#3F4042] rounded-none text-[#F0F0F0] focus:outline-none focus:border-[#FFD300] font-mono appearance-none cursor-pointer transition-all text-sm uppercase tracking-widest shadow-[inset_0_4px_10px_rgba(0,0,0,1)]"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#1B1D20] text-white">
              {option.label.toUpperCase()}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#FFD300]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;