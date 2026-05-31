import React, { useState } from 'react';
import { X, ExternalLink, MapPin, Edit3, Trash2, CheckCircle, Circle, CalendarPlus, Tag } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import StarRating from './StarRating';
import { useToast } from './Toast';

export default function PlaceDetail({ place, onClose, onEdit, onDelete, onUpdate, onAddToItinerary }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();

  const toggleVisited = async () => {
    try {
      await onUpdate(place.id, { visited: !place.visited });
      toast(place.visited ? 'Marked as unvisited' : 'Marked as visited! ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async () => {
    try {
      await onDelete(place.id);
      toast('Place deleted');
      onClose();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.5)',
      zIndex: 400, display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--cream)', width: '100%', maxWidth: '560px',
          margin: '0 auto', borderRadius: '24px 24px 0 0',
          maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'var(--blue)', padding: '24px 20px 20px',
          color: 'white', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '6px', color: 'white',
          }}>
            <X size={18} />
          </button>
          <CategoryBadge category={place.category} size="md" />
          <h2 style={{ marginTop: '10px', fontSize: '22px', lineHeight: 1.2, color: 'white' }}>{place.name}</h2>
          {place.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', opacity: 0.8, fontSize: '13px' }}>
              <MapPin size={12} /> {place.city}{place.region ? `, ${place.region}` : ''}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {/* Rating + Visited */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <StarRating value={place.rating} readonly />
            <button
              onClick={toggleVisited}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '100px', fontWeight: 500, fontSize: '13px',
                background: place.visited ? 'var(--success-bg)' : 'var(--sand)',
                color: place.visited ? 'var(--success)' : 'var(--ink-soft)',
                border: `1.5px solid ${place.visited ? 'var(--success)' : 'var(--border)'}`,
              }}
            >
              {place.visited ? <CheckCircle size={14} /> : <Circle size={14} />}
              {place.visited ? 'Visited' : 'Not visited'}
            </button>
          </div>

          {/* Address */}
          {place.address && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Address</div>
              <div style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>{place.address}</div>
            </div>
          )}

          {/* Notes */}
          {place.notes && (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--radius-md)',
              padding: '14px', marginBottom: '16px', border: '1px solid var(--border-soft)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Notes</div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>{place.notes}</p>
            </div>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Tag size={13} color="var(--ink-muted)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {place.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '4px 10px', borderRadius: '100px',
                    background: 'var(--blue-pale)', color: 'var(--blue)',
                    fontSize: '12px', fontWeight: 500,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Maps button */}
          <a
            href={place.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: 'var(--radius-md)',
              background: 'var(--terra-pale)', color: 'var(--terra)',
              fontWeight: 600, fontSize: '14px', marginBottom: '12px',
              border: '1px solid var(--terra-light)',
            }}
          >
            <ExternalLink size={16} /> Open in Google Maps
          </a>

          {onAddToItinerary && (
            <button
              onClick={() => onAddToItinerary(place)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'var(--blue-pale)', color: 'var(--blue)',
                fontWeight: 600, fontSize: '14px', marginBottom: '20px',
                border: '1px solid var(--blue)',
              }}
            >
              <CalendarPlus size={16} /> Add to itinerary
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border-soft)',
          display: 'flex', gap: '10px', background: 'var(--white)',
        }}>
          <button
            onClick={() => onEdit(place)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '11px', borderRadius: 'var(--radius-md)',
              background: 'var(--sand)', color: 'var(--ink-soft)',
              fontWeight: 600, fontSize: '14px',
            }}
          >
            <Edit3 size={15} /> Edit
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '11px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--danger-bg)', color: 'var(--danger)',
                fontWeight: 600, fontSize: '14px',
              }}
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              onClick={handleDelete}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '11px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--danger)', color: 'white',
                fontWeight: 600, fontSize: '14px',
              }}
            >
              <Trash2 size={15} /> Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
