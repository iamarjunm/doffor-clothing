'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Tag,
  Users,
  ShieldAlert,
  Lock,
  Unlock,
  RefreshCw,
  Database,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  Star,
  Check,
  Copy,
  Truck,
  CreditCard,
  Mail,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sliders,
  Clock,
  ExternalLink,
  Save,
  Palette,
  Image as ImageIcon,
  UserCog,
  MapPin,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import AdminSiteCustomizer from '../../components/AdminSiteCustomizer';
import SanityMediaPicker from '../../components/SanityMediaPicker';
import { DofforLoader } from '../../components/DofforLoader';
import {
  fetchProducts,
  saveProduct,
  updateProductStock,
  deleteProductById,
  uploadProductImage,
  fetchAllOrders,
  updateOrderById,
  fetchCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCouponById,
  fetchAllUsers,
  updateUserRole,
  fetchInquiries,
  fetchNewsletterList,
  updateStoreConfig,
  seedFirestoreCatalog,
  getBackendMode,
} from '../../lib/dataService';
import {
  formatINR,
  formatDate,
  getTotalStock,
  ORDER_STATUS_META,
} from '../../lib/format';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const CATEGORIES = [
  { value: 'full-sleeves', label: 'Full-Sleeves' },
  { value: 'oversized-tees', label: 'Oversized Tees' },
  { value: 'muscle-tanks', label: 'Muscle Tanks' },
  { value: 'limited-drops', label: 'Limited Drops' },
];

const FIT_OPTIONS = [
  'Boxy Oversized',
  'Extra Boxy Oversized',
  'Boxy Sleeveless',
];

const GSM_OPTIONS = [240, 260, 280];

const ORDER_STATUSES = [
  'processing',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

const EMPTY_PRODUCT_FORM = {
  id: '',
  slug: '',
  name: '',
  sku: '',
  subtitle: '',
  category: 'oversized-tees',
  price: 999,
  compareAtPrice: 1499,
  gsm: 260,
  fit: 'Boxy Oversized',
  fabric: '100% Super-Combed Bio-Washed Cotton',
  printTech: 'High-Density Vintage Screen Print',
  badgesText: 'DROP 04',
  description: '',
  highlightsText: '',
  featured: false,
  isNewDrop: true,
  bestseller: false,
  active: true,
  colors: [{ name: 'Jet Black', hex: '#121215', image: '' }],
  sizes: { S: 10, M: 20, L: 20, XL: 15, XXL: 5 },
  images: [],
  rating: 5.0,
  reviewCount: 0,
  reviews: [],
};

function isoToDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(val) {
  if (!val) return new Date().toISOString();
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function getLowStockSizes(sizes = {}) {
  return SIZES.filter((sz) => (Number(sizes?.[sz]) || 0) <= 5).map((sz) => ({
    size: sz,
    qty: Number(sizes?.[sz]) || 0,
  }));
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading, isFirebaseConfigured, loginWithEmail } = useAuth();
  const { config, pushToast, refreshStore } = useStore();

  const backendMode = getBackendMode();

  // Navigation & Loading
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [unlockingDemo, setUnlockingDemo] = useState(false);

  // Core Admin Datasets
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [newsletter, setNewsletter] = useState([]);

  // Products Tab State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  // Orders Tab State
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDrafts, setOrderDrafts] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [savingOrderId, setSavingOrderId] = useState(null);

  // Inventory Tab State
  const [stockDrafts, setStockDrafts] = useState({});
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryOnlyLow, setInventoryOnlyLow] = useState(false);
  const [savingStockId, setSavingStockId] = useState(null);

  // Coupons & Storefront Tab State
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent',
    value: 15,
    minOrder: 999,
    maxDiscount: 500,
    description: '',
  });
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [configForm, setConfigForm] = useState({
    announcementText: '',
    dropTitle: '',
    dropCountdownEnd: '',
    freeShippingThreshold: 1499,
    expressShippingFee: 99,
    codFee: 49,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Customers Tab State
  const [userSearch, setUserSearch] = useState('');
  const [updatingRoleUid, setUpdatingRoleUid] = useState(null);
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Sync storefront config form when config updates
  useEffect(() => {
    if (config) {
      setConfigForm({
        announcementText: config.announcementText || '',
        dropTitle: config.dropTitle || '',
        dropCountdownEnd: isoToDatetimeLocal(config.dropCountdownEnd),
        freeShippingThreshold: Number(config.freeShippingThreshold) || 1499,
        expressShippingFee: Number(config.expressShippingFee) || 99,
        codFee: Number(config.codFee) || 49,
      });
    }
  }, [config]);

  const loadAllData = useCallback(
    async ({ silent = false } = {}) => {
      setDataLoading(true);
      try {
        const [prods, ords, cpns, usrs, inqs, news] = await Promise.all([
          fetchProducts({ includeInactive: true }),
          fetchAllOrders(),
          fetchCoupons(),
          fetchAllUsers(),
          fetchInquiries(),
          fetchNewsletterList(),
        ]);
        setProducts(prods || []);
        setOrders(ords || []);
        setCoupons(cpns || []);
        setUsers(usrs || []);
        setInquiries(inqs || []);
        setNewsletter(news || []);

        // Initialize stock drafts
        const nextStockDrafts = {};
        (prods || []).forEach((p) => {
          nextStockDrafts[p.id] = {
            S: Number(p.sizes?.S) || 0,
            M: Number(p.sizes?.M) || 0,
            L: Number(p.sizes?.L) || 0,
            XL: Number(p.sizes?.XL) || 0,
            XXL: Number(p.sizes?.XXL) || 0,
          };
        });
        setStockDrafts(nextStockDrafts);

        // Initialize order fulfillment drafts & default expand latest 3
        const nextOrderDrafts = {};
        const nextExpanded = {};
        (ords || []).forEach((o, idx) => {
          nextOrderDrafts[o.id] = {
            status: o.status || 'processing',
            trackingNumber: o.trackingNumber || '',
          };
          if (idx < 3) nextExpanded[o.id] = true;
        });
        setOrderDrafts(nextOrderDrafts);
        setExpandedOrders((prev) =>
          Object.keys(prev).length ? prev : nextExpanded
        );

        if (!silent) {
          pushToast('Command center data synced.', 'success');
        }
      } catch (err) {
        console.error('[Admin Load Error]', err);
        pushToast(err.message || 'Failed to sync admin data.', 'error');
      } finally {
        setDataLoading(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    if (isAdmin) {
      loadAllData({ silent: true });
    }
  }, [isAdmin, loadAllData]);

  // ======================================================
  // COMPUTED METRICS & ANALYTICS
  // ======================================================
  const analytics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const grossRevenue = validOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const activeListings = products.filter((p) => p.active !== false).length;
    const avgOrderValue = validOrders.length
      ? Math.round(grossRevenue / validOrders.length)
      : 0;

    const lowStockProducts = products
      .map((p) => ({
        ...p,
        lowSizes: getLowStockSizes(p.sizes),
        totalStock: getTotalStock(p.sizes),
      }))
      .filter((p) => p.lowSizes.length > 0);

    // Revenue by Category
    const productById = new Map(products.map((p) => [p.id, p]));
    const catTotals = {
      'full-sleeves': { label: 'Full-Sleeves', revenue: 0, units: 0 },
      'oversized-tees': { label: 'Oversized Tees', revenue: 0, units: 0 },
      'muscle-tanks': { label: 'Muscle Tanks', revenue: 0, units: 0 },
      'limited-drops': { label: 'Limited Drops', revenue: 0, units: 0 },
    };

    let totalItemRevenue = 0;
    validOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const prod = productById.get(item.productId);
        const catKey =
          prod?.category && catTotals[prod.category]
            ? prod.category
            : 'oversized-tees';
        const lineRev = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        catTotals[catKey].revenue += lineRev;
        catTotals[catKey].units += Number(item.quantity) || 1;
        totalItemRevenue += lineRev;
      });
    });

    const categoryBreakdown = Object.entries(catTotals)
      .map(([key, data]) => ({
        key,
        ...data,
        percent:
          totalItemRevenue > 0
            ? Math.round((data.revenue / totalItemRevenue) * 100)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Order Status Distribution
    const statusCounts = {};
    ORDER_STATUSES.forEach((st) => {
      statusCounts[st] = 0;
    });
    orders.forEach((o) => {
      const st = o.status || 'processing';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    const pendingCount =
      (statusCounts.processing || 0) +
      (statusCounts.confirmed || 0) +
      (statusCounts.packed || 0);

    return {
      grossRevenue,
      totalOrders: orders.length,
      validOrdersCount: validOrders.length,
      activeListings,
      registeredCustomers: users.length,
      avgOrderValue,
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
      categoryBreakdown,
      statusCounts,
      pendingCount,
    };
  }, [orders, products, users]);

  // ======================================================
  // FILTERED LISTS
  // ======================================================
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat =
        productCategoryFilter === 'all' || p.category === productCategoryFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.sku || '').toLowerCase().includes(q) ||
        String(p.subtitle || '').toLowerCase().includes(q)
      );
    });
  }, [products, productSearch, productCategoryFilter]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus =
        orderStatusFilter === 'all' || o.status === orderStatusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        String(o.orderNumber || '').toLowerCase().includes(q) ||
        String(o.customerName || '').toLowerCase().includes(q) ||
        String(o.customerEmail || '').toLowerCase().includes(q) ||
        String(o.razorpayPaymentId || '').toLowerCase().includes(q) ||
        String(o.trackingNumber || '').toLowerCase().includes(q)
      );
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const filteredInventory = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    return products.filter((p) => {
      if (inventoryOnlyLow && getLowStockSizes(p.sizes).length === 0) {
        return false;
      }
      if (!q) return true;
      return (
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.sku || '').toLowerCase().includes(q)
      );
    });
  }, [products, inventorySearch, inventoryOnlyLow]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.city || '').toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // ======================================================
  // HANDLERS
  // ======================================================
  const handleEnterDemoAdmin = async () => {
    setUnlockingDemo(true);
    try {
      await loginWithEmail({
        email: 'admin@doffor.in',
        password: 'DofforAdmin@2026',
      });
      pushToast('Demo Admin Command Center unlocked.', 'success');
    } catch (err) {
      pushToast(err.message || 'Could not unlock demo admin.', 'error');
    } finally {
      setUnlockingDemo(false);
    }
  };

  const handleSeedFirestore = async () => {
    setSeeding(true);
    try {
      await seedFirestoreCatalog();
      await Promise.all([loadAllData({ silent: true }), refreshStore()]);
      pushToast('Firestore seeded with flagship Drop 04 catalog & coupons.', 'success');
    } catch (err) {
      pushToast(err.message || 'Firestore seed failed.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([loadAllData(), refreshStore()]);
  };

  // Product CRUD Handlers
  const openCreateProductModal = () => {
    setProductForm({
      ...EMPTY_PRODUCT_FORM,
      sku: `DFR-D04-${Math.floor(1000 + Math.random() * 9000)}`,
      colors: [{ name: 'Jet Black', hex: '#121215', image: '' }],
      sizes: { S: 12, M: 24, L: 20, XL: 14, XXL: 6 },
      images: [],
    });
    setNewImageUrl('');
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setProductForm({
      id: prod.id || '',
      slug: prod.slug || '',
      name: prod.name || '',
      sku: prod.sku || '',
      subtitle: prod.subtitle || '',
      category: prod.category || 'oversized-tees',
      price: Number(prod.price) || 999,
      compareAtPrice: Number(prod.compareAtPrice) || 1499,
      gsm: Number(prod.gsm) || 260,
      fit: prod.fit || 'Boxy Oversized',
      fabric: prod.fabric || '100% Super-Combed Bio-Washed Cotton',
      printTech: prod.printTech || 'High-Density Vintage Screen Print',
      badgesText: Array.isArray(prod.badges) ? prod.badges.join(', ') : '',
      description: prod.description || '',
      highlightsText: Array.isArray(prod.highlights)
        ? prod.highlights.join('\n')
        : '',
      featured: Boolean(prod.featured),
      isNewDrop: prod.isNewDrop !== false,
      bestseller: Boolean(prod.bestseller),
      active: prod.active !== false,
      colors:
        Array.isArray(prod.colors) && prod.colors.length
          ? prod.colors.map((c) => ({
              name: c.name || '',
              hex: c.hex || '#121215',
              image: c.image || '',
            }))
          : [{ name: 'Jet Black', hex: '#121215', image: prod.images?.[0] || '' }],
      sizes: {
        S: Number(prod.sizes?.S) || 0,
        M: Number(prod.sizes?.M) || 0,
        L: Number(prod.sizes?.L) || 0,
        XL: Number(prod.sizes?.XL) || 0,
        XXL: Number(prod.sizes?.XXL) || 0,
      },
      images: Array.isArray(prod.images) ? [...prod.images] : [],
      rating: Number(prod.rating) || 5.0,
      reviewCount: Number(prod.reviewCount) || 0,
      reviews: Array.isArray(prod.reviews) ? prod.reviews : [],
    });
    setNewImageUrl('');
    setProductModalOpen(true);
  };

  const handleUploadImageFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        pushToast(
          `Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} to Sanity CDN.`,
          'success'
        );
      }
    } catch (err) {
      pushToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setNewImageUrl('');
  };

  const handleSelectSanityMedia = (url) => {
    if (!url) return;
    if (mediaPickerTarget && typeof mediaPickerTarget === 'object' && mediaPickerTarget.type === 'colorway') {
      handleColorChange(mediaPickerTarget.index, 'image', url);
      pushToast('Colorway image selected from Sanity CDN Library.', 'success');
    } else {
      setProductForm((prev) => ({
        ...prev,
        images: prev.images.includes(url) ? prev.images : [...prev.images, url],
      }));
      pushToast('Added photo from Sanity CDN Library.', 'success');
    }
    setMediaPickerTarget(null);
  };

  const handleRemoveImage = (index) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setProductForm((prev) => {
      if (index <= 0 || index >= prev.images.length) return prev;
      const selected = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: [selected, ...rest] };
    });
  };

  const handleColorChange = (index, field, value) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleAddColorway = () => {
    setProductForm((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          name: '',
          hex: '#27272A',
          image: prev.images[0] || '',
        },
      ],
    }));
  };

  const handleRemoveColorway = (index) => {
    setProductForm((prev) => ({
      ...prev,
      colors:
        prev.colors.length > 1
          ? prev.colors.filter((_, i) => i !== index)
          : prev.colors,
    }));
  };

  const handleSaveProductForm = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      pushToast('Product name is required.', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      const badges = productForm.badgesText
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);
      const highlights = productForm.highlightsText
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean);

      const primaryImage =
        productForm.images[0] || '/images/product-angel-fullsleeve.jpg';
      const cleanedColors = productForm.colors
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          hex: c.hex || '#121215',
          image: c.image?.trim() || primaryImage,
        }));

      const payload = {
        id: productForm.id || undefined,
        slug: productForm.slug || undefined,
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        subtitle: productForm.subtitle.trim(),
        category: productForm.category,
        price: Number(productForm.price) || 999,
        compareAtPrice: Number(productForm.compareAtPrice) || 1499,
        gsm: Number(productForm.gsm) || 260,
        fit: productForm.fit,
        fabric: productForm.fabric.trim(),
        printTech: productForm.printTech.trim(),
        badges,
        description: productForm.description.trim(),
        highlights,
        featured: Boolean(productForm.featured),
        isNewDrop: Boolean(productForm.isNewDrop),
        bestseller: Boolean(productForm.bestseller),
        active: Boolean(productForm.active),
        images: productForm.images.length ? productForm.images : [primaryImage],
        colors: cleanedColors.length
          ? cleanedColors
          : [{ name: 'Jet Black', hex: '#121215', image: primaryImage }],
        sizes: {
          S: Math.max(0, Number(productForm.sizes.S) || 0),
          M: Math.max(0, Number(productForm.sizes.M) || 0),
          L: Math.max(0, Number(productForm.sizes.L) || 0),
          XL: Math.max(0, Number(productForm.sizes.XL) || 0),
          XXL: Math.max(0, Number(productForm.sizes.XXL) || 0),
        },
        rating: productForm.rating,
        reviewCount: productForm.reviewCount,
        reviews: productForm.reviews,
      };

      await saveProduct(payload);
      await Promise.all([loadAllData({ silent: true }), refreshStore()]);
      setProductModalOpen(false);
      pushToast(
        productForm.id
          ? `Updated "${payload.name}" across live storefront.`
          : `Launched "${payload.name}" on storefront.`,
        'success'
      );
    } catch (err) {
      pushToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleQuickToggleProduct = async (product, field) => {
    try {
      const nextValue = !product[field];
      await saveProduct({ ...product, [field]: nextValue });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, [field]: nextValue } : p))
      );
      await refreshStore();
      pushToast(
        `${product.name}: ${field === 'active' ? (nextValue ? 'Active' : 'Hidden') : nextValue ? 'Featured' : 'Unfeatured'}.`,
        'success'
      );
    } catch (err) {
      pushToast(err.message || 'Toggle failed.', 'error');
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    try {
      await deleteProductById(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setConfirmDeleteId(null);
      await refreshStore();
      pushToast(`Deleted "${name}" from catalog.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  // Orders Handlers
  const handleSaveOrderFulfillment = async (orderId) => {
    const draft = orderDrafts[orderId];
    if (!draft) return;
    setSavingOrderId(orderId);
    try {
      await updateOrderById(orderId, {
        status: draft.status,
        trackingNumber: draft.trackingNumber.trim(),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: draft.status,
                trackingNumber: draft.trackingNumber.trim(),
              }
            : o
        )
      );
      pushToast('Order fulfillment & tracking saved.', 'success');
    } catch (err) {
      pushToast(err.message || 'Failed to update order.', 'error');
    } finally {
      setSavingOrderId(null);
    }
  };

  // Inventory Handlers
  const handleStockDraftChange = (productId, size, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setStockDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }),
        [size]: num,
      },
    }));
  };

  const handleSaveProductStock = async (product) => {
    const draft = stockDrafts[product.id];
    if (!draft) return;
    setSavingStockId(product.id);
    try {
      await updateProductStock(product.id, draft);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, sizes: { ...draft } } : p))
      );
      await refreshStore();
      pushToast(`Inventory updated for ${product.sku || product.name}.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Failed to update stock.', 'error');
    } finally {
      setSavingStockId(null);
    }
  };

  // Coupons & Storefront Handlers
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      pushToast('Enter a promo code.', 'error');
      return;
    }
    setCreatingCoupon(true);
    try {
      const created = await createCoupon(couponForm);
      setCoupons((prev) => [created, ...prev]);
      setCouponForm({
        code: '',
        type: 'percent',
        value: 15,
        minOrder: 999,
        maxDiscount: 500,
        description: '',
      });
      pushToast(`Promo code ${created.code} activated.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Could not create coupon.', 'error');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (cpn) => {
    try {
      const next = !cpn.active;
      await toggleCouponStatus(cpn.id, next);
      setCoupons((prev) =>
        prev.map((c) => (c.id === cpn.id ? { ...c, active: next } : c))
      );
      pushToast(`${cpn.code} ${next ? 'enabled' : 'paused'}.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Could not toggle coupon.', 'error');
    }
  };

  const handleDeleteCoupon = async (cpn) => {
    try {
      await deleteCouponById(cpn.id);
      setCoupons((prev) => prev.filter((c) => c.id !== cpn.id));
      pushToast(`Deleted coupon ${cpn.code}.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Could not delete coupon.', 'error');
    }
  };

  const handleSaveStorefrontConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateStoreConfig({
        announcementText: configForm.announcementText.trim(),
        dropTitle: configForm.dropTitle.trim(),
        dropCountdownEnd: datetimeLocalToIso(configForm.dropCountdownEnd),
        freeShippingThreshold: Number(configForm.freeShippingThreshold) || 1499,
        expressShippingFee: Number(configForm.expressShippingFee) || 99,
        codFee: Number(configForm.codFee) || 49,
      });
      await refreshStore();
      pushToast('Live storefront settings published!', 'success');
    } catch (err) {
      pushToast(err.message || 'Failed to update storefront config.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Users & Newsletter Handlers
  const handleToggleUserRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    setUpdatingRoleUid(targetUser.uid);
    try {
      await updateUserRole(targetUser.uid, nextRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid ? { ...u, role: nextRole } : u
        )
      );
      pushToast(
        `${targetUser.name || targetUser.email} is now ${nextRole.toUpperCase()}.`,
        'success'
      );
    } catch (err) {
      pushToast(err.message || 'Failed to update role.', 'error');
    } finally {
      setUpdatingRoleUid(null);
    }
  };

  const handleCopyAllEmails = async () => {
    if (!newsletter.length) {
      pushToast('No subscribers to copy.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(newsletter.join(', '));
      setCopiedEmails(true);
      pushToast(`Copied ${newsletter.length} subscriber emails.`, 'success');
      setTimeout(() => setCopiedEmails(false), 2500);
    } catch {
      pushToast('Clipboard access unavailable.', 'error');
    }
  };

  // ======================================================
  // LOADING GATE
  // ======================================================
  if (authLoading) {
    return <DofforLoader label="Verifying Admin Access" fullScreen />;
  }

  // ======================================================
  // 1. STRICT ROLE-BASED ACCESS GATE (NO SELF-SERVICE LOGIN)
  // ======================================================
  if (!isAdmin) {
    return (
      <div className="min-h-[78vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg card-dark p-8 sm:p-10 space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-red-700">
              <ShieldAlert className="w-4 h-4" />
              Access Restricted — 403
            </span>
            <Lock className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-bone">
              Administrator Access Only
            </h1>
            <p className="text-sm text-ash leading-relaxed">
              The Doffor Admin Panel is accessible only to accounts assigned the{' '}
              <strong className="text-bone">admin</strong> role. Sign in normally with your
              authorized account and open Admin Panel from your profile menu.
            </p>
          </div>

          {user && (
            <div className="p-3.5 bg-white border border-black/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Signed in as
                </p>
                <p className="text-xs font-medium text-bone truncate mt-0.5">
                  {user.name} ({user.email})
                </p>
              </div>
              <span className="px-2.5 py-1 bg-neutral-100 text-[10px] uppercase tracking-wider text-neutral-600 shrink-0">
                {user.role || 'customer'}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!user && (
              <Link href="/auth" className="btn-acid flex-1">
                Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link href="/" className={user ? 'btn-acid flex-1' : 'btn-outline flex-1'}>
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // NAV TABS DEFINITION
  // ======================================================
  const NAV_TABS = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'customizer',
      label: 'Site Customizer',
      icon: Palette,
      badge: 'CMS',
      badgeTone: 'acid',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: products.length,
    },
    {
      id: 'orders',
      label: 'Orders & Fulfillment',
      icon: ShoppingBag,
      badge: analytics.pendingCount > 0 ? analytics.pendingCount : orders.length,
      badgeTone: analytics.pendingCount > 0 ? 'acid' : 'muted',
    },
    {
      id: 'inventory',
      label: 'Inventory Matrix',
      icon: Boxes,
      badge: analytics.lowStockCount > 0 ? analytics.lowStockCount : null,
      badgeTone: 'crimson',
    },
    {
      id: 'coupons',
      label: 'Coupons & Storefront',
      icon: Tag,
      badge: coupons.length,
    },
    {
      id: 'customers',
      label: 'Customers & Inquiries',
      icon: Users,
      badge: users.length,
    },
  ];

  // ======================================================
  // MAIN ADMIN SHELL
  // ======================================================
  return (
    <div className="min-h-screen bg-obsidian text-bone pb-20">
      {/* ================================================== */}
      {/* 2. TOP COMMAND BAR                                 */}
      {/* ================================================== */}
      <header className="sticky top-0 z-30 glass-dark border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-sm bg-acid text-obsidian flex items-center justify-center font-display font-black text-lg">
              D
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-extrabold text-base sm:text-lg tracking-tight uppercase text-bone">
                  DOFFOR COMMAND CENTER
                </h1>
                {backendMode === 'firebase' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    FIREBASE FIRESTORE LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-50 border border-amber-300 text-amber-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    LOCAL PREVIEW MODE (ADD FIREBASE ENV)
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-ash">
                Signed in as <span className="text-bone font-medium">{user?.name}</span> ({user?.email})
                {backendMode === 'firebase' && (
                  <>
                    {' '}• Provider: <span className="text-bone uppercase">{user?.provider || 'unknown'}</span>
                    {' '}• Verified:{' '}
                    <span className={user?.emailVerified ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {user?.emailVerified ? 'YES' : 'NO'}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isFirebaseConfigured && (
              <button
                type="button"
                onClick={handleSeedFirestore}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-pulse' : ''}`} />
                {seeding ? 'Seeding...' : 'Seed Firestore Catalog'}
              </button>
            )}

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={dataLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-surface border border-white/15 hover:border-acid text-bone hover:text-acid font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-white/[0.03] border border-white/15 hover:border-bone text-ash hover:text-bone font-mono text-[11px] uppercase tracking-wider transition-colors"
            >
              Storefront
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {backendMode === 'firebase' && user && !user.emailVerified && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Unverified Email Session:</strong> Firestore security rules require a verified Google Sign-In (<code>emailVerified: true</code>) for bootstrap admin writes. Sign out and sign in using <strong>Continue with Google</strong> with <code>arjunhero38@gmail.com</code>.
              </span>
            </div>
            <Link href="/auth" className="btn-acid py-1.5 px-3 text-[10px]">
              Switch to Google Sign-In
            </Link>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 3. SIDEBAR + MAIN WORKSPACE                        */}
      {/* ================================================== */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation (Desktop) & Scrollable Pills (Mobile) */}
        <aside className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-sm font-mono text-xs uppercase tracking-wider transition-all shrink-0 text-left border ${
                      active
                        ? 'bg-acid text-obsidian border-acid font-bold shadow-[0_0_24px_rgba(232,255,42,0.18)]'
                        : 'bg-charcoal/80 text-ash border-white/[0.06] hover:border-white/20 hover:text-bone'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </span>
                    {tab.badge !== null && (
                      <span
                        className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                          active
                            ? 'bg-obsidian text-acid'
                            : tab.badgeTone === 'crimson'
                            ? 'bg-crimson/20 text-crimson border border-crimson/30'
                            : tab.badgeTone === 'acid'
                            ? 'bg-acid/15 text-acid border border-acid/30'
                            : 'bg-white/10 text-bone'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mini Ops Status Card */}
            <div className="hidden lg:block card-dark p-4 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                SYSTEM TELEMETRY
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ash">Catalog SKUs</span>
                  <span className="font-mono text-bone">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">Pending Dispatch</span>
                  <span className="font-mono text-acid">{analytics.pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">Low Stock Alerts</span>
                  <span
                    className={`font-mono ${
                      analytics.lowStockCount > 0 ? 'text-crimson' : 'text-emerald-400'
                    }`}
                  >
                    {analytics.lowStockCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">Payment Gateway</span>
                  <span className="font-mono text-emerald-400">Razorpay</span>
                </div>
              </div>
              <button
                type="button"
                onClick={openCreateProductModal}
                className="btn-acid w-full py-2.5 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                NEW DROP SKU
              </button>
            </div>
          </div>
        </aside>

        {/* Main Tab Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* ================================================ */}
          {/* TAB 0: VISUAL SITE CUSTOMIZER (CMS)              */}
          {/* ================================================ */}
          {activeTab === 'customizer' && (
            <AdminSiteCustomizer
              config={config}
              refreshStore={refreshStore}
              pushToast={pushToast}
            />
          )}

          {/* ================================================ */}
          {/* TAB 1: OVERVIEW                                  */}
          {/* ================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 6 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="card-dark p-5 relative overflow-hidden group hover:border-acid/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Gross Revenue
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-acid/15 text-acid flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-extrabold text-bone tracking-tight">
                    {formatINR(analytics.grossRevenue)}
                  </p>
                  <p className="font-mono text-[11px] text-emerald-400 mt-1.5">
                    {analytics.validOrdersCount} fulfilled & active orders
                  </p>
                </div>

                <div className="card-dark p-5 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Total Orders
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-cyan-500/15 text-cyan-300 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-extrabold text-bone tracking-tight">
                    {analytics.totalOrders}
                  </p>
                  <p className="font-mono text-[11px] text-ash mt-1.5">
                    <span className="text-acid">{analytics.pendingCount}</span> awaiting
                    shipment
                  </p>
                </div>

                <div className="card-dark p-5 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Active Listings
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-extrabold text-bone tracking-tight">
                    {analytics.activeListings}
                    <span className="text-base font-mono text-ash font-normal ml-1.5">
                      / {products.length}
                    </span>
                  </p>
                  <p className="font-mono text-[11px] text-ash mt-1.5">
                    Live across Drop 04 catalog
                  </p>
                </div>

                <div className="card-dark p-5 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Registered Customers
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-extrabold text-bone tracking-tight">
                    {analytics.registeredCustomers}
                  </p>
                  <p className="font-mono text-[11px] text-ash mt-1.5">
                    {newsletter.length} newsletter subscribers
                  </p>
                </div>

                <div className="card-dark p-5 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Average Order Value
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-amber-500/15 text-amber-300 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-extrabold text-bone tracking-tight">
                    {formatINR(analytics.avgOrderValue)}
                  </p>
                  <p className="font-mono text-[11px] text-ash mt-1.5">
                    Free ship threshold: {formatINR(config?.freeShippingThreshold || 1499)}
                  </p>
                </div>

                <div
                  className={`card-dark p-5 transition-colors ${
                    analytics.lowStockCount > 0
                      ? 'border-crimson/40 bg-crimson/[0.04]'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ash">
                      Low-Stock SKU Alerts
                    </span>
                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                        analytics.lowStockCount > 0
                          ? 'bg-crimson/20 text-crimson'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <p
                    className={`font-display text-3xl font-extrabold tracking-tight ${
                      analytics.lowStockCount > 0 ? 'text-crimson' : 'text-bone'
                    }`}
                  >
                    {analytics.lowStockCount}
                  </p>
                  <p className="font-mono text-[11px] text-ash mt-1.5">
                    SKUs with any size ≤ 5 units
                  </p>
                </div>
              </div>

              {/* Revenue by Category + Order Status Distribution */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Revenue by Category */}
                <div className="xl:col-span-7 card-dark p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-display font-bold text-lg uppercase text-bone">
                        Revenue by Category
                      </h2>
                      <p className="font-mono text-[11px] text-ash">
                        Item-level sales performance across silhouettes
                      </p>
                    </div>
                    <span className="font-mono text-[11px] uppercase text-acid px-2.5 py-1 rounded-sm bg-acid/10 border border-acid/25">
                      LIVE BREAKDOWN
                    </span>
                  </div>

                  <div className="space-y-4">
                    {analytics.categoryBreakdown.map((cat) => (
                      <div key={cat.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-bone flex items-center gap-2">
                            {cat.label}
                            <span className="font-mono text-[10px] text-ash">
                              ({cat.units} unit{cat.units === 1 ? '' : 's'})
                            </span>
                          </span>
                          <span className="font-mono text-bone">
                            {formatINR(cat.revenue)}{' '}
                            <span className="text-acid ml-1">{cat.percent}%</span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-obsidian rounded-sm overflow-hidden border border-white/[0.06]">
                          <div
                            className="h-full bg-gradient-to-r from-acid/70 to-acid transition-all duration-500"
                            style={{ width: `${Math.max(cat.percent, cat.revenue > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="xl:col-span-5 card-dark p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-display font-bold text-lg uppercase text-bone">
                        Order Pipeline
                      </h2>
                      <p className="font-mono text-[11px] text-ash">
                        Click a stage to filter fulfillment queue
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {ORDER_STATUSES.map((st) => {
                      const meta = ORDER_STATUS_META[st] || {
                        label: st,
                        color: 'bg-white/10 text-bone border-white/20',
                      };
                      const count = analytics.statusCounts[st] || 0;
                      const pct = orders.length
                        ? Math.round((count / orders.length) * 100)
                        : 0;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setOrderStatusFilter(st);
                            setActiveTab('orders');
                          }}
                          className="w-full flex items-center justify-between gap-3 p-2.5 rounded-sm bg-obsidian/70 border border-white/[0.06] hover:border-acid/40 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-sm border font-mono text-[10px] uppercase tracking-wider ${meta.color}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 bg-surface rounded-sm overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-bone/70"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold text-bone w-8 text-right">
                              {count}
                            </span>
                            <span className="font-mono text-[10px] text-ash w-9 text-right">
                              {pct}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Low Stock Restock Queue */}
              <div className="card-dark p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-display font-bold text-lg uppercase text-bone flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-crimson" />
                      Low Stock Restock Queue
                    </h2>
                    <p className="font-mono text-[11px] text-ash">
                      Products with any size at or below 5 units
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInventoryOnlyLow(true);
                      setActiveTab('inventory');
                    }}
                    className="btn-outline py-2 px-4 text-[11px]"
                  >
                    Open Inventory Matrix
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {analytics.lowStockProducts.length === 0 ? (
                  <div className="p-6 rounded-sm bg-obsidian border border-emerald-500/20 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="font-mono text-xs uppercase text-emerald-300">
                      All sizes healthy above 5 units across catalog.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {analytics.lowStockProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-sm bg-obsidian border border-white/[0.08] flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={prod.images?.[0] || '/images/product-angel-fullsleeve.jpg'}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-sm border border-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-bone truncate">
                              {prod.name}
                            </p>
                            <p className="font-mono text-[10px] text-ash">
                              {prod.sku} • Total: {prod.totalStock} pcs
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {prod.lowSizes.map(({ size, qty }) => (
                                <span
                                  key={size}
                                  className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                                    qty <= 2
                                      ? 'bg-crimson/20 text-crimson border-crimson/40'
                                      : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                                  }`}
                                >
                                  {size}: {qty}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setInventorySearch(prod.sku || prod.name);
                            setInventoryOnlyLow(false);
                            setActiveTab('inventory');
                          }}
                          className="px-3 py-2 rounded-sm bg-surface border border-white/15 hover:border-acid text-bone hover:text-acid font-mono text-[10px] uppercase tracking-wider shrink-0 transition-colors"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders Table */}
              <div className="card-dark overflow-hidden">
                <div className="p-6 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-lg uppercase text-bone">
                      Recent Orders
                    </h2>
                    <p className="font-mono text-[11px] text-ash">
                      Latest Razorpay-verified transactions & dispatch statuses
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter('all');
                      setActiveTab('orders');
                    }}
                    className="font-mono text-xs uppercase text-acid hover:underline inline-flex items-center gap-1"
                  >
                    Manage All Orders
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-obsidian/70 font-mono text-[10px] uppercase tracking-wider text-ash">
                        <th className="py-3 px-5">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Razorpay Payment ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-sm">
                      {orders.slice(0, 6).map((ord) => {
                        const meta = ORDER_STATUS_META[ord.status] || ORDER_STATUS_META.processing;
                        return (
                          <tr
                            key={ord.id}
                            onClick={() => setActiveTab('orders')}
                            className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-5 font-mono text-xs font-bold text-acid">
                              {ord.orderNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-bone">{ord.customerName}</p>
                              <p className="font-mono text-[10px] text-ash">
                                {ord.shippingAddress?.city || ord.customerEmail}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-ash">
                              {ord.razorpayPaymentId || 'COD / Pending'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-ash">
                              {formatDate(ord.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs font-bold text-bone text-right">
                              {formatINR(ord.total)}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-sm border font-mono text-[10px] uppercase tracking-wider ${meta.color}`}
                              >
                                {meta.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-10 text-center font-mono text-xs text-ash"
                          >
                            No orders recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================ */}
          {/* TAB 2: PRODUCTS (FULL CRUD + STORAGE UPLOAD)     */}
          {/* ================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              {/* Controls Bar */}
              <div className="card-dark p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search by product name, SKU, or subtitle..."
                      className="input-dark pl-10"
                    />
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="input-dark sm:w-48"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={openCreateProductModal}
                  className="btn-acid py-2.5 px-5"
                >
                  <Plus className="w-4 h-4" />
                  Add New Product
                </button>
              </div>

              {/* Products Table */}
              <div className="card-dark overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-obsidian/80 font-mono text-[10px] uppercase tracking-wider text-ash">
                        <th className="py-3.5 px-4">Product</th>
                        <th className="py-3.5 px-3">SKU</th>
                        <th className="py-3.5 px-3">Category</th>
                        <th className="py-3.5 px-3">GSM</th>
                        <th className="py-3.5 px-3">Price</th>
                        <th className="py-3.5 px-3">Stock</th>
                        <th className="py-3.5 px-3 text-center">Active</th>
                        <th className="py-3.5 px-3 text-center">Featured</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-sm">
                      {filteredProducts.map((p) => {
                        const totalStock = getTotalStock(p.sizes);
                        const lowCount = getLowStockSizes(p.sizes).length;
                        const isActive = p.active !== false;
                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-white/[0.02] transition-colors ${
                              !isActive ? 'opacity-60' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3.5 min-w-[220px]">
                                <img
                                  src={
                                    p.images?.[0] ||
                                    '/images/product-angel-fullsleeve.jpg'
                                  }
                                  alt={p.name}
                                  className="w-12 h-14 object-cover rounded-sm border border-white/10 shrink-0 bg-obsidian"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-bone truncate max-w-[240px]">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-ash truncate max-w-[240px]">
                                    {p.subtitle}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    {(p.colors || []).slice(0, 5).map((col, idx) => (
                                      <span
                                        key={`${p.id}-col-${idx}`}
                                        title={col.name}
                                        className="w-3 h-3 rounded-full border border-white/25 inline-block"
                                        style={{ backgroundColor: col.hex || '#121215' }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-xs text-ash whitespace-nowrap">
                              {p.sku}
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-sm bg-surface border border-white/10 font-mono text-[10px] uppercase text-bone">
                                {p.categoryLabel || p.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-xs text-bone whitespace-nowrap">
                              {p.gsm || 260} GSM
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <p className="font-mono text-xs font-bold text-acid">
                                {formatINR(p.price)}
                              </p>
                              {p.compareAtPrice > p.price && (
                                <p className="font-mono text-[10px] text-ash line-through">
                                  {formatINR(p.compareAtPrice)}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  lowCount > 0 ? 'text-amber-300' : 'text-bone'
                                }`}
                              >
                                {totalStock}
                              </span>
                              {lowCount > 0 && (
                                <span className="block font-mono text-[10px] text-crimson">
                                  {lowCount} size{lowCount > 1 ? 's' : ''} low
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleQuickToggleProduct(p, 'active')}
                                title={isActive ? 'Visible on store' : 'Hidden draft'}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border font-mono text-[10px] uppercase transition-colors ${
                                  isActive
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                                    : 'bg-white/5 text-ash border-white/10'
                                }`}
                              >
                                {isActive ? (
                                  <Eye className="w-3 h-3" />
                                ) : (
                                  <EyeOff className="w-3 h-3" />
                                )}
                                {isActive ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleQuickToggleProduct(p, 'featured')}
                                title="Toggle Featured"
                                className={`p-1.5 rounded-sm border transition-colors ${
                                  p.featured
                                    ? 'bg-acid/15 text-acid border-acid/40'
                                    : 'bg-white/5 text-ash border-white/10 hover:text-bone'
                                }`}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    p.featured ? 'fill-acid' : ''
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditProductModal(p)}
                                  className="px-2.5 py-1.5 rounded-sm bg-surface border border-white/15 hover:border-acid text-bone hover:text-acid font-mono text-[11px] inline-flex items-center gap-1 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                {confirmDeleteId === p.id ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(p.id, p.name)}
                                      className="px-2.5 py-1.5 rounded-sm bg-crimson text-white font-mono text-[10px] uppercase font-bold"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 py-1.5 rounded-sm bg-surface text-ash font-mono text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    title="Delete Product"
                                    className="p-1.5 rounded-sm bg-surface border border-white/10 hover:border-crimson text-ash hover:text-crimson transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-12 text-center font-mono text-xs text-ash"
                          >
                            No products match your search or category filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================ */}
          {/* TAB 3: ORDERS & FULFILLMENT                      */}
          {/* ================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* Filter Pills + Search */}
              <div className="card-dark p-4 space-y-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider border transition-colors ${
                      orderStatusFilter === 'all'
                        ? 'bg-acid text-obsidian border-acid font-bold'
                        : 'bg-obsidian text-ash border-white/10 hover:text-bone'
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  {ORDER_STATUSES.map((st) => {
                    const meta = ORDER_STATUS_META[st];
                    const count = analytics.statusCounts[st] || 0;
                    const active = orderStatusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider border transition-colors ${
                          active
                            ? 'bg-acid text-obsidian border-acid font-bold'
                            : 'bg-obsidian text-ash border-white/10 hover:text-bone'
                        }`}
                      >
                        {meta.label} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order #, customer name, Razorpay ID, or AWB..."
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const meta =
                    ORDER_STATUS_META[order.status] || ORDER_STATUS_META.processing;
                  const draft = orderDrafts[order.id] || {
                    status: order.status || 'processing',
                    trackingNumber: order.trackingNumber || '',
                  };
                  const isDirty =
                    draft.status !== (order.status || 'processing') ||
                    draft.trackingNumber.trim() !== (order.trackingNumber || '');
                  const isExpanded = Boolean(expandedOrders[order.id]);

                  return (
                    <div
                      key={order.id}
                      className="card-dark overflow-hidden border border-white/[0.08]"
                    >
                      {/* Order Header */}
                      <div className="p-4 sm:p-5 bg-surface/60 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-sm font-bold text-acid">
                                {order.orderNumber}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-sm border font-mono text-[10px] uppercase tracking-wider ${meta.color}`}
                              >
                                {meta.label}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase border ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {order.paymentStatus === 'paid' ? 'PAID' : order.paymentStatus || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-xs text-ash mt-1">
                              <span className="text-bone font-medium">
                                {order.customerName}
                              </span>{' '}
                              • {order.customerEmail} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-mono text-base font-bold text-bone">
                              {formatINR(order.total)}
                            </p>
                            <p className="font-mono text-[10px] text-ash uppercase">
                              {(order.items || []).reduce(
                                (sum, i) => sum + (Number(i.quantity) || 1),
                                0
                              )}{' '}
                              item(s) • {order.paymentMethod || 'Razorpay'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrders((prev) => ({
                                ...prev,
                                [order.id]: !prev[order.id],
                              }))
                            }
                            className="p-2 rounded-sm bg-obsidian border border-white/10 hover:border-acid text-ash hover:text-acid transition-colors"
                            aria-label="Toggle Order Details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Order Body */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 border-b border-white/[0.06]">
                          {/* Items List */}
                          <div className="lg:col-span-6 space-y-2.5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-ash">
                              ORDERED LINE ITEMS
                            </p>
                            {(order.items || []).map((item, idx) => (
                              <div
                                key={`${order.id}-item-${idx}`}
                                className="flex items-center justify-between gap-3 p-2.5 rounded-sm bg-obsidian border border-white/[0.06]"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={
                                      item.image ||
                                      '/images/product-angel-fullsleeve.jpg'
                                    }
                                    alt={item.name}
                                    className="w-11 h-13 object-cover rounded-sm border border-white/10 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-bone truncate">
                                      {item.name}
                                    </p>
                                    <p className="font-mono text-[10px] text-ash mt-0.5">
                                      Size: <span className="text-bone">{item.size}</span> •
                                      Color: <span className="text-bone">{item.color}</span> •
                                      Qty: <span className="text-acid">{item.quantity}</span>
                                    </p>
                                  </div>
                                </div>
                                <span className="font-mono text-xs font-bold text-bone shrink-0">
                                  {formatINR(
                                    (Number(item.price) || 0) *
                                      (Number(item.quantity) || 1)
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Address */}
                          <div className="lg:col-span-3 space-y-2">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-ash flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-acid" />
                              SHIPPING ADDRESS
                            </p>
                            <div className="p-3.5 rounded-sm bg-obsidian border border-white/[0.06] text-xs space-y-1 text-ash">
                              <p className="text-bone font-semibold">
                                {order.shippingAddress?.fullName || order.customerName}
                              </p>
                              <p>{order.shippingAddress?.line1}</p>
                              {order.shippingAddress?.landmark && (
                                <p className="text-ash/80">
                                  Landmark: {order.shippingAddress.landmark}
                                </p>
                              )}
                              <p>
                                {order.shippingAddress?.city},{' '}
                                {order.shippingAddress?.state} —{' '}
                                <span className="font-mono text-bone">
                                  {order.shippingAddress?.pincode}
                                </span>
                              </p>
                              <p className="font-mono text-[11px] text-bone pt-1 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-acid" />
                                {order.shippingAddress?.phone || order.customerPhone}
                              </p>
                            </div>
                          </div>

                          {/* Razorpay & Billing Details */}
                          <div className="lg:col-span-3 space-y-2">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-ash flex items-center gap-1.5">
                              <CreditCard className="w-3 h-3 text-acid" />
                              RAZORPAY & BILLING
                            </p>
                            <div className="p-3.5 rounded-sm bg-obsidian border border-white/[0.06] text-xs space-y-1.5 font-mono">
                              <div className="flex justify-between text-ash">
                                <span>Subtotal</span>
                                <span className="text-bone">
                                  {formatINR(order.subtotal)}
                                </span>
                              </div>
                              {Number(order.discount) > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                  <span>
                                    Discount{' '}
                                    {order.couponCode ? `(${order.couponCode})` : ''}
                                  </span>
                                  <span>-{formatINR(order.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-ash">
                                <span>Shipping</span>
                                <span className="text-bone">
                                  {Number(order.shippingFee) === 0
                                    ? 'FREE'
                                    : formatINR(order.shippingFee)}
                                </span>
                              </div>
                              <div className="flex justify-between text-acid font-bold pt-1.5 border-t border-white/10">
                                <span>Total</span>
                                <span>{formatINR(order.total)}</span>
                              </div>
                              <div className="pt-2 border-t border-white/10 space-y-1 text-[10px]">
                                <p className="text-ash">
                                  RZP Order:{' '}
                                  <span className="text-bone break-all">
                                    {order.razorpayOrderId || '—'}
                                  </span>
                                </p>
                                <p className="text-ash">
                                  RZP Payment:{' '}
                                  <span className="text-emerald-300 break-all">
                                    {order.razorpayPaymentId || '—'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fulfillment Action Bar */}
                      <div className="p-4 sm:px-5 bg-obsidian/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                          <div className="sm:w-48">
                            <label className="block font-mono text-[10px] uppercase text-ash mb-1">
                              Order Status
                            </label>
                            <select
                              value={draft.status}
                              onChange={(e) =>
                                setOrderDrafts((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...draft,
                                    status: e.target.value,
                                  },
                                }))
                              }
                              className="input-dark py-2 text-xs font-mono uppercase"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {ORDER_STATUS_META[st]?.label || st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1 max-w-md">
                            <label className="block font-mono text-[10px] uppercase text-ash mb-1 flex items-center gap-1.5">
                              <Truck className="w-3 h-3 text-acid" />
                              Courier Tracking Number (AWB)
                            </label>
                            <input
                              type="text"
                              value={draft.trackingNumber}
                              onChange={(e) =>
                                setOrderDrafts((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...draft,
                                    trackingNumber: e.target.value,
                                  },
                                }))
                              }
                              placeholder="e.g. BLUEDART-78451290 or DELHIVERY-55910234"
                              className="input-dark py-2 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="sm:self-end">
                          <button
                            type="button"
                            onClick={() => handleSaveOrderFulfillment(order.id)}
                            disabled={savingOrderId === order.id}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all ${
                              isDirty
                                ? 'bg-acid text-obsidian hover:bg-bone'
                                : 'bg-surface border border-white/15 text-bone hover:border-acid hover:text-acid'
                            }`}
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingOrderId === order.id
                              ? 'Saving...'
                              : isDirty
                              ? 'Save Update'
                              : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div className="card-dark p-12 text-center font-mono text-xs text-ash">
                    No orders match your current filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================ */}
          {/* TAB 4: INVENTORY MATRIX                          */}
          {/* ================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              {/* Controls */}
              <div className="card-dark p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Filter inventory by SKU or product name..."
                      className="input-dark pl-10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setInventoryOnlyLow((v) => !v)}
                    className={`px-3.5 py-2.5 rounded-sm font-mono text-xs uppercase tracking-wider border inline-flex items-center justify-center gap-2 transition-colors ${
                      inventoryOnlyLow
                        ? 'bg-crimson/20 text-crimson border-crimson/40 font-bold'
                        : 'bg-obsidian text-ash border-white/15 hover:text-bone'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Low Stock Only ({analytics.lowStockCount})
                  </button>
                </div>

                <div className="flex items-center gap-4 font-mono text-[11px] text-ash">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-crimson/40 border border-crimson" />
                    ≤ 2 Critical
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-400" />
                    3–5 Low
                  </span>
                </div>
              </div>

              {/* Spreadsheet Grid */}
              <div className="card-dark overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-obsidian/80 font-mono text-[10px] uppercase tracking-wider text-ash">
                        <th className="py-3.5 px-4">Product / SKU</th>
                        {SIZES.map((sz) => (
                          <th key={sz} className="py-3.5 px-2 text-center w-24">
                            Size {sz}
                          </th>
                        ))}
                        <th className="py-3.5 px-3 text-center">Total</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredInventory.map((prod) => {
                        const draft = stockDrafts[prod.id] || {
                          S: Number(prod.sizes?.S) || 0,
                          M: Number(prod.sizes?.M) || 0,
                          L: Number(prod.sizes?.L) || 0,
                          XL: Number(prod.sizes?.XL) || 0,
                          XXL: Number(prod.sizes?.XXL) || 0,
                        };
                        const rowTotal = getTotalStock(draft);
                        const isDirty = SIZES.some(
                          (sz) => (Number(draft[sz]) || 0) !== (Number(prod.sizes?.[sz]) || 0)
                        );

                        return (
                          <tr
                            key={prod.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3 min-w-[220px]">
                                <img
                                  src={
                                    prod.images?.[0] ||
                                    '/images/product-angel-fullsleeve.jpg'
                                  }
                                  alt={prod.name}
                                  className="w-10 h-12 object-cover rounded-sm border border-white/10 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-bone truncate max-w-[230px]">
                                    {prod.name}
                                  </p>
                                  <p className="font-mono text-[10px] text-ash">
                                    {prod.sku} • {prod.gsm || 260} GSM
                                  </p>
                                </div>
                              </div>
                            </td>

                            {SIZES.map((sz) => {
                              const val = Number(draft[sz]) || 0;
                              const toneClass =
                                val <= 2
                                  ? 'border-crimson/60 bg-crimson/15 text-crimson focus:border-crimson'
                                  : val <= 5
                                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 focus:border-amber-400'
                                  : 'border-white/15 bg-obsidian text-bone focus:border-acid';

                              return (
                                <td key={sz} className="py-3.5 px-2 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={val}
                                    onChange={(e) =>
                                      handleStockDraftChange(prod.id, sz, e.target.value)
                                    }
                                    className={`w-20 text-center font-mono text-xs font-bold py-2 px-2 rounded-sm border focus:outline-none transition-colors ${toneClass}`}
                                  />
                                </td>
                              );
                            })}

                            <td className="py-3.5 px-3 text-center">
                              <span className="font-mono text-sm font-bold text-bone">
                                {rowTotal}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleSaveProductStock(prod)}
                                disabled={savingStockId === prod.id}
                                className={`px-3.5 py-2 rounded-sm font-mono text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${
                                  isDirty
                                    ? 'bg-acid text-obsidian hover:bg-bone'
                                    : 'bg-surface border border-white/15 text-ash hover:border-acid hover:text-acid'
                                }`}
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingStockId === prod.id ? 'Saving...' : 'Save Stock'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredInventory.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-12 text-center font-mono text-xs text-ash"
                          >
                            No SKUs match your inventory filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================ */}
          {/* TAB 5: COUPONS & STOREFRONT                      */}
          {/* ================================================ */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* LEFT COLUMN: PROMO CODES MANAGER */}
              <div className="xl:col-span-7 space-y-5">
                <div className="card-dark p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-display font-bold text-lg uppercase text-bone flex items-center gap-2">
                        <Tag className="w-4 h-4 text-acid" />
                        Create Promo Code
                      </h2>
                      <p className="font-mono text-[11px] text-ash">
                        Instantly usable at checkout across Razorpay & COD orders
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Coupon Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.code}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              code: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="DROP25"
                          className="input-dark font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Discount Type
                        </label>
                        <select
                          value={couponForm.type}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="input-dark font-mono"
                        >
                          <option value="percent">Percent (%)</option>
                          <option value="flat">Flat (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Value ({couponForm.type === 'percent' ? '%' : '₹'}) *
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={couponForm.value}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              value: e.target.value,
                            }))
                          }
                          className="input-dark font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Minimum Order (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={couponForm.minOrder}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              minOrder: e.target.value,
                            }))
                          }
                          className="input-dark font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Max Discount Cap (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={couponForm.maxDiscount}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              maxDiscount: e.target.value,
                            }))
                          }
                          className="input-dark font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                        Description
                      </label>
                      <input
                        type="text"
                        value={couponForm.description}
                        onChange={(e) =>
                          setCouponForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g. 15% off Drop 04 orders above ₹999"
                        className="input-dark"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingCoupon}
                      className="btn-acid w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      {creatingCoupon ? 'Creating...' : 'Create Promo Code'}
                    </button>
                  </form>
                </div>

                {/* Existing Coupons Table */}
                <div className="card-dark overflow-hidden">
                  <div className="p-5 border-b border-white/[0.08]">
                    <h3 className="font-display font-bold text-base uppercase text-bone">
                      Active & Archived Promo Codes ({coupons.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-obsidian/70 font-mono text-[10px] uppercase tracking-wider text-ash">
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-3">Discount</th>
                          <th className="py-3 px-3">Rules</th>
                          <th className="py-3 px-3 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] text-sm">
                        {coupons.map((cpn) => (
                          <tr
                            key={cpn.id}
                            className={`hover:bg-white/[0.02] ${
                              !cpn.active ? 'opacity-55' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-sm bg-acid/15 border border-acid/30 font-mono text-xs font-bold text-acid">
                                {cpn.code}
                              </span>
                              <p className="text-[11px] text-ash mt-1 max-w-[200px] truncate">
                                {cpn.description}
                              </p>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-xs font-bold text-bone whitespace-nowrap">
                              {cpn.type === 'percent'
                                ? `${cpn.value}% OFF`
                                : `${formatINR(cpn.value)} OFF`}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-[11px] text-ash whitespace-nowrap">
                              <div>Min: {formatINR(cpn.minOrder)}</div>
                              <div>Cap: {formatINR(cpn.maxDiscount)}</div>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCoupon(cpn)}
                                className={`px-2.5 py-1 rounded-sm border font-mono text-[10px] uppercase transition-colors ${
                                  cpn.active
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                                    : 'bg-white/5 text-ash border-white/10'
                                }`}
                              >
                                {cpn.active ? 'Active' : 'Paused'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(cpn)}
                                className="p-1.5 rounded-sm bg-surface border border-white/10 hover:border-crimson text-ash hover:text-crimson transition-colors"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-10 text-center font-mono text-xs text-ash"
                            >
                              No promo codes configured yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE STOREFRONT SETTINGS */}
              <div className="xl:col-span-5">
                <div className="card-dark p-6 sticky top-24">
                  <div className="mb-5">
                    <h2 className="font-display font-bold text-lg uppercase text-bone flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-acid" />
                      Live Storefront Settings
                    </h2>
                    <p className="font-mono text-[11px] text-ash">
                      Changes publish immediately to navbar marquee, drop timer & checkout
                    </p>
                  </div>

                  <form onSubmit={handleSaveStorefrontConfig} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                        Announcement Marquee Text
                      </label>
                      <textarea
                        rows={3}
                        value={configForm.announcementText}
                        onChange={(e) =>
                          setConfigForm((prev) => ({
                            ...prev,
                            announcementText: e.target.value,
                          }))
                        }
                        className="input-dark font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                        Drop Title
                      </label>
                      <input
                        type="text"
                        value={configForm.dropTitle}
                        onChange={(e) =>
                          setConfigForm((prev) => ({
                            ...prev,
                            dropTitle: e.target.value,
                          }))
                        }
                        placeholder="DROP 04 // ARCHIVE GRUNGE"
                        className="input-dark font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-ash mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-acid" />
                        Drop Countdown End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={configForm.dropCountdownEnd}
                        onChange={(e) =>
                          setConfigForm((prev) => ({
                            ...prev,
                            dropCountdownEnd: e.target.value,
                          }))
                        }
                        className="input-dark font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Free Ship (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={configForm.freeShippingThreshold}
                          onChange={(e) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              freeShippingThreshold: e.target.value,
                            }))
                          }
                          className="input-dark font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          Express Fee (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={configForm.expressShippingFee}
                          onChange={(e) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              expressShippingFee: e.target.value,
                            }))
                          }
                          className="input-dark font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                          COD Fee (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={configForm.codFee}
                          onChange={(e) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              codFee: e.target.value,
                            }))
                          }
                          className="input-dark font-mono text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="btn-acid w-full"
                    >
                      <Save className="w-4 h-4" />
                      {savingConfig
                        ? 'Publishing Config...'
                        : 'Save & Publish Storefront Settings'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================ */}
          {/* TAB 6: CUSTOMERS & INQUIRIES                     */}
          {/* ================================================ */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              {/* Registered Users Table */}
              <div className="card-dark overflow-hidden">
                <div className="p-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-lg uppercase text-bone flex items-center gap-2">
                      <Users className="w-4 h-4 text-acid" />
                      Registered Users ({users.length})
                    </h2>
                    <p className="font-mono text-[11px] text-ash">
                      Manage Firebase Auth & Storefront customer roles
                    </p>
                  </div>
                  <div className="relative sm:w-72">
                    <Search className="w-4 h-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name, email, city..."
                      className="input-dark pl-10 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-obsidian/70 font-mono text-[10px] uppercase tracking-wider text-ash">
                        <th className="py-3 px-5">Member</th>
                        <th className="py-3 px-4">Location / Contact</th>
                        <th className="py-3 px-4">Auth Provider</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-5 text-right">Access Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-sm">
                      {filteredUsers.map((u) => {
                        const initial = (u.name || u.email || 'D')
                          .charAt(0)
                          .toUpperCase();
                        const isSelf = u.uid === user?.uid || u.email === user?.email;
                        return (
                          <tr key={u.uid} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt={u.name}
                                    className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-surface border border-white/15 flex items-center justify-center font-display font-bold text-sm text-acid shrink-0">
                                    {initial}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-bone flex items-center gap-2">
                                    {u.name || 'Doffor Member'}
                                    {isSelf && (
                                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-acid/15 text-acid">
                                        YOU
                                      </span>
                                    )}
                                  </p>
                                  <p className="font-mono text-[11px] text-ash">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-ash">
                              <div>{u.city || '—'}</div>
                              <div className="text-[10px]">{u.phone || ''}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border font-mono text-[10px] uppercase ${
                                  u.provider === 'google'
                                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                    : 'bg-white/5 text-bone border-white/15'
                                }`}
                              >
                                {u.provider === 'google' ? 'Google' : 'Email'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-ash">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-sm border font-mono text-[10px] uppercase font-bold ${
                                  u.role === 'admin'
                                    ? 'bg-acid/15 text-acid border-acid/40'
                                    : 'bg-white/5 text-ash border-white/10'
                                }`}
                              >
                                {u.role === 'admin' ? 'Admin' : 'Customer'}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                type="button"
                                disabled={updatingRoleUid === u.uid}
                                onClick={() => handleToggleUserRole(u)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface border border-white/15 hover:border-acid text-bone hover:text-acid font-mono text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                                {updatingRoleUid === u.uid
                                  ? 'Updating...'
                                  : u.role === 'admin'
                                  ? 'Make Customer'
                                  : 'Promote Admin'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inquiries + Newsletter Split */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Custom Collab / Contact Inquiries */}
                <div className="xl:col-span-7 card-dark p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display font-bold text-lg uppercase text-bone flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-acid" />
                        Custom Collab & Contact Inquiries ({inquiries.length})
                      </h3>
                      <p className="font-mono text-[11px] text-ash">
                        Bulk fest merch, custom drops & direct messages
                      </p>
                    </div>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="p-8 rounded-sm bg-obsidian border border-white/[0.06] text-center font-mono text-xs text-ash">
                      No inquiries submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-4 rounded-sm bg-obsidian border border-white/[0.08] space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-sm bg-acid/15 border border-acid/30 text-acid font-mono text-[10px] uppercase">
                                {inq.type || 'inquiry'}
                              </span>
                              <span className="font-semibold text-sm text-bone">
                                {inq.name}
                              </span>
                              {inq.organization && (
                                <span className="font-mono text-[11px] text-ash">
                                  • {inq.organization}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-ash">
                              {formatDate(inq.createdAt)}
                            </span>
                          </div>

                          <p className="text-xs text-bone/90 leading-relaxed">
                            {inq.message}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] font-mono text-[11px]">
                            <div className="flex items-center gap-3 text-ash">
                              <span>{inq.email}</span>
                              {inq.quantity && (
                                <span className="text-acid">Qty: {inq.quantity}</span>
                              )}
                            </div>
                            <a
                              href={`mailto:${inq.email}?subject=DOFFOR CLOTHING // Re: Your Inquiry`}
                              className="text-acid hover:underline inline-flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              Reply
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Newsletter Subscribers */}
                <div className="xl:col-span-5 card-dark p-6">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h3 className="font-display font-bold text-lg uppercase text-bone flex items-center gap-2">
                        <Mail className="w-4 h-4 text-acid" />
                        Newsletter ({newsletter.length})
                      </h3>
                      <p className="font-mono text-[11px] text-ash">
                        Early Drop access mailing list
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAllEmails}
                      className="px-3 py-2 rounded-sm bg-acid text-obsidian hover:bg-bone font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedEmails ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy All Emails
                        </>
                      )}
                    </button>
                  </div>

                  {newsletter.length === 0 ? (
                    <div className="p-8 rounded-sm bg-obsidian border border-white/[0.06] text-center font-mono text-xs text-ash">
                      No newsletter subscribers yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {newsletter.map((email, idx) => (
                        <div
                          key={`${email}-${idx}`}
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-sm bg-obsidian border border-white/[0.06]"
                        >
                          <span className="font-mono text-xs text-bone truncate">
                            {email}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(email);
                                pushToast(`Copied ${email}`, 'success');
                              } catch {
                                pushToast('Clipboard unavailable.', 'error');
                              }
                            }}
                            className="p-1 text-ash hover:text-acid transition-colors"
                            title="Copy email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================================================== */}
      {/* CREATE / EDIT PRODUCT MODAL                        */}
      {/* ================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl max-h-[92vh] bg-charcoal border border-white/15 rounded-sm shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-obsidian border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
                  {productForm.id ? 'EDIT CATALOG SKU' : 'LAUNCH NEW DROP SKU'}
                </p>
                <h2 className="font-display font-extrabold text-xl uppercase text-bone">
                  {productForm.id ? productForm.name || 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-sm bg-surface border border-white/10 hover:border-acid text-ash hover:text-bone transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleSaveProductForm}
              className="overflow-y-auto flex-1 p-6 space-y-6"
            >
              {/* Section 1: Core Details */}
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-acid border-b border-white/10 pb-2">
                  01 // Core Identity & Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. Winged Angel Heavyweight Full-Sleeve"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          sku: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="DFR-D04-FS01"
                      className="input-dark font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                        }))
                      }
                      placeholder="260 GSM Bio-Washed Drop-Shoulder Long Sleeve"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="input-dark"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      className="input-dark font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Compare-At (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.compareAtPrice}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          compareAtPrice: e.target.value,
                        }))
                      }
                      className="input-dark font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Fabric GSM
                    </label>
                    <select
                      value={productForm.gsm}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          gsm: Number(e.target.value),
                        }))
                      }
                      className="input-dark font-mono"
                    >
                      {GSM_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g} GSM
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Fit Silhouette
                    </label>
                    <select
                      value={productForm.fit}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, fit: e.target.value }))
                      }
                      className="input-dark"
                    >
                      {FIT_OPTIONS.map((fit) => (
                        <option key={fit} value={fit}>
                          {fit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Fabric Spec
                    </label>
                    <input
                      type="text"
                      value={productForm.fabric}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, fabric: e.target.value }))
                      }
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Print Technology
                    </label>
                    <input
                      type="text"
                      value={productForm.printTech}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          printTech: e.target.value,
                        }))
                      }
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Badges (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={productForm.badgesText}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          badgesText: e.target.value,
                        }))
                      }
                      placeholder="DROP 04, BESTSELLER, 260 GSM"
                      className="input-dark font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Full editorial product description..."
                      className="input-dark text-xs leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-ash mb-1.5">
                      Highlights (one bullet per line)
                    </label>
                    <textarea
                      rows={4}
                      value={productForm.highlightsText}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          highlightsText: e.target.value,
                        }))
                      }
                      placeholder="260 GSM heavy-drape cotton&#10;Pre-shrunk & silicone bio-washed&#10;2.5cm Lycra-reinforced rib neck"
                      className="input-dark text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Visibility & Merchandising Flags */}
                <div className="flex flex-wrap gap-4 pt-1">
                  {[
                    { key: 'active', label: 'Active (Visible on Store)' },
                    { key: 'featured', label: 'Featured' },
                    { key: 'isNewDrop', label: 'New Drop' },
                    { key: 'bestseller', label: 'Bestseller' },
                  ].map((flag) => (
                    <label
                      key={flag.key}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-sm bg-obsidian border border-white/10 cursor-pointer hover:border-acid/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(productForm[flag.key])}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            [flag.key]: e.target.checked,
                          }))
                        }
                        className="accent-[#E8FF2A] w-4 h-4"
                      />
                      <span className="font-mono text-[11px] uppercase text-bone">
                        {flag.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 2: Size Stock Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-acid">
                    02 // Size Stock Matrix
                  </h3>
                  <span className="font-mono text-[11px] text-ash">
                    Total Units:{' '}
                    <span className="text-bone font-bold">
                      {getTotalStock(productForm.sizes)}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {SIZES.map((sz) => (
                    <div key={sz} className="p-3 rounded-sm bg-obsidian border border-white/10">
                      <label className="block font-mono text-xs font-bold text-center text-acid mb-1.5">
                        {sz}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={productForm.sizes[sz]}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            sizes: {
                              ...prev.sizes,
                              [sz]: Math.max(0, parseInt(e.target.value, 10) || 0),
                            },
                          }))
                        }
                        className="input-dark text-center font-mono text-sm py-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Images Gallery & Sanity CDN Upload */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-acid flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" />
                    03 // Images Gallery & Direct Upload
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-ash hidden sm:inline">
                      Powered by Sanity Global CDN (cdn.sanity.io)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget('gallery')}
                      className="btn-outline py-1.5 px-3 text-[10px]"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Browse Sanity CDN Library
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7 flex gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. /images/... or https://...)"
                      className="input-dark font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 rounded-sm bg-surface border border-white/15 hover:border-acid text-bone hover:text-acid font-mono text-xs uppercase shrink-0"
                    >
                      Add URL
                    </button>
                  </div>

                  <div
                    className="sm:col-span-5"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer?.files?.length) {
                        handleUploadImageFiles(e.dataTransfer.files);
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleUploadImageFiles(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-full min-h-[42px] px-4 py-2 rounded-sm border border-dashed font-mono text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                        dragActive
                          ? 'border-acid bg-acid/20 text-bone'
                          : 'border-acid/50 bg-acid/[0.06] hover:bg-acid/[0.12] text-acid'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage
                        ? 'Uploading...'
                        : dragActive
                        ? 'Drop Images Here'
                        : 'Drag or Upload Image(s)'}
                    </button>
                  </div>
                </div>

                {productForm.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={`img-${idx}`}
                        className={`relative group rounded-sm overflow-hidden border bg-obsidian ${
                          idx === 0 ? 'border-acid' : 'border-white/15'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-36 object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-acid text-obsidian font-mono text-[9px] font-bold uppercase">
                            Primary
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-1">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="px-2 py-1 rounded-sm bg-white/15 hover:bg-acid hover:text-obsidian text-bone font-mono text-[9px] uppercase font-bold transition-colors"
                            >
                              Set Primary
                            </button>
                          ) : (
                            <span className="font-mono text-[9px] text-ash">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-sm bg-crimson/80 hover:bg-crimson text-white"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-sm bg-obsidian border border-dashed border-white/15 text-center font-mono text-xs text-ash">
                    No images added yet. Upload files or paste a URL above.
                  </div>
                )}
              </div>

              {/* Section 4: Colorways Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-acid flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5" />
                    04 // Colorways Editor
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddColorway}
                    className="font-mono text-[11px] uppercase text-acid hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Colorway
                  </button>
                </div>

                <div className="space-y-2.5">
                  {productForm.colors.map((col, idx) => (
                    <div
                      key={`colorway-${idx}`}
                      className="p-3 rounded-sm bg-obsidian border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="block font-mono text-[9px] uppercase text-ash mb-1">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) =>
                            handleColorChange(idx, 'name', e.target.value)
                          }
                          placeholder="e.g. Jet Black"
                          className="input-dark py-1.5 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-mono text-[9px] uppercase text-ash mb-1">
                          Hex Swatch
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={col.hex || '#121215'}
                            onChange={(e) =>
                              handleColorChange(idx, 'hex', e.target.value)
                            }
                            className="w-9 h-8 rounded-sm bg-transparent border border-white/20 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={col.hex}
                            onChange={(e) =>
                              handleColorChange(idx, 'hex', e.target.value)
                            }
                            className="input-dark py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block font-mono text-[9px] uppercase text-ash mb-1">
                          Colorway Image URL
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={col.image}
                            onChange={(e) =>
                              handleColorChange(idx, 'image', e.target.value)
                            }
                            placeholder="Optional image URL"
                            className="input-dark py-1.5 text-xs font-mono flex-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setMediaPickerTarget({ type: 'colorway', index: idx })
                            }
                            className="px-2 py-1.5 rounded-sm bg-surface border border-white/15 hover:border-acid text-ash hover:text-acid transition-colors shrink-0"
                            title="Pick from Sanity CDN Library"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-end sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveColorway(idx)}
                          disabled={productForm.colors.length <= 1}
                          className="p-1.5 rounded-sm bg-surface border border-white/10 hover:border-crimson text-ash hover:text-crimson disabled:opacity-30 transition-colors"
                          title="Remove colorway"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-charcoal pb-1">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="btn-outline py-2.5 px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn-acid py-2.5 px-6"
                >
                  <Save className="w-4 h-4" />
                  {savingProduct
                    ? 'Saving to Catalog...'
                    : productForm.id
                    ? 'Update Product'
                    : 'Launch Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SanityMediaPicker
        open={Boolean(mediaPickerTarget)}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleSelectSanityMedia}
      />
    </div>
  );
}
