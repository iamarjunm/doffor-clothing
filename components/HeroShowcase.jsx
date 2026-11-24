'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../lib/format';
import { resolveSanityImage } from '../lib/sanity';

const SLIDE_DURATION_MS = 6500;

export default function HeroShowcase() {
  const { config, products } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  const heroSectionRef = useRef(null);
  const heroParallaxRef = useRef(null);
  const heroCopyRef = useRef(null);
  const heroScrollCueRef = useRef(null);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(null);

  const hero = config?.hero || {};
  const overlayAlpha = Math.min(85, Math.max(0, Number(hero.overlayOpacity ?? 65))) / 100;

  // Resolve live product cards for each slide's "In This Frame" shoppable card
  const slides = useMemo(() => {
    const productList = Array.isArray(products) ? products : [];
    const findProduct = (preferredSlugs, fallbackIndex = 0) => {
      for (const slug of preferredSlugs) {
        const match = productList.find((p) => p.slug === slug);
        if (match) return match;
      }
      return productList[fallbackIndex] || productList[0] || null;
    };

    const slide1Product = findProduct(
      ['sept-1993-grunge-bootleg-oversized-tee', 'winged-angel-acid-yellow-oversized-tee'],
      2
    );
    const slide2Product = findProduct(
      ['winged-angel-heavyweight-fullsleeve', 'archive-palette-winged-fullsleeve'],
      0
    );
    const slide3Product = findProduct(
      ['unleash-the-dragon-archive-fullsleeve', 'retro-boxy-heavyweight-muscle-tank'],
      1
    );

    return [
      {
        id: 'slide-campaign',
        indexLabel: '01',
        chapter: 'ARCHIVE CAMPAIGN',
        eyebrow: hero.eyebrow || 'Autumn / Winter Collection',
        headlineLine1: hero.headlineLine1 || 'Heavyweight Forms.',
        headlineLine2: hero.headlineLine2 || 'Built To Outlast.',
        description:
          hero.description ||
          '240–280 GSM super-combed bio-washed cotton. Engineered boxy drop-shoulder silhouettes and archival back-print artwork.',
        primaryCtaLabel: hero.primaryCtaLabel || 'Shop Collection',
        primaryCtaHref: hero.primaryCtaHref || '/shop',
        secondaryCtaLabel: hero.secondaryCtaLabel || 'View Lookbook',
        secondaryCtaHref: hero.secondaryCtaHref || '/lookbook',
        image: resolveSanityImage(hero.image || '/images/hero-campaign.jpg'),
        imagePosition: 'object-center',
        featuredProduct: slide1Product,
        frameTag: 'Campaign Look 01',
      },
      {
        id: 'slide-angel-fullsleeve',
        indexLabel: '02',
        chapter: '260 GSM HEAVYWEIGHT',
        eyebrow: '260 GSM Heavyweight Cotton',
        headlineLine1: 'Archival Grunge.',
        headlineLine2: 'Cut Boxy.',
        description:
          'Custom-milled 260 GSM bio-washed cotton jersey with exaggerated drop shoulders, structured rib cuffs, and distressed winged angel back artwork.',
        primaryCtaLabel: 'Shop Winged Angel',
        primaryCtaHref: '/product/winged-angel-heavyweight-fullsleeve',
        secondaryCtaLabel: 'All Full-Sleeves',
        secondaryCtaHref: '/collections/full-sleeves',
        image: resolveSanityImage('/images/lookbook-campus-1.jpg'),
        imagePosition: 'object-[center_22%]',
        featuredProduct: slide2Product,
        frameTag: 'Winged Angel Edition',
      },
      {
        id: 'slide-dragon-tanks',
        indexLabel: '03',
        chapter: 'AFTER-HOURS DROP',
        eyebrow: 'After-Hours Silhouettes',
        headlineLine1: 'Built Loud.',
        headlineLine2: 'Zero Compromise.',
        description:
          'Full-back Unleash The Dragon archival graphics paired with sculptural 240 GSM boxy muscle tanks cut for late-night street rotation.',
        primaryCtaLabel: 'Shop Full-Sleeves',
        primaryCtaHref: '/collections/full-sleeves',
        secondaryCtaLabel: 'Shop Muscle Tanks',
        secondaryCtaHref: '/collections/muscle-tanks',
        image: resolveSanityImage('/images/lookbook-campus-2.jpg'),
        imagePosition: 'object-[center_20%]',
        featuredProduct: slide3Product,
        frameTag: 'Dragon & Tank Study',
      },
    ];
  }, [hero, products]);

  const totalSlides = slides.length;
  const currentSlide = slides[activeIndex] || slides[0];
  const featured = currentSlide?.featuredProduct || null;
  const featuredThumb = featured
    ? resolveSanityImage(featured.images?.[0] || featured.colors?.[0]?.image || '')
    : '';

  // Trigger initial Ken Burns ease-out after first paint
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const goToSlide = useCallback(
    (nextIndex) => {
      const normalized = ((nextIndex % totalSlides) + totalSlides) % totalSlides;
      elapsedRef.current = 0;
      lastTickRef.current = null;
      setProgress(0);
      setActiveIndex(normalized);
    },
    [totalSlides]
  );

  const handlePrev = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  const handleNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  // Smooth rAF auto-advance progress timer (6.5s per slide, pauses on hover or manual pause)
  useEffect(() => {
    if (isPaused || isHovered) {
      lastTickRef.current = null;
      return;
    }

    let frameId = null;

    const tick = (now) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const delta = Math.min(100, now - lastTickRef.current);
      lastTickRef.current = now;
      elapsedRef.current += delta;

      const ratio = Math.min(1, elapsedRef.current / SLIDE_DURATION_MS);
      setProgress(ratio);

      if (elapsedRef.current >= SLIDE_DURATION_MS) {
        elapsedRef.current = 0;
        lastTickRef.current = now;
        setProgress(0);
        setActiveIndex((prev) => (prev + 1) % totalSlides);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isPaused, isHovered, totalSlides, activeIndex]);

  // Lightweight GPU scroll parallax via rAF
  useEffect(() => {
    let rafId = null;

    const updateParallax = () => {
      rafId = null;
      const scrollY = window.scrollY || 0;
      const heroHeight = heroSectionRef.current?.offsetHeight || 820;

      if (scrollY <= heroHeight * 1.25) {
        if (heroParallaxRef.current) {
          const offset = (scrollY * 0.14).toFixed(2);
          heroParallaxRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
        if (heroCopyRef.current) {
          const scrollProgress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.68)));
          heroCopyRef.current.style.opacity = String((1 - scrollProgress * 0.85).toFixed(3));
          heroCopyRef.current.style.transform = `translate3d(0, ${(-scrollProgress * 18).toFixed(
            2
          )}px, 0)`;
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

  return (
    <section
      ref={heroSectionRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Doffor Runway Campaign Showcase"
      className="relative w-full h-[90vh] min-h-[600px] max-h-[940px] bg-[#0B0B0C] overflow-hidden select-none"
    >
      {/* MULTI-SLIDE PARALLAX IMAGE STACK WITH 1100MS CROSS-FADE & KEN BURNS SCALE */}
      <div
        ref={heroParallaxRef}
        className="absolute -inset-y-12 inset-x-0 will-change-transform"
      >
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const isSettled = isActive && mounted;

          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
                isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={`${slide.headlineLine1} ${slide.headlineLine2}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className={`w-full h-full object-cover ${slide.imagePosition} will-change-transform transition-transform ease-out ${
                  isSettled ? 'scale-100 duration-[6500ms]' : 'scale-[1.06] duration-[1100ms]'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* EDITORIAL GRADIENT SCRIM RESPECTING LIVE ADMIN OVERLAY OPACITY */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(11,11,12,${Math.min(
            0.9,
            overlayAlpha + 0.14
          ).toFixed(2)}) 0%, rgba(11,11,12,${(overlayAlpha * 0.36).toFixed(
            2
          )}) 52%, rgba(11,11,12,0.22) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(11,11,12,0.58) 0%, rgba(11,11,12,0.12) 55%, rgba(11,11,12,0.25) 100%)',
        }}
      />

      {/* TOP-RIGHT ARCHIVE SLIDE INDEX */}
      <div className="absolute top-6 sm:top-8 right-6 sm:right-10 z-20 flex items-center gap-3 text-white/75 pointer-events-none">
        <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.26em] text-white/55">
          {currentSlide.chapter}
        </span>
        <span className="w-6 h-px bg-white/40" />
        <span className="text-[10px] uppercase tracking-[0.28em] font-medium tabular-nums">
          {currentSlide.indexLabel} / 0{totalSlides}
        </span>
      </div>

      {/* FOREGROUND EDITORIAL LAYOUT */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-10 pt-24 pb-8 sm:pb-12 flex flex-col justify-end">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12">
          {/* LEFT: SLIDE COPY + CTAS */}
          <div
            ref={heroCopyRef}
            className="max-w-2xl text-white will-change-[opacity,transform]"
          >
            <div key={currentSlide.id} className="space-y-4 sm:space-y-5">
              <div className="overflow-hidden">
                <p
                  className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-white/80 font-medium animate-letter-rise"
                  style={{ animationDelay: '60ms' }}
                >
                  {currentSlide.eyebrow}
                </p>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[68px] leading-[0.96] tracking-[-0.025em] uppercase">
                <span className="block overflow-hidden">
                  <span
                    className="block animate-letter-rise"
                    style={{ animationDelay: '140ms' }}
                  >
                    {currentSlide.headlineLine1}
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span
                    className="block animate-letter-rise"
                    style={{ animationDelay: '240ms' }}
                  >
                    {currentSlide.headlineLine2}
                  </span>
                </span>
              </h1>

              <p
                className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-light animate-fade-in-slow"
                style={{ animationDelay: '280ms' }}
              >
                {currentSlide.description}
              </p>

              <div
                className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 animate-fade-in-slow"
                style={{ animationDelay: '360ms' }}
              >
                <Link
                  href={currentSlide.primaryCtaHref}
                  className="inline-flex items-center gap-2.5 bg-white text-[#0B0B0C] px-7 sm:px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-all duration-300 hover:gap-3.5"
                  style={{ borderRadius: 'var(--df-radius)' }}
                >
                  {currentSlide.primaryCtaLabel} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={currentSlide.secondaryCtaHref}
                  className="inline-flex items-center gap-2 border text-white px-7 sm:px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-white hover:text-[#0B0B0C] transition-colors"
                  style={{
                    borderRadius: 'var(--df-radius)',
                    borderColor: 'rgba(255, 255, 255, 0.48)',
                  }}
                >
                  {currentSlide.secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT (DESKTOP): SHOPPABLE "IN THIS FRAME" FLOATING CARD + SCROLL CUE */}
          <div className="hidden lg:flex items-end gap-6 shrink-0">
            {featured && (
              <Link
                key={featured.id}
                href={`/product/${featured.slug}`}
                className="group hidden lg:flex items-center gap-4 w-[332px] p-3.5 bg-black/60 backdrop-blur-md border border-white/15 text-white transition-all duration-500 hover:bg-black/75 animate-fade-in-slow"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.16)',
                  animationDelay: '180ms',
                }}
              >
                <div className="relative w-16 h-[84px] shrink-0 overflow-hidden bg-[#141417]">
                  {featuredThumb && (
                    <img
                      src={featuredThumb}
                      alt={featured.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] text-white/60">
                    <ShoppingBag className="w-3 h-3 text-white/75" />
                    <span>In This Frame</span>
                  </div>

                  <p className="text-xs font-medium text-white leading-snug line-clamp-1 group-hover:text-white/90">
                    {featured.name}
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">
                    {featured.gsm || 260} GSM • {featured.fit || 'Boxy Oversized'}
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold tracking-wide text-white tabular-nums">
                        {formatINR(featured.price)}
                      </span>
                      {featured.compareAtPrice > featured.price && (
                        <span className="text-[10px] text-white/40 line-through tabular-nums">
                          {formatINR(featured.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-white/90 group-hover:text-white group-hover:gap-1.5 transition-all">
                      Shop Piece <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* EDITORIAL SCROLL CUE */}
            <div
              ref={heroScrollCueRef}
              className="flex flex-col items-center gap-3 pb-1 text-white/75 shrink-0 pointer-events-none"
            >
              <span className="text-[9px] uppercase tracking-[0.32em] [writing-mode:vertical-rl]">
                SCROLL
              </span>
              <span className="relative w-px h-12 bg-white/20 overflow-hidden">
                <span className="absolute inset-0 bg-white animate-scroll-cue" />
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM EDITORIAL RUNWAY CONTROLS: 01 / 02 / 03 HAIRLINE PROGRESS BARS */}
        <div
          className="mt-8 sm:mt-10 pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.14)' }}
        >
          {/* Slide Progress Selector */}
          <div
            role="tablist"
            aria-label="Campaign slides"
            className="grid grid-cols-3 gap-3 sm:gap-5 w-full sm:max-w-md"
          >
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              const isCompleted = idx < activeIndex;
              const fillWidth = isActive
                ? `${Math.round(progress * 100)}%`
                : isCompleted
                ? '100%'
                : '0%';

              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${slide.indexLabel}: ${slide.headlineLine1}`}
                  onClick={() => goToSlide(idx)}
                  className="group text-left py-1 focus:outline-none"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase tracking-[0.24em] tabular-nums transition-colors ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-white/45 group-hover:text-white/80'
                      }`}
                    >
                      {slide.indexLabel}
                    </span>
                    <span
                      className={`hidden sm:inline-block text-[9px] uppercase tracking-[0.18em] truncate max-w-[92px] transition-colors ${
                        isActive
                          ? 'text-white/75'
                          : 'text-white/35 group-hover:text-white/65'
                      }`}
                    >
                      {slide.frameTag}
                    </span>
                  </div>

                  <span className="block relative h-[1.5px] w-full bg-white/20 overflow-hidden">
                    <span
                      className="block h-full bg-white will-change-[width]"
                      style={{
                        width: fillWidth,
                        transition: isActive ? 'none' : 'width 350ms ease',
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Mobile Scroll Cue + Prev / Next / Pause */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-white">
            {/* Compact mobile link to featured garment */}
            {featured && (
              <Link
                href={`/product/${featured.slug}`}
                className="lg:hidden inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/80 hover:text-white"
              >
                <ShoppingBag className="w-3 h-3" />
                <span className="truncate max-w-[165px]">{featured.name}</span>
                <span className="text-white/50">•</span>
                <span className="font-semibold tabular-nums">{formatINR(featured.price)}</span>
              </Link>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous campaign slide"
                className="w-9 h-9 flex items-center justify-center border text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next campaign slide"
                className="w-9 h-9 flex items-center justify-center border text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
                title={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
                className="w-9 h-9 flex items-center justify-center border text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
