import React from 'react';
import { Crane } from './Icons';

interface WorkbenchHeaderProps {
  title: string;
  station: string;
  piped?: boolean;
  provider?: 'iron' | 'guest' | 'xcorp' | 'meta';
}

const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({ title, station, piped, provider = 'iron' }) => {
  const providerColor = {
    iron: 'text-heavy-yellow',
    guest: 'text-guest-green',
    xcorp: 'text-grok-magenta',
    meta: 'text-purple-500'
  }[provider];

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 pb-4 border-b-2 border-industrial-gray/50">
      <div className="mb-4 sm:mb-0">
        <h3 className={`text-3xl font-heading text-text-light tracking-wider uppercase mb-1`}>
          {title}
        </h3>
        <p className={`text-xs font-body ${providerColor} tracking-widest uppercase font-bold`}>
          {station} // STATUS: ONLINE
        </p>
      </div>
      {piped && (
        <div className="flex items-center gap-2 px-3 py-1 bg-heavy-yellow/20 border border-heavy-yellow text-heavy-yellow font-body text-xs font-bold uppercase animate-pulse">
          <Crane className="h-4 w-4" /> PIPED DATA RECEIVED
        </div>
      )}
    </div>
  );
};

export default WorkbenchHeader;