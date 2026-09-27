import type {
  Business,
  GooglePlaceApiResult,
  GooglePlacesTextSearchResponse,
} from '../types';

const PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

// We only request the fields we actually display, to keep each request
// as cheap as possible against the Demo Key's daily quota.
export const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.formattedAddress',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.businessStatus',
  'places.location',
  'nextPageToken',
].join(',');

export class PlacesApiError extends Error {
  kind: 'missing-key' | 'network-error' | 'quota-error' | 'error';

  constructor(kind: PlacesApiError['kind'], message: string) {
    super(message);
    this.kind = kind;
    this.name = 'PlacesApiError';
  }
}

function getApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY as string | undefined;
  if (!key || key.trim().length === 0) {
    throw new PlacesApiError(
      'missing-key',
      'Google Maps Platform API key is missing. Set VITE_GOOGLE_MAPS_PLATFORM_KEY in your .env file.'
    );
  }
  return key;
}

function mapApiResultToBusiness(place: GooglePlaceApiResult): Business {
  return {
    placeId: place.id,
    name: place.displayName?.text ?? 'Unnamed Business',
    phone: place.nationalPhoneNumber ?? null,
    internationalPhone: place.internationalPhoneNumber ?? null,
    address: place.formattedAddress ?? null,
    website: place.websiteUri ?? null,
    rating: typeof place.rating === 'number' ? place.rating : null,
    reviewCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
    googleMapsUri: place.googleMapsUri ?? null,
    businessStatus: place.businessStatus ?? null,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
  };
}

export interface TextSearchRequest {
  textQuery: string;
  pageSize: number;
  fieldMask: string;
}

export interface TextSearchParams {
  request: TextSearchRequest;
  pageToken?: string;
}

export interface TextSearchResult {
  businesses: Business[];
  nextPageToken: string | null;
}

/**
 * Calls Places API (New) Text Search to find businesses matching a
 * keyword + city/area query. No browser geolocation is used; the
 * location is expressed purely as text (e.g. "Bakery in Lahore").
 */
export async function searchBusinesses(
  params: TextSearchParams
): Promise<TextSearchResult> {
  const apiKey = getApiKey();
  const { request, pageToken } = params;
  const { fieldMask, ...requestBody } = request;
  const body = pageToken ? { ...requestBody, pageToken } : requestBody;

  let response: Response;
  try {
    response = await fetch(PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PlacesApiError(
      'network-error',
      'Could not reach Google Places API. Check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new PlacesApiError(
        'quota-error',
        'Daily quota for the Google Maps Demo Key has been exceeded. Please try again later.'
      );
    }
    if (response.status === 403 || response.status === 401) {
      throw new PlacesApiError(
        'missing-key',
        'The API key was rejected. Verify VITE_GOOGLE_MAPS_PLATFORM_KEY is a valid, unrestricted-enough key with Places API (New) enabled.'
      );
    }

    let details = '';
    try {
      const errJson = await response.json();
      details = errJson?.error?.message ?? '';
    } catch {
      // ignore parse failure
    }
    throw new PlacesApiError(
      'error',
      details || `Places API request failed with status ${response.status}.`
    );
  }

  let data: GooglePlacesTextSearchResponse;
  try {
    data = await response.json();
  } catch {
    throw new PlacesApiError('error', 'Received an unreadable response from Places API.');
  }

  const places = data.places ?? [];
  return {
    businesses: places.map(mapApiResultToBusiness),
    nextPageToken: data.nextPageToken ?? null,
  };
}
