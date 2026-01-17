import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { generateGrokChatResponse } from '../services/grokService';
import { Send, User, XIcon } from './common/Icons';
import Spinner from './common/Spinner';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useMountedState } from '../hooks/useMountedState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProviderKeyPrompt from './common/ProviderKeyPrompt';

const GrokChatPanel: React.FC = () => {
  const [messages, setMessages] = useLocalStorage<Message[]>('im_chat_history_grok', [
    { id: '1', text: "Grok online. What do you want?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useMountedState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { apiKey, isKeyRequired, isReady, saveKey, resetKey } = useApiKeyManager('grok');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading || !apiKey) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botTypingMessage: Message = { id: (Date.now() + 1).toString(), text: '', sender: 'bot', isTyping: true };
    setMessages(prev => [...prev, botTypingMessage]);

    try {
      const response = await generateGrokChatResponse(input, apiKey);
      const botMessage: Message = { id: (Date.now() + 2).toString(), text: response, sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
    } catch (error) {
      const errorMessageText = error instanceof Error ? error.message : 'Something broke. Surprise.';
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message.toLowerCase().includes('authentication'))) {
        resetKey();
      }
      const errorMessage: Message = { id: (Date.now() + 2).toString(), text: `Error: ${errorMessageText}`, sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiKey, setMessages, setIsLoading, resetKey]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="Waking up Grok..." /></div>;
  }
  
  if (isKeyRequired) {
    return <div className="max-w-3xl mx-auto pt-10"><ProviderKeyPrompt provider="grok" onKeySubmit={saveKey} /></div>;
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-[#0A0B0C] border-x-2 border-grok-magenta/30 p-4 sm:p-6 shadow-[0_0_40px_rgba(217,70,239,0.15)]">
       <div className="flex-shrink-0 mb-4 pb-4 border-b-2 border-grok-magenta/20 flex items-center gap-4">
         <XIcon className="h-6 w-6 text-grok-magenta animate-pulse"/>
         <h3 className="text-xl font-black text-white uppercase tracking-widest font-['Black_Ops_One']">// GROK_CONDUIT_ONLINE</h3>
       </div>

       <div className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-8 pb-4 scrollbar-thin scrollbar-thumb-grok-magenta">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-2 sm:p-3 bg-grok-magenta rounded-full shadow-lg mt-1">
                <XIcon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            )}
            <div className={`relative max-w-[85%] sm:max-w-lg ${ msg.sender === 'user' ? 'text-white' : 'text-gray-300' }`}>
              {msg.isTyping ? (
                <div className="p-4 bg-industrial-gray/50 border border-grok-magenta/20"><Spinner text="Thinking..." /></div>
              ) : (
                <p className={`p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${msg.sender === 'user' ? 'bg-[#222] text-right' : 'bg-industrial-gray/50'}`}>
                  {msg.text}
                </p>
              )}
            </div>
            {msg.sender === 'user' && (
              <div className="mt-1 p-2 sm:p-3 bg-white/10 rounded-full">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t-2 border-grok-magenta/20">
        <div className="flex items-center bg-black p-2 border-2 border-transparent focus-within:border-grok-magenta transition-colors">
          <span className="pl-2 pr-4 font-mono text-grok-magenta text-sm sm:text-base">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask something..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 text-sm sm:text-base"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 sm:p-4 bg-grok-magenta text-black hover:bg-white disabled:bg-industrial-gray disabled:text-gray-600 transition-colors"
          >
            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrokChatPanel;