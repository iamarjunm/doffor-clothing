'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Check, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/format';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [hoveredColorIdx, setHoveredColorIdx] = useState(null);
  const [addedSize, setAddedSize] = useState('');
  const [mobileQuickOpen, setMobileQuickOpen] = useState(false);
  const addedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const activeColor = product.colors?.[activeColorIdx] || { name: 'Jet Black', hex: '#111' };
  const primaryImg = activeColor.image || product.images?.[0];
  const secondaryImg = product.images?.[1] || primaryImg;
  const wishlisted = isWishlisted(product.id);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleQuickAdd = (size) => {
    addToCart(product, { size, color: activeColor.name, quantity: 1 });
    setAddedSize(size);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => {
      setAddedSize('');
      setMobileQuickOpen(false);
    }, 900);
  };

  return (
    <div className="group flex flex-col">
      {/* Clean Edge-to-Edge Studio Frame with Dual-Image Cross-Fade Stack */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F1EC]">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          {primaryImg && (
            <img
              src={primaryImg}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] will-change-transform"
            />
          )}
          {secondaryImg && (
            <img
              src={secondaryImg}
              alt={`${product.name} alternate view`}
              loading="lazy"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-[1.04] transition-[opacity,transform] duration-700 ease-out pointer-events-none will-change-[opacity,transform]"
            />
          )}
        </Link>

        {/* Minimal Single Corner Tag */}
        {product.badges?.[0] && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-white/92 backdrop-blur-sm text-[#0B0B0C] px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.16em] sm:tracking-[0.18em] pointer-events-none">
            {product.badges[0]}
          </span>
        )}

        {/* Quiet Wishlist Icon — always reachable on touch devices, hover-reveal on desktop */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-8 h-8 flex items-center justify-center transition-all duration-300 active:scale-90 ${
            wishlisted
              ? 'text-red-600 bg-white/90 backdrop-blur-sm opacity-100'
              : 'text-[#0B0B0C] bg-white/80 backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-white'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5] ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Mobile Touch Quick-Add Trigger */}
        {!mobileQuickOpen && !addedSize && (
          <button
            type="button"
            onClick={() => setMobileQuickOpen(true)}
            aria-label={`Quick add ${product.name}`}
            className="lg:hidden absolute bottom-2.5 right-2.5 z-10 w-8 h-8 bg-white/92 backdrop-blur-sm border border-black/10 text-[#0B0B0C] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[1.7]" />
          </button>
        )}

        {/* Tactile Quick-Add Bar (Tap-Opened on Mobile, Hover-Revealed on Desktop) */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 transition-transform duration-300 ease-out bg-white/95 backdrop-blur-md border-t border-black/10 px-2.5 sm:px-3 py-2.5 sm:py-3 ${
            addedSize || mobileQuickOpen
              ? 'translate-y-0'
              : 'translate-y-full lg:group-hover:translate-y-0'
          }`}
        >
          <div className="relative min-h-[48px] sm:min-h-[50px] flex flex-col justify-center">
            {addedSize ? (
              <div className="flex items-center justify-center py-1 animate-page-enter">
                <span className="inline-flex items-center gap-1.5 bg-[#0B0B0C] text-white px-3.5 sm:px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em]">
                  <Check className="w-3 h-3 stroke-[2.2]" />
                  Added {addedSize}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-neutral-500 text-center flex-1 truncate">
                    Quick Add — {activeColor.name}
                  </p>
                  {mobileQuickOpen && (
                    <button
                      type="button"
                      onClick={() => setMobileQuickOpen(false)}
                      aria-label="Close quick add"
                      className="lg:hidden p-0.5 text-neutral-500 hover:text-black shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
                  {sizes.map((size) => {
                    const stock = product.sizes?.[size] ?? 0;
                    const disabled = stock <= 0;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleQuickAdd(size)}
                        className={`py-1.5 text-[10px] sm:text-[11px] font-medium transition-all duration-200 ${
                          disabled
                            ? 'text-neutral-300 line-through cursor-not-allowed'
                            : 'text-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white active:scale-95'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editorial Product Meta */}
      <div className="pt-2.5 sm:pt-3.5 space-y-1 sm:space-y-1.5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="editorial-link min-w-0 max-w-full text-xs sm:text-[13px] font-medium text-[#0B0B0C]"
          >
            <span className="truncate">{product.name}</span>
          </Link>
          <span className="text-xs sm:text-[13px] font-medium text-[#0B0B0C] shrink-0 tabular-nums">
            {formatINR(product.price)}
          </span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2">
          <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
            {product.gsm} GSM • {product.fit}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {product.colors?.slice(0, 5).map((col, idx) => {
              const isActive = idx === activeColorIdx;
              const isTooltipOpen = hoveredColorIdx === idx;
              return (
                <div
                  key={col.name}
                  className="relative flex items-center justify-center"
                  onMouseEnter={() => setHoveredColorIdx(idx)}
                  onMouseLeave={() => setHoveredColorIdx(null)}
                >
                  <button
                    type="button"
                    onClick={() => setActiveColorIdx(idx)}
                    onFocus={() => setHoveredColorIdx(idx)}
                    onBlur={() => setHoveredColorIdx(null)}
                    aria-label={`Select color ${col.name}`}
                    aria-pressed={isActive}
                    className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                      isActive
                        ? 'border-[#0B0B0C] ring-1 ring-[#0B0B0C] ring-offset-[2px] ring-offset-white scale-110'
                        : 'border-black/20 hover:border-black/60 hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                  <span
                    role="tooltip"
                    className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0B0B0C] text-white px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] transition-all duration-200 ${
                      isTooltipOpen
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-1'
                    }`}
                  >
                    {col.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
