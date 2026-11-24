'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StoreProvider } from '../context/StoreContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import ToastContainer from './ToastContainer';
import BrandPreloader from './BrandPreloader';
import RouteProgressBar from './RouteProgressBar';
import ArchiveVaultGame from './ArchiveVaultGame';

function PageShell({ children }) {
  const pathname = usePathname();
  return (
    <main key={pathname} className="flex-1 animate-page-enter">
      {children}
    </main>
  );
}

export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevents hydration mismatches caused by browser extensions (e.g. fdprocessedid)
  // mutating <button>/<input> elements before React hydrates.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
        <span className="font-display font-bold text-lg tracking-[0.36em] uppercase pl-[0.36em]">
          DOFFOR
        </span>
      </div>
    );
  }

  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <BrandPreloader />
          <RouteProgressBar />
          <Navbar />
          <PageShell>{children}</PageShell>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <ArchiveVaultGame mode="floating" />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
