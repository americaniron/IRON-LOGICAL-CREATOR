import React, { useState, useEffect } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  throttleMs?: number; // Cooldown period
  provider?: 'iron' | 'guest' | 'xcorp' | 'meta';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'lg', throttleMs = 1500, onClick, disabled, provider, ...props }) => {
  const [isThrottled, setIsThrottled] = useState(false);

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isThrottled) return;
    setIsThrottled(true);
    onClick?.(e);
  };

  useEffect(() => {
    if (isThrottled) {
      const timer = setTimeout(() => setIsThrottled(false), throttleMs);
      return () => clearTimeout(timer);
    }
  }, [isThrottled, throttleMs]);
  
  const baseStyles = `
    font-heading uppercase tracking-widest font-black
    transition-all duration-100 
    flex items-center justify-center gap-3 
    border-2 border-black
    disabled:bg-industrial-gray/50 disabled:border-t-industrial-gray disabled:border-l-industrial-gray disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0
    focus-ring
  `;

  const variants = {
    primary: `
      bg-heavy-yellow border-t-yellow-300 border-l-yellow-300 text-black
      shadow-[0_6px_0_#b38600] active:shadow-[0_2px_0_#b38600]
      hover:bg-yellow-400
      active:translate-y-[4px]
    `,
    secondary: `
      bg-industrial-gray border-t-gray-400 border-l-gray-400 text-text-light
      shadow-[0_6px_0_#2a2e33] active:shadow-[0_2px_0_#2a2e33]
      hover:bg-gray-600
      active:translate-y-[4px]
    `,
    danger: `
      bg-red-600 border-t-red-400 border-l-red-400 text-white
      shadow-[0_6px_0_#991b1b] active:shadow-[0_2px_0_#991b1b]
      hover:bg-red-500
      active:translate-y-[4px]
    `,
    warning: `
      bg-orange-500 border-t-orange-300 border-l-orange-300 text-black
      shadow-[0_6px_0_#c2410c] active:shadow-[0_2px_0_#c2410c]
      hover:bg-orange-400
      active:translate-y-[4px]
    `,
  };

  const providerStyles = {
    guest: `
      bg-guest-green border-t-green-300 border-l-green-300 text-black
      shadow-[0_6px_0_#15803d] active:shadow-[0_2px_0_#15803d]
      hover:bg-green-400
      active:translate-y-[4px]
    `,
    xcorp: `
      bg-grok-magenta border-t-fuchsia-300 border-l-fuchsia-300 text-white
      shadow-[0_6px_0_#86198f] active:shadow-[0_2px_0_#86198f]
      hover:bg-fuchsia-500
      active:translate-y-[4px]
    `,
    meta: `
      bg-purple-600 border-t-purple-400 border-l-purple-400 text-white
      shadow-[0_6px_0_#6b21a8] active:shadow-[0_2px_0_#6b21a8]
      hover:bg-purple-500
      active:translate-y-[4px]
    `,
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-6 py-3 text-base md:px-8 md:py-4 md:text-lg',
    xl: 'px-8 py-4 text-lg md:px-10 md:py-5 md:text-xl',
  };

  const finalVariantStyles = provider && provider !== 'iron'
    ? providerStyles[provider as keyof typeof providerStyles]
    : variants[variant as keyof typeof variants];

  return (
    <button
      onClick={handleAction}
      disabled={disabled || isThrottled}
      className={`
        ${baseStyles}
        ${finalVariantStyles}
        ${sizes[size as keyof typeof sizes]}
        ${isThrottled ? 'opacity-50 animate-pulse' : ''}
        ${className}
      `}
      {...props}
    >
        {isThrottled ? 'Processing...' : children}
    </button>
  );
};

export default Button;