export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️', color: '#C4622D' },
  { value: 'bar', label: 'Bar', emoji: '🍷', color: '#7B3FA0' },
  { value: 'cafe', label: 'Café', emoji: '☕', color: '#8B6914' },
  { value: 'activity', label: 'Activity', emoji: '🎯', color: '#1B8A6B' },
  { value: 'attraction', label: 'Attraction', emoji: '🏛️', color: '#1B4B8A' },
  { value: 'accommodation', label: 'Stay', emoji: '🛏️', color: '#4A1B8A' },
  { value: 'other', label: 'Other', emoji: '📍', color: '#6B6B8A' },
];

export const CITIES = [
  'Lisbon', 'Porto', 'Algarve', 'Alentejo', 'Sintra', 'Cascais',
  'Setúbal', 'Évora', 'Faro', 'Braga', 'Coimbra', 'Aveiro',
  'Madeira', 'Azores', 'Other',
];

export const TIME_OF_DAY = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
  { value: 'night', label: 'Night', emoji: '🌙' },
];

export const getCategoryInfo = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
