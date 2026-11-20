'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '../lib/dataService';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [joinedCode, setJoinedCode] = useState('');
  const { config, pushToast } = useStore();
  const footerCfg = config.footer || {};

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await subscribeNewsletter(email);
      setJoinedCode(res.coupon || 'FIRSTDROP');
      setEmail('');
      pushToast(`Subscribed — use ${res.coupon || 'FIRSTDROP'} on your first order`);
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0B0B0C] text-white mt-24 no-print">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        {/* Brand & Newsletter */}
        <div className="lg:col-span-5 space-y-6">
          <Link href="/" className="inline-block font-display font-bold text-2xl tracking-[0.34em] uppercase">
            {config.brandWordmark || 'DOFFOR'}
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            {footerCfg.bio ||
              'Independent Indian streetwear label focused on 240–280 GSM heavyweight jersey silhouettes, archival graphics, and enduring everyday construction.'}
          </p>

          <form onSubmit={handleSubscribe} className="max-w-sm space-y-2.5 pt-1">
            <label className="block text-[10px] uppercase tracking-[0.22em] text-neutral-400">
              Private Drop List — ₹150 Off First Order
            </label>
            <div className="flex border-b border-white/30 focus-within:border-white transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-2 text-white/80 hover:text-white transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {joinedCode && (
              <p className="text-xs text-white/80">
                Welcome. Apply code <span className="font-semibold underline">{joinedCode}</span> at checkout.
              </p>
            )}
          </form>
        </div>

        {/* Shop */}
        <div className="lg:col-span-2 space-y-3.5">
          <h4 className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 font-medium">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-300">
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
            <li><Link href="/collections/full-sleeves" className="hover:text-white transition-colors">Full-Sleeves</Link></li>
            <li><Link href="/collections/oversized-tees" className="hover:text-white transition-colors">Oversized Tees</Link></li>
            <li><Link href="/collections/muscle-tanks" className="hover:text-white transition-colors">Muscle Tanks</Link></li>
            <li><Link href="/collections/limited-drops" className="hover:text-white transition-colors">Limited Archive</Link></li>
            <li><Link href="/lookbook" className="hover:text-white transition-colors">Lookbook</Link></li>
          </ul>
        </div>

        {/* House */}
        <div className="lg:col-span-2 space-y-3.5">
          <h4 className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 font-medium">
            House
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-300">
            <li><Link href="/about" className="hover:text-white transition-colors">About Doffor</Link></li>
            <li><Link href="/community" className="hover:text-white transition-colors">Community & Collabs</Link></li>
            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/auth" className="hover:text-white transition-colors">Account</Link></li>
          </ul>
        </div>

        {/* Client Services */}
        <div className="lg:col-span-3 space-y-3.5">
          <h4 className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 font-medium">
            Client Services
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-300">
            <li><Link href="/size-guide" className="hover:text-white transition-colors">Size & Fit Guide</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-white transition-colors">Shipping & Exchanges</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>

          <p className="text-[11px] text-neutral-500 pt-4">
            Payments processed securely via Razorpay (UPI, Cards, Netbanking{config.codEnabled !== false ? ' & COD' : ''}).
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} {footerCfg.copyright || 'DOFFOR CLOTHING. ALL RIGHTS RESERVED.'}</p>
          <div className="flex items-center gap-6">
            <a
              href={footerCfg.instagramUrl || 'https://instagram.com'}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href={footerCfg.youtubeUrl || 'https://youtube.com'}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              YouTube
            </a>
            <span>India (INR ₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
