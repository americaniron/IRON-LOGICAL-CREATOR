import React, { useState, useCallback, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { generateChatResponse } from '../services/geminiService';
import { generateOpenAIChatResponse } from '../services/openAIService';
import { generateGrokChatResponse } from '../services/grokService';
import { LogSeverity } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';
import WorkbenchHeader from './common/WorkbenchHeader';
import { Bot, BrainCircuit, XIcon, Send } from './common/Icons';

interface ResultState {
  iron: { text: string; loading: boolean; error: string | null };
  guest: { text: string; loading: boolean; error: string | null };
  xcorp: { text: string; loading: boolean; error: string | null };
}

const ComparisonPanel: React.FC = () => {
  const { keys } = useContext(AuthContext);
  const { logOperation, notify } = useContext(SystemStatusContext);

  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<ResultState>({
    iron: { text: '', loading: false, error: null },
    guest: { text: '', loading: false, error: null },
    xcorp: { text: '', loading: false, error: null },
  });

  useEffect(() => {
    const handleHalt = () => {
      setResults({
        iron: { text: '', loading: false, error: 'HALTED_BY_OPERATOR' },
        guest: { text: '', loading: false, error: 'HALTED_BY_OPERATOR' },
        xcorp: { text: '', loading: false, error: 'HALTED_BY_OPERATOR' },
      });
    };
    window.addEventListener('emergency-halt', handleHalt);
    return () => window.removeEventListener('emergency-halt', handleHalt);
  }, []);

  const handleBroadcast = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setResults({
      iron: { text: '', loading: true, error: null },
      guest: { text: '', loading: !!keys.oai, error: keys.oai ? null : 'NO_CLEARANCE' },
      xcorp: { text: '', loading: !!keys.grok, error: keys.grok ? null : 'NO_CLEARANCE' },
    });

    notify("BROADCASTING_MULTIMODAL_SIGNAL", "info");

    const tasks = [
      (async () => {
        const start = Date.now();
        try {
          const res = await generateChatResponse(prompt);
          setResults(prev => ({ ...prev, iron: { text: res, loading: false, error: null } }));
          logOperation({ message: "Gemini_Comparison_Complete", severity: LogSeverity.INFO, provider: 'iron', latency: Date.now() - start });
        } catch (e: any) {
          setResults(prev => ({ ...prev, iron: { text: '', loading: false, error: e.message } }));
        }
      })(),
    ];

    if (keys.oai) {
      tasks.push((async () => {
        const start = Date.now();
        try {
          const res = await generateOpenAIChatResponse(prompt, keys.oai!);
          setResults(prev => ({ ...prev, guest: { text: res, loading: false, error: null } }));
          logOperation({ message: "OpenAI_Comparison_Complete", severity: LogSeverity.INFO, provider: 'guest', latency: Date.now() - start });
        } catch (e: any) {
          setResults(prev => ({ ...prev, guest: { text: '', loading: false, error: e.message } }));
        }
      })());
    }

    if (keys.grok) {
      tasks.push((async () => {
        const start = Date.now();
        try {
          const res = await generateGrokChatResponse(prompt, keys.grok!);
          setResults(prev => ({ ...prev, xcorp: { text: res, loading: false, error: null } }));
          logOperation({ message: "Grok_Comparison_Complete", severity: LogSeverity.INFO, provider: 'xcorp', latency: Date.now() - start });
        } catch (e: any) {
          setResults(prev => ({ ...prev, xcorp: { text: '', loading: false, error: e.message } }));
        }
      })());
    }

    await Promise.allSettled(tasks);
  }, [prompt, keys, logOperation, notify]);

  const copyIntelligenceReport = () => {
    const report = `
IRON MEDIA - MULTIMODAL INTELLIGENCE REPORT
-------------------------------------------
DIRECTIVE: ${prompt}
TIMESTAMP: ${new Date().toISOString()}

[IRON_CORE (GEMINI)]
${results.iron.text || (results.iron.error ? `ERROR: ${results.iron.error}` : 'NO DATA')}

[GUEST_SYNTH (OPENAI)]
${results.guest.text || (results.guest.error ? `ERROR: ${results.guest.error}` : 'NO DATA')}

[X-MOTION (GROK)]
${results.xcorp.text || (results.xcorp.error ? `ERROR: ${results.xcorp.error}` : 'NO DATA')}
-------------------------------------------
END OF REPORT
    `.trim();

    navigator.clipboard.writeText(report);
    notify("INTEL_REPORT_COPIED_TO_BUFFER", "success");
  };

  const ComparisonColumn = ({ title, provider, state, icon: Icon }: { title: string, provider: 'iron' | 'guest' | 'xcorp', state: ResultState[typeof provider], icon: React.FC<any> }) => (
    <div className={`flex flex-col h-full border-2 ${
      provider === 'iron' ? 'border-cyan-400/20' : 
      provider === 'guest' ? 'border-guest-green/20' : 'border-grok-magenta/20'
    } bg-black/40 p-4 relative`}>
      <div className="flex items-center gap-3 mb-4 border-b border-industrial-gray pb-3">
        <Icon className={`h-5 w-5 ${
          provider === 'iron' ? 'text-cyan-400' : 
          provider === 'guest' ? 'text-guest-green' : 'text-grok-magenta'
        }`} />
        <h4 className="font-['Black_Ops_One'] uppercase text-xs tracking-widest text-white">{title}</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed scrollbar-thin">
        {state.loading ? (
          <div className="h-full flex items-center justify-center opacity-40"><Spinner text="SYNCHRONIZING..." /></div>
        ) : state.error ? (
          <div className="text-red-500 bg-red-900/10 p-4 border border-red-900/50 italic">!! ${state.error.toUpperCase()} !!</div>
        ) : state.text ? (
          <div className="animate-in fade-in-0 duration-500 whitespace-pre-wrap">{state.text}</div>
        ) : (
          <div className="text-gray-800 italic uppercase">Awaiting_Broadcast...</div>
        )}
      </div>
      <div className="caution-stripes h-1 absolute bottom-0 left-0 right-0 opacity-10"></div>
    </div>
  );

  const hasAnyResult = results.iron.text || results.guest.text || results.xcorp.text;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <WorkbenchHeader title="Comparison Matrix" station="WAR_ROOM_01" provider="iron" />
        {hasAnyResult && (
          <Button onClick={copyIntelligenceReport} variant="primary" size="sm" className="!px-6">
            Copy Intel Report
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 flex-1 gap-6 min-h-0">
        <ComparisonColumn title="Iron_Core (Gemini)" provider="iron" state={results.iron} icon={Bot} />
        <ComparisonColumn title="Guest_Synth (OAI)" provider="guest" state={results.guest} icon={BrainCircuit} />
        <ComparisonColumn title="X-Motion (Grok)" provider="xcorp" state={results.xcorp} icon={XIcon} />
      </div>

      <div className="control-panel p-4 md:p-6 bg-[#1a1d23]/80 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={handleBroadcast} className="flex gap-4">
          <div className="flex-1">
            <Input 
              label="UNIVERSAL_DIRECTIVE" 
              id="compare-prompt" 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              placeholder="SEND ONE COMMAND TO ALL ACTIVE CONDUITS..."
            />
          </div>
          <Button type="submit" disabled={results.iron.loading || results.guest.loading || results.xcorp.loading} className="!px-10">
            <Send className="h-6 w-6 mr-2" /> Broadcast
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ComparisonPanel;