import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  DollarSign, 
  Image as ImageIcon, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Lock, 
  Check, 
  Eye 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Currency } from '../types';

const CURATED_COVERS = [
  {
    name: 'Paris Romance',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tokyo Neon & Temples',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Swiss Alpine Peaks',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Santorini Sunset',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bali Tropical Haven',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'New York Skyline',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  }
];

export const CreateTrip: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('2500');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [coverImage, setCoverImage] = useState(CURATED_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  // Calculate duration
  const getDurationDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return -1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const durationDays = getDurationDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error('Validation', 'Please provide a trip title.');
      return;
    }
    if (!startDate || !endDate) {
      error('Validation', 'Please select both start and end dates.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      error('Invalid Date Range', 'End date cannot be earlier than start date.');
      return;
    }

    setIsSubmitting(true);
    const finalCover = customCoverUrl.trim() || coverImage;

    try {
      const res = await api.trips.createTrip({
        title: title.trim(),
        description: description.trim(),
        start_date: startDate,
        end_date: endDate,
        total_budget: parseFloat(totalBudget) || 0,
        currency,
        cover_image: finalCover,
        is_public: isPublic
      });

      if (res.success && res.tripId) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        success('Trip Initiated', 'Now add stops and assign activities in the builder.');
        navigate(`/itinerary/${res.tripId}/builder`);
      }
    } catch (err: any) {
      error('Creation Error', err.message || 'Could not create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-600 dark:text-brand-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Trip Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Plan a New Journey
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up your voyage foundation, date schedule, and target budget before adding stops.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Container (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
            
            {/* Trip Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Trip Name / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. European Odyssey: Paris & Rome"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Duration Display */}
            {durationDays !== null && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                durationDays < 0
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  : 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
              }`}>
                <span>Calculated Trip Span:</span>
                <span className="font-bold">
                  {durationDays < 0 ? '⚠️ End date must be on or after start date' : `${durationDays} Days Duration`}
                </span>
              </div>
            )}

            {/* Budget & Currency Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Total Target Budget
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="2500"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Trip Description & Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is the mood, goal, or special celebration for this trip?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
            </div>

            {/* Curated Cover Image Chooser */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Choose Cover Photo Preset
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {CURATED_COVERS.map((cov) => (
                  <button
                    key={cov.name}
                    type="button"
                    onClick={() => {
                      setCoverImage(cov.url);
                      setCustomCoverUrl('');
                    }}
                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all group text-left ${
                      coverImage === cov.url && !customCoverUrl
                        ? 'border-brand-500 ring-2 ring-brand-500/30 scale-[1.02]'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={cov.url} alt={cov.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white truncate">
                      {cov.name}
                    </span>
                    {coverImage === cov.url && !customCoverUrl && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Cover Input */}
              <div className="mt-3">
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="Or paste a custom image URL (Unsplash, etc.)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Public Sharing Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {isPublic ? <Globe className="w-5 h-5 text-brand-500" /> : <Lock className="w-5 h-5 text-slate-400" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Public Sharing</h4>
                  <p className="text-[11px] text-slate-500">Allow friends to view and fork this itinerary</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-500 via-sky-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Save & Open Itinerary Builder</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Live Preview Card Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Eye className="w-4 h-4 text-brand-500" />
            <span>Live Trip Card Preview</span>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden flex flex-col">
            <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={customCoverUrl.trim() || coverImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500 text-white">
                Upcoming
              </span>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-lg leading-tight line-clamp-1">
                  {title.trim() || 'Your Trip Title Goes Here'}
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Dates: {startDate || 'YYYY-MM-DD'} &bull; {durationDays ? `${durationDays} Days` : 'Multi-Day'}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 line-clamp-2">
                {description.trim() || 'Your personal description and highlights will appear here.'}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Target Budget:</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">
                  ${parseFloat(totalBudget || '0').toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 text-xs text-brand-800 dark:text-brand-300 space-y-1">
            <p className="font-bold">Next in the Builder:</p>
            <p className="text-slate-600 dark:text-slate-400">
              After creating your trip blueprint, you will be able to search global cities, assign stay durations, order flight routes, and pick curated activities.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
