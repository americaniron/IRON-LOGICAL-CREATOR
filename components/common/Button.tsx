import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const variants = {
    primary: `
      bg-gradient-to-b from-[#EBB700] to-[#B38A00] 
      text-black border-t-2 border-[#FFD700] border-x-2 border-black
      shadow-[0_6px_0_#7A5F00,0_8px_15px_rgba(0,0,0,0.6)]
      hover:from-[#FFD700] hover:to-[#EBB700] hover:shadow-[0_6px_0_#9A7800,0_8px_15px_rgba(0,0,0,0.5)]
      active:shadow-none active:translate-y-[6px]
    `,
    danger: `
      bg-gradient-to-b from-[#DC2626] to-[#991B1B] 
      text-white border-t-2 border-[#EF4444] border-x-2 border-black
      shadow-[0_6px_0_#7F1D1D,0_8px_15px_rgba(0,0,0,0.6)]
      hover:from-[#EF4444] hover:to-[#DC2626] hover:shadow-[0_6px_0_#991B1B,0_8px_15px_rgba(0,0,0,0.5)]
      active:shadow-none active:translate-y-[6px]
    `,
    warning: `
      bg-gradient-to-b from-[#F97316] to-[#C2410C] 
      text-black border-t-2 border-[#FB923C] border-x-2 border-black
      shadow-[0_6px_0_#9A3412,0_8px_15px_rgba(0,0,0,0.6)]
      hover:from-[#FB923C] hover:to-[#F97316] hover:shadow-[0_6px_0_#B9500C,0_8px_15px_rgba(0,0,0,0.5)]
      active:shadow-none active:translate-y-[6px]
    `,
  };

  return (
    <button
      className={`
        px-6 py-3 text-sm 
        sm:text-base md:px-8 md:py-4 md:text-xl
        font-['Black_Ops_One'] uppercase tracking-[0.1em] 
        rounded-sm transition-all duration-100 
        flex items-center justify-center gap-3 
        disabled:bg-gray-700 disabled:shadow-none disabled:text-gray-400 disabled:cursor-not-allowed disabled:translate-y-[6px]
        ${variants[variant as keyof typeof variants]} 
        ${className}
      `}
      {...props}
    >
      <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.2)]">
        {children}
      </span>
    </button>
  );
};

export default Button;