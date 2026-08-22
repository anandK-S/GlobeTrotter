import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  Grid, 
  List, 
  Filter, 
  Compass, 
  Sparkles, 
  SlidersHorizontal,
  MapPin,
  Plane
} from 'lucide-react';
import { Trip } from '../types';
import { api } from '../services/api';
import { TripCard } from '../components/TripCard';
import { useToast } from '../context/ToastContext';

export const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'date' | 'budget'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { success, error } = useToast();

  const fetchTrips = async () => {
    try {
      const res = await api.trips.getMyTrips();
      if (res.success) {
        setTrips(res.trips);
      }
    } catch (err: any) {
      error('Failed to load trips', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (id: string) => {
    try {
      const res = await api.trips.deleteTrip(id);
      if (res.success) {
        setTrips(prev => prev.filter(t => t.id !== id));
        success('Trip Deleted', 'Trip removed successfully.');
      }
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const handleDuplicateTrip = async (id: string) => {
    try {
      const res = await api.trips.duplicateTrip(id);
      if (res.success) {
        success('Trip Duplicated! 📋', 'Created a clone in your trip list.');
        fetchTrips();
      }
    } catch (err: any) {
      error('Duplicate Failed', err.message);
    }
  };

  // Filter & sort logic
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.title.toLowerCase().includes(search.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'date') return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    if (sortBy === 'budget') return (b.total_budget || 0) - (a.total_budget || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-600 dark:text-brand-400 mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Itinerary Manager</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            My Travel Itineraries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage, duplicate, share, and track budgets across all your journeys.
          </p>
        </div>

        <Link
          to="/create-trip"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-sky-600 hover:from-brand-600 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:shadow-lg transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trip name or city..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold w-full sm:w-auto overflow-x-auto">
          {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Sorting & View Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="newest">Recently Created</option>
              <option value="date">Departure Date</option>
              <option value="budget">Highest Budget</option>
            </select>
          </div>

          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-slate-500">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'hover:text-slate-800'}`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'hover:text-slate-800'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Trips Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTrips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={handleDeleteTrip}
              onDuplicate={handleDuplicateTrip}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto">
            <Plane className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">No Trips Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search || statusFilter !== 'all'
              ? 'No itineraries match your current filter or search criteria. Try resetting filters.'
              : 'You have not created any travel itineraries yet. Start planning your dream getaway now!'}
          </p>
          <Link
            to="/create-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md hover:bg-brand-600 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Itinerary</span>
          </Link>
        </div>
      )}

    </div>
  );
};
