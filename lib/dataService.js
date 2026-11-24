import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { resolveCdnDeep } from './sanity';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_CONFIG,
  INITIAL_INQUIRIES,
  INITIAL_USERS,
} from './catalog';

// Client-side preview state (only used when NEXT_PUBLIC_FIREBASE_* env vars are not yet set)
const LS_PREFIX = 'doffor_preview_';

function readPreview(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writePreview(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function getBackendMode() {
  return isFirebaseConfigured ? 'firebase' : 'preview';
}

// ======================================================
// SEED FIRESTORE (one-click from Admin Panel once connected)
// ======================================================
export async function seedFirestoreCatalog() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Add NEXT_PUBLIC_FIREBASE_* keys to .env.local to seed Firestore.');
  }
  const batch = writeBatch(db);
  for (const prod of resolveCdnDeep(INITIAL_PRODUCTS)) {
    batch.set(doc(db, 'products', prod.id), prod);
  }
  for (const cpn of INITIAL_COUPONS) {
    batch.set(doc(db, 'coupons', cpn.id), cpn);
  }
  batch.set(doc(db, 'config', 'storefront'), resolveCdnDeep(INITIAL_CONFIG));
  await batch.commit();
  return true;
}

// ======================================================
// STOREFRONT CONFIG
// ======================================================
export async function fetchStoreConfig() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'config', 'storefront'));
      if (snap.exists()) return resolveCdnDeep({ ...INITIAL_CONFIG, ...snap.data() });
    } catch (err) {
      console.warn('[Firestore Config Fallback]', err.message);
    }
  }
  return resolveCdnDeep(readPreview('config', INITIAL_CONFIG));
}

export async function updateStoreConfig(patch) {
  const next = { ...(await fetchStoreConfig()), ...patch };
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'config', 'storefront'), next, { merge: true });
    return next;
  }
  writePreview('config', next);
  return next;
}

// ======================================================
// PRODUCTS
// ======================================================
export async function fetchProducts({ includeInactive = false } = {}) {
  let list = [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } else {
        list = INITIAL_PRODUCTS;
      }
    } catch (err) {
      console.warn('[Firestore Products Fallback]', err.message);
      list = INITIAL_PRODUCTS;
    }
  } else {
    list = readPreview('products', INITIAL_PRODUCTS);
  }
  const resolved = resolveCdnDeep(list);
  return includeInactive ? resolved : resolved.filter((p) => p.active !== false);
}

export async function fetchProductBySlug(slug) {
  const all = await fetchProducts({ includeInactive: true });
  return all.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProduct(productData) {
  const cfg = await fetchStoreConfig();
  const dynamicCats = Array.isArray(cfg?.categories) ? cfg.categories : INITIAL_CONFIG.categories;
  const matchedCat = dynamicCats.find((c) => c.id === productData.category);
  const categoryLabel =
    productData.categoryLabel ||
    matchedCat?.label ||
    String(productData.category || 'Collection')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const isUpdate = Boolean(productData.id);
  const id = productData.id || `prod-${Date.now()}`;
  const slug =
    productData.slug ||
    `${String(productData.name || 'piece')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

  const payload = {
    id,
    slug,
    sku: productData.sku || `DFR-${Date.now().toString().slice(-4)}`,
    name: String(productData.name || '').trim(),
    subtitle: productData.subtitle || `${productData.gsm || 260} GSM Heavyweight Streetwear`,
    category: productData.category || dynamicCats[0]?.id || 'oversized-tees',
    categoryLabel,
    price: Number(productData.price) || 999,
    compareAtPrice: Number(productData.compareAtPrice) || Math.round((Number(productData.price) || 999) * 1.45),
    gsm: Number(productData.gsm) || 260,
    fit: productData.fit || 'Boxy Oversized',
    fabric: productData.fabric || '100% Super-Combed Bio-Washed Cotton',
    printTech: productData.printTech || 'High-Density Vintage Screen Print',
    featured: Boolean(productData.featured),
    isNewDrop: productData.isNewDrop !== false,
    bestseller: Boolean(productData.bestseller),
    active: productData.active !== false,
    badges: Array.isArray(productData.badges) && productData.badges.length ? productData.badges : ['DROP 04'],
    rating: Math.min(5, Math.max(0, Number(productData.rating) || 5.0)),
    reviewCount: Math.max(0, Math.round(Number(productData.reviewCount) || 0)),
    images:
      Array.isArray(productData.images) && productData.images.length
        ? productData.images.filter((u) => typeof u === 'string' && u.trim())
        : ['/images/product-angel-fullsleeve.jpg'],
    colors:
      Array.isArray(productData.colors) && productData.colors.length
        ? productData.colors
        : [{ name: 'Jet Black', hex: '#121215', image: productData.images?.[0] || '/images/product-angel-fullsleeve.jpg' }],
    sizes: {
      S: Math.max(0, Math.round(Number(productData.sizes?.S) || 0)),
      M: Math.max(0, Math.round(Number(productData.sizes?.M) || 0)),
      L: Math.max(0, Math.round(Number(productData.sizes?.L) || 0)),
      XL: Math.max(0, Math.round(Number(productData.sizes?.XL) || 0)),
      XXL: Math.max(0, Math.round(Number(productData.sizes?.XXL) || 0)),
    },
    description: productData.description || 'Heavyweight Doffor Clothing drop silhouette.',
    highlights:
      Array.isArray(productData.highlights) && productData.highlights.length
        ? productData.highlights
        : ['Heavyweight bio-washed combed cotton', 'Boxy drop-shoulder cut'],
    reviews: productData.reviews || [],
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'products', id), payload, { merge: true });
    return payload;
  }

  const current = readPreview('products', INITIAL_PRODUCTS);
  const next = isUpdate
    ? current.map((p) => (p.id === id ? { ...p, ...payload } : p))
    : [payload, ...current];
  writePreview('products', next);
  return payload;
}

export async function updateProductStock(productId, sizes) {
  const cleanSizes = {
    S: Math.max(0, Math.round(Number(sizes?.S) || 0)),
    M: Math.max(0, Math.round(Number(sizes?.M) || 0)),
    L: Math.max(0, Math.round(Number(sizes?.L) || 0)),
    XL: Math.max(0, Math.round(Number(sizes?.XL) || 0)),
    XXL: Math.max(0, Math.round(Number(sizes?.XXL) || 0)),
  };

  if (isFirebaseConfigured && db) {
    const prodRef = doc(db, 'products', productId);
    const snap = await getDoc(prodRef);
    if (!snap.exists()) {
      const seedMatch = resolveCdnDeep(INITIAL_PRODUCTS).find((p) => p.id === productId);
      if (seedMatch) {
        await saveProduct({ ...seedMatch, sizes: cleanSizes });
        return true;
      }
    }
    await updateDoc(prodRef, { sizes: cleanSizes });
    return true;
  }
  const current = readPreview('products', INITIAL_PRODUCTS);
  writePreview(
    'products',
    current.map((p) => (p.id === productId ? { ...p, sizes: { ...p.sizes, ...cleanSizes } } : p))
  );
  return true;
}

export async function deleteProductById(productId) {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'products', productId));
    return true;
  }
  const current = readPreview('products', INITIAL_PRODUCTS);
  writePreview(
    'products',
    current.filter((p) => p.id !== productId)
  );
  return true;
}

export async function addProductReview(productId, reviewInput) {
  const product = await fetchProductBySlug(productId);
  if (!product) throw new Error('Product not found');

  const review = {
    id: `rev-${Date.now()}`,
    userName: reviewInput.userName.trim(),
    city: reviewInput.city || 'India',
    rating: Math.min(5, Math.max(1, Number(reviewInput.rating) || 5)),
    fitFeedback: reviewInput.fitFeedback || 'True to Oversized',
    comment: reviewInput.comment.trim(),
    createdAt: new Date().toISOString(),
    verified: Boolean(reviewInput.verified),
  };

  const reviews = [review, ...(product.reviews || [])];
  const avg = Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1));
  const reviewPatch = {
    reviews,
    reviewCount: (product.reviewCount || 0) + 1,
    rating: avg,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'products', product.id), reviewPatch);
    return { ...product, ...reviewPatch };
  }

  const updated = { ...product, ...reviewPatch };
  await saveProduct(updated);
  return updated;
}

// ======================================================
// IMAGE UPLOAD (Sanity CDN via /api/upload — free global CDN!)
// ======================================================
export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.error ||
      'Sanity CDN upload failed. Add SANITY_API_WRITE_TOKEN to .env.local and restart Next.js.'
    );
  }

  return data.url;
}

// ======================================================
// COUPONS
// ======================================================
export async function fetchCoupons() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('[Firestore Coupons Fallback]', err.message);
    }
  }
  return readPreview('coupons', INITIAL_COUPONS);
}

export async function validateCoupon(code, subtotal) {
  const coupons = await fetchCoupons();
  const normalized = String(code || '').trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized && c.active);
  if (!coupon) throw new Error('Invalid or expired promo code.');
  if (subtotal < coupon.minOrder) {
    throw new Error(`Minimum order of ₹${coupon.minOrder} required for ${coupon.code}.`);
  }
  const discount =
    coupon.type === 'percent'
      ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount || 99999)
      : Math.min(coupon.value, subtotal);
  return { coupon, discount };
}

export async function createCoupon(couponData) {
  const id = `cpn-${Date.now()}`;
  const coupon = {
    id,
    code: couponData.code.trim().toUpperCase(),
    type: couponData.type || 'percent',
    value: Number(couponData.value),
    minOrder: Number(couponData.minOrder) || 0,
    maxDiscount: Number(couponData.maxDiscount) || 500,
    description: couponData.description || `${couponData.value}${couponData.type === 'percent' ? '%' : '₹'} off`,
    active: true,
    usageCount: 0,
  };
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'coupons', id), coupon);
    return coupon;
  }
  const current = readPreview('coupons', INITIAL_COUPONS);
  writePreview('coupons', [coupon, ...current]);
  return coupon;
}

export async function toggleCouponStatus(id, active) {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'coupons', id), { active });
    return true;
  }
  const current = readPreview('coupons', INITIAL_COUPONS);
  writePreview(
    'coupons',
    current.map((c) => (c.id === id ? { ...c, active } : c))
  );
  return true;
}

export async function deleteCouponById(id) {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'coupons', id));
    return true;
  }
  const current = readPreview('coupons', INITIAL_COUPONS);
  writePreview(
    'coupons',
    current.filter((c) => c.id !== id)
  );
  return true;
}

// ======================================================
// ORDERS
// ======================================================
export async function createOrder(orderPayload) {
  const id = `ord-${Date.now()}`;
  const orderNumber = `DFR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const order = {
    id,
    orderNumber,
    ...orderPayload,
    trackingNumber: '',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'orders', id), order);
    // Client-side product stock writes are admin-only under hardened Firestore rules;
    // ignore permission errors here so customer checkout succeeds cleanly.
    for (const item of order.items || []) {
      try {
        const p = await fetchProductBySlug(item.productId);
        if (p?.sizes && typeof p.sizes[item.size] === 'number') {
          const nextSizes = {
            ...p.sizes,
            [item.size]: Math.max(0, p.sizes[item.size] - item.quantity),
          };
          await updateProductStock(p.id, nextSizes);
        }
      } catch {
        // Non-admin stock decrements should be handled server-side / in Admin Panel
      }
    }
    return order;
  }

  const currentOrders = readPreview('orders', INITIAL_ORDERS);
  writePreview('orders', [order, ...currentOrders]);

  // Decrement stock in preview
  const products = readPreview('products', INITIAL_PRODUCTS);
  const updatedProducts = products.map((p) => {
    const matched = (order.items || []).filter((i) => i.productId === p.id);
    if (!matched.length) return p;
    const nextSizes = { ...p.sizes };
    for (const m of matched) {
      if (typeof nextSizes[m.size] === 'number') {
        nextSizes[m.size] = Math.max(0, nextSizes[m.size] - m.quantity);
      }
    }
    return { ...p, sizes: nextSizes };
  });
  writePreview('products', updatedProducts);
  return order;
}

export async function fetchAllOrders() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await getDocs(collection(db, 'orders'));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
  return readPreview('orders', INITIAL_ORDERS);
}

export async function fetchUserOrders(uid, email) {
  if (isFirebaseConfigured && db && uid) {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.warn('[Firestore User Orders]', err.message);
      return [];
    }
  }
  const all = await fetchAllOrders();
  return all.filter(
    (o) =>
      (uid && o.userId === uid) ||
      (email && o.customerEmail?.toLowerCase() === email.toLowerCase())
  );
}

export async function findOrderByNumberOrId(identifier) {
  const q = String(identifier || '').trim().toUpperCase();
  if (isFirebaseConfigured && db) {
    try {
      const byId = await getDoc(doc(db, 'orders', identifier.trim()));
      if (byId.exists()) return { id: byId.id, ...byId.data() };
      const snap = await getDocs(
        query(collection(db, 'orders'), where('orderNumber', '==', q))
      );
      if (!snap.empty) {
        const first = snap.docs[0];
        return { id: first.id, ...first.data() };
      }
      return null;
    } catch {
      return null;
    }
  }
  const all = await fetchAllOrders();
  return (
    all.find(
      (o) => o.orderNumber?.toUpperCase() === q || o.id?.toUpperCase() === q
    ) || null
  );
}

export async function updateOrderById(orderId, patch) {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'orders', orderId), patch);
    return true;
  }
  const current = readPreview('orders', INITIAL_ORDERS);
  writePreview(
    'orders',
    current.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
  );
  return true;
}

// ======================================================
// USERS, INQUIRIES & NEWSLETTER
// ======================================================
export async function fetchAllUsers() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    } catch {
      return INITIAL_USERS;
    }
  }
  return readPreview('users', INITIAL_USERS);
}

export async function upsertUserRecord(userRecord) {
  const uid = userRecord.uid || `usr-${Date.now()}`;
  const docData = { ...userRecord, uid };
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'users', uid), docData, { merge: true });
    return docData;
  }
  const current = readPreview('users', INITIAL_USERS);
  const exists = current.some((u) => u.uid === uid || u.email?.toLowerCase() === docData.email?.toLowerCase());
  const next = exists
    ? current.map((u) =>
      u.uid === uid || u.email?.toLowerCase() === docData.email?.toLowerCase()
        ? { ...u, ...docData }
        : u
    )
    : [docData, ...current];
  writePreview('users', next);
  return docData;
}

export async function updateUserRole(uid, role) {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'users', uid), { role });
    return true;
  }
  const current = readPreview('users', INITIAL_USERS);
  writePreview(
    'users',
    current.map((u) => (u.uid === uid ? { ...u, role } : u))
  );
  return true;
}

export async function submitInquiry(payload) {
  const entry = {
    id: `inq-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'inquiries', entry.id), entry);
    return entry;
  }
  const current = readPreview('inquiries', INITIAL_INQUIRIES);
  writePreview('inquiries', [entry, ...current]);
  return entry;
}

export async function fetchInquiries() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      return INITIAL_INQUIRIES;
    }
  }
  return readPreview('inquiries', INITIAL_INQUIRIES);
}

export async function subscribeNewsletter(email) {
  const normalized = email.trim().toLowerCase();
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'newsletter', normalized), {
      email: normalized,
      createdAt: new Date().toISOString(),
    });
    return { subscribed: true, coupon: 'FIRSTDROP' };
  }
  const list = readPreview('newsletter', ['arjun.sharma@gmail.com']);
  if (!list.includes(normalized)) writePreview('newsletter', [...list, normalized]);
  return { subscribed: true, coupon: 'FIRSTDROP' };
}

export async function fetchNewsletterList() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'newsletter'));
      return snap.docs.map((d) => d.data().email || d.id);
    } catch {
      return [];
    }
  }
  return readPreview('newsletter', ['arjun.sharma@gmail.com', 'rhea.kapoor@gmail.com']);
}
