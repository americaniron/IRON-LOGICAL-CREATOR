import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-black uppercase tracking-[0.2em] text-heavy-yellow mb-2 font-mono">
        &gt; {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="w-full pl-4 pr-10 py-3 bg-asphalt border-2 border-industrial-gray rounded-none text-white focus:outline-none focus:border-heavy-yellow font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-colors text-sm uppercase tracking-wider"
          {...props}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600 font-mono text-xs">
          _
        </div>
      </div>
    </div>
  );
};

export default Input;