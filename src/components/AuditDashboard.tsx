import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Shield, AlertCircle, AlertTriangle, Info, Zap, TrendingDown, Download, FileText, Check } from 'lucide-react';
import type { AuditResult } from '../types';
import { VulnerabilityCard } from './VulnerabilityCard';
import { GasOptimizer } from './GasOptimizer';
import { downloadMarkdown, downloadPDF } from '../services/export';

interface AuditDashboardProps {
  result: AuditResult;
}

export function AuditDashboard({ result }: AuditDashboardProps) {
  const { isDark } = useTheme();
  const { summary } = result;
  const [exportedMd, setExportedMd] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);

  const scoreColor = summary.securityScore >= 80
    ? 'text-green-400'
    : summary.securityScore >= 50
      ? 'text-yellow-400'
      : 'text-red-400';

  const scoreRingColor = summary.securityScore >= 80
    ? '#22C55E'
    : summary.securityScore >= 50
      ? '#EAB308'
      : '#EF4444';

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (summary.securityScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className={`rounded-xl border p-4 ${isDark ? 'border-dark-border bg-dark-card' : 'border-light-border bg-white'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
          <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Audit Summary
          </h2>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => {
                downloadMarkdown(result);
                setExportedMd(true);
                setTimeout(() => setExportedMd(false), 2000);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${isDark
                ? 'text-zinc-400 hover:text-white hover:bg-white/10 border border-dark-border'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-light-border'
                }`}
              title="Export as Markdown"
            >
              {exportedMd ? <Check className="w-3 h-3 text-solana-green" /> : <FileText className="w-3 h-3" />}
              .md
            </button>
            <button
              onClick={() => {
                downloadPDF(result);
                setExportedPdf(true);
                setTimeout(() => setExportedPdf(false), 2000);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${isDark
                ? 'bg-solana-purple/20 text-solana-purple hover:bg-solana-purple/30 border border-solana-purple/30'
                : 'bg-solana-purple/10 text-solana-purple hover:bg-solana-purple/20 border border-solana-purple/20'
                }`}
              title="Export as PDF"
            >
              {exportedPdf ? <Check className="w-3 h-3 text-solana-green" /> : <Download className="w-3 h-3" />}
              PDF
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Security Score Circle */}
          <div className="relative shrink-0">
            <svg width="100" height="100" className="-rotate-90">
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={isDark ? '#1E1E22' : '#E4E4E7'}
                strokeWidth="6"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={scoreRingColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>{summary.securityScore}</span>
              <span className={`text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>/ 100</span>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <div>
                <div className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{summary.critical}</div>
                <div className={`text-[10px] ${isDark ? 'text-red-400/60' : 'text-red-500/60'}`}>Critical</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              <div>
                <div className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{summary.high}</div>
                <div className={`text-[10px] ${isDark ? 'text-orange-400/60' : 'text-orange-500/60'}`}>High</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
              <Info className="w-3.5 h-3.5 text-yellow-500" />
              <div>
                <div className={`text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{summary.medium}</div>
                <div className={`text-[10px] ${isDark ? 'text-yellow-400/60' : 'text-yellow-500/60'}`}>Medium</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-solana-green/10' : 'bg-green-50'}`}>
              <Zap className="w-3.5 h-3.5 text-solana-green" />
              <div>
                <div className={`text-lg font-bold ${isDark ? 'text-solana-green' : 'text-green-600'}`}>{summary.computeOptimizations}</div>
                <div className={`text-[10px] ${isDark ? 'text-solana-green/60' : 'text-green-500/60'}`}>Optimizations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Meter */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[10px] font-medium flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <TrendingDown className="w-3 h-3" />
              Overall Risk Level
            </span>
            <span className={`text-[10px] font-bold ${summary.securityScore < 50 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-yellow-400' : 'text-yellow-600')}`}>
              {summary.securityScore < 30 ? 'CRITICAL RISK' : summary.securityScore < 50 ? 'HIGH RISK' : summary.securityScore < 80 ? 'MODERATE RISK' : 'LOW RISK'}
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-border' : 'bg-zinc-200'}`}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${100 - summary.securityScore}%`,
                background: `linear-gradient(90deg, #EAB308, #F97316, #EF4444)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Vulnerability Cards */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          🔍 Detected Vulnerabilities ({result.vulnerabilities.length})
        </h3>
        {result.vulnerabilities.map((vuln, i) => (
          <VulnerabilityCard key={vuln.id} vuln={vuln} index={i} />
        ))}
      </div>

      {/* Gas Optimizations */}
      <GasOptimizer optimizations={result.gasOptimizations} />
    </div>
  );
}
