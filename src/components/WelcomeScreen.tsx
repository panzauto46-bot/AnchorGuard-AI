import { useTheme } from '../context/ThemeContext';
import { Shield, Brain, Code, Zap, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onLoadSample: () => void;
}

export function WelcomeScreen({ onLoadSample }: WelcomeScreenProps) {
  const { isDark } = useTheme();

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'Transparent AI Reasoning',
      description: 'Watch the AI think through each vulnerability with full chain-of-thought reasoning.',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Vulnerability Detection',
      description: 'Detect critical issues like missing signer checks, overflow risks, and reentrancy attacks.',
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: 'Auto-Fix & Diff View',
      description: 'Get instant code fixes with side-by-side comparison of vulnerable vs. secure code.',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Compute Unit Optimizer',
      description: 'Optimize your Solana program for lower compute costs and better performance.',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {/* Hero */}
      <div className="relative mb-8">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDark ? 'bg-solana-green/10 glow-green' : 'bg-solana-purple/10 glow-purple'}`}>
          <Shield className={`w-10 h-10 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
        </div>
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${isDark ? 'bg-solana-purple' : 'bg-solana-green'} pulse-glow`} />
      </div>

      <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        AI Intelligence Zone
      </h2>
      <p className={`text-sm max-w-md mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        Paste your Solana/Anchor smart contract on the left and click{' '}
        <span className={`font-semibold ${isDark ? 'text-solana-green' : 'text-solana-purple'}`}>"Run AI Audit"</span>{' '}
        to begin the analysis.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mb-8">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              isDark
                ? 'bg-dark-card border border-dark-border hover:border-solana-green/20'
                : 'bg-zinc-50 border border-light-border hover:border-solana-purple/30'
            }`}
          >
            <div className={`shrink-0 mt-0.5 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`}>
              {f.icon}
            </div>
            <div>
              <h3 className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {f.title}
              </h3>
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <button
        onClick={onLoadSample}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isDark
            ? 'bg-solana-green/10 text-solana-green border border-solana-green/20 hover:bg-solana-green/20'
            : 'bg-solana-purple/10 text-solana-purple border border-solana-purple/20 hover:bg-solana-purple/20'
        }`}
      >
        Try with Sample Contract
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
