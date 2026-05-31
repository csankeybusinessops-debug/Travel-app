import React, { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import { CATEGORIES, CITIES } from '../lib/constants';
import { useToast } from './Toast';

const EMPTY = {
  name: '', category: 'restaurant', city: '', region: '',
  address: '', google_maps_url: '', notes: '', tags: '', rating: '', visited: false,
};

export default function AddPlaceForm({ onSave, onClose, initial = {} }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return; }
    if (!form.google_maps_url.trim()) { toast('Google Maps URL is required', 'error'); return; }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        city: form.city || null,
        region: form.region || null,
        address: form.address || null,
        google_maps_url: form.google_maps_url.trim(),
        notes: form.notes || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        rating: form.rating ? parseInt(form.rating) : null,
        visited: form.visited,
      });
      toast('Place saved!');
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    }
    setSaving(false);
  };

  const label = (text) => (
    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
      {text}
    </label>
  );

  const field = (content, required) => (
    <div style={{ marginBottom: '16px' }}>
      {content}
      {required && <span style={{ color: 'var(--terra)', fontSize: '11px', marginTop: '3px', display: 'block' }}>Required</span>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.5)',
      zIndex: 500, display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        background: 'var(--white)', width: '100%', maxWidth: '560px',
        margin: '0 auto', borderRadius: '24px 24px 0 0',
        maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 20px 12px', display: 'flex', alignItems: 'center',
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <MapPin size={20} color="var(--terra)" style={{ marginRight: '10px' }} />
          <h2 style={{ fontSize: '18px', flex: 1 }}>{initial.id ? 'Edit place' : 'Add a place'}</h2>
          <button onClick={onClose} style={{ background: 'var(--sand)', borderRadius: '50%', padding: '6px', color: 'var(--ink-soft)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {field(<>
            {label('Google Maps URL *')}
            <input
              value={form.google_maps_url}
              onChange={e => set('google_maps_url', e.target.value)}
              placeholder="Paste your Google Maps link here"
            />
          </>)}

          {field(<>
            {label('Name *')}
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cervejaria Ramiro" />
          </>)}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              {label('Category *')}
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              {label('City')}
              <select value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {field(<>
            {label('Address')}
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address (optional)" />
          </>)}

          {field(<>
            {label('Notes')}
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Your personal notes about this place..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </>)}

          {field(<>
            {label('Tags (comma-separated)')}
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. rooftop, seafood, sunset views" />
          </>)}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              {label('Rating')}
              <select value={form.rating} onChange={e => set('rating', e.target.value)}>
                <option value="">No rating</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={form.visited}
                  onChange={e => set('visited', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--blue)' }}
                />
                Already visited
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', background: 'var(--white)' }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
              background: 'var(--blue)', color: 'white', fontWeight: 600,
              fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save place'}
          </button>
        </div>
      </div>
    </div>
  );
}
