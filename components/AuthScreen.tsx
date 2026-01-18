
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import { Gear } from './common/Icons';

const AuthScreen: React.FC = () => {
    const { login, submitAccessRequest } = useAppContext();
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState<'login' | 'request'>('login');
    const [error, setError] = useState<string | null>(null);
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

    const handleLogin = () => {
        if (pin.length !== 5) {
            setError("INVALID FORMAT: 5 DIGITS REQUIRED");
            return;
        }
        const result = login(pin);
        if (!result.success) {
            setError(result.message || "ACCESS DENIED");
            setPin('');
        }
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if(!requestName || !requestReason) return;
        submitAccessRequest(requestName, requestReason);
        setRequestSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-asphalt flex items-center justify-center p-4">
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none"></div>
            
            <div className="relative w-full max-w-md bg-black border-4 border-industrial-gray shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* Header */}
                <div className="bg-heavy-yellow p-4 border-b-4 border-black flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Gear className="h-8 w-8 text-black animate-[spin_10s_linear_infinite]" />
                        <h1 className="text-2xl font-['Black_Ops_One'] text-black tracking-widest uppercase">SECURITY_GATE</h1>
                    </div>
                    <div className="h-3 w-3 bg-red-600 animate-pulse rounded-full border border-black"></div>
                </div>

                <div className="p-8">
                    {mode === 'login' ? (
                        <>
                            <div className="mb-8 text-center">
                                <p className="text-heavy-yellow font-mono text-xs uppercase tracking-[0.3em] mb-2">RESTRICTED ACCESS AREA</p>
                                <div className="h-16 bg-asphalt border-2 border-industrial-gray flex items-center justify-center gap-4 mb-2 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-4 w-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-heavy-yellow shadow-[0_0_8px_#FFD300]' : 'bg-industrial-gray'}`}></div>
                                    ))}
                                </div>
                                {error && <p className="text-red-500 font-mono text-xs font-bold animate-pulse">{error}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumClick(num.toString())}
                                        className="h-14 bg-industrial-gray text-white font-['Black_Ops_One'] text-xl border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-gray-700 transition-all"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button onClick={handleClear} className="h-14 bg-red-900/50 text-red-500 font-mono text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-red-900/80">CLR</button>
                                <button onClick={() => handleNumClick('0')} className="h-14 bg-industrial-gray text-white font-['Black_Ops_One'] text-xl border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-gray-700">0</button>
                                <button onClick={handleLogin} className="h-14 bg-heavy-yellow text-black font-mono font-bold text-xs border-b-4 border-black active:border-b-0 active:translate-y-1 hover:bg-yellow-400">ENT</button>
                            </div>

                            <button 
                                onClick={() => setMode('request')}
                                className="w-full py-2 text-center text-[10px] font-mono text-gray-500 uppercase tracking-widest hover:text-white transition-colors underline"
                            >
                                Request_Security_Clearance
                            </button>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-300">
                             {!requestSubmitted ? (
                                <form onSubmit={handleSubmitRequest} className="space-y-4">
                                    <h2 className="text-white font-['Black_Ops_One'] text-lg text-center uppercase mb-4">Clearance Application</h2>
                                    <div>
                                        <label className="block text-[10px] text-heavy-yellow font-mono uppercase mb-1">Operative Name</label>
                                        <input 
                                            type="text" 
                                            value={requestName}
                                            onChange={e => setRequestName(e.target.value)}
                                            className="w-full bg-asphalt border border-industrial-gray p-2 text-white font-mono uppercase focus:border-heavy-yellow outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-heavy-yellow font-mono uppercase mb-1">Mission Objective</label>
                                        <textarea 
                                            value={requestReason}
                                            onChange={e => setRequestReason(e.target.value)}
                                            className="w-full bg-asphalt border border-industrial-gray p-2 text-white font-mono uppercase focus:border-heavy-yellow outline-none h-24"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setMode('login')}
                                            className="flex-1 py-3 bg-industrial-gray text-white font-mono text-xs border-b-2 border-black hover:bg-gray-700 uppercase"
                                        >
                                            Cancel
                                        </button>
                                        <Button type="submit" className="flex-1 !py-3 !text-xs">
                                            Submit
                                        </Button>
                                    </div>
                                </form>
                             ) : (
                                 <div className="text-center py-8">
                                     <div className="mb-4 text-heavy-yellow">
                                        <Gear className="h-12 w-12 mx-auto animate-spin" />
                                     </div>
                                     <p className="text-white font-mono uppercase text-sm mb-2">Request Transmitted</p>
                                     <p className="text-gray-500 text-xs font-mono">Status: Pending Admin Approval.</p>
                                     <button 
                                        onClick={() => { setMode('login'); setRequestSubmitted(false); }}
                                        className="mt-6 text-heavy-yellow text-xs font-mono underline uppercase"
                                     >
                                        Return to Gate
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
                
                {/* Footer Deco */}
                <div className="bg-asphalt p-2 border-t-2 border-industrial-gray flex justify-between text-[8px] font-mono text-gray-600 uppercase">
                    <span>Sys_Ver: 5.3.1</span>
                    <span>Iron Media Security</span>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
