import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Eye, 
  EyeOff, 
  KeyRound,
  Phone,
  Camera,
  Check,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { COUNTRIES, getCountryByName } from '../utils/countries';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
];

export const LoginSignup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeCurrency, setHomeCurrency] = useState('INR');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  const { login, register, isAuthenticated, isSupabaseActive } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // When country changes, auto-set phone code and default currency
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const countryInfo = getCountryByName(countryName);
    if (countryInfo) {
      setPhoneCode(countryInfo.dialCode);
      setHomeCurrency(countryInfo.currency);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score: 75, label: 'Good', color: 'bg-sky-500' };
      case 4: return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 10, label: 'Too Short', color: 'bg-slate-300' };
    }
  };

  const strength = getPasswordStrength(password);

  const fillDemo = (demoType: 'traveler' | 'admin') => {
    if (demoType === 'traveler') {
      setEmail('traveler.user@example.com');
      setPassword('Traveler@123');
      setMode('login');
      info('Demo Loaded', 'Traveler User credentials populated.');
    } else {
      setEmail('admin@globetrotter.com');
      setPassword('Admin@123');
      setMode('login');
      info('Demo Loaded', 'Administrator credentials populated.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOtpNotice(null);

    const finalAvatar = customAvatarUrl.trim() || avatarUrl;

    try {
      if (mode === 'login') {
        const ok = await login(email, password);
        if (ok) navigate('/dashboard');
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          error('Validation Error', 'Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          avatar_url: finalAvatar,
          country: selectedCountry,
          phone_code: phoneCode,
          phone_number: phoneNumber.trim(),
          homeCurrency
        });
        if (res.success) {
          if (res.otpPreview) {
            setOtpNotice(`OTP for Brevo verification: ${res.otpPreview}`);
          }
          navigate('/dashboard');
        }
      } else if (mode === 'forgot') {
        const res = await api.auth.forgotPassword(email);
        if (res.success) {
          success('OTP Dispatched', 'Check your email for the 6-digit verification code.');
          if (res.otpPreview) {
            setOtpNotice(`Dev OTP Preview: ${res.otpPreview}`);
          }
          setMode('reset');
        }
      } else if (mode === 'reset') {
        const res = await api.auth.resetPassword({
          email,
          otpCode,
          newPassword: password
        });
        if (res.success) {
          success('Password Reset', 'You can now sign in with your new password.');
          setMode('login');
        }
      }
    } catch (err: any) {
      error('Authentication Error', err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Left Form Section (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">GlobeTrotter</h2>
                  <p className="text-xs text-slate-500">Personalized Travel Platform</p>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              {mode !== 'forgot' && mode !== 'reset' && (
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
                  <button
                    onClick={() => setMode('login')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      mode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {mode === 'login' && 'Welcome back, Traveler'}
                {mode === 'signup' && 'Create your travel account'}
                {mode === 'forgot' && 'Reset your password'}
                {mode === 'reset' && 'Enter verification OTP'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login' && 'Sign in to access your custom multi-city itineraries and saved trips.'}
                {mode === 'signup' && 'Complete your profile with avatar, country, and contact details.'}
                {mode === 'forgot' && 'Enter your email to receive a 6-digit Brevo OTP verification code.'}
                {mode === 'reset' && 'Provide the 6-digit code sent to your email to set a new password.'}
              </p>
            </div>

            {/* Quick Demo Fillers */}
            <div className="mb-5 p-3 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>1-Click Hackathon Login:</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('traveler')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-xs transition-colors"
                >
                  Traveler User
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 shadow-xs transition-colors"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* OTP Notice Banner */}
            {otpNotice && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{otpNotice}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Profile Photo Selector (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Choose Profile Photo</span>
                    <span className="text-[10px] text-brand-500 font-normal">Click avatar preset or paste URL</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {AVATAR_PRESETS.map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(pUrl);
                          setCustomAvatarUrl('');
                        }}
                        className={`relative w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all ${
                          avatarUrl === pUrl && !customAvatarUrl
                            ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={pUrl} alt="Avatar Preset" className="w-full h-full object-cover" />
                        {avatarUrl === pUrl && !customAvatarUrl && (
                          <div className="absolute inset-0 bg-brand-500/40 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </div>
                        )}
                      </button>
                    ))}
                    <div className="flex-1">
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="Or custom photo URL..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Name (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Travel Explorer"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler.user@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Home Country & Auto-Bound Phone Dial Code (Signup only) */}
              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Home Country *
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Phone Number *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold shrink-0">
                        {phoneCode}
                      </span>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OTP Input (Reset mode) */}
              {mode === 'reset' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    6-Digit Brevo OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono tracking-widest"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      {mode === 'reset' ? 'New Password' : 'Password'} *
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {(mode === 'signup' || mode === 'reset') && password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{strength.label}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all`} style={{ width: `${strength.score}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-sky-600 hover:from-brand-600 hover:to-sky-700 shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to GlobeTrotter'}
                      {mode === 'signup' && 'Create Travel Account'}
                      {mode === 'forgot' && 'Send Brevo OTP Code'}
                      {mode === 'reset' && 'Reset Password & Sign In'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:underline pt-1"
                >
                  &larr; Back to Sign In
                </button>
              )}
            </form>

          </div>

          {/* Bottom Security Notice */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>JWT + Brevo OTP + Supabase Ready</span>
            </span>
            <span>Odoo Hackathon</span>
          </div>

        </div>

        {/* Right Travel Visual Showcase (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-brand-600 via-sky-600 to-indigo-700 p-8 flex-col justify-between text-white overflow-hidden">
          
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
            alt="Travel inspiration"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Global Travel Intelligence</span>
            </span>
          </div>

          <div className="relative z-10 space-y-4">
            <blockquote className="text-xl font-bold leading-relaxed text-white/95">
              &ldquo;Travel is the only thing you buy that makes you richer.&rdquo;
            </blockquote>
            
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase & Relational Backend</span>
              </div>
              <ul className="space-y-1 text-white/90">
                <li>• PostgreSQL database schema with RLS security</li>
                <li>• Brevo transactional welcome & OTP emails</li>
                <li>• Country code auto-detection and phone verification</li>
                <li>• Real-time budget forecasting & Leaflet route mapping</li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/70">
            Crafted for Odoo Hackathon &bull; 13 Screens Complete
          </div>
        </div>

      </div>
    </div>
  );
};
