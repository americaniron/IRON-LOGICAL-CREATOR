
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
    font-heading uppercase tracking-widest
    transition-all duration-200 
    flex items-center justify-center gap-3 
    border rounded-sm
    disabled:bg-aura-mauve/20 disabled:border-aura-mauve/20 disabled:text-aura-gray disabled:cursor-not-allowed
    focus-ring
  `;

  const variants = {
    primary: `
      bg-aura-violet border-aura-violet text-white
      hover:bg-transparent hover:text-aura-violet hover:shadow-[0_0_15px_var(--aura-violet)]
      active:scale-95
    `,
    secondary: `
      bg-transparent border-aura-mauve text-aura-gray
      hover:border-aura-light hover:text-aura-light
      active:scale-95
    `,
    danger: `
      bg-transparent border-red-500 text-red-400
      hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_#ef4444]
      active:scale-95
    `,
    // FIX: Add 'warning' variant for ErrorBoundary button
    warning: `
      bg-yellow-500 border-yellow-500 text-black
      hover:bg-transparent hover:text-yellow-500 hover:shadow-[0_0_15px_#f59e0b]
      active:scale-95
    `,
  };

  const providerStyles = {
    guest: `
      bg-guest-green border-guest-green text-black
      hover:bg-transparent hover:text-guest-green
      active:scale-95
    `,
    xcorp: `
      bg-grok-magenta border-grok-magenta text-white
      hover:bg-transparent hover:text-grok-magenta
      active:scale-95
    `,
    meta: `
      bg-purple-600 border-purple-600 text-white
      hover:bg-transparent hover:text-purple-500 hover:border-purple-500
      active:scale-95
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
