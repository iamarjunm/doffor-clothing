'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { ProductGridSkeleton } from '../components/DofforLoader';

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'full-sleeves', label: 'Full-Sleeves' },
  { id: 'oversized-tees', label: 'Oversized Tees' },
  { id: 'muscle-tanks', label: 'Muscle Tanks' },
  { id: 'limited-drops', label: 'Limited Archive' },
];

const TICKER_ITEMS = [
  '240–280 GSM HEAVYWEIGHT COTTON',
  'BOXY DROP-SHOULDER ARCHITECTURE',
  'HIGH-DENSITY ARCHIVAL PRINTS',
  'PAN-INDIA EXPRESS',
  'RAZORPAY INSTANT UPI',
];

export default function HomePage() {
  const { products, config, loading, pushToast } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState('');

  const heroSectionRef = useRef(null);
  const heroParallaxRef = useRef(null);
  const heroCopyRef = useRef(null);
  const heroScrollCueRef = useRef(null);

  useEffect(() => {
    let rafId = null;

    const updateParallax = () => {
      rafId = null;
      const scrollY = window.scrollY || 0;
      const heroHeight = heroSectionRef.current?.offsetHeight || 800;

      if (scrollY <= heroHeight * 1.25) {
        if (heroParallaxRef.current) {
          const offset = (scrollY * 0.14).toFixed(2);
          heroParallaxRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
        if (heroCopyRef.current) {
          const progress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.65)));
          heroCopyRef.current.style.opacity = String((1 - progress * 0.85).toFixed(3));
          heroCopyRef.current.style.transform = `translate3d(0, ${(-progress * 18).toFixed(2)}px, 0)`;
        }
        if (heroScrollCueRef.current) {
          const cueOpacity = Math.max(0, 1 - scrollY / 180);
          heroScrollCueRef.current.style.opacity = String(cueOpacity.toFixed(3));
        }
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const hero = config.hero || {};
  const sections = config.sections || {};
  const newArrivals = config.newArrivals || {};
  const editorialSplit = config.editorialSplit || [];
  const silhouettes = config.silhouettes || [];
  const craftStory = config.craftStory || {};
  const lookbookStrip = config.lookbookStrip || [];
  const privilegeBar = config.privilegeBar || {};

  const filteredProducts = useMemo(() => {
    const list =
      activeTab === 'all' ? products : products.filter((p) => p.category === activeTab);
    return list.slice(0, Number(newArrivals.maxItems) || 8);
  }, [products, activeTab, newArrivals.maxItems]);

  const handleCopyCode = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    pushToast(`Code ${code} copied to clipboard`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const overlayAlpha = Math.min(85, Math.max(0, Number(hero.overlayOpacity ?? 65))) / 100;

  return (
    <div>
      {/* 1. FULL-BLEED EDITORIAL CAMPAIGN HERO WITH GPU SCROLL PARALLAX */}
      <section
        ref={heroSectionRef}
        className="relative w-full h-[88vh] min-h-[580px] max-h-[920px] bg-[#111113] overflow-hidden"
      >
        <div
          ref={heroParallaxRef}
          className="absolute -inset-y-12 inset-x-0 will-change-transform"
        >
          <img
            src={hero.image || '/images/hero-campaign.jpg'}
            alt="Doffor Editorial Campaign"
            className="w-full h-full object-cover object-center animate-hero-zoom"
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,${overlayAlpha}) 0%, rgba(0,0,0,${(
              overlayAlpha * 0.25
            ).toFixed(2)}) 55%, rgba(0,0,0,0.16) 100%)`,
          }}
        />

        {/* Subtle Top-Right Archive Index Tag */}
        <div className="absolute top-6 sm:top-8 right-6 sm:right-10 z-10 flex items-center gap-3 text-white/70 animate-fade-in-slow pointer-events-none">
          <span className="w-6 h-px bg-white/40" />
          <span className="text-[10px] uppercase tracking-[0.28em] font-medium">
            01 / ARCHIVE
          </span>
        </div>

        <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 sm:px-10 pb-12 sm:pb-16 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-8">
            <div
              ref={heroCopyRef}
              className="max-w-2xl space-y-5 text-white will-change-[opacity,transform]"
            >
              <div className="overflow-hidden">
                <p
                  className="text-[11px] uppercase tracking-[0.28em] text-white/80 font-medium animate-letter-rise"
                  style={{ animationDelay: '120ms' }}
                >
                  {hero.eyebrow || 'Drop 04 — Autumn / Winter Archive'}
                </p>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[68px] leading-[0.98] tracking-[-0.02em] uppercase">
                <span className="block overflow-hidden">
                  <span className="block animate-letter-rise" style={{ animationDelay: '220ms' }}>
                    {hero.headlineLine1 || 'Heavyweight Forms.'}
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="block animate-letter-rise" style={{ animationDelay: '340ms' }}>
                    {hero.headlineLine2 || 'Built To Outlast.'}
                  </span>
                </span>
              </h1>

              <p
                className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-light animate-fade-in-slow"
                style={{ animationDelay: '460ms' }}
              >
                {hero.description}
              </p>

              <div
                className="flex flex-wrap items-center gap-4 pt-2 animate-fade-in-slow"
                style={{ animationDelay: '580ms' }}
              >
                <Link
                  href={hero.primaryCtaHref || '/shop'}
                  className="inline-flex items-center gap-2.5 bg-white text-[#0B0B0C] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-all duration-300 hover:gap-3.5"
                  style={{ borderRadius: 'var(--df-radius)' }}
                >
                  {hero.primaryCtaLabel || 'Shop Drop 04'} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={hero.secondaryCtaHref || '/lookbook'}
                  className="inline-flex items-center gap-2 border border-white/50 text-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-white hover:text-[#0B0B0C] transition-colors"
                  style={{ borderRadius: 'var(--df-radius)' }}
                >
                  {hero.secondaryCtaLabel || 'View Lookbook'}
                </Link>
              </div>
            </div>

            {/* Editorial Scroll Indicator at Bottom-Right */}
            <div
              ref={heroScrollCueRef}
              className="hidden sm:flex flex-col items-center gap-3 pb-1 text-white/75 animate-fade-in-slow shrink-0 select-none pointer-events-none"
              style={{ animationDelay: '700ms' }}
            >
              <span className="text-[9px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
                SCROLL
              </span>
              <span className="relative w-px h-12 bg-white/20 overflow-hidden">
                <span className="absolute inset-0 bg-white animate-scroll-cue" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. WHISPER-QUIET MONOCHROME EDITORIAL TICKER STRIP */}
      <div
        aria-label="Brand specifications"
        className="border-y border-black/10 py-3.5 bg-white overflow-hidden select-none"
      >
        <div className="flex w-max animate-marquee-editorial">
          {[0, 1].map((half) => (
            <div
              key={half}
              aria-hidden={half === 1}
              className="flex shrink-0 items-center gap-8 pr-8"
            >
              {[0, 1].map((dup) =>
                TICKER_ITEMS.map((item, idx) => (
                  <React.Fragment key={`${half}-${dup}-${idx}`}>
                    <span className="text-[10px] tracking-[0.26em] uppercase text-neutral-500 whitespace-nowrap">
                      {item}
                    </span>
                    <span className="text-[10px] text-neutral-300" aria-hidden="true">
                      •
                    </span>
                  </React.Fragment>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. NEW ARRIVALS — GALLERY 4-COLUMN PRODUCT GRID */}
      {sections.showNewArrivals !== false && (
        <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/10">
            <div>
              <Reveal variant="up" y={12}>
                <p className="text-[10px] uppercase tracking-[0.24em] opacity-60 mb-2">
                  {newArrivals.eyebrow || 'Collection 04'}
                </p>
              </Reveal>
              <Reveal variant="mask" delay={80}>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight">
                  {newArrivals.heading || 'New Arrivals'}
                </h2>
              </Reveal>
            </div>

            <Reveal variant="up" delay={120} y={12}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-[11px] uppercase tracking-[0.16em] pb-1 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'font-semibold border-b border-current opacity-100'
                        : 'opacity-45 hover:opacity-100 editorial-link'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="pt-10">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                {filteredProducts.map((product, idx) => (
                  <Reveal key={product.id} variant="up" delay={(idx % 4) * 75} y={24}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          <Reveal variant="up" delay={100} className="mt-14 text-center">
            <Link href="/shop" className="btn-outline px-10">
              View All Pieces
            </Link>
          </Reveal>
        </section>
      )}

      {/* 3. EDGE-TO-EDGE 50/50 CAMPAIGN EDITORIAL SPLIT */}
      {sections.showEditorialSplit !== false && editorialSplit.length >= 2 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {editorialSplit.slice(0, 2).map((panel, idx) => (
            <Reveal key={idx} variant="curtain" delay={idx * 130}>
              <Link
                href={panel.href || '/shop'}
                className="group relative block aspect-[4/5] lg:aspect-auto lg:h-[78vh] overflow-hidden bg-[#161618]"
              >
                <img
                  src={panel.image}
                  alt={panel.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/75">
                      {panel.eyebrow}
                    </p>
                    <h3 className="font-display font-semibold text-2xl sm:text-3xl mt-1">
                      {panel.title}
                    </h3>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] editorial-link flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Shop <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </section>
      )}

      {/* 4. SILHOUETTE DIRECTORY */}
      {sections.showSilhouettes !== false && silhouettes.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Reveal variant="up" y={12}>
                <p className="text-[10px] uppercase tracking-[0.24em] opacity-60 mb-2">
                  Archive Index
                </p>
              </Reveal>
              <Reveal variant="mask" delay={80}>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight">
                  Shop By Silhouette
                </h2>
              </Reveal>
            </div>
            <Reveal variant="up" delay={120} y={12}>
              <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] opacity-75 hover:opacity-100 editorial-link"
              >
                Full Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {silhouettes.map((tile, idx) => (
              <Link key={idx} href={tile.href || '/shop'} className="group block">
                <Reveal variant="curtain" delay={idx * 90}>
                  <div className="aspect-[3/4] overflow-hidden bg-[#F2F1EC]">
                    <img
                      src={tile.image}
                      alt={tile.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                </Reveal>
                <Reveal variant="up" delay={idx * 90 + 100} y={12}>
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium editorial-link">
                        {tile.title}
                      </h3>
                      <p className="text-[11px] opacity-60 mt-0.5">{tile.spec}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Reveal>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. MATERIAL ARCHITECTURE — BRAND STORY SPLIT */}
      {sections.showCraftStory !== false && (
        <section className="card-dark border-x-0">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <Reveal variant="up" y={12}>
                <p className="text-[10px] uppercase tracking-[0.26em] opacity-60">
                  {craftStory.eyebrow || 'Fabric & Construction'}
                </p>
              </Reveal>
              <Reveal variant="mask" delay={80}>
                <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight tracking-tight">
                  {craftStory.heading}
                </h2>
              </Reveal>
              <Reveal variant="up" delay={140} y={16}>
                <p className="text-sm opacity-75 leading-relaxed">{craftStory.body}</p>
              </Reveal>

              <Reveal variant="up" delay={200} y={18}>
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-black/10">
                  <div>
                    <p className="font-display font-bold text-2xl">
                      {craftStory.stat1Value || '260'}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.16em] opacity-60 mt-1">
                      {craftStory.stat1Label || 'Avg GSM Weight'}
                    </p>
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl">
                      {craftStory.stat2Value || '2.5cm'}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.16em] opacity-60 mt-1">
                      {craftStory.stat2Label || 'Lycra Rib Collar'}
                    </p>
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl">
                      {craftStory.stat3Value || '100%'}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.16em] opacity-60 mt-1">
                      {craftStory.stat3Label || 'Combed Cotton'}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal variant="up" delay={260} y={14}>
                <div className="pt-2">
                  <Link href={craftStory.ctaHref || '/about'} className="btn-acid">
                    {craftStory.ctaLabel || 'Read Our Craft'}
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <Reveal
                variant="curtain"
                delay={100}
                className="aspect-[3/4] overflow-hidden bg-[#ECEAE4]"
              >
                <img
                  src={craftStory.image1 || '/images/product-angel-fullsleeve.jpg'}
                  alt="Fabric Detail"
                  className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                />
              </Reveal>
              <Reveal
                variant="curtain"
                delay={220}
                className="aspect-[3/4] overflow-hidden bg-[#ECEAE4] mt-8"
              >
                <img
                  src={craftStory.image2 || '/images/lookbook-campus-1.jpg'}
                  alt="Editorial Fit"
                  className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                />
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* 6. LOOKBOOK EDITORIAL STRIP */}
      {sections.showLookbookStrip !== false && lookbookStrip.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Reveal variant="up" y={12}>
                <p className="text-[10px] uppercase tracking-[0.24em] opacity-60 mb-2">
                  Editorial 04
                </p>
              </Reveal>
              <Reveal variant="mask" delay={80}>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight">
                  The Lookbook
                </h2>
              </Reveal>
            </div>
            <Reveal variant="up" delay={120} y={12}>
              <Link
                href="/lookbook"
                className="text-[11px] uppercase tracking-[0.16em] opacity-75 hover:opacity-100 editorial-link"
              >
                Explore Full Editorial
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {lookbookStrip.map((shot, idx) => (
              <Link key={idx} href="/lookbook" className="group block">
                <Reveal variant="curtain" delay={idx * 85}>
                  <div className="aspect-[3/4] overflow-hidden bg-[#F2F1EC]">
                    <img
                      src={shot.src}
                      alt={shot.caption}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                </Reveal>
                <Reveal variant="up" delay={idx * 85 + 90} y={10}>
                  <p className="text-[11px] opacity-60 mt-2.5">{shot.caption}</p>
                </Reveal>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 7. PRIVILEGE PROMO BAR */}
      {sections.showPrivilegeBar !== false && (
        <Reveal variant="up" className="max-w-[1440px] mx-auto px-6 sm:px-10">
          <div className="card-dark px-6 sm:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.24em] opacity-60">
                {privilegeBar.eyebrow || 'Doffor Privilege'}
              </p>
              <Reveal variant="mask" delay={80}>
                <h3 className="font-display font-semibold text-2xl">
                  {privilegeBar.heading || '10% Off Your Drop 04 Order'}
                </h3>
              </Reveal>
              <p className="text-sm opacity-75">{privilegeBar.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {privilegeBar.promoCode && (
                <button
                  type="button"
                  onClick={() => handleCopyCode(privilegeBar.promoCode)}
                  className="btn-outline"
                >
                  {copiedCode === privilegeBar.promoCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied {privilegeBar.promoCode}
                    </>
                  ) : (
                    `Copy ${privilegeBar.promoCode}`
                  )}
                </button>
              )}
              <Link href={privilegeBar.ctaHref || '/shop'} className="btn-acid">
                {privilegeBar.ctaLabel || 'Shop Now'}
              </Link>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
