'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/format';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [hoveredColorIdx, setHoveredColorIdx] = useState(null);
  const [addedSize, setAddedSize] = useState('');
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
          <span className="absolute top-3 left-3 z-10 bg-white/92 backdrop-blur-sm text-[#0B0B0C] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em] pointer-events-none">
            {product.badges[0]}
          </span>
        )}

        {/* Quiet Wishlist Icon */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-all duration-300 active:scale-90 ${
            wishlisted
              ? 'text-red-600 opacity-100'
              : 'text-[#0B0B0C] bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 stroke-[1.5] ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Tactile Hover Quick-Add Bar with Instant Confirmation */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 transition-transform duration-300 ease-out bg-white/95 backdrop-blur-md border-t border-black/10 px-3 py-3 ${
            addedSize ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
          }`}
        >
          <div className="relative min-h-[50px] flex flex-col justify-center">
            {addedSize ? (
              <div className="flex items-center justify-center py-1 animate-page-enter">
                <span className="inline-flex items-center gap-1.5 bg-[#0B0B0C] text-white px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em]">
                  <Check className="w-3 h-3 stroke-[2.2]" />
                  Added {addedSize}
                </span>
              </div>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 text-center mb-2 truncate">
                  Quick Add — {activeColor.name}
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {sizes.map((size) => {
                    const stock = product.sizes?.[size] ?? 0;
                    const disabled = stock <= 0;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleQuickAdd(size)}
                        className={`py-1.5 text-[11px] font-medium transition-all duration-200 ${
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
      <div className="pt-3.5 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="editorial-link min-w-0 max-w-full text-[13px] font-medium text-[#0B0B0C]"
          >
            <span className="truncate">{product.name}</span>
          </Link>
          <span className="text-[13px] font-medium text-[#0B0B0C] shrink-0">
            {formatINR(product.price)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-neutral-500 truncate">
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
