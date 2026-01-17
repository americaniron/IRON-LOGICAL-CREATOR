import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] text-heavy-yellow mb-2">
        &gt; {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full px-4 py-3 bg-asphalt border-2 border-t-black border-l-black border-b-industrial-gray border-r-industrial-gray text-text-light focus:outline-none transition-colors text-sm tracking-wider uppercase shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] focus-ring ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;