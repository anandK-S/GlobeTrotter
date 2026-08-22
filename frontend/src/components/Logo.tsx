import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showBadge = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Icon Emblem */}
      <motion.div 
        whileHover={{ scale: 1.06, rotate: 6 }}
        whileTap={{ scale: 0.95 }}
        className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-600 p-[1.5px] shadow-lg shadow-brand-500/25 shrink-0 flex items-center justify-center`}
      >
        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-brand-600 to-sky-500 flex items-center justify-center text-white overflow-hidden relative">
          {/* Subtle decorative background rings */}
          <div className="absolute inset-0 border border-white/20 rounded-full scale-125 pointer-events-none"></div>
          <div className="absolute inset-0 border border-white/10 rounded-full scale-150 pointer-events-none"></div>
          
          {/* Custom SVG Globe + Compass + Flight Path Emblem */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5/9 h-5/9 text-white drop-shadow-sm relative z-10"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="1.8" opacity="0.85" />
            <path d="M3.6 9h16.8" opacity="0.6" strokeDasharray="1 1.5" />
            <path d="M3.6 15h16.8" opacity="0.6" strokeDasharray="1 1.5" />
            <path d="M12 3a13 13 0 0 0 0 18" opacity="0.75" />
            <path d="M12 3a13 13 0 0 1 0 18" opacity="0.75" />
            {/* Dynamic Compass Pointer */}
            <polygon points="12 6 15 12 12 10 9 12 12 6" fill="white" stroke="none" />
            <polygon points="12 18 15 12 12 14 9 12 12 18" fill="rgba(255,255,255,0.45)" stroke="none" />
          </svg>
        </div>
      </motion.div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-black tracking-tight text-slate-900 dark:text-white`}>
            Globe<span className="bg-gradient-to-r from-brand-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">Trotter</span>
          </span>
          {showBadge && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Pro
            </span>
          )}
        </div>
        {size === 'lg' && (
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">
            Personalized Travel Planning Platform
          </span>
        )}
      </div>
    </div>
  );
};
