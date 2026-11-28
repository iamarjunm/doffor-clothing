'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import ProductCard from '../../../components/ProductCard';

function formatSlugLabel(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CollectionPage() {
  const params = useParams();
  const category = String(params?.category || '').toLowerCase();
  const { products, config } = useStore();

  const [sortBy, setSortBy] = useState('featured');
  const [sizeFilter, setSizeFilter] = useState('');

  const categories = Array.isArray(config.categories) ? config.categories : [];
  const collectionLabel = config.collectionLabel || 'Core Collection';

  const meta = useMemo(() => {
    const matched = categories.find((c) => c.id === category);
    if (matched) {
      return {
        title: matched.label || formatSlugLabel(category),
        subtitle: (matched.subtitle || collectionLabel).toUpperCase(),
        description:
          matched.description ||
          `Curated ${matched.label || formatSlugLabel(category)} silhouettes crafted in heavyweight combed cotton.`,
        banner: matched.banner || '/images/hero-campaign.jpg',
        spec: matched.spec || '240–280 GSM • Bio-Washed Heavyweight Cotton • Unisex Fit',
      };
    }

    const matchingProducts = products.filter((p) => p.category === category);
    if (matchingProducts.length > 0) {
      const fallbackTitle = matchingProducts[0]?.categoryLabel || formatSlugLabel(category);
      return {
        title: fallbackTitle,
        subtitle: collectionLabel.toUpperCase(),
        description: `Explore all ${fallbackTitle} pieces from ${config.brandName || 'Doffor Clothing'}.`,
        banner: matchingProducts[0]?.images?.[0] || '/images/hero-campaign.jpg',
        spec: '240–280 GSM • Bio-Washed Heavyweight Cotton • Unisex Fit',
      };
    }

    return null;
  }, [categories, category, products, collectionLabel, config.brandName]);

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
            Collection Unavailable
          </h1>
          <p className="text-sm text-ash">
            The collection <span className="text-bone font-mono">{category}</span> does not exist
            in {collectionLabel}. Browse our live catalog instead.
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
      {/* Editorial Banner — Dark Campaign Masthead for Crisp Contrast */}
      <section className="relative overflow-hidden bg-[#0B0B0C] text-white border-b border-[#0B0B0C]/15">
        <img
          src={meta.banner}
          alt={meta.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/70 to-[#0B0B0C]/45" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/65">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-white transition-colors">
                Shop
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">{meta.title}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 backdrop-blur-md border border-white/25 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <Sparkles className="w-3.5 h-3.5" /> {meta.subtitle}
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white">
              {meta.title}
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
              {meta.description}
            </p>

            <div className="inline-flex items-center gap-2 pt-1 font-mono text-xs text-white/75">
              <Layers className="w-4 h-4 text-white" />
              <span>{meta.spec}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Switcher + Sort Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          {/* Switch between collections */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((tab) => {
              const active = tab.id === category;
              return (
                <Link
                  key={tab.id}
                  href={`/collections/${tab.id}`}
                  className={`px-3.5 py-2 rounded-sm font-mono text-xs uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-acid text-obsidian border-acid font-bold'
                      : 'bg-charcoal text-ash border-[#0B0B0C]/15 hover:border-[#0B0B0C]/50 hover:text-bone'
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
              {sizeFilter
                ? `NO PIECES MATCHING SIZE ${sizeFilter}`
                : `NO PIECES IN ${meta.title.toUpperCase()} YET`}
            </p>
            <p className="text-sm text-ash">
              {sizeFilter
                ? `Clear the size filter or check all available pieces in ${collectionLabel}.`
                : `New ${meta.title} silhouettes are dropping soon. Explore all available pieces in ${collectionLabel}.`}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-8 sm:gap-5">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
