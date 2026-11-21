'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  Check,
  Ruler,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/format';

const EDITORIAL_LOOKS = [
  {
    number: 'LOOK 01',
    code: 'D04 // ARCHIVE WING',
    title: 'NOCTURNE BACK-PRINT UNIFORM',
    location: 'CONCRETE ROOFTOP • 22:15 IST',
    productId: 'prod-angel-fullsleeve',
    primaryImage: '/images/real-angel-fullsleeve-black.jpg',
    secondaryImage: '/images/lookbook-campus-1.jpg',
    colorName: 'Jet Black',
    modelSpec: 'Model is 6\'0" / 74 kg wearing size L for signature boxy drop-shoulder drape.',
    stylingNotes:
      'Anchored by our 260 GSM Jet Black Winged Angel Full-Sleeve. Styled loose over washed charcoal wide-leg denim with scuffed leather boots so the distressed white-and-acid-yellow back graphic carries the silhouette.',
    tags: ['260 GSM', 'BIO-WASHED', 'DROP SHOULDER'],
    layout: 'split-left',
  },
  {
    number: 'LOOK 02',
    code: 'D04 // MYTHIC POSTER',
    title: 'ANCIENT DRAGON HEAVY DRAPE',
    location: 'UNDERGROUND PARKING DECK • BENGALURU',
    productId: 'prod-unleash-dragon',
    primaryImage: '/images/real-dragon-fullsleeve.jpg',
    secondaryImage: '/images/lookbook-campus-2.jpg',
    colorName: 'Bone Off-White',
    modelSpec: 'Model is 5\'10" / 68 kg wearing size L for relaxed street layering.',
    stylingNotes:
      'High-contrast Bone Off-White jersey paired with utility nylon parachute pants. The full-back terracotta and ink poster layout reads like a 90s archival concert flyer engineered on dense combed cotton.',
    tags: ['260 GSM', 'PLASTISOL PRINT', 'LIMITED RUN'],
    layout: 'split-right',
  },
  {
    number: 'LOOK 03',
    code: 'D04 // ZINE BOOTLEG',
    title: 'SEPT 21, 1993 GRUNGE COLLAGE',
    location: 'AFTER-HOURS STUDIO • MUMBAI',
    productId: 'prod-in-utero-bootleg',
    primaryImage: '/images/real-bootleg-tee.jpg',
    secondaryImage: '/images/hero-campaign.jpg',
    colorName: 'Electric Cobalt',
    modelSpec: 'Model is 5\'11" / 71 kg wearing size L with elbow-skimming half sleeves.',
    stylingNotes:
      'Pure analog zine energy cut in breathable 240 GSM loop-knit cotton. Electric Cobalt breaks up an all-obsidian rotation—pair with raw selvedge jorts or pleated work trousers and silver chain hardware.',
    tags: ['240 GSM', 'HALFTONE JUMBO PRINT', 'BOXY FIT'],
    layout: 'wide-feature',
  },
  {
    number: 'LOOK 04',
    code: 'D04 // SCULPTURAL VEST',
    title: 'HEAVYWEIGHT BOX-CUT MUSCLE TANK',
    location: 'INDUSTRIAL COURTYARD • NEW DELHI',
    productId: 'prod-vintage-muscle-tank',
    primaryImage: '/images/real-muscle-tank.jpg',
    secondaryImage: '/images/product-muscle-tank.jpg',
    colorName: 'Ochre Mustard',
    modelSpec: 'Model is 6\'1" / 80 kg wearing size XL for wide shoulder-cap structure.',
    stylingNotes:
      'Built to cross from heavy training blocks straight into night sets. Unlike flimsy ribbed vests, our 240 GSM jersey holds architectural shoulder volume—wear solo with baggy cargos or layered over a thermal long-sleeve.',
    tags: ['240 GSM', '6 COLORWAYS', 'EXTENDED SHOULDER'],
    layout: 'split-left',
  },
  {
    number: 'LOOK 05',
    code: 'D04 // ACID SLASH',
    title: 'WINGED ANGEL ACID-YELLOW HALF-SLEEVE',
    location: 'LATE TRANSIT CORRIDOR • PUNE',
    productId: 'prod-angel-halfsleeve',
    primaryImage: '/images/real-angel-halfsleeve.jpg',
    secondaryImage: '/images/product-angel-halfsleeve.jpg',
    colorName: 'Deep Crimson',
    modelSpec: 'Model is 5\'8" / 62 kg wearing size M for an effortless oversized silhouette.',
    stylingNotes:
      'Our #1 daily driver in Deep Crimson garment-dye. High-opacity acid-yellow typography slashes across the anatomical wing print—effortless over faded black carpenter jeans and low-profile runners.',
    tags: ['240 GSM', 'BESTSELLER', 'GARMENT DYED'],
    layout: 'split-right',
  },
  {
    number: 'LOOK 06',
    code: 'D04 // NUMBERED 100 PCS',
    title: 'ARCHIVE PALETTE PIGMENT FULL-SLEEVE',
    location: 'DOFFOR ARCHIVE RACK • STUDIO 04',
    productId: 'prod-angel-rack-edition',
    primaryImage: '/images/real-angel-fullsleeve-rack.jpg',
    secondaryImage: '/images/product-dragon-fullsleeve.jpg',
    colorName: 'Crimson Rose',
    modelSpec: 'Small-batch enzyme pigment-dyed run. Unisex oversized grading S–XXL.',
    stylingNotes:
      'Strictly capped at 100 units across Crimson Rose, Washed Charcoal, and Forest Pine. Heavy enzyme washes soften the seams while locking in lived-in pigment depth that evolves every time you wear it.',
    tags: ['260 GSM', '100 PCS ONLY', 'PIGMENT DYED'],
    layout: 'wide-feature',
  },
];

const QUICK_SIZES = ['M', 'L', 'XL'];

export default function LookbookPage() {
  const { products } = useStore();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [justAdded, setJustAdded] = useState({});

  const getProductForLook = (look, index) => {
    return (
      products.find((p) => p.id === look.productId) ||
      products[index % Math.max(1, products.length)] ||
      null
    );
  };

  const handleSizeSelect = (lookNumber, size) => {
    setSelectedSizes((prev) => ({ ...prev, [lookNumber]: size }));
  };

  const handleQuickAdd = (look, product) => {
    if (!product) return;
    const size = selectedSizes[look.number] || 'L';
    const matchedColor =
      product.colors?.find((c) => c.name === look.colorName)?.name ||
      product.colors?.[0]?.name;

    addToCart(product, { size, color: matchedColor, quantity: 1, openDrawer: true });
    setJustAdded((prev) => ({ ...prev, [look.number]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [look.number]: false }));
    }, 1800);
  };

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      {/* Editorial Hero Masthead — Dark Campaign Canvas for Crisp Luxury Contrast */}
      <section className="relative bg-[#0B0B0C] text-white border-b border-[#0B0B0C]/15 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-campaign.jpg"
            alt="Doffor Drop 04 Archive Grunge Campaign"
            className="w-full h-full object-cover opacity-50 scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/70 to-[#0B0B0C]/45" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-white/20 pb-5">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-white text-[#0B0B0C] font-mono text-[11px] font-bold uppercase tracking-widest rounded-sm">
                ISSUE 04
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/75">
                AUTUMN / WINTER ARCHIVE EDITORIAL
              </span>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-white/80">
              6 CURATED LOOKS • 240–280 GSM HEAVYWEIGHT COTTON
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/75">
                DOFFOR CLOTHING PRESENTS
              </p>
              <h1 className="font-condensed text-6xl sm:text-7xl lg:text-[7.5rem] leading-[0.88] tracking-tight uppercase text-white">
                DROP 04:{' '}
                <span className="text-white/85 block sm:inline">ARCHIVE GRUNGE</span>
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                Shot across raw concrete rooftops, underground parking decks, and late-night studios.
                Six architectural heavyweight silhouettes cut for music heads, designers, athletes, and
                everyone who refuses disposable fast-fashion tees.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <div className="bg-[#0B0B0C]/80 backdrop-blur-md border border-white/20 p-4 w-full sm:w-auto lg:w-72 space-y-2.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/65">
                  Jump To Spread
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {EDITORIAL_LOOKS.map((look) => (
                    <a
                      key={look.number}
                      href={`#${look.number.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-2 py-1.5 text-center rounded-sm bg-white/10 border border-white/20 font-mono text-[11px] text-white hover:bg-white hover:text-[#0B0B0C] transition-colors"
                    >
                      {look.number.replace('LOOK ', '#')}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Look Spreads */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-24 lg:space-y-32">
        {EDITORIAL_LOOKS.map((look, index) => {
          const product = getProductForLook(look, index);
          const chosenSize = selectedSizes[look.number] || 'L';
          const added = Boolean(justAdded[look.number]);
          const anchorId = look.number.toLowerCase().replace(/\s+/g, '-');
          const isReverse = look.layout === 'split-right';
          const isWide = look.layout === 'wide-feature';

          return (
            <article
              key={look.number}
              id={anchorId}
              className="scroll-mt-28 border-t border-white/[0.08] pt-10 lg:pt-14"
            >
              {/* Spread Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="font-condensed text-4xl sm:text-5xl text-acid leading-none">
                    {look.number}
                  </span>
                  <div className="h-8 w-px bg-[#0B0B0C]/20" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
                      {look.code}
                    </p>
                    <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-bone">
                      {look.title}
                    </h2>
                  </div>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-ash">
                  {look.location}
                </span>
              </div>

              {/* Asymmetric Magazine Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                {/* Primary Photography Column */}
                <div
                  className={`${
                    isWide
                      ? 'lg:col-span-7'
                      : isReverse
                      ? 'lg:col-span-7 lg:order-2'
                      : 'lg:col-span-7'
                  } grid grid-cols-12 gap-4`}
                >
                  <div className="col-span-12 sm:col-span-8 relative group overflow-hidden rounded-sm bg-charcoal border border-white/[0.08] aspect-[4/5]">
                    <img
                      src={look.primaryImage}
                      alt={`${look.number} — ${look.title}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {look.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-sm bg-obsidian/85 backdrop-blur-sm border border-white/15 font-mono text-[10px] uppercase tracking-wider text-bone"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-4 flex flex-col gap-4">
                    <div className="relative overflow-hidden rounded-sm bg-charcoal border border-white/[0.08] aspect-[4/5] sm:flex-1">
                      <img
                        src={look.secondaryImage}
                        alt={`${look.title} editorial angle`}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                      />
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-obsidian/80 font-mono text-[9px] uppercase tracking-widest text-acid border border-acid/30">
                        FRAME B
                      </span>
                    </div>

                    <div className="card-dark p-4 space-y-1.5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-acid flex items-center gap-1.5">
                        <Ruler className="w-3 h-3" /> Fit Reference
                      </p>
                      <p className="text-xs text-ash leading-relaxed">{look.modelSpec}</p>
                    </div>
                  </div>
                </div>

                {/* Editorial Notes & Shop This Piece Column */}
                <div
                  className={`${
                    isWide
                      ? 'lg:col-span-5'
                      : isReverse
                      ? 'lg:col-span-5 lg:order-1'
                      : 'lg:col-span-5'
                  } flex flex-col justify-between gap-6`}
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-acid">
                        Stylist Notes
                      </p>
                      <p className="text-sm sm:text-base text-bone/85 leading-relaxed">
                        {look.stylingNotes}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-surface border border-white/[0.06] rounded-sm p-3.5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ash">
                          Fabric Weight
                        </p>
                        <p className="font-display font-bold text-lg text-bone mt-0.5">
                          {product?.gsm || 260} GSM
                        </p>
                      </div>
                      <div className="bg-surface border border-white/[0.06] rounded-sm p-3.5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ash">
                          Featured Shade
                        </p>
                        <p className="font-display font-bold text-base text-bone mt-0.5 truncate">
                          {look.colorName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Shop This Piece Box */}
                  {product && (
                    <div className="card-dark p-5 sm:p-6 space-y-5 border-white/15">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-acid mb-1.5">
                            <Sparkles className="w-3 h-3" /> Shop This Piece
                          </span>
                          <Link
                            href={`/product/${product.slug}`}
                            className="block font-display font-bold text-lg text-bone hover:text-acid transition-colors leading-snug"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-ash mt-1">{product.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-lg text-acid">
                            {formatINR(product.price)}
                          </p>
                          {product.compareAtPrice > product.price && (
                            <p className="font-mono text-xs text-ash line-through">
                              {formatINR(product.compareAtPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Size Picker */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] uppercase tracking-widest text-ash">
                            Select Size (Boxy Oversized)
                          </span>
                          <Link
                            href="/size-guide"
                            className="font-mono text-[11px] text-bone/70 hover:text-acid underline underline-offset-4"
                          >
                            Size Guide
                          </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {QUICK_SIZES.map((sz) => {
                            const active = chosenSize === sz;
                            const stock = product.sizes?.[sz];
                            const outOfStock = typeof stock === 'number' && stock <= 0;
                            return (
                              <button
                                key={sz}
                                type="button"
                                disabled={outOfStock}
                                onClick={() => handleSizeSelect(look.number, sz)}
                                className={`py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider border transition-all ${
                                  outOfStock
                                    ? 'opacity-40 cursor-not-allowed border-white/10 text-ash line-through'
                                    : active
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

                      {/* Quick Add & Product Page Actions */}
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(look, product)}
                          className="btn-acid flex-1"
                        >
                          {added ? (
                            <>
                              <Check className="w-4 h-4" /> Added ({chosenSize})
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" /> Shop This Piece — {chosenSize}
                            </>
                          )}
                        </button>
                        <Link
                          href={`/product/${product.slug}`}
                          className="btn-outline px-4 shrink-0"
                          title="View full product details"
                        >
                          Details <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Bottom Lookbook CTA Banner */}
      <section className="border-t border-white/[0.08] bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-acid">
              <Layers className="w-4 h-4" /> Complete The Rotation
            </span>
            <h2 className="font-condensed text-4xl sm:text-5xl uppercase tracking-tight">
              EXPLORE THE FULL DROP 04 ARCHIVE
            </h2>
            <p className="text-sm sm:text-base text-ash">
              Free pan-India express shipping above ₹1,499. Use code{' '}
              <span className="font-mono text-acid font-semibold">DOFFOR10</span> for 10% off or
              calculate your exact drop-shoulder size before checking out.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="btn-acid">
              Shop All Drop 04 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/size-guide" className="btn-outline">
              Fit Calculator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
