import React, { useState } from 'react';
import { MapPin, Map, CalendarDays, Plus } from 'lucide-react';
import './styles/global.css';
import { ToastProvider } from './components/Toast';
import { usePlaces } from './hooks/usePlaces';
import { useItineraries } from './hooks/useItineraries';
import PlacesView from './views/PlacesView';
import MapView from './views/MapView';
import ItinerariesView from './views/ItinerariesView';
import ItineraryEditor from './views/ItineraryEditor';
import PlaceDetail from './components/PlaceDetail';
import AddPlaceForm from './components/AddPlaceForm';
import ImportCSV from './components/ImportCSV';
import SharedItineraryView from './views/SharedItineraryView';

function getShareToken() {
  const path = window.location.pathname;
  const match = path.match(/^\/i\/([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

function AppContent() {
  const [tab, setTab] = useState('places');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingPlace, setEditingPlace] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [openItinerary, setOpenItinerary] = useState(null);

  const placesHook = usePlaces();
  const itineraryHook = useItineraries();

  const { places, loading: placesLoading, addPlace, updatePlace, deletePlace, importPlaces } = placesHook;
  const { itineraries, loading: itinLoading, createItinerary } = itineraryHook;

  const handleSavePlace = async (data) => {
    if (editingPlace && editingPlace.id) {
      await updatePlace(editingPlace.id, data);
      setSelectedPlace(prev => prev ? { ...prev, ...data, id: prev.id } : null);
    } else {
      await addPlace(data);
    }
  };

  const handleEditPlace = (place) => {
    setEditingPlace(place);
    setSelectedPlace(null);
    setShowAddForm(true);
  };

  const handleAddFormClose = () => {
    setShowAddForm(false);
    setEditingPlace(null);
  };

  const tabs = [
    { id: 'places', label: 'Places', icon: MapPin },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'itineraries', label: 'Trips', icon: CalendarDays },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {openItinerary ? (
          <ItineraryEditor
            itineraryId={openItinerary.id}
            places={places}
            itineraryHook={itineraryHook}
            onBack={() => setOpenItinerary(null)}
          />
        ) : (
          <>
            <div style={{ display: tab === 'places' ? 'flex' : 'none', height: '100%', flexDirection: 'column' }}>
              <PlacesView
                places={places}
                loading={placesLoading}
                onOpenPlace={setSelectedPlace}
                onAdd={() => { setEditingPlace(null); setShowAddForm(true); }}
                onImport={() => setShowImport(true)}
              />
            </div>
            <div style={{ display: tab === 'map' ? 'block' : 'none', height: '100%' }}>
              <MapView places={places} onOpenPlace={setSelectedPlace} />
            </div>
            <div style={{ display: tab === 'itineraries' ? 'flex' : 'none', height: '100%', flexDirection: 'column' }}>
              <ItinerariesView
                itineraries={itineraries}
                loading={itinLoading}
                onCreate={createItinerary}
                onOpen={setOpenItinerary}
                onDelete={itineraryHook.deleteItinerary}
              />
            </div>
          </>
        )}
      </div>

      {!openItinerary && (
        <div style={{
          height: 'var(--nav-height)', background: 'var(--white)',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex', alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -2px 12px rgba(27,75,138,0.08)',
          position: 'relative', zIndex: 100,
        }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '3px',
                  background: 'none', color: active ? 'var(--blue)' : 'var(--ink-muted)',
                  fontWeight: active ? 700 : 400, fontSize: '11px',
                  borderTop: active ? '2px solid var(--blue)' : '2px solid transparent',
                  transition: 'color 0.15s',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {t.label}
              </button>
            );
          })}
          <button
            onClick={() => { setEditingPlace(null); setShowAddForm(true); }}
            style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'var(--terra)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(196,98,45,0.4)',
              position: 'absolute', right: '16px', top: '-26px',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {selectedPlace && (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onEdit={handleEditPlace}
          onDelete={deletePlace}
          onUpdate={async (id, updates) => { await updatePlace(id, updates); setSelectedPlace(prev => ({ ...prev, ...updates })); }}
          onAddToItinerary={() => { setSelectedPlace(null); setTab('itineraries'); }}
        />
      )}

      {showAddForm && (
        <AddPlaceForm
          onSave={handleSavePlace}
          onClose={handleAddFormClose}
          initial={editingPlace || {}}
        />
      )}

      {showImport && (
        <ImportCSV
          onImport={importPlaces}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const shareToken = getShareToken();
  if (shareToken) {
    return (
      <ToastProvider>
        <SharedItineraryView token={shareToken} />
      </ToastProvider>
    );
  }
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
