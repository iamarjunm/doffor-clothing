'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Zap,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  Tag,
  X,
  CheckCircle2,
  MapPin,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import RazorpayModal from '../../components/RazorpayModal';
import { createOrder } from '../../lib/dataService';
import { formatINR, INDIAN_STATES } from '../../lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    coupon,
    couponDiscount,
    freeShippingThreshold,
    standardShippingFee,
    clearCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();
  const { config, pushToast, refreshStore } = useStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    landmark: '',
    city: '',
    state: 'Delhi',
    pincode: '',
  });
  const [deliverySpeed, setDeliverySpeed] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Razorpay simulator modal state
  const [rzpModalOpen, setRzpModalOpen] = useState(false);
  const [rzpOrderData, setRzpOrderData] = useState(null);

  const codEnabled = config?.codEnabled !== false;

  // Reset payment method to Razorpay whenever COD is disabled in Site Customizer
  useEffect(() => {
    if (!codEnabled && paymentMethod === 'cod') {
      setPaymentMethod('razorpay');
    }
  }, [codEnabled, paymentMethod]);

  // Auto-fill from signed-in user without overwriting edits
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || (user.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '').slice(-10),
      city: prev.city || user.city || '',
    }));
  }, [user]);

  const activePaymentMethod = codEnabled ? paymentMethod : 'razorpay';
  const configuredStandardFee = Number(config?.standardShippingFee ?? standardShippingFee ?? 79);
  const expressFee = Number(config?.expressShippingFee ?? 99);
  const codFeeAmount = Number(config?.codFee ?? 49);

  const safeDiscount = Math.min(subtotal, Math.max(0, Number(couponDiscount) || 0));
  const netSubtotal = Math.max(0, subtotal - safeDiscount);
  const effectiveStandardShippingFee =
    subtotal === 0 ? 0 : netSubtotal >= freeShippingThreshold ? 0 : configuredStandardFee;
  const shippingFee =
    deliverySpeed === 'express' ? expressFee : effectiveStandardShippingFee;
  const codFee = activePaymentMethod === 'cod' ? codFeeAmount : 0;
  const finalTotal = netSubtotal + shippingFee + codFee;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.';
    }
    const digitsPhone = form.phone.replace(/\D/g, '');
    if (digitsPhone.length !== 10) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!form.line1.trim() || form.line1.trim().length < 5) {
      return 'Please enter your complete street address (House/Flat No., Street, Area).';
    }
    if (!form.city.trim()) return 'Please enter your city.';
    if (!form.state) return 'Please select your state.';
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return 'Please enter a valid 6-digit Indian pincode.';
    }
    return '';
  };

  const buildOrderPayload = (overrides = {}) => {
    const cleanPhone = form.phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    const cleanFullName = form.fullName.trim().slice(0, 120);
    return {
      userId: user?.uid || 'guest',
      customerName: cleanFullName,
      customerEmail: form.email.trim().toLowerCase().slice(0, 254),
      customerPhone: formattedPhone,
      shippingAddress: {
        fullName: cleanFullName,
        phone: formattedPhone,
        line1: form.line1.trim().slice(0, 300),
        landmark: form.landmark.trim().slice(0, 200),
        city: form.city.trim().slice(0, 100),
        state: form.state,
        pincode: form.pincode.trim(),
      },
      items: items.slice(0, 50).map((i) => ({
        productId: String(i.productId || '').slice(0, 120),
        slug: String(i.slug || '').slice(0, 160),
        name: String(i.name || '').slice(0, 160),
        image: String(i.image || ''),
        color: String(i.color || '').slice(0, 80),
        size: i.size,
        quantity: Math.max(1, Math.min(50, Math.round(Number(i.quantity) || 1))),
        price: Number(i.price),
      })),
      subtotal,
      discount: safeDiscount,
      couponCode: coupon?.code ? String(coupon.code).slice(0, 32) : null,
      shippingFee,
      codFee,
      deliverySpeed,
      total: finalTotal,
      ...overrides,
    };
  };

  const finalizeRazorpayOrder = async (rzpRes) => {
    setSubmitting(true);
    try {
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: rzpRes.razorpay_order_id,
          razorpay_payment_id: rzpRes.razorpay_payment_id,
          razorpay_signature: rzpRes.razorpay_signature,
          isSimulated: Boolean(rzpRes.isSimulated),
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }

      const channelLabel = rzpRes.paymentChannel ? ` (${rzpRes.paymentChannel})` : '';
      const createdOrder = await createOrder(
        buildOrderPayload({
          paymentMethod: `razorpay${channelLabel}`.slice(0, 60),
          paymentStatus: 'paid',
          razorpayOrderId: String(verifyData.razorpayOrderId || '').slice(0, 120),
          razorpayPaymentId: String(verifyData.razorpayPaymentId || '').slice(0, 120),
          status: 'confirmed',
        })
      );

      setRzpModalOpen(false);
      clearCart();
      await refreshStore();
      pushToast(`Payment verified! Order ${createdOrder.orderNumber} confirmed.`);
      router.push(`/order-confirmation/${createdOrder.orderNumber}`);
    } catch (err) {
      setRzpModalOpen(false);
      setFormError(err.message || 'Could not verify payment. Please try again.');
      pushToast(err.message || 'Payment verification error', 'error');
      setSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validateForm();
    if (errMsg) {
      setFormError(errMsg);
      return;
    }
    if (items.length === 0) {
      setFormError('Your bag is empty.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    // Cash on Delivery Flow (only when COD is enabled by store config)
    if (activePaymentMethod === 'cod' && codEnabled) {
      try {
        const createdOrder = await createOrder(
          buildOrderPayload({
            paymentMethod: 'cod',
            paymentStatus: 'pending_cod',
            razorpayOrderId: '',
            razorpayPaymentId: '',
            status: 'processing',
          })
        );
        clearCart();
        await refreshStore();
        pushToast(`Order ${createdOrder.orderNumber} placed via COD!`);
        router.push(`/order-confirmation/${createdOrder.orderNumber}`);
      } catch (err) {
        setFormError(err.message || 'Failed to place COD order.');
        setSubmitting(false);
      }
      return;
    }

    // Razorpay Flow
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountINR: finalTotal,
          couponCode: coupon?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to initiate Razorpay checkout.');
      }

      if (data.mode === 'live-sdk' && typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || 'INR',
          name: 'Doffor Clothing',
          description: 'Doffor Clothing Order',
          order_id: data.razorpayOrderId,
          prefill: {
            name: form.fullName.trim(),
            email: form.email.trim(),
            contact: form.phone.replace(/\D/g, '').slice(-10),
          },
          theme: { color: '#0B0B0C' },
          handler: async (rzpRes) => {
            await finalizeRazorpayOrder(rzpRes);
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              pushToast('Payment cancelled. Your bag is still saved.', 'info');
            },
          },
        };
        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', (resp) => {
          setSubmitting(false);
          setFormError(resp.error?.description || 'Razorpay payment failed. Please try again.');
        });
        rzpInstance.open();
      } else {
        // Zero-config Razorpay sandbox simulator modal
        setRzpOrderData(data);
        setRzpModalOpen(true);
        setSubmitting(false);
      }
    } catch (err) {
      setFormError(err.message || 'Payment initialization failed.');
      setSubmitting(false);
    }
  };

  const handleApplyPromo = async (e) => {
    e?.preventDefault?.();
    if (!promoInput.trim() || applyingPromo) return;
    setPromoError('');
    setApplyingPromo(true);
    try {
      await applyCouponCode(promoInput);
      setPromoInput('');
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code.');
    } finally {
      setApplyingPromo(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-obsidian text-bone flex items-center justify-center px-4 py-16">
        <div className="card-dark max-w-md w-full p-8 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-bone mx-auto" />
          <h1 className="font-display font-bold text-2xl uppercase">Nothing to Checkout</h1>
          <p className="text-sm text-ash">
            {codEnabled
              ? 'Your Doffor bag is empty. Add pieces from our collection first to proceed to Razorpay or COD checkout.'
              : 'Your Doffor bag is empty. Add pieces from our collection first to proceed to Razorpay checkout.'}
          </p>
          <Link href="/shop" className="btn-acid w-full">
            Shop Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-bone pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-black/10">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ash hover:text-bone transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
            </Link>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight">
              Secure Checkout
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted • Razorpay Verified
          </div>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 cols: Shipping, Delivery, Payment */}
          <div className="lg:col-span-7 space-y-6">
            {formError && (
              <div className="p-4 rounded-sm bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-900">
                <AlertCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Step 1: Shipping Details */}
            <section className="card-dark p-6 space-y-5">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-sm bg-bone text-obsidian font-mono text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-display font-bold text-base uppercase tracking-wider">
                    Shipping Address (India)
                  </h2>
                </div>
                {!user && (
                  <Link href="/auth" className="font-mono text-[11px] font-semibold text-bone hover:underline">
                    Have an account? Sign in
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="input-dark"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@domain.com"
                    className="input-dark"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    10-Digit Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-surface border border-r-0 border-black/20 rounded-l-sm font-mono text-xs text-bone font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="input-dark rounded-l-none font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Address Line 1 (House / Flat / Street / Locality) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    value={form.line1}
                    onChange={(e) => handleChange('line1', e.target.value)}
                    placeholder="Flat 402, Skyline Towers, Indiranagar"
                    className="input-dark"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Landmark / Apartment (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={form.landmark}
                    onChange={(e) => handleChange('landmark', e.target.value)}
                    placeholder="Near Metro Gate 2, Opposite Park"
                    className="input-dark"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Bengaluru / Mumbai / New Delhi"
                    className="input-dark"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    State *
                  </label>
                  <select
                    required
                    value={form.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="input-dark"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-white text-bone">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    6-Digit Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="560038"
                    className="input-dark font-mono tracking-widest"
                  />
                </div>

                <div className="flex items-end">
                  <div className="w-full p-2.5 rounded-sm bg-white border border-black/10 flex items-center gap-2 text-xs text-ash">
                    <MapPin className="w-4 h-4 text-bone shrink-0" />
                    <span>BlueDart & Delhivery Air Express</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Delivery Speed */}
            <section className="card-dark p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-black/10">
                <span className="w-6 h-6 rounded-sm bg-bone text-obsidian font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-display font-bold text-base uppercase tracking-wider">
                  Delivery Speed
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliverySpeed('standard')}
                  className={`p-4 rounded-sm border text-left transition-all ${
                    deliverySpeed === 'standard'
                      ? 'border-bone bg-white ring-1 ring-bone'
                      : 'border-black/10 bg-white/70 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 font-display font-bold text-sm uppercase">
                      <Truck className="w-4 h-4 text-bone" /> Standard Delivery
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        effectiveStandardShippingFee === 0 ? 'text-emerald-800' : 'text-bone'
                      }`}
                    >
                      {effectiveStandardShippingFee === 0
                        ? 'FREE'
                        : formatINR(effectiveStandardShippingFee)}
                    </span>
                  </div>
                  <p className="text-xs text-ash">
                    3–5 business days across India. Free on orders above {formatINR(freeShippingThreshold)}.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliverySpeed('express')}
                  className={`p-4 rounded-sm border text-left transition-all ${
                    deliverySpeed === 'express'
                      ? 'border-bone bg-white ring-1 ring-bone'
                      : 'border-black/10 bg-white/70 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 font-display font-bold text-sm uppercase">
                      <Zap className="w-4 h-4 text-bone" /> Express 48hr Air
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        expressFee === 0 ? 'text-emerald-800' : 'text-bone'
                      }`}
                    >
                      {expressFee === 0 ? 'FREE' : formatINR(expressFee)}
                    </span>
                  </div>
                  <p className="text-xs text-ash">
                    Priority warehouse dispatch & BlueDart Air shipping to metro hubs.
                  </p>
                </button>
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="card-dark p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-black/10">
                <span className="w-6 h-6 rounded-sm bg-bone text-obsidian font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-display font-bold text-base uppercase tracking-wider">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`block p-4 rounded-sm border cursor-pointer transition-all ${
                    activePaymentMethod === 'razorpay'
                      ? 'border-bone bg-white ring-1 ring-bone'
                      : 'border-black/10 bg-white/70 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={activePaymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 accent-[#0B0B0C]"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-sm uppercase flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-bone" /> Razorpay Instant Pay
                          </span>
                          <span className="px-2 py-0.5 rounded-sm bg-bone text-obsidian font-mono text-[10px] font-bold uppercase">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-ash mt-1">
                          UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Netbanking & Wallets.
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-800 shrink-0">₹0 Fee</span>
                  </div>
                </label>

                {/* COD Option — hidden if disabled by Admin in Site Customizer */}
                {codEnabled && (
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`block p-4 rounded-sm border cursor-pointer transition-all ${
                      activePaymentMethod === 'cod'
                        ? 'border-bone bg-white ring-1 ring-bone'
                        : 'border-black/10 bg-white/70 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={activePaymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-1 accent-[#0B0B0C]"
                        />
                        <div>
                          <span className="font-display font-bold text-sm uppercase flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-bone" /> Cash on Delivery (COD)
                          </span>
                          <p className="text-xs text-ash mt-1">
                            Pay via cash or UPI at your doorstep upon delivery.
                            {codFeeAmount > 0 ? ' Additional COD handling charge applies.' : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-mono text-xs font-bold shrink-0 ${
                          codFeeAmount === 0 ? 'text-emerald-800' : 'text-bone'
                        }`}
                      >
                        {codFeeAmount === 0 ? 'FREE' : `+${formatINR(codFeeAmount)}`}
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </section>
          </div>

          {/* Right 5 cols: Sticky Order Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="card-dark p-6 space-y-5">
              <h2 className="font-display font-bold text-lg uppercase tracking-wider pb-3 border-b border-black/10">
                Order Review ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>

              {/* Items Compact List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 items-center">
                    <div className="relative w-14 h-16 rounded-sm overflow-hidden bg-surface border border-black/10 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-0.5 -right-0.5 bg-bone text-obsidian font-mono text-[10px] font-bold px-1.5 rounded-bl-sm">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-xs text-bone line-clamp-1">
                        {item.name}
                      </p>
                      <p className="font-mono text-[10px] text-ash mt-0.5">
                        Size {item.size} • {item.color}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-bone shrink-0">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Mini Box */}
              <div className="pt-4 border-t border-black/10">
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-sm bg-emerald-50 border border-emerald-200">
                    <span className="font-mono text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {coupon.code} (-{formatINR(safeDiscount)})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-800/70 hover:text-emerald-950 p-0.5"
                      aria-label="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            if (promoError) setPromoError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyPromo(e);
                            }
                          }}
                          placeholder="Promo code (DOFFOR10)"
                          className="input-dark pl-8 py-2 text-xs font-mono uppercase"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={applyingPromo || !promoInput.trim()}
                        className="btn-outline py-2 px-4 text-[11px] disabled:opacity-50"
                      >
                        {applyingPromo ? '...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="font-mono text-[11px] text-crimson">{promoError}</p>}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-black/10 space-y-2.5 text-sm">
                <div className="flex justify-between text-ash">
                  <span>Bag Subtotal</span>
                  <span className="font-mono text-bone">{formatINR(subtotal)}</span>
                </div>
                {safeDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span className="font-mono text-xs uppercase font-semibold">Discount ({coupon?.code})</span>
                    <span className="font-mono font-bold">-{formatINR(safeDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ash">
                  <span>{deliverySpeed === 'express' ? 'Express 48hr Air' : 'Standard Shipping'}</span>
                  <span
                    className={`font-mono ${
                      shippingFee === 0 ? 'text-emerald-800 font-semibold' : 'text-bone'
                    }`}
                  >
                    {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                  </span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-ash">
                    <span>Cash on Delivery Fee</span>
                    <span className="font-mono text-bone">{formatINR(codFee)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-black/10">
                <div className="flex items-baseline justify-between">
                  <span className="font-display font-bold uppercase">Total Payable</span>
                  <span className="font-mono font-bold text-2xl text-bone">
                    {formatINR(finalTotal)}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-ash mt-1">
                  All prices include applicable Indian GST (12%)
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-acid w-full py-4 text-sm disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                  </>
                ) : activePaymentMethod === 'razorpay' ? (
                  <>
                    <Lock className="w-4 h-4" /> Pay {formatINR(finalTotal)} with Razorpay
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Place COD Order ({formatINR(finalTotal)})
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-ash pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>Verified Doffor Clothing Direct Checkout</span>
              </div>
            </div>
          </aside>
        </form>
      </div>

      {/* Razorpay Sandbox Simulator Modal */}
      <RazorpayModal
        open={rzpModalOpen}
        orderData={rzpOrderData}
        customer={{
          name: form.fullName,
          email: form.email,
          phone: form.phone ? `+91 ${form.phone}` : '',
        }}
        onClose={() => {
          setRzpModalOpen(false);
          setSubmitting(false);
        }}
        onPaymentSuccess={finalizeRazorpayOrder}
      />
    </div>
  );
}
