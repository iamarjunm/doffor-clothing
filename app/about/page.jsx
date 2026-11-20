'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  Scissors,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Award,
  Flame,
} from 'lucide-react';

const ENGINEERING_PILLARS = [
  {
    index: '01',
    icon: Layers,
    title: '240–280 GSM Super-Combed Cotton',
    metric: 'ZERO CLING • ZERO TRANSPARENCY',
    description:
      'Every Doffor silhouette begins at custom knitting looms in Tirupur using long-staple 100% super-combed cotton yarns. We mill between 240 GSM loop-knit for all-season breathability and 280 GSM interlock for structured evening weight, then silicone bio-wash and pre-shrink every batch so it drapes broken-in on day one.',
    specs: [
      '2.5 cm Lycra-reinforced rib neckband engineered never to bacon or sag',
      'Compact combed yarns eliminate surface pilling across years of rotation',
      'Enzyme & bio-wash finish tuned for Indian humidity and year-round wear',
    ],
  },
  {
    index: '02',
    icon: Sparkles,
    title: 'High-Density Archival Prints',
    metric: 'MULTI-PASS SCREEN • CRACK-RESIST INK',
    description:
      'No cheap heat-press transfers that peel after three washes. Our back graphics are pulled by hand on multi-station carousels using high-opacity plastisol, puff accents, and jumbo halftone screens—giving our acid-yellow, terracotta, and bone inks deep texture that locks into heavy jersey fibers.',
    specs: [
      'Jumbo back-panel screens calibrated for full architectural coverage',
      'Dual-cure thermal tunnel drying for wash-fast graphic contrast',
      'Custom grunge distressing drawn in-house by independent graphic artists',
    ],
  },
  {
    index: '03',
    icon: Scissors,
    title: 'Architectural Drop-Shoulder Block',
    metric: 'CUSTOM UNISEX BOXY GRADING',
    description:
      'An oversized tee should not look like a regular shirt bought two sizes too big. We drafted our proprietary Doffor pattern block from scratch: wider chest ease, deliberately pitched shoulder seams, elbow-skimming sleeves, and a slightly cropped boxy hem that stacks cleanly above cargos and wide denim.',
    specs: [
      'Precision-graded across S to XXL on real South Asian body proportions',
      'Double-needle coverstitch hems and shoulder-to-shoulder twill tape',
      'Consistent silhouette geometry across Tees, Full-Sleeves & Muscle Tanks',
    ],
  },
];

const PRODUCTION_STEPS = [
  {
    step: 'STAGE 01',
    location: 'TIRUPUR, TAMIL NADU',
    title: 'Custom Fabric Milling & Dyeing',
    detail:
      'We knit our own 240–280 GSM cotton lots rather than buying thin wholesale blanks, using AZO-free reactive and pigment dyes for rich obsidian, petrol teal, espresso, and crimson shades.',
  },
  {
    step: 'STAGE 02',
    location: 'BENGALURU DESIGN STUDIO',
    title: 'Pattern Architecture & Graphic Direction',
    detail:
      'Every graphic—from Winged Angel to Ancient Dragon and 1993 Bootleg collages—is illustrated, color-separated, and wear-tested in our Bengaluru studio across musicians, skaters, and designers.',
  },
  {
    step: 'STAGE 03',
    location: 'SMALL-BATCH PRINT FLOOR',
    title: 'Numbered Runs & 12-Point QC',
    detail:
      'Drops are produced in deliberate 100–300 piece runs to prevent overproduction waste. Each garment passes seam tension, GSM weight, collar recovery, and print-cure inspection.',
  },
  {
    step: 'STAGE 04',
    location: 'PAN-INDIA FULFILLMENT',
    title: 'Reusable Archive Packaging',
    detail:
      'Zero flimsy poly-wrap. Every order ships within 24–48 hours inside our matte-black reusable Doffor zip-lock garment pouch with Drop 04 archive stickers.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Manifesto Hero */}
      <section className="relative border-b border-white/[0.08] overflow-hidden">
        <div className="absolute inset-0 grain-overlay opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-acid/10 border border-acid/40 text-acid font-mono text-[11px] font-bold uppercase tracking-[0.22em]">
                <Flame className="w-3.5 h-3.5" /> Brand Manifesto // Est. India
              </div>

              <h1 className="font-condensed text-6xl sm:text-7xl lg:text-[6.75rem] leading-[0.88] uppercase tracking-tight">
                CUT HEAVY.{' '}
                <span className="text-acid block sm:inline">BUILT LOUD.</span>
              </h1>

              <p className="text-base sm:text-lg text-bone/85 leading-relaxed max-w-2xl">
                Doffor Clothing was born out of frustration with paper-thin graphic tees that lose
                their collar after two washes and imported luxury streetwear priced out of reach. We
                build independent Indian heavyweight streetwear engineered to luxury specifications—made
                for youth culture, underground music lovers, designers, athletes, and students who live
                in what they wear.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/shop" className="btn-acid">
                  Shop Drop 04 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/lookbook" className="btn-outline">
                  Explore Lookbook
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-sm overflow-hidden border border-white/10 aspect-[3/4] bg-charcoal">
                  <img
                    src="/images/real-angel-fullsleeve-black.jpg"
                    alt="Doffor 260 GSM Heavyweight Full-Sleeve"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="card-dark p-4">
                  <p className="font-condensed text-3xl text-acid">240–280</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ash mt-1">
                    GSM Custom-Milled Cotton
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="card-dark p-4">
                  <p className="font-condensed text-3xl text-bone">4.9 ★</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ash mt-1">
                    Verified Drop 04 Rating
                  </p>
                </div>
                <div className="rounded-sm overflow-hidden border border-white/10 aspect-[3/4] bg-charcoal">
                  <img
                    src="/images/real-bootleg-tee.jpg"
                    alt="Doffor Grunge Bootleg Oversized Tee"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ethos Statement */}
      <section className="border-b border-white/[0.08] bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '100%', label: 'Super-Combed Indian Cotton' },
            { value: '26,000+', label: 'Indian Pincodes Delivered' },
            { value: '12-PT', label: 'Garment QC Inspection' },
            { value: 'ZERO', label: 'Fast-Fashion Deadstock' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-condensed text-4xl sm:text-5xl text-acid">{stat.value}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-ash">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Pillar Fabric Engineering */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
              MATERIAL ARCHITECTURE
            </p>
            <h2 className="font-condensed text-4xl sm:text-6xl uppercase tracking-tight leading-none">
              THREE PILLARS OF FABRIC ENGINEERING
            </h2>
          </div>
          <p className="text-sm text-ash max-w-md">
            Every stitch, collar rib, and ink pass is obsessively specified in-house so a ₹999–₹1,449
            Doffor piece outlasts labels charging three times as much.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ENGINEERING_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.index}
                className="card-dark p-7 flex flex-col justify-between gap-6 hover:border-acid/40 transition-colors"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-sm bg-acid/10 border border-acid/40 flex items-center justify-center text-acid">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-condensed text-4xl text-white/15">{pillar.index}</span>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-acid mb-2">
                      {pillar.metric}
                    </p>
                    <h3 className="font-display font-bold text-xl text-bone leading-snug">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-sm text-ash leading-relaxed">{pillar.description}</p>
                </div>

                <ul className="space-y-2.5 pt-5 border-t border-white/[0.08]">
                  {pillar.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2.5 text-xs text-bone/85">
                      <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Design Studio & Production Transparency */}
      <section className="border-t border-white/[0.08] bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
                <Compass className="w-4 h-4" /> Radical Transparency
              </span>
              <h2 className="font-condensed text-4xl sm:text-5xl uppercase tracking-tight leading-[0.95]">
                FROM INDIAN COTTON MILLS TO YOUR ROTATION
              </h2>
              <p className="text-sm sm:text-base text-ash leading-relaxed">
                We skip middlemen, department-store markups, and inflated influencer budgets. Every
                rupee goes into custom-knitted heavyweight fabric, fair partner mill wages, and
                hand-pulled screen prints.
              </p>

              <div className="rounded-sm overflow-hidden border border-white/10 aspect-[16/10] bg-obsidian">
                <img
                  src="/images/real-angel-fullsleeve-rack.jpg"
                  alt="Doffor Drop 04 Small-Batch Garment Rack"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-sm bg-obsidian border border-white/10">
                <ShieldCheck className="w-5 h-5 text-acid shrink-0" />
                <p className="text-xs text-bone/85 leading-relaxed">
                  All dyeing and finishing partners operate certified effluent-treatment plants with
                  AZO-free, skin-safe pigments.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {PRODUCTION_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="bg-obsidian border border-white/[0.08] rounded-sm p-6 sm:p-7 space-y-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-sm bg-acid/15 border border-acid/40 font-mono text-[10px] font-bold uppercase tracking-widest text-acid">
                      {item.step}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-ash">
                      {item.location}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-bone">{item.title}</h3>
                  <p className="text-sm text-ash leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-sm overflow-hidden border border-acid/30 bg-surface p-8 sm:p-14">
          <div className="absolute inset-0 grain-overlay opacity-70" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid flex items-center gap-2">
                <Award className="w-4 h-4" /> Experience The Weight
              </p>
              <h2 className="font-condensed text-4xl sm:text-6xl uppercase leading-none">
                FEEL 260 GSM IN PERSON
              </h2>
              <p className="text-sm sm:text-base text-ash">
                Step into Drop 04 or browse the Archive Grunge editorial lookbook to see how every
                silhouette drapes in motion.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn-acid">
                Shop Drop 04 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/lookbook" className="btn-outline">
                View Lookbook
              </Link>
              <Link href="/community#collabs" className="btn-outline">
                Custom Collabs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
