import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  Globe, 
  Plus, 
  Heart, 
  Star, 
  Calendar, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { Destination, Trip } from '../types';
import { api } from '../services/api';
import { CityCard } from '../components/CityCard';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const CitySearch: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedCostIndex, setSelectedCostIndex] = useState('All');
  
  // Add to Trip Modal
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [targetTripId, setTargetTripId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const fetchDestinations = async () => {
    try {
      const res = await api.destinations.getAll({
        search: search.trim() || undefined,
        continent: selectedContinent !== 'All' ? selectedContinent : undefined,
        cost_index: selectedCostIndex !== 'All' ? selectedCostIndex : undefined
      });
      if (res.success) {
        setDestinations(res.destinations);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [selectedContinent, selectedCostIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDestinations();
  };

  const handleOpenAddToTrip = async (destination: Destination) => {
    if (!isAuthenticated) {
      error('Authentication Required', 'Please log in to add destinations to your trips.');
      return;
    }
    setSelectedDest(destination);
    setModalOpen(true);

    try {
      const tripsRes = await api.trips.getMyTrips();
      if (tripsRes.success && tripsRes.trips.length > 0) {
        setUserTrips(tripsRes.trips);
        setTargetTripId(tripsRes.trips[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAddToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTripId || !selectedDest) return;

    try {
      const res = await api.trips.addStop(targetTripId, {
        city_name: selectedDest.name,
        country: selectedDest.country,
        continent: selectedDest.continent,
        lat: selectedDest.lat,
        lng: selectedDest.lng,
        transport_mode: 'flight',
        transport_cost: 150,
        stay_cost: 300,
        notes: `Added from City Catalog: ${selectedDest.description.substring(0, 100)}...`
      });

      if (res.success) {
        success('Added to Itinerary! ✈️', `${selectedDest.name} added to selected trip.`);
        setModalOpen(false);
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const continents = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];
  const costIndices = ['All', '$', '$$', '$$$', '$$$$'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-600 dark:text-brand-400">
          <Globe className="w-3.5 h-3.5" />
          <span>Global City Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Explore World Destinations
        </h1>
        <p className="text-sm text-slate-500">
          Discover iconic travel capitals, budget estimates, best seasons, and add them directly into your itinerary.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city (e.g. Paris, Tokyo, Bali) or country..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all shrink-0"
          >
            Search
          </button>
        </form>

        {/* Continent Pills & Budget Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Continent tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {continents.map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedContinent === cont
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>

          {/* Budget tier */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-end sm:self-auto">
            <span>Budget Tier:</span>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
              {costIndices.map((ci) => (
                <button
                  key={ci}
                  onClick={() => setSelectedCostIndex(ci)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                    selectedCostIndex === ci
                      ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {ci}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* City Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <CityCard
              key={dest.id}
              destination={dest}
              onAddToTrip={handleOpenAddToTrip}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">No Destinations Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your continent filter or search query.</p>
        </div>
      )}

      {/* Add To Trip Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add ${selectedDest?.name || 'City'} to Itinerary`}
        subtitle="Choose which trip to add this destination stop to."
      >
        {userTrips.length > 0 ? (
          <form onSubmit={handleConfirmAddToTrip} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Your Trip
              </label>
              <select
                value={targetTripId}
                onChange={(e) => setTargetTripId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.start_date} to {t.end_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 text-xs text-brand-800 dark:text-brand-300">
              <p className="font-bold">{selectedDest?.name}, {selectedDest?.country}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Will be appended as the next stop in this itinerary with estimated lodging and flight defaults.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Confirm & Add Stop
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-slate-500">You do not have any trips created yet.</p>
            <Link
              to="/create-trip"
              onClick={() => setModalOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs"
            >
              <span>Create New Trip First &rarr;</span>
            </Link>
          </div>
        )}
      </Modal>

    </div>
  );
};
