import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Calendar, 
  Clock, 
  Eye, 
  PieChart, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Search,
  X,
  Tag
} from 'lucide-react';
import { Trip, TripStop, Destination, MasterActivity, TransportMode, ActivityCategory } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

export const ItineraryBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [selectedStopForActivity, setSelectedStopForActivity] = useState<TripStop | null>(null);

  // Add Stop Form
  const [selectedCityId, setSelectedCityId] = useState('');
  const [customCityName, setCustomCityName] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [stopArrival, setStopArrival] = useState('');
  const [stopDeparture, setStopDeparture] = useState('');
  const [stopTransportMode, setStopTransportMode] = useState<TransportMode>('flight');
  const [stopTransportCost, setStopTransportCost] = useState('150');
  const [stopStayCost, setStopStayCost] = useState('300');
  const [stopNotes, setStopNotes] = useState('');

  // Add Activity Form
  const [activitySearch, setActivitySearch] = useState('');
  const [availableMasterActivities, setAvailableMasterActivities] = useState<MasterActivity[]>([]);
  const [customActTitle, setCustomActTitle] = useState('');
  const [customActCategory, setCustomActCategory] = useState<ActivityCategory>('Sightseeing');
  const [customActCost, setCustomActCost] = useState('35');
  const [customActDuration, setCustomActDuration] = useState('2');
  const [customActTime, setCustomActTime] = useState('10:00');
  const [customActDay, setCustomActDay] = useState(1);

  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const fetchTrip = async () => {
    if (!id) return;
    try {
      const [tripRes, destsRes] = await Promise.all([
        api.trips.getTripById(id),
        api.destinations.getAll()
      ]);
      if (tripRes.success) setTrip(tripRes.trip);
      if (destsRes.success) setDestinations(destsRes.destinations);
    } catch (err: any) {
      error('Error', err.message || 'Could not load itinerary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  // Handle Adding a Stop
  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    let cityName = customCityName.trim();
    let countryName = customCountry.trim();
    let continentName = 'World';
    let lat = 0;
    let lng = 0;

    if (selectedCityId) {
      const dest = destinations.find(d => d.id === selectedCityId);
      if (dest) {
        cityName = dest.name;
        countryName = dest.country;
        continentName = dest.continent;
        lat = dest.lat;
        lng = dest.lng;
      }
    }

    if (!cityName || !countryName) {
      error('Validation', 'Please select a destination or provide city & country name.');
      return;
    }

    try {
      const res = await api.trips.addStop(id, {
        city_name: cityName,
        country: countryName,
        continent: continentName,
        lat,
        lng,
        arrival_date: stopArrival || trip?.start_date,
        departure_date: stopDeparture || trip?.end_date,
        transport_mode: stopTransportMode,
        transport_cost: parseFloat(stopTransportCost) || 0,
        stay_cost: parseFloat(stopStayCost) || 0,
        notes: stopNotes
      });

      if (res.success) {
        success('Stop Added', `${cityName}, ${countryName} added to itinerary.`);
        setAddStopModalOpen(false);
        // Reset form
        setSelectedCityId('');
        setCustomCityName('');
        setCustomCountry('');
        fetchTrip();
      }
    } catch (err: any) {
      error('Error adding stop', err.message);
    }
  };

  // Reordering Stops
  const handleMoveStop = async (index: number, direction: 'up' | 'down') => {
    if (!trip?.stops) return;
    const newStops = [...trip.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    const stopIds = newStops.map(s => s.id);
    try {
      await api.trips.reorderStops(stopIds);
      fetchTrip();
    } catch (err: any) {
      error('Reorder error', err.message);
    }
  };

  // Delete Stop
  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to remove this stop and its activities?')) return;
    try {
      const res = await api.trips.deleteStop(stopId);
      if (res.success) {
        success('Stop Removed', 'Destination removed from route.');
        fetchTrip();
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  // Open Activity Modal for a Stop
  const handleOpenAddActivity = async (stop: TripStop) => {
    setSelectedStopForActivity(stop);
    setAddActivityModalOpen(true);
    setCustomActTitle('');

    // Try finding matching master activities for this city
    const matchedDest = destinations.find(d => d.name.toLowerCase() === stop.city_name.toLowerCase());
    if (matchedDest) {
      const actRes = await api.destinations.getAllActivities({ destinationId: matchedDest.id });
      if (actRes.success) setAvailableMasterActivities(actRes.activities);
    } else {
      setAvailableMasterActivities([]);
    }
  };

  // Add Activity Submit
  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopForActivity) return;

    if (!customActTitle.trim()) {
      error('Validation', 'Activity title is required.');
      return;
    }

    try {
      const res = await api.trips.addActivity(selectedStopForActivity.id, {
        title: customActTitle.trim(),
        category: customActCategory,
        cost: parseFloat(customActCost) || 0,
        duration_hours: parseFloat(customActDuration) || 2,
        scheduled_time: customActTime,
        day_number: customActDay
      });

      if (res.success) {
        success('Activity Added', `${customActTitle} scheduled.`);
        setAddActivityModalOpen(false);
        fetchTrip();
      }
    } catch (err: any) {
      error('Error adding activity', err.message);
    }
  };

  // Quick Pick Master Activity
  const handleQuickAddMasterActivity = async (act: MasterActivity) => {
    if (!selectedStopForActivity) return;
    try {
      const res = await api.trips.addActivity(selectedStopForActivity.id, {
        title: act.title,
        description: act.description,
        category: act.category,
        cost: act.cost,
        duration_hours: act.duration_hours,
        image_url: act.image_url,
        scheduled_time: '10:00',
        day_number: 1
      });
      if (res.success) {
        success('Added Experience', act.title);
        setAddActivityModalOpen(false);
        fetchTrip();
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  // Delete Activity
  const handleDeleteActivity = async (actId: string) => {
    try {
      const res = await api.trips.deleteActivity(actId);
      if (res.success) {
        success('Activity Removed', 'Activity removed from stop.');
        fetchTrip();
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'train': return <Train className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  if (loading || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Itinerary Builder...</p>
      </div>
    );
  }

  const stops = trip.stops || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Fast Navigation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link to="/my-trips" className="hover:text-brand-500">My Trips</Link>
            <span>/</span>
            <span className="text-brand-600 dark:text-brand-400">Itinerary Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {trip.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dates: {trip.start_date} to {trip.end_date} &bull; Target Budget: <strong>{formatCurrency(trip.total_budget, trip.currency)}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAddStopModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add City Stop</span>
          </button>

          <Link
            to={`/itinerary/${trip.id}`}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>View Timeline</span>
          </Link>

          <Link
            to={`/itinerary/${trip.id}/budget`}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <PieChart className="w-4 h-4" />
            <span>Budget Breakdown</span>
          </Link>
        </div>
      </div>

      {/* Main Builder Stream */}
      <div className="space-y-6">
        
        {stops.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Your Route is Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add your first city stop (like Paris, Tokyo, Rome, or Bali) to start scheduling days and activities.
            </p>
            <button
              onClick={() => setAddStopModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add First City Stop</span>
            </button>
          </div>
        ) : (
          stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-200"
            >
              {/* Stop Header Banner */}
              <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  {/* Stop Number Badge */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-black text-base flex items-center justify-center shadow-md">
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        {stop.city_name}, {stop.country}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {getTransportIcon(stop.transport_mode)}
                        <span className="capitalize">{stop.transport_mode}</span>
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Dates: {stop.arrival_date || 'TBD'} &rarr; {stop.departure_date || 'TBD'}</span>
                      <span>&bull;</span>
                      <span>Lodging: <strong>{formatCurrency(stop.stay_cost, trip.currency)}</strong></span>
                      <span>&bull;</span>
                      <span>Transit: <strong>{formatCurrency(stop.transport_cost, trip.currency)}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Reorder and Action Tools */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleMoveStop(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move stop up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveStop(idx, 'down')}
                    disabled={idx === stops.length - 1}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move stop down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenAddActivity(stop)}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white dark:bg-brand-950/60 dark:text-brand-300 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </button>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete stop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Stop Notes if any */}
              {stop.notes && (
                <div className="px-6 py-2 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 border-b border-amber-100 dark:border-amber-900/30">
                  <strong>Stop Tip:</strong> {stop.notes}
                </div>
              )}

              {/* Assigned Activities List */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Planned Activities ({stop.activities?.length || 0})
                  </h4>
                </div>

                {stop.activities && stop.activities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stop.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-3 group hover:border-brand-500/50 transition-all"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                              Day {act.day_number}
                            </span>
                            {act.scheduled_time && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                ⏰ {act.scheduled_time}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                            {act.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{act.category}</span>
                            <span>&bull;</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {act.cost === 0 ? 'Free' : formatCurrency(act.cost, trip.currency)}
                            </span>
                            <span>&bull;</span>
                            <span>{act.duration_hours}h</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No activities assigned yet. Click "Add Activity" to enrich this stop with food tours, sightseeing, or adventures.
                  </p>
                )}
              </div>

            </div>
          ))
        )}

      </div>

      {/* MODAL 1: ADD STOP */}
      <Modal
        isOpen={addStopModalOpen}
        onClose={() => setAddStopModalOpen(false)}
        title="Add Destination Stop"
        subtitle="Select a trending global city or type a custom destination."
      >
        <form onSubmit={handleAddStopSubmit} className="space-y-4">
          
          {/* Preset Destination Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Preset Destination
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => {
                setSelectedCityId(e.target.value);
                if (e.target.value) {
                  setCustomCityName('');
                  setCustomCountry('');
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Choose from Catalog ({destinations.length} Global Cities) --</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.country} ({d.continent} &bull; {d.cost_index})
                </option>
              ))}
            </select>
          </div>

          {/* Or Custom Input */}
          {!selectedCityId && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  City Name *
                </label>
                <input
                  type="text"
                  value={customCityName}
                  onChange={(e) => setCustomCityName(e.target.value)}
                  placeholder="e.g. Florence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="e.g. Italy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>
            </div>
          )}

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Arrival Date
              </label>
              <input
                type="date"
                value={stopArrival}
                onChange={(e) => setStopArrival(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Departure Date
              </label>
              <input
                type="date"
                value={stopDeparture}
                onChange={(e) => setStopDeparture(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Transport & Cost */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Transit Mode
              </label>
              <select
                value={stopTransportMode}
                onChange={(e) => setStopTransportMode(e.target.value as TransportMode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
              >
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="car">Car / Taxi</option>
                <option value="boat">Ferry / Boat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Transit Cost ({getCurrencySymbol(trip.currency).trim()})
              </label>
              <input
                type="number"
                min="0"
                value={stopTransportCost}
                onChange={(e) => setStopTransportCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Lodging Cost ({getCurrencySymbol(trip.currency).trim()})
              </label>
              <input
                type="number"
                min="0"
                value={stopStayCost}
                onChange={(e) => setStopStayCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Stop Notes & Recommendations
            </label>
            <input
              type="text"
              value={stopNotes}
              onChange={(e) => setStopNotes(e.target.value)}
              placeholder="e.g. Stay near city center, purchase 3-day transit pass."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all"
          >
            Add Stop to Itinerary
          </button>
        </form>
      </Modal>

      {/* MODAL 2: ADD ACTIVITY */}
      <Modal
        isOpen={addActivityModalOpen}
        onClose={() => setAddActivityModalOpen(false)}
        title={`Add Activity to ${selectedStopForActivity?.city_name || 'Stop'}`}
        subtitle="Pick from curated recommendations or create a custom plan."
      >
        <div className="space-y-6">
          
          {/* Quick Pick Master Activities */}
          {availableMasterActivities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Curated Experiences for {selectedStopForActivity?.city_name}</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableMasterActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100">{act.title}</h5>
                      <span className="text-slate-500">{act.category} &bull; {formatCurrency(act.cost, trip.currency)} &bull; {act.duration_hours}h</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickAddMasterActivity(act)}
                      className="px-2.5 py-1 rounded-lg bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Activity Form */}
          <form onSubmit={handleAddActivitySubmit} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Or Custom Activity
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Activity Title *</label>
              <input
                type="text"
                required
                value={customActTitle}
                onChange={(e) => setCustomActTitle(e.target.value)}
                placeholder="e.g. Rooftop Dinner or Museum Tour"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={customActCategory}
                  onChange={(e) => setCustomActCategory(e.target.value as ActivityCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Culture">Culture & History</option>
                  <option value="Nightlife">Nightlife</option>
                  <option value="Relax">Relaxation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Estimated Cost ({getCurrencySymbol(trip.currency).trim()})
                </label>
                <input
                  type="number"
                  min="0"
                  value={customActCost}
                  onChange={(e) => setCustomActCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Day #</label>
                <input
                  type="number"
                  min="1"
                  value={customActDay}
                  onChange={(e) => setCustomActDay(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                <input
                  type="time"
                  value={customActTime}
                  onChange={(e) => setCustomActTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Duration (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={customActDuration}
                  onChange={(e) => setCustomActDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all mt-2"
            >
              Add Activity to Stop
            </button>
          </form>

        </div>
      </Modal>

    </div>
  );
};
