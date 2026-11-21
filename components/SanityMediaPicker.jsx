'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { uploadProductImage } from '../lib/dataService';

function getBaseAssetUrl(url) {
  return String(url || '').split('?')[0];
}

function toThumbUrl(url) {
  const base = getBaseAssetUrl(url);
  if (!base) return '';
  return `${base}?auto=format&fit=max&w=480&q=75`;
}

function toSelectedUrl(url) {
  const base = getBaseAssetUrl(url);
  if (!base) return '';
  return `${base}?auto=format&fit=max&w=1400&q=85`;
}

function formatAssetDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SanityMediaPicker({ open, onClose, onSelect }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/upload?ts=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({ assets: [] }));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not load Sanity CDN assets.');
      }
      setAssets(Array.isArray(data.assets) ? data.assets : []);
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch Sanity media library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSearch('');
      setError('');
      fetchAssets();
    }
  }, [open, fetchAssets]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((asset) => {
      const name = String(asset.originalFilename || '').toLowerCase();
      const id = String(asset._id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [assets, search]);

  const handleUploadNew = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrl = await uploadProductImage(file);
      const baseUrl = getBaseAssetUrl(uploadedUrl);
      const selectedUrl = toSelectedUrl(baseUrl);
      const newAsset = {
        _id: `local-${Date.now()}`,
        url: baseUrl,
        originalFilename: file.name || 'doffor-upload.jpg',
        _createdAt: new Date().toISOString(),
      };
      setAssets((prev) => [newAsset, ...prev]);
      onSelect?.(selectedUrl);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Upload to Sanity CDN failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePickAsset = (asset) => {
    const finalUrl = toSelectedUrl(asset.url);
    if (!finalUrl) return;
    onSelect?.(finalUrl);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-5xl max-h-[88vh] bg-white text-[#0B0B0C] border border-black/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/10 bg-[#F6F5F2] flex items-center justify-between gap-4 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              Sanity Global Asset CDN • mwmriieg / production
            </p>
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#0B0B0C] mt-0.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Sanity Media Library
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="p-2 border border-black/15 bg-white text-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white transition-colors"
            aria-label="Close media library"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3.5 border-b border-black/10 bg-white flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search uploaded files by filename..."
              className="w-full bg-[#F6F5F2] border border-black/15 pl-9 pr-3 py-2 text-xs text-[#0B0B0C] placeholder:text-neutral-400 focus:outline-none focus:border-[#0B0B0C] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchAssets}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-black/20 bg-white text-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadNew}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0B0B0C] text-white hover:opacity-85 text-[11px] uppercase tracking-[0.14em] font-medium transition-opacity disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload to Sanity CDN
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Asset Grid Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && assets.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#0B0B0C]" />
              <p className="text-xs uppercase tracking-[0.18em]">
                Loading Sanity CDN Assets...
              </p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-16 px-6 border border-dashed border-black/15 bg-[#F6F5F2] text-center space-y-3">
              <div className="w-11 h-11 mx-auto border border-black/15 bg-white flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#0B0B0C]">
                  {assets.length === 0
                    ? 'No Sanity CDN images uploaded yet'
                    : `No assets matching "${search}"`}
                </p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {assets.length === 0
                    ? 'Upload your first campaign banner or garment photo directly to Sanity Global CDN and reuse it across the storefront.'
                    : 'Try a different filename keyword or upload a fresh photo to Sanity CDN.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0B0C] text-white hover:opacity-85 text-[11px] uppercase tracking-[0.16em] font-medium transition-opacity disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload to Sanity CDN
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const label = asset.originalFilename || asset._id || 'Sanity Asset';
                const createdLabel = formatAssetDate(asset._createdAt);
                return (
                  <button
                    key={asset._id || asset.url}
                    type="button"
                    onClick={() => handlePickAsset(asset)}
                    className="group text-left border border-black/10 hover:border-[#0B0B0C] bg-white transition-all flex flex-col overflow-hidden focus:outline-none focus:border-[#0B0B0C]"
                  >
                    <div className="relative aspect-[3/4] w-full bg-[#F6F5F2] overflow-hidden">
                      <img
                        src={toThumbUrl(asset.url)}
                        alt={label}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#0B0B0C] text-[10px] uppercase tracking-[0.18em] font-semibold shadow-md">
                          <Check className="w-3 h-3" />
                          Select
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 border-t border-black/10 space-y-0.5 bg-white">
                      <p
                        className="text-[11px] font-medium text-[#0B0B0C] truncate"
                        title={label}
                      >
                        {label}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500 truncate">
                        {createdLabel || 'Sanity CDN'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/10 bg-[#F6F5F2] flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
          <span>
            Showing <strong className="text-[#0B0B0C]">{filteredAssets.length}</strong> of{' '}
            <strong className="text-[#0B0B0C]">{assets.length}</strong> Sanity CDN asset
            {assets.length === 1 ? '' : 's'}
          </span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider">
            Auto-optimized WebP/AVIF • w=1400 q=85
          </span>
        </div>
      </div>
    </div>
  );
}
