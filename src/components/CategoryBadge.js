import React from 'react';
import { getCategoryInfo } from '../lib/constants';

export default function CategoryBadge({ category, size = 'sm' }) {
  const info = getCategoryInfo(category);
  const pad = size === 'sm' ? '3px 8px' : '5px 12px';
  const fs = size === 'sm' ? '11px' : '13px';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: pad, borderRadius: '100px',
      background: info.color + '18', color: info.color,
      fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      {info.emoji} {info.label}
    </span>
  );
}
