import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { GasOptimization } from '../types';

interface GasOptimizerProps {
  optimizations: GasOptimization[];
}

export function GasOptimizer({ optimizations }: GasOptimizerProps) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-dark-border bg-dark-card' : 'border-light-border bg-white'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${isDark ? 'hover:bg-white/3' : 'hover:bg-zinc-50'}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-solana-green/10' : 'bg-green-50'}`}>
          <Zap className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-green-600'}`} />
        </div>
        <div className="flex-1 text-left">
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            ⚡ Compute Unit Optimizer
          </h3>
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {optimizations.length} optimization suggestions found
          </p>
        </div>
        {expanded ? (
          <ChevronUp className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        )}
      </button>

      {expanded && (
        <div className={`border-t ${isDark ? 'border-dark-border' : 'border-light-border'} p-4 space-y-3`}>
          {optimizations.map((opt) => (
            <div key={opt.id} className={`p-3 rounded-lg ${isDark ? 'bg-white/3' : 'bg-zinc-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {opt.title}
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-solana-green/10 text-solana-green' : 'bg-green-50 text-green-600'}`}>
                  {opt.estimatedSaving}
                </span>
              </div>
              <p className={`text-[11px] mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {opt.description}
              </p>
              <pre className={`text-[10px] font-mono p-2 rounded overflow-x-auto ${isDark ? 'bg-dark-bg text-solana-green/80' : 'bg-white text-green-700 border border-green-100'}`}>
                {opt.suggestion}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
