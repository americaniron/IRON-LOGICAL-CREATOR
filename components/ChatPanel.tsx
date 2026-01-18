import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { Send, User, Bot, Download } from './common/Icons';
import Spinner from './common/Spinner';
import { useMountedState } from '../hooks/useMountedState';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SUGGESTIONS = ["ANALYZE PRODUCTION EFFICIENCY", "GENERATE STORYBOARD FOR SCI-FI SHORT", "CALIBRATE MULTIMEDIA WORKFLOW"];

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useLocalStorage<Message[]>('im_chat_history_gemini', [
    { id: '1', text: "OPERATIONS ONLINE. LOGGING IN AS COMMANDER. STATE YOUR FABRICATION REQUIREMENTS.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useMountedState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExport = () => {
    const log = messages.map(m => `[${m.sender.toUpperCase()}] ${m.text}`).join('\n\n');
    const blob = new Blob([`IRON MEDIA - FIELD REPORT\nGENERATED: ${new Date().toISOString()}\n\n${log}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IM-FIELD-REPORT-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = useCallback(async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (textToSend.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botTypingMessage: Message = { id: (Date.now() + 1).toString(), text: '', sender: 'bot', isTyping: true };
    setMessages(prev => [...prev, botTypingMessage]);

    try {
      const response = await generateChatResponse(textToSend);
      const botMessage: Message = { id: (Date.now() + 2).toString(), text: response.toUpperCase(), sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMessage));
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 2).toString(), text: 'CRITICAL ERROR: SIGNAL LOST. RETRY COMM LINK.', sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, setMessages, setIsLoading]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto control-panel p-4 sm:p-6 relative">
       <div className="absolute top-4 right-6 z-20">
          <button 
            onClick={handleExport}
            className="p-2 bg-industrial-gray border border-heavy-yellow/30 text-heavy-yellow hover:bg-heavy-yellow hover:text-black transition-all group"
            title="Export Field Report"
          >
            <Download className="h-5 w-5" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-8 pb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-2 sm:p-3 bg-heavy-yellow border-2 border-black rounded-sm shadow-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            )}
            <div className={`relative max-w-[85%] sm:max-w-lg p-4 sm:p-5 border-2 ${
              msg.sender === 'user' 
                ? 'bg-industrial-gray border-heavy-yellow text-white' 
                : 'bg-asphalt border-industrial-gray text-heavy-yellow font-mono'
            }`}>
              <div className="rivet absolute -top-1.5 -left-1.5"></div>
              <div className="rivet absolute -bottom-1.5 -right-1.5"></div>
              {msg.isTyping ? <Spinner text="PROCESSING DATA..." /> : <p className="leading-relaxed font-bold tracking-tight uppercase text-xs sm:text-sm">{msg.text}</p>}
            </div>
            {msg.sender === 'user' && (
              <div className="p-2 sm:p-3 bg-white border-2 border-black rounded-sm shadow-lg">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t-4 border-industrial-gray">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => handleSend(s)}
                className="text-[10px] font-mono border border-industrial-gray px-2 py-1 hover:border-heavy-yellow hover:text-heavy-yellow transition-colors uppercase"
              >
                > {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center bg-asphalt border-2 border-industrial-gray p-1 focus-within:border-heavy-yellow transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT COMMAND OR COORDINATES..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder-gray-700 px-4 sm:px-6 uppercase text-xs sm:text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-3 sm:p-4 bg-heavy-yellow text-black hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
          >
            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;