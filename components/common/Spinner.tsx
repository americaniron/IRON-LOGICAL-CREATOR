import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigProvider';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  const { safeMode } = useContext(ConfigContext);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative h-12 w-12">
        <div className={`absolute inset-0 border-4 border-aura-mauve rounded-full ${safeMode ? '' : 'animate-spin'}`}></div>
        <div className={`absolute inset-0 border-4 border-t-aura-violet border-l-aura-violet border-b-transparent border-r-transparent rounded-full ${safeMode ? '' : 'animate-spin'}`}></div>
      </div>
      {text && <p className="text-aura-cyan font-body text-xs uppercase tracking-widest font-bold animate-pulse">{text}</p>}
    </div>
  );
};

export default Spinner;
