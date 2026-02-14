import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Play, Upload, Copy, Check, Trash2 } from 'lucide-react';
import { SAMPLE_CODE } from '../data/sampleCode';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAudit: () => void;
  isAuditing: boolean;
}

export function CodeEditor({ code, onCodeChange, onAudit, isAuditing }: CodeEditorProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = code.split('\n').length;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const loadSample = useCallback(() => {
    onCodeChange(SAMPLE_CODE);
  }, [onCodeChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      onCodeChange(value.substring(0, start) + '    ' + value.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  }, [onCodeChange]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-zinc-50'}`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className={`text-xs font-mono ml-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            program.rs
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadSample}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Upload className="w-3 h-3" />
            Sample
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {copied ? <Check className="w-3 h-3 text-solana-green" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => onCodeChange('')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto relative code-editor">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className={`select-none text-right pr-4 pl-4 py-4 text-xs font-mono leading-6 ${
            isDark ? 'text-zinc-600 bg-dark-bg/50' : 'text-zinc-300 bg-zinc-50/50'
          }`} style={{ minWidth: '3.5rem' }}>
            {Array.from({ length: Math.max(lineCount, 30) }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>

          {/* Code textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="// Paste your Solana/Anchor smart contract here...&#10;// Or click 'Sample' to load a demo contract."
            className={`flex-1 resize-none outline-none py-4 pr-4 text-xs font-mono leading-6 ${
              isDark
                ? 'bg-dark-bg text-zinc-300 placeholder-zinc-600 caret-solana-green'
                : 'bg-white text-zinc-800 placeholder-zinc-400 caret-solana-purple'
            }`}
          />
        </div>
      </div>

      {/* Audit Button */}
      <div className={`p-4 border-t ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-zinc-50'}`}>
        <button
          onClick={onAudit}
          disabled={isAuditing || !code.trim()}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            isDark
              ? 'bg-solana-green text-dark-bg hover:shadow-lg hover:shadow-solana-green/20 glow-green-strong'
              : 'bg-solana-purple text-white hover:shadow-lg hover:shadow-solana-purple/30'
          } ${isAuditing ? 'animate-pulse' : ''}`}
        >
          <Play className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          {isAuditing ? 'AI Reasoning in Progress...' : '🧠 Run AI Audit'}
        </button>
      </div>
    </div>
  );
}
