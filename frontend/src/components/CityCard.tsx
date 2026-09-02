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
        success(res.saved ? 'Saved to Wishlist' : 'Removed from Wishlist', `${destination.name}, ${destination.country}`);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col glow-border">
      
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={destination.hero_image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-xs">
            {destination.continent}
          </span>

          <button
            onClick={handleToggleWishlist}
            disabled={saving}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
              saved
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black/35 text-white hover:bg-black/60'
            }`}
            aria-label="Save to wishlist"
          >
            <Heart className={`w-4 h-4 transition-transform ${saved ? 'fill-white scale-110' : ''}`} />
          </button>
        </div>

        {/* Bottom City Name & Country */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg leading-tight group-hover:text-sky-300 transition-colors">
              {destination.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-400 px-2 py-0.5 rounded-lg text-slate-900 shadow-md">
              <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
              <span>{destination.popularity_score.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-white/85 flex items-center gap-1 mt-0.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-300" />
            <span>{destination.country}</span>
            <span className="ml-2 font-mono text-emerald-300 font-bold">{destination.cost_index}</span>
          </p>
        </div>
      </div>

      {/* Description & Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>

        {destination.best_season && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">Best Time: <strong>{destination.best_season}</strong></span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {destination.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        {onAddToTrip && (
          <button
            onClick={() => onAddToTrip(destination)}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white dark:bg-brand-950/60 dark:hover:bg-brand-600 dark:text-brand-300 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Itinerary</span>
          </button>
        )}
      </div>

    </div>
  );
};
