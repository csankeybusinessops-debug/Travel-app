import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../lib/constants';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createColorIcon = (color) => L.divIcon({
  html: `<div style="
    width:18px;height:18px;border-radius:50% 50% 50% 0;
    background:${color};transform:rotate(-45deg);
    border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  className: '',
});

export default function MapView({ places, onOpenPlace }) {
  const [catFilter, setCatFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let p = places.filter(x => x.latitude && x.longitude);
    if (catFilter) p = p.filter(x => x.category === catFilter);
    return p;
  }, [places, catFilter]);

  const withoutCoords = places.filter(p => !p.latitude || !p.longitude).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '16px', background: 'var(--cream)', zIndex: 10, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '24px' }}>Map</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '7px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600,
              background: catFilter ? 'var(--blue)' : 'var(--sand)',
              color: catFilter ? 'white' : 'var(--ink-soft)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <SlidersHorizontal size={13} /> Filter
          </button>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              onClick={() => setCatFilter('')}
              style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, background: !catFilter ? 'var(--blue)' : 'var(--white)', color: !catFilter ? 'white' : 'var(--ink-soft)', border: '1.5px solid var(--border)' }}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCatFilter(catFilter === c.value ? '' : c.value)} style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, background: catFilter === c.value ? c.color : 'var(--white)', color: catFilter === c.value ? 'white' : 'var(--ink-soft)', border: `1.5px solid ${catFilter === c.value ? c.color : 'var(--border)'}` }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '6px' }}>
          Showing {filtered.length} places on map
          {withoutCoords > 0 && ` · ${withoutCoords} without coordinates (add lat/lng to show)`}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        {filtered.length === 0 && places.length > 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', zIndex: 5 }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>No places with coordinates</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', maxWidth: '260px' }}>
              Add latitude and longitude when editing a place to see it on the map.
            </p>
          </div>
        ) : (
          <MapContainer
            center={[39.5, -8.0]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map(place => {
              const cat = CATEGORIES.find(c => c.value === place.category);
              return (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={createColorIcon(cat?.color || '#6B6B8A')}
                >
                  <Popup>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '180px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{place.name}</div>
                      {place.city && <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{place.city}</div>}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => onOpenPlace(place)}
                          style={{ flex: 1, padding: '6px', borderRadius: '6px', background: '#1B4B8A', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          View details
                        </button>
                        <a href={place.google_maps_url} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '6px 8px', borderRadius: '6px', background: '#EBF1FA', color: '#1B4B8A', display: 'flex', alignItems: 'center' }}>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
