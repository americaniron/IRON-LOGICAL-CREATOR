import React, { useState, useCallback, useContext } from 'react';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { generateTheme } from '../services/geminiService';
import { LogSeverity } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import WorkbenchHeader from './common/WorkbenchHeader';
import { Palette } from './common/Icons';

interface Theme {
  name: string;
  indigo: string;
  slate: string;
  mauve: string;
  violet: string;
  cyan: string;
  light: string;
  gray: string;
}

const defaultTheme: Theme = {
  name: 'AURA Default',
  indigo: '#05050A',
  slate: '#0F1016',
  mauve: '#2E324A',
  violet: '#D946EF',
  cyan: '#00E0FF',
  light: '#FFFFFF',
  gray: '#94A3B8',
};

const THEME_STORAGE_KEY = 'AURA_CUSTOM_THEME';

const ThemePanel: React.FC = () => {
  const { logOperation, notify } = useContext(SystemStatusContext);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTheme, setGeneratedTheme] = useState<Theme | null>(null);

  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--aura-indigo', theme.indigo);
    root.style.setProperty('--aura-slate', theme.slate);
    root.style.setProperty('--aura-mauve', theme.mauve);
    root.style.setProperty('--aura-violet', theme.violet);
    root.style.setProperty('--aura-cyan', theme.cyan);
    root.style.setProperty('--aura-light', theme.light);
    root.style.setProperty('--aura-gray', theme.gray);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, []);

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedTheme(null);
    notify("Generating new UI theme...", "info");
    const startTime = Date.now();

    try {
      const themeData = await generateTheme(prompt);
      if (!themeData.name) {
          throw new Error("AI did not return a valid theme object. Please try a different prompt.");
      }
      setGeneratedTheme(themeData);
      logOperation({
        message: `Theme generated: ${themeData.name}`,
        severity: LogSeverity.INFO,
        provider: 'iron',
        latency: Date.now() - startTime
      });
    } catch (err: any) {
      const msg = err.message || "Failed to generate theme.";
      setError(msg);
      logOperation({ message: `Theme generation failed: ${msg}`, severity: LogSeverity.ERROR, provider: 'iron' });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, logOperation, notify]);
  
  const handleApply = () => {
    if (generatedTheme) {
      applyTheme(generatedTheme);
      notify(`Theme "${generatedTheme.name}" applied successfully!`, "success");
    }
  };

  const handleReset = () => {
    applyTheme(defaultTheme);
    localStorage.removeItem(THEME_STORAGE_KEY);
    setGeneratedTheme(null);
    notify("Theme reset to default AURA.", "info");
  };

  const ColorSwatch = ({ name, color }: { name: string; color: string }) => (
    <div className="flex items-center justify-between p-3 bg-aura-indigo border border-aura-mauve rounded-md">
      <span className="text-sm font-body text-aura-gray capitalize">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-body text-aura-light">{color}</span>
        <div className="w-6 h-6 rounded-sm border border-aura-light" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full space-y-8">
      <WorkbenchHeader title="Theme Studio" station="UI_CORE" />

      <div className="control-panel p-8">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-heading uppercase tracking-widest text-aura-cyan mb-2">
              Theme Directive
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your desired theme, e.g., 'a warm solar punk theme with orange and cream' or 'a cold, brutalist interface with stark red highlights'."
              rows={4}
              className="w-full px-4 py-3 bg-aura-indigo border border-aura-mauve rounded-sm text-aura-light focus:outline-none transition-colors text-sm focus-ring"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            <Palette className="h-5 w-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
          {error && <p className="text-red-400 text-center font-body text-sm mt-4">{error}</p>}
        </form>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner text="Analyzing Aesthetics..." />
        </div>
      )}

      {generatedTheme && (
        <div className="control-panel p-8 animate-in fade-in-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="font-heading text-xl text-aura-light">Generated Theme: <span className="text-aura-violet">{generatedTheme.name}</span></h3>
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="danger" size="sm">Reset to Default</Button>
              <Button onClick={handleApply} variant="primary" size="sm">Apply Theme</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorSwatch name="Background" color={generatedTheme.indigo} />
            <ColorSwatch name="Panels" color={generatedTheme.slate} />
            <ColorSwatch name="Borders" color={generatedTheme.mauve} />
            <ColorSwatch name="Primary Accent" color={generatedTheme.violet} />
            <ColorSwatch name="Secondary Accent" color={generatedTheme.cyan} />
            <ColorSwatch name="Primary Text" color={generatedTheme.light} />
            <ColorSwatch name="Secondary Text" color={generatedTheme.gray} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePanel;
