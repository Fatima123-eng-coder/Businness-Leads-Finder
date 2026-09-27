import type { Business, SearchFilters, SortOption } from '../types';

/** Removes duplicate businesses using Place ID as the unique key. */
export function dedupeBusinesses(businesses: Business[]): Business[] {
  const seen = new Set<string>();
  const result: Business[] = [];
  for (const b of businesses) {
    if (seen.has(b.placeId)) continue;
    seen.add(b.placeId);
    result.push(b);
  }
  return result;
}

/** Applies all filters locally — no additional API calls are made. */
export function applyFilters(businesses: Business[], filters: SearchFilters): Business[] {
  return businesses.filter((b) => {
    if (filters.minRating > 0) {
      if (b.rating === null || b.rating < filters.minRating) return false;
    }
    if (filters.phoneRequired && !b.phone && !b.internationalPhone) return false;
    if (filters.websiteRequired && !b.website) return false;
    return true;
  });
}

export function sortBusinesses(businesses: Business[], sort: SortOption): Business[] {
  const sorted = [...businesses];
  const dir = sort.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sort.field) {
      case 'name':
        return a.name.localeCompare(b.name) * dir;
      case 'rating':
        return ((a.rating ?? -1) - (b.rating ?? -1)) * dir;
      case 'reviewCount':
        return ((a.reviewCount ?? -1) - (b.reviewCount ?? -1)) * dir;
      default:
        return 0;
    }
  });

  return sorted;
}

export interface BusinessStats {
  total: number;
  withPhone: number;
  withWebsite: number;
  averageRating: number | null;
}

export function computeStats(businesses: Business[]): BusinessStats {
  const total = businesses.length;
  const withPhone = businesses.filter((b) => b.phone || b.internationalPhone).length;
  const withWebsite = businesses.filter((b) => b.website).length;

  const rated = businesses.filter((b) => typeof b.rating === 'number') as Array<
    Business & { rating: number }
  >;
  const averageRating =
    rated.length > 0
      ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length
      : null;

  return { total, withPhone, withWebsite, averageRating };
}
