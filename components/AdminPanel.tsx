import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { AccessRequest, UserAccount } from '../types';
import Button from './common/Button';
import { User, Check, X, Gear, Crane } from './common/Icons';

const UserManagementRow: React.FC<{ user: UserAccount, onAllocate: (id: string, amount: number) => void }> = ({ user, onAllocate }) => {
    const [amount, setAmount] = useState('500');
    
    return (
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full">
                    <User className="h-5 w-5" />
                </div>
                <div>
                    <h5 className="font-semibold text-[var(--text-primary)] text-sm">{user.name}</h5>
                    <p className="text-xs text-[var(--text-muted)]">Joined: {new Date(user.joinedAt).toLocaleDateString()} | Plan: <span className="capitalize">{user.plan}</span></p>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">Credits</p>
                    <p className="text-[var(--text-accent)] font-bold">{user.credits}</p>
                </div>
                <div className="flex gap-1 h-10">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-20 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] text-sm px-2 focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)] outline-none"
                    />
                    <button 
                        onClick={() => onAllocate(user.id, parseInt(amount))}
                        className="px-3 bg-[var(--accent-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--accent-secondary)] transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel: React.FC = () => {
    const { accessRequests, allUsers, approveRequest, denyRequest, isAdmin, allocateCredits } = useAppContext();
    const [view, setView] = useState<'requests' | 'users'>('requests');

    if (!isAdmin) {
        return <div className="p-8 text-center text-red-500 font-bold text-2xl">Access Denied: Administrator level required.</div>;
    }

    const pendingRequests = useMemo(() => accessRequests.filter(r => r.status === 'pending'), [accessRequests]);
    const resolvedRequests = useMemo(() => accessRequests.filter(r => r.status !== 'pending').sort((a,b) => b.timestamp - a.timestamp), [accessRequests]);

    return (
        <div className="h-full flex flex-col gap-6">
             <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                     <Gear className="h-8 w-8 text-[var(--accent-primary)]" />
                     <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h3>
                        <p className="text-sm text-[var(--text-muted)]">User and Access Management</p>
                     </div>
                </div>
                <div className="flex gap-2 bg-[var(--bg-primary)] p-1 rounded-lg">
                    <button 
                        onClick={() => setView('requests')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all relative ${view === 'requests' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Access Requests 
                        {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
                    </button>
                    <button 
                        onClick={() => setView('users')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${view === 'users' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        User Management
                    </button>
                </div>
             </div>

             <div className="flex-1 overflow-hidden">
                {view === 'requests' ? (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 sm:p-6 h-full flex flex-col gap-6">
                        <div>
                            <h4 className="text-[var(--text-primary)] font-bold mb-4 pb-2 border-b border-[var(--border-primary)]">Pending Requests</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-2">
                                {pendingRequests.length === 0 ? (
                                    <div className="text-[var(--text-muted)] text-sm text-center py-10 flex flex-col items-center gap-4">
                                        <Check className="h-12 w-12 opacity-50" />
                                        <span>No pending access requests.</span>
                                    </div>
                                ) : (
                                    pendingRequests.map((req) => (
                                        <div key={req.id} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <User className="h-5 w-5 text-[var(--accent-primary)]" />
                                                    <span className="text-white font-semibold">{req.name}</span>
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)] italic">"{req.reason}"</p>
                                            </div>
                                            <div className="flex gap-3 self-end sm:self-center">
                                                <Button onClick={() => approveRequest(req.id)} className="!py-2 !px-4 !text-xs">Approve</Button>
                                                <Button onClick={() => denyRequest(req.id)} variant="danger" className="!py-2 !px-4 !text-xs">Deny</Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                           <h4 className="text-[var(--text-secondary)] font-bold mb-4 pb-2 border-b border-[var(--border-primary)]">Request History</h4>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                {resolvedRequests.map(req => (
                                    <div key={req.id} className={`p-3 bg-[var(--bg-primary)] border-l-4 flex justify-between items-center rounded-r-lg ${req.status === 'approved' ? 'border-green-500' : 'border-red-500'}`}>
                                        <div className="flex items-center gap-4">
                                            {req.status === 'approved' ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                                            <div>
                                                <p className="text-white font-medium">{req.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{new Date(req.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {req.status === 'approved' && (
                                            <div className="text-right">
                                                <p className="text-xs text-[var(--text-muted)]">Assigned PIN</p>
                                                <p className="font-mono text-[var(--accent-primary)] font-bold text-lg">{req.generatedPin}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 sm:p-6 h-full flex flex-col">
                        <h4 className="text-[var(--text-primary)] font-bold mb-6 pb-2 border-b border-[var(--border-primary)]">User Credit Allocation</h4>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                            {allUsers.filter(u => u.role !== 'admin').map(user => (
                                <UserManagementRow key={user.id} user={user} onAllocate={allocateCredits} />
                            ))}
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};

export default AdminPanel;