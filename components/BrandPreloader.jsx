'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';

const RUNWAY_FRAMES = [
  '/images/hero-campaign.jpg',
  '/images/lookbook-campus-1.jpg',
  '/images/real-angel-fullsleeve-black.jpg',
  '/images/real-dragon-fullsleeve.jpg',
  '/images/lookbook-campus-2.jpg',
];

const SESSION_KEY = 'doffor_intro_seen';
const SEQUENCE_DURATION_MS = 2050;
const FRAME_INTERVAL_MS = 240;
const EXIT_BEAT_MS = 160;
const CURTAIN_EXIT_MS = 860;

function easeEditorialProgress(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const cubic =
    clamped < 0.5
      ? 4 * clamped * clamped * clamped
      : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
  return 0.22 * clamped + 0.78 * cubic;
}

export default function BrandPreloader() {
  const { config } = useStore();
  const [phase, setPhase] = useState('init'); // 'init' | 'active' | 'exiting' | 'done'
  const [progress, setProgress] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [apertureOpen, setApertureOpen] = useState(false);
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const [trackingExpanded, setTrackingExpanded] = useState(false);

  const rafRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const timeoutsRef = useRef([]);
  const activeRef = useRef(false);
  const exitingRef = useRef(false);

  const clearScheduled = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (frameIntervalRef.current !== null) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const triggerExit = useCallback(() => {
    if (!activeRef.current || exitingRef.current) return;
    activeRef.current = false;
    exitingRef.current = true;
    clearScheduled();

    setProgress(100);
    setPhase('exiting');

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Ignore storage quota / privacy mode errors
      }
    }

    scheduleTimeout(() => {
      setPhase('done');
    }, CURTAIN_EXIT_MS);
  }, [clearScheduled, scheduleTimeout]);

  const startSequence = useCallback(() => {
    if (typeof window === 'undefined') return;
    clearScheduled();
    activeRef.current = true;
    exitingRef.current = false;

    setProgress(0);
    setFrameIndex(0);
    setApertureOpen(false);
    setWordmarkVisible(false);
    setTrackingExpanded(false);
    setPhase('active');
    document.body.style.overflow = 'hidden';

    // Act 1: Expand vertical 35mm contact-sheet aperture cleanly on next paint
    scheduleTimeout(() => {
      setApertureOpen(true);
    }, 32);

    // Cycle editorial runway frames every ~240ms
    frameIntervalRef.current = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % RUNWAY_FRAMES.length);
    }, FRAME_INTERVAL_MS);

    // Act 2: Kinetic letter-by-letter wordmark lockup & tracking expansion
    scheduleTimeout(() => {
      setWordmarkVisible(true);
    }, 340);

    scheduleTimeout(() => {
      setTrackingExpanded(true);
    }, 780);

    // Smooth 60fps tabular counter + 1px bottom progress hairline (00 -> 100)
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / SEQUENCE_DURATION_MS);
      const eased = easeEditorialProgress(ratio) * 100;
      setProgress(eased);

      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        if (frameIntervalRef.current !== null) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        // Act 3: Brief dramatic beat at 100, then dual split-curtain reveal
        scheduleTimeout(() => {
          triggerExit();
        }, EXIT_BEAT_MS);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [clearScheduled, scheduleTimeout, triggerExit]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let seen = false;
    try {
      seen = Boolean(window.sessionStorage.getItem(SESSION_KEY));
    } catch {
      seen = false;
    }

    if (seen) {
      setPhase('done');
    } else {
      startSequence();
    }

    const handleReplay = () => {
      startSequence();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeRef.current && !exitingRef.current) {
        triggerExit();
      }
    };

    window.addEventListener('doffor:replay-intro', handleReplay);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('doffor:replay-intro', handleReplay);
      window.removeEventListener('keydown', handleKeyDown);
      activeRef.current = false;
      clearScheduled();
      document.body.style.overflow = '';
    };
  }, [clearScheduled, startSequence, triggerExit]);

  if (phase === 'done' || phase === 'init') return null;

  const isExiting = phase === 'exiting';
  const wordmark = (config?.brandWordmark || 'DOFFOR').trim() || 'DOFFOR';
  const letters = wordmark.split('');
  const displayPercent = String(Math.min(100, Math.round(progress))).padStart(2, '0');
  const frameCounter = `${String(frameIndex + 1).padStart(2, '0')} / ${String(
    RUNWAY_FRAMES.length
  ).padStart(2, '0')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${wordmark} opening film`}
      className={`fixed inset-0 z-[200] select-none overflow-hidden ${
        isExiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Act 3: Dual Split-Curtain Reveal — Top Half */}
      <div
        aria-hidden="true"
        className={`fixed top-0 left-0 right-0 h-[50.5%] bg-[#09090B] transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          isExiting ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{
          borderBottom: isExiting
            ? '1px solid rgba(255, 255, 255, 0.14)'
            : '1px solid transparent',
        }}
      />

      {/* Act 3: Dual Split-Curtain Reveal — Bottom Half */}
      <div
        aria-hidden="true"
        className={`fixed bottom-0 left-0 right-0 h-[50.5%] bg-[#09090B] transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          isExiting ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{
          borderTop: isExiting
            ? '1px solid rgba(255, 255, 255, 0.14)'
            : '1px solid transparent',
        }}
      />

      {/* Foreground Cinema Stage */}
      <div
        className={`relative z-10 flex h-full w-full flex-col justify-between p-6 sm:p-10 md:p-12 text-white transition-all duration-300 ease-out ${
          isExiting ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top Editorial Bar + Accessible Skip */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-white/45">
            <span>Heavyweight Archive</span>
            <span className="hidden sm:inline text-white/25">—</span>
            <span className="hidden sm:inline tabular-nums text-white/35">
              35MM REEL {frameCounter}
            </span>
          </div>

          <button
            type="button"
            onClick={triggerExit}
            className="text-[10px] uppercase tracking-[0.22em] text-white/45 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:text-white cursor-pointer py-1 pl-3"
          >
            Skip
          </button>
        </div>

        {/* Center Stage: Act 1 Contact-Sheet Aperture + Act 2 Kinetic Wordmark Lockup */}
        <div className="relative flex flex-1 items-center justify-center my-6">
          {/* Vertical 35mm Editorial Frame */}
          <div
            className="relative w-52 sm:w-64 aspect-[3/4] overflow-hidden bg-[#111114]"
            style={{
              clipPath: apertureOpen
                ? 'inset(0% 0% 0% 0%)'
                : 'inset(48% 0% 48% 0%)',
              transform: apertureOpen ? 'scale(1)' : 'scale(1.12)',
              opacity: apertureOpen ? 1 : 0,
              border: '1px solid rgba(255, 255, 255, 0.14)',
              transition:
                'clip-path 780ms cubic-bezier(0.16, 1, 0.3, 1), transform 920ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms ease-out',
              willChange: 'clip-path, transform, opacity',
            }}
          >
            {RUNWAY_FRAMES.map((src, idx) => {
              const isCurrent = idx === frameIndex;
              return (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{
                    opacity: isCurrent ? (wordmarkVisible ? 0.62 : 0.88) : 0,
                    transform: isCurrent ? 'scale(1.02)' : 'scale(1.06)',
                    filter: 'grayscale(18%) contrast(1.06)',
                    transition:
                      'opacity 180ms ease-out, transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              );
            })}

            {/* Subtle Editorial Dark Vignette for Razor-Sharp Text Contrast */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(9,9,11,0.18) 0%, rgba(9,9,11,0.72) 100%)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#09090B]/75 via-transparent to-[#09090B]/45"
            />
          </div>

          {/* Act 2: Brand Wordmark Kinetic Lockup centered over the dimmed frame */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <div className="overflow-hidden py-2">
              <div
                className="flex items-center justify-center mix-blend-difference"
                style={{
                  gap: trackingExpanded ? '0.28em' : '0.08em',
                  transition: 'gap 1100ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {letters.map((char, idx) => (
                  <span
                    key={`${char}-${idx}`}
                    className="font-display font-bold text-4xl sm:text-6xl md:text-7xl uppercase text-white inline-block leading-none"
                    style={{
                      transform: wordmarkVisible
                        ? 'translate3d(0, 0%, 0)'
                        : 'translate3d(0, 112%, 0)',
                      opacity: wordmarkVisible ? 1 : 0,
                      transition: `transform 760ms cubic-bezier(0.16, 1, 0.3, 1) ${
                        idx * 60
                      }ms, opacity 520ms ease-out ${idx * 60}ms`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            </div>

            <p
              className="mt-4 text-[10px] uppercase text-white/65"
              style={{
                letterSpacing: trackingExpanded ? '0.36em' : '0.22em',
                opacity: wordmarkVisible ? 1 : 0,
                transform: wordmarkVisible
                  ? 'translate3d(0, 0, 0)'
                  : 'translate3d(0, 10px, 0)',
                transition:
                  'opacity 700ms ease-out 360ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 360ms, letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              240–280 GSM Heavyweight Streetwear
            </p>
          </div>
        </div>

        {/* Bottom HUD: Tabular Counter + Whisper-Thin 1px Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.24em] text-white/45">
              <span>Editorial Collection</span>
              <span className="hidden sm:inline text-white/20">/</span>
              <span className="hidden sm:inline text-white/35">
                {config?.collectionLabel || 'Core Collection'}
              </span>
            </div>

            <div className="flex items-baseline gap-1 font-display font-light text-white">
              <span className="text-3xl sm:text-4xl leading-none tracking-[-0.02em] tabular-nums">
                {displayPercent}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                %
              </span>
            </div>
          </div>

          <div
            className="w-full h-[1px] overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
          >
            <div
              className="h-full w-full bg-white origin-left will-change-transform"
              style={{
                transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
