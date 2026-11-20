'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  MapPin,
  Clock,
  Instagram,
  MessageCircle,
  Send,
  ChevronDown,
  CheckCircle2,
  Package,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { submitInquiry } from '../../lib/dataService';

const FAQS = [
  {
    q: 'How do Doffor oversized tees and full-sleeves fit?',
    a: 'All Drop 04 tees and full-sleeves are cut on our custom boxy drop-shoulder block. Order your usual size for our signature oversized street drape, or size down once for a closer regular fit. Check our interactive Size Guide for exact height/weight recommendations.',
  },
  {
    q: 'Will the 240–280 GSM cotton shrink or will the back print crack?',
    a: 'Every fabric lot is pre-shrunk and silicone bio-washed before cutting, keeping shrinkage under 1–2%. Our graphics use multi-pass high-density screen printing rather than vinyl transfers—wash cold inside-out and dry in shade to keep them crisp for years.',
  },
  {
    q: 'How fast will my order ship across India?',
    a: 'Orders dispatch from our fulfillment center within 24–48 business hours. Metro cities receive parcels in 2–4 business days; Tier-2/3 locations take 4–6 business days. Shipping is completely free above ₹1,499.',
  },
  {
    q: 'Is Razorpay UPI / Card checkout safe? Do you offer COD?',
    a: 'Yes—all prepaid payments (GPay, PhonePe, Paytm, Visa, Mastercard, RuPay) are processed through PCI-DSS Level 1 compliant Razorpay gateways. We also offer Cash on Delivery (₹49 COD handling fee) across 18,000+ pincodes.',
  },
  {
    q: 'How do I request a 7-day size exchange?',
    a: 'Just fill out the contact form on this page with your Order Number (e.g., DFR-2026-8412) and the size you want instead. Our team arranges doorstep reverse pickup within 24–48 hours.',
  },
  {
    q: 'Can Doffor produce custom heavyweight merch for our festival, brand, or crew?',
    a: 'Absolutely. We run custom 240–280 GSM collaborations starting at 30 pieces. Head to our Community & Collabs page or select "Custom Bulk / Collaboration" in the form here.',
  },
];

export default function ContactPage() {
  const { pushToast } = useStore();
  const [openFaq, setOpenFaq] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'Order & Tracking Support',
    orderNumber: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      pushToast('Please fill in your name, email, and message.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const entry = await submitInquiry({
        type: 'support',
        name: form.name.trim(),
        email: form.email.trim(),
        organization: form.topic,
        quantity: form.orderNumber.trim() ? `Order ${form.orderNumber.trim()}` : 'General Support',
        orderNumber: form.orderNumber.trim(),
        message: form.message.trim(),
      });
      setTicket(entry);
      setForm({
        name: '',
        email: '',
        topic: 'Order & Tracking Support',
        orderNumber: '',
        message: '',
      });
      pushToast('Message sent to Doffor HQ! Expect a reply within 4 business hours.');
    } catch (err) {
      pushToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Header */}
      <section className="border-b border-white/[0.08] bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <MessageCircle className="w-4 h-4" /> Direct Human Support
            </span>
            <h1 className="font-condensed text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              CONTACT <span className="text-acid">DOFFOR HQ</span>
            </h1>
            <p className="text-sm sm:text-base text-ash leading-relaxed">
              Questions on sizing, Razorpay checkout, live order tracking, or a 7-day size exchange?
              Write directly to our Bengaluru support desk—zero chatbots, real responses within 4
              working hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card-dark p-6 space-y-5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-acid">
                Studio &amp; Support Channels
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-sm bg-acid/10 border border-acid/30 flex items-center justify-center text-acid shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Support Email
                    </p>
                    <a
                      href="mailto:support@doffor.in"
                      className="font-display font-bold text-base text-bone hover:text-acid transition-colors"
                    >
                      support@doffor.in
                    </a>
                    <p className="text-xs text-ash mt-0.5">
                      Order issues, exchanges &amp; payment queries
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-sm bg-acid/10 border border-acid/30 flex items-center justify-center text-acid shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      WhatsApp &amp; Instagram DM Hours
                    </p>
                    <p className="font-display font-bold text-base text-bone">
                      Mon – Sat • 10:00 AM – 7:00 PM IST
                    </p>
                    <p className="text-xs text-ash mt-0.5">
                      Average response time: under 4 hours • @dofforclothing
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-sm bg-acid/10 border border-acid/30 flex items-center justify-center text-acid shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Doffor Design Studio HQ
                    </p>
                    <p className="text-sm text-bone leading-relaxed">
                      Doffor Clothing Co., #408, 12th Main Road, HAL 2nd Stage, Indiranagar,
                      Bengaluru, Karnataka 560038, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap gap-2.5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline py-2 px-3.5 text-[11px]"
                >
                  <Instagram className="w-3.5 h-3.5" /> Instagram DM
                </a>
                <Link href="/track-order" className="btn-outline py-2 px-3.5 text-[11px]">
                  <Package className="w-3.5 h-3.5" /> Track Order
                </Link>
              </div>
            </div>

            <div className="card-dark p-6 space-y-2.5 bg-surface">
              <p className="font-mono text-[10px] uppercase tracking-widest text-acid">
                Custom Event Or Bulk Merch?
              </p>
              <p className="text-sm text-ash">
                Commissioning 30+ custom heavyweight pieces for a music festival, brand drop, or
                college fest?
              </p>
              <Link
                href="/community#collabs"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-acid hover:underline pt-1"
              >
                Go To Bulk Collab Form <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-7">
            <div className="card-dark p-6 sm:p-8 border-white/15">
              {ticket ? (
                <div className="py-10 text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-acid/15 border border-acid/50 flex items-center justify-center text-acid mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-acid">
                      TICKET CREATED // #{ticket.id}
                    </p>
                    <h3 className="font-display font-bold text-2xl text-bone">
                      Message Received By Doffor HQ
                    </h3>
                    <p className="text-sm text-ash max-w-md mx-auto">
                      Thanks, <span className="text-bone font-semibold">{ticket.name}</span>. Our
                      support desk has logged your message and will reply to{' '}
                      <span className="text-acid">{ticket.email}</span> shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTicket(null)}
                    className="btn-outline"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h2 className="font-display font-bold text-2xl text-bone">
                      Send Us A Message
                    </h2>
                    <p className="text-xs text-ash mt-1">
                      Saved straight to our live Firestore support desk for immediate review.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="input-dark"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Topic
                      </label>
                      <select
                        name="topic"
                        value={form.topic}
                        onChange={handleChange}
                        className="input-dark"
                      >
                        <option value="Order & Tracking Support">Order &amp; Tracking Support</option>
                        <option value="7-Day Size Exchange Request">7-Day Size Exchange Request</option>
                        <option value="Sizing & Fabric Question">Sizing &amp; Fabric Question</option>
                        <option value="Razorpay / Payment Help">Razorpay / Payment Help</option>
                        <option value="Custom Bulk / Collaboration">Custom Bulk / Collaboration</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Order Number (Optional)
                      </label>
                      <input
                        type="text"
                        name="orderNumber"
                        value={form.orderNumber}
                        onChange={handleChange}
                        placeholder="e.g., DFR-2026-8412"
                        className="input-dark font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Share your question, desired replacement size, or details so we can resolve it on the first reply..."
                      className="input-dark resize-none"
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-acid w-full">
                    {submitting ? (
                      'Dispatching Message...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send To Doffor HQ
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="border-t border-white/[0.08] bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-8">
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <HelpCircle className="w-4 h-4" /> Quick Answers
            </span>
            <h2 className="font-condensed text-4xl sm:text-5xl uppercase tracking-tight">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-sm border transition-colors ${
                    isOpen
                      ? 'bg-obsidian border-acid/40'
                      : 'bg-obsidian/70 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-bone">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-acid shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-ash leading-relaxed border-t border-white/[0.06] pt-3.5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
