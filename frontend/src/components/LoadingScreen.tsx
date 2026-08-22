import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

const TRAVEL_TIPS = [
  'Plotting multi-city flight coordinates...',
  'Optimizing transit schedules and layovers...',
  'Calculating real-time category budget forecasts...',
  'Curating top-rated destination experiences...',
  'Preparing your personalized travel canvas...'
];

interface LoadingScreenProps {
  message?: string;
  fullscreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message, 
  fullscreen = true 
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TRAVEL_TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50' : 'min-h-[60vh] w-full'} flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-colors duration-300`}>
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-500/15 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-400/15 dark:bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        
        {/* Animated Emblem with Rotating Orbit */}
        <div className="relative mb-6">
          
          {/* Pulsing Outer Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full border-2 border-dashed border-brand-500/30 dark:border-brand-400/25 flex items-center justify-center"
          >
            {/* Orbiting Plane Node */}
            <motion.div className="absolute -top-2 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </motion.div>
          </motion.div>

          {/* Center Glowing Logo Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30"
            >
              <Compass className="w-7 h-7 animate-spin-slow" />
            </motion.div>
          </div>
        </div>

        {/* Brand Logo */}
        <Logo size="lg" showBadge={false} className="justify-center mb-3" />

        {/* Dynamic Changing Travel Message */}
        <div className="h-8 flex items-center justify-center my-2">
          <AnimatePresence mode="wait">
            <motion.p 
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{message || TRAVEL_TIPS[tipIndex]}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-48 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
          <motion.div 
            animate={{ 
              x: ['-100%', '100%']
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="w-1/2 h-full bg-gradient-to-r from-brand-500 to-sky-400 rounded-full"
          />
        </div>

      </div>
    </div>
  );
};
