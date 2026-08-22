import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Star, 
  Plus, 
  Filter, 
  Compass, 
  MapPin,
  Tag
} from 'lucide-react';
import { MasterActivity, Trip, TripStop } from '../types';
import { api } from '../services/api';
import { ActivityCard } from '../components/ActivityCard';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ActivitySearch: React.FC = () => {
  const [activities, setActivities] = useState<MasterActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCost, setMaxCost] = useState<number | undefined>(undefined);

  // Add to Stop Modal State
  const [selectedAct, setSelectedAct] = useState<MasterActivity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [scheduledDay, setScheduledDay] = useState(1);
  const [scheduledTime, setScheduledTime] = useState('10:00');

  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const fetchActivities = async () => {
    try {
      const res = await api.destinations.getAllActivities({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        maxCost: maxCost || undefined
      });
      if (res.success) {
        setActivities(res.activities);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, maxCost]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleOpenAddModal = async (act: MasterActivity) => {
    if (!isAuthenticated) {
      error('Authentication Required', 'Please log in to add activities to your itineraries.');
      return;
    }
    setSelectedAct(act);
    setModalOpen(true);

    try {
      const tripsRes = await api.trips.getMyTrips();
      if (tripsRes.success && tripsRes.trips.length > 0) {
        setUserTrips(tripsRes.trips);
        const firstTripId = tripsRes.trips[0].id;
        setSelectedTripId(firstTripId);

        // Fetch stops for first trip
        const tripDetails = await api.trips.getTripById(firstTripId);
        if (tripDetails.success && tripDetails.trip.stops && tripDetails.trip.stops.length > 0) {
          setSelectedStopId(tripDetails.trip.stops[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTripChange = async (tripId: string) => {
    setSelectedTripId(tripId);
    try {
      const tripDetails = await api.trips.getTripById(tripId);
      if (tripDetails.success && tripDetails.trip.stops && tripDetails.trip.stops.length > 0) {
        setSelectedStopId(tripDetails.trip.stops[0].id);
      } else {
        setSelectedStopId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopId || !selectedAct) {
      error('Validation', 'Please select a destination stop to assign this experience.');
      return;
    }

    try {
      const res = await api.trips.addActivity(selectedStopId, {
        title: selectedAct.title,
        description: selectedAct.description,
        category: selectedAct.category,
        cost: selectedAct.cost,
        duration_hours: selectedAct.duration_hours,
        image_url: selectedAct.image_url,
        scheduled_time: scheduledTime,
        day_number: scheduledDay
      });

      if (res.success) {
        success('Experience Scheduled! 🎟️', `${selectedAct.title} added to your stop.`);
        setModalOpen(false);
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const categories = [
    'All',
    'Sightseeing',
    'Food',
    'Adventure',
    'Culture',
    'Nightlife',
    'Relax'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-600 dark:text-brand-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Travel Experiences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Explore Activities & Tours
        </h1>
        <p className="text-sm text-slate-500">
          Discover culinary crawls, museum skip-the-line tickets, volcano hikes, and cultural masterclasses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences (e.g. Louvre, Shibuya crossing, Catamaran cruise)..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all shrink-0"
          >
            Find
          </button>
        </form>

        {/* Categories & Price Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Caps */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 self-end sm:self-auto">
            <span>Max Price:</span>
            {[undefined, 30, 60, 100].map((val) => (
              <button
                key={val === undefined ? 'any' : val}
                onClick={() => setMaxCost(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  maxCost === val
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {val === undefined ? 'Any' : `<$${val}`}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onAdd={() => handleOpenAddModal(act)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Tag className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">No Activities Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keyword.</p>
        </div>
      )}

      {/* Add To Stop Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add Experience to Itinerary`}
        subtitle={selectedAct?.title || ''}
      >
        {userTrips.length > 0 ? (
          <form onSubmit={handleConfirmAddActivity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Target Trip
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => handleTripChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Destination Stop
              </label>
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
              >
                {userTrips.find(t => t.id === selectedTripId)?.stops?.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    Stop #{idx + 1}: {s.city_name}, {s.country}
                  </option>
                )) || <option value="">-- Choose Stop --</option>}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Schedule Day #</label>
                <input
                  type="number"
                  min="1"
                  value={scheduledDay}
                  onChange={(e) => setScheduledDay(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 text-xs text-brand-800 dark:text-brand-300">
              <span className="font-bold">Cost: ${selectedAct?.cost || 0} &bull; Duration: {selectedAct?.duration_hours}h</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Confirm & Schedule Activity
            </button>
          </form>
        ) : (
          <div className="text-center py-4 text-xs text-slate-500">
            Please create an itinerary first to schedule activities.
          </div>
        )}
      </Modal>

    </div>
  );
};
