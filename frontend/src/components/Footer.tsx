import React from 'react';
import { Compass, Heart, Globe, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
            </div>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-brand-500 transition-colors">Dashboard</Link></li>
              <li><Link to="/my-trips" className="hover:text-brand-500 transition-colors">My Itineraries</Link></li>
              <li><Link to="/explore-cities" className="hover:text-brand-500 transition-colors">Global Cities</Link></li>
              <li><Link to="/activities" className="hover:text-brand-500 transition-colors">Experience Catalog</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Features</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><span className="text-slate-700 dark:text-slate-300 font-medium">Multi-City Routes</span></li>
              <li><span className="text-slate-700 dark:text-slate-300 font-medium">Interactive Route Map</span></li>
              <li><span className="text-slate-700 dark:text-slate-300 font-medium">Live Budget Analytics</span></li>
              <li><span className="text-slate-700 dark:text-slate-300 font-medium">Public Share & Fork</span></li>
            </ul>
          </div>

          {/* Security & System */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Platform & Auth</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> JWT Token Security</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-sky-500" /> Brevo Email Integration</li>
              <li className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500" /> SQLite Relational DB</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} GlobeTrotter. Built with ❤️ for Odoo Hackathon.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
