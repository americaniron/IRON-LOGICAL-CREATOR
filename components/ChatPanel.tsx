import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Message, Task, LogSeverity } from '../types';
import { AssetContext } from '../contexts/AssetProvider';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { generateChatStream } from '../services/geminiService';
import { Send, User, Bot, Image, Video } from './common/Icons';
import Spinner from './common/Spinner';
import Input from './common/Input';
import Button from './common/Button';

interface MessageWithSources extends Message {
  sources?: any[];
}

const ChatPanel: React.FC = () => {
  const { setPipe } = useContext(AssetContext);
  const { logOperation, notify } = useContext(SystemStatusContext);

  const [messages, setMessages] = useState<MessageWithSources[]>([
    { id: '1', text: "AURA Core Interface online. Awaiting your directive.", sender: 'bot' }
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

    const startTime = Date.now();
    const userMessage: MessageWithSources = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: MessageWithSources = { id: botMessageId, text: '', sender: 'bot', isStreaming: true, sources: [] };
    setMessages(prev => [...prev, botMessage]);

    let fullText = "";
    let accumulatedSources: any[] = [];

    try {
      const stream = generateChatStream(input);
      for await (const chunk of stream) {
        fullText += (chunk.text || "");
        if (chunk.groundingChunks && chunk.groundingChunks.length > 0) {
          accumulatedSources = [...accumulatedSources, ...chunk.groundingChunks];
        }

        setMessages(prev => prev.map(m => m.id === botMessageId ? { 
          ...m, 
          text: fullText,
          sources: accumulatedSources.length > 0 ? Array.from(new Set(accumulatedSources.map(s => JSON.stringify(s)))).map(s => JSON.parse(s)) : []
        } : m));
      }
      setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, isStreaming: false } : m));
      
      logOperation({
        message: `Chat Session Complete: ${input.substring(0, 20)}...`,
        severity: LogSeverity.INFO,
        provider: 'iron',
        latency: Date.now() - startTime
      });
    } catch (error: any) {
      const errorMessageText = 'Connection error. Please check network and try again.';
      setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: errorMessageText, isStreaming: false } : m));
      
      logOperation({
        message: `Chat Fault: ${error.message || 'Unknown'}`,
        severity: LogSeverity.ERROR,
        provider: 'iron',
        latency: Date.now() - startTime
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, logOperation, notify]);

  const pipeToGenerator = (text: string, task: Task) => {
    setPipe(text);
    window.location.hash = `#/${task}`;
  };

  const copyIntel = (text: string) => {
    navigator.clipboard.writeText(text);
    notify("Response copied to clipboard", "success");
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto control-panel p-4 md:p-6 shadow-2xl">
       <div className="flex-1 overflow-y-auto pr-1 md:pr-4 space-y-6 md:space-y-8 pb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2 md:gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="p-2 md:p-2.5 bg-aura-violet rounded-full shadow-lg shrink-0">
                <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            )}
            <div className={`relative max-w-[85%] sm:max-w-xl group ${
              msg.sender === 'user' 
                ? 'bg-aura-mauve/50 rounded-lg rounded-br-none' 
                : 'bg-aura-slate rounded-lg rounded-bl-none'
            }`}>
              <div className="px-4 py-3">
              {msg.isTyping ? <Spinner text="THINKING..." /> : (
                <>
                  <div className="prose prose-sm prose-invert text-aura-light whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text + (msg.isStreaming ? '▍' : '') }}></div>
                  
                  {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                    <div className="mt-4 pt-3 border-t border-aura-mauve/50 space-y-2">
                      <p className="text-[10px] text-aura-gray font-body uppercase tracking-widest">Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, idx) => (
                          source.web && (
                            <a 
                              key={idx} 
                              href={source.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-aura-indigo border border-aura-mauve/50 px-2 py-1 rounded-md text-[10px] font-body hover:border-aura-cyan hover:text-aura-cyan transition-all flex items-center gap-2 group/cite"
                            >
                              <span className="text-aura-cyan group-hover/cite:text-aura-light">[{idx + 1}]</span>
                              <span className="truncate max-w-[150px]">{source.web.title || 'Web Result'}</span>
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.sender === 'bot' && !msg.isStreaming && msg.text.length > 10 && (
                    <div className="mt-4 flex flex-wrap gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => copyIntel(msg.text)}
                        className="flex items-center gap-1.5 text-[10px] font-body bg-aura-mauve/50 hover:bg-aura-mauve text-aura-light px-2 py-1 rounded-md transition-all uppercase"
                      >
                        Copy
                      </button>
                      <button 
                        onClick={() => pipeToGenerator(msg.text, Task.TextToImage)}
                        className="flex items-center gap-1.5 text-[10px] font-body bg-aura-mauve/50 hover:bg-aura-mauve text-aura-light px-2 py-1 rounded-md transition-all uppercase"
                      >
                        <Image className="h-3 w-3" /> Pipe to Image
                      </button>
                      <button 
                        onClick={() => pipeToGenerator(msg.text, Task.TextToVideo)}
                        className="flex items-center gap-1.5 text-[10px] font-body bg-aura-mauve/50 hover:bg-aura-mauve text-aura-light px-2 py-1 rounded-md transition-all uppercase"
                      >
                        <Video className="h-3 w-3" /> Pipe to Video
                      </button>
                    </div>
                  )}
                </>
              )}
              </div>
            </div>
            {msg.sender === 'user' && (
              <div className="p-2 md:p-2.5 bg-aura-light rounded-full shadow-lg shrink-0">
                <User className="h-4 w-4 md:h-5 md:w-5 text-aura-slate" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 pt-4 border-t border-aura-mauve/50">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-start gap-2"
        >
          <div className="flex-1">
            <Input
              label="Input Command"
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder="Enter your directive..."
              disabled={isLoading}
              className="!uppercase-off"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            variant="primary"
            className="!p-3.5"
            size="md"
            throttleMs={500}
          >
            <Send className="h-6 w-6" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
