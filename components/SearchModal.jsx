'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../lib/format';

const QUICK_TAGS = ['Winged Angel', 'Dragon', 'Muscle Tank', 'Full-Sleeve', '260 GSM', 'Cobalt'];

export default function SearchModal() {
  const { products, searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        String(p.gsm).includes(q) ||
        p.colors?.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [query, products]);

  useEffect(() => {
    if (!searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-10 sm:pt-24 px-3 sm:px-4 no-print">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} />

      <div className="relative z-10 w-full max-w-2xl bg-white border border-black/15 shadow-2xl overflow-hidden animate-fade-up">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-black/10">
          <Search className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pieces, colors, or fabric weights..."
            className="w-full bg-transparent text-[#0B0B0C] text-sm placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black shrink-0"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="px-4 sm:px-5 py-3 border-b border-black/5 bg-[#F6F5F2] flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mr-1 shrink-0">Popular:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 bg-white border border-black/10 text-[11px] text-neutral-700 hover:border-black hover:text-black transition-colors whitespace-nowrap shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="max-h-[62dvh] overflow-y-auto overscroll-contain divide-y divide-black/5">
          {results.length === 0 ? (
            <div className="p-10 text-center text-neutral-500 text-xs">
              No pieces matched "{query}".
            </div>
          ) : (
            results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F6F5F2] transition-colors group"
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-12 h-14 object-cover bg-[#ECEAE4] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0B0B0C] truncate">{product.name}</p>
                  <p className="text-[11px] text-neutral-500">
                    {product.categoryLabel} • {product.gsm} GSM • {product.colors?.length} colorways
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-[#0B0B0C]">{formatINR(product.price)}</p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black ml-auto mt-0.5" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
