let loadPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API exactly once.
 * Only used for the optional map view — the core search flow never
 * needs this script and works entirely off the Places API (New) REST calls.
 */
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapInstance;
        Marker: new (opts: Record<string, unknown>) => GoogleMarkerInstance;
        InfoWindow: new (opts: Record<string, unknown>) => GoogleInfoWindowInstance;
        LatLngBounds: new () => GoogleLatLngBoundsInstance;
      };
    };
  }
}

export interface GoogleMapInstance {
  fitBounds: (bounds: GoogleLatLngBoundsInstance) => void;
  setZoom: (zoom: number) => void;
  setCenter: (latLng: { lat: number; lng: number }) => void;
}

export interface GoogleMarkerInstance {
  addListener: (event: string, handler: () => void) => void;
  setMap: (map: GoogleMapInstance | null) => void;
}

export interface GoogleInfoWindowInstance {
  open: (map: GoogleMapInstance, marker: GoogleMarkerInstance) => void;
  setContent: (content: string) => void;
}

export interface GoogleLatLngBoundsInstance {
  extend: (latLng: { lat: number; lng: number }) => void;
}
