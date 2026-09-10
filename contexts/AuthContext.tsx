import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  applyAuthObserverError,
  applyAuthObserverUser,
  INITIAL_AUTH_OBSERVER_STATE,
  type AuthObserverState,
  type AuthUser,
} from './authStateModel';

export type User = AuthUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authError: string | null;
  retryAuth: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [observerState, setObserverState] = useState<AuthObserverState>(INITIAL_AUTH_OBSERVER_STATE);
  const [authSubscriptionKey, setAuthSubscriptionKey] = useState(0);

  const retryAuth = useCallback(() => {
    setObserverState((state) => ({
      ...state,
      user: null,
      isAuthReady: false,
      authError: null,
    }));
    setAuthSubscriptionKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;
      const nextUser: User | null = firebaseUser
        ? {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          }
        : null;
      setObserverState((state) => applyAuthObserverUser(state, nextUser));
    }, (error) => {
      if (!active) return;
      console.error('Firebase auth observer error:', error);
      setObserverState((state) => applyAuthObserverError(state, error));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authSubscriptionKey]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (observerState.authError) retryAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (observerState.authError) retryAuth();
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user: observerState.user,
    isAuthenticated: !!observerState.user && !observerState.authError,
    isAuthReady: observerState.isAuthReady,
    authError: observerState.authError,
    retryAuth,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
