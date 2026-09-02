import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Share2, 
  Compass, 
  Heart, 
  Filter,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { Trip } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

export const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [cloningId, setCloningId] = useState<string | null>(null);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchCommunityTrips = async () => {
    try {
      const res = await api.trips.getCommunityFeed();
      if (res.success) {
        setTrips(res.trips);
      }
    } catch (err: any) {
      error('Failed to load community itineraries', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityTrips();
  }, []);

  const handleForkTrip = async (tripId: string, tripTitle: string) => {
    setCloningId(tripId);
    try {
      const res = await api.trips.duplicateTrip(tripId);
      if (res.success && res.tripId) {
        success('Itinerary Cloned!', `"${tripTitle}" has been added to your personal trips.`);
        navigate(`/itinerary/${res.tripId}/builder`);
      }
    } catch (err: any) {
      error('Clone Failed', err.message || 'Unable to fork itinerary.');
    } finally {
      setCloningId(null);
    }
  };

  const handleShareLink = (trip: Trip) => {
    const shareUrl = `${window.location.origin}/share/${trip.share_slug || trip.id}`;
    navigator.clipboard.writeText(shareUrl);
    success('Link Copied', 'Public itinerary link copied to clipboard.');
  };

  const TAGS = ['All', 'Europe', 'Asia', 'Americas', 'Multi-City', 'Budget', 'Luxury'];

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trip.creator_name && trip.creator_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mesh-bg dark:mesh-bg-dark">
      
      {/* Community Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white p-8 sm:p-10 shadow-2xl shadow-purple-500/20">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80"
          alt="Community Travel"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-purple-100 border border-white/20">
            <Users className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Traveler Community Hub (Screen 10)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Discover & Fork Public Itineraries
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
            Explore curated itineraries designed by globetrotters worldwide. Clone any plan to your workspace in 1 click and customize stops, transit, and agendas.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community itineraries by city, title, or creator..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Community Trips Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading community itineraries...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Community Trips Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to publish a public itinerary or try a different search filter!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const isCloning = cloningId === trip.id;
            return (
              <div 
                key={trip.id}
                className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col group glow-border"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/25 backdrop-blur-md text-white border border-white/20 shadow-xs">
                    {trip.stop_count || 0} Stops
                  </span>

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <h3 className="font-extrabold text-lg leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-purple-300" />
                      <span>{trip.start_date} &bull; {trip.end_date}</span>
                    </p>
                  </div>
                </div>

                {/* Creator Badge & Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={trip.creator_avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'}
                        alt={trip.creator_name || 'Traveler'}
                        className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800 ring-2 ring-purple-500/30 shadow-sm"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                          {trip.creator_name || 'Anonymous Traveler'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-purple-500" />
                          <span>{trip.creator_country || 'Global Adventurer'}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                      {formatCurrency(trip.total_budget, trip.currency || user?.home_currency || 'INR')}
                    </span>
                  </div>

                  {trip.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/share/${trip.share_slug || trip.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleShareLink(trip)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                      title="Copy Public Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isCloning}
                      onClick={() => handleForkTrip(trip.id, trip.title)}
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isCloning ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>1-Click Fork</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
