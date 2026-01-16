
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-heading uppercase tracking-widest text-aura-cyan mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full pl-4 pr-4 py-3 bg-aura-indigo border border-aura-mauve rounded-sm text-aura-light focus:outline-none transition-colors text-sm tracking-wider focus-ring ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
