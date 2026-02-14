import { useTheme } from '../context/ThemeContext';
import { X, Trash2, Clock, AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import type { AuditHistoryItem } from '../types';

interface AuditHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: AuditHistoryItem[];
    onClearHistory: () => void;
    onSelectAudit?: (item: AuditHistoryItem) => void;
}

export function AuditHistoryModal({ isOpen, onClose, history, onClearHistory, onSelectAudit }: AuditHistoryModalProps) {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    const getSeverityColor = (score: number) => {
        if (score >= 80) return isDark ? 'text-solana-green' : 'text-green-600';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getSeverityBg = (score: number) => {
        if (score >= 80) return isDark ? 'bg-solana-green/10' : 'bg-green-50';
        if (score >= 60) return 'bg-yellow-500/10';
        if (score >= 40) return 'bg-orange-500/10';
        return 'bg-red-500/10';
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`relative w-full max-w-lg max-h-[80vh] rounded-3xl border overflow-hidden flex flex-col ${isDark
                    ? 'bg-dark-surface border-dark-border shadow-2xl shadow-black/50'
                    : 'bg-white border-light-border shadow-2xl shadow-zinc-200/80'
                    }`}
                style={{ animation: 'modalSlideIn 0.3s ease-out' }}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-solana-purple/10' : 'bg-solana-purple/5'}`} />
                </div>

                {/* Header */}
                <div className={`relative px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <div>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Audit History</h2>
                        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {history.length} audit{history.length !== 1 ? 's' : ''} recorded
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {history.length > 0 && (
                            <button
                                onClick={onClearHistory}
                                className={`p-1.5 rounded-lg transition-all text-red-400 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
                                title="Clear all history"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={onClose} className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="relative flex-1 overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                                <Clock className={`w-8 h-8 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} />
                            </div>
                            <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                No Audits Yet
                            </h3>
                            <p className={`text-xs text-center max-w-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                Your audit history will appear here once you run your first smart contract scan.
                            </p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectAudit?.(item)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${isDark
                                        ? 'bg-white/[0.02] border-dark-border hover:bg-white/5 hover:border-zinc-700'
                                        : 'bg-zinc-50/50 border-light-border hover:bg-zinc-50 hover:border-zinc-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Score Badge */}
                                        <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${getSeverityBg(item.securityScore)}`}>
                                            <span className={`text-lg font-bold leading-none ${getSeverityColor(item.securityScore)}`}>
                                                {item.securityScore}
                                            </span>
                                            <span className={`text-[8px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                score
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                    {formatDate(item.timestamp)}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-white/5 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                                    {item.totalIssues} issue{item.totalIssues !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            {/* Code Preview */}
                                            <div className={`text-[11px] font-mono truncate mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                {item.codeSnippet}
                                            </div>

                                            {/* Issue Breakdown */}
                                            <div className="flex items-center gap-2">
                                                {item.critical > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-red-500">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {item.critical}
                                                    </span>
                                                )}
                                                {item.high > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-orange-500">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {item.high}
                                                    </span>
                                                )}
                                                {item.medium > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-yellow-500">
                                                        <Shield className="w-3 h-3" />
                                                        {item.medium}
                                                    </span>
                                                )}
                                                {item.safe > 0 && (
                                                    <span className={`flex items-center gap-0.5 text-[10px] ${isDark ? 'text-solana-green' : 'text-green-600'}`}>
                                                        <Shield className="w-3 h-3" />
                                                        {item.safe}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
