import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { generateGrokChatResponse } from '../services/grokService';
import { Send, User, XIcon } from './common/Icons';
import Spinner from './common/Spinner';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';
import { useAppContext } from '../context/AppContext';

const GrokChatPanel: React.FC = () => {
  const [messages, setMessages] = useLocalStorage<Message[]>('im_chat_history_grok', [
    { id: '1', text: "GROK_CONDUIT ACTIVE. UNFILTERED INTEL STREAM ENGAGED. WHAT'S THE MISSION?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useMountedState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isKeyRequired, isReady, saveKey } = useApiKeyManager('grok');
  const { handleApiError } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botTypingMessage: Message = { id: (Date.now() + 1).toString(), text: '', sender: 'bot', isTyping: true };
    setMessages(prev => [...prev, botTypingMessage]);

    try {
      const response = await generateGrokChatResponse(input);
      const botMessage: Message = { id: (Date.now() + 2).toString(), text: response.toUpperCase(), sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
    } catch (error) {
      handleApiError(error, 'grok');
      const errorMessageText = error instanceof Error ? error.message : 'SIGNAL LOST. PROBABLY SOMETHING BORING.';
      const errorMessage: Message = { id: (Date.now() + 2).toString(), text: `ERROR_LOG: ${errorMessageText.toUpperCase()}`, sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, setMessages, setIsLoading, handleApiError]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="AWAKENING GROK_CORE..." /></div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10 px-4"><ProviderKeyPrompt provider="grok" onKeySubmit={saveKey} /></div>;
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto control-panel p-0 overflow-hidden relative border-4 border-industrial-gray shadow-[0_0_40px_rgba(0,0,0,0.8)]">
       {/* Industrial Overlay Texture */}
       <div className="absolute inset-0 pointer-events-none blueprint-grid opacity-20"></div>
       <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-black/5 to-black/20"></div>

       <div className="flex-shrink-0 p-4 sm:p-6 bg-black border-b-4 border-industrial-gray flex items-center justify-between z-10">
         <div className="flex items-center gap-4">
           <div className="p-2 bg-heavy-yellow border-2 border-black">
              <XIcon className="h-6 w-6 text-black"/>
           </div>
           <div className="flex flex-col">
             <h3 className="text-xl sm:text-2xl font-['Black_Ops_One'] text-white uppercase tracking-tighter">Grok_Conduit_V2</h3>
             <span className="text-[10px] font-mono text-heavy-yellow tracking-[0.3em] font-black uppercase">Unfiltered_Input // Site_Secure</span>
           </div>
         </div>
         <div className="hidden sm:flex gap-1">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="h-4 w-1 bg-heavy-yellow/20"></div>
           ))}
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-thin z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-2 bg-black border-2 border-heavy-yellow rounded-none shadow-[0_0_10px_rgba(255,211,0,0.3)] mt-1">
                <XIcon className="h-5 w-5 text-heavy-yellow" />
              </div>
            )}
            <div className={`relative group ${msg.sender === 'user' ? 'w-full max-w-md' : 'w-full max-w-2xl'}`}>
              <div className={`absolute -inset-0.5 ${msg.sender === 'user' ? 'bg-white/10' : 'bg-heavy-yellow/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              {msg.isTyping ? (
                <div className="p-4 bg-industrial-gray/20 border-2 border-industrial-gray backdrop-blur-sm">
                  <Spinner text="DECODING REALITY..." />
                </div>
              ) : (
                <div className={`p-5 sm:p-6 text-sm sm:text-base leading-relaxed border-2 relative ${
                  msg.sender === 'user' 
                    ? 'bg-industrial-gray border-white/20 text-white text-right font-bold' 
                    : 'bg-black/80 border-industrial-gray text-heavy-yellow font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
                }`}>
                  <div className={`absolute top-0 ${msg.sender === 'user' ? 'right-0' : 'left-0'} w-8 h-1 bg-heavy-yellow`}></div>
                  <p className="uppercase tracking-tight">{msg.text}</p>
                  {msg.sender === 'bot' && (
                    <div className="mt-4 pt-2 border-t border-heavy-yellow/10 text-[9px] text-gray-600 flex justify-between uppercase">
                      <span>Ref: X-Corp_Neural_Link</span>
                      <span>TS: {new Date().toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto p-4 sm:p-6 bg-black border-t-4 border-industrial-gray z-10">
        <div className="flex items-center bg-asphalt border-4 border-industrial-gray focus-within:border-heavy-yellow transition-all duration-300 shadow-2xl group relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-heavy-yellow opacity-50 group-focus-within:w-2 transition-all"></div>
          <span className="pl-4 pr-2 font-mono text-heavy-yellow text-xl font-black">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT COMMAND TO GROK_CORE..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-800 text-sm sm:text-base font-mono uppercase tracking-widest py-4 sm:py-6"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 sm:p-6 bg-heavy-yellow text-black hover:bg-white active:scale-95 disabled:bg-industrial-gray disabled:text-gray-700 transition-all"
          >
            <Send className="h-6 w-6 sm:h-8 w-8" />
          </button>
        </div>
        <div className="mt-2 flex justify-between">
           <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Connection: Direct_Satellite_Encrypted</p>
           <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">System_Policy: Unfiltered</p>
        </div>
      </div>
    </div>
  );
};

export default GrokChatPanel;