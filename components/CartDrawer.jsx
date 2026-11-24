'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../lib/format';

export default function CartDrawer() {
  const {
    items,
    subtotal,
    coupon,
    couponDiscount,
    freeShippingThreshold,
    amountToFreeShipping,
    standardShippingFee,
    drawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();
  const { pushToast } = useStore();
  const router = useRouter();

  const [codeInput, setCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  if (!drawerOpen) return null;

  const progress = Math.min(100, Math.round(((subtotal - couponDiscount) / freeShippingThreshold) * 100));
  const finalTotal = Math.max(0, subtotal - couponDiscount + standardShippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setApplying(true);
    try {
      await applyCouponCode(codeInput);
      setCodeInput('');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end no-print">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />

      <aside className="relative z-10 w-full max-w-md bg-white border-l border-black/10 h-full flex flex-col shadow-2xl">
        <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B0B0C]">
            Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 text-neutral-500 hover:text-[#0B0B0C] transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[#F6F5F2] border-b border-black/5">
          <p className="text-[11px] text-neutral-700 mb-2">
            {amountToFreeShipping === 0
              ? 'Complimentary express shipping unlocked.'
              : `Add ${formatINR(amountToFreeShipping)} more for complimentary express shipping.`}
          </p>
          <div className="w-full h-[2px] bg-black/10 overflow-hidden">
            <div className="h-full bg-[#0B0B0C] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-black/10">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <ShoppingBag className="w-8 h-8 stroke-[1.2] text-neutral-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#0B0B0C]">Your bag is empty</p>
                <p className="text-xs text-neutral-500">Heavyweight tees &amp; full-sleeves engineered for daily rotation.</p>
              </div>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  router.push('/shop');
                }}
                className="btn-acid"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="flex gap-4 py-4 first:pt-0">
                <Link
                  href={`/product/${item.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  className="w-20 h-24 bg-[#F2F1EC] shrink-0 overflow-hidden"
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="text-xs font-medium text-[#0B0B0C] hover:underline line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {item.color} / Size {item.size}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-black/15">
                      <button
                        onClick={() => updateQuantity(item.key, -1)}
                        className="px-2 py-1 text-neutral-600 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.key, 1)}
                        className="px-2 py-1 text-neutral-600 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-[#0B0B0C]">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-black/10 p-6 bg-[#F6F5F2] space-y-4">
            {coupon ? (
              <div className="flex items-center justify-between px-3 py-2 bg-white border border-black/15 text-xs">
                <span className="font-medium text-[#0B0B0C]">
                  Code {coupon.code} applied (-{formatINR(couponDiscount)})
                </span>
                <button onClick={removeCoupon} className="text-neutral-500 hover:text-black underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Promo code (e.g. DOFFOR10)"
                  className="input-dark text-xs py-2 flex-1 uppercase"
                />
                <button type="submit" disabled={applying} className="btn-outline py-2 px-4">
                  Apply
                </button>
              </form>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="text-[#0B0B0C]">{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-[#0B0B0C]">
                  {standardShippingFee === 0 ? 'Complimentary' : formatINR(standardShippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#0B0B0C] pt-2.5 border-t border-black/10">
                <span>Total (incl. GST)</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/cart" onClick={() => setDrawerOpen(false)} className="btn-outline text-center py-3">
                View Bag
              </Link>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  router.push('/checkout');
                }}
                className="btn-acid py-3"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
