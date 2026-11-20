'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';

export default function AuthPage() {
  const router = useRouter();
  const { user, loginWithEmail, signupWithEmail } = useAuth();
  const { pushToast } = useStore();

  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        await loginWithEmail({ email, password });
        pushToast('Welcome back to Doffor.');
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await signupWithEmail({ name, email, password, phone, city });
        pushToast('Account created. Welcome to Doffor.');
      }
      router.push('/account');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-black/10 overflow-hidden bg-white">
          {/* Left Editorial Visual */}
          <div className="relative lg:col-span-6 min-h-[280px] lg:min-h-[640px] bg-[#111113] overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-white">
            <img
              src="/images/lookbook-campus-1.jpg"
              alt="Doffor Editorial"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />

            <div className="relative z-10 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/80">
              <span>Doffor Account</span>
              <span>240–280 GSM</span>
            </div>

            <div className="relative z-10 space-y-4 mt-16 lg:mt-0">
              <h1 className="font-display font-bold text-3xl sm:text-5xl leading-[1.02] tracking-tight uppercase">
                Heavyweight Forms.
                <br />
                Archive Access.
              </h1>
              <p className="text-sm text-white/80 max-w-md leading-relaxed font-light">
                Sign in to manage orders, save your favorite pieces, and unlock faster Razorpay
                checkout on upcoming drops.
              </p>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto space-y-6">
              {user && (
                <div className="p-4 bg-[#F6F5F2] border border-black/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#0B0B0C] truncate">
                        Signed in as {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/account" className="text-xs font-medium underline shrink-0">
                    My Account
                  </Link>
                </div>
              )}

              {/* Tabs */}
              <div className="grid grid-cols-2 border-b border-black/15">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError('');
                  }}
                  className={`pb-3 text-xs uppercase tracking-[0.18em] transition-colors ${
                    tab === 'signin'
                      ? 'text-[#0B0B0C] font-semibold border-b-2 border-[#0B0B0C] -mb-[1px]'
                      : 'text-neutral-400 hover:text-[#0B0B0C]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setError('');
                  }}
                  className={`pb-3 text-xs uppercase tracking-[0.18em] transition-colors ${
                    tab === 'signup'
                      ? 'text-[#0B0B0C] font-semibold border-b-2 border-[#0B0B0C] -mb-[1px]'
                      : 'text-neutral-400 hover:text-[#0B0B0C]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <GoogleSignInButton mode={tab} onSuccess={() => router.push('/account')} />

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-black/10" />
                <span className="px-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  Or with email
                </span>
                <div className="flex-grow border-t border-black/10" />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'signup' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Arjun Sharma"
                        className="input-dark pl-10"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-dark pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="input-dark pl-10"
                    />
                  </div>
                </div>

                {tab === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="input-dark pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">
                        City (Optional)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Mumbai / Delhi"
                          className="input-dark pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-acid w-full py-3.5 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : tab === 'signin' ? (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-neutral-500 text-center pt-2">
                By continuing, you agree to Doffor&apos;s{' '}
                <Link href="/terms" className="underline hover:text-black">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-black">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
