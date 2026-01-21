import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import { Gear } from './common/Icons';

const AuthScreen: React.FC = () => {
    const { login, submitAccessRequest } = useAppContext();
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState<'login' | 'request'>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestReason, setRequestReason] = useState('');
    const [requestSubmitted, setRequestSubmitted] = useState(false);

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

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!requestName || !requestReason) return;
        setIsLoading(true);
        await submitAccessRequest(requestName, requestReason);
        setRequestSubmitted(true);
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-asphalt flex items-center justify-center p-4">
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none"></div>
            
            <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border-4 border-[var(--border-primary)] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* Header */}
                <div className="bg-[var(--accent-primary)] p-4 border-b-4 border-black flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Gear className="h-8 w-8 text-black animate-[spin_10s_linear_infinite]" />
                        <h1 className="text-2xl font-['Black_Ops_One'] text-black tracking-widest uppercase">SECURITY_GATE</h1>
                    </div>
                    <div className="h-3 w-3 bg-[var(--danger-primary)] animate-pulse rounded-full border border-black"></div>
                </div>

                <div className="p-8">
                    {mode === 'login' ? (
                        <>
                            <div className="mb-8 text-center">
                                <p className="text-[var(--accent-primary)] font-mono text-xs uppercase tracking-[0.3em] mb-2">RESTRICTED ACCESS AREA</p>
                                <div className="h-16 bg-[var(--bg-input)] border-2 border-[var(--border-primary)] flex items-center justify-center gap-4 mb-2 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]" aria-label={`PIN input: ${pin.length} of 5 digits entered`}>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-4 w-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-[var(--border-primary)]'}`}></div>
                                    ))}
                                </div>
                                {error && <p className="text-[var(--danger-primary)] font-mono text-xs font-bold animate-pulse" role="alert">{error}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumClick(num.toString())}
                                        className="h-14 bg-[var(--border-primary)] text-[var(--text-primary)] font-['Black_Ops_One'] text-xl border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-[var(--border-secondary)] transition-all disabled:opacity-50"
                                        disabled={isLoading}
                                        aria-label={`Enter ${num}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button onClick={handleClear} disabled={isLoading} className="h-14 bg-[var(--danger-secondary)]/50 text-[var(--danger-primary)] font-mono text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-[var(--danger-secondary)]/80 disabled:opacity-50" aria-label="Clear PIN">CLR</button>
                                <button onClick={() => handleNumClick('0')} disabled={isLoading} className="h-14 bg-[var(--border-primary)] text-[var(--text-primary)] font-['Black_Ops_One'] text-xl border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-[var(--border-secondary)] transition-all disabled:opacity-50" aria-label="Enter 0">0</button>
                                <button onClick={handleLogin} disabled={isLoading || pin.length !== 5} className="h-14 bg-[var(--accent-primary)] text-black font-mono font-bold text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 hover:brightness-110 disabled:bg-[var(--border-primary)] disabled:text-[var(--text-muted)] disabled:translate-y-0 disabled:border-b-0 transition-all" aria-label="Submit PIN">{isLoading ? '...' : 'ENT'}</button>
                            </div>

                            <button 
                                onClick={() => setMode('request')}
                                className="w-full py-2 text-center text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors underline"
                            >
                                Request_Security_Clearance
                            </button>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-300">
                             {!requestSubmitted ? (
                                <form onSubmit={handleSubmitRequest} className="space-y-4">
                                    <h2 className="text-[var(--text-primary)] font-['Black_Ops_One'] text-lg text-center uppercase mb-4">Clearance Application</h2>
                                    <div>
                                        <label htmlFor="req-name" className="block text-[10px] text-[var(--accent-primary)] font-mono uppercase mb-1">Operative Name</label>
                                        <input 
                                            id="req-name"
                                            type="text" 
                                            value={requestName}
                                            onChange={e => setRequestName(e.target.value)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] p-2 text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-primary)] outline-none"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="req-reason" className="block text-[10px] text-[var(--accent-primary)] font-mono uppercase mb-1">Mission Objective</label>
                                        <textarea 
                                            id="req-reason"
                                            value={requestReason}
                                            onChange={e => setRequestReason(e.target.value)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] p-2 text-[var(--text-primary)] font-mono uppercase focus:border-[var(--accent-primary)] outline-none h-24"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setMode('login')}
                                            className="flex-1 py-3 bg-[var(--border-primary)] text-[var(--text-primary)] font-mono text-xs border-b-2 border-black hover:bg-[var(--border-secondary)] uppercase disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <Button type="submit" disabled={isLoading || !requestName || !requestReason} className="flex-1 !py-3 !text-xs">
                                            {isLoading ? "Submitting..." : "Submit"}
                                        </Button>
                                    </div>
                                </form>
                             ) : (
                                 <div className="text-center py-8">
                                     <div className="mb-4 text-[var(--accent-primary)]">
                                        <Gear className="h-12 w-12 mx-auto animate-spin" />
                                     </div>
                                     <p className="text-[var(--text-primary)] font-mono uppercase text-sm mb-2">Request Transmitted</p>
                                     <p className="text-[var(--text-muted)] text-xs font-mono">Status: Pending Admin Approval.</p>
                                     <button 
                                        onClick={() => { setMode('login'); setRequestSubmitted(false); }}
                                        className="mt-6 text-[var(--accent-primary)] text-xs font-mono underline uppercase"
                                     >
                                        Return to Gate
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
                
                <div className="bg-[var(--bg-input)] p-2 border-t-2 border-[var(--border-primary)] flex justify-between text-[8px] font-mono text-[var(--text-muted)] uppercase">
                    <span>Sys_Ver: 6.0.0-PROD</span>
                    <span>Iron Media Security</span>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;