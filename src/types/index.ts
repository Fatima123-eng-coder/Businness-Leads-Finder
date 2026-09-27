// Core domain types for Business Lead Finder

export interface Business {
  placeId: string;
  name: string;
  phone: string | null; // national phone number
  internationalPhone: string | null;
  address: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUri: string | null;
  businessStatus: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface SearchFilters {
  minRating: number; // 0 = no filter
  phoneRequired: boolean;
  websiteRequired: boolean;
}

export type SortField = 'name' | 'rating' | 'reviewCount';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export interface RecentSearch {
  keyword: string;
  location: string;
  timestamp: number;
}

export interface CachedSearchResult {
  businesses: Business[];
  nextPageToken: string | null;
  searchRequest?: {
    textQuery: string;
    pageSize: number;
    fieldMask: string;
  };
  timestamp: number;
}

// Shape of a single "place" object returned by Places API (New) Text Search
export interface GooglePlaceApiResult {
  id: string;
  displayName?: { text?: string; languageCode?: string };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  formattedAddress?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  businessStatus?: string;
  location?: { latitude?: number; longitude?: number };
}

export interface GooglePlacesTextSearchResponse {
  places?: GooglePlaceApiResult[];
  nextPageToken?: string;
}

export type AppStatus =
  | 'idle'
  | 'loading'
  | 'loading-more'
  | 'success'
  | 'no-results'
  | 'missing-key'
  | 'network-error'
  | 'quota-error'
  | 'error';
