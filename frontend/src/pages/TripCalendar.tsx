import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Plus,
  Eye
} from 'lucide-react';
import { Trip, TripStop, StopActivity } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

export const TripCalendar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const { error } = useToast();

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const res = await api.trips.getTripById(id);
        if (res.success) setTrip(res.trip);
      } catch (err: any) {
        error('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (loading || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Calendar Timeline...</p>
      </div>
    );
  }

  // Aggregate all activities by day_number
  const dayActivityMap: Record<number, { stop: TripStop; activity: StopActivity }[]> = {};

  (trip.stops || []).forEach(stop => {
    (stop.activities || []).forEach(act => {
      const day = act.day_number || 1;
      if (!dayActivityMap[day]) dayActivityMap[day] = [];
      dayActivityMap[day].push({ stop, activity: act });
    });
  });

  const availableDays = Object.keys(dayActivityMap).map(Number).sort((a, b) => a - b);
  const maxDay = availableDays.length > 0 ? Math.max(...availableDays, 5) : 7;
  const daysList = Array.from({ length: maxDay }, (_, i) => i + 1);

  const activeDayItems = dayActivityMap[selectedDayNumber] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link to={`/itinerary/${trip.id}`} className="hover:text-brand-500 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Itinerary</span>
            </Link>
            <span>/</span>
            <span className="text-brand-600 dark:text-brand-400">Calendar Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Schedule & Timeflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Day-by-day sequential calendar view for <strong>{trip.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/itinerary/${trip.id}`}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Itinerary Overview</span>
          </Link>
          <Link
            to={`/itinerary/${trip.id}/builder`}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all"
          >
            <span>Edit Stops &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Days Ribbon Selector */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-2 overflow-x-auto">
        {daysList.map((dayNum) => {
          const count = dayActivityMap[dayNum]?.length || 0;
          const isSelected = selectedDayNumber === dayNum;
          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDayNumber(dayNum)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center min-w-[85px] transition-all ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-md scale-[1.03]'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider font-bold opacity-80">Day</span>
              <span className="text-xl font-black">{dayNum}</span>
              <span className="text-[10px] font-semibold mt-0.5 opacity-90">
                {count} {count === 1 ? 'event' : 'events'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Schedule Detail Stream */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-500" />
              <span>Day {selectedDayNumber} Itinerary Agenda</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeDayItems.length} activities scheduled for this day
            </p>
          </div>
        </div>

        {activeDayItems.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-brand-200 dark:border-brand-900 space-y-6">
            {activeDayItems.map(({ stop, activity }, idx) => (
              <div key={activity.id || idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-2 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900"></div>

                <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 shadow-xs space-y-2">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.scheduled_time || '10:00 AM'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {stop.city_name}, {stop.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                        {activity.category}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {activity.cost === 0 ? 'Free' : formatCurrency(activity.cost, trip.currency)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {activity.title}
                  </h3>

                  {activity.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {activity.description}
                    </p>
                  )}

                  <div className="pt-2 text-[11px] text-slate-400">
                    Estimated Duration: <strong>{activity.duration_hours} hours</strong>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Events on Day {selectedDayNumber}</h4>
            <p className="text-xs text-slate-500">
              Go to the Itinerary Builder to assign morning and afternoon activities to this date.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
