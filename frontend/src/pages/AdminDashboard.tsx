import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Compass, 
  Wallet, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Shield, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { AdminAnalyticsData, User } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getUsers()
      ]);
      if (analyticsRes.success) setData(analyticsRes.analytics);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err: any) {
      error('Admin Access Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'traveler' : 'admin';
    try {
      const res = await api.admin.updateUserStatus(user.id, { role: newRole });
      if (res.success) {
        success('Role Updated', `${user.name} is now a ${newRole}.`);
        fetchAdminData();
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        const res = await api.admin.deleteUser(userId);
        if (res.success) {
          success('User Deleted', `${userName} removed.`);
          fetchAdminData();
        }
      } catch (err: any) {
        error('Error', err.message);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This dashboard requires Administrator privileges. Please sign in as an admin.
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Platform Intelligence...</p>
      </div>
    );
  }

  const kpis = data.kpis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-purple-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/80 text-purple-200 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Platform Analytics & Governance
          </h1>
          <p className="text-xs text-purple-200">
            Real-time telemetry, trip creation volume, user metrics, and database records.
          </p>
        </div>

        <span className="self-start md:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Brevo Email API Online
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{kpis.totalUsers}</p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">Active travelers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trips Planned</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{kpis.totalTrips}</p>
          <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">Multi-city routes</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Planned Budget</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(kpis.totalBudget, user?.home_currency || 'INR')}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Budget volume</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total City Stops</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{kpis.totalStops}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Connected stops</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Activities</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{kpis.totalActivities}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">Tours & dinners</p>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Visited Destinations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span>Top Planned Destinations by Stop Frequency</span>
          </h3>

          <div className="space-y-3">
            {data.topDestinations.map((dest, idx) => (
              <div key={dest.city_name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">#{idx + 1}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{dest.city_name}</h4>
                    <p className="text-slate-500">{dest.country}</p>
                  </div>
                </div>
                <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {dest.visit_count} visits planned
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Category Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Popular Activity Categories & Expenditure</span>
          </h3>

          <div className="space-y-3">
            {data.categoryStats.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{cat.category}</h4>
                  <p className="text-slate-500">{cat.count} activities assigned</p>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(cat.total_spent, user?.home_currency || 'INR')} spent
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* User Management Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>User Governance & Directory</span>
            </h3>
            <p className="text-xs text-slate-500">Manage user accounts and roles in the database</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            {users.length} Users Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">User</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Trips Created</th>
                <th className="pb-3">Verification</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 flex items-center gap-2.5">
                    <img
                      src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={u.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="font-bold text-slate-900 dark:text-slate-100">{u.name}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="py-3.5">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                        u.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {u.role} (Toggle)
                    </button>
                  </td>
                  <td className="py-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                    {u.trip_count || 0}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
