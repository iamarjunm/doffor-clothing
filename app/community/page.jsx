'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  Sparkles,
  Users,
  Zap,
  Send,
  ArrowRight,
  Tag,
  Star,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { submitInquiry } from '../../lib/dataService';

const PERK_CODES = [
  {
    code: 'STUDENT10',
    badge: 'STUDENT & CREATOR PERK',
    discount: '10% OFF',
    minOrder: 'Valid on orders above ₹799 • Max savings ₹500',
    description:
      'Built for students, indie musicians, film crews, and young designers across India. Instant checkout discount—no slow verification portals.',
  },
  {
    code: 'DOFFOR10',
    badge: 'COMMUNITY DROP CODE',
    discount: '10% OFF',
    minOrder: 'Valid on Drop 04 orders above ₹799 • Max savings ₹500',
    description:
      'Share with your crew or use on your next heavyweight full-sleeve, bootleg oversized tee, or boxy muscle tank pickup.',
  },
  {
    code: 'DROP20',
    badge: 'HEAVY HAUL TIER',
    discount: '20% OFF',
    minOrder: 'Valid on orders above ₹2,499 • Free Express Shipping included',
    description:
      'Building a 2-to-3 piece rotation with friends? Unlock 20% off your entire bag plus priority pan-India dispatch.',
  },
];

const COLLECTIVE_PERKS = [
  {
    icon: Zap,
    title: 'Early Drop Seeding',
    description:
      'Receive complimentary unreleased Doffor garments 10 days before public drop dates so you can style, shoot, and test every GSM weight first.',
  },
  {
    icon: Tag,
    title: 'Exclusive 20% Creator Code',
    description:
      'Get your own personalized 20% discount code to share with your audience, plus monthly store credit and cash commission on every verified order.',
  },
  {
    icon: Star,
    title: 'Lookbook & Campaign Features',
    description:
      'Top Collective stylists, photographers, skaters, and DJs get booked for official Doffor seasonal campaigns, zines, and flagship homepage spreads.',
  },
  {
    icon: Users,
    title: 'Studio Sessions & Backstage Passes',
    description:
      'Direct invite list for Doffor pop-ups, underground listening nights, and design reviews in Bengaluru, Mumbai, and New Delhi.',
  },
];

export default function CommunityPage() {
  const { pushToast } = useStore();
  const [copiedCode, setCopiedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    quantity: '50–100 Heavyweight Tees',
    message: '',
  });

  const handleCopyCode = async (code) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(code);
      pushToast(`Copied promo code ${code} to clipboard!`);
      setTimeout(() => setCopiedCode(''), 2400);
    } catch {
      pushToast(`Use code ${code} at checkout`, 'info');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollabSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.organization.trim()) {
      pushToast('Please complete your name, email, and brand/event name.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const entry = await submitInquiry({
        type: 'custom-collab',
        name: form.name.trim(),
        email: form.email.trim(),
        organization: form.organization.trim(),
        quantity: form.quantity.trim(),
        message: form.message.trim(),
      });
      setSubmittedEntry(entry);
      setForm({
        name: '',
        email: '',
        organization: '',
        quantity: '50–100 Heavyweight Tees',
        message: '',
      });
      pushToast('Collaboration brief received! Doffor Studio will reply within 24 hrs.');
    } catch (err) {
      pushToast(err.message || 'Could not submit inquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Hero */}
      <section className="relative border-b border-white/[0.08] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/lookbook-campus-2.jpg"
            alt="Doffor Community & Culture"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/85 to-obsidian" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-acid/15 border border-acid/40 text-acid font-mono text-[11px] font-bold uppercase tracking-[0.22em]">
              <Flame className="w-3.5 h-3.5" /> Doffor Culture // Collective & Perks
            </span>
            <h1 className="font-condensed text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              BUILT FOR CREWS, CREATORS &amp;{' '}
              <span className="text-acid">THE UNDERGROUND</span>
            </h1>
            <p className="text-base sm:text-lg text-bone/80 leading-relaxed">
              Doffor isn&apos;t a billboard—it&apos;s a uniform worn at indie gigs, design labs,
              late-night gym sessions, and cultural fests across India. Claim instant community codes,
              join the Doffor Collective, or commission custom 240–280 GSM pieces for your event or
              brand.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#perks" className="btn-acid">
                Unlock Perk Codes
              </a>
              <a href="#collabs" className="btn-outline">
                Custom Bulk Collabs <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Student & Creator Perks */}
      <section id="perks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
              SECTION 01 // INSTANT ACCESS
            </p>
            <h2 className="font-condensed text-4xl sm:text-5xl uppercase tracking-tight">
              STUDENT &amp; CREATOR PERKS
            </h2>
          </div>
          <p className="text-sm text-ash max-w-md">
            Tap any code to copy it instantly and paste it directly inside your Doffor shopping bag or
            Razorpay checkout screen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERK_CODES.map((perk) => {
            const isCopied = copiedCode === perk.code;
            return (
              <div
                key={perk.code}
                className="card-dark p-6 flex flex-col justify-between gap-6 border-white/10 hover:border-acid/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ash">
                      {perk.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-acid text-obsidian font-mono text-[11px] font-bold">
                      {perk.discount}
                    </span>
                  </div>

                  <div className="bg-obsidian border border-dashed border-acid/50 rounded-sm p-4 flex items-center justify-between gap-3">
                    <span className="font-mono font-bold text-2xl tracking-[0.16em] text-acid">
                      {perk.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(perk.code)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-white/[0.06] hover:bg-acid hover:text-obsidian font-mono text-[11px] font-bold uppercase tracking-wider transition-colors"
                    >
                      {isCopied ? (
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

                  <p className="text-sm text-bone/85 leading-relaxed">{perk.description}</p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-ash">{perk.minOrder}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Doffor Collective / Brand Ambassador Program */}
      <section className="border-y border-white/[0.08] bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> SECTION 02 // BRAND AMBASSADORS
              </p>
              <h2 className="font-condensed text-4xl sm:text-6xl uppercase leading-[0.92] tracking-tight">
                THE DOFFOR COLLECTIVE
              </h2>
              <p className="text-sm sm:text-base text-ash leading-relaxed">
                We partner with photographers, visual artists, DJs, skaters, athletes, and campus
                tastemakers who move culture forward. No rigid scripts—just heavyweight silhouettes,
                early seeding, and creative freedom.
              </p>

              <div className="rounded-sm overflow-hidden border border-white/10 aspect-[16/10] bg-obsidian">
                <img
                  src="/images/lookbook-campus-1.jpg"
                  alt="Doffor Collective Lookbook Feature"
                  className="w-full h-full object-cover"
                />
              </div>

              <a
                href="#collabs"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: 'Doffor Collective Ambassador Application',
                    message:
                      prev.message ||
                      'Applying for the Doffor Collective. Instagram/Portfolio link: ',
                  }))
                }
                className="btn-acid w-full sm:w-auto"
              >
                Apply For The Collective <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {COLLECTIVE_PERKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-obsidian border border-white/[0.08] rounded-sm p-6 space-y-4 hover:border-acid/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-sm bg-acid/10 border border-acid/40 flex items-center justify-center text-acid">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-bone">{item.title}</h3>
                    <p className="text-sm text-ash leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Custom Crew, Event & Fest Bulk Collaborations Form */}
      <section id="collabs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
              SECTION 03 // CUSTOM STUDIO RUNS
            </p>
            <h2 className="font-condensed text-4xl sm:text-5xl uppercase leading-[0.94] tracking-tight">
              CUSTOM CREW, EVENT &amp; FEST BULK COLLABORATIONS
            </h2>
            <p className="text-sm sm:text-base text-ash leading-relaxed">
              Stop printing your festival, music tour, design studio, or college society merch on thin
              160 GSM throwaway blanks. Doffor Studio produces custom-labeled 240–280 GSM boxy drops
              starting at 30 pieces.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Minimum order starts at just 30 heavyweight pieces',
                'Custom co-branded woven neck labels & screen-printed back graphics',
                'Dedicated design support & pre-production GSM fabric swatches',
                '10–14 day pan-India express turnaround for events & fests',
              ].map((point) => (
                <div key={point} className="flex items-start gap-2.5 text-sm text-bone/85">
                  <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="card-dark p-5 space-y-2 mt-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-acid">
                Direct Collab Desk
              </p>
              <p className="text-sm text-bone">
                Need urgent festival pricing or Pantone swatch cards? Email{' '}
                <a href="mailto:support@doffor.in" className="text-acid underline">
                  support@doffor.in
                </a>{' '}
                or submit the brief right here.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="card-dark p-6 sm:p-8 border-white/15">
              {submittedEntry ? (
                <div className="py-10 text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-acid/15 border border-acid/50 flex items-center justify-center text-acid mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-acid">
                      BRIEF LOGGED // REF #{submittedEntry.id}
                    </p>
                    <h3 className="font-display font-bold text-2xl text-bone">
                      We&apos;ve Got Your Collab Brief
                    </h3>
                    <p className="text-sm text-ash max-w-md mx-auto">
                      Thanks, <span className="text-bone font-semibold">{submittedEntry.name}</span>.
                      Our production desk has received your request for{' '}
                      <span className="text-bone">{submittedEntry.organization}</span> and will email{' '}
                      <span className="text-acid">{submittedEntry.email}</span> within 24 hours with
                      GSM pricing tiers.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmittedEntry(null)}
                      className="btn-outline"
                    >
                      Submit Another Brief
                    </button>
                    <Link href="/shop" className="btn-acid">
                      Browse Drop 04 <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCollabSubmit} className="space-y-5">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="font-display font-bold text-xl text-bone">
                      Start A Collaboration Brief
                    </h3>
                    <p className="text-xs text-ash mt-1">
                      Routes directly to the Doffor Studio &amp; Admin production queue.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g., Kabir Malhotra"
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
                        placeholder="you@studio.in"
                        className="input-dark"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Brand / Event / College Name *
                      </label>
                      <input
                        type="text"
                        name="organization"
                        required
                        value={form.organization}
                        onChange={handleChange}
                        placeholder="e.g., Echoes Fest / Indie Label / IIT"
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                        Estimated Quantity / Program *
                      </label>
                      <select
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        className="input-dark"
                      >
                        <option value="30–50 Heavyweight Pieces">30–50 Heavyweight Pieces</option>
                        <option value="50–100 Heavyweight Tees">50–100 Heavyweight Pieces</option>
                        <option value="100–250 Event / Fest Drop">100–250 Event / Fest Drop</option>
                        <option value="250+ Custom Capsule">250+ Custom Capsule</option>
                        <option value="Doffor Collective Ambassador Application">
                          Doffor Collective Ambassador Application
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                      Brief / Silhouettes / Timeline *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us the silhouettes you want (240 GSM oversized tees, 260 GSM full-sleeves, muscle tanks), event date, city, or share your Instagram / portfolio link if applying for the Collective."
                      className="input-dark resize-none"
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-acid w-full">
                    {submitting ? (
                      'Sending Brief...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Collaboration Brief
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
