import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from './UserMenu';
import { Shield, Sun, Moon, Github, LogIn } from 'lucide-react';

interface HeaderProps {
  onOpenProfile?: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
}

export function Header({ onOpenProfile, onOpenHistory, onOpenSettings }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, openLoginModal } = useAuth();

  return (
    <header className={`relative z-20 border-b ${isDark ? 'border-dark-border bg-dark-surface/80' : 'border-light-border bg-light-surface/80'} backdrop-blur-xl`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-solana-green/10' : 'bg-solana-purple/10'}`}>
              <Shield className={`w-5 h-5 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
            </div>
            <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-solana-green' : 'bg-solana-purple'} pulse-glow`} />
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Anchor<span className={isDark ? 'text-solana-green' : 'text-solana-purple'}>Guard</span>{' '}
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isDark ? 'bg-solana-purple/20 text-solana-purple' : 'bg-solana-purple/10 text-solana-purple'}`}>AI</span>
            </h1>
            <p className={`text-[10px] tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Reasoning Auditor for Solana
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* GitHub Repo Link */}
          <button className={`p-2 rounded-lg transition-all ${isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
            <Github className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${isDark ? 'text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Divider */}
          <div className={`hidden sm:block w-px h-6 mx-1 ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />

          {/* Auth Section */}
          {user ? (
            <UserMenu
              onOpenProfile={onOpenProfile}
              onOpenHistory={onOpenHistory}
              onOpenSettings={onOpenSettings}
            />
          ) : (
            <button
              onClick={openLoginModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isDark
                ? 'bg-gradient-to-r from-solana-green/20 to-solana-purple/20 text-white border border-solana-green/20 hover:from-solana-green/30 hover:to-solana-purple/30 hover:shadow-lg hover:shadow-solana-green/10'
                : 'bg-gradient-to-r from-solana-purple/10 to-solana-green/10 text-solana-purple border border-solana-purple/20 hover:from-solana-purple/15 hover:to-solana-green/15 hover:shadow-lg hover:shadow-solana-purple/10'
                }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
