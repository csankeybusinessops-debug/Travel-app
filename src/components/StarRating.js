import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, readonly = false }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange && onChange(value === n ? null : n)}
          disabled={readonly}
          style={{
            background: 'none', padding: 0,
            color: n <= (value || 0) ? '#F5A623' : '#D0CCEE',
            cursor: readonly ? 'default' : 'pointer',
            transition: 'color 0.15s',
          }}
        >
          <Star size={18} fill={n <= (value || 0) ? '#F5A623' : 'none'} />
        </button>
      ))}
    </div>
  );
}
