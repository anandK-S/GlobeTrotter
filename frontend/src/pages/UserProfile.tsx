import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Heart, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Trash2, 
  Sun, 
  Moon, 
  LogOut, 
  Compass, 
  Tag, 
  Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Destination, Currency } from '../types';
import { CityCard } from '../components/CityCard';
import { COUNTRIES, getCountryByName } from '../utils/countries';

const ALL_PREFERENCE_TAGS = [
  'Foodie',
  'Photography',
  'Solo Travel',
  'Cultural Heritage',
  'Adventure & Hiking',
  'Luxury Stays',
  'Budget Backpacking',
  'Beaches & Islands',
  'Nightlife',
  'Historical Monuments',
  'Nature & Wildlife'
];

export const UserProfile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'preferences'>(
    searchParams.get('tab') === 'wishlist' ? 'wishlist' : 'profile'
  );

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [phoneCode, setPhoneCode] = useState(user?.phone_code || '+91');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [homeCurrency, setHomeCurrency] = useState<Currency>(user?.home_currency || 'USD');
  const [preferences, setPreferences] = useState<string[]>(user?.preferences || []);
  const [isSaving, setIsSaving] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Destination[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
      setCountry(user.country || 'India');
      setPhoneCode(user.phone_code || '+91');
      setPhoneNumber(user.phone_number || '');
      setHomeCurrency(user.home_currency || 'USD');
      setPreferences(user.preferences || []);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [activeTab]);

  const handleCountryChange = (countryName: string) => {
    setCountry(countryName);
    const cInfo = getCountryByName(countryName);
    if (cInfo) {
      setPhoneCode(cInfo.dialCode);
      setHomeCurrency(cInfo.currency as Currency);
    }
  };

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const res = await api.destinations.getWishlist();
      if (res.success) setWishlist(res.wishlist);
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleTogglePreference = (tag: string) => {
    setPreferences(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const ok = await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        country,
        phone_code: phoneCode,
        phone_number: phoneNumber.trim(),
        home_currency: homeCurrency,
        preferences
      });
      if (ok) success('Settings Saved', 'Profile, country, and contact info updated.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to delete your GlobeTrotter account? This will permanently erase all your trips and cannot be undone.')) {
      try {
        const res = await api.auth.deleteAccount();
        if (res.success) {
          logout();
          navigate('/login');
        }
      } catch (err: any) {
        error('Error', err.message);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Hero */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
          alt={name}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-lg"
        />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 capitalize">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{user?.email}</span>
          </p>
          {bio && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-xl">{bio}</p>}
        </div>

        {/* Quick Stats Pill */}
        <div className="flex sm:flex-col gap-3 text-center shrink-0">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 min-w-[90px]">
            <p className="text-xl font-black text-brand-600 dark:text-brand-400">{user?.trip_count || 0}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Trips</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 min-w-[90px]">
            <p className="text-xl font-black text-rose-500">{user?.wishlist_count || 0}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Wishlist</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 text-xs font-bold max-w-md">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Profile & Preferences
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'wishlist'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Saved Wishlist ({user?.wishlist_count || 0})
        </button>
      </div>

      {/* Tab 1: Profile & Preferences Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Personal Information & Regional Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Home Currency
                </label>
                <select
                  value={homeCurrency}
                  onChange={(e) => setHomeCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Home Country
                </label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold shrink-0">
                    {phoneCode}
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Traveler Cartoon Avatar
              </label>
              <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-3">
                {[
                  { id: 'adventurer-1', name: 'Explorer Felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4' },
                  { id: 'adventurer-2', name: 'Nomad Aria', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=ffd5dc' },
                  { id: 'adventurer-3', name: 'Hiker Leo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=c0aede' },
                  { id: 'adventurer-4', name: 'Traveler Maya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=ffdfbf' },
                  { id: 'adventurer-5', name: 'Backpacker Sam', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=d1d4f9' },
                  { id: 'adventurer-6', name: 'Captain Zoe', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=c1f0db' }
                ].map((av) => {
                  const isSelected = avatarUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`relative aspect-square rounded-2xl p-1 border-2 transition-all overflow-hidden ${
                        isSelected
                          ? 'border-brand-500 ring-4 ring-brand-500/20 scale-105 bg-brand-50/50 dark:bg-brand-950/50'
                          : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 opacity-80 hover:opacity-100'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-contain rounded-xl" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Bio & Travel Motto
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell fellow travelers about your bucket list and favorite experiences..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            {/* Travel Style Preference Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Travel Style & Interests Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PREFERENCE_TAGS.map((tag) => {
                  const isSelected = preferences.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTogglePreference(tag)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>

          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
            <h4 className="font-extrabold text-sm text-rose-700 dark:text-rose-400">
              Danger Zone & Account Privacy
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Permanently remove your account, custom itineraries, stops, and saved wishlist data.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account Permanently</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Wishlist Grid */}
      {activeTab === 'wishlist' && (
        <div>
          {loadingWishlist ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map(dest => (
                <CityCard
                  key={dest.id}
                  destination={dest}
                  isSaved={true}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <Heart className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Wishlist is Empty</h3>
              <p className="text-xs text-slate-500">
                Explore global destinations and click the heart icon on any city card to bookmark it here.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
