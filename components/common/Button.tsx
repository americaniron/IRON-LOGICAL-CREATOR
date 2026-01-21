import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "industrial-btn relative px-8 py-4 text-lg font-bold transition-all active:translate-y-1 active:shadow-none border-x-4 border-b-8 border-t-2 select-none";
  
  const variants = {
    primary: `
      bg-gradient-to-b from-[#FFD300] to-[#EAB308] 
      text-black border-black border-t-yellow-300
      shadow-[0_8px_0_#A16207,0_15px_20px_rgba(0,0,0,0.4)]
      hover:from-yellow-300 hover:to-yellow-500
    `,
    secondary: `
      bg-gradient-to-b from-[#3F4042] to-[#2D2E30] 
      text-white border-black border-t-gray-500
      shadow-[0_8px_0_#1a1a1a,0_15px_20px_rgba(0,0,0,0.4)]
      hover:from-gray-600 hover:to-gray-700
    `,
    danger: `
      bg-gradient-to-b from-[#EF4444] to-[#B91C1C] 
      text-white border-black border-t-red-400
      shadow-[0_8px_0_#7F1D1D,0_15px_20px_rgba(0,0,0,0.4)]
      hover:from-red-400 hover:to-red-600
    `,
    warning: `
      bg-gradient-to-b from-[#F97316] to-[#C2410C] 
      text-white border-black border-t-orange-400
      shadow-[0_8px_0_#7C2D12,0_15px_20px_rgba(0,0,0,0.4)]
      hover:from-orange-400 hover:to-orange-600
    `,
  };

  return (
    <button
      className={`
        ${baseStyles}
        disabled:bg-gray-800 disabled:from-gray-800 disabled:to-gray-900 
        disabled:text-gray-600 disabled:border-gray-950 disabled:shadow-none 
        disabled:translate-y-1 disabled:cursor-not-allowed
        ${variants[variant as keyof typeof variants]} 
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-center gap-3">
        {children}
      </div>
    </button>
  );
};

export default Button;