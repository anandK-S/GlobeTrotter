import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration = 4500 }: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: Toast = { id, type, title, message, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = (title: string, message?: string) => showToast({ type: 'success', title, message });
  const error = (title: string, message?: string) => showToast({ type: 'error', title, message });
  const info = (title: string, message?: string) => showToast({ type: 'info', title, message });
  const warning = (title: string, message?: string) => showToast({ type: 'warning', title, message });

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return (
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      );
      case 'error': return (
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 dark:bg-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
      );
      case 'warning': return (
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
      default: return (
        <div className="w-9 h-9 rounded-xl bg-sky-500/15 dark:bg-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
      );
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/40 text-slate-900 dark:text-white shadow-xl shadow-emerald-500/10';
      case 'error':
        return 'bg-white/95 dark:bg-slate-900/95 border-rose-500/40 text-slate-900 dark:text-white shadow-xl shadow-rose-500/10';
      case 'warning':
        return 'bg-white/95 dark:bg-slate-900/95 border-amber-500/40 text-slate-900 dark:text-white shadow-xl shadow-amber-500/10';
      default:
        return 'bg-white/95 dark:bg-slate-900/95 border-sky-500/40 text-slate-900 dark:text-white shadow-xl shadow-sky-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
              layout
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3.5 relative overflow-hidden transition-all ${getToastStyles(toast.type)}`}
            >
              {getIcon(toast.type)}
              <div className="flex-1 pr-6 pt-0.5">
                <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{toast.title}</h4>
                {toast.message && (
                  <p className="text-xs mt-1 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
