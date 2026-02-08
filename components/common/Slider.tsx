import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  displayValue: string;
}

const Slider: React.FC<SliderProps> = ({ label, id, displayValue, ...props }) => {
  const percentage = props.max ? ((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{displayValue}</span>
      </div>
      <div className="relative h-8 flex items-center group">
        <input
          type="range"
          id={id}
          className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer"
          style={{ 
            background: `linear-gradient(to right, var(--accent-primary) ${percentage}%, var(--bg-tertiary) ${percentage}%)` 
          }}
          {...props}
        />
      </div>
    </div>
  );
};

export default Slider;