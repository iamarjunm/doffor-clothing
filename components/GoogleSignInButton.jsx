'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const PREVIEW_GOOGLE_ACCOUNTS = [
  { name: 'Arjun Sharma', email: 'arjun.sharma@gmail.com', city: 'New Delhi' },
  { name: 'Rhea Kapoor', email: 'rhea.kapoor@gmail.com', city: 'Mumbai' },
  { name: 'Doffor Admin', email: 'admin@doffor.in', city: 'Bengaluru', badge: 'ADMIN' },
];

export default function GoogleSignInButton({ mode = 'signin', onSuccess }) {
  const { loginWithGoogle, isFirebaseConfigured } = useAuth();
  const { pushToast } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const handleClick = async () => {
    if (isFirebaseConfigured) {
      setLoading(true);
      try {
        const user = await loginWithGoogle();
        pushToast(`Signed in with Google as ${user.name}`);
        onSuccess?.(user);
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
          pushToast(err.message || 'Google Sign-In failed', 'error');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setModalOpen(true);
  };

  const handlePreviewAccount = async (profile) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(profile);
      setModalOpen(false);
      pushToast(`Signed in with Google as ${user.name}`);
      onSuccess?.(user);
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-sm bg-white text-obsidian font-sans font-semibold text-sm hover:bg-bone transition-all active:scale-[0.99] shadow-md disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-obsidian" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative z-10 w-full max-w-md bg-white text-zinc-900 rounded-md shadow-2xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-semibold text-sm">Sign in with Google</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Choose an account</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  to continue to <strong className="text-zinc-900">Doffor Clothing</strong>
                </p>
              </div>

              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
                {PREVIEW_GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={loading}
                    onClick={() => handlePreviewAccount(acc)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-acid font-bold text-sm flex items-center justify-center shrink-0">
                      {acc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{acc.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{acc.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        acc.badge === 'ADMIN'
                          ? 'bg-zinc-900 text-acid font-bold'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {acc.badge || acc.city}
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customName && customEmail) {
                    handlePreviewAccount({ name: customName, email: customEmail });
                  }
                }}
                className="space-y-2.5 pt-2 border-t border-zinc-200"
              >
                <p className="text-xs font-semibold text-zinc-700">Or continue with any Google email</p>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Continue with Google
                </button>
              </form>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Preview Mode: Add your <code className="bg-zinc-100 px-1 rounded">NEXT_PUBLIC_FIREBASE_*</code> keys in{' '}
                <code className="bg-zinc-100 px-1 rounded">.env.local</code> to switch automatically to live Firebase Google OAuth popup.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
