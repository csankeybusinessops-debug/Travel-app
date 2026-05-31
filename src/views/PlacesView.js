import React, { useState, useMemo } from 'react';
import { Search, LayoutList, LayoutGrid, SlidersHorizontal, Upload, X } from 'lucide-react';
import PlaceCard from '../components/PlaceCard';
import { CATEGORIES, CITIES } from '../lib/constants';

const SkeletonCard = () => (
  <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-soft)' }}>
    <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
    <div className="skeleton" style={{ height: '12px', width: '40%' }} />
  </div>
);

export default function PlacesView({ places, loading, onOpenPlace, onAdd, onImport }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [visitedFilter, setVisitedFilter] = useState('');
  const [view, setView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = [catFilter, cityFilter, visitedFilter].filter(Boolean).length;

  const filtered = useMemo(() => {
    let p = places;
    if (search) p = p.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter) p = p.filter(x => x.category === catFilter);
    if (cityFilter) p = p.filter(x => x.city === cityFilter);
    if (visitedFilter === 'visited') p = p.filter(x => x.visited);
    if (visitedFilter === 'unvisited') p = p.filter(x => !x.visited);
    return p;
  }, [places, search, catFilter, cityFilter, visitedFilter]);

  const clearFilters = () => { setCatFilter(''); setCityFilter(''); setVisitedFilter(''); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '16px 16px 0', background: 'var(--cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '24px' }}>My Places</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onImport}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--sand)', color: 'var(--ink-soft)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Upload size={14} /> Import
            </button>
            <button
              onClick={() => setView(v => v === 'list' ? 'grid' : 'list')}
              style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--sand)', color: 'var(--ink-soft)' }}
            >
              {view === 'list' ? <LayoutGrid size={18} /> : <LayoutList size={18} />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${places.length} places...`}
            style={{ paddingLeft: '38px', paddingRight: search ? '38px' : '14px' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--ink-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600,
              background: activeFilters > 0 ? 'var(--blue)' : 'var(--sand)',
              color: activeFilters > 0 ? 'white' : 'var(--ink-soft)',
              display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <SlidersHorizontal size={13} />
            Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
          </button>
          {/* Quick category chips */}
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCatFilter(catFilter === c.value ? '' : c.value)}
              style={{
                padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500,
                background: catFilter === c.value ? c.color : 'var(--white)',
                color: catFilter === c.value ? 'white' : 'var(--ink-soft)',
                border: `1.5px solid ${catFilter === c.value ? c.color : 'var(--border)'}`,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {c.emoji}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '12px', border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                <option value="">All cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={visitedFilter} onChange={e => setVisitedFilter(e.target.value)} style={{ flex: 1 }}>
                <option value="">All (visited + unvisited)</option>
                <option value="unvisited">Unvisited only</option>
                <option value="visited">Visited only</option>
              </select>
              {activeFilters > 0 && (
                <button onClick={clearFilters} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Count */}
      <div style={{ padding: '0 16px 8px', fontSize: '12px', color: 'var(--ink-muted)' }}>
        {filtered.length} of {places.length} places
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No places found</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '20px' }}>
              {places.length === 0 ? 'Start by adding your first place!' : 'Try adjusting your filters.'}
            </p>
            {places.length === 0 && (
              <button onClick={onAdd} style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600 }}>
                Add first place
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {filtered.map(p => <PlaceCard key={p.id} place={p} onClick={() => onOpenPlace(p)} view="grid" />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(p => <PlaceCard key={p.id} place={p} onClick={() => onOpenPlace(p)} view="list" className="fade-up" />)}
          </div>
        )}
      </div>
    </div>
  );
}
