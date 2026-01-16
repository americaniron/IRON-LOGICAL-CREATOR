import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { generateOpenAIChatResponse } from '../services/openAIService';
import { Send, User, BrainCircuit } from './common/Icons';
import Spinner from './common/Spinner';
import { useOpenAiKey } from '../hooks/useOpenAiKey';
import OpenAiKeyPrompt from './common/OpenAiKeyPrompt';

const OpenAIChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "GUEST SYSTEM ONLINE. GPT-CLASS LANGUAGE MODEL READY FOR COMMANDS.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { apiKey, isReady, saveApiKey } = useOpenAiKey();

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
      const response = await generateOpenAIChatResponse(input, apiKey);
      const botMessage: Message = { id: (Date.now() + 2).toString(), text: response.toUpperCase(), sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
    } catch (error) {
      const errorMessageText = error instanceof Error ? error.message.toUpperCase() : 'UNKNOWN GUEST SYSTEM FAILURE.';
      const errorMessage: Message = { id: (Date.now() + 2).toString(), text: `CRITICAL ERROR: ${errorMessageText}`, sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiKey]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="INITIALIZING GUEST SYSTEMS..." /></div>;
  }
  
  if (!apiKey) {
    return <div className="max-w-3xl mx-auto pt-10"><OpenAiKeyPrompt onKeySubmit={saveApiKey} /></div>;
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto control-panel p-6 border-2 border-guest-green/20">
       <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-4 scrollbar-thin scrollbar-thumb-guest-green">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-3 bg-guest-green border-2 border-black rounded-sm shadow-lg">
                <BrainCircuit className="h-6 w-6 text-black" />
              </div>
            )}
            <div className={`relative max-w-lg p-5 border-2 ${
              msg.sender === 'user' 
                ? 'bg-industrial-gray border-guest-green text-white' 
                : 'bg-asphalt border-industrial-gray text-guest-green font-mono'
            }`}>
              <div className="rivet absolute -top-1.5 -left-1.5"></div>
              <div className="rivet absolute -bottom-1.5 -right-1.5"></div>
              {msg.isTyping ? <Spinner text="PROCESSING..." /> : <p className="leading-relaxed font-bold tracking-tight uppercase text-sm">{msg.text}</p>}
            </div>
            {msg.sender === 'user' && (
              <div className="p-3 bg-white border-2 border-black rounded-sm shadow-lg">
                <User className="h-6 w-6 text-black" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-8 pt-6 border-t-4 border-industrial-gray">
        <div className="flex items-center bg-asphalt border-2 border-industrial-gray p-1 focus-within:border-guest-green transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT COMMAND TO GUEST SYSTEM..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder-gray-700 px-6 uppercase text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 bg-guest-green text-black hover:bg-green-300 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenAIChatPanel;
