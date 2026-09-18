'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export interface UserProfile {
  baseCurrency: string;
  monthlyBudget: number;
  displayName?: string;
  bio?: string;
  country?: string;
  createdAt?: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (
    email: string,
    password: string,
    displayName: string,
    baseCurrency?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile> & { displayName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to ensure user document exists in Firestore
  const ensureUserDocument = async (userObj: User, defaultCurrency = 'USD') => {
    try {
      const userRef = doc(db, 'users', userObj.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const initialProfile: UserProfile = {
          baseCurrency: defaultCurrency,
          monthlyBudget: 2500,
          displayName: userObj.displayName || '',
          createdAt: Date.now(),
        };
        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      } else {
        setUserProfile(userSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error ensuring user document in Firestore:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listen to Firestore profile updates real-time
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            ensureUserDocument(currentUser);
          }
        });

        setLoading(false);
        return () => unsubDoc();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    baseCurrency = 'USD'
  ) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await updateProfile(res.user, { displayName });
        await ensureUserDocument(res.user, baseCurrency);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await ensureUserDocument(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile> & { displayName?: string }) => {
    if (!user) return;

    if (data.displayName !== undefined && data.displayName !== user.displayName) {
      await updateProfile(user, { displayName: data.displayName });
      // Force refresh user state object
      setUser({ ...auth.currentUser! });
    }

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        refreshUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
