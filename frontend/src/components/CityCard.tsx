import React, { useState } from 'react';
import { Destination } from '../types';
import { MapPin, Star, Heart, Plus, Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface CityCardProps {
  destination: Destination;
  onAddToTrip?: (destination: Destination) => void;
  isSaved?: boolean;
}

export const CityCard: React.FC<CityCardProps> = ({
  destination,
  onAddToTrip,
  isSaved: initialSaved = false
}) => {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      error('Sign in Required', 'Please log in to save destinations to your wishlist.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.destinations.toggleWishlist(destination.id);
      if (res.success) {
        setSaved(res.saved);
        success(res.saved ? 'Saved to Wishlist! ❤️' : 'Removed from Wishlist', `${destination.name}, ${destination.country}`);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
      
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={destination.hero_image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-xs">
            {destination.continent}
          </span>

          <button
            onClick={handleToggleWishlist}
            disabled={saving}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              saved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
            aria-label="Save to wishlist"
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom City Name & Country */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg leading-tight group-hover:text-sky-200 transition-colors">
              {destination.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-500/90 px-2 py-0.5 rounded-md text-slate-900 shadow-sm">
              <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
              <span>{destination.popularity_score.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-rose-300" />
            <span>{destination.country}</span>
            <span className="ml-2 font-mono text-emerald-300 font-bold">{destination.cost_index}</span>
          </p>
        </div>
      </div>

      {/* Description & Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>

        {destination.best_season && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">Best: <strong>{destination.best_season}</strong></span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {destination.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        {onAddToTrip && (
          <button
            onClick={() => onAddToTrip(destination)}
            className="w-full py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white dark:bg-brand-950/60 dark:hover:bg-brand-600 dark:text-brand-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Itinerary</span>
          </button>
        )}
      </div>

    </div>
  );
};
