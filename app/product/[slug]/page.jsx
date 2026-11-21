'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Zap,
  Ruler,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Minus,
  Plus,
  Layers,
  Sparkles,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import ProductCard from '../../../components/ProductCard';
import SizeGuideModal from '../../../components/SizeGuideModal';
import { addProductReview } from '../../../lib/dataService';
import {
  formatINR,
  calcDiscountPercent,
  formatDate,
  getTotalStock,
} from '../../../lib/format';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FIT_OPTIONS = ['Runs Small', 'True to Oversized', 'Runs Large'];

function estimateDeliveryForPincode(pin) {
  const firstDigit = pin.charAt(0);
  const prefix2 = pin.slice(0, 2);

  const metroPrefixes = ['11', '12', '20', '40', '41', '50', '56', '60', '70'];
  const isMetro = metroPrefixes.includes(prefix2);

  const zoneMap = {
    '1': 'North India (Delhi NCR / Punjab / Chandigarh)',
    '2': 'North India (UP / Uttarakhand)',
    '3': 'West India (Rajasthan / Gujarat)',
    '4': 'West & Central India (Maharashtra / Goa / MP)',
    '5': 'South India (Karnataka / Telangana / AP)',
    '6': 'South India (Tamil Nadu / Kerala)',
    '7': 'East & North-East India (WB / Odisha / Assam)',
    '8': 'East India (Bihar / Jharkhand)',
    '9': 'Army Postal / Special Zone',
  };

  const minDays = isMetro ? 2 : 4;
  const maxDays = isMetro ? 4 : 6;
  const now = new Date();
  const minDate = new Date(now.getTime() + minDays * 86400000);
  const maxDate = new Date(now.getTime() + maxDays * 86400000);

  const fmt = (d) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return {
    zone: zoneMap[firstDigit] || 'Pan-India Express Network',
    etaRange: `${fmt(minDate)} – ${fmt(maxDate)}`,
    serviceType: isMetro ? 'Express Air Dispatch (2–4 days)' : 'Standard Surface/Air (4–6 days)',
    codAvailable: firstDigit !== '9',
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params?.slug || '');

  const { products, config, pushToast, refreshStore } = useStore();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { user } = useAuth();

  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug) || null,
    [products, slug]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const urls = [
      ...(product.images || []),
      ...(product.colors || []).map((c) => c.image).filter(Boolean),
    ];
    return Array.from(new Set(urls));
  }, [product]);

  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Hover zoom state
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFit, setReviewFit] = useState('True to Oversized');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Sync product defaults when slug/product changes
  useEffect(() => {
    if (!product) return;
    const defaultColor = product.colors?.[0];
    setSelectedColor(defaultColor?.name || 'Jet Black');
    setActiveImage(defaultColor?.image || product.images?.[0] || '');

    const firstInStock =
      (product.sizes?.L ?? 0) > 0
        ? 'L'
        : SIZES.find((s) => (product.sizes?.[s] ?? 0) > 0) || 'L';
    setSelectedSize(firstInStock);
    setQuantity(1);
  }, [product?.id]);

  // Pre-fill user details for review form
  useEffect(() => {
    if (user) {
      if (!reviewName && user.name) setReviewName(user.name);
      if (!reviewCity && user.city) setReviewCity(user.city);
    }
  }, [user]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const others = products.filter((p) => p.id !== product.id);
    const sameCat = others.filter((p) => p.category === product.category);
    const diffCat = others.filter((p) => p.category !== product.category);
    return [...sameCat, ...diffCat].slice(0, 4);
  }, [products, product]);

  const fitSummary = useMemo(() => {
    const reviews = product?.reviews || [];
    const total = reviews.length;
    const counts = {
      'Runs Small': 0,
      'True to Oversized': 0,
      'Runs Large': 0,
    };
    for (const r of reviews) {
      if (counts[r.fitFeedback] !== undefined) counts[r.fitFeedback] += 1;
      else counts['True to Oversized'] += 1;
    }
    return { total, counts };
  }, [product]);

  if (!product) {
    return (
      <div className="bg-obsidian text-bone min-h-[70vh] flex items-center justify-center px-4">
        <div className="card-dark max-w-lg w-full p-8 text-center space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-acid">
            PIECE NOT FOUND
          </p>
          <h1 className="font-display font-extrabold text-3xl uppercase">
            Silhouette Archived or Sold Out
          </h1>
          <p className="text-sm text-ash">
            We couldn&apos;t find this exact piece in Drop 04. Explore our active heavyweights in
            the catalog.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/shop" className="btn-acid">
              Back to Shop
            </Link>
            <Link href="/" className="btn-outline">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discount = calcDiscountPercent(product.price, product.compareAtPrice);
  const totalStock = getTotalStock(product.sizes);
  const selectedSizeStock = product.sizes?.[selectedSize] ?? 0;
  const maxQty = Math.max(1, Math.min(10, selectedSizeStock || 1));
  const wishlisted = isWishlisted(product.id);
  const displayImage = activeImage || product.images?.[0];

  const handleSelectColor = (col) => {
    setSelectedColor(col.name);
    if (col.image) {
      setActiveImage(col.image);
    }
  };

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    const stock = product.sizes?.[size] ?? 0;
    if (quantity > stock && stock > 0) {
      setQuantity(stock);
    }
  };

  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleAddToBag = () => {
    if (selectedSizeStock <= 0) {
      pushToast(`Size ${selectedSize} is currently sold out`, 'error');
      return;
    }
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
      openDrawer: true,
    });
  };

  const handleBuyNow = () => {
    if (selectedSizeStock <= 0) {
      pushToast(`Size ${selectedSize} is currently sold out`, 'error');
      return;
    }
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
      openDrawer: false,
    });
    router.push('/checkout');
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setPincodeResult(null);
      setPincodeError('Enter a valid 6-digit Indian pincode (e.g. 110016, 400050, 560038).');
      return;
    }
    setPincodeError('');
    setPincodeResult(estimateDeliveryForPincode(clean));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      pushToast('Please enter your name and review comment.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await addProductReview(product.id, {
        userName: reviewName.trim(),
        city: reviewCity.trim() || 'India',
        rating: reviewRating,
        fitFeedback: reviewFit,
        comment: reviewComment.trim(),
        verified: Boolean(user),
      });
      await refreshStore();
      setReviewComment('');
      setReviewRating(5);
      setReviewFit('True to Oversized');
      pushToast('Review published! Thanks for repping Doffor.');
    } catch (err) {
      pushToast(err.message || 'Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-obsidian text-bone min-h-screen">
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Breadcrumbs */}
      <div className="border-b border-white/[0.06] bg-charcoal/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ash">
          <Link href="/" className="hover:text-acid transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-acid transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/collections/${product.category}`}
            className="hover:text-acid transition-colors"
          >
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-bone truncate max-w-[240px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* LEFT: Multi-Image Gallery + Hover Zoom */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className="relative aspect-[3/4] rounded-sm overflow-hidden bg-surface border border-white/10 cursor-zoom-in"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleMouseMoveZoom}
            >
              <img
                src={displayImage}
                alt={`${product.name} — ${selectedColor}`}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: zoomActive ? 'scale(1.65)' : 'scale(1)',
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
              />

              {/* Badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 pointer-events-none">
                {product.badges?.map((badge, idx) => (
                  <span
                    key={badge}
                    className={`px-2.5 py-1 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider ${
                      idx === 0
                        ? 'bg-acid text-obsidian'
                        : 'bg-obsidian/85 text-bone border border-white/15 backdrop-blur-md'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <span className="absolute bottom-3.5 left-3.5 px-2.5 py-1 rounded-sm bg-obsidian/85 backdrop-blur-md border border-white/15 font-mono text-[10px] uppercase tracking-wider text-bone pointer-events-none">
                {product.gsm} GSM • {product.fit}
              </span>

              <span className="hidden sm:inline-block absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-sm bg-white/90 backdrop-blur-md border border-[#0B0B0C]/15 font-mono text-[10px] text-[#0B0B0C]/80 pointer-events-none">
                Hover to Zoom
              </span>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {galleryImages.map((imgUrl, idx) => {
                  const active = imgUrl === displayImage;
                  return (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`aspect-[3/4] rounded-sm overflow-hidden border transition-all bg-surface ${
                        active
                          ? 'border-acid ring-1 ring-acid/60'
                          : 'border-[#0B0B0C]/15 opacity-75 hover:opacity-100 hover:border-[#0B0B0C]/50'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Details, Variants, Buy Actions, Pincode, Specs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Rating */}
            <div className="space-y-2 border-b border-white/[0.08] pb-5">
              <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest">
                <span className="text-acid font-bold">{product.categoryLabel}</span>
                <span className="text-ash">SKU: {product.sku}</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-sm text-ash">{product.subtitle}</p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-bone hover:text-acid transition-colors"
                >
                  <Star className="w-4 h-4 text-acid fill-acid" />
                  <span className="font-bold">{product.rating?.toFixed(1) || '5.0'}</span>
                  <span className="text-ash">
                    ({product.reviewCount || product.reviews?.length || 0} reviews)
                  </span>
                </a>
                <span className="text-[#0B0B0C]/20">|</span>
                <span className="font-mono text-xs text-ash">
                  Total Batch Stock:{' '}
                  <strong className="text-bone">{totalStock} pcs</strong>
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-mono font-extrabold text-3xl text-bone">
                  {formatINR(product.price)}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="font-mono text-lg text-ash line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-acid text-obsidian font-mono text-xs font-extrabold">
                    SAVE {discount}%
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-ash">
                Inclusive of all taxes • Free Express Shipping on orders above{' '}
                {formatINR(config.freeShippingThreshold || 1499)}
              </p>
            </div>

            {/* Colorway Swatches */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="uppercase tracking-widest text-ash">Colorway</span>
                <span className="text-bone font-bold">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors?.map((col) => {
                  const active = selectedColor === col.name;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => handleSelectColor(col)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-sm border transition-all ${
                        active
                          ? 'border-acid bg-acid/10 text-bone'
                          : 'border-[#0B0B0C]/15 bg-charcoal text-ash hover:border-[#0B0B0C]/50 hover:text-bone'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-[#0B0B0C]/25 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="font-mono text-xs">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector + Stock Count + Size Guide Trigger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs uppercase tracking-widest text-ash">
                    Select Size
                  </span>
                  {selectedSizeStock <= 0 ? (
                    <span className="px-2 py-0.5 rounded-sm bg-red-50 border border-red-300 font-mono text-[10px] font-bold text-crimson uppercase">
                      Sold Out
                    </span>
                  ) : selectedSizeStock <= 5 ? (
                    <span className="px-2 py-0.5 rounded-sm bg-amber-50 border border-amber-300 font-mono text-[10px] font-bold text-amber-800 uppercase">
                      Only {selectedSizeStock} left
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-300 font-mono text-[10px] font-bold text-emerald-800 uppercase">
                      In Stock ({selectedSizeStock} left)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-acid hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size & Fit Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((sz) => {
                  const stock = product.sizes?.[sz] ?? 0;
                  const out = stock <= 0;
                  const low = stock > 0 && stock <= 5;
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={out}
                      onClick={() => handleSelectSize(sz)}
                      className={`relative py-3 rounded-sm font-mono text-sm font-bold border transition-all ${
                        out
                          ? 'border-[#0B0B0C]/10 bg-charcoal/60 text-ash/45 line-through cursor-not-allowed'
                          : active
                          ? 'bg-acid text-obsidian border-acid'
                          : 'bg-charcoal text-bone border-[#0B0B0C]/15 hover:border-acid'
                      }`}
                    >
                      {sz}
                      {low && !active && (
                        <span
                          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-600"
                          title={`Only ${stock} left`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper + CTA Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3">
                {/* Quantity */}
                <div className="flex items-center bg-charcoal border border-white/15 rounded-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-ash hover:text-bone transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    className="px-3.5 py-3 text-ash hover:text-bone transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  type="button"
                  disabled={selectedSizeStock <= 0}
                  onClick={handleAddToBag}
                  className="btn-acid flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {selectedSizeStock <= 0 ? 'Sold Out' : 'Add to Bag'}
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id, product.name)}
                  aria-label="Save to wishlist"
                  className={`px-4 rounded-sm border flex items-center justify-center transition-colors ${
                    wishlisted
                      ? 'bg-crimson border-crimson text-white'
                      : 'bg-charcoal border-white/15 text-bone hover:border-acid hover:text-acid'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Buy Now */}
              <button
                type="button"
                disabled={selectedSizeStock <= 0}
                onClick={handleBuyNow}
                className="btn-outline w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Buy Now — Instant Razorpay UPI / Card
              </button>
            </div>

            {/* Indian 6-Digit Pincode Delivery ETA Checker */}
            <div className="card-dark p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-bone flex items-center gap-1.5 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-acid" /> Check Pan-India Delivery ETA
                </span>
                <span className="font-mono text-[10px] text-ash">BLUEDART • DELHIVERY</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (pincodeError) setPincodeError('');
                  }}
                  placeholder="Enter 6-digit pincode (e.g. 560038)"
                  className="input-dark font-mono text-xs py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#0B0B0C] text-white hover:bg-[#0B0B0C]/85 font-mono text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                >
                  Check
                </button>
              </form>

              {pincodeError && (
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-crimson">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {pincodeError}
                </p>
              )}

              {pincodeResult && (
                <div className="p-3 rounded-sm bg-emerald-50/70 border border-emerald-300 space-y-1.5 font-mono text-xs">
                  <p className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Estimated Delivery: {pincodeResult.etaRange}
                  </p>
                  <p className="text-[11px] text-bone/85">{pincodeResult.serviceType}</p>
                  <p className="text-[11px] text-ash">
                    Zone: {pincodeResult.zone} •{' '}
                    {pincodeResult.codAvailable
                      ? 'UPI & Cash on Delivery Available'
                      : 'Prepaid UPI / Card Only'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px] text-ash">
                <div className="flex flex-col items-center gap-1 p-2 rounded-sm bg-obsidian/70">
                  <Truck className="w-3.5 h-3.5 text-acid" />
                  <span>24h Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-sm bg-obsidian/70">
                  <RefreshCw className="w-3.5 h-3.5 text-acid" />
                  <span>7-Day Exchange</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-sm bg-obsidian/70">
                  <ShieldCheck className="w-3.5 h-3.5 text-acid" />
                  <span>Secure UPI</span>
                </div>
              </div>
            </div>

            {/* Description + Fabric / Fit / Care Specs */}
            <div className="space-y-4 pt-2 border-t border-white/[0.08]">
              <p className="text-sm text-bone/85 leading-relaxed">{product.description}</p>

              {product.highlights?.length > 0 && (
                <ul className="space-y-2">
                  {product.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-ash">
                      <Sparkles className="w-3.5 h-3.5 text-acid shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Fabric', value: product.fabric },
                  { label: 'Weight & Fit', value: `${product.gsm} GSM • ${product.fit}` },
                  { label: 'Print Craft', value: product.printTech },
                  {
                    label: 'Garment Care',
                    value: 'Cold machine wash inside-out. Do not iron directly on print.',
                  },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="p-3 rounded-sm bg-charcoal border border-white/[0.06]"
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-acid mb-1">
                      {spec.label}
                    </span>
                    <span className="block text-xs text-bone/90 leading-relaxed">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          VERIFIED CUSTOMER REVIEWS + FIT FEEDBACK + REVIEW FORM
      ======================================================= */}
      <section
        id="reviews"
        className="border-t border-white/[0.08] bg-charcoal/35 py-14 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid mb-2">
                COMMUNITY FEEDBACK
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight">
                Verified Customer Reviews
              </h2>
            </div>
            <div className="flex items-center gap-3 font-mono text-sm">
              <div className="flex items-center gap-1 text-acid">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating || 5) ? 'fill-acid text-acid' : 'text-ash/40'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-bone">{product.rating?.toFixed(1) || '5.0'} / 5</span>
              <span className="text-ash">
                ({product.reviewCount || product.reviews?.length || 0} ratings)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Fit Feedback Summary + Write a Review Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Fit Feedback Summary */}
              <div className="card-dark p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-bone flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-acid" /> Fit Feedback Summary
                  </h3>
                  <span className="font-mono text-[10px] text-ash">
                    {fitSummary.total} {fitSummary.total === 1 ? 'report' : 'reports'}
                  </span>
                </div>

                <div className="space-y-3">
                  {FIT_OPTIONS.map((opt) => {
                    const count = fitSummary.counts[opt] || 0;
                    const pct =
                      fitSummary.total > 0
                        ? Math.round((count / fitSummary.total) * 100)
                        : opt === 'True to Oversized'
                        ? 100
                        : 0;
                    return (
                      <div key={opt} className="space-y-1">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-bone/90">{opt}</span>
                          <span className="text-ash">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#0B0B0C]/10 overflow-hidden">
                          <div
                            className="h-full bg-acid rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Write a Review Form */}
              <form onSubmit={handleSubmitReview} className="card-dark p-5 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg uppercase tracking-wide">
                    Write a Review
                  </h3>
                  <p className="font-mono text-[11px] text-ash mt-0.5">
                    Share how this {product.gsm} GSM silhouette drapes on you.
                  </p>
                </div>

                {/* Star Picker */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= reviewRating
                              ? 'text-acid fill-acid'
                              : 'text-ash/40 hover:text-acid/70'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fit Feedback Selector */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash">
                    How did it fit?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FIT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setReviewFit(opt)}
                        className={`py-2 px-2 rounded-sm font-mono text-[10px] uppercase border transition-colors ${
                          reviewFit === opt
                            ? 'bg-acid text-obsidian border-acid font-bold'
                            : 'bg-obsidian text-ash border-white/15 hover:text-bone'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Your name"
                      className="input-dark text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={reviewCity}
                      onChange={(e) => setReviewCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru"
                      className="input-dark text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1">
                    Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Fabric feel, print contrast, drape, sizing advice..."
                    className="input-dark text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-acid w-full disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReview ? 'Publishing...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Right: Reviews Feed */}
            <div className="lg:col-span-7 space-y-4">
              {!product.reviews || product.reviews.length === 0 ? (
                <div className="card-dark p-8 text-center space-y-2">
                  <p className="font-mono text-xs uppercase tracking-widest text-acid">
                    FIRST TO REVIEW
                  </p>
                  <p className="text-sm text-ash">
                    No written reviews for this piece yet. Drop your feedback on the left!
                  </p>
                </div>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="card-dark p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-bone">
                            {rev.userName}
                          </span>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-300 font-mono text-[10px] font-semibold text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-ash mt-0.5">
                          {rev.city || 'India'} • {formatDate(rev.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-sm bg-obsidian border border-white/10 font-mono text-[10px] text-acid">
                          {rev.fitFeedback || 'True to Oversized'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'text-acid fill-acid' : 'text-ash/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-bone/85 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          YOU MAY ALSO LIKE (4-CARD RELATED GRID)
      ======================================================= */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 border-t border-white/[0.08]">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid mb-1.5">
                COMPLETE THE ROTATION
              </p>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/shop"
              className="font-mono text-xs uppercase tracking-widest text-ash hover:text-acid transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
