import { SANITY_ASSETS } from './sanityAssets';

export const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mwmriieg';
export const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const SANITY_API_VERSION = '2024-10-01';

/**
 * Resolves a local /images/*.jpg path to its uploaded Sanity CDN URL when available.
 */
export function resolveSanityImage(url) {
  if (typeof url !== 'string') return url;
  return SANITY_ASSETS?.[url] || url;
}

/**
 * Recursively maps any /images/*.jpg string in an object/array to its live Sanity CDN URL.
 */
export function resolveCdnDeep(value) {
  if (typeof value === 'string') return resolveSanityImage(value);
  if (Array.isArray(value)) return value.map(resolveCdnDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = resolveCdnDeep(v);
    }
    return out;
  }
  return value;
}

/**
 * Appends Sanity CDN automatic WebP/AVIF format & quality optimization params.
 */
export function optimizeSanityUrl(url, { width = 1400, quality = 85 } = {}) {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}auto=format&fit=max&w=${width}&q=${quality}`;
}
