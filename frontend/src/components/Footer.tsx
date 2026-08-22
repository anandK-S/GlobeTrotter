import React from 'react';
import { Sparkles, MapPin, Compass, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <Logo size="sm" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering personalized travel planning with multi-destination itineraries, automatic budget tracking, and real-time interactive maps.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
              <Sparkles className="w-3 h-3" />
              <span>Odoo Hackathon 2026 Edition</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Explore Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-brand-500 transition-colors">Traveler Dashboard</Link></li>
              <li><Link to="/my-trips" className="hover:text-brand-500 transition-colors">My Itineraries</Link></li>
              <li><Link to="/explore-cities" className="hover:text-brand-500 transition-colors">Global Cities Directory</Link></li>
              <li><Link to="/activities" className="hover:text-brand-500 transition-colors">Curated Experiences</Link></li>
            </ul>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Capabilities</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-500" /> Multi-City Leaflet Route Mapping</li>
              <li className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-sky-500" /> Day-by-Day Agenda & Timeline</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Real-Time Budget Telemetry</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} GlobeTrotter. Built for Odoo Hackathon.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
