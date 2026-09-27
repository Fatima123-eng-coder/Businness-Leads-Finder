import type { RecentSearch } from '../types';

const RECENT_SEARCHES_KEY = 'blf_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed: RecentSearch[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Adds a search to the front of the recent-searches list, capped at 5, de-duplicated. */
export function addRecentSearch(keyword: string, location: string): RecentSearch[] {
  const existing = getRecentSearches().filter(
    (s) =>
      !(
        s.keyword.trim().toLowerCase() === keyword.trim().toLowerCase() &&
        s.location.trim().toLowerCase() === location.trim().toLowerCase()
      )
  );

  const updated: RecentSearch[] = [
    { keyword: keyword.trim(), location: location.trim(), timestamp: Date.now() },
    ...existing,
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  return updated;
}
