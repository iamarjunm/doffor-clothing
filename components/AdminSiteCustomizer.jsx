'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Layout,
  Image as ImageIcon,
  Sliders,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ExternalLink,
  Truck,
  Globe,
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { INITIAL_CONFIG } from '../lib/catalog';
import { updateStoreConfig, uploadProductImage } from '../lib/dataService';
import SanityMediaPicker from './SanityMediaPicker';

function slugifyCategoryId(val) {
  return String(val || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const THEME_PRESETS = [
  {
    name: 'Gallery White',
    theme: {
      canvasBg: '#FFFFFF',
      surfaceBg: '#F6F5F2',
      inkColor: '#0B0B0C',
      buttonBg: '#0B0B0C',
      buttonText: '#FFFFFF',
      buttonRadius: '0px',
    },
    announcementBg: '#0B0B0C',
    announcementTextColor: '#FFFFFF',
  },
  {
    name: 'Warm Stone',
    theme: {
      canvasBg: '#F7F5F0',
      surfaceBg: '#ECE8DF',
      inkColor: '#141311',
      buttonBg: '#141311',
      buttonText: '#F7F5F0',
      buttonRadius: '0px',
    },
    announcementBg: '#1F1D1A',
    announcementTextColor: '#F7F5F0',
  },
  {
    name: 'Archive Sand',
    theme: {
      canvasBg: '#FAF8F5',
      surfaceBg: '#EFECE6',
      inkColor: '#1C1917',
      buttonBg: '#292524',
      buttonText: '#FAFAF9',
      buttonRadius: '4px',
    },
    announcementBg: '#292524',
    announcementTextColor: '#FAFAF9',
  },
  {
    name: 'Crimson Accent',
    theme: {
      canvasBg: '#FFFFFF',
      surfaceBg: '#F6F5F2',
      inkColor: '#0B0B0C',
      buttonBg: '#991B1B',
      buttonText: '#FFFFFF',
      buttonRadius: '0px',
    },
    announcementBg: '#991B1B',
    announcementTextColor: '#FFFFFF',
  },
];

const SUB_TABS = [
  { id: 'theme', label: 'Theme & Brand', icon: Palette },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'hero', label: 'Hero Campaign', icon: ImageIcon },
  { id: 'sections', label: 'Homepage Sections', icon: Layout },
  { id: 'banners', label: 'Banners & Lookbook', icon: Sliders },
  { id: 'footer', label: 'Footer & Shipping', icon: Globe },
];

export default function AdminSiteCustomizer({ config, refreshStore, pushToast }) {
  const [subTab, setSubTab] = useState('theme');
  const [draft, setDraft] = useState(INITIAL_CONFIG);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [mediaPickerCallback, setMediaPickerCallback] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatIdManual, setNewCatIdManual] = useState(false);
  const [newCategory, setNewCategory] = useState({
    id: '',
    label: '',
    subtitle: '',
    spec: '',
    description: '',
    banner: '',
    showInNav: true,
  });

  const openMediaPicker = (onPick) => {
    setMediaPickerCallback(() => onPick);
  };

  useEffect(() => {
    if (config) {
      setDraft({
        ...INITIAL_CONFIG,
        ...config,
        categories:
          Array.isArray(config.categories) && config.categories.length
            ? config.categories
            : INITIAL_CONFIG.categories,
        theme: { ...INITIAL_CONFIG.theme, ...(config.theme || {}) },
        sections: { ...INITIAL_CONFIG.sections, ...(config.sections || {}) },
        hero: { ...INITIAL_CONFIG.hero, ...(config.hero || {}) },
        newArrivals: { ...INITIAL_CONFIG.newArrivals, ...(config.newArrivals || {}) },
        craftStory: { ...INITIAL_CONFIG.craftStory, ...(config.craftStory || {}) },
        privilegeBar: { ...INITIAL_CONFIG.privilegeBar, ...(config.privilegeBar || {}) },
        footer: { ...INITIAL_CONFIG.footer, ...(config.footer || {}) },
        editorialSplit:
          Array.isArray(config.editorialSplit) && config.editorialSplit.length >= 2
            ? config.editorialSplit
            : INITIAL_CONFIG.editorialSplit,
        silhouettes:
          Array.isArray(config.silhouettes) && config.silhouettes.length
            ? config.silhouettes
            : INITIAL_CONFIG.silhouettes,
        lookbookStrip:
          Array.isArray(config.lookbookStrip) && config.lookbookStrip.length
            ? config.lookbookStrip
            : INITIAL_CONFIG.lookbookStrip,
      });
    }
  }, [config]);

  const updateNested = (group, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [field]: value },
    }));
  };

  const updateArrayItem = (arrayKey, index, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] || []).map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmedLabel = newCategory.label.trim();
    if (!trimmedLabel) {
      pushToast('Category label is required.', 'error');
      return;
    }
    const slug = slugifyCategoryId(newCategory.id || trimmedLabel);
    if (!slug) {
      pushToast('Please provide a valid URL slug / ID.', 'error');
      return;
    }
    const existing = draft.categories || [];
    if (existing.some((c) => c.id === slug)) {
      pushToast(`A category with slug "${slug}" already exists.`, 'error');
      return;
    }
    const created = {
      id: slug,
      label: trimmedLabel,
      subtitle: newCategory.subtitle.trim() || 'Heavyweight Collection',
      spec: newCategory.spec.trim() || '240–280 GSM • Combed Cotton',
      description: newCategory.description.trim(),
      banner: newCategory.banner.trim() || '/images/real-bootleg-tee.jpg',
      showInNav: newCategory.showInNav !== false,
    };
    setDraft((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), created],
    }));
    setNewCategory({
      id: '',
      label: '',
      subtitle: '',
      spec: '',
      description: '',
      banner: '',
      showInNav: true,
    });
    setNewCatIdManual(false);
    setShowAddCategory(false);
    pushToast(`Added "${created.label}" — click Publish Live to save.`, 'info');
  };

  const handleMoveCategory = (index, direction) => {
    setDraft((prev) => {
      const list = [...(prev.categories || [])];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, categories: list };
    });
  };

  const handleDeleteCategory = (index) => {
    const list = draft.categories || [];
    if (list.length <= 1) {
      pushToast('At least one category must remain.', 'error');
      return;
    }
    const removed = list[index];
    setDraft((prev) => ({
      ...prev,
      categories: (prev.categories || []).filter((_, idx) => idx !== index),
    }));
    pushToast(`Removed "${removed?.label || 'category'}" — click Publish Live to save.`, 'info');
  };

  const handleImageUpload = async (file, onUrl, uploadId) => {
    if (!file) return;
    setUploadingKey(uploadId);
    try {
      const url = await uploadProductImage(file);
      onUrl(url);
      pushToast('Image uploaded and attached.');
    } catch (err) {
      pushToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setUploadingKey('');
    }
  };

  const handlePublish = async () => {
    const cleanedCategories = (draft.categories || []).map((cat, idx) => ({
      ...cat,
      id: slugifyCategoryId(cat.id || cat.label) || `category-${idx + 1}`,
      label: String(cat.label || '').trim() || `Category ${idx + 1}`,
      subtitle: String(cat.subtitle || '').trim(),
      spec: String(cat.spec || '').trim(),
      description: String(cat.description || '').trim(),
      banner: String(cat.banner || '').trim() || '/images/real-bootleg-tee.jpg',
      showInNav: cat.showInNav !== false,
    }));

    const seenIds = new Set();
    for (const cat of cleanedCategories) {
      if (seenIds.has(cat.id)) {
        pushToast(`Duplicate category slug "${cat.id}". Each category needs a unique ID.`, 'error');
        return;
      }
      seenIds.add(cat.id);
    }

    const nextDraft = {
      ...draft,
      categories: cleanedCategories.length ? cleanedCategories : INITIAL_CONFIG.categories,
    };

    setSaving(true);
    try {
      await updateStoreConfig(nextDraft);
      setDraft(nextDraft);
      await refreshStore();
      pushToast('Storefront customization published live!');
    } catch (err) {
      pushToast(err.message || 'Could not save customization.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDraft(INITIAL_CONFIG);
    pushToast('Loaded default brand settings — click Publish to save.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="card-dark p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ash">
            Visual Storefront CMS
          </p>
          <h2 className="font-display text-xl font-semibold text-bone mt-0.5">
            Site Customizer & Live Theme Studio
          </h2>
          <p className="text-xs text-ash mt-1">
            Customize brand identity, colors, hero photography, section visibility, banners, and checkout rules without touching code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn-outline py-2.5 px-4"
          >
            Preview Site <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn-outline py-2.5 px-4"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="btn-acid py-2.5 px-6"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Publish Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-tab Strip */}
      <div className="flex flex-wrap gap-2 border-b border-black/10 pb-3">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.14em] border transition-colors ${
                active
                  ? 'bg-[#0B0B0C] text-white border-[#0B0B0C] font-medium'
                  : 'bg-white text-neutral-600 border-black/15 hover:border-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ======================================================
          SUB-TAB 1: THEME & BRAND IDENTITY
         ====================================================== */}
      {subTab === 'theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Presets */}
            <div className="card-dark p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                One-Click Theme Presets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        theme: { ...preset.theme },
                        announcementBg: preset.announcementBg,
                        announcementTextColor: preset.announcementTextColor,
                      }))
                    }
                    className="p-3 bg-white border border-black/15 hover:border-black text-left transition-all space-y-2.5"
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="w-5 h-5 border border-black/15"
                        style={{ backgroundColor: preset.theme.canvasBg }}
                      />
                      <span
                        className="w-5 h-5 border border-black/15"
                        style={{ backgroundColor: preset.theme.surfaceBg }}
                      />
                      <span
                        className="w-5 h-5 border border-black/15"
                        style={{ backgroundColor: preset.theme.buttonBg }}
                      />
                    </div>
                    <p className="text-xs font-medium text-[#0B0B0C]">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand & Colors */}
            <div className="card-dark p-6 space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                Brand Wordmark & Palette
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    Navbar Wordmark
                  </label>
                  <input
                    type="text"
                    value={draft.brandWordmark || ''}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, brandWordmark: e.target.value }))
                    }
                    className="input-dark uppercase tracking-widest font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    Collection Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Core Collection / Autumn / Winter"
                    value={draft.collectionLabel || ''}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, collectionLabel: e.target.value }))
                    }
                    className="input-dark"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    Button Corner Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Sharp', val: '0px' },
                      { label: 'Subtle', val: '4px' },
                      { label: 'Pill', val: '999px' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateNested('theme', 'buttonRadius', opt.val)}
                        className={`py-2.5 text-xs border transition-colors ${
                          draft.theme?.buttonRadius === opt.val
                            ? 'bg-[#0B0B0C] text-white border-[#0B0B0C]'
                            : 'bg-white text-neutral-700 border-black/15 hover:border-black'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { key: 'canvasBg', label: 'Page BG' },
                  { key: 'surfaceBg', label: 'Cards BG' },
                  { key: 'inkColor', label: 'Text Ink' },
                  { key: 'buttonBg', label: 'Button BG' },
                  { key: 'buttonText', label: 'Button Text' },
                ].map((c) => (
                  <label key={c.key} className="block bg-white border border-black/10 p-2.5 cursor-pointer">
                    <span className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">
                      {c.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={draft.theme?.[c.key] || '#0B0B0C'}
                        onChange={(e) => updateNested('theme', c.key, e.target.value)}
                        className="w-7 h-7 cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono uppercase">
                        {draft.theme?.[c.key]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Announcement Bar */}
            <div className="card-dark p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Top Announcement Bar
                </h3>
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.announcementEnabled !== false}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, announcementEnabled: e.target.checked }))
                    }
                    className="accent-[#0B0B0C]"
                  />
                  Show Bar
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Announcement Copy
                </label>
                <input
                  type="text"
                  value={draft.announcementText || ''}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, announcementText: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between bg-white border border-black/15 px-3 py-2">
                  <span className="text-xs text-neutral-600">Bar Background</span>
                  <input
                    type="color"
                    value={draft.announcementBg || '#0B0B0C'}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, announcementBg: e.target.value }))
                    }
                    className="w-7 h-7 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between bg-white border border-black/15 px-3 py-2">
                  <span className="text-xs text-neutral-600">Bar Text Color</span>
                  <input
                    type="color"
                    value={draft.announcementTextColor || '#FFFFFF'}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, announcementTextColor: e.target.value }))
                    }
                    className="w-7 h-7 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Live Theme Preview Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 border border-black/15 overflow-hidden shadow-lg">
              <div className="px-4 py-2 bg-neutral-100 border-b border-black/10 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Live Brand Preview
              </div>
              {draft.announcementEnabled !== false && (
                <div
                  className="py-1.5 px-3 text-center text-[9px] uppercase tracking-[0.2em] truncate"
                  style={{
                    backgroundColor: draft.announcementBg,
                    color: draft.announcementTextColor,
                  }}
                >
                  {draft.announcementText}
                </div>
              )}
              <div
                className="p-6 space-y-5 transition-colors"
                style={{
                  backgroundColor: draft.theme?.canvasBg,
                  color: draft.theme?.inkColor,
                }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-black/10">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Shop • Lookbook</span>
                  <span className="font-display font-bold tracking-[0.3em] text-base">
                    {draft.brandWordmark || 'DOFFOR'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Bag (2)</span>
                </div>

                <div
                  className="p-5 space-y-3 border border-black/10"
                  style={{ backgroundColor: draft.theme?.surfaceBg }}
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] opacity-60">
                    {draft.hero?.eyebrow}
                  </p>
                  <p className="font-display font-bold text-xl leading-tight">
                    {draft.hero?.headlineLine1} {draft.hero?.headlineLine2}
                  </p>
                  <div className="flex gap-2.5 pt-2">
                    <span
                      className="px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{
                        backgroundColor: draft.theme?.buttonBg,
                        color: draft.theme?.buttonText,
                        borderRadius: draft.theme?.buttonRadius,
                      }}
                    >
                      {draft.hero?.primaryCtaLabel || 'Shop Collection'}
                    </span>
                    <span
                      className="px-4 py-2 text-[10px] uppercase tracking-[0.18em] border border-current opacity-80"
                      style={{ borderRadius: draft.theme?.buttonRadius }}
                    >
                      {draft.hero?.secondaryCtaLabel || 'Lookbook'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SUB-TAB 1B: DYNAMIC CATEGORIES MANAGER
         ====================================================== */}
      {subTab === 'categories' && (
        <div className="space-y-6">
          {/* Categories Header + Add Button */}
          <div className="card-dark p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                Storefront Categories ({(draft.categories || []).length})
              </h3>
              <p className="text-xs text-ash mt-1">
                Add, edit, reorder, or hide product categories. Published changes sync immediately to the navbar, shop filters, collection pages, and product editor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCategory((prev) => !prev)}
              className="btn-acid py-2.5 px-5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddCategory ? 'Close Form' : 'Add Category'}
            </button>
          </div>

          {/* Add New Category Form */}
          {showAddCategory && (
            <form
              onSubmit={handleAddCategory}
              className="card-dark p-6 space-y-4 border-2 border-[#0B0B0C]"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Create New Category
                </h4>
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCategory.showInNav !== false}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        showInNav: e.target.checked,
                      }))
                    }
                    className="accent-[#0B0B0C] w-4 h-4"
                  />
                  Show in Navbar
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    Category Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight Hoodies"
                    value={newCategory.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewCategory((prev) => ({
                        ...prev,
                        label: val,
                        id: newCatIdManual ? prev.id : slugifyCategoryId(val),
                      }));
                    }}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    URL Slug / ID *{' '}
                    <span className="font-mono normal-case text-neutral-400">
                      (/collections/{newCategory.id || 'slug'})
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. heavyweight-hoodies"
                    value={newCategory.id}
                    onChange={(e) => {
                      setNewCatIdManual(true);
                      setNewCategory((prev) => ({
                        ...prev,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      }));
                    }}
                    className="input-dark font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 400 GSM Heavyweight French Terry"
                    value={newCategory.subtitle}
                    onChange={(e) =>
                      setNewCategory((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                    Fabric / Spec Line
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 400 GSM • Boxy Drop-Shoulder • Garment Dyed"
                    value={newCategory.spec}
                    onChange={(e) =>
                      setNewCategory((prev) => ({ ...prev, spec: e.target.value }))
                    }
                    className="input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Collection Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Editorial description displayed on the collection page..."
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash">
                  Banner Image (URL, Sanity Upload, or Library)
                </label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  {newCategory.banner && (
                    <img
                      src={newCategory.banner}
                      alt="New category banner preview"
                      className="w-11 h-11 object-cover bg-neutral-100 border border-black/10 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="https://cdn.sanity.io/... or /images/..."
                    value={newCategory.banner}
                    onChange={(e) =>
                      setNewCategory((prev) => ({ ...prev, banner: e.target.value }))
                    }
                    className="input-dark text-xs flex-1"
                  />
                  <label className="btn-outline py-2 px-3.5 cursor-pointer shrink-0">
                    {uploadingKey === 'new-cat-banner' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(
                          e.target.files?.[0],
                          (url) => setNewCategory((prev) => ({ ...prev, banner: url })),
                          'new-cat-banner'
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker((url) => {
                        setNewCategory((prev) => ({ ...prev, banner: url }));
                        pushToast('Category banner selected from Sanity CDN.');
                      })
                    }
                    className="btn-outline py-2 px-3.5 shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Sanity Library
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCatIdManual(false);
                  }}
                  className="btn-outline py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-acid py-2 px-5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </button>
              </div>
            </form>
          )}

          {/* Existing Categories List */}
          <div className="space-y-4">
            {(draft.categories || []).map((cat, idx) => {
              const total = (draft.categories || []).length;
              return (
                <div
                  key={idx}
                  className="card-dark p-5 space-y-4"
                >
                  {/* Category Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={cat.banner || '/images/real-bootleg-tee.jpg'}
                        alt={cat.label || 'Category'}
                        className="w-12 h-14 object-cover bg-neutral-100 border border-black/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-[#0B0B0C] text-white font-mono text-[10px]">
                            #{idx + 1}
                          </span>
                          <p className="font-display font-semibold text-base text-bone truncate">
                            {cat.label || 'Untitled Category'}
                          </p>
                        </div>
                        <p className="font-mono text-[11px] text-ash mt-0.5 truncate">
                          /collections/{cat.id || 'slug'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-black/15 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cat.showInNav !== false}
                          onChange={(e) =>
                            updateArrayItem('categories', idx, 'showInNav', e.target.checked)
                          }
                          className="accent-[#0B0B0C]"
                        />
                        Show in Navbar
                      </label>

                      <button
                        type="button"
                        onClick={() => handleMoveCategory(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="btn-outline py-1.5 px-2.5 disabled:opacity-35"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(idx, 1)}
                        disabled={idx === total - 1}
                        title="Move Down"
                        className="btn-outline py-1.5 px-2.5 disabled:opacity-35"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(idx)}
                        disabled={total <= 1}
                        title={
                          total <= 1
                            ? 'At least one category must remain'
                            : 'Delete Category'
                        }
                        className="btn-outline py-1.5 px-2.5 text-red-700 hover:border-red-700 disabled:opacity-35"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Category Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                        Category Label
                      </label>
                      <input
                        type="text"
                        value={cat.label || ''}
                        onChange={(e) =>
                          updateArrayItem('categories', idx, 'label', e.target.value)
                        }
                        placeholder="e.g. Full-Sleeves"
                        className="input-dark text-xs py-2 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                        URL Slug / ID
                      </label>
                      <input
                        type="text"
                        value={cat.id || ''}
                        onChange={(e) =>
                          updateArrayItem(
                            'categories',
                            idx,
                            'id',
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                          )
                        }
                        placeholder="e.g. full-sleeves"
                        className="input-dark text-xs py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={cat.subtitle || ''}
                        onChange={(e) =>
                          updateArrayItem('categories', idx, 'subtitle', e.target.value)
                        }
                        placeholder="e.g. 260–280 GSM Heavyweight Long Sleeves"
                        className="input-dark text-xs py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                        Fabric / Spec Line
                      </label>
                      <input
                        type="text"
                        value={cat.spec || ''}
                        onChange={(e) =>
                          updateArrayItem('categories', idx, 'spec', e.target.value)
                        }
                        placeholder="e.g. 260–280 GSM • Ribbed Cuffs • Boxy Drop-Shoulder"
                        className="input-dark text-xs py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={cat.description || ''}
                      onChange={(e) =>
                        updateArrayItem('categories', idx, 'description', e.target.value)
                      }
                      placeholder="Collection page editorial description..."
                      className="input-dark text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                      Banner Image
                    </label>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="text"
                        value={cat.banner || ''}
                        onChange={(e) =>
                          updateArrayItem('categories', idx, 'banner', e.target.value)
                        }
                        placeholder="Image URL"
                        className="input-dark text-xs py-1.5 flex-1"
                      />
                      <label className="btn-outline py-1.5 px-3 cursor-pointer shrink-0">
                        {uploadingKey === `cat-banner-${idx}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(
                              e.target.files?.[0],
                              (url) => updateArrayItem('categories', idx, 'banner', url),
                              `cat-banner-${idx}`
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker((url) => {
                            updateArrayItem('categories', idx, 'banner', url);
                            pushToast('Category banner selected from Sanity CDN.');
                          })
                        }
                        className="btn-outline py-1.5 px-3 shrink-0"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Sanity Library
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="btn-acid py-2.5 px-6"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Publishing...' : 'Save & Publish Categories'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          SUB-TAB 2: HERO CAMPAIGN EDITOR
         ====================================================== */}
      {subTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
              Hero Campaign Content
            </h3>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                Eyebrow Tagline
              </label>
              <input
                type="text"
                value={draft.hero?.eyebrow || ''}
                onChange={(e) => updateNested('hero', 'eyebrow', e.target.value)}
                className="input-dark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={draft.hero?.headlineLine1 || ''}
                  onChange={(e) => updateNested('hero', 'headlineLine1', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Headline Line 2
                </label>
                <input
                  type="text"
                  value={draft.hero?.headlineLine2 || ''}
                  onChange={(e) => updateNested('hero', 'headlineLine2', e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                Hero Subcopy
              </label>
              <textarea
                rows={3}
                value={draft.hero?.description || ''}
                onChange={(e) => updateNested('hero', 'description', e.target.value)}
                className="input-dark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={draft.hero?.primaryCtaLabel || ''}
                  onChange={(e) => updateNested('hero', 'primaryCtaLabel', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={draft.hero?.primaryCtaHref || ''}
                  onChange={(e) => updateNested('hero', 'primaryCtaHref', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={draft.hero?.secondaryCtaLabel || ''}
                  onChange={(e) => updateNested('hero', 'secondaryCtaLabel', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1.5">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={draft.hero?.secondaryCtaHref || ''}
                  onChange={(e) => updateNested('hero', 'secondaryCtaHref', e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-black/10 space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.18em] text-ash">
                Hero Campaign Image (URL or Upload)
              </label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="text"
                  value={draft.hero?.image || ''}
                  onChange={(e) => updateNested('hero', 'image', e.target.value)}
                  className="input-dark flex-1"
                />
                <label className="btn-outline py-2 px-4 cursor-pointer shrink-0">
                  {uploadingKey === 'hero' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(
                        e.target.files?.[0],
                        (url) => updateNested('hero', 'image', url),
                        'hero'
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    openMediaPicker((url) => {
                      updateNested('hero', 'image', url);
                      pushToast('Hero image selected from Sanity CDN.');
                    })
                  }
                  className="btn-outline py-2 px-3.5 shrink-0"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Sanity Library
                </button>
              </div>

              <div>
                <label className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>Bottom Vignette Darkness</span>
                  <strong>{draft.hero?.overlayOpacity ?? 65}%</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={85}
                  value={draft.hero?.overlayOpacity ?? 65}
                  onChange={(e) =>
                    updateNested('hero', 'overlayOpacity', Number(e.target.value))
                  }
                  className="w-full accent-[#0B0B0C]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-black overflow-hidden border border-black/15">
              <img
                src={draft.hero?.image || '/images/hero-campaign.jpg'}
                alt="Hero Preview"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,${
                    (draft.hero?.overlayOpacity ?? 65) / 100
                  }) 0%, rgba(0,0,0,0.12) 100%)`,
                }}
              />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <p className="text-[9px] uppercase tracking-[0.24em] text-white/80">
                  {draft.hero?.eyebrow}
                </p>
                <p className="font-display font-bold text-2xl leading-tight uppercase">
                  {draft.hero?.headlineLine1}
                  <br />
                  {draft.hero?.headlineLine2}
                </p>
                <p className="text-xs text-white/75 line-clamp-2">{draft.hero?.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SUB-TAB 3: HOMEPAGE SECTIONS VISIBILITY & COPY
         ====================================================== */}
      {subTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
              Show / Hide Homepage Blocks
            </h3>
            <div className="divide-y divide-black/10">
              {[
                { key: 'showNewArrivals', label: 'New Arrivals Product Grid' },
                { key: 'showEditorialSplit', label: '50/50 Editorial Split Banners' },
                { key: 'showSilhouettes', label: 'Shop By Silhouette Directory' },
                { key: 'showCraftStory', label: 'Fabric & Construction Story' },
                { key: 'showLookbookStrip', label: 'The Lookbook 4-Column Strip' },
                { key: 'showVaultGame', label: 'The Doffor Vault (Promotional Game)' },
                { key: 'showPrivilegeBar', label: 'Promo / Privilege Callout Bar' },
              ].map((sec) => {
                const enabled = draft.sections?.[sec.key] !== false;
                return (
                  <div key={sec.key} className="py-3.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#0B0B0C]">{sec.label}</span>
                    <button
                      type="button"
                      onClick={() => updateNested('sections', sec.key, !enabled)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest border ${
                        enabled
                          ? 'bg-[#0B0B0C] text-white border-[#0B0B0C]'
                          : 'bg-white text-neutral-500 border-black/15'
                      }`}
                    >
                      {enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {enabled ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* New Arrivals Settings */}
            <div className="card-dark p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                New Arrivals Grid Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    value={draft.newArrivals?.eyebrow || ''}
                    onChange={(e) => updateNested('newArrivals', 'eyebrow', e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={draft.newArrivals?.heading || ''}
                    onChange={(e) => updateNested('newArrivals', 'heading', e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.16em] text-ash mb-1">
                    Max Products Shown
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={16}
                    value={draft.newArrivals?.maxItems || 8}
                    onChange={(e) =>
                      updateNested('newArrivals', 'maxItems', Number(e.target.value))
                    }
                    className="input-dark"
                  />
                </div>
              </div>
            </div>

            {/* Craft Story Settings */}
            <div className="card-dark p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                Fabric & Craft Story Block
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Eyebrow"
                  value={draft.craftStory?.eyebrow || ''}
                  onChange={(e) => updateNested('craftStory', 'eyebrow', e.target.value)}
                  className="input-dark"
                />
                <input
                  type="text"
                  placeholder="Heading"
                  value={draft.craftStory?.heading || ''}
                  onChange={(e) => updateNested('craftStory', 'heading', e.target.value)}
                  className="input-dark"
                />
              </div>
              <textarea
                rows={3}
                value={draft.craftStory?.body || ''}
                onChange={(e) => updateNested('craftStory', 'body', e.target.value)}
                className="input-dark"
              />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="space-y-1.5">
                    <input
                      type="text"
                      placeholder={`Stat ${n} Value`}
                      value={draft.craftStory?.[`stat${n}Value`] || ''}
                      onChange={(e) =>
                        updateNested('craftStory', `stat${n}Value`, e.target.value)
                      }
                      className="input-dark font-semibold"
                    />
                    <input
                      type="text"
                      placeholder={`Stat ${n} Label`}
                      value={draft.craftStory?.[`stat${n}Label`] || ''}
                      onChange={(e) =>
                        updateNested('craftStory', `stat${n}Label`, e.target.value)
                      }
                      className="input-dark text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Privilege Bar */}
            <div className="card-dark p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                Privilege / Promo Callout Bar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Eyebrow"
                  value={draft.privilegeBar?.eyebrow || ''}
                  onChange={(e) => updateNested('privilegeBar', 'eyebrow', e.target.value)}
                  className="input-dark"
                />
                <input
                  type="text"
                  placeholder="Heading"
                  value={draft.privilegeBar?.heading || ''}
                  onChange={(e) => updateNested('privilegeBar', 'heading', e.target.value)}
                  className="input-dark"
                />
                <input
                  type="text"
                  placeholder="Featured Code (e.g. DOFFOR10)"
                  value={draft.privilegeBar?.promoCode || ''}
                  onChange={(e) =>
                    updateNested('privilegeBar', 'promoCode', e.target.value.toUpperCase())
                  }
                  className="input-dark uppercase font-semibold"
                />
              </div>
              <textarea
                rows={2}
                value={draft.privilegeBar?.description || ''}
                onChange={(e) => updateNested('privilegeBar', 'description', e.target.value)}
                className="input-dark"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SUB-TAB 4: BANNERS, SILHOUETTES & LOOKBOOK STRIP
         ====================================================== */}
      {subTab === 'banners' && (
        <div className="space-y-6">
          {/* 50/50 Editorial Split */}
          <div className="card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
              50/50 Editorial Split Banners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(draft.editorialSplit || []).map((panel, idx) => (
                <div key={idx} className="bg-white border border-black/10 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={panel.image}
                      alt={panel.title}
                      className="w-16 h-20 object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Eyebrow"
                        value={panel.eyebrow || ''}
                        onChange={(e) =>
                          updateArrayItem('editorialSplit', idx, 'eyebrow', e.target.value)
                        }
                        className="input-dark text-xs py-1.5"
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        value={panel.title || ''}
                        onChange={(e) =>
                          updateArrayItem('editorialSplit', idx, 'title', e.target.value)
                        }
                        className="input-dark text-xs py-1.5 font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <input
                      type="text"
                      placeholder="Link (e.g. /collections/full-sleeves)"
                      value={panel.href || ''}
                      onChange={(e) =>
                        updateArrayItem('editorialSplit', idx, 'href', e.target.value)
                      }
                      className="input-dark text-xs py-1.5 flex-1"
                    />
                    <label className="btn-outline py-1.5 px-3 cursor-pointer shrink-0">
                      {uploadingKey === `split-${idx}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files?.[0],
                            (url) => updateArrayItem('editorialSplit', idx, 'image', url),
                            `split-${idx}`
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaPicker((url) => {
                          updateArrayItem('editorialSplit', idx, 'image', url);
                          pushToast('Editorial split photo selected from Sanity CDN.');
                        })
                      }
                      className="btn-outline py-1.5 px-3 shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Sanity Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Silhouette Tiles */}
          <div className="card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
              Shop By Silhouette Tiles (4 Cards)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(draft.silhouettes || []).map((tile, idx) => (
                <div key={idx} className="bg-white border border-black/10 p-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={tile.image}
                      alt={tile.title}
                      className="w-14 h-18 object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={tile.title || ''}
                        onChange={(e) =>
                          updateArrayItem('silhouettes', idx, 'title', e.target.value)
                        }
                        placeholder="Title"
                        className="input-dark text-xs py-1.5"
                      />
                      <input
                        type="text"
                        value={tile.spec || ''}
                        onChange={(e) =>
                          updateArrayItem('silhouettes', idx, 'spec', e.target.value)
                        }
                        placeholder="Fabric Spec"
                        className="input-dark text-xs py-1.5"
                      />
                      <input
                        type="text"
                        value={tile.href || ''}
                        onChange={(e) =>
                          updateArrayItem('silhouettes', idx, 'href', e.target.value)
                        }
                        placeholder="Target URL"
                        className="input-dark text-xs py-1.5 col-span-2"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <input
                      type="text"
                      value={tile.image || ''}
                      onChange={(e) =>
                        updateArrayItem('silhouettes', idx, 'image', e.target.value)
                      }
                      placeholder="Image URL"
                      className="input-dark text-xs py-1.5 flex-1"
                    />
                    <label className="btn-outline py-1.5 px-3 cursor-pointer shrink-0">
                      {uploadingKey === `sil-${idx}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}{' '}
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files?.[0],
                            (url) => updateArrayItem('silhouettes', idx, 'image', url),
                            `sil-${idx}`
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaPicker((url) => {
                          updateArrayItem('silhouettes', idx, 'image', url);
                          pushToast('Silhouette tile image selected from Sanity CDN.');
                        })
                      }
                      className="btn-outline py-1.5 px-3 shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Sanity Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Lookbook Strip Shots */}
          <div className="card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
              Homepage Lookbook Strip (4 Editorial Shots)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(draft.lookbookStrip || []).map((shot, idx) => (
                <div key={idx} className="bg-white border border-black/10 p-3 space-y-2.5">
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                    <img src={shot.src} alt={shot.caption} className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    value={shot.caption || ''}
                    onChange={(e) =>
                      updateArrayItem('lookbookStrip', idx, 'caption', e.target.value)
                    }
                    placeholder="Caption"
                    className="input-dark text-xs py-1.5"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="btn-outline w-full py-1.5 px-2.5 cursor-pointer text-center">
                      {uploadingKey === `lb-${idx}` ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}{' '}
                      Replace Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files?.[0],
                            (url) => updateArrayItem('lookbookStrip', idx, 'src', url),
                            `lb-${idx}`
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaPicker((url) => {
                          updateArrayItem('lookbookStrip', idx, 'src', url);
                          pushToast('Lookbook shot selected from Sanity CDN.');
                        })
                      }
                      className="btn-outline w-full py-1.5 px-2.5 text-center"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Sanity Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SUB-TAB 5: FOOTER, SOCIALS & CHECKOUT SHIPPING RULES
         ====================================================== */}
      {subTab === 'footer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
              Footer Bio & Social Links
            </h3>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                Brand Bio
              </label>
              <textarea
                rows={3}
                value={draft.footer?.bio || ''}
                onChange={(e) => updateNested('footer', 'bio', e.target.value)}
                className="input-dark"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={draft.footer?.supportEmail || ''}
                  onChange={(e) => updateNested('footer', 'supportEmail', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={draft.footer?.copyright || ''}
                  onChange={(e) => updateNested('footer', 'copyright', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={draft.footer?.instagramUrl || ''}
                  onChange={(e) => updateNested('footer', 'instagramUrl', e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={draft.footer?.youtubeUrl || ''}
                  onChange={(e) => updateNested('footer', 'youtubeUrl', e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>
          </div>

          <div className="card-dark p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] flex items-center gap-2">
              <Truck className="w-4 h-4" /> Checkout & Shipping Rules
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  Free Shipping Above (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.freeShippingThreshold ?? 1499}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      freeShippingThreshold: Number(e.target.value),
                    }))
                  }
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  Standard Shipping (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.standardShippingFee ?? 79}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      standardShippingFee: Number(e.target.value),
                    }))
                  }
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  Express 48hr Air (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.expressShippingFee ?? 99}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      expressShippingFee: Number(e.target.value),
                    }))
                  }
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-ash mb-1">
                  COD Handling Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.codFee ?? 49}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, codFee: Number(e.target.value) }))
                  }
                  className="input-dark"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3.5 bg-white border border-black/15 cursor-pointer">
              <div>
                <p className="text-xs font-medium text-[#0B0B0C]">Enable Cash on Delivery (COD)</p>
                <p className="text-[11px] text-neutral-500">
                  Disable to make checkout Razorpay prepaid-only.
                </p>
              </div>
              <input
                type="checkbox"
                checked={draft.codEnabled !== false}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, codEnabled: e.target.checked }))
                }
                className="w-4 h-4 accent-[#0B0B0C]"
              />
            </label>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="btn-acid w-full"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Publishing...' : 'Save & Publish All Site Customizations'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SanityMediaPicker
        open={Boolean(mediaPickerCallback)}
        onClose={() => setMediaPickerCallback(null)}
        onSelect={(url) => {
          if (typeof mediaPickerCallback === 'function') {
            mediaPickerCallback(url);
          }
          setMediaPickerCallback(null);
        }}
      />
    </div>
  );
}
