'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchStoreConfig } from '../lib/dataService';
import { INITIAL_PRODUCTS, INITIAL_CONFIG } from '../lib/catalog';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const pushToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshStore = useCallback(async () => {
    try {
      const [prods, cfg] = await Promise.all([fetchProducts(), fetchStoreConfig()]);
      setProducts(prods);
      setConfig(cfg);
    } catch (err) {
      console.error('[Store] Refresh error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        config,
        loading,
        refreshStore,
        toasts,
        pushToast,
        dismissToast,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
