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
  Search,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Trip, Destination } from '../types';
import { api } from '../services/api';
import { TripCard } from '../components/TripCard';
import { CityCard } from '../components/CityCard';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 mesh-bg dark:mesh-bg-dark">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 text-white p-8 sm:p-10 shadow-2xl shadow-brand-500/20">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"
          alt="Travel Banner"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-sky-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Personalized Travel Command Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Where to next, <span className="underline decoration-sky-300 decoration-wavy">{user?.name.split(' ')[0] || 'Traveler'}</span>?
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal max-w-xl">
            Build multi-destination itineraries with automatic duration tracking, Leaflet route visualization, and dynamic budget analytics.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-brand-600 font-extrabold text-sm shadow-xl shadow-black/10 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5 text-brand-500" />
              <span>Plan New Itinerary</span>
            </Link>

            <Link
              to="/community"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/25 transition-all hover:scale-105"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>Community Feed</span>
            </Link>

            <Link
              to="/explore-cities"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/25 transition-all hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span>Explore Cities</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Trips */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trips</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {trips.length}
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-0.5">Active & upcoming</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stops */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destinations</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {totalStopsCount}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Planned city stops</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Total Budget formatted by User Currency */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planned Budget</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(totalPlannedBudget, user?.home_currency || 'INR')}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Across all plans</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Travel Style & Home Currency */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travel Style</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 truncate">
              {user?.preferences?.[0] || 'Explorer'}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
              Currency: {user?.home_currency || 'INR'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              <span>Your Recent Journeys</span>
            </h2>
            <p className="text-xs text-slate-500">Pick up where you left off</p>
          </div>

          <Link
            to="/my-trips"
            className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 hover:translate-x-0.5 transition-all"
          >
            <span>View All ({trips.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
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
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
              <Plane className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">No Trips Created Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create your very first multi-destination travel itinerary with custom dates, stay durations, and activities.
              </p>
            </div>
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Trending Global Destinations</span>
            </h2>
            <p className="text-xs text-slate-500">Curated popular spots with activities and cost indices</p>
          </div>

          <Link
            to="/explore-cities"
            className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 hover:translate-x-0.5 transition-all"
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
