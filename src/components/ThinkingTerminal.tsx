import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Terminal, Brain } from 'lucide-react';
import type { ThinkingStep } from '../types';

interface ThinkingTerminalProps {
  steps: ThinkingStep[];
  isComplete: boolean;
}

export function ThinkingTerminal({ steps, isComplete }: ThinkingTerminalProps) {
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const getTypeColor = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'error': return isDark ? 'text-red-400' : 'text-red-600';
      case 'warning': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'success': return isDark ? 'text-solana-green' : 'text-green-600';
      case 'thinking': return isDark ? 'text-solana-purple' : 'text-solana-purple';
      default: return isDark ? 'text-zinc-400' : 'text-zinc-500';
    }
  };

  const getTypeBg = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'error': return isDark ? 'bg-red-500/5 border-l-2 border-red-500/30' : 'bg-red-50 border-l-2 border-red-300';
      case 'warning': return isDark ? 'bg-yellow-500/5 border-l-2 border-yellow-500/30' : 'bg-yellow-50 border-l-2 border-yellow-300';
      case 'thinking': return isDark ? 'bg-solana-purple/5 border-l-2 border-solana-purple/30' : 'bg-purple-50 border-l-2 border-purple-300';
      default: return '';
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-xl overflow-hidden border ${isDark ? 'border-dark-border bg-dark-bg' : 'border-light-border bg-white'}`}>
      {/* Terminal Header */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-zinc-50'}`}>
        <div className="relative">
          <Brain className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-solana-purple'} ${!isComplete ? 'animate-pulse' : ''}`} />
        </div>
        <span className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          AI Reasoning Engine
        </span>
        {!isComplete && (
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-solana-green/10 text-solana-green' : 'bg-solana-purple/10 text-solana-purple'}`}>
            THINKING...
          </span>
        )}
        {isComplete && (
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
            ISSUES FOUND
          </span>
        )}
      </div>

      {/* Terminal Body */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-1.5">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex gap-3 px-2 py-1.5 rounded text-xs font-mono ${getTypeBg(step.type)} transition-all`}
            style={{
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <span className={`shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {step.timestamp}
            </span>
            <span className={`${getTypeColor(step.type)} break-all`}>
              {step.text}
            </span>
          </div>
        ))}

        {/* Cursor */}
        {!isComplete && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Terminal className={`w-3 h-3 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
            <span className={`w-2 h-4 ${isDark ? 'bg-solana-green' : 'bg-solana-purple'} cursor-blink`} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
