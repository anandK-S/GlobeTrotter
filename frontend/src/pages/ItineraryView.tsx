import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Map as MapIcon, 
  List, 
  Printer, 
  Share2, 
  Edit3, 
  PieChart, 
  Sparkles, 
  Plane, 
  Train, 
  Bus, 
  Car,
  CheckCircle2,
  Copy,
  Plus,
  Compass
} from 'lucide-react';
import { Trip, TripStop } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

export const ItineraryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const res = await api.trips.getTripById(id);
        if (res.success) setTrip(res.trip);
      } catch (err: any) {
        error('Error', err.message || 'Could not load itinerary details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleShare = () => {
    if (!trip) return;
    const url = `${window.location.origin}/share/${trip.share_slug || trip.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    success('Link Copied', 'Public shareable link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading visual itinerary...</p>
      </div>
    );
  }

  const stops = trip.stops || [];
  const metrics = trip.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white">
                {trip.status?.toUpperCase() || 'UPCOMING'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                {stops.length} Destinations Connected
              </span>
            </div>

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
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Est. Total: <strong>{formatCurrency(metrics?.total_estimated_cost || 0, trip.currency)}</strong> / Budget: <strong>{formatCurrency(trip.total_budget, trip.currency)}</strong>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <Link
              to={`/itinerary/${trip.id}/builder`}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Builder</span>
            </Link>

            <Link
              to={`/itinerary/${trip.id}/budget`}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <PieChart className="w-4 h-4" />
              <span>Budget</span>
            </Link>
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Timeline & Day Plan</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Interactive Route Map</span>
          </button>
        </div>

        <Link
          to={`/itinerary/${trip.id}/calendar`}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <span>Open Calendar View &rarr;</span>
        </Link>
      </div>

      {/* View Mode 1: Interactive Map */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <MapView
            stops={stops}
            selectedStopId={selectedStopId}
            onSelectStop={(s) => setSelectedStopId(s.id)}
            currency={trip?.currency}
            className="h-[520px] w-full rounded-3xl"
          />

          {stops.length > 0 ? (
            /* City preview chips below map */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stops.map((stop, idx) => (
                <button
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedStopId === stop.id
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {stop.city_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{stop.country}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Add destination stops to view interactive flight paths and markers on this map.
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Day-by-Day Timeline Stream */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {stops.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Your Itinerary Has No Stops Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Add destination cities (Paris, Tokyo, Rome, Bali, etc.) in the builder to start scheduling daily activities and calculating budgets.
                </p>
              </div>
              <Link
                to={`/itinerary/${trip.id}/builder`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Open Builder to Add Stops</span>
              </Link>
            </div>
          ) : (
            stops.map((stop, sIdx) => (
              <div
                key={stop.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
              >
                {/* City Stop Banner */}
                <div className="p-6 bg-gradient-to-r from-slate-50 to-brand-50/30 dark:from-slate-800/50 dark:to-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {sIdx + 1}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                        {stop.city_name}, {stop.country}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dates: {stop.arrival_date || 'Date TBD'} {stop.departure_date ? `to ${stop.departure_date}` : ''} &bull; Transit: <strong className="capitalize">{stop.transport_mode}</strong> ({formatCurrency(stop.transport_cost || 0, trip.currency)}) &bull; Lodging: <strong>{formatCurrency(stop.stay_cost || 0, trip.currency)}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {stop.activities?.length || 0} Activities Planned
                  </span>
                </div>

                {/* Day-Wise Activities Layout */}
                <div className="p-6">
                  {stop.activities && stop.activities.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-brand-200 dark:border-brand-900 space-y-6">
                      {stop.activities.map((act) => (
                        <div key={act.id} className="relative group">
                          {/* Timeline Pin */}
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900"></div>

                          {/* Activity Card Block */}
                          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-brand-500/50 shadow-xs transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                                  Day {act.day_number}
                                </span>
                                {act.scheduled_time && (
                                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {act.scheduled_time}
                                  </span>
                                )}
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {act.category}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {act.cost === 0 ? 'Free Activity' : formatCurrency(act.cost, trip.currency)}
                              </div>
                            </div>

                            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                              {act.title}
                            </h3>

                            {act.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Duration: <strong>{act.duration_hours} hours</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400 italic mb-2">
                        No scheduled activities for this stop yet.
                      </p>
                      <Link
                        to={`/itinerary/${trip.id}/builder`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule Activities in Builder</span>
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
