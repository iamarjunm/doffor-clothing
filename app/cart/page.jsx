'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Lock,
  Banknote,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/ProductCard';
import { formatINR } from '../../lib/format';

const QUICK_PROMOS = [
  { code: 'DOFFOR10', label: '10% OFF' },
  { code: 'STUDENT10', label: 'STUDENT 10%' },
  { code: 'FIRSTDROP', label: '₹150 OFF' },
];

export default function CartPage() {
  const {
    items,
    subtotal,
    coupon,
    couponDiscount,
    freeShippingThreshold,
    amountToFreeShipping,
    standardShippingFee,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();
  const { products } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const netSubtotal = Math.max(0, subtotal - couponDiscount);
  const estimatedTotal = netSubtotal + standardShippingFee;
  const freeShipProgress = Math.min(100, Math.round((netSubtotal / freeShippingThreshold) * 100));

  const recommendedProducts = products
    .filter((p) => !items.some((i) => i.productId === p.id))
    .slice(0, 4);

  const handleApplyPromo = async (codeToApply) => {
    const code = (codeToApply ?? promoInput).trim();
    if (!code) return;
    setPromoError('');
    setApplyingPromo(true);
    try {
      await applyCouponCode(code);
      setPromoInput('');
    } catch (err) {
      setPromoError(err.message || 'Unable to apply promo code.');
    } finally {
      setApplyingPromo(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-bone pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ash hover:text-acid transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight uppercase">
              Your Bag{' '}
              <span className="font-mono text-acid text-xl sm:text-2xl align-middle">
                [{totalCount}]
              </span>
            </h1>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-ash">
            Pan-India Express Dispatch • 240–280 GSM Archive Drop
          </p>
        </div>

        {/* Empty Bag State */}
        {items.length === 0 ? (
          <div className="py-16">
            <div className="card-dark max-w-xl mx-auto p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-surface border border-white/10 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-acid" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl uppercase">Your Bag Is Empty</h2>
                <p className="text-sm text-ash max-w-sm mx-auto">
                  Drop 04 heavyweight oversized tees, archival full-sleeves, and boxy muscle tanks are live in limited batches.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link href="/shop" className="btn-acid">
                  Explore Drop 04 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/track-order" className="btn-outline">
                  Track Existing Order
                </Link>
              </div>
            </div>

            {recommendedProducts.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-xl uppercase tracking-wide">
                    Trending From Drop 04
                  </h3>
                  <Link
                    href="/shop"
                    className="font-mono text-xs uppercase tracking-widest text-acid hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {recommendedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Free Shipping Bar + Bag Items */}
            <div className="lg:col-span-8 space-y-5">
              {/* Free Shipping Meter */}
              <div className="card-dark p-5">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Truck className="w-4 h-4 text-acid shrink-0" />
                    {amountToFreeShipping === 0 ? (
                      <span className="font-medium text-bone">
                        Unlocked <strong className="text-acid">FREE Pan-India Shipping</strong> on your Drop 04 order!
                      </span>
                    ) : (
                      <span className="text-ash">
                        Add <strong className="text-bone font-mono">{formatINR(amountToFreeShipping)}</strong> more to unlock{' '}
                        <span className="text-acid font-semibold">FREE Pan-India Shipping</span>
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-acid font-bold shrink-0">
                    {freeShipProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-acid transition-all duration-500"
                    style={{ width: `${freeShipProgress}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  const lineCompare = item.compareAtPrice ? item.compareAtPrice * item.quantity : 0;

                  return (
                    <div
                      key={item.key}
                      className="card-dark p-4 sm:p-5 flex gap-4 sm:gap-5 transition-colors hover:border-white/20"
                    >
                      <Link
                        href={`/product/${item.slug || item.productId}`}
                        className="w-24 h-32 sm:w-28 sm:h-36 shrink-0 bg-surface rounded-sm overflow-hidden border border-white/10"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.slug || item.productId}`}
                              className="font-display font-bold text-base sm:text-lg text-bone hover:text-acid transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ash">
                              <span className="px-2 py-0.5 bg-surface border border-white/10 rounded-sm text-bone">
                                Size: {item.size}
                              </span>
                              <span className="px-2 py-0.5 bg-surface border border-white/10 rounded-sm">
                                {item.color}
                              </span>
                              {item.gsm && (
                                <span className="px-2 py-0.5 bg-acid/10 border border-acid/30 text-acid rounded-sm">
                                  {item.gsm} GSM
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.key)}
                            className="p-1.5 text-ash hover:text-crimson transition-colors shrink-0"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                          {/* Quantity Stepper */}
                          <div className="inline-flex items-center border border-white/15 bg-obsidian rounded-sm">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, -1)}
                              className="w-8 h-8 flex items-center justify-center text-ash hover:text-bone hover:bg-white/5 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center font-mono text-xs font-bold text-bone">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, 1)}
                              className="w-8 h-8 flex items-center justify-center text-ash hover:text-acid hover:bg-white/5 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {lineCompare > lineTotal && (
                                <span className="font-mono text-xs text-ash line-through">
                                  {formatINR(lineCompare)}
                                </span>
                              )}
                              <span className="font-mono font-bold text-base sm:text-lg text-bone">
                                {formatINR(lineTotal)}
                              </span>
                            </div>
                            <p className="font-mono text-[10px] text-ash">
                              {formatINR(item.price)} each • Incl. all taxes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Section */}
              <div className="card-dark p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-acid" />
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider">
                      Promo Code
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-ash">Tap a code to apply</span>
                </div>

                {coupon ? (
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm bg-acid/10 border border-acid/40">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-acid shrink-0" />
                      <div>
                        <p className="font-mono text-xs font-bold text-acid uppercase tracking-wider">
                          {coupon.code} Applied — Saving {formatINR(couponDiscount)}
                        </p>
                        <p className="text-xs text-bone/80 mt-0.5">{coupon.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="p-1.5 text-ash hover:text-bone transition-colors"
                      aria-label="Remove promo code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyPromo();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          if (promoError) setPromoError('');
                        }}
                        placeholder="Enter promo code (e.g. DOFFOR10)"
                        className="input-dark font-mono uppercase tracking-wider text-xs"
                      />
                      <button
                        type="submit"
                        disabled={applyingPromo || !promoInput.trim()}
                        className="btn-outline shrink-0 px-5 disabled:opacity-50"
                      >
                        {applyingPromo ? 'Checking...' : 'Apply'}
                      </button>
                    </form>

                    {promoError && (
                      <p className="font-mono text-xs text-crimson">{promoError}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMOS.map((p) => (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => handleApplyPromo(p.code)}
                          disabled={applyingPromo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface border border-white/10 hover:border-acid text-xs font-mono transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-acid" />
                          <span className="font-bold text-bone">{p.code}</span>
                          <span className="text-ash">• {p.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Order Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="card-dark p-6 space-y-5">
                <h2 className="font-display font-bold text-lg uppercase tracking-wider pb-3 border-b border-white/[0.08]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-ash">
                    <span>Subtotal ({totalCount} {totalCount === 1 ? 'piece' : 'pieces'})</span>
                    <span className="font-mono text-bone">{formatINR(subtotal)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-acid">
                      <span className="font-mono text-xs uppercase">Promo ({coupon?.code})</span>
                      <span className="font-mono font-semibold">-{formatINR(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-ash">
                    <span>Standard Shipping</span>
                    <span className={`font-mono ${standardShippingFee === 0 ? 'text-acid font-semibold' : 'text-bone'}`}>
                      {standardShippingFee === 0 ? 'FREE' : formatINR(standardShippingFee)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-bold uppercase text-base">Estimated Total</span>
                    <span className="font-mono font-bold text-2xl text-acid">
                      {formatINR(estimatedTotal)}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-ash mt-1">
                    Inclusive of GST • Express 48hr & COD options at checkout
                  </p>
                </div>

                <Link href="/checkout" className="btn-acid w-full py-4 text-center">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-white/[0.08] space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-sm bg-obsidian border border-white/[0.07]">
                      <Lock className="w-4 h-4 text-acid mx-auto mb-1" />
                      <p className="font-mono text-[10px] uppercase text-bone font-semibold">Razorpay</p>
                      <p className="text-[10px] text-ash">256-bit SSL</p>
                    </div>
                    <div className="p-2.5 rounded-sm bg-obsidian border border-white/[0.07]">
                      <ShieldCheck className="w-4 h-4 text-acid mx-auto mb-1" />
                      <p className="font-mono text-[10px] uppercase text-bone font-semibold">UPI / Cards</p>
                      <p className="text-[10px] text-ash">GPay & PhonePe</p>
                    </div>
                    <div className="p-2.5 rounded-sm bg-obsidian border border-white/[0.07]">
                      <Banknote className="w-4 h-4 text-acid mx-auto mb-1" />
                      <p className="font-mono text-[10px] uppercase text-bone font-semibold">COD Ready</p>
                      <p className="text-[10px] text-ash">Pan-India</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-ash text-center leading-relaxed">
                    Easy 7-day size exchanges across all serviceable Indian pincodes.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
