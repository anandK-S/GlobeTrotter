import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Sparkles,
  MapPin,
  Plane,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { COUNTRIES, getCountryByName } from '../utils/countries';
import { Logo } from '../components/Logo';

// 6 Cartoon Travel Adventurer Avatars
const CARTOON_AVATARS = [
  { id: 'adventurer-1', name: 'Explorer Felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 'adventurer-2', name: 'Nomad Aria', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=ffd5dc' },
  { id: 'adventurer-3', name: 'Hiker Leo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=c0aede' },
  { id: 'adventurer-4', name: 'Traveler Maya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=ffdfbf' },
  { id: 'adventurer-5', name: 'Backpacker Sam', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=d1d4f9' },
  { id: 'adventurer-6', name: 'Captain Zoe', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=c1f0db' }
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
  const [avatarUrl, setAvatarUrl] = useState(CARTOON_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeCurrency, setHomeCurrency] = useState('INR');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification state (6 separate digit inputs)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpDevNotice, setOtpDevNotice] = useState<string | null>(null);

  // Validation Touch States
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const { login, register, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Resend Timer Countdown
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Handle Country Selection
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const countryInfo = getCountryByName(countryName);
    if (countryInfo) {
      setPhoneCode(countryInfo.dialCode);
      setHomeCurrency(countryInfo.currency);
    }
  };

  // Strict Validation Rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isNameValid = name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  const isEmailValid = emailRegex.test(email.trim());
  const isPhoneValid = phoneNumber.trim().length >= 7 && /^[0-9]+$/.test(phoneNumber.trim());
  const isPasswordLengthValid = password.length >= 6;
  const isPasswordMatching = password.length > 0 && password === confirmPassword;

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

  // OTP 6-Digit input change
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    try {
      const res = await api.auth.forgotPassword(email.trim());
      if (res.success) {
        setResendCountdown(60);
        success('Verification Code Sent', 'A fresh 6-digit code has been delivered to your email.');
        if (res.otpPreview) {
          setOtpDevNotice(`Verification Code: ${res.otpPreview}`);
        }
      }
    } catch (err: any) {
      error('Resend Failed', err.message);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });

    // Validate Sign In
    if (mode === 'login') {
      if (!isEmailValid) {
        error('Invalid Email', 'Please enter a valid email address.');
        return;
      }
      if (!password) {
        error('Password Required', 'Please enter your password.');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await login(email.trim(), password);
        if (ok) navigate('/dashboard');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate Sign Up
    if (mode === 'signup') {
      if (!isNameValid) {
        error('Invalid Name', 'Please enter a valid full name (letters only, min 2 chars).');
        return;
      }
      if (!isEmailValid) {
        error('Invalid Email', 'Please enter a valid email address.');
        return;
      }
      if (!isPhoneValid) {
        error('Invalid Phone', 'Please enter a valid phone number (digits only).');
        return;
      }
      if (!isPasswordLengthValid) {
        error('Weak Password', 'Password must be at least 6 characters long.');
        return;
      }
      if (!isPasswordMatching) {
        error('Password Mismatch', 'Confirm password does not match.');
        return;
      }

      setIsSubmitting(true);
      const finalAvatar = customAvatarUrl.trim() || avatarUrl;

      try {
        const res = await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          avatar_url: finalAvatar,
          country: selectedCountry,
          phone_code: phoneCode,
          phone_number: phoneNumber.trim(),
          homeCurrency
        });

        if (res.success) {
          navigate('/dashboard');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate Forgot Password
    if (mode === 'forgot') {
      if (!isEmailValid) {
        error('Invalid Email', 'Please enter the email associated with your account.');
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await api.auth.forgotPassword(email.trim());
        if (res.success) {
          success('Verification Code Sent', 'Check your email for the 6-digit security code.');
          if (res.otpPreview) {
            setOtpDevNotice(`Verification Code: ${res.otpPreview}`);
          }
          setResendCountdown(60);
          setMode('reset');
        }
      } catch (err: any) {
        error('Error', err.message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate OTP Reset
    if (mode === 'reset') {
      const fullOtp = otpDigits.join('');
      if (fullOtp.length !== 6) {
        error('Incomplete Code', 'Please enter the full 6-digit verification code.');
        return;
      }
      if (!isPasswordLengthValid) {
        error('Weak Password', 'New password must be at least 6 characters long.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await api.auth.resetPassword({
          email: email.trim(),
          otpCode: fullOtp,
          newPassword: password
        });
        if (res.success) {
          success('Password Reset Complete', 'You can now sign in with your new password.');
          setMode('login');
          setOtpDigits(['', '', '', '', '', '']);
        }
      } catch (err: any) {
        error('Verification Error', err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden"
      >
        
        {/* Left Form Section (7 cols on desktop, full width on mobile) */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            
            {/* Top Brand Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <Logo size="md" />

              {/* Mode Toggle Tabs */}
              {mode !== 'forgot' && mode !== 'reset' && (
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => { setMode('login'); setTouched({}); }}
                    className={`relative px-4 py-1.5 sm:py-2 rounded-xl transition-all ${
                      mode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('signup'); setTouched({}); }}
                    className={`relative px-4 py-1.5 sm:py-2 rounded-xl transition-all ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Create Your Travel Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'reset' && 'Enter Verification Code'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {mode === 'login' && 'Sign in to access your custom itineraries, budgets, and saved journeys.'}
                {mode === 'signup' && 'Choose your travel avatar, country, and contact details to get started.'}
                {mode === 'forgot' && 'Enter your email to receive a 6-digit verification code.'}
                {mode === 'reset' && 'Enter the 6-digit code sent to your email to verify and set a new password.'}
              </p>
            </div>

            {/* Verification Notice Banner if in Dev Mode */}
            {otpDevNotice && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-mono flex items-center gap-2.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">{otpDevNotice}</span>
              </motion.div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
              
              {/* Cartoon Profile Avatar Selector (Signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pb-1"
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Choose Travel Avatar
                    </label>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                      {CARTOON_AVATARS.map((avatar) => {
                        const isSelected = avatarUrl === avatar.url && !customAvatarUrl;
                        return (
                          <motion.button
                            key={avatar.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setAvatarUrl(avatar.url);
                              setCustomAvatarUrl('');
                            }}
                            className={`relative aspect-square rounded-2xl p-1 border-2 transition-all group overflow-hidden ${
                              isSelected
                                ? 'border-brand-500 ring-4 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/50 shadow-md'
                                : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 opacity-80 hover:opacity-100'
                            }`}
                            title={avatar.name}
                          >
                            <img 
                              src={avatar.url} 
                              alt={avatar.name} 
                              className="w-full h-full object-contain rounded-xl"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="Or paste custom avatar photo URL (optional)..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Full Name Input (Signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Travel Explorer"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                          touched.name && !isNameValid
                            ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-400/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                        }`}
                      />
                      {touched.name && isNameValid && (
                        <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {touched.name && !isNameValid && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Name must be at least 2 characters (letters only).</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
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
                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                      touched.email && !isEmailValid
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  {touched.email && isEmailValid && (
                    <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {touched.email && !isEmailValid && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Please enter a valid email address (e.g. name@domain.com).</span>
                  </p>
                )}
              </div>

              {/* Home Country & Auto-Bound Phone Dial Code (Signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Home Country *
                      </label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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
                        <span className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold shrink-0">
                          {phoneCode}
                        </span>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="9876543210"
                          className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                            touched.phone && !isPhoneValid
                              ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-400/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                          }`}
                        />
                      </div>
                      {touched.phone && !isPhoneValid && (
                        <p className="text-[11px] text-rose-500 font-semibold mt-1">
                          Digits only (min 7 digits).
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 6-Digit OTP Box (Reset Mode) */}
              <AnimatePresence>
                {mode === 'reset' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900"
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCountdown > 0}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${resendCountdown > 0 ? 'animate-spin' : ''}`} />
                        <span>{resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend Code'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 sm:w-12 h-11 sm:h-13 text-center font-mono font-black text-lg sm:text-xl rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 focus:outline-none transition-all"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password Input */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      {mode === 'reset' ? 'New Password' : 'Password'} *
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setTouched({}); }}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
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
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                        touched.password && !isPasswordLengthValid
                          ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-400/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Dynamic Password Strength Indicator */}
                  {(mode === 'signup' || mode === 'reset') && password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Password Strength:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                          touched.confirmPassword && !isPasswordMatching
                            ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-400/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                        }`}
                      />
                      {confirmPassword && isPasswordMatching && (
                        <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {touched.confirmPassword && !isPasswordMatching && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Passwords do not match.</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button with Animated Micro-Interactions */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-sky-600 hover:from-brand-600 hover:to-sky-700 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to GlobeTrotter'}
                      {mode === 'signup' && 'Create Travel Account'}
                      {mode === 'forgot' && 'Send Verification Code'}
                      {mode === 'reset' && 'Verify Code & Set Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setTouched({}); }}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors pt-1"
                >
                  &larr; Back to Sign In
                </button>
              )}
            </form>

          </div>

          {/* Clean Minimalist Footer without Emoji */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            &copy; 2026 GlobeTrotter. Built for Odoo Hackathon.
          </div>

        </div>

        {/* Right Travel Visual Showcase (5 cols, hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-brand-600 via-sky-600 to-indigo-700 p-8 flex-col justify-between text-white overflow-hidden">
          
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
            alt="Travel inspiration"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Smart Itinerary Platform</span>
            </span>
          </div>

          <div className="relative z-10 space-y-4">
            <blockquote className="text-xl font-black leading-snug text-white/95 tracking-tight">
              &ldquo;Travel is the only thing you buy that makes you richer.&rdquo;
            </blockquote>
            
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>What Awaits in Your Journey</span>
              </div>
              <ul className="space-y-1.5 text-white/90 font-medium">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                  <span>Interactive multi-city Leaflet flight routes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                  <span>Day-by-day scheduling with 50+ curated tours</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Real-time budget forecasting & expense ledger</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-white/70">
            Empowering Personalized Multi-City Travel Planning
          </div>
        </div>

      </motion.div>
    </div>
  );
};
