import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback, useMemo, useState } from 'react';

const defaultCenter = { lat: -33.9249, lng: 18.4241 };

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: 8 };

/**
 * @param {object} props
 * @param {{ lat: number, lng: number }} [props.center]
 * @param {import('@react-google-maps/api').google.maps.MapMouseEvent} props.onMapClick
 * @param {Array<{ id: string, lat: number, lng: number, title?: string, severity?: string }>} [props.markers]
 */
export default function MapView({ center, onMapClick, markers = [], height = 420 }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'bluebeacon-map-script',
    googleMapsApiKey: key,
  });

  const initialCenter = useMemo(() => center || defaultCenter, [center]);
  const [mapCenter, setMapCenter] = useState(initialCenter);

  const onMapClickInternal = useCallback(
    (e) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMapCenter({ lat, lng });
      }
      if (typeof onMapClick === 'function') onMapClick(e);
    },
    [onMapClick]
  );

  if (!key || loadError) {
    return (
      <div className="map-box" style={{ height, position: 'relative' }}>
        <div className="map-grid" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: 'var(--txm)',
            textAlign: 'center',
            padding: 16,
          }}
        >
          {loadError
            ? 'Could not load Google Maps.'
            : 'Set VITE_GOOGLE_MAPS_KEY in .env.local to enable the live map.'}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-box" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading map…
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height: '100%' }}
        center={mapCenter}
        zoom={13}
        onClick={onMapClickInternal}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {markers.map((m) => (
          <Marker key={m.id} position={{ lat: m.lat, lng: m.lng }} title={m.title} />
        ))}
        <Marker position={mapCenter} />
      </GoogleMap>
    </div>
  );
}
