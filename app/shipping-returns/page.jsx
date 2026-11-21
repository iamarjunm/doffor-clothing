'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  RefreshCw,
  CreditCard,
  Clock,
  ShieldCheck,
  Package,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
} from 'lucide-react';

const SHIPPING_ZONES = [
  {
    zone: 'Metro Cities',
    cities: 'Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad',
    dispatch: '24–48 Hours',
    eta: '2–4 Business Days',
    carriers: 'BlueDart Air / Delhivery Express',
  },
  {
    zone: 'Tier-2 & Tier-3 Cities',
    cities: 'Jaipur, Chandigarh, Kochi, Indore, Surat, Lucknow, Coimbatore, Nagpur & more',
    dispatch: '24–48 Hours',
    eta: '4–6 Business Days',
    carriers: 'Delhivery Surface / XpressBees',
  },
  {
    zone: 'Remote, Hills & Northeast',
    cities: 'Jammu & Kashmir, Himachal, Uttarakhand, Assam, Sikkim, Goa interiors & Islands',
    dispatch: '24–48 Hours',
    eta: '5–7 Business Days',
    carriers: 'BlueDart / India Post Priority',
  },
];

const EXCHANGE_STEPS = [
  {
    step: '01',
    title: 'Initiate Within 7 Days',
    detail:
      'Submit your order number (e.g. DFR-2026-XXXX) via our Contact HQ page or email support@doffor.in within 7 days of delivery.',
  },
  {
    step: '02',
    title: 'Doorstep Reverse Pickup',
    detail:
      'Our courier partner picks up the unworn garment from your address within 24–48 hours. Keep tags attached and pack inside the original Doffor zip pouch.',
  },
  {
    step: '03',
    title: 'Quality Check & Dispatch',
    detail:
      'Once inspected, your replacement size ships out on priority air express—or instant Doffor Store Credit is issued immediately upon pickup scan.',
  },
];

export default function ShippingReturnsPage() {
  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Header */}
      <section className="border-b border-white/[0.08] bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <Truck className="w-4 h-4" /> Pan-India Logistics &amp; Care
            </span>
            <h1 className="font-condensed text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              SHIPPING, PAYMENTS &amp; <span className="text-acid">7-DAY EXCHANGES</span>
            </h1>
            <p className="text-sm sm:text-base text-ash leading-relaxed">
              Transparent delivery timelines across 26,000+ Indian pincodes, instant Razorpay checkout
              rules, and hassle-free size swaps if your oversized fit needs adjustment.
            </p>
          </div>
        </div>
      </section>

      {/* Key Policy Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Truck,
              label: 'Free Shipping Threshold',
              value: 'FREE ABOVE ₹1,499',
              sub: 'Flat ₹79 standard shipping below ₹1,499',
            },
            {
              icon: Clock,
              label: 'Warehouse Dispatch',
              value: '24–48 HRS',
              sub: 'Live AWB tracking sent via Email & SMS',
            },
            {
              icon: RefreshCw,
              label: 'Size Exchange Window',
              value: '7 DAYS EASY SWAP',
              sub: 'Reverse pickup across serviceable pincodes',
            },
            {
              icon: ShieldCheck,
              label: 'Checkout Protection',
              value: 'RAZORPAY + COD',
              sub: 'UPI, Cards, NetBanking & Cash on Delivery',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card-dark p-5 space-y-2.5">
                <Icon className="w-5 h-5 text-acid" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash">
                  {card.label}
                </p>
                <p className="font-condensed text-2xl tracking-wide text-bone">{card.value}</p>
                <p className="text-xs text-ash">{card.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pan-India Express Shipping Timelines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-dark p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-acid flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Pan-India Express Network
              </p>
              <h2 className="font-display font-bold text-2xl text-bone mt-1">
                Estimated Delivery Timelines
              </h2>
            </div>
            <Link href="/track-order" className="btn-outline py-2.5 px-4 text-[11px]">
              Track Existing Order <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 font-mono text-[11px] uppercase tracking-widest text-ash">
                  <th className="py-3 px-4">Delivery Zone</th>
                  <th className="py-3 px-4">Coverage</th>
                  <th className="py-3 px-4">Dispatch</th>
                  <th className="py-3 px-4">Estimated Transit</th>
                  <th className="py-3 px-4">Partners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {SHIPPING_ZONES.map((z) => (
                  <tr key={z.zone} className="hover:bg-[#0B0B0C]/[0.04]">
                    <td className="py-4 px-4 font-display font-bold text-bone whitespace-nowrap">
                      {z.zone}
                    </td>
                    <td className="py-4 px-4 text-xs text-ash max-w-sm">{z.cities}</td>
                    <td className="py-4 px-4 font-mono text-xs text-bone whitespace-nowrap">
                      {z.dispatch}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-acid whitespace-nowrap">
                      {z.eta}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-ash whitespace-nowrap">
                      {z.carriers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-obsidian border border-white/[0.08] rounded-sm p-4">
              <p className="font-mono text-[11px] uppercase text-acid font-bold">
                Orders ₹1,499 &amp; Above
              </p>
              <p className="text-xs text-ash mt-1">
                Qualifies automatically for <strong className="text-bone">Free Standard Shipping</strong>{' '}
                across India (calculated after promo discounts).
              </p>
            </div>
            <div className="bg-obsidian border border-white/[0.08] rounded-sm p-4">
              <p className="font-mono text-[11px] uppercase text-bone font-bold">
                Orders Below ₹1,499
              </p>
              <p className="text-xs text-ash mt-1">
                Flat <strong className="text-bone">₹79</strong> tracked standard shipping. Upgrade to
                Priority Air Express for <strong className="text-bone">₹99</strong>.
              </p>
            </div>
            <div className="bg-obsidian border border-white/[0.08] rounded-sm p-4">
              <p className="font-mono text-[11px] uppercase text-bone font-bold">
                Order Cut-Off Time
              </p>
              <p className="text-xs text-ash mt-1">
                Prepaid orders placed before <strong className="text-bone">2:00 PM IST</strong>{' '}
                (Mon–Sat) enter same-day packing queues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Razorpay Prepaid vs COD Rules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-2 mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
            PAYMENT ARCHITECTURE
          </p>
          <h2 className="font-condensed text-4xl sm:text-5xl uppercase tracking-tight">
            RAZORPAY PREPAID VS. CASH ON DELIVERY
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prepaid */}
          <div className="card-dark p-7 border-acid/40 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-acid/15 border border-acid/40 flex items-center justify-center text-acid">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-bone">
                    Razorpay Prepaid (Recommended)
                  </h3>
                  <p className="font-mono text-[11px] text-acid uppercase">
                    ZERO EXTRA FEE • PRIORITY DISPATCH
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-bone/85">
              {[
                'Supports instant UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay) & NetBanking.',
                'Zero COD handling charges—every rupee goes toward your garments.',
                'Auto-confirmed immediately upon Razorpay payment signature verification for fastest warehouse dispatch.',
                'Eligible for instant original-source refunds (5–7 business days) in the rare case of damaged or out-of-stock items.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* COD */}
          <div className="card-dark p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#0B0B0C]/[0.05] border border-[#0B0B0C]/15 flex items-center justify-center text-bone">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-bone">
                  Cash On Delivery (COD)
                </h3>
                <p className="font-mono text-[11px] text-ash uppercase">
                  ₹49 COD CONVENIENCE FEE • ORDER VERIFICATION
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-ash">
              {[
                'Available across 18,000+ serviceable Indian pincodes on orders up to ₹4,999.',
                'A non-refundable ₹49 courier COD handling fee applies to cover cash-collection logistics.',
                'First-time COD orders may receive an automated WhatsApp/SMS confirmation ping before dispatch to prevent fake returns.',
                'Refunds for eligible COD returns are credited via UPI bank transfer or instant Doffor Store Credit.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-bone/70 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Hassle-Free 7-Day Size Exchange Policy */}
      <section className="border-t border-white/[0.08] bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
                ZERO-STRESS SIZING GUARANTEE
              </p>
              <h2 className="font-condensed text-4xl sm:text-5xl uppercase tracking-tight">
                HASSLE-FREE 7-DAY SIZE EXCHANGES
              </h2>
            </div>
            <Link href="/size-guide" className="btn-outline self-start">
              Check Fit Calculator First
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXCHANGE_STEPS.map((s) => (
              <div
                key={s.step}
                className="bg-obsidian border border-white/[0.08] rounded-sm p-6 space-y-3"
              >
                <span className="font-condensed text-4xl text-acid">{s.step}</span>
                <h3 className="font-display font-bold text-lg text-bone">{s.title}</h3>
                <p className="text-sm text-ash leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-obsidian border border-white/[0.08] rounded-sm p-6 space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-acid">
                Exchange Eligibility Checklist
              </h3>
              <ul className="space-y-2 text-sm text-bone/85">
                <li>• Request raised within 7 calendar days of delivery timestamp.</li>
                <li>• Garment must be unworn, unwashed, perfume-free, with original woven neck &amp; hang tags intact.</li>
                <li>• First size exchange per order is complimentary; subsequent swaps incur ₹99 two-way logistics.</li>
                <li>• If your desired size is sold out on a limited numbered drop, we issue 100% instant Doffor Store Credit (valid 12 months).</li>
              </ul>
            </div>

            <div className="bg-obsidian border border-white/[0.08] rounded-sm p-6 space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-bone">
                Damaged Or Wrong Item Guarantee
              </h3>
              <p className="text-sm text-ash leading-relaxed">
                Every parcel is QC-checked before dispatch, but if you ever receive a manufacturing
                defect, print flaw, or wrong size/color, message us within 48 hours of delivery with a
                quick photo. We prioritize a free express replacement or full refund to your original
                Razorpay payment method—zero hassle.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-acid py-2.5 px-5 text-[11px]">
                  Request Exchange / Support
                </Link>
                <Link href="/track-order" className="btn-outline py-2.5 px-5 text-[11px]">
                  Track Parcel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
