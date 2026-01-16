import React, { useContext, useRef, useEffect } from 'react';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { LogSeverity } from '../types';

const LogsPanel: React.FC = () => {
  const { logs, telemetry } = useContext(SystemStatusContext);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; 
    }
  }, [logs]);

  const getSeverityColor = (sev: LogSeverity) => {
    switch (sev) {
      case LogSeverity.INFO: return 'text-cyan-400';
      case LogSeverity.WARN: return 'text-heavy-yellow';
      case LogSeverity.ERROR: return 'text-red-500';
      case LogSeverity.CRITICAL: return 'text-red-600 font-black animate-pulse';
      default: return 'text-gray-500';
    }
  };

  const getProviderTag = (provider: string) => {
    switch (provider) {
      case 'iron': return '[ IRON ]';
      case 'guest': return '[ OAI  ]';
      case 'xcorp': return '[ GROK ]';
      default: return '[ SYS  ]';
    }
  };

  const calculateLoadWidth = (provider: keyof typeof telemetry.providerLoad) => {
    const total = (Object.values(telemetry.providerLoad) as number[]).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return '0%';
    return `${(telemetry.providerLoad[provider] / total) * 100}%`;
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/50 border-2 border-industrial-gray p-6">
             <h4 className="text-[10px] font-mono text-gray-600 uppercase mb-4 tracking-widest font-black">Thermal_Heatmap</h4>
             <div className="space-y-4">
                {(['iron', 'guest', 'xcorp'] as const).map((p) => (
                  <div key={p} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase">
                      <span>{p}_Core</span>
                      <span>{telemetry.providerLoad[p] || 0} OPS</span>
                    </div>
                    <div className="h-2 bg-industrial-gray/20 border border-industrial-gray">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          p === 'iron' ? 'bg-cyan-400' : p === 'guest' ? 'bg-guest-green' : 'bg-grok-magenta'
                        }`}
                        style={{ width: calculateLoadWidth(p) }}
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 bg-black/50 border-2 border-industrial-gray p-6 relative overflow-hidden">
             <div className="absolute top-2 right-4 text-[8px] font-mono text-cyan-900">REALTIME_TELEMETRY_STREAM</div>
             <h4 className="text-[10px] font-mono text-gray-600 uppercase mb-4 tracking-widest font-black">Engine_Output</h4>
             <div className="h-32 flex items-end gap-1 px-2 pb-2 border-b border-industrial-gray/30">
                {logs.slice(0, 40).reverse().map((l) => (
                   <div 
                    key={l.id} 
                    className={`flex-1 ${l.severity === 'ERROR' || l.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-cyan-400/40'} min-w-[4px]`}
                    style={{ height: `${Math.min(100, (l.latency || 100) / 10)}%` }}
                   />
                ))}
             </div>
          </div>
       </div>

       <div className="monitor-screen flex-1 overflow-y-auto p-6 font-mono text-xs space-y-2 scrollbar-thin" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-800 uppercase tracking-widest">
              &gt; No_Operational_Events_Logged_Yet_
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-4 border-b border-industrial-gray/30 pb-2 group hover:bg-white/5 transition-colors">
                <span className="text-gray-700 select-none">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="text-gray-600 w-16">{getProviderTag(log.provider)}</span>
                <span className={`w-16 ${getSeverityColor(log.severity)}`}>[{log.severity}]</span>
                <span className="flex-1 text-gray-300 break-words">{log.message}</span>
                {log.latency && <span className="text-[10px] text-industrial-gray group-hover:text-cyan-900">{log.latency}ms</span>}
              </div>
            ))
          )}
       </div>
    </div>
  );
};

export default LogsPanel;