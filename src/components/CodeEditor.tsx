import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Editor, { loader } from '@monaco-editor/react';
import { Play, Upload, Copy, Check, Trash2, Code2 } from 'lucide-react';
import { SAMPLE_CODE } from '../data/sampleCode';

// Configure Monaco loader
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAudit: () => void;
  isAuditing: boolean;
  fileName?: string;
}

export function CodeEditor({ code, onCodeChange, onAudit, isAuditing, fileName }: CodeEditorProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Define custom Solana Dark theme
    monaco.editor.defineTheme('solana-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272A4' },
        { token: 'keyword', foreground: 'FF79C6' },
        { token: 'string', foreground: 'F1FA8C' },
        { token: 'number', foreground: 'BD93F9' },
        { token: 'type', foreground: '8BE9FD' },
      ],
      colors: {
        'editor.background': '#09090B', // matches --color-dark-bg
        'editor.foreground': '#F8F8F2',
        'editorCursor.foreground': '#14F195', // solana-green
        'editor.lineHighlightBackground': '#1E1E22',
        'editorLineNumber.foreground': '#6272A4',
        'editor.selectionBackground': '#9945FF40', // solana-purple with opacity
      },
    });

    // Define custom Solana Light theme
    monaco.editor.defineTheme('solana-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#FFFFFF',
        'editorCursor.foreground': '#9945FF', // solana-purple
        'editor.lineHighlightBackground': '#F4F4F5',
        'editor.selectionBackground': '#14F19540',
      },
    });
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const loadSample = useCallback(() => {
    onCodeChange(SAMPLE_CODE);
  }, [onCodeChange]);

  return (
    <div className="flex flex-col h-full bg-inherit">
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-zinc-50'}`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>
            <Code2 className="w-3 h-3" />
            {fileName || 'program.rs'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadSample}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${isDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/5'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
          >
            <Upload className="w-3 h-3" />
            Sample
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${isDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/5'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
          >
            {copied ? <Check className="w-3 h-3 text-solana-green" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => onCodeChange('')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${isDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/5'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          defaultLanguage="rust"
          language="rust"
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          theme={isDark ? 'solana-dark' : 'solana-light'}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "all",
          }}
          loading={
            <div className={`flex items-center justify-center h-full text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Loading Editor...
            </div>
          }
        />
      </div>

      {/* Audit Button */}
      <div className={`p-4 border-t shrink-0 ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-zinc-50'}`}>
        <button
          onClick={onAudit}
          disabled={isAuditing || !code.trim()}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isDark
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
