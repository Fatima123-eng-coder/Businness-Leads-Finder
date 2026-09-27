import { useEffect, useRef, useState } from 'react';
import type { Business } from '../types';
import { loadGoogleMapsScript, type GoogleMapInstance, type GoogleMarkerInstance } from '../utils/loadGoogleMapsScript';

interface MapViewProps {
  businesses: Business[];
  apiKey: string;
}

export default function MapView({ businesses, apiKey }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locatable = businesses.filter(
    (b) => typeof b.latitude === 'number' && typeof b.longitude === 'number'
  );

  useEffect(() => {
    if (!visible || !mapContainerRef.current) return;

    let cancelled = false;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled || !mapContainerRef.current || !window.google) return;

        const bounds = new window.google.maps.LatLngBounds();
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: 31.5204, lng: 74.3587 },
          zoom: 12,
        });
        mapRef.current = map;

        // Clear any previous markers before drawing new ones.
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const infoWindow = new window.google.maps.InfoWindow({});

        locatable.forEach((b) => {
          const position = { lat: b.latitude as number, lng: b.longitude as number };
          const marker = new window.google!.maps.Marker({
            position,
            map,
            title: b.name,
          });
          marker.addListener('click', () => {
            infoWindow.setContent(
              `<strong>${b.name}</strong><br/>${b.address ?? ''}${
                b.rating !== null ? `<br/>Rating: ${b.rating} ★` : ''
              }`
            );
            infoWindow.open(map, marker);
          });
          markersRef.current.push(marker);
          bounds.extend(position);
        });

        if (locatable.length > 0) {
          map.fitBounds(bounds);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Google Maps. Check your API key and internet connection.');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, businesses]);

  if (locatable.length === 0) {
    return null;
  }

  return (
    <div className="map-section">
      <button type="button" className="btn btn-secondary" onClick={() => setVisible((v) => !v)}>
        {visible ? 'Hide Map View' : `Show Map View (${locatable.length} pins)`}
      </button>

      {error && <p className="status-error-inline">{error}</p>}

      {visible && <div className="map-container" ref={mapContainerRef} />}
    </div>
  );
}
