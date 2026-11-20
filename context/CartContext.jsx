'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { validateCoupon } from '../lib/dataService';
import { useStore } from './StoreContext';

const CartContext = createContext(null);

const CART_STORAGE = 'doffor_cart_next_v1';
const WISHLIST_STORAGE = 'doffor_wishlist_next_v1';

export function CartProvider({ children }) {
  const { config, pushToast } = useStore();
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE);
      const savedWish = window.localStorage.getItem(WISHLIST_STORAGE);
      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedWish) setWishlist(JSON.parse(savedWish));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_STORAGE, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_STORAGE, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (!coupon) {
      setCouponDiscount(0);
      return;
    }
    if (subtotal < coupon.minOrder) {
      setCoupon(null);
      setCouponDiscount(0);
      return;
    }
    const disc =
      coupon.type === 'percent'
        ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount || 99999)
        : Math.min(coupon.value, subtotal);
    setCouponDiscount(disc);
  }, [subtotal, coupon]);

  const freeShippingThreshold = config.freeShippingThreshold || 1499;
  const amountToFreeShipping = Math.max(
    0,
    freeShippingThreshold - Math.max(0, subtotal - couponDiscount)
  );
  const standardShippingFee = subtotal === 0 ? 0 : amountToFreeShipping === 0 ? 0 : 79;

  const addToCart = (product, { size = 'L', color, quantity = 1, openDrawer = true } = {}) => {
    const selectedColor = color || product.colors?.[0]?.name || 'Jet Black';
    const selectedImage =
      product.colors?.find((c) => c.name === selectedColor)?.image || product.images?.[0];
    const key = `${product.id}__${selectedColor}__${size}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(10, i.quantity + quantity) } : i
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          gsm: product.gsm,
          image: selectedImage,
          color: selectedColor,
          size,
          quantity,
        },
      ];
    });

    pushToast(`Added ${product.name} (${size}) to bag`);
    if (openDrawer) setDrawerOpen(true);
  };

  const updateQuantity = (key, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(0, Math.min(10, item.quantity + delta)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setCouponDiscount(0);
  };

  const applyCouponCode = async (code) => {
    const data = await validateCoupon(code, subtotal);
    setCoupon(data.coupon);
    setCouponDiscount(data.discount);
    pushToast(`Applied ${data.coupon.code} — saved ₹${data.discount}!`);
    return data;
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
  };

  const toggleWishlist = (productId, productName = 'Piece') => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        pushToast(`Removed ${productName} from wishlist`, 'info');
        return prev.filter((id) => id !== productId);
      }
      pushToast(`Saved ${productName} to wishlist`);
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        coupon,
        couponDiscount,
        freeShippingThreshold,
        amountToFreeShipping,
        standardShippingFee,
        drawerOpen,
        setDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
