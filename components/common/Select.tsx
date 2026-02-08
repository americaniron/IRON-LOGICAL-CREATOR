import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => {
  return (
    <div className="relative group">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="w-full pl-4 pr-10 py-2.5 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] appearance-none cursor-pointer transition-colors text-sm"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--text-muted)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;