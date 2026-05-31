import React, { useState, useEffect } from 'react';
import { useItineraries } from '../hooks/useItineraries';
import { ExternalLink, MapPin, Calendar, Globe } from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';
import { TIME_OF_DAY } from '../lib/constants';

export default function SharedItineraryView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { fetchPublicItinerary } = useItineraries();

  useEffect(() => {
    fetchPublicItinerary(token).then(result => {
      if (!result) setNotFound(true);
      else setData(result);
      setLoading(false);
    });
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
        <p style={{ color: 'var(--ink-muted)' }}>Loading itinerary...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Not found</h2>
        <p style={{ color: 'var(--ink-muted)' }}>This itinerary is private or doesn't exist.</p>
      </div>
    </div>
  );

  const formatDateRange = (start, end) => {
    if (!start) return null;
    const s = new Date(start + 'T00:00:00');
    const e = end ? new Date(end + 'T00:00:00') : null;
    const opts = { month: 'long', day: 'numeric', year: 'numeric' };
    if (!e) return s.toLocaleDateString('en-GB', opts);
    return `${s.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })} – ${e.toLocaleDateString('en-GB', opts)}`;
  };

  const getTimeLabel = (val) => TIME_OF_DAY.find(t => t.value === val);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Hero header */}
      <div style={{ background: 'var(--blue)', padding: '48px 24px 40px', color: 'white' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', opacity: 0.7, fontSize: '13px' }}>
            <Globe size={13} /> Shared itinerary
          </div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Playfair Display, serif', lineHeight: 1.2, marginBottom: '12px', color: 'white' }}>
            {data.title}
          </h1>
          {data.description && <p style={{ opacity: 0.85, fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>{data.description}</p>}
          {(data.start_date || data.end_date) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8, fontSize: '14px' }}>
              <Calendar size={14} /> {formatDateRange(data.start_date, data.end_date)}
            </div>
          )}
        </div>
      </div>

      {/* Days */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {(data.days || []).map((day, idx) => (
          <div key={day.id} style={{ marginBottom: '24px' }}>
            {/* Day label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--blue)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '14px', flexShrink: 0,
              }}>{idx + 1}</div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{day.label || `Day ${day.day_number}`}</h2>
                {day.date && <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                  {new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>}
              </div>
            </div>

            {/* Items */}
            {day.items.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px', background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
                No places planned for this day
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '24px', borderLeft: '2px solid var(--blue-pale)', marginLeft: '17px' }}>
                {day.items.map((item, itemIdx) => {
                  const timeInfo = item.time_of_day ? getTimeLabel(item.time_of_day) : null;
                  return (
                    <div key={item.id} style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '14px 16px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)', marginLeft: '-13px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          {timeInfo && (
                            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {timeInfo.emoji} {timeInfo.label}
                            </div>
                          )}
                          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{item.place?.name}</h3>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.place && <CategoryBadge category={item.place.category} />}
                            {item.place?.city && (
                              <span style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin size={11} /> {item.place.city}
                              </span>
                            )}
                          </div>
                          {item.place?.address && <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>{item.place.address}</p>}
                          {item.notes && <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '6px', fontStyle: 'italic' }}>{item.notes}</p>}
                        </div>
                        {item.place?.google_maps_url && (
                          <a href={item.place.google_maps_url} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '8px', background: 'var(--terra-pale)', borderRadius: '8px', color: 'var(--terra)', flexShrink: 0 }}>
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border-soft)', color: 'var(--ink-muted)', fontSize: '12px' }}>
        Made with ❤️ for Portugal
      </div>
    </div>
  );
}
