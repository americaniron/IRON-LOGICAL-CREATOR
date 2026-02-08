import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Task } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { Send, User, Bot, Download } from './common/Icons';
import Spinner from './common/Spinner';
import { useMountedState } from '../hooks/useMountedState';
import { useAppContext } from '../context/AppContext';

const SUGGESTIONS = ["Explain quantum computing", "Write a short story", "Plan a 3-day trip"];

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
    const blob = new Blob([`Chat Log\nGenerated: ${new Date().toISOString()}\n\n${log}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-log-${Date.now()}.txt`;
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
      await addMessage(Task.Chat, { id: (Date.now() + 2).toString(), text: response, sender: 'bot' });
    } catch (error) {
      await addMessage(Task.Chat, { id: (Date.now() + 2).toString(), text: 'Error: Could not get a response.', sender: 'bot' });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addMessage, setIsLoading]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
       <div className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-6 sm:space-y-8 pb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-2 bg-[var(--accent-primary)] rounded-full shadow-lg shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            <div className={`w-full max-w-lg p-3 sm:p-4 rounded-xl ${
              msg.sender === 'user' 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}>
              {msg.isTyping ? <Spinner /> : <p className="leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{msg.text}</p>}
            </div>
             {msg.sender === 'user' && (
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-full shadow-lg shrink-0">
                <User className="h-5 w-5 text-[var(--text-primary)]" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-4 shrink-0">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => handleSend(s)}
                className="text-xs border border-[var(--border-primary)] px-3 py-1.5 rounded-full text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-1 focus-within:border-[var(--accent-primary)] focus-within:ring-2 focus-within:ring-[var(--accent-primary)]/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3 sm:px-4 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 sm:p-3 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-secondary)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] transition-colors shrink-0"
            aria-label="Send message"
          >
            {isLoading ? <Spinner /> : <Send className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;