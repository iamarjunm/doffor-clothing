'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchStoreConfig } from '../lib/dataService';
import { INITIAL_PRODUCTS, INITIAL_CONFIG } from '../lib/catalog';

const StoreContext = createContext(null);

function mergeConfig(raw) {
  if (!raw) return INITIAL_CONFIG;
  return {
    ...INITIAL_CONFIG,
    ...raw,
    theme: { ...INITIAL_CONFIG.theme, ...(raw.theme || {}) },
    sections: { ...INITIAL_CONFIG.sections, ...(raw.sections || {}) },
    hero: { ...INITIAL_CONFIG.hero, ...(raw.hero || {}) },
    newArrivals: { ...INITIAL_CONFIG.newArrivals, ...(raw.newArrivals || {}) },
    craftStory: { ...INITIAL_CONFIG.craftStory, ...(raw.craftStory || {}) },
    privilegeBar: { ...INITIAL_CONFIG.privilegeBar, ...(raw.privilegeBar || {}) },
    footer: { ...INITIAL_CONFIG.footer, ...(raw.footer || {}) },
    editorialSplit:
      Array.isArray(raw.editorialSplit) && raw.editorialSplit.length >= 2
        ? raw.editorialSplit
        : INITIAL_CONFIG.editorialSplit,
    silhouettes:
      Array.isArray(raw.silhouettes) && raw.silhouettes.length
        ? raw.silhouettes
        : INITIAL_CONFIG.silhouettes,
    lookbookStrip:
      Array.isArray(raw.lookbookStrip) && raw.lookbookStrip.length
        ? raw.lookbookStrip
        : INITIAL_CONFIG.lookbookStrip,
  };
}

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
      setConfig(mergeConfig(cfg));
    } catch (err) {
      console.error('[Store] Refresh error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  // Apply live theme CSS variables from Admin Site Customizer
  useEffect(() => {
    if (typeof document === 'undefined' || !config?.theme) return;
    const root = document.documentElement;
    root.style.setProperty('--df-canvas', config.theme.canvasBg || '#FFFFFF');
    root.style.setProperty('--df-surface', config.theme.surfaceBg || '#F6F5F2');
    root.style.setProperty('--df-ink', config.theme.inkColor || '#0B0B0C');
    root.style.setProperty('--df-btn-bg', config.theme.buttonBg || '#0B0B0C');
    root.style.setProperty('--df-btn-text', config.theme.buttonText || '#FFFFFF');
    root.style.setProperty('--df-radius', config.theme.buttonRadius || '0px');
  }, [config?.theme]);

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
