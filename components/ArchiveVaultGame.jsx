'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Lock,
  Unlock,
  Check,
  Copy,
  ArrowRight,
  X,
  ShoppingBag,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { subscribeNewsletter } from '../lib/dataService';

const VAULT_STORAGE_KEY = 'doffor_vault_reward_v1';
const VAULT_SYNC_EVENT = 'doffor:vault-reward-sync';

const VAULT_REWARDS = [
  {
    code: 'FIRSTDROP',
    headline: '₹150 Off',
    subtitle: 'Your First Order',
    minOrder: 999,
    minOrderText: 'Valid on orders ₹999+',
    edition: 'ARCHIVE SEAL 01',
    note: 'Flat ₹150 instant deduction applied at checkout.',
  },
  {
    code: 'DOFFOR10',
    headline: '10% Off',
    subtitle: 'Entire Bag',
    minOrder: 799,
    minOrderText: 'Valid on orders ₹799+',
    edition: 'ARCHIVE SEAL 02',
    note: '10% privilege across all 240–280 GSM pieces.',
  },
  {
    code: 'DROP20',
    headline: '20% Off',
    subtitle: 'VIP Vault Reward',
    minOrder: 2499,
    minOrderText: 'Valid on orders ₹2,499+',
    edition: 'ARCHIVE SEAL 03',
    note: 'Rare tier — 20% off curated multi-piece rotations.',
  },
];

const POUCHES = [
  { number: '01', serial: 'DFR-V01', label: 'Archive Pouch 01' },
  { number: '02', serial: 'DFR-V02', label: 'Archive Pouch 02' },
  { number: '03', serial: 'DFR-V03', label: 'Archive Pouch 03' },
];

function readSavedReward() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.code !== 'string') return null;
    const matched = VAULT_REWARDS.find((r) => r.code === parsed.code);
    return matched ? { ...matched, ...parsed } : null;
  } catch {
    return null;
  }
}

function saveRewardToStorage(payload) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(VAULT_SYNC_EVENT, { detail: payload }));
  } catch {
    // ignore storage errors
  }
}

function pickVaultReward(pouchIndex) {
  // Weighted selection favoring approachable instant conversions while keeping VIP 20% attainable
  const roll = Math.random();
  let chosen;
  if (roll < 0.4) {
    chosen = VAULT_REWARDS[1]; // DOFFOR10 (10% off ₹799+)
  } else if (roll < 0.78) {
    chosen = VAULT_REWARDS[0]; // FIRSTDROP (₹150 off ₹999+)
  } else {
    chosen = VAULT_REWARDS[2]; // DROP20 (20% off ₹2,499+)
  }

  return {
    ...chosen,
    pouchIndex,
    unlockedAt: new Date().toISOString(),
    emailSaved: false,
  };
}

export default function ArchiveVaultGame({ mode = 'floating' }) {
  const pathname = usePathname();
  const { config, pushToast } = useStore();
  const { applyCouponCode, setDrawerOpen, itemCount, subtotal, coupon } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [reward, setReward] = useState(null);
  const [unsealingIndex, setUnsealingIndex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState(null);
  const [email, setEmail] = useState('');
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  const revealTimerRef = useRef(null);

  // Hydrate saved reward & stay in sync across inline + floating instances
  useEffect(() => {
    setReward(readSavedReward());

    const onSync = (event) => {
      if (event?.detail) {
        setReward(event.detail);
      } else {
        setReward(readSavedReward());
      }
    };

    const onStorage = (event) => {
      if (event.key === VAULT_STORAGE_KEY) {
        setReward(readSavedReward());
      }
    };

    window.addEventListener(VAULT_SYNC_EVENT, onSync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(VAULT_SYNC_EVENT, onSync);
      window.removeEventListener('storage', onStorage);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  // Lock body scroll & support Escape key when floating modal is open
  useEffect(() => {
    if (mode !== 'floating' || !modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mode, modalOpen]);

  const handleSelectPouch = useCallback(
    (index) => {
      if (reward || unsealingIndex !== null) return;
      setUnsealingIndex(index);
      setApplyFeedback(null);

      revealTimerRef.current = setTimeout(() => {
        const unlocked = pickVaultReward(index);
        setReward(unlocked);
        saveRewardToStorage(unlocked);
        setUnsealingIndex(null);
        pushToast(`Vault unlocked — ${unlocked.code} (${unlocked.headline})`);
      }, 600);
    },
    [reward, unsealingIndex, pushToast]
  );

  const handleCopyCode = useCallback(() => {
    if (!reward?.code) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reward.code).catch(() => {});
    }
    setCopied(true);
    pushToast(`Code ${reward.code} copied to clipboard`);
    setTimeout(() => setCopied(false), 2400);
  }, [reward, pushToast]);

  const handleApplyToBag = useCallback(async () => {
    if (!reward?.code || applying) return;
    setApplying(true);
    setApplyFeedback(null);

    try {
      await applyCouponCode(reward.code);
      setApplyFeedback({
        type: 'success',
        message: `${reward.code} is active in your bag.`,
      });
      if (mode === 'floating') setModalOpen(false);
      setDrawerOpen(true);
    } catch (err) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(reward.code).catch(() => {});
      }
      const shortfall = Math.max(0, (reward.minOrder || 0) - subtotal);
      const friendlyMsg =
        itemCount === 0
          ? `Code ${reward.code} copied — add pieces worth ₹${reward.minOrder}+ to activate in bag.`
          : shortfall > 0
          ? `Code ${reward.code} copied — add ₹${shortfall} more to unlock ${reward.headline}.`
          : err?.message || `Code ${reward.code} copied for checkout.`;

      setApplyFeedback({
        type: 'info',
        message: friendlyMsg,
      });
      pushToast(friendlyMsg, 'info');
    } finally {
      setApplying(false);
    }
  }, [reward, applying, applyCouponCode, mode, setDrawerOpen, itemCount, subtotal, pushToast]);

  const handleEmailSave = useCallback(
    async (e) => {
      e.preventDefault();
      if (!reward || submittingEmail) return;
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setEmailError('Enter a valid email address.');
        return;
      }

      setEmailError('');
      setSubmittingEmail(true);
      try {
        await subscribeNewsletter(trimmed);
        const updated = { ...reward, emailSaved: true, savedEmail: trimmed };
        setReward(updated);
        saveRewardToStorage(updated);
        setEmail('');
        pushToast(`Vault pass ${reward.code} saved to ${trimmed}`);
      } catch {
        setEmailError('Could not save right now. Your code is still stored below.');
      } finally {
        setSubmittingEmail(false);
      }
    },
    [reward, submittingEmail, email, pushToast]
  );

  const isCodeAppliedInCart = Boolean(reward && coupon?.code === reward.code);

  const renderVaultExperience = ({ compact = false } = {}) => {
    const isUnsealing = unsealingIndex !== null;

    return (
      <div className="w-full text-white">
        {/* HEADER */}
        <div
          className={`flex flex-col ${
            compact ? 'gap-2 mb-6 pr-11' : 'lg:flex-row lg:items-end justify-between gap-6 mb-10'
          }`}
        >
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.28em] text-white/60">
              {reward ? <Unlock className="w-3.5 h-3.5 text-white" /> : <Lock className="w-3.5 h-3.5 text-white/70" />}
              <span>THE DOFFOR VAULT // ARCHIVE PRIVILEGE</span>
            </div>

            <h2
              className={`font-display font-semibold uppercase tracking-[-0.02em] leading-[1.04] ${
                compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl lg:text-[42px]'
              }`}
            >
              {reward
                ? 'Archive Seal Broken.'
                : 'Pick One Sealed Garment Pouch.'}
            </h2>

            <p className="text-xs sm:text-sm text-white/65 leading-relaxed font-light">
              {reward
                ? 'Your private Doffor privilege code is locked in for this session and ready to apply straight to your bag.'
                : 'Three matte-obsidian archive pouches. Each seals a live checkout privilege — up to 20% off your bag.'}
            </p>
          </div>

          {!compact && (
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-white/45 shrink-0">
              <span>01 // FIRSTDROP</span>
              <span className="text-white/20">/</span>
              <span>02 // DOFFOR10</span>
              <span className="text-white/20">/</span>
              <span>03 // DROP20</span>
            </div>
          )}
        </div>

        {/* STEP 1 & 2: THREE SEALED MATTE-OBSIDIAN GARMENT POUCHES */}
        {!reward ? (
          <div className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {POUCHES.map((pouch, idx) => {
                const isThisUnsealing = unsealingIndex === idx;
                const isDimmed = isUnsealing && !isThisUnsealing;

                return (
                  <button
                    key={pouch.number}
                    type="button"
                    disabled={isUnsealing}
                    onClick={() => handleSelectPouch(idx)}
                    aria-label={`Open ${pouch.label}`}
                    className={`group relative overflow-hidden bg-[#141417] text-left transition-all duration-500 ease-out focus:outline-none px-4 py-4 min-h-[82px] flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-4 sm:gap-0 ${
                      compact ? 'sm:p-6 sm:min-h-[215px]' : 'sm:p-7 sm:min-h-[264px]'
                    } ${
                      isThisUnsealing
                        ? 'sm:-translate-y-1.5 scale-[1.01] bg-[#1A1A1F]'
                        : isDimmed
                        ? 'opacity-30 scale-[0.98]'
                        : `${
                            idx === 0
                              ? 'sm:hover:-rotate-[0.6deg]'
                              : idx === 2
                              ? 'sm:hover:rotate-[0.6deg]'
                              : 'sm:hover:scale-[1.015]'
                          } sm:hover:-translate-y-1.5 hover:bg-[#19191E] active:scale-[0.99]`
                    }`}
                    style={{
                      border: isThisUnsealing
                        ? '1px solid rgba(255, 255, 255, 0.72)'
                        : '1px solid rgba(255, 255, 255, 0.16)',
                    }}
                  >
                    {/* Matte Zip-Lock Top Seam Accent */}
                    <span
                      aria-hidden="true"
                      className="absolute top-2.5 sm:top-3 left-0 right-0 h-px transition-opacity duration-500"
                      style={{
                        background: isThisUnsealing
                          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)'
                          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      }}
                    />

                    {/* Subtle Metallic Hover Shimmer Sweep */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 ease-out ${
                        isThisUnsealing ? 'animate-shimmer' : 'group-hover:translate-x-full'
                      }`}
                    />

                    {/* Top Row (Desktop) / Left Cluster (Mobile): Serial + Seal Status */}
                    <div className="relative z-10 hidden sm:flex items-center justify-between gap-2 pt-2">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-mono">
                        {pouch.serial}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/75"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.16)' }}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isThisUnsealing ? 'bg-white animate-ping' : 'bg-white/60'
                          }`}
                        />
                        {isThisUnsealing ? 'Breaking' : 'Sealed'}
                      </span>
                    </div>

                    {/* Center Swiss Numeral */}
                    <div className="relative z-10 flex items-center gap-3.5 sm:block sm:my-6">
                      <span
                        className={`block font-display font-bold tracking-[-0.04em] leading-none transition-all duration-500 text-3xl ${
                          compact ? 'sm:text-5xl' : 'sm:text-6xl'
                        } ${
                          isThisUnsealing
                            ? 'text-white translate-x-0.5'
                            : 'text-white/90 group-hover:text-white'
                        }`}
                      >
                        {pouch.number}
                      </span>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.22em] text-white/75 sm:text-white/40 sm:mt-2">
                          DOFFOR ARCHIVE
                        </span>
                        <span className="sm:hidden block text-[9px] uppercase tracking-[0.2em] text-white/45 font-mono mt-0.5">
                          {pouch.serial} • {isThisUnsealing ? 'Unsealing' : 'Sealed'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Cue (Desktop) / Right Pill (Mobile) */}
                    <div
                      className="relative z-10 sm:pt-3 sm:border-t flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/80 sm:text-white/65 group-hover:text-white transition-colors shrink-0"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    >
                      <span>{isThisUnsealing ? 'Unsealing...' : 'Break Seal'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/45">
              <span>One sealed privilege per visitor • Instant checkout code</span>
              <span>Zero spam • 100% live codes</span>
            </div>
          </div>
        ) : (
          /* STEP 3: UNLOCKED VAULT PRIVILEGE PASS + INSTANT APPLY & OPTIONAL EMAIL */
          <div
            className="bg-[#141417] p-5 sm:p-8 animate-page-enter"
            style={{ border: '1px solid rgba(255, 255, 255, 0.18)' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left: Revealed Privilege Pass */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white bg-white/10"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pouch 0{(reward.pouchIndex ?? 0) + 1} Unsealed
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                    {reward.edition}
                  </span>
                </div>

                <div>
                  <p className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-white uppercase">
                    {reward.headline}{' '}
                    <span className="font-light text-white/75">{reward.subtitle}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1.5">
                    {reward.minOrderText} — {reward.note}
                  </p>
                </div>

                {/* Code Display + Primary Actions */}
                <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 pt-1">
                  <div
                    className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0B0B0C] min-w-[200px]"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.22)' }}
                  >
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.22em] text-white/45">
                        Archive Code
                      </span>
                      <span className="font-mono text-base sm:text-lg font-semibold tracking-[0.18em] text-white">
                        {reward.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.16)' }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyToBag}
                    disabled={applying}
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#0B0B0C] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors disabled:opacity-60"
                    style={{ borderRadius: 'var(--df-radius)' }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {applying
                      ? 'Applying...'
                      : isCodeAppliedInCart
                      ? 'Active In Bag'
                      : 'Apply to Bag Now'}
                  </button>
                </div>

                {applyFeedback && (
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-xs text-white/80 bg-[#0B0B0C]"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.14)' }}
                  >
                    <span>{applyFeedback.message}</span>
                    {applyFeedback.type === 'info' && (
                      <Link
                        href="/shop"
                        onClick={() => setModalOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-white underline underline-offset-4 hover:opacity-80"
                      >
                        Shop Pieces <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Optional 1-Field Email Vault Pass Save */}
              <div
                className="lg:col-span-5 pt-5 lg:pt-0 lg:pl-7 border-t lg:border-t-0 lg:border-l space-y-3"
                style={{ borderColor: 'rgba(255, 255, 255, 0.14)' }}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/60">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Optional — Save Pass & Early Access</span>
                </div>

                {reward.emailSaved ? (
                  <div
                    className="p-4 bg-[#0B0B0C] space-y-1.5"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.16)' }}
                  >
                    <p className="inline-flex items-center gap-2 text-xs font-medium text-white">
                      <Check className="w-4 h-4" /> Vault Pass Registered
                    </p>
                    <p className="text-[11px] text-white/55 leading-relaxed">
                      Saved under <span className="text-white/85">{reward.savedEmail}</span>. You
                      will receive early notifications for numbered small-batch drops.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSave} className="space-y-2.5">
                    <p className="text-xs text-white/60 leading-relaxed">
                      Lock this code to your inbox and receive private alerts before limited
                      260–280 GSM drops sell out.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="you@domain.com"
                        aria-label="Email address for vault pass"
                        className="flex-1 bg-[#0B0B0C] px-3.5 py-2.5 text-xs text-white placeholder:text-white/35 focus:outline-none transition-colors"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      />
                      <button
                        type="submit"
                        disabled={submittingEmail}
                        className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white bg-white/10 hover:bg-white hover:text-[#0B0B0C] transition-colors shrink-0 disabled:opacity-50"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.24)' }}
                      >
                        {submittingEmail ? 'Saving...' : 'Save Pass'}
                      </button>
                    </div>
                    {emailError && <p className="text-[11px] text-white/75">{emailError}</p>}
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // INLINE MODE: Editorial Full-Width Monochrome Homepage Section
  if (mode === 'inline') {
    return (
      <section
        aria-label="The Doffor Vault"
        className="w-full bg-[#0B0B0C] text-white border-y"
        style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
          {renderVaultExperience({ compact: false })}
        </div>
      </section>
    );
  }

  // FLOATING MODE: Minimal Bottom-Left Obsidian Pill + Full Luxury Modal
  const hiddenFloatingRoutes = ['/admin', '/checkout', '/auth'];
  const isRouteHidden = hiddenFloatingRoutes.some((prefix) => pathname?.startsWith(prefix));
  const isProductPage = Boolean(pathname?.startsWith('/product/'));
  if (config?.sections?.showVaultGame === false || isRouteHidden) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label={reward ? `Open Doffor Vault reward ${reward.code}` : 'Unlock Doffor Vault'}
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 sm:bottom-5 sm:left-5 z-[60] no-print group ${
          isProductPage ? 'hidden lg:inline-flex' : 'inline-flex'
        } items-center gap-2.5 bg-[#0B0B0C] text-white px-4 py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.34)] hover:bg-[#141417] transition-all duration-300`}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '9999px',
        }}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>

        <span className="text-[10px] font-medium uppercase tracking-[0.22em] whitespace-nowrap">
          {reward ? `Code: ${reward.code}` : 'Unlock Vault'}
        </span>

        <ArrowRight className="w-3 h-3 text-white/60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
      </button>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="The Doffor Vault"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in-slow"
          style={{ animationDuration: '220ms', animationDelay: '0ms' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0B0B0C] p-6 sm:p-9 shadow-[0_32px_90px_rgba(0,0,0,0.65)] animate-page-enter"
            style={{ border: '1px solid rgba(255, 255, 255, 0.16)' }}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Close The Doffor Vault"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/10 transition-colors"
              style={{ border: '1px solid rgba(255, 255, 255, 0.16)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {renderVaultExperience({ compact: true })}
          </div>
        </div>
      )}
    </>
  );
}
