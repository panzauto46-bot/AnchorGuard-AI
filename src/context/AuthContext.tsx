import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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

// Simulated user data per provider
const MOCK_USERS: Record<AuthProvider, Omit<User, 'joinedAt'>> = {
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
  wallet: {
    id: 'sol-' + Math.random().toString(36).slice(2, 10),
    name: 'Phantom Wallet',
    provider: 'wallet',
    walletAddress: '7xKX...9fPq',
    auditsCount: 5,
  },
};

export function AuthProvider_({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const login = useCallback(async (provider: AuthProvider) => {
    setIsLoading(true);

    // Simulate API delay with loading animation
    await new Promise(resolve => setTimeout(resolve, 1800));

    const mockUser = MOCK_USERS[provider];
    setUser({
      ...mockUser,
      joinedAt: new Date().toISOString(),
    });
    setIsLoading(false);
    setIsLoginModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

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
