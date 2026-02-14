import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, BarChart3, Settings, ChevronDown, Wallet, Crown } from 'lucide-react';

function GoogleSmallIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GithubSmallIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

interface UserMenuProps {
  onOpenProfile?: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
}

export function UserMenu({ onOpenProfile, onOpenHistory, onOpenSettings }: UserMenuProps) {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const providerIcon = user.provider === 'google'
    ? <GoogleSmallIcon />
    : user.provider === 'github'
      ? <GithubSmallIcon />
      : <Wallet className="w-3 h-3" />;

  const providerColor = user.provider === 'google'
    ? 'text-blue-500'
    : user.provider === 'github'
      ? isDark ? 'text-white' : 'text-zinc-900'
      : 'text-solana-purple';

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${isDark
          ? 'hover:bg-white/5 border border-dark-border'
          : 'hover:bg-zinc-50 border border-light-border'
          } ${open ? isDark ? 'bg-white/5' : 'bg-zinc-50' : ''}`}
      >
        {/* Avatar */}
        <div className={`relative w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${user.provider === 'google'
          ? 'bg-blue-500/15 text-blue-500'
          : user.provider === 'github'
            ? isDark ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-700'
            : 'bg-solana-purple/15 text-solana-purple'
          }`}>
          {initials}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center ${isDark ? 'bg-dark-surface' : 'bg-white'
            }`}>
            <div className={providerColor}>{providerIcon}</div>
          </div>
        </div>

        <div className="hidden sm:block text-left">
          <div className={`text-xs font-semibold leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {user.name}
          </div>
          <div className={`text-[10px] leading-tight ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {user.walletAddress || user.email}
          </div>
        </div>

        <ChevronDown className={`w-3 h-3 transition-transform ${isDark ? 'text-zinc-500' : 'text-zinc-400'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border overflow-hidden ${isDark
            ? 'bg-dark-surface border-dark-border shadow-2xl shadow-black/50'
            : 'bg-white border-light-border shadow-xl shadow-zinc-200/80'
            }`}
          style={{ animation: 'dropdownIn 0.2s ease-out' }}
        >
          {/* User Info Header */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${user.provider === 'google'
                ? 'bg-blue-500/15 text-blue-500'
                : user.provider === 'github'
                  ? isDark ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-700'
                  : 'bg-solana-purple/15 text-solana-purple'
                }`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {user.name}
                </div>
                <div className={`text-xs truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {user.walletAddress || user.email}
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className={`flex items-center gap-4 mt-3 px-1`}>
              <div className="flex items-center gap-1.5">
                <BarChart3 className={`w-3 h-3 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{user.auditsCount}</strong> audits
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Crown className={`w-3 h-3 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Free tier
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <button
              onClick={() => { onOpenProfile?.(); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${isDark ? 'text-zinc-300 hover:bg-white/5' : 'text-zinc-700 hover:bg-zinc-50'
                }`}>
              <UserIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Profile</span>
            </button>
            <button
              onClick={() => { onOpenHistory?.(); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${isDark ? 'text-zinc-300 hover:bg-white/5' : 'text-zinc-700 hover:bg-zinc-50'
                }`}>
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">Audit History</span>
            </button>
            <button
              onClick={() => { onOpenSettings?.(); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${isDark ? 'text-zinc-300 hover:bg-white/5' : 'text-zinc-700 hover:bg-zinc-50'
                }`}>
              <Settings className="w-4 h-4" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className={`border-t py-1.5 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <button
              onClick={() => { logout(); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${isDark ? 'text-red-400 hover:bg-red-500/5' : 'text-red-600 hover:bg-red-50'
                }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
