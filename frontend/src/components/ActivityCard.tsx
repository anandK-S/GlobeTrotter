import React from 'react';
import { MasterActivity, StopActivity } from '../types';
import { Clock, DollarSign, Star, Tag, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

interface ActivityCardProps {
  activity: MasterActivity | StopActivity;
  onAdd?: (activity: MasterActivity | StopActivity) => void;
  onRemove?: (id: string) => void;
  isStopActivity?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onAdd,
  onRemove,
  isStopActivity = false
}) => {
  const { user } = useAuth();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Adventure': return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Culture': return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Relax': return 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      default: return 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    }
  };

  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      
      {/* Activity Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={activity.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border backdrop-blur-md ${getCategoryColor(activity.category)}`}>
            {activity.category}
          </span>
        </div>

        {/* Cost Badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-bold text-xs flex items-center gap-0.5 shadow-sm">
          <span>{activity.cost === 0 ? 'Free' : formatCurrency(activity.cost, user?.home_currency || 'INR')}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {'destination_name' in activity && activity.destination_name && (
            <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-0.5">
              {activity.destination_name}, {activity.destination_country}
            </p>
          )}

          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1">
            {activity.title}
          </h4>

          {activity.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>

        {/* Metadata Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{activity.duration_hours}h duration</span>
          </div>

          {'rating' in activity && activity.rating && (
            <div className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{activity.rating}</span>
            </div>
          )}

          {'scheduled_time' in activity && activity.scheduled_time && (
            <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
              ⏰ {activity.scheduled_time}
            </span>
          )}
        </div>

        {/* Action Button */}
        {onAdd && (
          <button
            onClick={() => onAdd(activity)}
            className="w-full py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white dark:bg-brand-950/60 dark:hover:bg-brand-600 dark:text-brand-300 text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Stop</span>
          </button>
        )}

        {isStopActivity && onRemove && (
          <button
            onClick={() => onRemove(activity.id)}
            className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

    </div>
  );
};
