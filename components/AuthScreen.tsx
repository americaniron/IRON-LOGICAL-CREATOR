import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { checkRequestStatusByName } from '../services/backendService';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { Gear } from './common/Icons';
import { AccessRequest } from '../types';

const AuthScreen: React.FC = () => {
    const { login, submitAccessRequest } = useAppContext();
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState<'login' | 'request'>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for request access flow
    const [requestView, setRequestView] = useState<'form' | 'status'>('form');
    const [requestName, setRequestName] = useState('');
    const [requestReason, setRequestReason] = useState('');
    const [requestSubmitted, setRequestSubmitted] = useState(false);
    
    // State for status check flow
    const [statusCheckName, setStatusCheckName] = useState('');
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [checkedRequest, setCheckedRequest] = useState<AccessRequest | 'not_found' | null>(null);

    const handleNumClick = (num: string) => {
        if (pin.length < 5) {
            setPin(prev => prev + num);
            setError(null);
        }
    };

    const handleClear = () => {
        setPin('');
        setError(null);
    };

    const handleLogin = async () => {
        if (pin.length !== 5) {
            setError("INVALID FORMAT: 5 DIGITS REQUIRED");
            return;
        }
        setIsLoading(true);
        const result = await login(pin);
        if (!result.success) {
            setError(result.message || "ACCESS DENIED");
            setPin('');
        }
        setIsLoading(false);
    };

    const handleStatusCheck = async () => {
        if (!statusCheckName.trim()) return;
        setIsCheckingStatus(true);
        setCheckedRequest(null);
        const result = await checkRequestStatusByName(statusCheckName);
        setCheckedRequest(result || 'not_found');
        setIsCheckingStatus(false);
    };

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!requestName || !requestReason) return;
        setIsLoading(true);
        await submitAccessRequest(requestName, requestReason);
        setRequestSubmitted(true);
        // Automatically check status after submitting
        setStatusCheckName(requestName);
        setRequestView('status');
        const result = await checkRequestStatusByName(requestName);
        setCheckedRequest(result || 'not_found');
        setIsLoading(false);
    };

    const renderRequestStatus = () => {
        if (isCheckingStatus) {
            return <Spinner text="QUERYING..." />;
        }
        if (!checkedRequest) {
            return null;
        }
        if (checkedRequest === 'not_found') {
            return <div className="p-4 bg-asphalt border border-industrial-gray text-center font-mono uppercase text-xs sm:text-sm text-gray-500">No application found: <span className="text-white">{statusCheckName}</span></div>;
        }
        switch(checkedRequest.status) {
            case 'approved':
                return (
                    <div className="p-4 sm:p-6 bg-heavy-yellow/10 border-2 border-heavy-yellow text-center space-y-3 sm:space-y-4 animate-in fade-in duration-500">
                        <h3 className="text-sm sm:text-lg font-['Black_Ops_One'] text-heavy-yellow tracking-widest uppercase">Authorized</h3>
                        <p className="font-mono text-white text-[10px] sm:text-sm">Operative confirmed.</p>
                        <div className="bg-black p-3 sm:p-4 border border-industrial-gray">
                            <p className="text-[9px] sm:text-xs font-mono text-gray-400 uppercase tracking-widest">Access PIN:</p>
                            <p className="text-2xl sm:text-4xl font-black font-mono text-heavy-yellow tracking-[0.2em] my-1 sm:my-2">{checkedRequest.generatedPin}</p>
                        </div>
                         <button onClick={() => setMode('login')} className="text-[9px] sm:text-xs font-mono uppercase underline text-heavy-yellow hover:text-white">Return to Login</button>
                    </div>
                );
            case 'pending':
                return <div className="p-4 bg-asphalt border border-industrial-gray text-center font-mono uppercase text-xs text-gray-400 animate-pulse">Request for <span className="text-white">{checkedRequest.name}</span> is pending COMMAND review.</div>;
            case 'denied':
                 return <div className="p-4 bg-danger-secondary/20 border border-danger-primary text-center font-mono uppercase text-xs text-danger-primary">Application for <span className="text-white">{checkedRequest.name}</span> was denied.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-asphalt flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none"></div>
            
            <div className="relative w-full max-w-sm sm:max-w-md bg-[var(--bg-secondary)] border-4 border-[var(--border-primary)] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="bg-[var(--accent-primary)] p-3 sm:p-4 border-b-4 border-black flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Gear className="h-6 w-6 sm:h-8 sm:w-8 text-black animate-[spin_10s_linear_infinite]" />
                        <h1 className="text-lg sm:text-2xl font-['Black_Ops_One'] text-black tracking-widest uppercase">SECURITY_GATE</h1>
                    </div>
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[var(--danger-primary)] animate-pulse rounded-full border border-black"></div>
                </div>

                <div className="p-6 sm:p-8">
                    {mode === 'login' ? (
                        <>
                            <div className="mb-6 sm:mb-8 text-center">
                                <p className="text-[var(--accent-primary)] font-mono text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">RESTRICTED ACCESS</p>
                                <div className="h-12 sm:h-16 bg-[var(--bg-input)] border-2 border-[var(--border-primary)] flex items-center justify-center gap-2 sm:gap-4 mb-2 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-[var(--border-primary)]'}`}></div>
                                    ))}
                                </div>
                                {error && <p className="text-[var(--danger-primary)] font-mono text-[9px] sm:text-xs font-bold animate-pulse">{error}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumClick(num.toString())}
                                        className="h-12 sm:h-14 bg-[var(--border-primary)] text-[var(--text-primary)] font-['Black_Ops_One'] text-lg sm:text-xl border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-[var(--border-secondary)] transition-all disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button onClick={handleClear} disabled={isLoading} className="h-12 sm:h-14 bg-[var(--danger-secondary)]/50 text-[var(--danger-primary)] font-mono text-[10px] sm:text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-[var(--danger-secondary)]/80 disabled:opacity-50">CLR</button>
                                <button onClick={() => handleNumClick('0')} disabled={isLoading} className="h-12 sm:h-14 bg-[var(--border-primary)] text-[var(--text-primary)] font-['Black_Ops_One'] text-lg sm:text-xl border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-[var(--border-secondary)] transition-all disabled:opacity-50">0</button>
                                <button onClick={handleLogin} disabled={isLoading || pin.length !== 5} className="h-12 sm:h-14 bg-[var(--accent-primary)] text-black font-mono font-bold text-[10px] sm:text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 hover:brightness-110 disabled:bg-[var(--border-primary)] disabled:text-[var(--text-muted)] disabled:translate-y-0 disabled:border-b-0 transition-all">{isLoading ? '...' : 'ENT'}</button>
                            </div>

                            <button 
                                onClick={() => setMode('request')}
                                className="w-full py-1 text-center text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors underline"
                            >
                                Request_Access_Clearance
                            </button>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                             <div className="flex border-b-2 border-industrial-gray mb-4 sm:mb-6">
                                <button onClick={() => { setRequestView('form'); setCheckedRequest(null); }} className={`flex-1 p-2.5 sm:p-3 text-[10px] sm:text-xs font-mono uppercase tracking-widest ${requestView === 'form' ? 'bg-industrial-gray text-white font-bold' : 'text-gray-600 hover:bg-asphalt'}`}>New App</button>
                                <button onClick={() => setRequestView('status')} className={`flex-1 p-2.5 sm:p-3 text-[10px] sm:text-xs font-mono uppercase tracking-widest ${requestView === 'status' ? 'bg-industrial-gray text-white font-bold' : 'text-gray-600 hover:bg-asphalt'}`}>Status</button>
                             </div>

                             {requestView === 'form' ? (
                                <form onSubmit={handleSubmitRequest} className="space-y-3 sm:space-y-4">
                                    <h2 className="text-white/80 font-['Black_Ops_One'] text-sm sm:text-lg text-center uppercase mb-2">Application</h2>
                                    <div>
                                        <label htmlFor="req-name" className="block text-[9px] text-heavy-yellow font-mono uppercase mb-1">Operative Name</label>
                                        <input 
                                            id="req-name"
                                            type="text" 
                                            value={requestName}
                                            onChange={e => setRequestName(e.target.value)}
                                            className="w-full bg-asphalt border border-industrial-gray p-2 text-white font-mono uppercase focus:border-heavy-yellow outline-none text-xs sm:text-sm"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="req-reason" className="block text-[9px] text-heavy-yellow font-mono uppercase mb-1">Objective</label>
                                        <textarea 
                                            id="req-reason"
                                            value={requestReason}
                                            onChange={e => setRequestReason(e.target.value)}
                                            className="w-full bg-asphalt border border-industrial-gray p-2 text-white font-mono uppercase focus:border-heavy-yellow outline-none h-20 sm:h-24 text-xs sm:text-sm"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="pt-1">
                                        <Button type="submit" disabled={isLoading || !requestName || !requestReason} className="w-full !py-2.5 sm:!py-3 !text-xs sm:!text-sm">
                                            {isLoading ? "Submitting..." : "Submit"}
                                        </Button>
                                    </div>
                                    <button onClick={() => setMode('login')} className="w-full text-center text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-2 hover:text-white underline">Back to Login</button>
                                </form>
                             ) : (
                                 <div className="space-y-4 sm:space-y-6">
                                     <div className="space-y-1.5">
                                        <label htmlFor="status-name" className="block text-[9px] text-heavy-yellow font-mono uppercase mb-1">Operative Name</label>
                                        <div className="flex gap-1.5 sm:gap-2">
                                            <input 
                                                id="status-name"
                                                type="text" 
                                                value={statusCheckName}
                                                onChange={e => setStatusCheckName(e.target.value)}
                                                className="flex-1 bg-asphalt border border-industrial-gray p-2 text-white font-mono uppercase focus:border-heavy-yellow outline-none text-xs sm:text-sm"
                                                disabled={isCheckingStatus}
                                                onKeyPress={e => e.key === 'Enter' && handleStatusCheck()}
                                            />
                                            <Button onClick={handleStatusCheck} disabled={isCheckingStatus || !statusCheckName} className="!py-1.5 !px-3 sm:!py-2 sm:!px-4 !text-[10px] sm:!text-xs">Check</Button>
                                        </div>
                                     </div>
                                     <div className="min-h-[120px] sm:min-h-[150px] flex items-center justify-center">
                                        {renderRequestStatus()}
                                     </div>
                                     <button onClick={() => setMode('login')} className="w-full text-center text-[9px] font-mono text-gray-500 uppercase tracking-widest hover:text-white underline">Back to Login</button>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
                
                <div className="bg-[var(--bg-input)] p-2 border-t-2 border-[var(--border-primary)] flex justify-between text-[7px] sm:text-[8px] font-mono text-[var(--text-muted)] uppercase">
                    <span>SEC_SYS_V6</span>
                    <span>IRON MEDIA</span>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;