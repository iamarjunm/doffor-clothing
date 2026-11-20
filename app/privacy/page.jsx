'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, Eye, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview & Scope',
    body: [
      'Doffor Clothing Co. ("Doffor", "we", "our") respects your privacy and is committed to protecting the personal data you share when browsing our storefront, signing in with Google, placing an order, or contacting our studio.',
      'This Privacy Policy explains what data we collect, how it is processed through Firebase Authentication, Cloud Firestore, and Razorpay, and the rights available to you under India’s Digital Personal Data Protection (DPDP) Act, 2023 and applicable IT Rules.',
    ],
  },
  {
    id: 'data-collected',
    title: '2. Information We Collect',
    body: [
      'Account & Identity Data: Full name, email address, profile avatar URL (when signing in with Google), and phone number provided during checkout or account setup.',
      'Shipping & Order Data: Delivery address, landmark, city, state, Indian pincode, garment SKUs/sizes purchased, coupon codes applied, order status, and courier tracking numbers.',
      'Support & Collaboration Data: Messages, event/brand details, and email addresses submitted via our Contact HQ, Custom Collabs, or Drop Alert newsletter forms.',
      'Technical & Local Preference Data: Shopping bag items and wishlist selections stored locally in your browser (localStorage) to preserve your session across visits.',
    ],
  },
  {
    id: 'firebase-auth',
    title: '3. Firebase Authentication (Google Sign-In)',
    body: [
      'We use Google Firebase Authentication to provide fast, secure account creation and Google Sign-In/Sign-Up. When you choose "Continue with Google", authentication happens directly over Google’s encrypted OAuth 2.0 flow.',
      'Doffor receives only your basic profile claims (unique Firebase UID, display name, verified email address, and profile photo URL). We never receive, see, or store your Google account password, contacts, Gmail messages, or Drive files.',
      'Authentication tokens are transmitted exclusively over HTTPS/TLS and managed securely by Firebase SDKs. You may revoke Doffor’s OAuth access at any time from your Google Account Security settings.',
    ],
  },
  {
    id: 'firestore',
    title: '4. Cloud Firestore Order & Customer Records',
    body: [
      'Order histories, user profiles, product reviews, support tickets, and collaboration briefs are stored in Google Cloud Firestore—enterprise-grade cloud infrastructure protected with AES-256 encryption at rest and TLS encryption in transit.',
      'Access to customer order records is strictly scoped: signed-in customers can view only their own orders and profile details, while authorized Doffor fulfillment administrators access order shipping records solely to pack, dispatch, track, and support your deliveries.',
      'We retain tax and order invoice records as required under Indian GST and accounting laws, after which non-essential personal data is anonymized or purged upon request.',
    ],
  },
  {
    id: 'razorpay',
    title: '5. PCI-DSS Compliant Razorpay Payment Processing',
    body: [
      'All online prepaid transactions—including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, and NetBanking—are processed exclusively by Razorpay Software Private Limited, a PCI-DSS Level 1 compliant Indian payment gateway regulated in accordance with RBI guidelines.',
      'Doffor Clothing NEVER collects, processes, or stores your credit/debit card numbers, CVV codes, card expiry dates, netbanking credentials, or UPI PINs on our servers or in Firestore.',
      'Upon completing payment, Razorpay returns only non-sensitive transaction references (such as razorpay_order_id, razorpay_payment_id, payment method label, and cryptographic verification signature) so we can confirm and fulfill your order.',
    ],
  },
  {
    id: 'sharing',
    title: '6. How We Share Data (Zero Data Selling)',
    body: [
      'We never sell, rent, or trade your personal information to third-party data brokers or ad networks.',
      'We share only the minimum data necessary with trusted operational partners: (a) Logistics & courier partners (BlueDart, Delhivery, XpressBees) to deliver your parcel and send SMS/WhatsApp tracking pings; (b) Razorpay for payment authorization and refunds; and (c) Google Cloud / Firebase for secure hosting and authentication.',
    ],
  },
  {
    id: 'rights',
    title: '7. Your Privacy Rights & Grievance Officer',
    body: [
      'You have the right to request access to the personal data we hold about you, correct inaccurate shipping or profile information, opt out of Drop Alert emails at any time, or request deletion of your Doffor account and non-statutory personal records.',
      'To exercise any privacy right or raise a data concern, contact our designated Grievance Officer at support@doffor.in (Subject: "Privacy Request — Doffor Clothing") or write to Doffor Clothing Co., #408, 12th Main Road, Indiranagar, Bengaluru 560038. We respond to all verified privacy requests within 7 business days.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Header */}
      <section className="border-b border-white/[0.08] bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <Lock className="w-4 h-4" /> Trust &amp; Data Protection
            </span>
            <h1 className="font-condensed text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              PRIVACY <span className="text-acid">POLICY</span>
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-ash">
              EFFECTIVE DATE: NOVEMBER 2026 • DOFFOR CLOTHING CO. (INDIA)
            </p>
          </div>
        </div>
      </section>

      {/* Security Stack Summary Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Firebase Google OAuth 2.0',
              text: 'Zero Google password exposure; minimal profile claims over HTTPS.',
            },
            {
              icon: Lock,
              title: 'PCI-DSS Level 1 Razorpay',
              text: 'Card numbers, CVVs & UPI PINs never touch Doffor servers.',
            },
            {
              icon: Eye,
              title: 'Encrypted Firestore Records',
              text: 'AES-256 encrypted order records with strict user-scoped access.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card-dark p-5 flex items-start gap-3.5">
                <Icon className="w-5 h-5 text-acid shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-sm text-bone">{item.title}</p>
                  <p className="text-xs text-ash mt-1 leading-relaxed">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Quick TOC */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 card-dark p-6 space-y-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-acid">
              On This Page
            </p>
            <nav className="space-y-2">
              {SECTIONS.map((sec) => (
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
              <p className="text-xs text-ash">Have a question about your data?</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-acid hover:underline"
              >
                Contact Privacy Desk <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Policy Clauses */}
          <div className="lg:col-span-8 space-y-8">
            {SECTIONS.map((sec) => (
              <article
                key={sec.id}
                id={sec.id}
                className="scroll-mt-28 card-dark p-6 sm:p-8 space-y-4"
              >
                <h2 className="font-display font-bold text-xl text-bone">{sec.title}</h2>
                <div className="space-y-3">
                  {sec.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm text-ash leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
