import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TripMetrics, TripStop } from '../types';
import { AlertCircle, CheckCircle, TrendingUp, DollarSign, Wallet, PieChart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface BudgetChartsProps {
  metrics: TripMetrics;
  stops: TripStop[];
  currency?: string;
}

export const BudgetCharts: React.FC<BudgetChartsProps> = ({
  metrics,
  stops,
  currency = 'USD'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const categoryEntries = Object.entries(metrics.categoryBreakdown || {}).filter(([_, val]) => val > 0);

  const colors = [
    '#0ea5e9', // Sky Blue (Transport)
    '#6366f1', // Indigo (Stay)
    '#10b981', // Emerald (Activities)
    '#f59e0b', // Amber (Food)
    '#ec4899', // Pink (Sightseeing)
    '#8b5cf6', // Purple (Adventure)
    '#14b8a6', // Teal (Relax)
    '#f43f5e', // Rose (Misc)
  ];

  const doughnutData = {
    labels: categoryEntries.length > 0 ? categoryEntries.map(([cat]) => cat) : ['No Expenses Yet'],
    datasets: [
      {
        data: categoryEntries.length > 0 ? categoryEntries.map(([_, val]) => val) : [1],
        backgroundColor: categoryEntries.length > 0 ? colors.slice(0, categoryEntries.length) : ['#cbd5e1'],
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        hoverOffset: 6
      }
    ]
  };

  // Bar Chart data: Cost per city stop
  const barLabels = stops.map(s => s.city_name);
  const barDataTransport = stops.map(s => s.transport_cost || 0);
  const barDataStay = stops.map(s => s.stay_cost || 0);
  const barDataActivities = stops.map(s => (s.activities || []).reduce((sum, a) => sum + (a.cost || 0), 0));

  const barChartData = {
    labels: barLabels.length > 0 ? barLabels : ['No Stops Added'],
    datasets: [
      {
        label: 'Transport',
        data: barDataTransport,
        backgroundColor: '#0ea5e9',
        borderRadius: 6
      },
      {
        label: 'Stay / Lodging',
        data: barDataStay,
        backgroundColor: '#6366f1',
        borderRadius: 6
      },
      {
        label: 'Activities',
        data: barDataActivities,
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { size: 12, family: 'Inter' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: $${context.raw}`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      y: {
        stacked: true,
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (value: any) => `$${value}`
        }
      }
    }
  };

  const totalDays = stops.length > 0 ? stops.length * 2 : 1; // approximate days
  const avgCostPerDay = metrics.total_estimated_cost > 0 ? (metrics.total_estimated_cost / Math.max(totalDays, 1)).toFixed(1) : '0';

  const budgetUsagePercent = metrics.total_budget > 0 
    ? Math.min(Math.round((metrics.total_estimated_cost / metrics.total_budget) * 100), 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Budget</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              ${metrics.total_budget.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Planned allocation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Estimated Total Cost */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Total</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              ${metrics.total_estimated_cost.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">All stops & activities</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Buffer</p>
            <p className={`text-2xl font-black mt-1 ${metrics.remaining_budget < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ${Math.abs(metrics.remaining_budget).toLocaleString()}
              {metrics.remaining_budget < 0 && <span className="text-xs font-medium ml-1">over</span>}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.remaining_budget < 0 ? 'Exceeds budget cap' : 'Available cushion'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metrics.remaining_budget < 0 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'}`}>
            {metrics.remaining_budget < 0 ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>
        </div>

        {/* Avg Cost Per Day */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Spending Avg</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              ${avgCostPerDay}
            </p>
            <p className="text-xs text-slate-500 mt-1">Per day estimated</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Overbudget Alert Banner if triggered */}
      {metrics.is_overbudget && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3.5 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
          <div>
            <h5 className="font-bold text-sm">Budget Cap Warning</h5>
            <p className="text-xs mt-0.5 opacity-90">
              Your planned expenses exceed the allocated budget by <strong>${Math.abs(metrics.remaining_budget).toLocaleString()}</strong>. Consider adjusting lodging or activity tiers.
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Category Doughnut Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-brand-500" />
                <span>Expense Breakdown</span>
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                {budgetUsagePercent}% of Budget
              </span>
            </div>
            
            <div className="relative h-56 flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: isDark ? '#cbd5e1' : '#475569',
                        font: { size: 11, family: 'Inter' },
                        boxWidth: 12
                      }
                    }
                  },
                  cutout: '72%'
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-xs text-slate-400 font-medium">Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  ${metrics.total_estimated_cost}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transport:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${metrics.total_transport_cost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Lodging:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${metrics.total_stay_cost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Activities:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${metrics.total_activities_cost}</span>
            </div>
          </div>
        </div>

        {/* Stop by Stop Bar Chart (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Destination Cost Distribution</span>
              </h4>
              <span className="text-xs text-slate-400">By Stop / City</span>
            </div>

            <div className="h-64 w-full">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Stacked breakdown showing transport, accommodation, and curated activities cost per stop.
          </p>
        </div>

      </div>

    </div>
  );
};
