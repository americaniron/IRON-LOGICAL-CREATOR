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
    
    const [requestView, setRequestView] = useState<'form' | 'status'>('form');
    const [requestName, setRequestName] = useState('');
    const [requestReason, setRequestReason] = useState('');
    
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
            setError("PIN must be 5 digits.");
            return;
        }
        setIsLoading(true);
        const result = await login(pin);
        if (!result.success) {
            setError(result.message || "Access Denied");
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
        setStatusCheckName(requestName);
        setRequestView('status');
        const result = await checkRequestStatusByName(requestName);
        setCheckedRequest(result || 'not_found');
        setIsLoading(false);
    };

    const renderRequestStatus = () => {
        if (isCheckingStatus) {
            return <Spinner text="Checking status..." />;
        }
        if (!checkedRequest) {
            return null;
        }
        if (checkedRequest === 'not_found') {
            return <div className="p-4 bg-[var(--bg-primary)] rounded-md text-center text-sm text-[var(--text-secondary)]">No application found for: <span className="font-semibold text-[var(--text-primary)]">{statusCheckName}</span></div>;
        }
        switch(checkedRequest.status) {
            case 'approved':
                return (
                    <div className="p-4 sm:p-6 bg-green-500/10 border border-green-500/20 text-center space-y-3 sm:space-y-4 rounded-lg animate-in fade-in duration-500">
                        <h3 className="text-lg font-bold text-green-400">Access Approved</h3>
                        <p className="text-[var(--text-primary)] text-sm">Your request has been approved.</p>
                        <div className="bg-black/20 p-3 sm:p-4 rounded-md">
                            <p className="text-xs text-[var(--text-secondary)]">Your Access PIN:</p>
                            <p className="text-3xl sm:text-4xl font-bold text-[var(--text-accent)] tracking-widest my-1 sm:my-2">{checkedRequest.generatedPin}</p>
                        </div>
                         <button onClick={() => setMode('login')} className="text-sm text-[var(--accent-primary)] hover:underline">Return to Sign In</button>
                    </div>
                );
            case 'pending':
                return <div className="p-4 bg-[var(--bg-primary)] rounded-md text-center text-sm text-gray-400 animate-pulse">Request for <span className="font-semibold text-white">{checkedRequest.name}</span> is pending review.</div>;
            case 'denied':
                 return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-center text-sm text-red-400">Application for <span className="font-semibold text-white">{checkedRequest.name}</span> was denied.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl rounded-lg overflow-hidden">
                <div className="p-6 text-center border-b border-[var(--border-primary)]">
                    <Gear className="h-10 w-10 text-[var(--accent-primary)] mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Creative Suite</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Secure Access Required</p>
                </div>

                <div className="p-6 sm:p-8">
                    {mode === 'login' ? (
                        <>
                            <div className="mb-6 text-center">
                                <p className="text-[var(--text-secondary)] text-sm mb-3">Enter your 5-digit PIN</p>
                                <div className="h-14 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-md flex items-center justify-center gap-2 sm:gap-3 mb-2 shadow-inner">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-4 w-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]' : 'bg-[var(--border-primary)]'}`}></div>
                                    ))}
                                </div>
                                {error && <p className="text-[var(--danger-primary)] text-sm font-semibold animate-pulse">{error}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, 'Enter'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            if (typeof item === 'number') handleNumClick(item.toString());
                                            else if (item === 'Clear') handleClear();
                                            else if (item === 'Enter') handleLogin();
                                        }}
                                        className={`h-14 rounded-md text-xl font-bold transition-all disabled:opacity-50
                                            ${item === 'Enter' ? 'col-span-1 bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)]' : ''}
                                            ${item === 'Clear' ? 'text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)]' : ''}
                                            ${typeof item === 'number' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)]' : ''}
                                        `}
                                        disabled={isLoading || (item === 'Enter' && pin.length !== 5)}
                                    >
                                        {isLoading && item === 'Enter' ? '...' : item}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setMode('request')}
                                className="w-full py-2 text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline"
                            >
                                Request Access
                            </button>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                             <div className="flex border-b border-[var(--border-primary)] mb-6">
                                <button onClick={() => { setRequestView('form'); setCheckedRequest(null); }} className={`flex-1 p-3 text-sm font-medium ${requestView === 'form' ? 'border-b-2 border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>New Request</button>
                                <button onClick={() => setRequestView('status')} className={`flex-1 p-3 text-sm font-medium ${requestView === 'status' ? 'border-b-2 border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>Check Status</button>
                             </div>

                             {requestView === 'form' ? (
                                <form onSubmit={handleSubmitRequest} className="space-y-4">
                                    <h2 className="text-[var(--text-primary)] font-bold text-lg text-center mb-2">Access Request Form</h2>
                                    <div>
                                        <label htmlFor="req-name" className="block text-sm text-[var(--text-secondary)] mb-1">Full Name</label>
                                        <input 
                                            id="req-name" type="text" value={requestName} onChange={e => setRequestName(e.target.value)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] p-2.5 rounded-md text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)] outline-none text-sm"
                                            required disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="req-reason" className="block text-sm text-[var(--text-secondary)] mb-1">Reason for Access</label>
                                        <textarea 
                                            id="req-reason" value={requestReason} onChange={e => setRequestReason(e.target.value)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] p-2.5 rounded-md text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)] outline-none h-24 text-sm"
                                            required disabled={isLoading}
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" disabled={isLoading || !requestName || !requestReason} className="w-full !py-2.5 !text-sm">
                                            {isLoading ? "Submitting..." : "Submit Request"}
                                        </Button>
                                    </div>
                                    <button onClick={() => setMode('login')} className="w-full text-center text-sm text-[var(--text-muted)] mt-2 hover:underline">Back to Sign In</button>
                                </form>
                             ) : (
                                 <div className="space-y-6">
                                     <div>
                                        <label htmlFor="status-name" className="block text-sm text-[var(--text-secondary)] mb-1">Enter Your Name to Check Status</label>
                                        <div className="flex gap-2">
                                            <input 
                                                id="status-name" type="text" value={statusCheckName} onChange={e => setStatusCheckName(e.target.value)}
                                                className="flex-1 bg-[var(--bg-input)] border border-[var(--border-primary)] p-2.5 rounded-md text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)] outline-none text-sm"
                                                disabled={isCheckingStatus} onKeyPress={e => e.key === 'Enter' && handleStatusCheck()}
                                            />
                                            <Button onClick={handleStatusCheck} disabled={isCheckingStatus || !statusCheckName} className="!py-1.5 !px-4 !text-sm">Check</Button>
                                        </div>
                                     </div>
                                     <div className="min-h-[150px] flex items-center justify-center">
                                        {renderRequestStatus()}
                                     </div>
                                     <button onClick={() => setMode('login')} className="w-full text-center text-sm text-[var(--text-muted)] hover:underline">Back to Sign In</button>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;