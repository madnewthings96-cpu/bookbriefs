import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  createAuthObserverFlow,
  disposeCurrentAuthObserverSubscription,
  type AuthAttemptKind,
  type AuthObserverState,
  type AuthUser,
  toAuthUser,
} from './authStateModel';

export type User = AuthUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authError: string | null;
  retryAuth: (kind?: AuthAttemptKind) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  updateName: (name: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
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
  const observerFlow = useRef(createAuthObserverFlow()).current;
  const [observerState, setObserverState] = useState<AuthObserverState>(() => observerFlow.getState());
  const observerSubscriptionRef = useRef<(() => void) | null>(null);

  const subscribeAuthObserver = useCallback(() => {
    disposeCurrentAuthObserverSubscription(observerSubscriptionRef);

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;
      const nextUser: User | null = firebaseUser ? toAuthUser(firebaseUser) : null;
      setObserverState(observerFlow.observerUser(nextUser));
    }, (error) => {
      if (!active) return;
      console.error('Firebase auth observer error:', error);
      setObserverState(observerFlow.observerError(error));
    });

    const cleanup = () => {
      if (!active) return;
      active = false;
      unsubscribe();
    };
    observerSubscriptionRef.current = cleanup;
    return cleanup;
  }, [observerFlow]);

  useEffect(() => {
    subscribeAuthObserver();
    return () => {
      disposeCurrentAuthObserverSubscription(observerSubscriptionRef);
    };
  }, [subscribeAuthObserver]);

  const retryAuth = useCallback((kind: AuthAttemptKind = 'login') => {
    setObserverState(observerFlow.beginAttempt(kind));
    subscribeAuthObserver();
  }, [observerFlow, subscribeAuthObserver]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (observerFlow.getState().authError) retryAuth('login');
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (observerFlow.getState().authError) retryAuth('signup');
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      if (observerFlow.getState().authError) retryAuth('google');
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const updateName = async (name: string): Promise<void> => {
    const firebaseUser = auth.currentUser;
    const currentUser = observerFlow.getState().user;
    if (!firebaseUser || !currentUser) throw new Error('No authenticated user is available.');

    await updateProfile(firebaseUser, { displayName: name });
    setObserverState(observerFlow.observerUser({ ...currentUser, name }));
  };

  const sendPasswordReset = async (): Promise<void> => {
    const email = observerFlow.getState().user?.email || auth.currentUser?.email;
    if (!email) throw new Error('No account email is available.');
    await sendPasswordResetEmail(auth, email);
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
    loginWithGoogle,
    updateName,
    sendPasswordReset,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
