'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Ruler,
  SlidersHorizontal,
  Droplets,
  Shirt,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const SIZE_TABLES = {
  'oversized-tees': {
    label: 'Oversized Tees (240 GSM)',
    note: 'Boxy drop-shoulder block with elbow-skimming sleeves. Size down once for a closer regular fit.',
    rows: [
      { size: 'S', chest: 42, length: 27.5, shoulder: 20.5, sleeve: 9.0 },
      { size: 'M', chest: 44, length: 28.5, shoulder: 21.5, sleeve: 9.5 },
      { size: 'L', chest: 46, length: 29.5, shoulder: 22.5, sleeve: 10.0 },
      { size: 'XL', chest: 48, length: 30.5, shoulder: 23.5, sleeve: 10.5 },
      { size: 'XXL', chest: 50, length: 31.5, shoulder: 24.5, sleeve: 11.0 },
    ],
  },
  'full-sleeves': {
    label: 'Full-Sleeves (260–280 GSM)',
    note: 'Heavy-drape long sleeves with structured rib cuffs and generous drop-shoulder ease.',
    rows: [
      { size: 'S', chest: 43, length: 27.5, shoulder: 21.0, sleeve: 23.5 },
      { size: 'M', chest: 45, length: 28.5, shoulder: 22.0, sleeve: 24.0 },
      { size: 'L', chest: 47, length: 29.5, shoulder: 23.0, sleeve: 24.5 },
      { size: 'XL', chest: 49, length: 30.5, shoulder: 24.0, sleeve: 25.0 },
      { size: 'XXL', chest: 51, length: 31.5, shoulder: 25.0, sleeve: 25.5 },
    ],
  },
  'muscle-tanks': {
    label: 'Boxy Muscle Tanks (240 GSM)',
    note: 'Extended sculptural shoulder cap with clean, non-gaping armholes and boxy hem.',
    rows: [
      { size: 'S', chest: 41, length: 27.0, shoulder: 19.0, sleeve: 0 },
      { size: 'M', chest: 43, length: 28.0, shoulder: 20.0, sleeve: 0 },
      { size: 'L', chest: 45, length: 29.0, shoulder: 21.0, sleeve: 0 },
      { size: 'XL', chest: 47, length: 30.0, shoulder: 22.0, sleeve: 0 },
      { size: 'XXL', chest: 49, length: 31.0, shoulder: 23.0, sleeve: 0 },
    ],
  },
};

const WASH_CARE = [
  {
    title: 'Cold Machine Wash Inside-Out',
    detail: 'Always turn printed garments inside out and wash on gentle cold cycle (30°C max) to preserve ink opacity and enzyme color depth.',
  },
  {
    title: 'Mild Liquid Detergent Only',
    detail: 'Skip bleach, optical brighteners, and harsh fabric softeners—they degrade heavyweight combed cotton fibers over time.',
  },
  {
    title: 'Dry Flat In Shade',
    detail: 'Avoid tumble drying. Hang over a wide wooden hanger or dry flat in shade to prevent shoulder dimples on 260–280 GSM pieces.',
  },
  {
    title: 'Never Iron Directly On Print',
    detail: 'Steam or iron on low heat from the reverse side only. Direct high iron heat can scorch high-density plastisol and puff graphics.',
  },
];

function inchesToCm(val) {
  return (val * 2.54).toFixed(1);
}

export default function SizeGuidePage() {
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(72);
  const [fitPref, setFitPref] = useState('oversized'); // 'relaxed' | 'oversized' | 'baggy'
  const [activeSilhouette, setActiveSilhouette] = useState('oversized-tees');
  const [unit, setUnit] = useState('in'); // 'in' | 'cm'

  const recommendation = useMemo(() => {
    // Score based on height and weight
    let score = 0;
    if (heightCm < 166) score += 1;
    else if (heightCm < 174) score += 2;
    else if (heightCm < 182) score += 3;
    else if (heightCm < 189) score += 4;
    else score += 5;

    if (weightKg < 58) score += 1;
    else if (weightKg < 68) score += 2;
    else if (weightKg < 79) score += 3;
    else if (weightKg < 90) score += 4;
    else score += 5;

    let avg = Math.round(score / 2);
    if (fitPref === 'relaxed') avg -= 1;
    if (fitPref === 'baggy') avg += 1;

    const clamped = Math.max(1, Math.min(5, avg));
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const size = sizes[clamped - 1];

    const notes = {
      relaxed:
        'Cleaner shoulder line with moderate chest room while retaining Doffor’s structured heavyweight drape.',
      oversized:
        'Our signature Drop 04 silhouette—dropped shoulder seam, elbow-skimming sleeves, and architectural boxy volume.',
      baggy:
        'Maximum street-editorial drape with extra length and wide torso sweep for heavy layering.',
    };

    const totalInches = Math.round(heightCm / 2.54);
    const ft = Math.floor(totalInches / 12);
    const inches = totalInches % 12;

    return {
      size,
      note: notes[fitPref],
      heightImperial: `${ft}'${inches}"`,
      chestEase: SIZE_TABLES[activeSilhouette].rows.find((r) => r.size === size)?.chest || 46,
    };
  }, [heightCm, weightKg, fitPref, activeSilhouette]);

  const currentTable = SIZE_TABLES[activeSilhouette];

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Header */}
      <section className="border-b border-white/[0.08] bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <Ruler className="w-4 h-4" /> Architectural Unisex Sizing
            </span>
            <h1 className="font-condensed text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              OVERSIZED FIT &amp; <span className="text-acid">SIZE GUIDE</span>
            </h1>
            <p className="text-sm sm:text-base text-ash leading-relaxed">
              Every Doffor piece is cut on a custom drop-shoulder boxy block. Use our interactive fit
              calculator below or compare flat garment measurements against your favorite tee at home.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Fit Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 card-dark p-6 sm:p-8 space-y-7">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-acid flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Interactive Fit Engine
                </p>
                <h2 className="font-display font-bold text-2xl text-bone mt-1">
                  Find Your Drop 04 Size
                </h2>
              </div>
              <span className="font-mono text-xs text-ash hidden sm:inline">
                UNISEX GRADING S–XXL
              </span>
            </div>

            {/* Height Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-bone">
                  Height
                </label>
                <span className="font-mono text-sm font-bold text-acid">
                  {heightCm} cm <span className="text-ash font-normal">({recommendation.heightImperial})</span>
                </span>
              </div>
              <input
                type="range"
                min={150}
                max={200}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-[#0B0B0C] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-ash">
                <span>150 cm (4&apos;11&quot;)</span>
                <span>175 cm (5&apos;9&quot;)</span>
                <span>200 cm (6&apos;7&quot;)</span>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-bone">
                  Weight
                </label>
                <span className="font-mono text-sm font-bold text-acid">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min={42}
                max={115}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-[#0B0B0C] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-ash">
                <span>42 kg</span>
                <span>75 kg</span>
                <span>115 kg</span>
              </div>
            </div>

            {/* Fit Preference */}
            <div className="space-y-3">
              <label className="block font-mono text-xs uppercase tracking-wider text-bone">
                Preferred Street Silhouette
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'relaxed', label: 'Relaxed Fit', sub: 'Cleaner shoulder' },
                  { id: 'oversized', label: 'Signature Boxy', sub: 'Doffor standard' },
                  { id: 'baggy', label: 'Extra Baggy', sub: 'Heavy editorial' },
                ].map((opt) => {
                  const active = fitPref === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFitPref(opt.id)}
                      className={`p-3.5 rounded-sm border text-left transition-all ${
                        active
                          ? 'bg-acid/15 border-acid text-bone'
                          : 'bg-obsidian border-[#0B0B0C]/15 text-ash hover:border-[#0B0B0C]/45'
                      }`}
                    >
                      <p className={`font-mono text-xs font-bold uppercase ${active ? 'text-acid' : 'text-bone'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-ash mt-0.5">{opt.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommendation Result Card */}
          <div className="lg:col-span-5 card-dark p-6 sm:p-8 border-acid/40 bg-gradient-to-b from-surface to-charcoal flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-acid">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Doffor Size
              </span>

              <div className="flex items-end gap-5">
                <div className="w-24 h-24 rounded-sm bg-acid text-obsidian flex items-center justify-center font-condensed text-6xl leading-none shrink-0">
                  {recommendation.size}
                </div>
                <div className="space-y-1">
                  <p className="font-display font-bold text-xl text-bone">
                    Size {recommendation.size} ({fitPref === 'oversized' ? 'Boxy Oversized' : fitPref === 'baggy' ? 'Extra Baggy' : 'Relaxed'})
                  </p>
                  <p className="font-mono text-xs text-ash">
                    Garment Chest: {recommendation.chestEase}&quot; ({inchesToCm(recommendation.chestEase)} cm)
                  </p>
                </div>
              </div>

              <p className="text-sm text-bone/85 leading-relaxed">{recommendation.note}</p>

              <div className="bg-obsidian/80 border border-white/[0.08] rounded-sm p-4 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-acid">
                  Studio Model Reference
                </p>
                <p className="text-xs text-ash leading-relaxed">
                  • 5&apos;11&quot; (180 cm) / 72 kg wears <span className="text-bone font-mono">L</span> for signature boxy drape.
                  <br />• 5&apos;6&quot; (168 cm) / 56 kg wears <span className="text-bone font-mono">S</span> or <span className="text-bone font-mono">M</span> for oversized fit.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/shop" className="btn-acid w-full">
                Shop Size {recommendation.size} In Drop 04 <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] font-mono text-center text-ash">
                Between sizes? Free 7-day size exchange on every order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Measurement Tables */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-dark p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="flex flex-wrap gap-2">
              {Object.entries(SIZE_TABLES).map(([key, table]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSilhouette(key)}
                  className={`px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-wider border transition-colors ${
                    activeSilhouette === key
                      ? 'bg-acid text-obsidian border-acid font-bold'
                      : 'bg-obsidian text-bone/80 border-white/15 hover:border-acid/60'
                  }`}
                >
                  {table.label}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-sm border border-white/15 bg-obsidian p-1 self-start">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-sm font-mono text-xs uppercase transition-colors ${
                  unit === 'in' ? 'bg-acid text-obsidian font-bold' : 'text-ash hover:text-bone'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-sm font-mono text-xs uppercase transition-colors ${
                  unit === 'cm' ? 'bg-acid text-obsidian font-bold' : 'text-ash hover:text-bone'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-ash flex items-center gap-2">
            <Info className="w-4 h-4 text-acid shrink-0" />
            {currentTable.note} Tolerance: ±0.5 in (1.2 cm) due to bio-wash finishing.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 font-mono text-[11px] uppercase tracking-widest text-ash">
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Chest (Round)</th>
                  <th className="py-3.5 px-4">Body Length</th>
                  <th className="py-3.5 px-4">Drop Shoulder</th>
                  {activeSilhouette !== 'muscle-tanks' && (
                    <th className="py-3.5 px-4">Sleeve Length</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-mono text-sm">
                {currentTable.rows.map((row) => {
                  const isRec = row.size === recommendation.size;
                  return (
                    <tr
                      key={row.size}
                      className={isRec ? 'bg-acid/10 text-bone' : 'hover:bg-[#0B0B0C]/[0.04] text-bone/85'}
                    >
                      <td className="py-4 px-4 font-bold">
                        <span className="inline-flex items-center gap-2">
                          {row.size}
                          {isRec && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-acid text-obsidian text-[9px] uppercase font-bold">
                              YOUR PICK
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {unit === 'in' ? `${row.chest}"` : `${inchesToCm(row.chest)} cm`}
                      </td>
                      <td className="py-4 px-4">
                        {unit === 'in' ? `${row.length}"` : `${inchesToCm(row.length)} cm`}
                      </td>
                      <td className="py-4 px-4">
                        {unit === 'in' ? `${row.shoulder}"` : `${inchesToCm(row.shoulder)} cm`}
                      </td>
                      {activeSilhouette !== 'muscle-tanks' && (
                        <td className="py-4 px-4">
                          {unit === 'in' ? `${row.sleeve}"` : `${inchesToCm(row.sleeve)} cm`}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How To Measure + Wash Care */}
      <section className="border-t border-white/[0.08] bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-5">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acid">
              <Shirt className="w-4 h-4" /> How To Measure At Home
            </span>
            <h2 className="font-condensed text-4xl uppercase tracking-tight">
              LAY FLAT &amp; COMPARE
            </h2>
            <p className="text-sm text-ash leading-relaxed">
              Lay your best-fitting oversized tee flat on a table and measure edge-to-edge:
            </p>
            <ul className="space-y-3 text-sm text-bone/85">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                <span>
                  <strong className="text-bone">Chest (Round):</strong> Measure pit-to-pit 1 inch below
                  the armhole, then multiply by 2.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                <span>
                  <strong className="text-bone">Body Length:</strong> Measure straight down from the
                  highest shoulder point beside the collar rib to the bottom hem.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
                <span>
                  <strong className="text-bone">Drop Shoulder:</strong> Measure seam-to-seam straight
                  across the upper back.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acid">
              <Droplets className="w-4 h-4" /> Heavyweight Garment Care
            </span>
            <h2 className="font-condensed text-4xl uppercase tracking-tight">
              MAKE 260 GSM LAST FOR YEARS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WASH_CARE.map((item) => (
                <div
                  key={item.title}
                  className="bg-obsidian border border-white/[0.08] rounded-sm p-5 space-y-2"
                >
                  <h3 className="font-display font-bold text-base text-bone">{item.title}</h3>
                  <p className="text-xs text-ash leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
