'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package,
  Heart,
  User,
  LogOut,
  Shield,
  ArrowRight,
  Truck,
  FileText,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/ProductCard';
import DofforLoader from '../../components/DofforLoader';
import { fetchUserOrders } from '../../lib/dataService';
import { formatINR, formatDate, ORDER_STATUS_META } from '../../lib/format';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAdmin, updateUserProfile, logout } = useAuth();
  const { wishlist } = useCart();
  const { products, pushToast } = useStore();

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    ['orders', 'wishlist', 'profile'].includes(initialTab) ? initialTab : 'orders'
  );

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (['orders', 'wishlist', 'profile'].includes(paramTab)) {
      setActiveTab(paramTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || '');
    setProfilePhone(user.phone || '');
    setProfileCity(user.city || '');

    let mounted = true;
    setOrdersLoading(true);
    fetchUserOrders(user.uid, user.email)
      .then((list) => {
        if (mounted) setOrders(list);
      })
      .catch((err) => console.error('[Account Orders Error]', err))
      .finally(() => {
        if (mounted) setOrdersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
        city: profileCity.trim(),
      });
      pushToast('Profile updated successfully.');
    } catch (err) {
      pushToast(err.message || 'Could not update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    pushToast('Signed out of Doffor Clothing.', 'info');
    router.push('/');
  };

  if (authLoading) {
    return <DofforLoader fullScreen label="Loading Account" />;
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] bg-obsidian text-bone flex items-center justify-center px-4 py-16">
        <div className="card-dark max-w-lg w-full p-8 sm:p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-surface border border-black/10 mx-auto flex items-center justify-center">
            <User className="w-7 h-7 text-bone" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-ash">
              Doffor Member Access
            </p>
            <h1 className="font-display font-extrabold text-3xl uppercase">
              Sign In To Your Account
            </h1>
            <p className="text-sm text-ash max-w-sm mx-auto">
              View your Drop 04 order history, download GST invoices, access your saved wishlist, and check out faster with Google Sign-In.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/auth" className="btn-acid flex-1">
              Sign In / Create Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/track-order" className="btn-outline flex-1">
              Track Guest Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-bone pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Account Banner */}
        <div className="card-dark p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-bone"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white border-2 border-bone flex items-center justify-center font-display font-extrabold text-2xl text-bone uppercase">
                {(user.name || user.email || 'D').charAt(0)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase">
                  {user.name}
                </h1>
                <span className="px-2 py-0.5 rounded-sm bg-white border border-black/15 font-mono text-[10px] uppercase tracking-wider text-bone">
                  {user.provider === 'google' ? 'Google Account' : 'Email Account'}
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-sm bg-bone text-obsidian font-mono text-[10px] font-bold uppercase tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-ash mt-1">
                {user.email}
                {user.city ? ` • ${user.city}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="btn-acid py-2.5 px-4">
                <Shield className="w-4 h-4" /> Open Admin Panel
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline py-2.5 px-4 hover:!border-crimson hover:!bg-crimson hover:!text-white"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-black/10 pb-4">
          {[
            { id: 'orders', label: 'Orders', count: orders.length, icon: Package },
            { id: 'wishlist', label: 'Wishlist', count: wishlistedProducts.length, icon: Heart },
            { id: 'profile', label: 'Profile', count: null, icon: User },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                  active
                    ? 'bg-bone text-obsidian'
                    : 'bg-charcoal border border-black/10 text-ash hover:text-bone hover:border-black/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-sm text-[10px] ${
                      active
                        ? 'bg-white text-bone'
                        : 'bg-white border border-black/10 text-bone'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {ordersLoading ? (
              <DofforLoader label="Fetching Your Orders" />
            ) : orders.length === 0 ? (
              <div className="card-dark p-10 text-center space-y-4">
                <ShoppingBag className="w-10 h-10 text-bone mx-auto" />
                <h2 className="font-display font-bold text-xl uppercase">No Orders Yet</h2>
                <p className="text-sm text-ash max-w-md mx-auto">
                  Orders placed with <span className="text-bone font-mono">{user.email}</span> will show up here with live courier tracking and downloadable tax invoices.
                </p>
                <Link href="/shop" className="btn-acid">
                  Shop Drop 04 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const statusMeta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.processing;
                return (
                  <div key={order.id} className="card-dark p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-base text-bone">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-sm border font-mono text-[10px] uppercase font-bold ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-ash">
                          Placed on {formatDate(order.createdAt)} •{' '}
                          <span className="uppercase text-bone font-medium">{order.paymentMethod}</span>
                          {order.razorpayPaymentId && (
                            <span className="text-emerald-800"> • {order.razorpayPaymentId}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          href={`/order-confirmation/${encodeURIComponent(order.orderNumber)}`}
                          className="btn-outline py-2 px-3.5 text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5" /> Invoice
                        </Link>
                        <Link
                          href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                          className="btn-acid py-2 px-3.5 text-[11px]"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Order
                        </Link>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          className="flex items-center gap-3.5 p-3 rounded-sm bg-white border border-black/10"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-16 object-cover rounded-sm bg-surface border border-black/10 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-sm text-bone truncate">
                              {item.name}
                            </p>
                            <p className="font-mono text-[11px] text-ash mt-0.5">
                              Size {item.size} • {item.color} • Qty {item.quantity}
                            </p>
                            <p className="font-mono text-xs font-bold text-bone mt-1">
                              {formatINR(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/10 text-xs font-mono">
                      <span className="text-ash">
                        Ship to:{' '}
                        {[order.shippingAddress?.city, order.shippingAddress?.state]
                          .filter(Boolean)
                          .join(', ')}
                        {order.shippingAddress?.pincode ? ` (${order.shippingAddress.pincode})` : ''}
                      </span>
                      <span className="text-base font-bold text-bone">
                        Total: {formatINR(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="card-dark p-10 text-center space-y-4">
                <Heart className="w-10 h-10 text-bone mx-auto" />
                <h2 className="font-display font-bold text-xl uppercase">Your Wishlist Is Empty</h2>
                <p className="text-sm text-ash max-w-md mx-auto">
                  Tap the heart icon on any Drop 04 piece to save it here for quick size-adds later.
                </p>
                <Link href="/shop" className="btn-acid">
                  Browse Archive <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {wishlistedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form onSubmit={handleSaveProfile} className="lg:col-span-7 card-dark p-6 sm:p-8 space-y-5">
              <div className="pb-3 border-b border-black/10">
                <h2 className="font-display font-bold text-lg uppercase">Personal Details</h2>
                <p className="text-xs text-ash mt-0.5">
                  Saved details automatically pre-fill your Indian shipping checkout form.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="input-dark pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={30}
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input-dark pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-ash mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={100}
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="Bengaluru / Mumbai / Delhi"
                      className="input-dark pl-10"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn-acid px-6 py-3 disabled:opacity-60"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Profile Changes
                  </>
                )}
              </button>
            </form>

            <div className="lg:col-span-5 card-dark p-6 sm:p-8 space-y-5">
              <h2 className="font-display font-bold text-lg uppercase pb-3 border-b border-black/10">
                Account Security
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-sm bg-white border border-black/10">
                  <span className="text-ash flex items-center gap-2 text-xs font-mono uppercase">
                    <Mail className="w-4 h-4 text-bone" /> Email
                  </span>
                  <span className="font-mono text-xs text-bone truncate max-w-[200px]">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-sm bg-white border border-black/10">
                  <span className="text-ash flex items-center gap-2 text-xs font-mono uppercase">
                    <Shield className="w-4 h-4 text-bone" /> Auth Method
                  </span>
                  <span className="px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold uppercase">
                    {user.provider === 'google' ? 'Google OAuth' : 'Email & Password'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-sm bg-white border border-black/10">
                  <span className="text-ash text-xs font-mono uppercase">Role</span>
                  <span className="font-mono text-xs uppercase text-bone font-bold">
                    {user.role || 'Customer'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn-outline w-full hover:!border-crimson hover:!bg-crimson hover:!text-white"
              >
                <LogOut className="w-4 h-4" /> Sign Out of Doffor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<DofforLoader fullScreen label="Loading Account" />}>
      <AccountContent />
    </Suspense>
  );
}
