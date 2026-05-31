import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else {
      setPlaces(data || []);
      // Cache for offline use
      try { localStorage.setItem('places_cache', JSON.stringify(data)); } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Load cache immediately while fetching
    try {
      const cached = localStorage.getItem('places_cache');
      if (cached) setPlaces(JSON.parse(cached));
    } catch {}
    fetchPlaces();
  }, [fetchPlaces]);

  const addPlace = async (placeData) => {
    const { data, error } = await supabase
      .from('places')
      .insert([placeData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setPlaces(prev => [data, ...prev]);
    return data;
  };

  const updatePlace = async (id, updates) => {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setPlaces(prev => prev.map(p => p.id === id ? data : p));
    return data;
  };

  const deletePlace = async (id) => {
    const { error } = await supabase.from('places').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setPlaces(prev => prev.filter(p => p.id !== id));
  };

  const importPlaces = async (rows) => {
    const results = { imported: 0, skipped: 0, errors: [] };
    const existingNames = new Set(places.map(p => p.name.toLowerCase()));

    for (const row of rows) {
      if (!row.name || !row.google_maps_url) {
        results.errors.push(`Row "${row.name || '?'}": missing required fields`);
        continue;
      }
      if (existingNames.has(row.name.toLowerCase())) {
        results.skipped++;
        continue;
      }
      try {
        await addPlace({
          name: row.name,
          category: row.category || 'other',
          city: row.city || null,
          google_maps_url: row.google_maps_url,
          notes: row.notes || null,
          tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        });
        results.imported++;
        existingNames.add(row.name.toLowerCase());
      } catch (e) {
        results.errors.push(`Row "${row.name}": ${e.message}`);
      }
    }
    return results;
  };

  return { places, loading, error, addPlace, updatePlace, deletePlace, importPlaces, refetch: fetchPlaces };
}
