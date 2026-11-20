'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, Package, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

const LEFT_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections/full-sleeves', label: 'Full-Sleeves' },
  { href: '/collections/oversized-tees', label: 'Tees' },
  { href: '/collections/muscle-tanks', label: 'Tanks' },
  { href: '/lookbook', label: 'Lookbook' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, wishlist, setDrawerOpen } = useCart();
  const { config, setSearchOpen, pushToast } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    pushToast('Signed out', 'info');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 no-print">
      {/* Subtle luxury top utility bar */}
      <div className="bg-[#0B0B0C] text-white/90 py-2 px-4 text-center">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase truncate max-w-5xl mx-auto">
          {config.announcementText || 'Complimentary Express Shipping on Orders Above ₹1,499 — Drop 04 Now Live'}
        </p>
      </div>

      {/* Main 3-Column Symmetric Fashion House Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-black/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 grid grid-cols-3 items-center">
          {/* Left Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 -ml-1.5 text-[#0B0B0C]"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              {LEFT_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`whitespace-nowrap text-[11px] uppercase tracking-[0.16em] transition-colors ${
                      active
                        ? 'text-[#0B0B0C] font-semibold underline underline-offset-8 decoration-1'
                        : 'text-neutral-500 hover:text-[#0B0B0C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Wordmark */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="font-display font-bold text-xl sm:text-2xl tracking-[0.34em] text-[#0B0B0C] uppercase pl-[0.34em]"
            >
              DOFFOR
            </Link>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center justify-end gap-4 sm:gap-5">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-[#0B0B0C] border border-black/25 px-3 py-1 hover:bg-[#0B0B0C] hover:text-white transition-colors"
              >
                <Shield className="w-3 h-3" />
                Admin
              </Link>
            )}

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-600 hover:text-[#0B0B0C] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[1.6]" />
              <span className="hidden xl:inline">Search</span>
            </button>

            <Link
              href="/account?tab=wishlist"
              className="relative hidden sm:inline-flex items-center text-neutral-600 hover:text-[#0B0B0C] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 stroke-[1.6]" />
              {wishlist.length > 0 && (
                <span className="ml-1 text-[10px] font-medium text-[#0B0B0C]">{wishlist.length}</span>
              )}
            </Link>

            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#0B0B0C] hover:opacity-70 transition-opacity"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-black/15"
                    />
                  ) : (
                    <User className="w-4 h-4 stroke-[1.6]" />
                  )}
                  <span className="hidden md:inline max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-600 hover:text-[#0B0B0C] transition-colors whitespace-nowrap"
                >
                  <User className="w-4 h-4 stroke-[1.6]" />
                  <span className="hidden md:inline">Account</span>
                </Link>
              )}

              {user && userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-black/15 shadow-xl z-50 py-2">
                    <div className="px-4 py-2.5 border-b border-black/10">
                      <p className="text-xs font-semibold text-[#0B0B0C] truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50"
                    >
                      <User className="w-3.5 h-3.5" /> Account & Orders
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50"
                    >
                      <Package className="w-3.5 h-3.5" /> Track Order
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#0B0B0C] bg-neutral-100 hover:bg-neutral-200"
                      >
                        <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-700 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-medium text-[#0B0B0C] hover:opacity-70 transition-opacity whitespace-nowrap"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.6]" />
              <span className="hidden sm:inline">Bag</span>
              <span>({itemCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-black/10 px-6 py-6 space-y-4">
          {LEFT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-xs uppercase tracking-[0.2em] text-[#0B0B0C] font-medium py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-black/10 flex flex-wrap gap-5 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/community" onClick={() => setMobileOpen(false)}>Community</Link>
            <Link href="/track-order" onClick={() => setMobileOpen(false)}>Track Order</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-[#0B0B0C] font-semibold">
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
