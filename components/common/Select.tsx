import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, className = '', ...props }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] text-heavy-yellow mb-2">
        &gt; {label}
      </label>
      <div className="relative group">
        <select
          id={id}
          className={`w-full px-4 py-3 bg-steel border-2 border-t-industrial-gray border-l-industrial-gray border-b-black border-r-black text-text-light focus:outline-none appearance-none cursor-pointer transition-colors text-sm uppercase tracking-wider focus-ring ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-asphalt font-body">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-heavy-yellow group-hover:scale-110 transition-transform">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;