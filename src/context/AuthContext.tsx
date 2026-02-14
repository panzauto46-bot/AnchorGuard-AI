import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { User, AuthProvider } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (provider: AuthProvider) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated user data per provider (fallback for Google/GitHub)
const MOCK_USERS: Record<string, Omit<User, 'joinedAt'>> = {
  google: {
    id: 'ggl-' + Math.random().toString(36).slice(2, 10),
    name: 'Solana Developer',
    email: 'dev@solana.builder',
    avatar: '',
    provider: 'google',
    auditsCount: 12,
  },
  github: {
    id: 'gh-' + Math.random().toString(36).slice(2, 10),
    name: 'anchor_hacker',
    email: 'anchor_hacker@github.dev',
    avatar: '',
    provider: 'github',
    auditsCount: 37,
  },
};

export function AuthProvider_({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Real Solana Wallet Adapter Hook
  const { connected, publicKey, disconnect } = useWallet();

  // Effect: Sync Wallet Status to Auth State
  useEffect(() => {
    if (connected && publicKey) {
      // Real Wallet Connected -> Auto Login
      setUser({
        id: publicKey.toBase58(),
        name: 'Solana Wallet',
        provider: 'wallet',
        walletAddress: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4),
        auditsCount: 0,
        joinedAt: new Date().toISOString()
      });
      setIsLoginModalOpen(false);
    } else if (!connected && user?.provider === 'wallet') {
      // Wallet Disconnected -> Auto Logout
      setUser(null);
    }
  }, [connected, publicKey, user?.provider]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const login = useCallback(async (provider: AuthProvider) => {
    // Wallet login is handled automatically by the useEffect
    if (provider === 'wallet') return;

    setIsLoading(true);

    // Simulate API delay with loading animation for Google/GitHub
    await new Promise(resolve => setTimeout(resolve, 1800));

    const mockUser = MOCK_USERS[provider];
    if (mockUser) {
      setUser({
        ...mockUser,
        provider: provider, // Ensure provider type matches
        joinedAt: new Date().toISOString(),
      } as User);
    }

    setIsLoading(false);
    setIsLoginModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    if (user?.provider === 'wallet') {
      disconnect().catch(err => console.error("Disconnect error:", err));
    }
    setUser(null);
  }, [user?.provider, disconnect]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider_');
  return ctx;
}
