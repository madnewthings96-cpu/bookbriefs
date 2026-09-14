import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FirebaseContextType {
  currentUser: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider');
  return context;
};

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      console.warn('Firebase auth initialization timeout, proceeding without auth');
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      window.clearTimeout(timeoutId);
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName,
              createdAt: new Date(),
              lastLogin: new Date(),
            });
          } else {
            await updateDoc(userDocRef, { lastLogin: new Date() });
          }
        } catch (error) {
          console.error('Error preparing user data:', error);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase auth error:', error);
      window.clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ currentUser, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}
