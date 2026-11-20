'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'full-sleeves', label: 'Full-Sleeves' },
  { id: 'oversized-tees', label: 'Oversized Tees' },
  { id: 'muscle-tanks', label: 'Muscle Tanks' },
  { id: 'limited-drops', label: 'Limited Archive' },
];

export default function HomePage() {
  const { products, pushToast } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState('');

  const filteredProducts = useMemo(() => {
    const list =
      activeTab === 'all'
        ? products
        : products.filter((p) => p.category === activeTab);
    return list.slice(0, 8);
  }, [products, activeTab]);

  const handleCopyCode = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    pushToast(`Code ${code} copied to clipboard`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div className="bg-white text-[#0B0B0C]">
      {/* =======================================================
          1. FULL-BLEED EDITORIAL CAMPAIGN HERO
         ======================================================= */}
      <section className="relative w-full h-[88vh] min-h-[580px] max-h-[920px] bg-[#111113] overflow-hidden">
        <img
          src="/images/hero-campaign.jpg"
          alt="Doffor Clothing Drop 04 Editorial Campaign"
          className="w-full h-full object-cover object-center scale-[1.01]"
        />
        {/* Subtle bottom-weighted editorial vignette — keeps photography front and center */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />

        <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 sm:px-10 pb-12 sm:pb-16 flex flex-col justify-end">
          <div className="max-w-2xl space-y-5 text-white">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/80 font-medium">
              Drop 04 — Autumn / Winter Archive
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[68px] leading-[0.98] tracking-[-0.02em] uppercase">
              Heavyweight Forms.
              <br />
              Built To Outlast.
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-light">
              240–280 GSM super-combed bio-washed cotton. Engineered boxy drop-shoulder
              silhouettes and archival back-print artwork.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 bg-white text-[#0B0B0C] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors"
              >
                Shop Drop 04 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/lookbook"
                className="inline-flex items-center gap-2 border border-white/50 text-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-white hover:text-[#0B0B0C] transition-colors"
              >
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          2. NEW ARRIVALS — GALLERY 4-COLUMN PRODUCT GRID
         ======================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500 mb-2">
              Collection 04
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-[#0B0B0C]">
              New Arrivals
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[11px] uppercase tracking-[0.16em] pb-1 transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0B0B0C] font-semibold border-b border-[#0B0B0C]'
                    : 'text-neutral-400 hover:text-[#0B0B0C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 pt-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/shop" className="btn-outline px-10">
            View All Pieces
          </Link>
        </div>
      </section>

      {/* =======================================================
          3. EDGE-TO-EDGE 50/50 CAMPAIGN EDITORIAL SPLIT
         ======================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <Link
          href="/collections/full-sleeves"
          className="group relative aspect-[4/5] lg:aspect-auto lg:h-[78vh] overflow-hidden bg-[#161618]"
        >
          <img
            src="/images/real-dragon-fullsleeve.jpg"
            alt="Heavyweight Full-Sleeves"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/75">260–280 GSM</p>
              <h3 className="font-display font-semibold text-2xl sm:text-3xl mt-1">
                Heavyweight Full-Sleeves
              </h3>
            </div>
            <span className="text-[11px] uppercase tracking-[0.18em] border-b border-white pb-1 flex items-center gap-1.5">
              Shop <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        <Link
          href="/collections/muscle-tanks"
          className="group relative aspect-[4/5] lg:aspect-auto lg:h-[78vh] overflow-hidden bg-[#161618]"
        >
          <img
            src="/images/real-muscle-tank.jpg"
            alt="Boxy Muscle Tanks"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/75">6 Colorways</p>
              <h3 className="font-display font-semibold text-2xl sm:text-3xl mt-1">
                Boxy Muscle Tanks
              </h3>
            </div>
            <span className="text-[11px] uppercase tracking-[0.18em] border-b border-white pb-1 flex items-center gap-1.5">
              Shop <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </section>

      {/* =======================================================
          4. SILHOUETTE DIRECTORY (4 CLEAN EDITORIAL TILES)
         ======================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500 mb-2">
              Archive Index
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight">
              Shop By Silhouette
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-600 hover:text-black border-b border-black/25 pb-0.5"
          >
            Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: 'Oversized Tees',
              spec: '240 GSM Combed Jersey',
              image: '/images/real-bootleg-tee.jpg',
              href: '/collections/oversized-tees',
            },
            {
              title: 'Full-Sleeves',
              spec: '260–280 GSM Heavyweight',
              image: '/images/real-angel-fullsleeve-black.jpg',
              href: '/collections/full-sleeves',
            },
            {
              title: 'Muscle Tanks',
              spec: '240 GSM Boxy Cut',
              image: '/images/product-muscle-tank.jpg',
              href: '/collections/muscle-tanks',
            },
            {
              title: 'Limited Archive',
              spec: 'Small-Batch Runs',
              image: '/images/real-angel-fullsleeve-rack.jpg',
              href: '/collections/limited-drops',
            },
          ].map((tile) => (
            <Link key={tile.href} href={tile.href} className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-[#F2F1EC]">
                <img
                  src={tile.image}
                  alt={tile.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#0B0B0C] group-hover:underline underline-offset-4">
                    {tile.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{tile.spec}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =======================================================
          5. MATERIAL ARCHITECTURE — BRAND STORY SPLIT
         ======================================================= */}
      <section className="bg-[#F6F5F2] border-y border-black/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">
              Fabric & Construction
            </p>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight tracking-tight text-[#0B0B0C]">
              Substantial weight you feel the second you put it on.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every Doffor piece starts with custom-knitted 240 to 280 GSM super-combed cotton,
              silicone bio-washed for a broken-in handfeel and paired with high-opacity archival
              screen prints that age with character instead of cracking.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-black/10">
              <div>
                <p className="font-display font-bold text-2xl text-[#0B0B0C]">260</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mt-1">
                  Avg GSM Weight
                </p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-[#0B0B0C]">2.5cm</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mt-1">
                  Lycra Rib Collar
                </p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-[#0B0B0C]">100%</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mt-1">
                  Combed Cotton
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/about" className="btn-acid">
                Read Our Craft
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden bg-[#ECEAE4]">
              <img
                src="/images/product-angel-fullsleeve.jpg"
                alt="260 GSM Heavyweight Cotton Detail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-[#ECEAE4] mt-8">
              <img
                src="/images/lookbook-campus-1.jpg"
                alt="Doffor Editorial Styling"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          6. LOOKBOOK EDITORIAL STRIP
         ======================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500 mb-2">
              Editorial 04
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight">
              The Lookbook
            </h2>
          </div>
          <Link
            href="/lookbook"
            className="text-[11px] uppercase tracking-[0.16em] text-[#0B0B0C] border-b border-black pb-0.5 hover:opacity-70"
          >
            Explore Full Editorial
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { src: '/images/lookbook-campus-1.jpg', caption: 'Look 01 — Winged Angel Black' },
            { src: '/images/lookbook-campus-2.jpg', caption: 'Look 02 — Dragon Bone & Black Tank' },
            { src: '/images/product-bootleg-tee.jpg', caption: 'Look 03 — 1993 Archive Bootleg' },
            { src: '/images/real-angel-halfsleeve.jpg', caption: 'Look 04 — Acid-Yellow Drop Tee' },
          ].map((shot) => (
            <Link key={shot.caption} href="/lookbook" className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-[#F2F1EC]">
                <img
                  src={shot.src}
                  alt={shot.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-2.5">{shot.caption}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* =======================================================
          7. QUIET PRIVILEGE / FIRST ORDER BAR
         ======================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="border border-black/15 bg-[#F6F5F2] px-6 sm:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              Doffor Privilege
            </p>
            <h3 className="font-display font-semibold text-2xl text-[#0B0B0C]">
              10% Off Your Drop 04 Order
            </h3>
            <p className="text-sm text-neutral-600">
              Apply code <strong className="text-black">DOFFOR10</strong> (or{' '}
              <strong className="text-black">STUDENT10</strong> with a valid student email) at
              checkout. Instant UPI, cards & COD via Razorpay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopyCode('DOFFOR10')}
              className="btn-outline"
            >
              {copiedCode === 'DOFFOR10' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied DOFFOR10
                </>
              ) : (
                'Copy DOFFOR10'
              )}
            </button>
            <Link href="/shop" className="btn-acid">
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
