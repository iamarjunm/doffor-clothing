'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import ProductCard from '../../../components/ProductCard';

const COLLECTION_META = {
  'full-sleeves': {
    title: 'Heavyweight Full-Sleeves',
    subtitle: '260–280 GSM DROP-SHOULDER LONG SLEEVES',
    description:
      'Architectural long-sleeve silhouettes cut in dense 260–280 GSM combed cotton and interlock jersey. Built with structured rib cuffs, wide drop shoulders, and full-back archival screen prints.',
    banner: '/images/real-angel-fullsleeve-black.jpg',
    spec: '260–280 GSM • Ribbed Cuffs • Boxy Drop-Shoulder',
  },
  'oversized-tees': {
    title: 'Oversized Graphic Tees',
    subtitle: '240 GSM BIO-WASHED EVERYDAY ROTATION',
    description:
      'Our flagship boxy drop-shoulder half-sleeves with elbow-skimming drape, 2.5cm Lycra-reinforced collar rib, and crack-resist halftone & dual-tone graphics.',
    banner: '/images/real-bootleg-tee.jpg',
    spec: '240 GSM • Bio-Washed Combed Cotton • Unisex Fit',
  },
  'muscle-tanks': {
    title: 'Boxy Muscle Tanks',
    subtitle: '240 GSM SCULPTURAL SLEEVELESS VESTS',
    description:
      'Structured heavyweight sleeveless silhouettes engineered with extended shoulder caps and crisp retro serif chest typography across six curated garment-dyed colorways.',
    banner: '/images/real-muscle-tank.jpg',
    spec: '240 GSM • Extended Shoulder Cap • 6 Colorways',
  },
  'limited-drops': {
    title: 'Limited Drops & Packs',
    subtitle: 'SMALL-BATCH ARCHIVE RUNS & CURATED BUNDLES',
    description:
      'Strictly numbered pigment-dyed runs and high-value rotation packs. Zero restocks once sold out — complete with Drop 04 archive packaging.',
    banner: '/images/real-angel-fullsleeve-rack.jpg',
    spec: 'Numbered Batches • Zero Restocks • Exclusive Savings',
  },
};

const COLLECTION_TABS = [
  { slug: 'full-sleeves', label: 'Full-Sleeves' },
  { slug: 'oversized-tees', label: 'Oversized Tees' },
  { slug: 'muscle-tanks', label: 'Muscle Tanks' },
  { slug: 'limited-drops', label: 'Limited Drops' },
];

export default function CollectionPage() {
  const params = useParams();
  const category = String(params?.category || '').toLowerCase();
  const { products } = useStore();

  const [sortBy, setSortBy] = useState('featured');
  const [sizeFilter, setSizeFilter] = useState('');

  const meta = COLLECTION_META[category];

  const collectionProducts = useMemo(() => {
    const base = products.filter((p) => p.category === category);
    const bySize = sizeFilter
      ? base.filter((p) => (p.sizes?.[sizeFilter] ?? 0) > 0)
      : base;

    return [...bySize].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'bestseller':
          return (
            Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)) ||
            (b.reviewCount || 0) - (a.reviewCount || 0)
          );
        case 'newest':
          return Number(Boolean(b.isNewDrop)) - Number(Boolean(a.isNewDrop));
        case 'featured':
        default:
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
    });
  }, [products, category, sortBy, sizeFilter]);

  if (!meta) {
    return (
      <div className="bg-obsidian text-bone min-h-[70vh] flex items-center justify-center px-4">
        <div className="card-dark max-w-lg w-full p-8 text-center space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-acid">
            COLLECTION NOT FOUND
          </p>
          <h1 className="font-display font-extrabold text-3xl uppercase">
            Archive Shelf Unavailable
          </h1>
          <p className="text-sm text-ash">
            The collection <span className="text-bone font-mono">{category}</span> does not exist
            in Drop 04. Browse our live catalog instead.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn-acid">
              Shop Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="btn-outline">
              <ArrowLeft className="w-4 h-4" /> Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Editorial Banner */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <img
          src={meta.banner}
          alt={meta.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/55" />
        <div className="absolute inset-0 grain-overlay pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ash">
              <Link href="/" className="hover:text-acid transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-acid transition-colors">
                Shop
              </Link>
              <span>/</span>
              <span className="text-acid">{meta.title}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-obsidian/80 border border-acid/40 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-acid">
              <Sparkles className="w-3.5 h-3.5" /> {meta.subtitle}
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight">
              {meta.title}
            </h1>

            <p className="text-sm sm:text-base text-bone/80 leading-relaxed max-w-2xl">
              {meta.description}
            </p>

            <div className="inline-flex items-center gap-2 pt-1 font-mono text-xs text-ash">
              <Layers className="w-4 h-4 text-acid" />
              <span>{meta.spec}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Switcher + Sort Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          {/* Switch between collections */}
          <div className="flex flex-wrap items-center gap-2">
            {COLLECTION_TABS.map((tab) => {
              const active = tab.slug === category;
              return (
                <Link
                  key={tab.slug}
                  href={`/collections/${tab.slug}`}
                  className={`px-3.5 py-2 rounded-sm font-mono text-xs uppercase tracking-wider border transition-colors ${
                    active
                      ? 'bg-acid text-obsidian border-acid font-bold'
                      : 'bg-charcoal text-ash border-white/10 hover:border-white/30 hover:text-bone'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Size Quick Filter + Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ash mr-1">
                Size:
              </span>
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSizeFilter(sizeFilter === sz ? '' : sz)}
                  className={`w-8 py-1 rounded-sm font-mono text-[11px] font-bold border transition-colors ${
                    sizeFilter === sz
                      ? 'bg-acid text-obsidian border-acid'
                      : 'bg-charcoal text-bone border-white/15 hover:border-acid/60'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort collection"
              className="bg-charcoal border border-white/15 rounded-sm px-3 py-1.5 font-mono text-xs text-bone focus:outline-none focus:border-acid"
            >
              <option value="featured" className="bg-charcoal">
                Sort: Featured
              </option>
              <option value="newest" className="bg-charcoal">
                Sort: Newest
              </option>
              <option value="bestseller" className="bg-charcoal">
                Sort: Bestsellers
              </option>
              <option value="price-asc" className="bg-charcoal">
                Price: Low to High
              </option>
              <option value="price-desc" className="bg-charcoal">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {collectionProducts.length === 0 ? (
          <div className="card-dark p-10 text-center space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-acid">
              NO PIECES MATCHING SIZE {sizeFilter}
            </p>
            <p className="text-sm text-ash">
              Clear the size filter or check all available Drop 04 pieces.
            </p>
            <div className="flex justify-center gap-3">
              {sizeFilter && (
                <button
                  type="button"
                  onClick={() => setSizeFilter('')}
                  className="btn-acid"
                >
                  Show All Sizes
                </button>
              )}
              <Link href="/shop" className="btn-outline">
                Shop All
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
