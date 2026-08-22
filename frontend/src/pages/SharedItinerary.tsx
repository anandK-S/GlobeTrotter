import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Share2, 
  Copy, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Check, 
  Globe, 
  Plane,
  Heart,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trip } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

export const SharedItinerary: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedTrip = async () => {
      if (!slug) return;
      try {
        const res = await api.trips.getPublicTrip(slug);
        if (res.success) setTrip(res.trip);
      } catch (err: any) {
        error('Not Found', 'This shared itinerary does not exist or has been made private.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedTrip();
  }, [slug]);

  // Copy / Fork Trip Action
  const handleForkTrip = async () => {
    if (!isAuthenticated) {
      info('Login Required', 'Please log in or sign up to copy this itinerary to your account.');
      navigate('/login');
      return;
    }
    if (!trip) return;

    setCopying(true);
    try {
      const res = await api.trips.duplicateTrip(trip.id);
      if (res.success && res.tripId) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        success('Trip Forked', 'Successfully copied this itinerary to your personal account.');
        navigate(`/itinerary/${res.tripId}`);
      }
    } catch (err: any) {
      error('Copy Failed', err.message || 'Could not fork itinerary');
    } finally {
      setCopying(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    success('Link Copied', 'Public URL copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareSocial = (platform: 'whatsapp' | 'twitter') => {
    const text = encodeURIComponent(`Check out this travel itinerary "${trip?.title}" on GlobeTrotter!`);
    const url = encodeURIComponent(window.location.href);
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Shared Itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Globe className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Itinerary Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested trip may have expired, or the creator might have set it to private.
        </p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md">
          Explore GlobeTrotter
        </Link>
      </div>
    );
  }

  const stops = trip.stops || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Public Banner */}
      <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-brand-800 dark:text-brand-300 font-semibold">
          <Globe className="w-4 h-4 text-brand-500 shrink-0" />
          <span>Public Community Itinerary &bull; Created by <strong>{trip.creator_name || 'GlobeTrotter Traveler'}</strong></span>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShareSocial('whatsapp')}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
          >
            WhatsApp
          </button>
          <button
            onClick={() => handleShareSocial('twitter')}
            className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors"
          >
            Twitter / X
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 transition-colors flex items-center gap-1"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community Inspiration</span>
            </span>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {trip.title}
            </h1>

            {trip.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {trip.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/80 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                {trip.start_date} to {trip.end_date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                {stops.length} Stops Connected
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Est. Budget: {formatCurrency(trip.total_budget, trip.currency)}
              </span>
            </div>
          </div>

          {/* Fork / Copy Trip CTA */}
          <button
            onClick={handleForkTrip}
            disabled={copying}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            {copying ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Trip to My Account</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-500" />
          <span>Interactive Route Map</span>
        </h3>
        <MapView stops={stops} className="h-96 w-full rounded-3xl" />
      </div>

      {/* Day by Day Breakdown */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
          Day-by-Day Journey Breakdown
        </h3>

        {stops.map((stop, sIdx) => (
          <div
            key={stop.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {sIdx + 1}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {stop.city_name}, {stop.country}
                </h4>
                <p className="text-xs text-slate-500">
                  Dates: {stop.arrival_date || 'Date TBD'} to {stop.departure_date || 'Date TBD'} &bull; Transit: <strong className="capitalize">{stop.transport_mode}</strong>
                </p>
              </div>
            </div>

            {stop.activities && stop.activities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {stop.activities.map(act => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-brand-600 dark:text-brand-400">Day {act.day_number}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{act.cost === 0 ? 'Free' : `$${act.cost}`}</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{act.title}</p>
                    <p className="text-[11px] text-slate-500">{act.category} &bull; {act.duration_hours}h</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
