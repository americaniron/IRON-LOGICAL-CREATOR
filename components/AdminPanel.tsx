import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AccessRequest } from '../types';
import Button from './common/Button';
import { User, X, Gear } from './common/Icons';

const AdminPanel: React.FC = () => {
    const { accessRequests, approveRequest, denyRequest, isAdmin } = useAppContext();

    if (!isAdmin) {
        return <div className="p-8 text-center text-[var(--danger-primary)] font-black font-mono text-2xl">ACCESS DENIED: COMMANDER CLEARANCE REQUIRED</div>;
    }

    const pendingRequests = accessRequests.filter(r => r.status === 'pending');
    const processedRequests = accessRequests.filter(r => r.status !== 'pending').sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="h-full flex flex-col gap-6">
             <div className="control-panel p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-2 border-b-2 border-[var(--border-primary)] pb-4">
                     <Gear className="h-8 w-8 text-[var(--accent-primary)]" />
                     <h3 className="text-2xl font-['Black_Ops_One'] text-[var(--text-primary)] uppercase tracking-widest">Command_Log // Access_Control</h3>
                </div>
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase">Review and authorize personnel access to the multimedia orchestration rig.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                 {/* Pending Column */}
                 <div className="bg-[var(--bg-secondary)] border-4 border-[var(--border-primary)] p-4 flex flex-col overflow-hidden">
                     <div className="flex items-center gap-2 mb-4">
                         <div className="h-2 w-2 bg-[var(--accent-primary)] animate-pulse rounded-full"></div>
                         <h4 className="text-[var(--accent-primary)] font-black uppercase tracking-widest font-mono">Incoming_Requests ({pendingRequests.length})</h4>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                         {pendingRequests.length === 0 ? (
                             <div className="text-[var(--text-muted)] font-mono text-xs uppercase text-center mt-10">No Pending Transmissions</div>
                         ) : (
                             pendingRequests.map((req) => (
                                 <RequestCard key={req.id} req={req} onApprove={() => approveRequest(req.id)} onDeny={() => denyRequest(req.id)} />
                             ))
                         )}
                     </div>
                 </div>

                 {/* History Column */}
                 <div className="bg-[var(--bg-tertiary)] border-4 border-[var(--border-primary)] p-4 flex flex-col overflow-hidden opacity-80">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="h-2 w-2 bg-[var(--text-muted)] rounded-full"></div>
                         <h4 className="text-[var(--text-secondary)] font-black uppercase tracking-widest font-mono">Processed_Logs</h4>
                     </div>
                     <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                         {processedRequests.map((req) => (
                             <div key={req.id} className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex justify-between items-center">
                                 <div>
                                     <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 ${req.status === 'approved' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                         {req.status}
                                     </span>
                                     <span className="ml-2 text-xs text-[var(--text-primary)] font-mono uppercase">{req.name}</span>
                                 </div>
                                 {req.status === 'approved' && req.generatedPin && (
                                     <div className="text-right">
                                         <span className="text-[8px] text-[var(--text-muted)] block font-mono uppercase">ASSIGNED_PIN</span>
                                         <span className="text-[var(--accent-primary)] font-mono font-bold tracking-widest">{req.generatedPin}</span>
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
};

const RequestCard: React.FC<{ req: AccessRequest, onApprove: () => void, onDeny: () => void }> = ({ req, onApprove, onDeny }) => (
    <div className="bg-[var(--bg-input)] border-2 border-[var(--border-primary)] p-4 animate-in fade-in slide-in-from-left-4 duration-300">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--accent-primary)]" />
                <span className="text-[var(--text-primary)] font-bold font-mono uppercase">{req.name}</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">{new Date(req.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="bg-black/50 p-2 mb-4 border-l-2 border-[var(--accent-primary)]">
            <p className="text-xs text-[var(--text-secondary)] font-mono uppercase italic">"{req.reason}"</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={onApprove} className="flex-1 !py-2 !text-xs !bg-gradient-to-b !from-green-600 !to-green-800 !text-white !border-green-500">
                Authorize
            </Button>
             <Button onClick={onDeny} variant="danger" className="flex-1 !py-2 !text-xs">
                Deny
            </Button>
        </div>
    </div>
);

export default AdminPanel;