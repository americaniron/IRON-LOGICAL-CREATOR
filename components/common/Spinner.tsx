import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigProvider';
import { Gear } from './Icons';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  const { safeMode } = useContext(ConfigContext);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative h-12 w-12 text-heavy-yellow">
        <Gear className={`h-12 w-12 ${safeMode ? '' : 'animate-spin'}`} style={{animationDuration: '2s'}} />
      </div>
      {text && <p className="text-heavy-yellow font-body text-xs uppercase tracking-widest font-bold animate-pulse">{text}</p>}
    </div>
  );
};

export default Spinner;