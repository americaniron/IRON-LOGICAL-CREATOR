
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="relative">
      <div className="rivet absolute -top-1 -left-1"></div>
      <div className="rivet absolute -top-1 -right-1"></div>
      <label htmlFor={id} className="block text-xs font-black uppercase tracking-widest text-[#EBB700] mb-2 font-mono">
        // {label} _
      </label>
      <input
        id={id}
        className="w-full px-4 py-3 bg-[#1A1A1B] border-2 border-[#3F4042] rounded-none text-white focus:outline-none focus:border-[#EBB700] font-mono shadow-inner transition-colors"
        {...props}
      />
    </div>
  );
};

export default Input;
