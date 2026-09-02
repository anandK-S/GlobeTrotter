import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trip } from '../types';
import { 
  Calendar, 
  MapPin, 
  MoreVertical, 
  Copy, 
  Share2, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Check,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, onDuplicate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();
  const navigate = useNavigate();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${trip.share_slug || trip.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success('Link Copied', 'Public itinerary link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
    setDropdownOpen(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Ongoing
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 backdrop-blur-md">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/95 text-white shadow-md shadow-sky-500/20 backdrop-blur-md">
            Upcoming
          </span>
        );
    }
  };

  const totalCost = trip.calculated_cost || 0;
  const budget = trip.total_budget || 0;
  const budgetPercent = budget > 0 ? Math.min(Math.round((totalCost / budget) * 100), 100) : 0;

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* Cover Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {getStatusBadge(trip.status)}
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              aria-label="Trip actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Context Dropdown */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                  }}
                />
                <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-40 py-2 animate-in fade-in duration-150 space-y-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/itinerary/${trip.id}`);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-sky-500" />
                    <span>View Itinerary</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-indigo-500" />}
                    <span>Share Link</span>
                  </button>

                  {onDuplicate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(false);
                        onDuplicate(trip.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-amber-500" />
                      <span>Duplicate Trip</span>
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(false);
                        if (confirm(`Are you sure you want to delete "${trip.title}"?`)) {
                          onDelete(trip.id);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Trip</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Title & Date on Image */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
          <h3 className="font-black text-lg leading-tight line-clamp-1 group-hover:text-sky-300 transition-colors">
            {trip.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/80 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              {trip.start_date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {trip.stop_count || 0} stops
            </span>
          </div>
        </div>
      </div>

      {/* Content & Progress */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {trip.description ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {trip.description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Multi-destination voyage planned on GlobeTrotter.
          </p>
        )}

        {/* Budget Telemetry Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              Est: <strong className="text-slate-900 dark:text-slate-100 font-bold">{formatCurrency(totalCost, trip.currency)}</strong>
            </span>
            <span className="text-slate-400 font-semibold">
              Budget: {formatCurrency(budget, trip.currency)}
            </span>
          </div>
          
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalCost > budget && budget > 0
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : budgetPercent > 75
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-brand-500 via-sky-500 to-indigo-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Action Link & Builder CTA */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            to={`/itinerary/${trip.id}`}
            className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all"
          >
            <span>Open Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to={`/itinerary/${trip.id}/builder`}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-all flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Builder</span>
          </Link>
        </div>

      </div>

    </div>
  );
};
