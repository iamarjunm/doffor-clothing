'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  CheckCircle2,
  Box,
  Truck,
  Home,
  MapPin,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { findOrderByNumberOrId } from '../../lib/dataService';
import { formatINR, formatDate, ORDER_STATUS_META } from '../../lib/format';

const SAMPLE_ORDERS = ['DFR-2026-8412', 'DFR-2026-8419'];

const TIMELINE_STEPS = [
  { step: 1, key: 'processing', label: 'Placed', desc: 'Order received', icon: Package },
  { step: 2, key: 'confirmed', label: 'Confirmed', desc: 'Payment verified', icon: CheckCircle2 },
  { step: 3, key: 'packed', label: 'Packed', desc: 'QC & sealed', icon: Box },
  { step: 4, key: 'shipped', label: 'Shipped', desc: 'In air transit', icon: Truck },
  { step: 5, key: 'delivered', label: 'Delivered', desc: 'Handed over', icon: Home },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('order') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const performLookup = useCallback(async (orderCode) => {
    const clean = String(orderCode || '').trim();
    if (!clean) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await findOrderByNumberOrId(clean);
      setOrder(result);
    } catch (err) {
      console.error('[Track Order Error]', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performLookup(initialQuery);
    }
  }, [initialQuery, performLookup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performLookup(query);
  };

  const handleCopyTracking = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard?.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusMeta = order ? ORDER_STATUS_META[order.status] || ORDER_STATUS_META.processing : null;
  const currentStep = statusMeta?.step ?? 0;

  return (
    <div className="min-h-screen bg-obsidian text-bone pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        {/* Hero Search Box */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
            Pan-India Air Express Tracking
          </p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tight">
            Track Your Drop
          </h1>
          <p className="text-sm text-ash">
            Enter your Doffor Order Number (e.g. <span className="font-mono text-bone">DFR-2026-8412</span>) to see live warehouse status, BlueDart / Delhivery AWB, and garment breakdown.
          </p>

          <form onSubmit={handleSubmit} className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ash absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="Enter Order Number (e.g. DFR-2026-8412)"
                className="input-dark pl-11 py-3.5 font-mono uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-acid px-7 py-3.5 shrink-0 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Locating...
                </>
              ) : (
                'Track Shipment'
              )}
            </button>
          </form>

          {/* Quick-Try Sample Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
              Quick Try:
            </span>
            {SAMPLE_ORDERS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  performLookup(sample);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-charcoal border border-white/10 hover:border-acid font-mono text-xs text-bone hover:text-acid transition-colors"
              >
                <Sparkles className="w-3 h-3 text-acid" /> {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-acid animate-spin mx-auto" />
            <p className="font-mono text-xs text-ash mt-2 uppercase tracking-widest">
              Querying Dispatch Hub...
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && searched && !order && (
          <div className="card-dark max-w-xl mx-auto p-8 text-center space-y-3 border-crimson/35">
            <AlertCircle className="w-9 h-9 text-crimson mx-auto" />
            <h2 className="font-display font-bold text-xl uppercase">Order Not Found</h2>
            <p className="text-sm text-ash">
              No shipment matched <span className="font-mono text-bone">{query}</span>. Please check your confirmation email or try one of the sample order numbers above.
            </p>
          </div>
        )}

        {/* Order Found Result */}
        {!loading && order && (
          <div className="space-y-6 animate-fade-up">
            {/* Summary Header Card */}
            <div className="card-dark p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-mono font-bold text-2xl text-bone">
                      {order.orderNumber}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-sm border font-mono text-xs uppercase font-bold ${statusMeta.color}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-ash mt-1.5">
                    Placed on {formatDate(order.createdAt)} • {order.customerName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/order-confirmation/${encodeURIComponent(order.orderNumber)}`}
                    className="btn-outline py-2.5 px-4 text-xs"
                  >
                    <FileText className="w-4 h-4" /> View Tax Invoice
                  </Link>
                </div>
              </div>

              {/* 5-Step Horizontal Shipping Timeline */}
              {order.status === 'cancelled' ? (
                <div className="p-4 rounded-sm bg-crimson/15 border border-crimson/40 flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-crimson shrink-0" />
                  <span>
                    This order has been cancelled. If you paid online via Razorpay, your refund is processed within 3–5 business days.
                  </span>
                </div>
              ) : (
                <div className="py-2 overflow-x-auto">
                  <div className="min-w-[540px] relative grid grid-cols-5 gap-3">
                    <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-white/10" />
                    <div
                      className="absolute top-5 left-[10%] h-0.5 bg-acid transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(4, currentStep - 1)) * 20}%` }}
                    />
                    {TIMELINE_STEPS.map((st) => {
                      const Icon = st.icon;
                      const done = currentStep >= st.step;
                      const isCurrent = currentStep === st.step;
                      return (
                        <div
                          key={st.key}
                          className="relative z-10 flex flex-col items-center text-center"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                              done
                                ? 'bg-acid text-obsidian border-acid'
                                : 'bg-obsidian text-ash border-white/15'
                            } ${isCurrent ? 'ring-4 ring-acid/25' : ''}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <p
                            className={`mt-2.5 font-mono text-xs uppercase font-bold tracking-wider ${
                              done ? 'text-bone' : 'text-ash'
                            }`}
                          >
                            {st.label}
                          </p>
                          <p className="text-[11px] text-ash mt-0.5">{st.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Courier AWB & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
                <div className="p-4 rounded-sm bg-obsidian border border-white/[0.07] space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ash flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-acid" /> Courier Tracking ID (AWB)
                  </p>
                  {order.trackingNumber ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-base text-acid">
                        {order.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyTracking}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface border border-white/10 hover:border-acid font-mono text-[11px] text-bone transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-acid" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-ash">
                      Awaiting courier handover — your BlueDart / Delhivery tracking ID will appear here once packed.
                    </p>
                  )}
                  <div className="pt-1 flex items-center gap-2 font-mono text-[11px] text-ash">
                    <ShieldCheck className="w-3.5 h-3.5 text-acid" />
                    <span className="uppercase">
                      {order.paymentStatus === 'paid' ? 'Prepaid' : 'Cash on Delivery'} •{' '}
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-sm bg-obsidian border border-white/[0.07] space-y-1.5">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ash flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-acid" /> Shipping Destination
                  </p>
                  <p className="font-display font-bold text-sm text-bone">
                    {order.shippingAddress?.fullName || order.customerName}
                  </p>
                  <p className="text-xs text-ash">
                    {order.shippingAddress?.line1}
                    {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}
                  </p>
                  <p className="text-xs text-bone font-mono">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} —{' '}
                    {order.shippingAddress?.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Ordered Garments */}
            <div className="card-dark p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="font-display font-bold text-base uppercase tracking-wider">
                  Ordered Garments ({(order.items || []).reduce((s, i) => s + i.quantity, 0)})
                </h3>
                <span className="font-mono font-bold text-lg text-acid">
                  {formatINR(order.total)}
                </span>
              </div>

              <div className="divide-y divide-white/[0.07]">
                {(order.items || []).map((item, idx) => (
                  <div key={`${item.productId || idx}-${item.size}`} className="py-4 flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-sm bg-surface border border-white/10 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm sm:text-base text-bone">
                        {item.name}
                      </p>
                      <p className="font-mono text-xs text-ash mt-1">
                        Size {item.size} • {item.color} • Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <p className="font-bold text-sm text-bone">
                        {formatINR(item.price * item.quantity)}
                      </p>
                      <p className="text-[11px] text-ash">{formatINR(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] bg-obsidian text-bone flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-acid animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
