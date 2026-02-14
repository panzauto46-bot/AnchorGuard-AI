import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Calendar, Shield, Wallet, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    if (!isOpen || !user) return null;

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const providerLabel = user.provider === 'google' ? 'Google Account'
        : user.provider === 'github' ? 'GitHub Account'
            : 'Solana Wallet';

    const providerColor = user.provider === 'google' ? 'text-blue-500 bg-blue-500/10'
        : user.provider === 'github' ? isDark ? 'text-white bg-white/10' : 'text-zinc-900 bg-zinc-200'
            : 'text-solana-purple bg-solana-purple/10';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`relative w-full max-w-md rounded-3xl border overflow-hidden ${isDark
                    ? 'bg-dark-surface border-dark-border shadow-2xl shadow-black/50'
                    : 'bg-white border-light-border shadow-2xl shadow-zinc-200/80'
                    }`}
                style={{ animation: 'modalSlideIn 0.3s ease-out' }}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-solana-purple/10' : 'bg-solana-purple/5'}`} />
                    <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-solana-green/10' : 'bg-solana-green/5'}`} />
                </div>

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 flex items-center justify-between">
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Profile
                    </h2>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Avatar & Name */}
                <div className="relative px-6 pb-4 flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3 ${providerColor}`}>
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {user.name}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full mt-1 ${providerColor}`}>
                        {providerLabel}
                    </span>
                </div>

                {/* Info Cards */}
                <div className="relative px-6 pb-6 space-y-2">
                    {user.email && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                            <Mail className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                            <div className="flex-1 min-w-0">
                                <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Email</div>
                                <div className={`text-sm truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user.email}</div>
                            </div>
                        </div>
                    )}

                    {user.walletAddress && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                            <Wallet className={`w-4 h-4 ${isDark ? 'text-solana-purple' : 'text-solana-purple'}`} />
                            <div className="flex-1 min-w-0">
                                <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Wallet</div>
                                <div className={`text-sm truncate font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user.walletAddress}</div>
                            </div>
                            <a
                                href={`https://solscan.io/account/${user.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'}`}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}

                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                        <div className="flex-1">
                            <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Joined</div>
                            <div className={`text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{joinDate}</div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                        <Shield className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-green-600'}`} />
                        <div className="flex-1">
                            <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Audits Completed</div>
                            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user.auditsCount}</div>
                        </div>
                    </div>

                    {/* User ID */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                        <div className="flex-1 min-w-0">
                            <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>User ID</div>
                            <div className={`text-xs truncate font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{user.id}</div>
                        </div>
                        <button
                            onClick={handleCopyId}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'}`}
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-solana-green" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
