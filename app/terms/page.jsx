'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, FileText, ArrowRight } from 'lucide-react';

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance Of Terms',
    paragraphs: [
      'Welcome to Doffor Clothing Co. ("Doffor", "we", "us"). By accessing or purchasing from our website, creating an account via Firebase Authentication / Google Sign-In, or placing an order for our apparel and accessories, you agree to be bound by these Terms & Conditions and our Privacy Policy.',
      'You represent that you are at least 18 years of age, or accessing this storefront under the supervision of a parent or legal guardian, and are legally capable of entering into binding contracts under the Indian Contract Act, 1872.',
    ],
  },
  {
    id: 'drops-pricing',
    title: '2. Product Drops, Limited Runs & INR Pricing',
    paragraphs: [
      'All prices displayed on Doffor Clothing are in Indian Rupees (INR / ₹) and are inclusive of applicable Goods & Services Tax (GST) unless explicitly stated otherwise at checkout.',
      'Doffor produces heavyweight garments in deliberate small-batch drops (including numbered 100-piece limited archive runs). Adding an item to your shopping bag does not reserve stock until checkout is completed. We reserve the right to limit per-customer quantities on limited drops and to correct typographical pricing errors prior to dispatch.',
      'Due to pigment-dyeing, enzyme bio-washing, and screen calibration differences across devices, subtle tonal variations in fabric shade or distressed print texture are inherent characteristics of authentic craft and are not considered defects.',
    ],
  },
  {
    id: 'orders-payments',
    title: '3. Orders, Razorpay Checkout & Cancellations',
    paragraphs: [
      'Orders may be paid via Razorpay (UPI, GPay, PhonePe, Paytm, Visa, Mastercard, RuPay, NetBanking) or Cash on Delivery (COD) where serviceable. COD orders carry a ₹49 handling fee and may require automated phone/WhatsApp confirmation prior to shipment.',
      'Order Cancellation Window: You may request cancellation of an unshipped order by contacting support@doffor.in before the parcel status changes to "Packed" or "Shipped". Once handed over to our courier partner, cancellations are not possible and the order falls under our 7-day exchange guidelines.',
      'We reserve the right to cancel suspicious, fraudulent, or unverified high-risk COD orders, with full immediate refunds issued for any prepaid Razorpay amount.',
    ],
  },
  {
    id: 'shipping',
    title: '4. Pan-India Shipping & Delivery',
    paragraphs: [
      'Orders above ₹1,499 (net of discounts) qualify for Free Standard Shipping across India. Standard transit times are 2–4 business days for Metro cities and 4–7 business days for Tier-2/3 and remote pincodes after a 24–48 hour dispatch window.',
      'Accurate delivery address, landmark, pincode, and active phone number are the customer’s responsibility. Parcels returned to origin (RTO) due to repeated failed delivery attempts or incorrect contact details may incur a re-shipping fee.',
    ],
  },
  {
    id: 'exchanges',
    title: '5. 7-Day Size Exchanges & Defect Claims',
    paragraphs: [
      'We offer hassle-free 7-day size exchanges on unworn, unwashed garments returned with original tags and reusable Doffor zip packaging intact. Full process details are outlined on our Shipping & Returns page.',
      'In the event of a verified manufacturing defect, transit damage, or wrong item delivered, contact us within 48 hours of receipt with photo evidence for a priority free replacement or full refund to your original Razorpay payment source (5–7 business days).',
    ],
  },
  {
    id: 'promos',
    title: '6. Promo Codes, Community Perks & Bundles',
    paragraphs: [
      'Promotional codes such as DOFFOR10, STUDENT10, FIRSTDROP, and DROP20 are subject to minimum cart thresholds, maximum discount caps, and validity periods. Only one promo code may be applied per order unless explicitly stated.',
      'Abuse of referral codes, automated scraping, or unauthorized commercial resale of Doffor garments may result in account suspension and cancellation of pending orders.',
    ],
  },
  {
    id: 'ip',
    title: '7. Intellectual Property',
    paragraphs: [
      'All artwork, back-print illustrations (including Winged Angel, Unleash The Dragon, and Drop 04 Archive Grunge graphics), garment patterns, lookbook photography, typography, logos, and website code are the exclusive intellectual property of Doffor Clothing Co. or its licensed artists.',
      'No part of this storefront or its graphics may be copied, reproduced, reverse-engineered, or used for commercial merchandise without prior written consent from Doffor Clothing Co.',
    ],
  },
  {
    id: 'liability-law',
    title: '8. Limitation Of Liability & Governing Law',
    paragraphs: [
      'To the maximum extent permitted by Indian law, Doffor Clothing Co. shall not be liable for any indirect, incidental, or consequential damages arising from courier delays, force majeure events, or third-party service outages. Our aggregate liability for any order shall not exceed the total INR amount paid by you for that order.',
      'These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to your use of Doffor Clothing shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Header */}
      <section className="border-b border-white/[0.08] bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <Scale className="w-4 h-4" /> Legal &amp; Storefront Terms
            </span>
            <h1 className="font-condensed text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              TERMS &amp; <span className="text-acid">CONDITIONS</span>
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-ash">
              LAST UPDATED: NOVEMBER 2026 • DOFFOR CLOTHING CO. — BENGALURU, INDIA
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sticky TOC */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 card-dark p-6 space-y-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-acid flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Clauses
            </p>
            <nav className="space-y-2">
              {TERMS_SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-xs font-mono text-ash hover:text-acid transition-colors py-1"
                >
                  {sec.title}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ash">
                Related Policies
              </p>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <Link href="/shipping-returns" className="text-bone hover:text-acid">
                  → Shipping &amp; 7-Day Exchanges
                </Link>
                <Link href="/privacy" className="text-bone hover:text-acid">
                  → Privacy Policy
                </Link>
                <Link href="/contact" className="text-acid hover:underline inline-flex items-center gap-1 pt-1">
                  Questions? Contact HQ <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Sections */}
          <div className="lg:col-span-8 space-y-6">
            {TERMS_SECTIONS.map((sec) => (
              <article
                key={sec.id}
                id={sec.id}
                className="scroll-mt-28 card-dark p-6 sm:p-8 space-y-4"
              >
                <h2 className="font-display font-bold text-xl text-bone">{sec.title}</h2>
                <div className="space-y-3">
                  {sec.paragraphs.map((p) => (
                    <p key={p} className="text-sm text-bone/80 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            <div className="card-dark p-6 sm:p-8 border-acid/30 bg-surface space-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-acid">
                Registered Studio Contact
              </p>
              <p className="text-sm text-bone/85 leading-relaxed">
                Doffor Clothing Co., #408, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru,
                Karnataka 560038, India • Email:{' '}
                <a href="mailto:support@doffor.in" className="text-acid underline">
                  support@doffor.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
