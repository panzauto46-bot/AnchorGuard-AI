import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { auth, googleProvider, githubProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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

export function AuthProvider_({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading to check auth state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Real Solana Wallet Adapter Hook
  const { connected, publicKey, disconnect } = useWallet();

  // Effect 1: Handle Firebase Auth State (Google/GitHub)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // If wallet is connected, wallet takes precedence or handled separately
      // But for now, if Firebase user exists and no wallet connected, prioritize Firebase
      if (firebaseUser && !connected) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined,
          provider: firebaseUser.providerData[0]?.providerId.includes('github') ? 'github' : 'google',
          auditsCount: 0, // In a real app, fetch from DB
          joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString()
        });
      } else if (!firebaseUser && !connected) {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [connected]);

  // Effect 2: Sync Wallet Status to Auth State (Overrides Firebase if connected)
  useEffect(() => {
    if (connected && publicKey) {
      // Real Wallet Connected -> Auto Login (Override Firebase user for this session context)
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
      // Wallet Disconnected -> Check if Firebase user exists (revert to Firebase user if valid)
      if (auth.currentUser) {
        setUser({
          id: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'User',
          email: auth.currentUser.email || '',
          avatar: auth.currentUser.photoURL || undefined,
          provider: auth.currentUser.providerData[0]?.providerId.includes('github') ? 'github' : 'google',
          auditsCount: 0,
          joinedAt: auth.currentUser.metadata.creationTime || new Date().toISOString()
        });
      } else {
        setUser(null);
      }
    }
  }, [connected, publicKey, user?.provider]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const login = useCallback(async (provider: AuthProvider) => {
    if (provider === 'wallet') return; // Wallet handled by adapter

    setIsLoading(true);
    try {
      if (provider === 'google') {
        await signInWithPopup(auth, googleProvider);
      } else if (provider === 'github') {
        await signInWithPopup(auth, githubProvider);
      }
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (user?.provider === 'wallet') {
      disconnect().catch(err => console.error("Disconnect error:", err));
    } else {
      await signOut(auth);
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
