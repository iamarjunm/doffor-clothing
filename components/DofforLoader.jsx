'use client';

import React from 'react';

export function DofforLoader({ label = 'Loading', fullScreen = false }) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p className="font-display font-bold text-sm tracking-[0.38em] uppercase pl-[0.38em] text-[#0B0B0C]">
        DOFFOR
      </p>
      <div className="w-36 h-[1.5px] bg-black/10 overflow-hidden relative">
        <div className="absolute inset-y-0 w-1/2 bg-[#0B0B0C] animate-loader-slide" />
      </div>
      {label && (
        <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center bg-white">
        {inner}
      </div>
    );
  }
  return inner;
}

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[3/4] bg-[#EFECE6] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/55 to-transparent" />
          </div>
          <div className="flex justify-between gap-3">
            <div className="h-3.5 w-2/3 bg-[#EFECE6] animate-pulse" />
            <div className="h-3.5 w-14 bg-[#EFECE6] animate-pulse" />
          </div>
          <div className="h-2.5 w-1/2 bg-[#F5F4F0] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default DofforLoader;
