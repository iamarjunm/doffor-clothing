'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(35);

    const t1 = setTimeout(() => setWidth(78), 110);
    const t2 = setTimeout(() => setWidth(100), 260);
    const t3 = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 520);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[150] h-[2px] bg-transparent pointer-events-none no-print">
      <div
        className="h-full bg-[#0B0B0C] transition-all duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
