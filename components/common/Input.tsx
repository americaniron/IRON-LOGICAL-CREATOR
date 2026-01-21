import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="relative group">
      <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-[0.3em] text-[#EBB700] mb-2 font-mono">
        // {label} _
      </label>
      <div className="relative">
        <div className="absolute inset-0 bg-black shadow-[inset_0_4px_10px_rgba(0,0,0,1)] pointer-events-none"></div>
        <input
          id={id}
          className="relative w-full px-5 py-4 bg-transparent border-2 border-[#3F4042] rounded-none text-[#F0F0F0] focus:outline-none focus:border-[#FFD300] font-mono transition-all text-sm uppercase tracking-widest placeholder:text-gray-800"
          {...props}
        />
        <div className="absolute top-0 right-0 p-1">
          <div className="rivet opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default Input;