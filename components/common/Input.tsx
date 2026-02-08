import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="relative group">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors text-sm placeholder:text-[var(--text-muted)]"
        {...props}
      />
    </div>
  );
};

export default Input;