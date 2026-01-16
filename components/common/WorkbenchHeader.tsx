
import React from 'react';
import { Crane } from './Icons';

interface WorkbenchHeaderProps {
  title: string;
  station: string;
  piped?: boolean;
  provider?: string;
}

const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({ title, station, piped }) => {

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 pb-4 border-b border-aura-mauve/50">
      <div className="mb-4 sm:mb-0">
        <h3 className="text-3xl font-heading text-aura-light tracking-wider uppercase mb-1">
          {title}
        </h3>
        <p className="text-xs font-body text-aura-cyan tracking-widest uppercase">
          {station} // STATUS: ONLINE
        </p>
      </div>
      {piped && (
        <div className="flex items-center gap-2 px-3 py-1 bg-aura-violet/20 border border-aura-violet text-aura-violet font-body text-xs font-bold uppercase animate-pulse rounded-md">
          <Crane className="h-4 w-4" /> Piped Data Received
        </div>
      )}
    </div>
  );
};

export default WorkbenchHeader;
