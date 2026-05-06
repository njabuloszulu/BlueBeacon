import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../../components/map/MapView';
import { useMapLayers } from '../../hooks/useCivilianApi';

export default function LiveMap() {
  const navigate = useNavigate();
  const { geojson, loading, error } = useMapLayers();
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState('All');

  const markers = useMemo(() => {
    const feats = geojson?.features ?? [];
    return feats
      .filter((f) => {
        if (filter === 'All') return true;
        const cat = f.properties?.category || '';
        if (filter === 'Incidents') return cat === 'crime_hotspot';
        if (filter === 'Stations') return cat === 'police_station';
        if (filter === 'Alerts') return cat === 'alert';
        if (filter === 'Safe Zones') return cat === 'safe_zone';
        return true;
      })
      .map((f, i) => {
        const [lng, lat] = f.geometry?.coordinates || [0, 0];
        return {
          id: f.properties?.id || `f-${i}`,
          lat,
          lng,
          title: f.properties?.name || 'Hotspot',
          severity: f.properties?.severity,
        };
      });
  }, [geojson, filter]);

  const onMapClick = useCallback(
    (e) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      navigate('/civilian/report', {
        state: { prefill: { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` } },
      });
    },
    [navigate]
  );

  const reportHere = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        navigate('/civilian/report', {
          state: {
            prefill: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              address: 'My current location',
            },
          },
        });
      },
      () => {}
    );
  };

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Civilian · Live Map</div>
        <div className="page-title">Live Safety Map</div>
        <div className="page-desc">Hotspots and alerts from GET /map/map/layers?role=civilian. Tap the map to start a report at that point.</div>
      </div>

      {loading && <div className="alert alert-in">Loading map data…</div>}
      {error && <div className="alert alert-wa">Could not load layers.</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['All', 'Incidents', 'Stations', 'Alerts', 'Safe Zones'].map((f) => (
          <div
            key={f}
            role="button"
            tabIndex={0}
            onClick={() => setFilter(f)}
            onKeyDown={(e) => e.key === 'Enter' && setFilter(f)}
            style={{
              padding: '4px 12px',
              borderRadius: 10,
              fontSize: 11,
              cursor: 'pointer',
              background: filter === f ? 'var(--bl)' : 'var(--s3)',
              color: filter === f ? 'white' : 'var(--txm)',
              border: filter === f ? 'none' : '1px solid var(--bd)',
            }}
          >
            {f}
          </div>
        ))}
      </div>

      <div className="layout-split">
        <div style={{ minHeight: 460 }}>
          <MapView height={460} markers={markers} onMapClick={onMapClick} />
          <div style={{ fontSize: 10, color: 'var(--txd)', marginTop: 8 }}>
            Tip: click anywhere on the map to open the report wizard with that GPS point.
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10 }}>Layers</div>
          {markers.slice(0, 12).map((pin) => (
            <div
              key={pin.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveId(activeId === pin.id ? null : pin.id)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveId(activeId === pin.id ? null : pin.id)}
              style={{
                padding: 10,
                borderRadius: 7,
                border: `1px solid ${activeId === pin.id ? 'var(--bl)' : 'var(--bd)'}`,
                background: activeId === pin.id ? 'rgba(59,130,246,.08)' : 'var(--s2)',
                cursor: 'pointer',
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600 }}>{pin.title}</div>
              <div style={{ fontSize: 10, color: 'var(--txd)', marginTop: 2 }}>{pin.severity || '—'}</div>
            </div>
          ))}

          <div className="dv" />
          <button type="button" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={reportHere}>
            Report Incident at My Location
          </button>
        </div>
      </div>
    </div>
  );
}
