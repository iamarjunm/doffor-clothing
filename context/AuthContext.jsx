'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured, ADMIN_EMAILS } from '../lib/firebase';
import { upsertUserRecord } from '../lib/dataService';

const AuthContext = createContext(null);
const SESSION_KEY = 'doffor_session_user_v1';

function isEmailAdmin(email) {
  return ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real Firebase Auth Listener
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        let role = isEmailAdmin(fbUser.email) ? 'admin' : 'customer';
        let extra = {};
        if (db) {
          try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (snap.exists()) {
              extra = snap.data();
              if (extra.role === 'admin') role = 'admin';
            }
          } catch {
            // fallback to default role
          }
        }

        const merged = {
          uid: fbUser.uid,
          name: extra.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Doffor Member',
          email: fbUser.email,
          emailVerified: Boolean(fbUser.emailVerified),
          avatar: fbUser.photoURL || extra.avatar || '',
          phone: extra.phone || '',
          city: extra.city || '',
          provider: fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
          role,
          createdAt: extra.createdAt || new Date().toISOString(),
        };

        try {
          const { emailVerified: _ev, ...firestoreProfile } = merged;
          await upsertUserRecord(firestoreProfile);
        } catch (err) {
          console.warn('[Auth] User profile sync skipped:', err.message);
        }
        setUser(merged);
        setLoading(false);
      });

      return () => unsub();
    }

    // Zero-config local session preview when Firebase keys aren't added yet
    try {
      const saved = window.localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persistPreviewUser = async (profile) => {
    const saved = await upsertUserRecord(profile);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
    setUser(saved);
    return saved;
  };

  const loginWithGoogle = async (demoProfile = null) => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      let existing = null;
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) existing = snap.data();
        } catch {
          // new user
        }
      }

      const profile = existing
        ? {
            ...existing,
            uid: fbUser.uid,
            name: existing.name || fbUser.displayName || fbUser.email.split('@')[0],
            avatar: fbUser.photoURL || existing.avatar || '',
          }
        : {
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            avatar: fbUser.photoURL || '',
            provider: 'google',
            role: 'customer',
            createdAt: new Date().toISOString(),
          };

      try {
        await upsertUserRecord(profile);
      } catch (err) {
        console.warn('[Auth] Google profile sync warning:', err.message);
      }
      const effectiveRole =
        existing?.role === 'admin' || isEmailAdmin(fbUser.email) ? 'admin' : 'customer';
      const hydratedUser = {
        ...profile,
        role: effectiveRole,
        emailVerified: Boolean(fbUser.emailVerified),
      };
      setUser(hydratedUser);
      return hydratedUser;
    }

    // Zero-config Google chooser fallback
    if (!demoProfile?.email) {
      throw new Error('Select a Google account to continue.');
    }
    const email = demoProfile.email.trim().toLowerCase();
    return persistPreviewUser({
      uid: `google-${email.replace(/[^a-z0-9]/g, '')}`,
      name: demoProfile.name || email.split('@')[0],
      email,
      avatar: demoProfile.avatar || '',
      city: demoProfile.city || '',
      phone: demoProfile.phone || '',
      provider: 'google',
      role: isEmailAdmin(email) ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    });
  };

  const loginWithEmail = async ({ email, password }) => {
    const normalized = email.trim().toLowerCase();
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, normalized, password);
      return cred.user;
    }

    // Preview mode login (supports Admin demo & any account)
    if (normalized === 'admin@doffor.in' && password === 'DofforAdmin@2026') {
      return persistPreviewUser({
        uid: 'admin-default',
        name: 'Doffor Admin',
        email: 'admin@doffor.in',
        role: 'admin',
        provider: 'email',
        city: 'Bengaluru',
        phone: '+91 98765 00001',
      });
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    return persistPreviewUser({
      uid: `email-${normalized.replace(/[^a-z0-9]/g, '')}`,
      name: normalized.split('@')[0],
      email: normalized,
      role: isEmailAdmin(normalized) ? 'admin' : 'customer',
      provider: 'email',
      createdAt: new Date().toISOString(),
    });
  };

  const signupWithEmail = async ({ name, email, password, city = '', phone = '' }) => {
    const normalized = email.trim().toLowerCase();
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, normalized, password);
      await fbUpdateProfile(cred.user, { displayName: name.trim() });
      const profile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: normalized,
        city: city.trim(),
        phone: phone.trim(),
        avatar: '',
        provider: 'email',
        role: isEmailAdmin(normalized) ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };
      await upsertUserRecord(profile);
      setUser(profile);
      return profile;
    }

    return persistPreviewUser({
      uid: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      city: city.trim(),
      phone: phone.trim(),
      avatar: '',
      provider: 'email',
      role: isEmailAdmin(normalized) ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    });
  };

  const updateUserProfile = async (patch) => {
    if (!user) return null;
    const next = { ...user, ...patch };
    await upsertUserRecord(next);
    if (!isFirebaseConfigured) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }
    setUser(next);
    return next;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        isFirebaseConfigured,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
