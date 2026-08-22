import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Wallet, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  PieChart, 
  TrendingUp, 
  Sparkles, 
  Edit3, 
  Eye, 
  Plus
} from 'lucide-react';
import { Trip } from '../types';
import { api } from '../services/api';
import { BudgetCharts } from '../components/BudgetCharts';
import { useToast } from '../context/ToastContext';

export const BudgetBreakdown: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const { error } = useToast();

  const fetchTrip = async () => {
    if (!id) return;
    try {
      const res = await api.trips.getTripById(id);
      if (res.success) setTrip(res.trip);
    } catch (err: any) {
      error('Error', err.message || 'Could not load budget analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  if (loading || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Budget Analytics...</p>
      </div>
    );
  }

  const metrics = trip.metrics || {
    total_budget: trip.total_budget || 0,
    total_estimated_cost: 0,
    total_transport_cost: 0,
    total_stay_cost: 0,
    total_activities_cost: 0,
    remaining_budget: trip.total_budget || 0,
    is_overbudget: false,
    categoryBreakdown: {}
  };

  const stops = trip.stops || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link to={`/itinerary/${trip.id}`} className="hover:text-brand-500 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Itinerary</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">Budget Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Financial & Cost Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics for <strong>{trip.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/itinerary/${trip.id}/builder`}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-1.5 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Adjust in Builder</span>
          </Link>
          <Link
            to={`/itinerary/${trip.id}`}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>View Timeline</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Budget Charts Component */}
      <BudgetCharts
        metrics={metrics}
        stops={stops}
        currency={trip.currency}
      />

      {/* Itemized Stop-by-Stop Cost Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Itemized Expense Ledger by Destination</span>
          </h3>
          <span className="text-xs text-slate-400">{stops.length} Total Stops</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Stop Destination</th>
                <th className="pb-3">Transit Mode</th>
                <th className="pb-3">Transit Cost</th>
                <th className="pb-3">Lodging Cost</th>
                <th className="pb-3">Activities Cost</th>
                <th className="pb-3">Stop Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stops.map((stop, idx) => {
                const activitiesCost = (stop.activities || []).reduce((sum, a) => sum + (a.cost || 0), 0);
                const stopSubtotal = (stop.transport_cost || 0) + (stop.stay_cost || 0) + activitiesCost;
                return (
                  <tr key={stop.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      <span className="text-brand-500 font-mono mr-2">#{idx + 1}</span>
                      {stop.city_name}, {stop.country}
                    </td>
                    <td className="py-3.5 capitalize text-slate-600 dark:text-slate-300 font-medium">
                      {stop.transport_mode}
                    </td>
                    <td className="py-3.5 font-mono text-slate-800 dark:text-slate-200">
                      ${stop.transport_cost || 0}
                    </td>
                    <td className="py-3.5 font-mono text-slate-800 dark:text-slate-200">
                      ${stop.stay_cost || 0}
                    </td>
                    <td className="py-3.5 font-mono text-slate-800 dark:text-slate-200">
                      ${activitiesCost} ({stop.activities?.length || 0} items)
                    </td>
                    <td className="py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${stopSubtotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <td className="pt-4" colSpan={2}>Grand Cumulative Total</td>
                <td className="pt-4 font-mono">${metrics.total_transport_cost}</td>
                <td className="pt-4 font-mono">${metrics.total_stay_cost}</td>
                <td className="pt-4 font-mono">${metrics.total_activities_cost}</td>
                <td className="pt-4 font-mono text-base text-brand-600 dark:text-brand-400">
                  ${metrics.total_estimated_cost}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
