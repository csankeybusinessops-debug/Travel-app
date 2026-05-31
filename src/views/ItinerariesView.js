import React, { useState } from 'react';
import { Plus, CalendarDays, MapPin, ChevronRight, Globe, Lock } from 'lucide-react';
import { useToast } from '../components/Toast';

function NewItineraryModal({ onCreate, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  

  const handleCreate = async () => {
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-soft)' }}>
          <h2 style={{ fontSize: '18px' }}>New itinerary</h2>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Porto weekend — Sarah & Tom" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional notes" style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Start date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>End date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--sand)', color: 'var(--ink-soft)', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleCreate} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creating...' : 'Create itinerary'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ItinerariesView({ itineraries, loading, onCreate, onOpen, onDelete }) {
  const [showNew, setShowNew] = useState(false);
  

  const handleCreate = async (data) => {
    const it = await onCreate(data);
    setShowNew(false);
    onOpen(it);
  };

  const formatDateRange = (start, end) => {
    if (!start) return 'No dates set';
    const s = new Date(start + 'T00:00:00');
    const e = end ? new Date(end + 'T00:00:00') : null;
    const opts = { month: 'short', day: 'numeric' };
    if (!e) return s.toLocaleDateString('en-GB', opts);
    if (s.getFullYear() === e.getFullYear())
      return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
    return `${s.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
  };

  const getDayCount = (start, end) => {
    if (!start || !end) return null;
    const diff = (new Date(end) - new Date(start)) / 86400000;
    return Math.max(1, Math.round(diff) + 1);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '24px' }}>Itineraries</h1>
        <button
          onClick={() => setShowNew(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600, fontSize: '14px' }}
        >
          <Plus size={16} /> New
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '18px', border: '1px solid var(--border-soft)' }}>
                <div className="skeleton" style={{ height: '18px', width: '60%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '13px', width: '40%' }} />
              </div>
            ))}
          </div>
        ) : itineraries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗓️</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No itineraries yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '20px' }}>Create your first trip plan.</p>
            <button onClick={() => setShowNew(true)} style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600 }}>
              Create itinerary
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {itineraries.map(it => {
              const days = getDayCount(it.start_date, it.end_date);
              return (
                <div
                  key={it.id}
                  style={{
                    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                    padding: '18px', border: '1px solid var(--border-soft)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onClick={() => onOpen(it)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-pale)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      {it.is_public ? <Globe size={13} color="var(--success)" /> : <Lock size={13} color="var(--ink-muted)" />}
                      <h3 style={{ fontSize: '16px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CalendarDays size={12} /> {formatDateRange(it.start_date, it.end_date)}
                      </span>
                      {days && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} /> {days} day{days > 1 ? 's' : ''}
                      </span>}
                    </div>
                    {it.description && <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.description}</p>}
                  </div>
                  <ChevronRight size={18} color="var(--ink-muted)" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNew && <NewItineraryModal onCreate={handleCreate} onClose={() => setShowNew(false)} />}
    </div>
  );
}
