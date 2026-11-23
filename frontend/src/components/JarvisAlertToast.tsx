import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Brain, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Volume2
} from 'lucide-react';
import { notificationService, JarvisInAppAlert } from '../services/notificationService.ts';

export const JarvisAlertToast: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<JarvisInAppAlert | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeAlerts((alert) => {
      setActiveAlert(alert);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 7000); // 7s auto-dismiss
      return () => clearTimeout(timer);
    }
  }, [activeAlert]);

  if (!activeAlert) return null;

  const isWarning = activeAlert.type === 'warning';
  const isSuccess = activeAlert.type === 'success';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000000] w-[92%] sm:w-auto sm:min-w-[420px] sm:max-w-xl animate-fade-in pointer-events-auto">
      <div className={`p-4 rounded-3xl shadow-2xl border backdrop-blur-xl flex items-start gap-3.5 transition-all ${
        isWarning
          ? 'bg-amber-950/95 text-amber-50 border-amber-500/50 shadow-amber-900/20'
          : isSuccess
          ? 'bg-emerald-950/95 text-emerald-50 border-emerald-500/50 shadow-emerald-900/20'
          : 'bg-slate-950/95 text-white border-emerald-500/40 shadow-slate-900/30'
      }`}>
        {/* Animated Icon Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center p-0.5 shadow-md ${
            isWarning
              ? 'bg-amber-600 text-white'
              : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950'
          }`}>
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-xs sm:text-sm tracking-tight text-white line-clamp-1">
              {activeAlert.title}
            </h4>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Volume2 className="w-3 h-3 text-emerald-400" />
              {activeAlert.timestamp}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {activeAlert.body}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
