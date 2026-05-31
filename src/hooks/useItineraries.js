import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false });
    setItineraries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItineraries(); }, [fetchItineraries]);

  const createItinerary = async (data) => {
    const { data: created, error } = await supabase
      .from('itineraries')
      .insert([data])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setItineraries(prev => [created, ...prev]);
    return created;
  };

  const updateItinerary = async (id, updates) => {
    const { data, error } = await supabase
      .from('itineraries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setItineraries(prev => prev.map(i => i.id === id ? data : i));
    return data;
  };

  const deleteItinerary = async (id) => {
    const { error } = await supabase.from('itineraries').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setItineraries(prev => prev.filter(i => i.id !== id));
  };

  const fetchFullItinerary = async (id) => {
    const { data: itinerary } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single();

    const { data: days } = await supabase
      .from('itinerary_days')
      .select('*')
      .eq('itinerary_id', id)
      .order('day_number');

    const dayIds = (days || []).map(d => d.id);
    let items = [];
    if (dayIds.length > 0) {
      const { data: rawItems } = await supabase
        .from('itinerary_items')
        .select('*, place:places(*)')
        .in('day_id', dayIds)
        .order('position');
      items = rawItems || [];
    }

    return {
      ...itinerary,
      days: (days || []).map(day => ({
        ...day,
        items: items.filter(i => i.day_id === day.id),
      })),
    };
  };

  const fetchPublicItinerary = async (token) => {
    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single();
    if (error || !itinerary) return null;
    return fetchFullItinerary(itinerary.id);
  };

  // Day management
  const addDay = async (itineraryId, dayNumber, date, label) => {
    const { data, error } = await supabase
      .from('itinerary_days')
      .insert([{ itinerary_id: itineraryId, day_number: dayNumber, date, label }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const updateDay = async (dayId, updates) => {
    const { data, error } = await supabase
      .from('itinerary_days')
      .update(updates)
      .eq('id', dayId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const deleteDay = async (dayId) => {
    const { error } = await supabase.from('itinerary_days').delete().eq('id', dayId);
    if (error) throw new Error(error.message);
  };

  // Item management
  const addItem = async (dayId, placeId, position, timeOfDay, notes) => {
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert([{ day_id: dayId, place_id: placeId, position, time_of_day: timeOfDay, notes }])
      .select('*, place:places(*)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const updateItem = async (itemId, updates) => {
    const { data, error } = await supabase
      .from('itinerary_items')
      .update(updates)
      .eq('id', itemId)
      .select('*, place:places(*)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const deleteItem = async (itemId) => {
    const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId);
    if (error) throw new Error(error.message);
  };

  const reorderItems = async (dayId, items) => {
    const updates = items.map((item, index) => ({
      id: item.id,
      day_id: item.day_id,
      place_id: item.place_id,
      position: index,
    }));
    const { error } = await supabase.from('itinerary_items').upsert(updates);
    if (error) throw new Error(error.message);
  };

  return {
    itineraries, loading,
    createItinerary, updateItinerary, deleteItinerary,
    fetchFullItinerary, fetchPublicItinerary,
    addDay, updateDay, deleteDay,
    addItem, updateItem, deleteItem, reorderItems,
    refetch: fetchItineraries,
  };
}
