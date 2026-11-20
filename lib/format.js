export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function calcDiscountPercent(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTotalStock(sizes = {}) {
  return Object.values(sizes).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

export const ORDER_STATUS_META = {
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-900 border-amber-300', step: 1 },
  confirmed: { label: 'Confirmed', color: 'bg-sky-100 text-sky-900 border-sky-300', step: 2 },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', step: 3 },
  shipped: { label: 'Shipped', color: 'bg-neutral-900 text-white border-neutral-900', step: 4 },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', step: 5 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-900 border-red-300', step: 0 },
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];
