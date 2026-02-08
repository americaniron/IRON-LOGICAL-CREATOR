import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "px-6 py-2 text-base font-semibold transition-all duration-150 ease-in-out rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] select-none";
  
  const variants = {
    primary: `
      bg-[var(--accent-primary)] text-white
      hover:bg-[var(--accent-secondary)]
      focus:ring-[var(--accent-primary)]
    `,
    secondary: `
      bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)]
      hover:bg-[var(--border-primary)]
      focus:ring-[var(--text-secondary)]
    `,
    danger: `
      bg-[var(--danger-secondary)] text-white
      hover:bg-red-700
      focus:ring-[var(--danger-secondary)]
    `,
    warning: `
      bg-orange-500 text-white
      hover:bg-orange-600
      focus:ring-orange-500
    `,
  };

  return (
    <button
      className={`
        ${baseStyles}
        disabled:bg-[var(--bg-tertiary)]
        disabled:text-[var(--text-muted)]
        disabled:cursor-not-allowed
        ${variants[variant as keyof typeof variants]} 
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
};

export default Button;