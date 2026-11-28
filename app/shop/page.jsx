'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/ProductCard';
import { formatINR } from '../../lib/format';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const GSM_OPTIONS = ['All', '240', '260', '280'];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest Drops' },
  { id: 'bestseller', label: 'Bestsellers' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
];

export default function ShopPage() {
  const { products, config, loading } = useStore();

  const categories = useMemo(
    () => [
      { id: 'all', label: 'All Silhouettes' },
      ...(config.categories || []).map((c) => ({ id: c.id, label: c.label })),
    ],
    [config.categories]
  );

  const [category, setCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGsm, setSelectedGsm] = useState('All');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const hasActiveFilters =
    category !== 'all' ||
    selectedSize !== '' ||
    selectedGsm !== 'All' ||
    maxPrice < 2500 ||
    searchQuery.trim() !== '' ||
    sortBy !== 'featured';

  const resetFilters = () => {
    setCategory('all');
    setSelectedSize('');
    setSelectedGsm('All');
    setMaxPrice(2500);
    setSearchQuery('');
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (selectedSize && (p.sizes?.[selectedSize] ?? 0) <= 0) return false;
      if (selectedGsm !== 'All' && Number(p.gsm) !== Number(selectedGsm)) return false;
      if (Number(p.price) > maxPrice) return false;

      if (q) {
        const haystack = [
          p.name,
          p.subtitle,
          p.categoryLabel,
          p.description,
          ...(p.badges || []),
          ...(p.colors || []).map((c) => c.name),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(Boolean(b.isNewDrop)) - Number(Boolean(a.isNewDrop));
        case 'bestseller':
          return (
            Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)) ||
            (b.reviewCount || 0) - (a.reviewCount || 0)
          );
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'featured':
        default:
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
    });
  }, [products, category, selectedSize, selectedGsm, maxPrice, searchQuery, sortBy]);

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Editorial Header */}
      <section className="relative border-b border-white/[0.08] bg-charcoal/50 grain-overlay overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-acid mb-3">
                <Sparkles className="w-3.5 h-3.5" /> {(config.collectionLabel || 'Full Collection').toUpperCase()} // CATALOG
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight">
                Shop All Pieces
              </h1>
              <p className="text-sm sm:text-base text-ash mt-2 max-w-2xl">
                240–280 GSM bio-washed heavyweight jersey, exaggerated drop shoulders, and archival
                screen prints — priced fairly for everyday rotation.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs text-ash">
              <div className="px-3.5 py-2 rounded-sm bg-obsidian border border-white/10">
                Showing <span className="text-acid font-bold">{filteredProducts.length}</span> of{' '}
                <span className="text-bone">{products.length}</span> pieces
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Controls & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Top Category Pills + Mobile Filter Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-acid text-obsidian border-acid font-bold'
                      : 'bg-charcoal text-ash border-[#0B0B0C]/15 hover:border-[#0B0B0C]/50 hover:text-bone'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFiltersMobile((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-charcoal border border-white/15 font-mono text-xs uppercase tracking-wider text-bone shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-acid" />
              Filters
            </button>

            <div className="relative flex-1 min-w-[160px] sm:w-64">
              <Search className="w-4 h-4 text-ash absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tees, colors, prints..."
                className="input-dark pl-9 pr-8 py-2 text-xs font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ash hover:text-bone"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="w-full sm:w-auto bg-charcoal border border-white/15 rounded-sm px-3 py-2 font-mono text-xs text-bone focus:outline-none focus:border-acid"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-charcoal text-bone">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filter Bar (Size, GSM, Max Price, Reset) */}
        <div
          className={`${
            showFiltersMobile ? 'grid' : 'hidden lg:grid'
          } grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 p-4 sm:p-5 rounded-sm bg-charcoal border border-white/[0.08] items-center`}
        >
          {/* Size Filter */}
          <div className="lg:col-span-4 space-y-2">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-ash">
              In-Stock Size
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((sz) => {
                const active = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(active ? '' : sz)}
                    className={`w-10 py-1.5 rounded-sm font-mono text-xs font-bold border transition-colors ${
                      active
                        ? 'bg-acid text-obsidian border-acid'
                        : 'bg-obsidian text-bone border-white/15 hover:border-acid/60'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GSM Filter */}
          <div className="lg:col-span-3 space-y-2">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-ash">
              Fabric Weight (GSM)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GSM_OPTIONS.map((gsm) => {
                const active = selectedGsm === gsm;
                return (
                  <button
                    key={gsm}
                    type="button"
                    onClick={() => setSelectedGsm(gsm)}
                    className={`px-2.5 py-1.5 rounded-sm font-mono text-xs border transition-colors ${
                      active
                        ? 'bg-acid text-obsidian border-acid font-bold'
                        : 'bg-obsidian text-bone border-white/15 hover:border-acid/60'
                    }`}
                  >
                    {gsm === 'All' ? 'All' : `${gsm} GSM`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
              <span className="text-ash">Max Price</span>
              <span className="text-acid font-bold">Up to {formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="799"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-acid cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[10px] text-ash/70">
              <span>₹799</span>
              <span>₹2,500</span>
            </div>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-2 flex lg:justify-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm font-mono text-xs uppercase tracking-wider border transition-colors ${
                hasActiveFilters
                  ? 'border-acid/50 text-acid hover:bg-acid hover:text-obsidian'
                  : 'border-white/10 text-ash/40 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-8 sm:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] rounded-sm bg-charcoal border border-white/[0.06] animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card-dark p-10 sm:p-12 text-center space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-acid">
              NO MATCHING SILHOUETTES
            </p>
            <h3 className="font-display font-bold text-2xl text-bone">
              Try widening your size, GSM, or price filters
            </h3>
            <p className="text-sm text-ash max-w-md mx-auto">
              Every piece in {config.collectionLabel || 'our collection'} is produced in small
              batches. Reset filters to explore all available heavyweight silhouettes.
            </p>
            <div className="pt-2">
              <button type="button" onClick={resetFilters} className="btn-acid">
                <RotateCcw className="w-4 h-4" /> Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-8 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Collection Cross-Link */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-ash">
            Need help dialing in your oversized fit? Check measurements on any product page or
            explore our editorial styling guide.
          </p>
          <Link
            href="/lookbook"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acid hover:underline"
          >
            View Editorial Lookbook <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
