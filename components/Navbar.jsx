'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Shield,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

const SILHOUETTE_LINKS = [
  { label: 'Shop All', href: '/shop', category: 'all' },
  { label: 'Full-Sleeves', href: '/collections/full-sleeves', category: 'full-sleeves' },
  { label: 'Oversized Tees', href: '/collections/oversized-tees', category: 'oversized-tees' },
  { label: 'Muscle Tanks', href: '/collections/muscle-tanks', category: 'muscle-tanks' },
  { label: 'Limited Archive', href: '/collections/limited-drops', category: 'limited-drops' },
];

const SPEC_LINKS = [
  { label: '240 GSM Everyday', detail: 'Combed Bio-Washed', href: '/shop?gsm=240' },
  { label: '260 GSM Heavyweight', detail: 'Structured Drop-Shoulder', href: '/shop?gsm=260' },
  { label: '280 GSM Interlock', detail: 'Ultra-Dense Jersey', href: '/shop?gsm=280' },
  { label: 'Size & Fit Guide', detail: 'Boxy Unisex Grading', href: '/size-guide' },
  { label: 'Drop 04 Lookbook', detail: 'Autumn / Winter Archive', href: '/lookbook' },
];

const SHOP_EDITORIAL_CARDS = [
  {
    eyebrow: 'Drop 04 Signature',
    title: 'Winged Angel Series',
    spec: '260 GSM Heavyweight Jersey',
    image: '/images/real-angel-fullsleeve-black.jpg',
    href: '/collections/full-sleeves',
  },
  {
    eyebrow: 'Archival Crest',
    title: 'Ancient Dragon Series',
    spec: '260–280 GSM Statement Cut',
    image: '/images/real-dragon-fullsleeve.jpg',
    href: '/collections/full-sleeves',
  },
];

const COLLECTION_CARDS = [
  {
    title: 'Full-Sleeves',
    category: 'full-sleeves',
    gsmTag: '260–280 GSM',
    subtitle: 'Drop-shoulder ribbed long sleeves',
    image: '/images/real-angel-fullsleeve-rack.jpg',
    href: '/collections/full-sleeves',
  },
  {
    title: 'Oversized Tees',
    category: 'oversized-tees',
    gsmTag: '240 GSM',
    subtitle: 'Boxy bio-washed everyday rotation',
    image: '/images/real-bootleg-tee.jpg',
    href: '/collections/oversized-tees',
  },
  {
    title: 'Muscle Tanks',
    category: 'muscle-tanks',
    gsmTag: '240 GSM',
    subtitle: 'Sculptural extended shoulder vests',
    image: '/images/real-muscle-tank.jpg',
    href: '/collections/muscle-tanks',
  },
  {
    title: 'Limited Archive',
    category: 'limited-drops',
    gsmTag: 'SMALL-BATCH',
    subtitle: 'Numbered pigment-dyed runs & packs',
    image: '/images/product-angel-fullsleeve.jpg',
    href: '/collections/limited-drops',
  },
];

const HOUSE_LINKS = [
  { label: 'About Doffor', note: 'Fabric & Philosophy', href: '/about' },
  { label: 'Community & Collabs', note: 'Custom & Campus', href: '/community' },
  { label: 'Size & Fit Guide', note: 'Measurements', href: '/size-guide' },
  { label: 'Shipping & Exchanges', note: '7-Day Policy', href: '/shipping-returns' },
  { label: 'Track Order', note: 'Live Dispatch', href: '/track-order' },
  { label: 'Contact HQ', note: 'Client Services', href: '/contact' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, wishlist, setDrawerOpen } = useCart();
  const { products, config, setSearchOpen, pushToast } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [renderedMenu, setRenderedMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState('shop');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const closeTimerRef = useRef(null);
  const unmountTimerRef = useRef(null);
  const userMenuRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const activeProducts = Array.isArray(products)
    ? products.filter((p) => p.active !== false)
    : [];

  const getCategoryCount = (category) => {
    if (category === 'all') return activeProducts.length;
    return activeProducts.filter((p) => p.category === category).length;
  };

  // Scroll-aware header elevation & height transition
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveMenu(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Keep rendered mega-menu content alive briefly during close fade-out
  useEffect(() => {
    if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
    if (activeMenu) {
      setRenderedMenu(activeMenu);
    } else {
      unmountTimerRef.current = setTimeout(() => {
        setRenderedMenu(null);
      }, 240);
    }
    return () => {
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
    };
  }, [activeMenu]);

  // Close all overlays on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        setActiveMenu(null);
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close user profile dropdown when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [userMenuOpen]);

  // Prevent background page scroll while mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
    };
  }, []);

  // Smart 140ms hover intent helpers
  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = (menuKey) => {
    cancelCloseTimer();
    setUserMenuOpen(false);
    setActiveMenu(menuKey);
  };

  const scheduleCloseMenu = () => {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 140);
  };

  const closeMenuNow = () => {
    cancelCloseTimer();
    setActiveMenu(null);
  };

  const toggleMenu = (menuKey) => {
    cancelCloseTimer();
    setUserMenuOpen(false);
    setActiveMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    pushToast('Signed out', 'info');
    router.push('/');
  };

  const isShopRoute = pathname === '/shop' || pathname?.startsWith('/product');
  const isCollectionsRoute = pathname?.startsWith('/collections');
  const isLookbookRoute = pathname === '/lookbook';
  const isHouseRoute = ['/about', '/community', '/size-guide', '/shipping-returns', '/track-order', '/contact'].includes(
    pathname
  );

  const navTriggerClass = (isActive, isOpen) =>
    `group relative inline-flex items-center gap-1.5 py-2 whitespace-nowrap shrink-0 text-[11px] uppercase tracking-[0.18em] transition-colors duration-200 ${
      isActive || isOpen ? 'text-[#0B0B0C] font-medium' : 'text-[#0B0B0C]/65 hover:text-[#0B0B0C]'
    }`;

  return (
    <>
      {/* Dimmed Backdrop Blur Behind Open Mega-Menu */}
      <div
        aria-hidden="true"
        onClick={closeMenuNow}
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 hidden lg:block ${
          activeMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <header className="sticky top-0 z-50 no-print">
        {/* Live Store Config Top Announcement Bar */}
        {config.announcementEnabled !== false && (
          <div
            className="py-2 px-4 text-center transition-colors duration-300"
            style={{
              backgroundColor: config.announcementBg || '#0B0B0C',
              color: config.announcementTextColor || '#FFFFFF',
            }}
          >
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase truncate max-w-5xl mx-auto opacity-95">
              {config.announcementText ||
                'Complimentary Express Shipping on Orders Above ₹1,499 — Drop 04 Now Live'}
            </p>
          </div>
        )}

        {/* Main 3-Column Symmetric Luxury Header */}
        <div
          className={`relative bg-white/95 backdrop-blur-md border-b transition-all duration-300 ease-out ${
            scrolled || activeMenu
              ? 'border-black/[0.12] shadow-[0_8px_30px_rgba(0,0,0,0.05)]'
              : 'border-black/[0.08] shadow-none'
          }`}
        >
          <div
            className={`max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-3 items-center transition-[height] duration-300 ease-out ${
              scrolled ? 'h-16' : 'h-[72px]'
            }`}
          >
            {/* Left Column: Mobile Menu Toggle + Desktop Mega-Menu Triggers */}
            <div className="flex items-center gap-6 min-w-0">
              <button
                type="button"
                onClick={() => {
                  closeMenuNow();
                  setUserMenuOpen(false);
                  setMobileOpen((prev) => !prev);
                }}
                className="lg:hidden inline-flex items-center justify-center p-1.5 -ml-1.5 text-[#0B0B0C] hover:opacity-65 transition-opacity"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5 stroke-[1.6]" /> : <Menu className="w-5 h-5 stroke-[1.6]" />}
              </button>

              <nav
                aria-label="Primary navigation"
                className="hidden lg:flex items-center gap-7"
                onMouseLeave={scheduleCloseMenu}
              >
                {/* 1. Shop Mega-Menu Trigger */}
                <button
                  type="button"
                  onMouseEnter={() => openMenu('shop')}
                  onClick={() => toggleMenu('shop')}
                  aria-expanded={activeMenu === 'shop'}
                  aria-haspopup="true"
                  className={navTriggerClass(isShopRoute, activeMenu === 'shop')}
                >
                  <span>Shop</span>
                  <ChevronDown
                    className={`w-3 h-3 stroke-[1.7] transition-transform duration-200 ${
                      activeMenu === 'shop' ? 'rotate-180 opacity-100' : 'opacity-55 group-hover:opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#0B0B0C] origin-left transition-transform duration-300 ease-out ${
                      activeMenu === 'shop' || isShopRoute
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>

                {/* 2. Collections Mega-Menu Trigger */}
                <button
                  type="button"
                  onMouseEnter={() => openMenu('collections')}
                  onClick={() => toggleMenu('collections')}
                  aria-expanded={activeMenu === 'collections'}
                  aria-haspopup="true"
                  className={navTriggerClass(isCollectionsRoute, activeMenu === 'collections')}
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-3 h-3 stroke-[1.7] transition-transform duration-200 ${
                      activeMenu === 'collections'
                        ? 'rotate-180 opacity-100'
                        : 'opacity-55 group-hover:opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#0B0B0C] origin-left transition-transform duration-300 ease-out ${
                      activeMenu === 'collections' || isCollectionsRoute
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>

                {/* 3. Lookbook Direct Link */}
                <Link
                  href="/lookbook"
                  onMouseEnter={closeMenuNow}
                  onClick={closeMenuNow}
                  className={navTriggerClass(isLookbookRoute, false)}
                >
                  <span>Lookbook</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#0B0B0C] origin-left transition-transform duration-300 ease-out ${
                      isLookbookRoute ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>

                {/* 4. House Mega-Menu Trigger */}
                <button
                  type="button"
                  onMouseEnter={() => openMenu('house')}
                  onClick={() => toggleMenu('house')}
                  aria-expanded={activeMenu === 'house'}
                  aria-haspopup="true"
                  className={navTriggerClass(isHouseRoute, activeMenu === 'house')}
                >
                  <span>House</span>
                  <ChevronDown
                    className={`w-3 h-3 stroke-[1.7] transition-transform duration-200 ${
                      activeMenu === 'house'
                        ? 'rotate-180 opacity-100'
                        : 'opacity-55 group-hover:opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#0B0B0C] origin-left transition-transform duration-300 ease-out ${
                      activeMenu === 'house' || isHouseRoute
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </nav>
            </div>

            {/* Center Column: Architectural Brand Wordmark */}
            <div className="flex justify-center">
              <Link
                href="/"
                onClick={closeMenuNow}
                className="font-display font-bold text-xl sm:text-2xl tracking-[0.34em] uppercase pl-[0.34em] text-[#0B0B0C] whitespace-nowrap hover:opacity-80 transition-opacity"
              >
                {config.brandWordmark || 'DOFFOR'}
              </Link>
            </div>

            {/* Right Column: Clean Utility Controls (NO standalone Admin button here) */}
            <div className="flex items-center justify-end gap-5 sm:gap-6">
              {/* Search */}
              <button
                type="button"
                onClick={() => {
                  closeMenuNow();
                  setUserMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 h-9 leading-none text-[11px] uppercase tracking-[0.16em] text-[#0B0B0C]/75 hover:text-[#0B0B0C] transition-colors whitespace-nowrap"
                aria-label="Search catalog"
              >
                <Search className="w-[15px] h-[15px] stroke-[1.6] shrink-0" />
                <span className="hidden xl:inline leading-none">Search</span>
              </button>

              {/* Wishlist with live badge */}
              <Link
                href="/account?tab=wishlist"
                onClick={closeMenuNow}
                className="relative hidden sm:inline-flex items-center justify-center h-9 leading-none text-[#0B0B0C]/75 hover:text-[#0B0B0C] transition-colors"
                aria-label={`Wishlist (${wishlist.length})`}
              >
                <Heart className="w-[15px] h-[15px] stroke-[1.6] shrink-0" />
                {wishlist.length > 0 && (
                  <span className="ml-1.5 min-w-[16px] h-4 px-1 inline-flex items-center justify-center bg-[#0B0B0C] text-white text-[9px] font-medium tracking-normal tabular-nums leading-none">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account / Profile Dropdown (Admin Panel ONLY inside dropdown when isAdmin === true) */}
              <div className="relative flex items-center h-9" ref={userMenuRef}>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenuNow();
                      setUserMenuOpen((prev) => !prev);
                    }}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    className="inline-flex items-center justify-center gap-2 h-9 leading-none text-[11px] uppercase tracking-[0.15em] text-[#0B0B0C]/85 hover:text-[#0B0B0C] transition-colors whitespace-nowrap"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover border border-black/15 shrink-0"
                      />
                    ) : (
                      <User className="w-[15px] h-[15px] stroke-[1.6] shrink-0" />
                    )}
                    <span className="hidden md:inline max-w-[88px] truncate leading-none">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`hidden md:inline w-3 h-3 stroke-[1.6] shrink-0 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180 opacity-100' : 'opacity-50'
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    onClick={closeMenuNow}
                    className="inline-flex items-center justify-center gap-1.5 h-9 leading-none text-[11px] uppercase tracking-[0.16em] text-[#0B0B0C]/75 hover:text-[#0B0B0C] transition-colors whitespace-nowrap"
                  >
                    <User className="w-[15px] h-[15px] stroke-[1.6] shrink-0" />
                    <span className="hidden md:inline leading-none">Account</span>
                  </Link>
                )}

                {/* Animated Profile Dropdown */}
                {user && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-60 bg-white text-[#0B0B0C] border border-black/[0.12] shadow-[0_18px_45px_rgba(0,0,0,0.09)] z-50 transition-all duration-200 ease-out origin-top-right ${
                      userMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-1.5 pointer-events-none'
                    }`}
                  >
                    <div className="px-4 py-3.5 bg-[#F6F5F2] border-b border-black/10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] truncate text-[#0B0B0C]">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#6B6A66] truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#0B0B0C]/80 hover:text-[#0B0B0C] hover:bg-[#F6F5F2] transition-colors"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <User className="w-3.5 h-3.5 stroke-[1.6]" /> Account & Orders
                        </span>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                      </Link>

                      <Link
                        href="/account?tab=wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#0B0B0C]/80 hover:text-[#0B0B0C] hover:bg-[#F6F5F2] transition-colors"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Heart className="w-3.5 h-3.5 stroke-[1.6]" /> Saved Pieces
                        </span>
                        <span className="text-[10px] text-[#6B6A66] tabular-nums">{wishlist.length}</span>
                      </Link>

                      <Link
                        href="/track-order"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#0B0B0C]/80 hover:text-[#0B0B0C] hover:bg-[#F6F5F2] transition-colors"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Package className="w-3.5 h-3.5 stroke-[1.6]" /> Track Order
                        </span>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                      </Link>

                      {isAdmin && (
                        <div className="my-1 border-y border-black/10">
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0B0B0C] bg-[#F6F5F2] hover:bg-[#ECEAE4] transition-colors"
                          >
                            <span className="inline-flex items-center gap-2.5">
                              <Shield className="w-3.5 h-3.5 stroke-[1.7]" /> Admin Panel
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#6B6A66] hover:text-[#B91C1C] hover:bg-[#F6F5F2] transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 stroke-[1.6]" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Bag */}
              <button
                type="button"
                onClick={() => {
                  closeMenuNow();
                  setUserMenuOpen(false);
                  setDrawerOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 h-9 leading-none text-[11px] uppercase tracking-[0.16em] font-medium text-[#0B0B0C] hover:opacity-65 transition-opacity whitespace-nowrap"
                aria-label={`Shopping bag with ${itemCount} items`}
              >
                <ShoppingBag className="w-[15px] h-[15px] stroke-[1.6] shrink-0" />
                <span className="hidden sm:inline leading-none">Bag</span>
                <span className="tabular-nums leading-none">({itemCount})</span>
              </button>
            </div>
          </div>

          {/* Full-Width Animated Desktop Mega-Menu Panel */}
          <div
            onMouseEnter={cancelCloseTimer}
            onMouseLeave={scheduleCloseMenu}
            className={`hidden lg:block absolute left-0 right-0 top-full bg-white border-b border-black/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeMenu
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            {/* 1. SHOP FULL-WIDTH GALLERY MEGA-MENU */}
            {renderedMenu === 'shop' && (
              <div className="max-w-[1440px] mx-auto px-8 py-10">
                <div className="grid grid-cols-12 gap-10">
                  {/* Left Column: Silhouettes with live counts */}
                  <div className="col-span-3 pr-6 border-r border-black/[0.08] flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66] mb-5">
                        Silhouettes
                      </p>
                      <ul className="space-y-1">
                        {SILHOUETTE_LINKS.map((item) => {
                          const count = getCategoryCount(item.category);
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={closeMenuNow}
                                className="group flex items-center justify-between py-2.5 border-b border-black/[0.05] text-[13px] tracking-[0.04em] text-[#0B0B0C]/80 hover:text-[#0B0B0C] transition-colors"
                              >
                                <span className="group-hover:translate-x-1 transition-transform duration-200">
                                  {item.label}
                                </span>
                                <span className="text-[10px] tracking-[0.14em] text-[#6B6A66] group-hover:text-[#0B0B0C] tabular-nums transition-colors">
                                  {String(count).padStart(2, '0')}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <Link
                      href="/shop"
                      onClick={closeMenuNow}
                      className="group inline-flex items-center gap-2 pt-6 text-[10px] uppercase tracking-[0.22em] font-medium text-[#0B0B0C]"
                    >
                      <span>Explore Full Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Middle Column: Shop By Spec */}
                  <div className="col-span-3 pr-6 border-r border-black/[0.08] flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66] mb-5">
                        Shop By Spec
                      </p>
                      <ul className="space-y-3.5">
                        {SPEC_LINKS.map((spec) => (
                          <li key={spec.label}>
                            <Link
                              href={spec.href}
                              onClick={closeMenuNow}
                              className="group block"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] text-[#0B0B0C]/85 group-hover:text-[#0B0B0C] transition-colors">
                                  {spec.label}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 transition-all duration-200" />
                              </div>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B6A66] mt-0.5">
                                {spec.detail}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-black/[0.08]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6A66]">
                        {config.dropTitle || 'DROP 04 // ARCHIVE GRUNGE'}
                      </p>
                    </div>
                  </div>

                  {/* Right 2 Visual Editorial Feature Columns */}
                  <div className="col-span-6 grid grid-cols-2 gap-6">
                    {SHOP_EDITORIAL_CARDS.map((card) => (
                      <Link
                        key={card.title}
                        href={card.href}
                        onClick={closeMenuNow}
                        className="group block"
                      >
                        <div className="relative aspect-[4/5] max-h-[340px] w-full overflow-hidden bg-[#F6F5F2] border border-black/[0.08]">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                          <div className="absolute top-3.5 right-3.5 w-8 h-8 bg-white/95 text-[#0B0B0C] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <ArrowUpRight className="w-4 h-4 stroke-[1.6]" />
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <p className="text-[9px] uppercase tracking-[0.24em] text-white/75">
                              {card.eyebrow}
                            </p>
                            <p className="font-display text-base uppercase tracking-[0.12em] font-semibold mt-1">
                              {card.title}
                            </p>
                            <p className="text-[10px] tracking-[0.14em] uppercase text-white/80 mt-0.5">
                              {card.spec}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. COLLECTIONS 4-COLUMN VISUAL EDITORIAL GRID MEGA-MENU */}
            {renderedMenu === 'collections' && (
              <div className="max-w-[1440px] mx-auto px-8 py-10">
                <div className="flex items-end justify-between mb-6 pb-4 border-b border-black/[0.08]">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66]">
                      Curated Capsules
                    </p>
                    <h3 className="font-display text-sm uppercase tracking-[0.2em] font-semibold text-[#0B0B0C] mt-1">
                      Drop 04 — Four Core Silhouettes
                    </h3>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeMenuNow}
                    className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#0B0B0C]/75 hover:text-[#0B0B0C] transition-colors"
                  >
                    <span>View All Pieces ({activeProducts.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {COLLECTION_CARDS.map((col) => {
                    const count = getCategoryCount(col.category);
                    return (
                      <Link
                        key={col.href}
                        href={col.href}
                        onClick={closeMenuNow}
                        className="group block"
                      >
                        <div className="relative aspect-[4/5] max-h-[320px] w-full overflow-hidden bg-[#F6F5F2] border border-black/[0.08]">
                          <img
                            src={col.image}
                            alt={col.title}
                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 border border-black/10">
                            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#0B0B0C]">
                              {col.gsmTag}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 w-7 h-7 bg-white/95 text-[#0B0B0C] flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.6]" />
                          </div>
                        </div>

                        <div className="pt-3.5 flex items-baseline justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B0B0C]">
                              {col.title}
                            </p>
                            <p className="text-[11px] text-[#6B6A66] mt-0.5">{col.subtitle}</p>
                          </div>
                          <span className="text-[10px] tracking-[0.14em] text-[#6B6A66] tabular-nums shrink-0">
                            {String(count).padStart(2, '0')}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. HOUSE REFINED EDITORIAL BRAND DROPDOWN */}
            {renderedMenu === 'house' && (
              <div className="max-w-[1440px] mx-auto px-8 py-10">
                <div className="grid grid-cols-12 gap-10 items-stretch">
                  {/* House Links Column */}
                  <div className="col-span-5 pr-8 border-r border-black/[0.08] flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66] mb-5">
                        House of Doffor
                      </p>
                      <ul className="divide-y divide-black/[0.06]">
                        {HOUSE_LINKS.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={closeMenuNow}
                              className="group flex items-center justify-between py-3 text-[#0B0B0C]/85 hover:text-[#0B0B0C] transition-colors"
                            >
                              <span className="text-[13px] tracking-[0.04em] group-hover:translate-x-1 transition-transform duration-200">
                                {item.label}
                              </span>
                              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6B6A66] group-hover:text-[#0B0B0C] transition-colors">
                                {item.note}
                                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-[11px] text-[#6B6A66] pt-6 leading-relaxed">
                      Independent Indian streetwear label focused on 240–280 GSM heavyweight jersey silhouettes and enduring construction.
                    </p>
                  </div>

                  {/* Right-Side Campaign Card */}
                  <div className="col-span-7">
                    <Link
                      href="/lookbook"
                      onClick={closeMenuNow}
                      className="group grid grid-cols-12 h-full bg-[#F6F5F2] border border-black/[0.08] overflow-hidden"
                    >
                      <div className="col-span-7 relative min-h-[300px] overflow-hidden">
                        <img
                          src="/images/lookbook-campus-1.jpg"
                          alt="Drop 04 Manifesto"
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="col-span-5 p-8 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66]">
                            Autumn / Winter Archive
                          </p>
                          <h4 className="font-display text-xl uppercase tracking-[0.1em] font-semibold text-[#0B0B0C] mt-3 leading-snug">
                            Drop 04 Manifesto
                          </h4>
                          <p className="text-xs text-[#6B6A66] leading-relaxed mt-3">
                            Heavyweight forms engineered with super-combed bio-washed cotton, boxy drop shoulders, and archival screen print craft.
                          </p>
                        </div>

                        <div className="pt-6 border-t border-black/10 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] font-medium text-[#0B0B0C]">
                          <span>Enter Lookbook</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Premium Mobile Full-Screen Drawer */}
      <div
        aria-hidden={!mobileOpen}
        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ease-out ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`h-full w-full bg-white text-[#0B0B0C] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen ? 'translate-y-0' : '-translate-y-3'
          }`}
        >
          {/* Mobile Drawer Top Bar */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-black/10 shrink-0">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66]">Menu</span>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="font-display font-bold text-lg tracking-[0.34em] uppercase pl-[0.34em]"
            >
              {config.brandWordmark || 'DOFFOR'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 -mr-1.5 text-[#0B0B0C] hover:opacity-65 transition-opacity"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 stroke-[1.6]" />
            </button>
          </div>

          {/* Mobile Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {/* Quick Search Bar */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F6F5F2] border border-black/10 text-left"
            >
              <span className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.18em] text-[#6B6A66]">
                <Search className="w-4 h-4 stroke-[1.6] text-[#0B0B0C]" />
                Search Drop 04...
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6B6A66]" />
            </button>

            {/* Collapsible Shop Accordion */}
            <div className="border-b border-black/10 pb-4">
              <button
                type="button"
                onClick={() => setMobileSection((prev) => (prev === 'shop' ? null : 'shop'))}
                aria-expanded={mobileSection === 'shop'}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-[0.22em]"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-4 h-4 stroke-[1.6] transition-transform duration-200 ${
                    mobileSection === 'shop' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileSection === 'shop' && (
                <div className="pt-3 pb-1 space-y-4">
                  <ul className="space-y-1">
                    {SILHOUETTE_LINKS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-2 text-sm text-[#0B0B0C]/85 hover:text-[#0B0B0C]"
                        >
                          <span>{item.label}</span>
                          <span className="text-[10px] tracking-[0.16em] text-[#6B6A66] tabular-nums">
                            {String(getCategoryCount(item.category)).padStart(2, '0')}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-black/[0.06] grid grid-cols-2 gap-2">
                    {SPEC_LINKS.slice(0, 4).map((spec) => (
                      <Link
                        key={spec.label}
                        href={spec.href}
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 bg-[#F6F5F2] border border-black/[0.08] text-[10px] uppercase tracking-[0.16em] text-[#0B0B0C]"
                      >
                        {spec.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Collections Accordion */}
            <div className="border-b border-black/10 pb-4">
              <button
                type="button"
                onClick={() =>
                  setMobileSection((prev) => (prev === 'collections' ? null : 'collections'))
                }
                aria-expanded={mobileSection === 'collections'}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-[0.22em]"
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-4 h-4 stroke-[1.6] transition-transform duration-200 ${
                    mobileSection === 'collections' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileSection === 'collections' && (
                <div className="pt-3 pb-1 grid grid-cols-2 gap-3">
                  {COLLECTION_CARDS.map((col) => (
                    <Link
                      key={col.href}
                      href={col.href}
                      onClick={() => setMobileOpen(false)}
                      className="block group"
                    >
                      <div className="relative aspect-[4/5] bg-[#F6F5F2] border border-black/[0.08] overflow-hidden">
                        <img
                          src={col.image}
                          alt={col.title}
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] font-medium">
                          {col.gsmTag}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] mt-2">
                        {col.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Lookbook Link */}
            <Link
              href="/lookbook"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2 pb-5 border-b border-black/10 text-xs font-semibold uppercase tracking-[0.22em]"
            >
              <span>Lookbook</span>
              <ArrowUpRight className="w-4 h-4 stroke-[1.6]" />
            </Link>

            {/* House Links */}
            <div className="space-y-2.5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6A66]">House</p>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                {HOUSE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs tracking-[0.06em] text-[#0B0B0C]/80 hover:text-[#0B0B0C]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Account Footer Section (Admin Panel ONLY here when isAdmin === true) */}
          <div className="border-t border-black/10 bg-[#F6F5F2] px-5 py-4 space-y-3 shrink-0">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#6B6A66] truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#6B6A66] hover:text-[#B91C1C]"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-black/[0.12] text-[10px] uppercase tracking-[0.18em]"
                  >
                    <User className="w-3.5 h-3.5" /> Account
                  </Link>
                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-black/[0.12] text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Heart className="w-3.5 h-3.5" /> Wishlist ({wishlist.length})
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0B0B0C] text-white text-[10px] font-semibold uppercase tracking-[0.2em]"
                    >
                      <Shield className="w-3.5 h-3.5" /> Admin Panel
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="flex gap-2.5">
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#0B0B0C] text-white text-[10px] font-medium uppercase tracking-[0.2em]"
                >
                  <User className="w-3.5 h-3.5" /> Sign In / Account
                </Link>
                <Link
                  href="/account?tab=wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-black/15 text-[10px] uppercase tracking-[0.18em]"
                >
                  <Heart className="w-3.5 h-3.5" /> ({wishlist.length})
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
