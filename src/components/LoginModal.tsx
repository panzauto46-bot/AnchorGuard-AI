import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Loader2, Check, ChevronRight, Fingerprint, Sparkles } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { AuthProvider } from '../types';

// SVG icons for providers
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 00-1-1H5a2 2 0 00-2 2v14a2 2 0 002 2h13a1 1 0 001-1v-3" />
      <path d="M21 12a2 2 0 00-2-2h-4a2 2 0 00-2 2v0a2 2 0 002 2h4a2 2 0 002-2v0z" />
    </svg>
  );
}

interface LoginOptionProps {
  provider: AuthProvider;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  hoverBg: string;
  borderColor: string;
  isLoading: boolean;
  loadingProvider: AuthProvider | null;
  onLogin: (provider: AuthProvider) => void;
}

function LoginOption({ provider, icon, title, subtitle, accentColor, hoverBg, borderColor, isLoading, loadingProvider, onLogin }: LoginOptionProps) {
  const { isDark } = useTheme();
  const isThisLoading = isLoading && loadingProvider === provider;
  const isOtherLoading = isLoading && loadingProvider !== provider;

  return (
    <button
      onClick={() => onLogin(provider)}
      disabled={isLoading}
      className={`group relative w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isThisLoading
        ? `${borderColor} ${hoverBg} scale-[0.98]`
        : isOtherLoading
          ? isDark
            ? 'border-dark-border bg-dark-card/50 opacity-40 cursor-not-allowed'
            : 'border-light-border bg-zinc-50/50 opacity-40 cursor-not-allowed'
          : isDark
            ? `border-dark-border bg-dark-card hover:${hoverBg} hover:${borderColor} hover:scale-[1.02]`
            : `border-light-border bg-white hover:${hoverBg} hover:${borderColor} hover:scale-[1.02]`
        }`}
    >
      {/* Icon */}
      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${isThisLoading ? hoverBg : isDark ? 'bg-white/5' : 'bg-zinc-100'
        }`}>
        {isThisLoading ? (
          <Loader2 className={`w-5 h-5 animate-spin ${accentColor}`} />
        ) : (
          <div className={`w-6 h-6 ${accentColor}`}>{icon}</div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {isThisLoading ? 'Connecting...' : title}
        </div>
        <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {isThisLoading ? `Authenticating with ${title.split(' ')[2] || title}...` : subtitle}
        </div>
      </div>

      {/* Arrow / Check */}
      {!isLoading && (
        <ChevronRight className={`w-4 h-4 transition-all ${isDark ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-300 group-hover:text-zinc-500'} group-hover:translate-x-0.5`} />
      )}
      {isThisLoading && (
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')} animate-pulse`} style={{ animationDelay: '0ms' }} />
          <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')} animate-pulse`} style={{ animationDelay: '200ms' }} />
          <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')} animate-pulse`} style={{ animationDelay: '400ms' }} />
        </div>
      )}

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${provider === 'google' ? 'shadow-[inset_0_0_30px_rgba(66,133,244,0.05)]' :
        provider === 'github' ? 'shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]' :
          'shadow-[inset_0_0_30px_rgba(153,69,255,0.05)]'
        }`} />
    </button>
  );
}

export function LoginModal() {
  const { isDark } = useTheme();
  const { isLoginModalOpen, closeLoginModal, login, isLoading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      setLoadingProvider(null);
      setShowSuccess(false);
    }
  }, [isLoginModalOpen]);

  const handleLogin = async (provider: AuthProvider) => {
    setLoadingProvider(provider);
    await login(provider);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      closeLoginModal();
    }, 600);
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? closeLoginModal : undefined}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-3xl border overflow-hidden ${isDark
          ? 'bg-dark-surface border-dark-border shadow-2xl shadow-black/50'
          : 'bg-white border-light-border shadow-2xl shadow-zinc-200/80'
          }`}
        style={{ animation: 'modalSlideIn 0.3s ease-out' }}
      >
        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="flex flex-col items-center gap-3" style={{ animation: 'scaleIn 0.3s ease-out' }}>
              <div className="w-16 h-16 rounded-full bg-solana-green/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-solana-green" />
              </div>
              <span className="text-white font-semibold">Connected!</span>
            </div>
          </div>
        )}

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-solana-purple/10' : 'bg-solana-purple/5'}`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-solana-green/10' : 'bg-solana-green/5'}`} />
        </div>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-solana-green/10' : 'bg-solana-purple/10'}`}>
                <Shield className={`w-5 h-5 ${isDark ? 'text-solana-green' : 'text-solana-purple'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Sign In
                </h2>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  to AnchorGuard AI
                </p>
              </div>
            </div>
            <button
              onClick={closeLoginModal}
              disabled={isLoading}
              className={`p-2 rounded-xl transition-all ${isDark
                ? 'text-zinc-500 hover:text-white hover:bg-white/5'
                : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                } disabled:opacity-30`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-6 ${isDark ? 'bg-solana-green/5 border border-solana-green/10' : 'bg-green-50 border border-green-100'
            }`}>
            <Fingerprint className={`w-4 h-4 ${isDark ? 'text-solana-green' : 'text-green-600'}`} />
            <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Secure authentication · Your data stays private
            </span>
            <Sparkles className={`w-3 h-3 ml-auto ${isDark ? 'text-solana-green/50' : 'text-green-400'}`} />
          </div>
        </div>

        {/* Login Options */}
        <div className="relative px-6 space-y-3">
          <LoginOption
            provider="google"
            icon={<GoogleIcon className="w-6 h-6" />}
            title="Continue with Google"
            subtitle="Use your Google account"
            accentColor="text-blue-500"
            hoverBg="bg-blue-500/5"
            borderColor="border-blue-500/20"
            isLoading={isLoading}
            loadingProvider={loadingProvider}
            onLogin={handleLogin}
          />

          <LoginOption
            provider="github"
            icon={<GithubIcon className="w-6 h-6" />}
            title="Continue with GitHub"
            subtitle="Recommended for developers"
            accentColor={isDark ? 'text-white' : 'text-zinc-900'}
            hoverBg={isDark ? 'bg-white/5' : 'bg-zinc-50'}
            borderColor={isDark ? 'border-white/10' : 'border-zinc-300'}
            isLoading={isLoading}
            loadingProvider={loadingProvider}
            onLogin={handleLogin}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className={`flex-1 h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />
            <span className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Web3
            </span>
            <div className={`flex-1 h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />
          </div>

          {/* Wallet Adapter Button */}
          <div className="w-full wallet-adapter-button-trigger">
            <WalletMultiButton style={{
              width: '100%',
              justifyContent: 'center',
              backgroundColor: isDark ? '#9945FF' : '#9945FF',
              height: '56px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600
            }} />
          </div>

        </div>

        {/* Footer */}
        <div className="relative px-6 py-5 mt-4">
          <p className={`text-[10px] text-center leading-relaxed ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            By signing in, you agree to our{' '}
            <span className={`underline cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
              Terms of Service
            </span>{' '}
            and{' '}
            <span className={`underline cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Bottom gradient accent */}
        <div className="h-1 gradient-border" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
