import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Task } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { Send, User, Bot, Download } from './common/Icons';
import Spinner from './common/Spinner';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';

const SUGGESTIONS = ["ANALYZE PRODUCTION", "GENERATE STORYBOARD", "CALIBRATE WORKFLOW"];

const ChatPanel: React.FC = () => {
  const { chatHistories, addMessage } = useAppContext();
  const messages = chatHistories[Task.Chat] || [];
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

    await addMessage(Task.Chat, { id: Date.now().toString(), text: textToSend, sender: 'user' });
    setInput('');
    setIsLoading(true);

    await addMessage(Task.Chat, { id: (Date.now() + 1).toString(), text: '', sender: 'bot', isTyping: true });

    try {
      const response = await generateChatResponse(textToSend);
      await addMessage(Task.Chat, { id: (Date.now() + 2).toString(), text: response.toUpperCase(), sender: 'bot' });
    } catch (error) {
      await addMessage(Task.Chat, { id: (Date.now() + 2).toString(), text: 'CRITICAL ERROR: SIGNAL LOST. RETRY COMM LINK.', sender: 'bot' });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addMessage, setIsLoading]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto control-panel p-3 sm:p-6 relative">
       <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-20">
          <button 
            onClick={handleExport}
            className="p-1.5 sm:p-2 bg-[var(--border-primary)] border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black transition-all group"
            title="Export Field Report"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto pr-1 sm:pr-4 space-y-6 sm:space-y-8 pb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-1.5 sm:p-3 bg-[var(--accent-primary)] border-2 border-[var(--border-secondary)] rounded-sm shadow-lg shrink-0">
                <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
              </div>
            )}
            <div className={`relative max-w-[85%] sm:max-w-lg p-3.5 sm:p-5 border-2 ${
              msg.sender === 'user' 
                ? 'bg-[var(--border-primary)] border-[var(--accent-primary)] text-[var(--text-primary)]' 
                : 'bg-[var(--bg-input)] border-[var(--border-primary)] text-[var(--accent-primary)] font-mono'
            }`}>
              <div className="rivet absolute -top-1.5 -left-1.5 hidden sm:block"></div>
              <div className="rivet absolute -bottom-1.5 -right-1.5 hidden sm:block"></div>
              {msg.isTyping ? <Spinner text="PROCESSING..." /> : <p className="leading-relaxed font-bold tracking-tight uppercase text-[10px] sm:text-xs md:text-sm">{msg.text}</p>}
            </div>
            {msg.sender === 'user' && (
              <div className="p-1.5 sm:p-3 bg-[var(--bg-tertiary)] border-2 border-[var(--border-secondary)] rounded-sm shadow-lg shrink-0">
                <User className="h-4 w-4 sm:h-6 sm:w-6 text-[var(--text-primary)]" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 sm:mt-8 pt-3 sm:pt-6 border-t-2 sm:border-t-4 border-[var(--border-primary)] shrink-0">
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => handleSend(s)}
                className="text-[8px] sm:text-[10px] font-mono border border-[var(--border-primary)] px-2 py-1 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors uppercase whitespace-nowrap"
              >
                > {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center bg-[var(--bg-input)] border-2 border-[var(--border-primary)] p-0.5 sm:p-1 focus-within:border-[var(--accent-primary)] transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT COMMAND..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] font-mono placeholder-[var(--text-muted)] px-3 sm:px-6 uppercase text-[10px] sm:text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 sm:p-4 bg-[var(--accent-primary)] text-black hover:bg-yellow-300 disabled:bg-[var(--border-primary)] disabled:text-[var(--text-muted)] transition-colors shrink-0"
          >
            <Send className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;