import React from 'react';
import { MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import StarRating from './StarRating';

export default function PlaceCard({ place, onClick, view = 'list' }) {
  if (view === 'grid') {
    return (
      <div onClick={onClick} style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        padding: '16px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-soft)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        {place.visited && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--success)' }}>
            <CheckCircle size={16} />
          </div>
        )}
        <CategoryBadge category={place.category} />
        <h3 style={{ marginTop: '8px', fontSize: '15px', fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.3 }}>{place.name}</h3>
        {place.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: 'var(--ink-muted)', fontSize: '12px' }}>
            <MapPin size={11} /> {place.city}
          </div>
        )}
        {place.rating && <div style={{ marginTop: '8px' }}><StarRating value={place.rating} readonly /></div>}
      </div>
    );
  }

  return (
    <div onClick={onClick} style={{
      background: 'var(--white)', borderRadius: 'var(--radius-md)',
      padding: '14px 16px', cursor: 'pointer',
      border: '1px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', gap: '12px',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-pale)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{place.name}</h3>
          {place.visited && <CheckCircle size={14} color="var(--success)" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          <CategoryBadge category={place.category} />
          {place.city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--ink-muted)', fontSize: '12px' }}>
              <MapPin size={11} /> {place.city}
            </span>
          )}
          {place.rating && <StarRating value={place.rating} readonly />}
        </div>
      </div>
      <a
        href={place.google_maps_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{ color: 'var(--blue)', padding: '6px', borderRadius: '8px', background: 'var(--blue-pale)' }}
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
