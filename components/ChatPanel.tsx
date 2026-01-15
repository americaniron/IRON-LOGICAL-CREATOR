
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { Send, User, Bot } from './common/Icons';
import Spinner from './common/Spinner';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "OPERATIONS ONLINE. LOGGING IN AS COMMANDER. STATE YOUR FABRICATION REQUIREMENTS.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await generateChatResponse(input);
      const botMessage: Message = { id: (Date.now() + 2).toString(), text: response.toUpperCase(), sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 2).toString(), text: 'CRITICAL ERROR: SIGNAL LOST. RETRY COMM LINK.', sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto industrial-grid p-6">
      <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-3 bg-[#EBB700] border-2 border-black rounded-sm shadow-lg">
                <Bot className="h-6 w-6 text-black" />
              </div>
            )}
            <div className={`relative max-w-lg p-5 border-2 ${
              msg.sender === 'user' 
                ? 'bg-[#2D2E30] border-[#EBB700] text-white' 
                : 'bg-black border-[#3F4042] text-[#EBB700] font-mono'
            }`}>
              <div className="rivet absolute -top-1 -left-1"></div>
              <div className="rivet absolute -bottom-1 -right-1"></div>
              {msg.isTyping ? <Spinner text="PROCESSING DATA..." /> : <p className="leading-relaxed font-bold tracking-tight uppercase text-sm">{msg.text}</p>}
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
      <div className="mt-8 pt-6 border-t-4 border-[#2D2E30]">
        <div className="flex items-center bg-black border-2 border-[#3F4042] p-1 focus-within:border-[#EBB700] transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT COMMAND OR COORDINATES..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder-gray-700 px-6 uppercase text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 bg-[#EBB700] text-black hover:bg-[#D4A500] disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
