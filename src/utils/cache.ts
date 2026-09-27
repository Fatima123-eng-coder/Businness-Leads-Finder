import type { CachedSearchResult } from '../types';

const CACHE_PREFIX = 'blf_cache_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function buildCacheKey(keyword: string, location: string): string {
  return `${CACHE_PREFIX}${keyword.trim().toLowerCase()}__${location.trim().toLowerCase()}`;
}

/**
 * Reads a cached search result for the given keyword + location, if one
 * exists and is still within the 1-hour TTL. This avoids re-hitting the
 * Places API (and burning Demo Key quota) for identical, recent searches.
 */
export function getCachedSearch(keyword: string, location: string): CachedSearchResult | null {
  try {
    const raw = localStorage.getItem(buildCacheKey(keyword, location));
    if (!raw) return null;

    const parsed: CachedSearchResult = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(buildCacheKey(keyword, location));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedSearch(
  keyword: string,
  location: string,
  result: CachedSearchResult
): void {
  try {
    localStorage.setItem(buildCacheKey(keyword, location), JSON.stringify(result));
  } catch {
    // Storage full or unavailable — fail silently, caching is a nice-to-have.
  }
}

/** Removes expired cache entries so localStorage doesn't grow unbounded. */
export function pruneExpiredCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(CACHE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed: CachedSearchResult = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
