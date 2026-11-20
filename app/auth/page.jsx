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
  Shield,
  Sparkles,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';

export default function AuthPage() {
  const router = useRouter();
  const { user, isAdmin, isFirebaseConfigured, loginWithEmail, signupWithEmail } = useAuth();
  const { pushToast } = useStore();

  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
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
        pushToast('Welcome back to Doffor Clothing.');
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await signupWithEmail({ name, email, password, phone, city });
        pushToast('Account created! Welcome to the Doffor Archive.');
      }
      router.push('/account');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setError('');
    setAdminLoading(true);
    try {
      await loginWithEmail({
        email: 'admin@doffor.in',
        password: 'DofforAdmin@2026',
      });
      pushToast('Signed in as Doffor Admin');
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Admin preview login failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-bone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 card-dark overflow-hidden min-h-[680px]">
          {/* Left Editorial Lookbook Panel */}
          <div className="relative lg:col-span-6 min-h-[300px] lg:min-h-full bg-surface overflow-hidden flex flex-col justify-between p-8 sm:p-10">
            <img
              src="/images/lookbook-campus-1.jpg"
              alt="Doffor Clothing Drop 04 Lookbook"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/65 to-obsidian/30" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-sm bg-acid text-obsidian font-mono text-[11px] font-bold uppercase tracking-widest">
                DROP 04 // ARCHIVE ACCESS
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-bone/80">
                240–280 GSM
              </span>
            </div>

            <div className="relative z-10 space-y-5 mt-16 lg:mt-0">
              <h1 className="font-condensed text-4xl sm:text-6xl uppercase leading-[0.95] tracking-wide text-bone">
                HEAVYWEIGHT <br />
                <span className="text-acid">INDIAN LUXURY</span> <br />
                STREETWEAR
              </h1>
              <p className="text-sm text-bone/80 max-w-md leading-relaxed">
                Sign in to access Drop 04 early releases, one-click Razorpay express checkout, saved wishlist rotations, and real-time Pan-India shipment tracking.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/15 font-mono text-[11px]">
                <div>
                  <p className="text-acid font-bold">260 GSM</p>
                  <p className="text-ash">Bio-Washed</p>
                </div>
                <div>
                  <p className="text-acid font-bold">48 HR AIR</p>
                  <p className="text-ash">Pan-India</p>
                </div>
                <div>
                  <p className="text-acid font-bold">LIMITED</p>
                  <p className="text-ash">Small Batches</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form Panel */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-charcoal">
            <div className="max-w-md w-full mx-auto space-y-6">
              {/* Already logged in notice */}
              {user && (
                <div className="p-4 rounded-sm bg-acid/10 border border-acid/40 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase text-acid font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Signed In As
                    </p>
                    <p className="text-sm font-bold text-bone truncate">{user.name}</p>
                    <p className="text-xs text-ash truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Link href="/account" className="btn-acid py-2 px-3 text-[11px]">
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="btn-outline py-1.5 px-3 text-[10px]">
                        Admin Panel
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Heading + Mode Switcher */}
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase">
                  {tab === 'signin' ? 'Welcome Back' : 'Join Doffor'}
                </h2>
                <p className="text-sm text-ash mt-1">
                  {tab === 'signin'
                    ? 'Sign in with Google or your email to manage orders & wishlist.'
                    : 'Create your Doffor account for faster checkouts and drop alerts.'}
                </p>
              </div>

              <div className="grid grid-cols-2 p-1 rounded-sm bg-obsidian border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError('');
                  }}
                  className={`py-2.5 font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                    tab === 'signin' ? 'bg-acid text-obsidian' : 'text-ash hover:text-bone'
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
                  className={`py-2.5 font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                    tab === 'signup' ? 'bg-acid text-obsidian' : 'text-ash hover:text-bone'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Google OAuth Button */}
              <GoogleSignInButton mode={tab} onSuccess={() => router.push('/account')} />

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-white/10" />
                <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-ash">
                  Or continue with email
                </span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              {error && (
                <div className="p-3.5 rounded-sm bg-crimson/15 border border-crimson/40 flex items-start gap-2.5 text-xs text-bone">
                  <AlertCircle className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'signup' && (
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="input-dark pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        City (Optional)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
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

              {/* Quick Admin Preview Box */}
              <div className="pt-5 border-t border-white/10">
                {!isFirebaseConfigured ? (
                  <div className="p-4 rounded-sm bg-obsidian border border-white/10 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-acid flex items-center gap-1.5 font-bold">
                        <Shield className="w-3.5 h-3.5" /> Store Admin Preview
                      </span>
                      <span className="font-mono text-[10px] text-ash">1-Click Access</span>
                    </div>
                    <p className="text-xs text-ash leading-relaxed">
                      Want to test the Inventory, Order Fulfillment & Coupon Admin Panel right away?
                    </p>
                    <button
                      type="button"
                      disabled={adminLoading}
                      onClick={handleQuickAdminLogin}
                      className="btn-outline w-full py-2.5 text-[11px]"
                    >
                      {adminLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in...
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5 text-acid" /> Quick Admin Preview Login (admin@doffor.in)
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-sm bg-obsidian border border-white/10 flex items-start gap-2.5 text-xs text-ash">
                    <Sparkles className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Firebase Auth is active. To access <strong className="text-bone">/admin</strong>, add your email to{' '}
                      <code className="text-acid font-mono bg-surface px-1 py-0.5 rounded-sm">
                        NEXT_PUBLIC_ADMIN_EMAILS
                      </code>{' '}
                      in <code className="font-mono text-bone">.env.local</code> and sign in above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
