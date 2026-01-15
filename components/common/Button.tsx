
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-[#EBB700] hover:bg-[#D4A500] text-black border-b-4 border-[#B28A00] active:border-b-0 active:translate-y-1',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-b-4 border-red-900 active:border-b-0 active:translate-y-1',
    warning: 'bg-orange-500 hover:bg-orange-600 text-black border-b-4 border-orange-800 active:border-b-0 active:translate-y-1',
  };

  return (
    <button
      className={`px-6 py-3 font-black uppercase tracking-wider rounded-sm shadow-xl transition-all duration-75 flex items-center justify-center gap-2 ${variants[variant as keyof typeof variants]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
