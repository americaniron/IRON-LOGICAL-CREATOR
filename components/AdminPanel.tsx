import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { AccessRequest, UserAccount } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import { User, X, Gear, Crane } from './common/Icons';

const UserManagementRow: React.FC<{ user: UserAccount, onAllocate: (id: string, amount: number) => void }> = ({ user, onAllocate }) => {
    const [amount, setAmount] = useState('500');
    
    return (
        <div className="p-4 bg-asphalt border border-industrial-gray flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-industrial-gray text-white">
                    <User className="h-5 w-5" />
                </div>
                <div>
                    <h5 className="font-mono font-bold text-white uppercase text-sm">{user.name}</h5>
                    <p className="text-[9px] font-mono text-gray-500 uppercase">JOINED: {new Date(user.joinedAt).toLocaleDateString()} // PLAN: {user.plan}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-right">
                    <p className="text-[8px] font-mono text-gray-500 uppercase">CREDIT_BALANCE</p>
                    <p className="text-heavy-yellow font-black font-mono">{user.credits} IC</p>
                </div>
                <div className="flex gap-1 h-10">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-20 bg-black border border-industrial-gray text-white font-mono text-xs px-2 focus:border-heavy-yellow outline-none"
                    />
                    <button 
                        onClick={() => onAllocate(user.id, parseInt(amount))}
                        className="px-3 bg-heavy-yellow text-black font-mono text-[9px] font-bold hover:bg-white transition-colors"
                    >
                        INJECT
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
        return <div className="p-8 text-center text-red-600 font-black font-mono text-2xl animate-pulse">!! ACCESS_VIOLATION: COMMANDER_LEVEL_REQUIRED !!</div>;
    }

    const pendingRequests = accessRequests.filter(r => r.status === 'pending');

    return (
        <div className="h-full flex flex-col gap-6">
             <div className="control-panel p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                     <Gear className="h-10 w-10 text-heavy-yellow animate-spin-slow" />
                     <div>
                        <h3 className="text-3xl font-['Black_Ops_One'] text-white uppercase tracking-widest">Command_Center</h3>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Site_Orchestration & Budget_Allocation_Suite</p>
                     </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('requests')}
                        className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${view === 'requests' ? 'bg-heavy-yellow text-black border-black font-bold' : 'border-industrial-gray text-gray-500 hover:text-white'}`}
                    >
                        Clearance_Queue ({pendingRequests.length})
                    </button>
                    <button 
                        onClick={() => setView('users')}
                        className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${view === 'users' ? 'bg-heavy-yellow text-black border-black font-bold' : 'border-industrial-gray text-gray-500 hover:text-white'}`}
                    >
                        Operative_Manifest ({allUsers.length})
                    </button>
                </div>
             </div>

             <div className="flex-1 overflow-hidden">
                {view === 'requests' ? (
                    <div className="bg-asphalt border-4 border-industrial-gray p-6 h-full flex flex-col">
                        <h4 className="text-heavy-yellow font-black uppercase tracking-widest font-mono mb-6 pb-2 border-b border-industrial-gray">Incoming_Clearance_Applications</h4>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                            {pendingRequests.length === 0 ? (
                                <div className="text-gray-700 font-mono text-sm uppercase text-center mt-20 flex flex-col items-center gap-4">
                                    <Crane className="h-16 w-16 opacity-10" />
                                    <span>Signal_Queue_Clear</span>
                                </div>
                            ) : (
                                pendingRequests.map((req) => (
                                    <div key={req.id} className="p-6 bg-black border-2 border-industrial-gray flex justify-between items-center group hover:border-heavy-yellow transition-colors">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-heavy-yellow" />
                                                <span className="text-white font-black font-mono uppercase text-lg">{req.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-mono uppercase italic border-l-2 border-heavy-yellow pl-4">"{req.reason}"</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button onClick={() => approveRequest(req.id)} className="!py-3 !px-6 !text-xs">AUTHORIZE</Button>
                                            <Button onClick={() => denyRequest(req.id)} variant="danger" className="!py-3 !px-6 !text-xs">DENY</Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-asphalt border-4 border-industrial-gray p-6 h-full flex flex-col">
                        <h4 className="text-heavy-yellow font-black uppercase tracking-widest font-mono mb-6 pb-2 border-b border-industrial-gray">Active_Operative_Directives</h4>
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