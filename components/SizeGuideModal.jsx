'use client';

import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

const MEASUREMENTS = [
  { size: 'S', chest: '42"', length: '27.5"', shoulder: '20.5"', sleeve: '9.5" / 23.5"' },
  { size: 'M', chest: '44"', length: '28.5"', shoulder: '21.5"', sleeve: '10.0" / 24.5"' },
  { size: 'L', chest: '46"', length: '29.5"', shoulder: '22.5"', sleeve: '10.5" / 25.5"' },
  { size: 'XL', chest: '48"', length: '30.5"', shoulder: '23.5"', sleeve: '11.0" / 26.0"' },
  { size: 'XXL', chest: '50"', length: '31.5"', shoulder: '24.5"', sleeve: '11.5" / 26.5"' },
];

export default function SizeGuideModal({ open, onClose }) {
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(68);
  const [pref, setPref] = useState('oversized');

  if (!open) return null;

  const getRecommendedSize = () => {
    let score = 0;
    if (heightCm < 166) score += 0;
    else if (heightCm < 174) score += 1;
    else if (heightCm < 182) score += 2;
    else if (heightCm < 189) score += 3;
    else score += 4;

    if (weightKg < 58) score += 0;
    else if (weightKg < 68) score += 1;
    else if (weightKg < 80) score += 2;
    else if (weightKg < 92) score += 3;
    else score += 4;

    let idx = Math.round(score / 2);
    if (pref === 'fitted') idx = Math.max(0, idx - 1);
    if (pref === 'baggy') idx = Math.min(4, idx + 1);
    return ['S', 'M', 'L', 'XL', 'XXL'][idx] || 'L';
  };

  const recommended = getRecommendedSize();

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 no-print">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white border border-black/15 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-[#0B0B0C]" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0B0B0C]">
                Size & Fit Guide
              </h3>
              <p className="text-xs text-neutral-500">Unisex Boxy Drop-Shoulder Block (Inches)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 bg-[#F6F5F2] border border-black/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B0B0C]">
              Fit Calculator
            </span>
            <span className="px-3 py-1 bg-[#0B0B0C] text-white text-[11px] font-medium uppercase tracking-[0.16em]">
              Suggested: {recommended}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                Height: <strong className="text-black">{heightCm} cm</strong>
              </label>
              <input
                type="range"
                min="152"
                max="198"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-[#0B0B0C]"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                Weight: <strong className="text-black">{weightKg} kg</strong>
              </label>
              <input
                type="range"
                min="42"
                max="115"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-[#0B0B0C]"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">Drape</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'fitted', label: 'Clean' },
                  { id: 'oversized', label: 'Boxy' },
                  { id: 'baggy', label: 'Relaxed' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPref(opt.id)}
                    className={`py-1.5 text-[10px] uppercase tracking-wider border ${
                      pref === opt.id
                        ? 'bg-[#0B0B0C] text-white border-[#0B0B0C]'
                        : 'border-black/15 text-neutral-600 hover:border-black'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/15 text-neutral-500 uppercase text-[10px] tracking-[0.16em]">
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Chest</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Shoulder</th>
                <th className="py-2.5 px-3">Half / Full Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {MEASUREMENTS.map((row) => (
                <tr
                  key={row.size}
                  className={row.size === recommended ? 'bg-[#0B0B0C] text-white font-semibold' : 'text-[#0B0B0C]'}
                >
                  <td className="py-2.5 px-3 font-semibold">{row.size}</td>
                  <td className="py-2.5 px-3">{row.chest}</td>
                  <td className="py-2.5 px-3">{row.length}</td>
                  <td className="py-2.5 px-3">{row.shoulder}</td>
                  <td className="py-2.5 px-3">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          All Doffor silhouettes are cut to a boxy oversized block. Take your regular size for our
          signature drape, or size down once for a closer fit.
        </p>
      </div>
    </div>
  );
}
