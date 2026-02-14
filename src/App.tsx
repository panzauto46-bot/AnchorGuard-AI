import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider_ } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';
import { ThinkingTerminal } from './components/ThinkingTerminal';
import { AuditDashboard } from './components/AuditDashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SAMPLE_CODE } from './data/sampleCode';
import { generateThinkingTrace, auditSmartContract } from './services/ai';
import type { ThinkingStep, AuditResult } from './types';
import { Layers, Brain, FileSearch } from 'lucide-react';

type Phase = 'idle' | 'thinking' | 'results';
type RightTab = 'welcome' | 'thinking' | 'results';

function AppContent() {
  const { isDark } = useTheme();
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [rightTab, setRightTab] = useState<RightTab>('welcome');
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [thinkingComplete, setThinkingComplete] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  /* AI Service Integration */
  const [error, setError] = useState<string | null>(null);

  const handleAudit = useCallback(async () => {
    if (!code.trim()) return;

    setError(null);
    setPhase('thinking');
    setRightTab('thinking');
    setThinkingSteps([]);
    setThinkingComplete(false);
    setAuditResult(null);

    try {
      // 1. Start Groq Thinking Trace (Speed Layer)
      setThinkingSteps([{ id: 0, text: "🔄 Initializing hybrid AI engine...", type: "info", timestamp: new Date().toLocaleTimeString() }]);

      const thoughts = await generateThinkingTrace(code);

      // Simulate typing effect for thoughts
      thoughts.forEach((thought, index) => {
        setTimeout(() => {
          setThinkingSteps(prev => [
            ...prev,
            {
              id: prev.length + 1,
              text: `🔍 ${thought}`,
              type: 'thinking',
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
        }, index * 800);
      });

      // 2. Start Gemini Deep Audit (Brain Layer)
      // Note: If API key is missing, this will throw an error caught below
      const result = await auditSmartContract(code);

      // Buffer time to let thoughts finish animating
      const minThinkTime = thoughts.length * 800 + 1500;

      setTimeout(() => {
        setThinkingComplete(true);
        setAuditResult(result);

        // Auto switch to results
        setTimeout(() => {
          setPhase('results');
          setRightTab('results');
        }, 1200);
      }, minThinkTime);

    } catch (err: any) {
      console.error("Audit Failed:", err);
      // Fallback error handling
      setThinkingSteps(prev => [...prev, {
        id: 999,
        text: `❌ ERROR: ${err.message || "Audit failed. Please check API Keys."}`,
        type: "error",
        timestamp: new Date().toLocaleTimeString()
      }]);
      setThinkingComplete(true); // Stop spinner
    }
  }, [code]);

  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_CODE);
  }, []);

  const isAuditing = phase === 'thinking';

  const tabs: { key: RightTab; label: string; icon: React.ReactNode; available: boolean }[] = [
    { key: 'welcome', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" />, available: true },
    { key: 'thinking', label: 'AI Reasoning', icon: <Brain className="w-3.5 h-3.5" />, available: thinkingSteps.length > 0 },
    { key: 'results', label: 'Results', icon: <FileSearch className="w-3.5 h-3.5" />, available: auditResult !== null },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <Header />
      <LoginModal />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Sidebar (Input Zone) */}
        <Sidebar
          code={code}
          setCode={setCode}
          handleAudit={handleAudit}
          isAuditing={isAuditing}
        />

        {/* Right Panel: Intelligence Zone */}
        <div className="w-full lg:w-1/2 flex flex-col" style={{ minHeight: '400px' }}>
          {/* Panel Header with Tabs */}
          <div className={`flex items-center gap-1 px-4 py-2 border-b ${isDark ? 'border-dark-border bg-dark-surface/50' : 'border-light-border bg-zinc-50/50'}`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${isDark ? 'bg-solana-purple' : 'bg-solana-green'}`} />
            <span className={`text-xs font-semibold mr-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              INTELLIGENCE ZONE
            </span>
            <div className="flex items-center gap-0.5 ml-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => tab.available && setRightTab(tab.key)}
                  disabled={!tab.available}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${rightTab === tab.key
                    ? isDark
                      ? 'bg-white/10 text-white'
                      : 'bg-zinc-200 text-zinc-900'
                    : tab.available
                      ? isDark
                        ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                      : isDark
                        ? 'text-zinc-700 cursor-not-allowed'
                        : 'text-zinc-300 cursor-not-allowed'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === 'thinking' && isAuditing && (
                    <span className="w-1.5 h-1.5 rounded-full bg-solana-green animate-pulse" />
                  )}
                  {tab.key === 'results' && auditResult && (
                    <span className={`text-[9px] px-1 rounded ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                      {auditResult.summary.totalIssues}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto p-4">
            {rightTab === 'welcome' && (
              <WelcomeScreen onLoadSample={handleLoadSample} />
            )}
            {rightTab === 'thinking' && (
              <ThinkingTerminal steps={thinkingSteps} isComplete={thinkingComplete} />
            )}
            {rightTab === 'results' && auditResult && (
              <AuditDashboard result={auditResult} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`border-t py-2 px-4 flex items-center justify-between text-[10px] ${isDark ? 'border-dark-border bg-dark-surface/50 text-zinc-600' : 'border-light-border bg-zinc-50/50 text-zinc-400'
        }`}>
        <span>
          AnchorGuard AI v0.1.0 — The AI-Powered Reasoning Auditor for Solana Smart Contracts
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-solana-green' : 'bg-green-500'}`} />
            Engine Ready
          </span>
          <span>Solana Mainnet</span>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider_>
        <AppContent />
      </AuthProvider_>
    </ThemeProvider>
  );
}
