'use client';

import React, { useEffect, useRef, useState } from 'react';

const EDITORIAL_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 28,
  variant = 'up',
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (variant === 'mask') {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`.trim()}>
        <div
          style={{
            transform: visible ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 105%, 0)',
            opacity: visible ? 1 : 0,
            transition: `transform 860ms ${EDITORIAL_EASE} ${delay}ms, opacity 520ms ${EDITORIAL_EASE} ${delay}ms`,
            willChange: visible ? 'auto' : 'transform, opacity',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'curtain') {
    return (
      <div
        ref={ref}
        className={`overflow-hidden ${className}`.trim()}
        style={{
          clipPath: visible ? 'inset(0% 0% 0% 0%)' : 'inset(12% 0% 0% 0%)',
          opacity: visible ? 1 : 0,
          transition: `clip-path 950ms ${EDITORIAL_EASE} ${delay}ms, opacity 950ms ${EDITORIAL_EASE} ${delay}ms`,
          willChange: visible ? 'auto' : 'clip-path, opacity',
        }}
      >
        <div
          className="h-full w-full"
          style={{
            transform: visible ? 'scale(1)' : 'scale(1.06)',
            transition: `transform 950ms ${EDITORIAL_EASE} ${delay}ms`,
            willChange: visible ? 'auto' : 'transform',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'scale') {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transition: `opacity 780ms ${EDITORIAL_EASE} ${delay}ms, transform 840ms ${EDITORIAL_EASE} ${delay}ms`,
          willChange: visible ? 'auto' : 'opacity, transform',
        }}
      >
        {children}
      </div>
    );
  }

  // Default variant: 'up'
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${y}px, 0)`,
        transition: `opacity 760ms ${EDITORIAL_EASE} ${delay}ms, transform 860ms ${EDITORIAL_EASE} ${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
