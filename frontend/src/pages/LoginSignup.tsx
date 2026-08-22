import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  Compass,
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { COUNTRIES, getCountryByName, validatePhoneNumber } from '../utils/countries';
import { Logo } from '../components/Logo';

// 6 Cartoon Travel Adventurer Avatars (DiceBear Vector Set)
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
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'verify_signup'>(initialMode);
  
  // Sync mode whenever URL search parameters change
  useEffect(() => {
    const qMode = searchParams.get('mode');
    if (qMode === 'signup') setMode('signup');
    else if (qMode === 'login') setMode('login');
  }, [searchParams]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(CARTOON_AVATARS[0].url);
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

  // Validation Touch States
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const { login, register, verifySignupOtp, isAuthenticated } = useAuth();
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
  const phoneValidation = validatePhoneNumber(phoneNumber, selectedCountry);
  const isPhoneValid = phoneValidation.isValid;
  const isPasswordLengthValid = password.length >= 6;
  const isPasswordMatching = password.length > 0 && password === confirmPassword;

  const currentCountryInfo = getCountryByName(selectedCountry);

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
        success('Verification Code Dispatched', 'A fresh 6-digit security code has been delivered to your email inbox.');
      }
    } catch (err: any) {
      error('Resend Failed', err.message);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        error('Invalid Phone', phoneValidation.message);
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
      try {
        const res = await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          avatar_url: avatarUrl,
          country: selectedCountry,
          phone_code: phoneCode,
          phone_number: phoneNumber.trim(),
          homeCurrency
        });

        if (res.success) {
          if (res.requiresVerification) {
            setMode('verify_signup');
            setResendCountdown(60);
            setOtpDigits(['', '', '', '', '', '']);
          } else {
            navigate('/dashboard');
          }
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate Email OTP Verification upon Sign Up
    if (mode === 'verify_signup') {
      const fullOtp = otpDigits.join('');
      if (fullOtp.length !== 6) {
        error('Incomplete Code', 'Please enter the full 6-digit verification code.');
        return;
      }

      setIsSubmitting(true);
      try {
        const ok = await verifySignupOtp(email.trim().toLowerCase(), fullOtp);
        if (ok) {
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
          success('Verification Code Dispatched', 'A 6-digit security code has been delivered to your email inbox.');
          setResendCountdown(60);
          setMode('reset');
        }
      } catch (err: any) {
        error('Account Not Found', err.message || 'No registered account found with this email address.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate OTP Reset Password
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
              {mode !== 'forgot' && mode !== 'reset' && mode !== 'verify_signup' && (
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setTouched({}); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'login'
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setTouched({}); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
                {mode === 'verify_signup' && 'Verify Your Email Address'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'reset' && 'Enter Verification Code'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {mode === 'login' && 'Sign in to access your custom itineraries, budgets, and saved journeys.'}
                {mode === 'signup' && 'Choose your travel avatar, country, and contact details to get started.'}
                {mode === 'verify_signup' && `We have sent a 6-digit security code to ${email || 'your email'}. Enter it below to activate your account.`}
                {mode === 'forgot' && 'Enter your email to receive a 6-digit verification code.'}
                {mode === 'reset' && 'Enter the 6-digit code sent to your email to verify and set a new password.'}
              </p>
            </div>

            {/* Direct Open Gmail Button for Verification Screens */}
            {(mode === 'verify_signup' || mode === 'reset') && (
              <a 
                href="https://mail.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700 mb-5 shadow-sm"
              >
                <Mail className="w-4 h-4 text-rose-500" />
                <span>Open Gmail to Check Code</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </a>
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
                        const isSelected = avatarUrl === avatar.url;
                        return (
                          <motion.button
                            key={avatar.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAvatarUrl(avatar.url)}
                            className={`p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 relative ${
                              isSelected 
                                ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/50 shadow-md shadow-brand-500/20' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/50'
                            }`}
                          >
                            <img 
                              src={avatar.url} 
                              alt={avatar.name} 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                            />
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                              {avatar.name.split(' ')[1]}
                            </span>
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center shadow">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Full Name (Sign Up only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setTouched({ ...touched, name: true })}
                        placeholder="Alex Rivers"
                        className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 transition-all ${
                          touched.name && !isNameValid
                            ? 'border-rose-500 focus:ring-rose-500/30'
                            : touched.name && isNameValid
                            ? 'border-emerald-500 focus:ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/30'
                        }`}
                      />
                      {touched.name && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {isNameValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {touched.name && !isNameValid && (
                      <p className="text-[11px] text-rose-500 font-medium pl-1">
                        Name must contain only letters and be at least 2 characters.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Country & Phone Code (Sign Up only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {/* Home Country Selector */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Home Country *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <select
                          value={selectedCountry}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none font-medium cursor-pointer"
                        >
                          {COUNTRIES.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name} ({country.dialCode})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                          <span className="text-xs">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* Phone Number with strict Country Rule */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Phone Number *
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {currentCountryInfo.phoneLengths.join(' or ')} digits
                        </span>
                      </div>
                      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:ring-2 focus-within:ring-brand-500/30">
                        <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700/60 border-r border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {phoneCode}
                        </span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          onBlur={() => setTouched({ ...touched, phone: true })}
                          placeholder={currentCountryInfo.placeholder}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none"
                        />
                        {touched.phone && (
                          <div className="pr-3 flex items-center pointer-events-none">
                            {isPhoneValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {touched.phone && !isPhoneValid && (
                        <p className="text-[11px] text-rose-500 font-medium pl-1">
                          {phoneValidation.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address (Login, Signup, Forgot) */}
              {mode !== 'verify_signup' && mode !== 'reset' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      placeholder="alex.rivers@gmail.com"
                      className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 transition-all ${
                        touched.email && !isEmailValid
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : touched.email && isEmailValid
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/30'
                      }`}
                    />
                    {touched.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isEmailValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {touched.email && !isEmailValid && (
                    <p className="text-[11px] text-rose-500 font-medium pl-1">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>
              )}

              {/* 6-Digit OTP Input Boxes for Verification / Reset */}
              {(mode === 'verify_signup' || mode === 'reset') && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Enter 6-Digit Security Code
                    </label>
                    <button
                      type="button"
                      disabled={resendCountdown > 0}
                      onClick={handleResendOtp}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendCountdown > 0 ? 'animate-spin' : ''}`} />
                      <span>{resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend Code'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 sm:w-12 h-12 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Password Fields */}
              {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      {mode === 'reset' ? 'New Password *' : 'Password *'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setTouched({}); }}
                        className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 transition-all ${
                        touched.password && !isPasswordLengthValid
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : touched.password && isPasswordLengthValid
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/30'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Signup & Reset) */}
                  {(mode === 'signup' || mode === 'reset') && password.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500">Password Strength</span>
                        <span className={`font-bold ${
                          strength.label === 'Strong' ? 'text-emerald-500' :
                          strength.label === 'Good' ? 'text-sky-500' :
                          strength.label === 'Fair' ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Sign Up only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 transition-all ${
                          touched.confirmPassword && !isPasswordMatching
                            ? 'border-rose-500 focus:ring-rose-500/30'
                            : touched.confirmPassword && isPasswordMatching
                            ? 'border-emerald-500 focus:ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/30'
                        }`}
                      />
                      {touched.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {isPasswordMatching ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {touched.confirmPassword && !isPasswordMatching && (
                      <p className="text-[11px] text-rose-500 font-medium pl-1">
                        Passwords do not match.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button with Blocking and Spinner */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.015 } : {}}
                whileTap={!isSubmitting ? { scale: 0.985 } : {}}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-sky-600 hover:from-brand-600 hover:to-sky-700 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to GlobeTrotter'}
                      {mode === 'signup' && 'Create Travel Account'}
                      {mode === 'verify_signup' && 'Verify Email & Activate Account'}
                      {mode === 'forgot' && 'Send Verification Code'}
                      {mode === 'reset' && 'Verify Code & Set Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {(mode === 'forgot' || mode === 'reset' || mode === 'verify_signup') && (
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

          {/* Clean Minimalist Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            &copy; {new Date().getFullYear()} GlobeTrotter. Built for Odoo Hackathon.
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
