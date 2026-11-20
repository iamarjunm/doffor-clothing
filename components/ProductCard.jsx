'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/format';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  const activeColor = product.colors?.[activeColorIdx] || { name: 'Jet Black', hex: '#111' };
  const primaryImg = activeColor.image || product.images?.[0];
  const secondaryImg = product.images?.[1] || primaryImg;
  const wishlisted = isWishlisted(product.id);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clean Edge-to-Edge Studio Frame */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F1EC]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={hovered && secondaryImg ? secondaryImg : primaryImg}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {/* Minimal Single Corner Tag */}
        {product.badges?.[0] && (
          <span className="absolute top-3 left-3 bg-white/92 backdrop-blur-sm text-[#0B0B0C] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em]">
            {product.badges[0]}
          </span>
        )}

        {/* Quiet Wishlist Icon */}
        <button
          onClick={() => toggleWishlist(product.id, product.name)}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all ${
            wishlisted
              ? 'text-red-600 opacity-100'
              : 'text-[#0B0B0C] bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 stroke-[1.5] ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Sleek Hover Quick-Add Size Bar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-white/95 backdrop-blur-md border-t border-black/10 px-3 py-3">
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 text-center mb-2">
            Quick Add — {activeColor.name}
          </p>
          <div className="grid grid-cols-5 gap-1">
            {sizes.map((size) => {
              const stock = product.sizes?.[size] ?? 0;
              const disabled = stock <= 0;
              return (
                <button
                  key={size}
                  disabled={disabled}
                  onClick={() => addToCart(product, { size, color: activeColor.name, quantity: 1 })}
                  className={`py-1.5 text-[11px] font-medium transition-colors ${
                    disabled
                      ? 'text-neutral-300 line-through cursor-not-allowed'
                      : 'text-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editorial Product Meta */}
      <div className="pt-3.5 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="text-[13px] font-medium text-[#0B0B0C] hover:underline underline-offset-4 line-clamp-1"
          >
            {product.name}
          </Link>
          <span className="text-[13px] font-medium text-[#0B0B0C] shrink-0">
            {formatINR(product.price)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-neutral-500">
            {product.gsm} GSM • {product.fit}
          </p>
          <div className="flex items-center gap-1.5">
            {product.colors?.slice(0, 5).map((col, idx) => (
              <button
                key={col.name}
                onClick={() => setActiveColorIdx(idx)}
                title={col.name}
                className={`w-3 h-3 rounded-full border transition-all ${
                  idx === activeColorIdx
                    ? 'border-[#0B0B0C] ring-1 ring-[#0B0B0C] ring-offset-1'
                    : 'border-black/20'
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
