'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Printer,
  Truck,
  Package,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
  Box,
  Home,
} from 'lucide-react';
import { findOrderByNumberOrId } from '../../../lib/dataService';
import { formatINR, formatDate, ORDER_STATUS_META } from '../../../lib/format';

const STEPS = [
  { step: 1, key: 'processing', label: 'Placed', icon: Package },
  { step: 2, key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { step: 3, key: 'packed', label: 'Packed', icon: Box },
  { step: 4, key: 'shipped', label: 'Shipped', icon: Truck },
  { step: 5, key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderIdParam = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadOrder() {
      if (!orderIdParam) {
        setLoading(false);
        return;
      }
      try {
        const found = await findOrderByNumberOrId(decodeURIComponent(orderIdParam));
        if (active) setOrder(found);
      } catch (err) {
        console.error('[Order Confirmation Load Error]', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrder();
    return () => {
      active = false;
    };
  }, [orderIdParam]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-obsidian text-bone flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-acid animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-ash">
            Loading Order Receipt...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-obsidian text-bone flex items-center justify-center px-4 py-16">
        <div className="card-dark max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-crimson mx-auto" />
          <h1 className="font-display font-bold text-2xl uppercase">Order Not Found</h1>
          <p className="text-sm text-ash">
            We couldn&apos;t locate order <span className="font-mono text-bone">{orderIdParam}</span>. Double-check your order number or track another shipment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/track-order" className="btn-acid flex-1">
              Track Order
            </Link>
            <Link href="/shop" className="btn-outline flex-1">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.processing;
  const currentStep = statusMeta.step;
  const gstAmount = Math.round(order.total - order.total / 1.12);
  const taxableValue = order.total - gstAmount;

  return (
    <div className="min-h-screen bg-obsidian text-bone pb-24 print:bg-white print:text-black print:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Confirmation Hero Banner */}
        <div className="card-dark p-6 sm:p-8 border-acid/40 bg-gradient-to-br from-charcoal via-charcoal to-acid/[0.06] no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-sm bg-acid text-obsidian flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-acid font-bold">
                  Order Confirmed • Drop 04 Secured
                </p>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase mt-1">
                  Thank You, {order.customerName?.split(' ')[0] || 'Collector'}!
                </h1>
                <p className="text-sm text-ash mt-1">
                  Order <span className="font-mono text-bone font-bold">{order.orderNumber}</span> placed on{' '}
                  {formatDate(order.createdAt)}. Confirmation sent to{' '}
                  <span className="text-bone">{order.customerEmail}</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-outline px-4 py-2.5"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <Link
                href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                className="btn-acid px-4 py-2.5"
              >
                Track Order <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Razorpay / Payment Confirmation Strip */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-acid">
                <ShieldCheck className="w-4 h-4" />
                {order.paymentStatus === 'paid' ? 'RAZORPAY PAYMENT VERIFIED' : 'CASH ON DELIVERY SCHEDULED'}
              </span>
              {order.razorpayPaymentId && (
                <span className="px-2.5 py-1 rounded-sm bg-obsidian border border-white/10 text-bone">
                  Payment ID: {order.razorpayPaymentId}
                </span>
              )}
              {order.razorpayOrderId && (
                <span className="px-2.5 py-1 rounded-sm bg-obsidian border border-white/10 text-ash">
                  Ref: {order.razorpayOrderId}
                </span>
              )}
            </div>
            <span className={`px-2.5 py-1 rounded-sm border uppercase font-bold ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Order Status Stepper */}
        <div className="card-dark p-6 no-print">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider">
              Fulfillment Timeline
            </h2>
            {order.trackingNumber && (
              <span className="font-mono text-xs text-acid">
                AWB: {order.trackingNumber}
              </span>
            )}
          </div>

          <div className="relative grid grid-cols-5 gap-2">
            <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-white/10" />
            <div
              className="absolute top-4 left-[10%] h-0.5 bg-acid transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(4, currentStep - 1)) * 20}%` }}
            />
            {STEPS.map((s) => {
              const Icon = s.icon;
              const completed = currentStep >= s.step;
              const active = currentStep === s.step;
              return (
                <div key={s.key} className="relative flex flex-col items-center text-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      completed
                        ? 'bg-acid text-obsidian border-acid'
                        : 'bg-obsidian text-ash border-white/15'
                    } ${active ? 'ring-4 ring-acid/25' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider ${
                      completed ? 'text-bone font-bold' : 'text-ash'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Printable Tax Invoice */}
        <div className="card-dark p-6 sm:p-10 print:border print:border-zinc-300 print:bg-white print:text-black print:shadow-none">
          {/* Invoice Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10 print:border-zinc-300">
            <div>
              <p className="font-display font-extrabold text-2xl tracking-wider uppercase text-bone print:text-black">
                DOFFOR CLOTHING
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-acid print:text-zinc-700 mt-0.5">
                Heavyweight Archive Streetwear • Tax Invoice
              </p>
              <div className="mt-3 text-xs text-ash print:text-zinc-600 space-y-0.5 font-mono">
                <p>Doffor Apparel Studio Pvt. Ltd.</p>
                <p>100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038</p>
                <p>GSTIN: 29AABCD4821K1Z5 • support@doffor.in</p>
              </div>
            </div>

            <div className="sm:text-right font-mono text-xs space-y-1">
              <p className="text-ash print:text-zinc-500 uppercase">Invoice / Order No.</p>
              <p className="text-lg font-bold text-bone print:text-black">{order.orderNumber}</p>
              <p className="text-ash print:text-zinc-600">Date: {formatDate(order.createdAt)}</p>
              <p className="text-ash print:text-zinc-600 uppercase">
                Payment: {order.paymentMethod || 'Razorpay'}
              </p>
              {order.razorpayPaymentId && (
                <p className="text-acid print:text-zinc-800 text-[11px]">
                  Txn: {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/10 print:border-zinc-300 text-sm">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ash print:text-zinc-500 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-acid print:text-black" /> Ship To
              </p>
              <p className="font-bold text-bone print:text-black">
                {order.shippingAddress?.fullName || order.customerName}
              </p>
              <p className="text-ash print:text-zinc-700 mt-1">
                {order.shippingAddress?.line1}
                {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}
              </p>
              <p className="text-ash print:text-zinc-700">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} —{' '}
                <span className="font-mono">{order.shippingAddress?.pincode}</span>
              </p>
              <p className="font-mono text-xs text-ash print:text-zinc-700 mt-1">
                {order.shippingAddress?.phone || order.customerPhone}
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ash print:text-zinc-500 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-acid print:text-black" /> Payment Summary
              </p>
              <div className="space-y-1 text-xs font-mono">
                <p className="text-bone print:text-black">
                  Status:{' '}
                  <span className="uppercase font-bold text-acid print:text-black">
                    {order.paymentStatus === 'paid' ? 'PAID IN FULL' : 'PAY ON DELIVERY (COD)'}
                  </span>
                </p>
                <p className="text-ash print:text-zinc-700">
                  Method: <span className="uppercase text-bone print:text-black">{order.paymentMethod}</span>
                </p>
                {order.razorpayOrderId && (
                  <p className="text-ash print:text-zinc-700">Razorpay Order: {order.razorpayOrderId}</p>
                )}
                {order.razorpayPaymentId && (
                  <p className="text-ash print:text-zinc-700">Razorpay Payment: {order.razorpayPaymentId}</p>
                )}
                {order.trackingNumber && (
                  <p className="text-ash print:text-zinc-700">Courier AWB: {order.trackingNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 print:border-zinc-300 font-mono text-[11px] uppercase tracking-wider text-ash print:text-zinc-600">
                  <th className="py-2.5 pr-4">Garment</th>
                  <th className="py-2.5 px-3">Spec</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 pl-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] print:divide-zinc-200 text-sm">
                {(order.items || []).map((item, idx) => (
                  <tr key={`${item.productId || idx}-${item.size}-${item.color}`}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-14 object-cover rounded-sm bg-surface border border-white/10 no-print"
                          />
                        )}
                        <span className="font-display font-bold text-bone print:text-black">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-mono text-xs text-ash print:text-zinc-700">
                      Size {item.size} • {item.color}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-bone print:text-black">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-ash print:text-zinc-700">
                      {formatINR(item.price)}
                    </td>
                    <td className="py-4 pl-3 text-right font-mono font-bold text-bone print:text-black">
                      {formatINR(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Footer */}
          <div className="pt-6 border-t border-white/10 print:border-zinc-300 flex flex-col sm:flex-row justify-between gap-6">
            <div className="text-xs text-ash print:text-zinc-600 max-w-xs space-y-1 font-mono">
              <p className="uppercase font-bold text-bone print:text-black">Tax Breakdown (HSN 6109)</p>
              <p>Taxable Value: {formatINR(taxableValue)}</p>
              <p>IGST / CGST+SGST (12% incl.): {formatINR(gstAmount)}</p>
              <p className="pt-2">This is a computer-generated invoice and requires no signature.</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-ash print:text-zinc-700">
                <span>Subtotal</span>
                <span className="font-mono text-bone print:text-black">{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-acid print:text-black">
                  <span className="font-mono text-xs uppercase">
                    Promo {order.couponCode ? `(${order.couponCode})` : ''}
                  </span>
                  <span className="font-mono">-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ash print:text-zinc-700">
                <span>Shipping</span>
                <span className="font-mono text-bone print:text-black">
                  {order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}
                </span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between text-ash print:text-zinc-700">
                  <span>COD Handling Fee</span>
                  <span className="font-mono text-bone print:text-black">{formatINR(order.codFee)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10 print:border-zinc-300 flex justify-between items-baseline">
                <span className="font-display font-bold uppercase text-base">Grand Total</span>
                <span className="font-mono font-bold text-xl text-acid print:text-black">
                  {formatINR(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <Link href="/shop" className="btn-outline">
            Continue Shopping Drop 04
          </Link>
          <Link href="/account?tab=orders" className="btn-acid">
            View All My Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
