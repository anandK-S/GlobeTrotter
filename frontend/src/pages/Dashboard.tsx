import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Wallet, 
  Heart, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Plane,
  Star,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Trip, Destination } from '../types';
import { api } from '../services/api';
import { TripCard } from '../components/TripCard';
import { CityCard } from '../components/CityCard';
import { useToast } from '../context/ToastContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, destsRes] = await Promise.all([
          api.trips.getMyTrips(),
          api.destinations.getAll({ limit: '6' })
        ]);
        if (tripsRes.success) setTrips(tripsRes.trips);
        if (destsRes.success) setDestinations(destsRes.destinations);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        success('Trip Cloned', 'Created a duplicate copy in your trips.');
        const tripsRes = await api.trips.getMyTrips();
        if (tripsRes.success) setTrips(tripsRes.trips);
      }
    } catch (err: any) {
      error('Duplicate Failed', err.message);
    }
  };

  const totalPlannedBudget = trips.reduce((sum, t) => sum + (t.total_budget || 0), 0);
  const totalStopsCount = trips.reduce((sum, t) => sum + (t.stop_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 text-white p-8 sm:p-10 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"
          alt="Travel Banner"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25"
        />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-sky-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome to your travel cockpit</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Where to next, {user?.name.split(' ')[0] || 'Traveler'}? ✈️
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
            Build multi-destination itineraries with auto date calculation, real-time budget forecasting, and interactive route mapping.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-600 font-bold text-sm shadow-lg hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-5 h-5 text-brand-500" />
              <span>Plan New Itinerary</span>
            </Link>

            <Link
              to="/explore-cities"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Discover Destinations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Trips */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trips</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {trips.length}
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">Active & upcoming</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stops */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destinations</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {totalStopsCount}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Planned city stops</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Total Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planned Budget</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              ${totalPlannedBudget.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Across all plans</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Home Currency / Preferences */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Travel Style</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 truncate">
              {user?.preferences?.[0] || 'Adventurer'}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              Currency: {user?.home_currency || 'USD'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              <span>Your Recent Trips</span>
            </h2>
            <p className="text-xs text-slate-500">Pick up where you left off</p>
          </div>

          <Link
            to="/my-trips"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All ({trips.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
                onDuplicate={handleDuplicateTrip}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">No Trips Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your very first multi-destination travel itinerary with custom dates and activities.
            </p>
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md hover:bg-brand-600"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Trip</span>
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Global Destinations */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Trending Global Destinations</span>
            </h2>
            <p className="text-xs text-slate-500">Curated popular spots with activities and cost indices</p>
          </div>

          <Link
            to="/explore-cities"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Explore All Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(dest => (
            <CityCard
              key={dest.id}
              destination={dest}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
