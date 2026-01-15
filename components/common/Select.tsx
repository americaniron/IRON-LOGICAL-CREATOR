
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => {
  return (
    <div className="relative">
      <div className="rivet absolute -top-1 -left-1"></div>
      <label htmlFor={id} className="block text-xs font-black uppercase tracking-widest text-[#EBB700] mb-2 font-mono">
        // {label} _
      </label>
      <select
        id={id}
        className="w-full px-4 py-3 bg-[#1A1A1B] border-2 border-[#3F4042] rounded-none text-white focus:outline-none focus:border-[#EBB700] font-mono appearance-none cursor-pointer"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1A1A1B]">
            {option.label.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="absolute bottom-4 right-4 pointer-events-none text-[#EBB700]">
        ▼
      </div>
    </div>
  );
};

export default Select;
