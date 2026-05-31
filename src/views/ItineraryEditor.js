import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, Globe, Lock, Trash2, GripVertical, ExternalLink, X, Edit2, Copy, Check } from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';
import { TIME_OF_DAY, CATEGORIES } from '../lib/constants';
import { useToast } from '../components/Toast';

// Place picker modal
function PlacePicker({ places, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const filtered = places.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && p.category !== catFilter) return false;
    return true;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.6)', zIndex: 600, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'var(--white)', width: '100%', maxWidth: '560px', margin: '0 auto', borderRadius: '24px 24px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ flex: 1, fontSize: '17px' }}>Add a place</h3>
          <button onClick={onClose} style={{ background: 'var(--sand)', borderRadius: '50%', padding: '6px', color: 'var(--ink-soft)' }}><X size={16} /></button>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places..." style={{ marginBottom: '8px' }} />
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCatFilter(catFilter === c.value ? '' : c.value)}
                style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, background: catFilter === c.value ? c.color : 'var(--sand)', color: catFilter === c.value ? 'white' : 'var(--ink-soft)' }}>
                {c.emoji}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(place => (
            <div key={place.id} onClick={() => onSelect(place)}
              style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-pale)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{place.name}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                  <CategoryBadge category={place.category} />
                  {place.city && <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{place.city}</span>}
                </div>
              </div>
              <Plus size={16} color="var(--blue)" />
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>No places found</div>}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryEditor({ itineraryId, places, itineraryHook, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToDay, setAddingToDay] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const toast = useToast();

  const { fetchFullItinerary, updateItinerary, deleteDay, addDay, addItem, deleteItem, reorderItems, updateItem } = itineraryHook;

  const reload = useCallback(async () => {
    const full = await fetchFullItinerary(itineraryId);
    setData(full);
    setLoading(false);
  }, [itineraryId, fetchFullItinerary]);

  useEffect(() => { reload(); }, [reload]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const srcDayId = source.droppableId;
    const dstDayId = destination.droppableId;

    const newData = JSON.parse(JSON.stringify(data));
    const srcDay = newData.days.find(d => d.id === srcDayId);
    const dstDay = newData.days.find(d => d.id === dstDayId);
    const [moved] = srcDay.items.splice(source.index, 1);
    moved.day_id = dstDayId;
    dstDay.items.splice(destination.index, 0, moved);
    setData(newData);
    try {
      await reorderItems(dstDayId, dstDay.items);
      if (srcDayId !== dstDayId) await reorderItems(srcDayId, srcDay.items);
    } catch (e) { toast('Failed to reorder', 'error'); reload(); }
  };

  const handleAddDay = async () => {
    if (!data) return;
    const nextNum = (data.days?.length || 0) + 1;
    let date = null;
    if (data.start_date) {
      const d = new Date(data.start_date + 'T00:00:00');
      d.setDate(d.getDate() + nextNum - 1);
      date = d.toISOString().split('T')[0];
    }
    try {
      const day = await addDay(itineraryId, nextNum, date, `Day ${nextNum}`);
      setData(prev => ({ ...prev, days: [...(prev.days || []), { ...day, items: [] }] }));
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDeleteDay = async (dayId) => {
    try {
      await deleteDay(dayId);
      setData(prev => ({ ...prev, days: prev.days.filter(d => d.id !== dayId) }));
      toast('Day removed');
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleAddItem = async (place) => {
    const dayId = addingToDay;
    setAddingToDay(null);
    try {
      const day = data.days.find(d => d.id === dayId);
      const position = day.items.length;
      const item = await addItem(dayId, place.id, position, null, null);
      setData(prev => ({
        ...prev,
        days: prev.days.map(d => d.id === dayId ? { ...d, items: [...d.items, item] } : d),
      }));
      toast(`${place.name} added!`);
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDeleteItem = async (dayId, itemId) => {
    try {
      await deleteItem(itemId);
      setData(prev => ({
        ...prev,
        days: prev.days.map(d => d.id === dayId ? { ...d, items: d.items.filter(i => i.id !== itemId) } : d),
      }));
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleTimeChange = async (itemId, dayId, timeOfDay) => {
    try {
      const updated = await updateItem(itemId, { time_of_day: timeOfDay });
      setData(prev => ({
        ...prev,
        days: prev.days.map(d => d.id === dayId ? { ...d, items: d.items.map(i => i.id === itemId ? updated : i) } : d),
      }));
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleShare = async () => {
    try {
      const updated = await updateItinerary(data.id, { is_public: !data.is_public });
      setData(prev => ({ ...prev, ...updated }));
      if (!data.is_public) toast('Itinerary is now public!');
      else toast('Itinerary is now private');
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/i/${data.share_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Link copied!');
    });
  };

  const handleSaveTitle = async () => {
    if (!titleInput.trim()) return;
    try {
      await updateItinerary(data.id, { title: titleInput.trim() });
      setData(prev => ({ ...prev, title: titleInput.trim() }));
      setEditingTitle(false);
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return (
    <div style={{ padding: '16px' }}>
      <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '16px' }} />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '120px', marginBottom: '10px', borderRadius: 'var(--radius-md)' }} />
      ))}
    </div>
  );

  if (!data) return null;


  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'var(--white)', borderBottom: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <button onClick={onBack} style={{ background: 'var(--sand)', borderRadius: '50%', padding: '7px', color: 'var(--ink-soft)' }}>
            <ArrowLeft size={18} />
          </button>
          {editingTitle ? (
            <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
              <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTitle()} style={{ flex: 1, fontSize: '16px', fontWeight: 600 }} autoFocus />
              <button onClick={handleSaveTitle} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--blue)', color: 'white', fontWeight: 600, fontSize: '13px' }}>Save</button>
              <button onClick={() => setEditingTitle(false)} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--sand)', color: 'var(--ink-soft)' }}><X size={14} /></button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.title}</h2>
              <button onClick={() => { setTitleInput(data.title); setEditingTitle(true); }} style={{ background: 'none', color: 'var(--ink-muted)', padding: '2px' }}>
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Share bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleShare}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
              borderRadius: '100px', fontSize: '12px', fontWeight: 600,
              background: data.is_public ? 'var(--success-bg)' : 'var(--sand)',
              color: data.is_public ? 'var(--success)' : 'var(--ink-soft)',
              border: `1.5px solid ${data.is_public ? 'var(--success)' : 'var(--border)'}`,
            }}
          >
            {data.is_public ? <Globe size={13} /> : <Lock size={13} />}
            {data.is_public ? 'Public' : 'Private'}
          </button>
          {data.is_public && (
            <button
              onClick={handleCopyLink}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                background: copied ? 'var(--success-bg)' : 'var(--blue-pale)',
                color: copied ? 'var(--success)' : 'var(--blue)',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          )}
          <button
            onClick={handleAddDay}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
              borderRadius: '100px', fontSize: '12px', fontWeight: 600,
              background: 'var(--terra-pale)', color: 'var(--terra)',
              marginLeft: 'auto',
            }}
          >
            <Plus size={13} /> Add day
          </button>
        </div>
      </div>

      {/* Days */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 80px' }}>
        {(!data.days || data.days.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>No days yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '16px' }}>Add a day to start building your itinerary.</p>
            <button onClick={handleAddDay} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600 }}>
              Add first day
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {data.days.map((day, dayIdx) => (
              <div key={day.id} style={{ marginBottom: '16px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-soft)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {/* Day header */}
                <div style={{ padding: '12px 14px', background: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>{day.label || `Day ${day.day_number}`}</div>
                    {day.date && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>}
                  </div>
                  <button onClick={() => handleDeleteDay(day.id)} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '5px', color: 'rgba(255,255,255,0.8)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Droppable items */}
                <Droppable droppableId={day.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: '48px', padding: '6px',
                        background: snapshot.isDraggingOver ? 'var(--blue-pale)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {day.items.map((item, idx) => (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                background: snapshot.isDragging ? 'var(--blue-pale)' : 'var(--cream)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '10px 10px',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: snapshot.isDragging ? 'var(--shadow-md)' : 'none',
                                border: `1px solid ${snapshot.isDragging ? 'var(--blue)' : 'transparent'}`,
                              }}
                            >
                              <div {...provided.dragHandleProps} style={{ color: 'var(--ink-muted)', cursor: 'grab' }}>
                                <GripVertical size={15} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.place?.name || 'Unknown place'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                                  {item.place && <CategoryBadge category={item.place.category} />}
                                  <select
                                    value={item.time_of_day || ''}
                                    onChange={e => handleTimeChange(item.id, day.id, e.target.value || null)}
                                    onClick={e => e.stopPropagation()}
                                    style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '6px', width: 'auto', height: 'auto', border: '1px solid var(--border)' }}
                                  >
                                    <option value="">⏰ Time</option>
                                    {TIME_OF_DAY.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                                  </select>
                                </div>
                              </div>
                              {item.place?.google_maps_url && (
                                <a href={item.place.google_maps_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                  style={{ color: 'var(--blue)', padding: '4px', background: 'var(--blue-pale)', borderRadius: '6px' }}>
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              <button onClick={() => handleDeleteItem(day.id, item.id)} style={{ color: 'var(--ink-muted)', padding: '4px', background: 'none' }}>
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add place button */}
                <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-soft)' }}>
                  <button
                    onClick={() => setAddingToDay(day.id)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--cream)', color: 'var(--ink-soft)', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px dashed var(--border)' }}
                  >
                    <Plus size={14} /> Add place
                  </button>
                </div>
              </div>
            ))}
          </DragDropContext>
        )}
      </div>

      {addingToDay && (
        <PlacePicker
          places={places}
          onSelect={handleAddItem}
          onClose={() => setAddingToDay(null)}
        />
      )}
    </div>
  );
}
