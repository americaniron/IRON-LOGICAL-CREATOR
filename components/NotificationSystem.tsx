import React, { useContext } from 'react';
import { SystemStatusContext, Notification } from '../contexts/SystemStatusProvider';

const NotificationSystem: React.FC = () => {
  const { notifications } = useContext(SystemStatusContext);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
      {notifications.map((n: Notification) => (
        <div 
          key={n.id} 
          className={`
            min-w-[300px] p-4 bg-asphalt/95 border-r-8 shadow-2xl animate-in slide-in-from-right-full duration-300
            ${n.type === 'info' ? 'border-cyan-400' : 
              n.type === 'success' ? 'border-green-500' : 
              n.type === 'warning' ? 'border-orange-500' : 'border-red-600'}
            relative overflow-hidden pointer-events-auto
          `}
        >
          <div className="caution-stripes h-1 absolute top-0 left-0 right-0 opacity-10"></div>
          <p className={`font-mono text-[10px] uppercase font-black mb-1 ${
             n.type === 'info' ? 'text-cyan-400' : 
             n.type === 'success' ? 'text-green-500' : 
             n.type === 'warning' ? 'text-orange-500' : 'text-red-500'
          }`}>
             // SYSTEM_INTEL_{n.type.toUpperCase()}
          </p>
          <p className="text-white font-bold text-xs tracking-tight uppercase">
            {n.message}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-industrial-gray opacity-20">
            <div className="h-full bg-white/30 animate-[shrink_5s_linear_forwards]"></div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;