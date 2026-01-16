import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { generateGrokChatResponse } from '../services/grokService';
import { Send, User, XIcon } from './common/Icons';
import Spinner from './common/Spinner';
import { useGrokKey } from '../hooks/useGrokKey';
import GrokKeyPrompt from './common/GrokKeyPrompt';

const GrokChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Grok online. What do you want?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { apiKey, isReady, saveApiKey } = useGrokKey();

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
      const errorMessage: Message = { id: (Date.now() + 2).toString(), text: `Error: ${errorMessageText}`, sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiKey]);

  if (!isReady) {
    return <div className="flex items-center justify-center h-full"><Spinner text="Waking up Grok..." /></div>;
  }
  
  if (!apiKey) {
    return <div className="max-w-3xl mx-auto pt-10"><GrokKeyPrompt onKeySubmit={saveApiKey} /></div>;
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto control-panel p-6 border-2 border-grok-magenta/20">
       <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-4 scrollbar-thin scrollbar-thumb-grok-magenta">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-3 bg-grok-magenta border-2 border-black rounded-sm shadow-lg">
                <XIcon className="h-6 w-6 text-black" />
              </div>
            )}
            <div className={`relative max-w-lg p-5 border-2 ${
              msg.sender === 'user' 
                ? 'bg-industrial-gray border-grok-magenta text-white' 
                : 'bg-asphalt border-industrial-gray text-grok-magenta font-mono'
            }`}>
              <div className="rivet absolute -top-1.5 -left-1.5"></div>
              <div className="rivet absolute -bottom-1.5 -right-1.5"></div>
              {msg.isTyping ? <Spinner text="Thinking..." /> : <p className="leading-relaxed font-bold tracking-tight text-sm">{msg.text}</p>}
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
        <div className="flex items-center bg-asphalt border-2 border-industrial-gray p-1 focus-within:border-grok-magenta transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask something..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder-gray-700 px-6 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 bg-grok-magenta text-black hover:bg-fuchsia-400 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrokChatPanel;
