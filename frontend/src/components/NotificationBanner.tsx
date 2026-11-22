import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MessageCircle, 
  X,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.ts';

interface NotificationBannerProps {
  onOpenReport: () => void;
  reportStatus?: string;
  reportMarkdown?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  onOpenReport,
  reportStatus,
  reportMarkdown
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000); // 10s check
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  const isPre8PM = hours === 19 && minutes >= 45; // 7:45 PM to 7:59 PM
  const is8PMWindow = hours === 20 && minutes < 15; // 8:00 PM to 8:14 PM
  const isUnsent = reportStatus !== 'SENT' && reportStatus !== 'AUTO_SENT';

  // Trigger system notification if 8:00 PM arrives
  useEffect(() => {
    if (is8PMWindow && isUnsent && notificationPermission === 'granted') {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        new Notification("📚 Radha Study Hall 8:00 PM Report Ready", {
          body: "Time to review today's study hall report and dispatch to WhatsApp!",
          icon: "/icon-192.png",
          tag: "studyhall-8pm-reminder"
        });
      } catch (ignored) {}
    }
  }, [hours, minutes, isUnsent, notificationPermission]);

  const requestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res === 'granted') {
        new Notification("🔔 Daily 8:00 PM Reminders Active", {
          body: "You'll receive a notification here every evening at 8:00 PM.",
          icon: "/icon-192.png"
        });
      }
    }
  };

  if (dismissed) return null;

  return (
    <div className="w-full mb-4 space-y-2">
      {/* 1. Subtle Notification Permission Pill for Mobile/Tablet */}
      {notificationPermission !== 'granted' && (
        <div className="px-4 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] sm:text-xs">
              Enable notifications to get an alert every day at <strong>8:00 PM</strong> when the report is ready.
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={requestPermission}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-lg transition-colors"
            >
              Enable
            </button>
            <button 
              onClick={() => setDismissed(true)} 
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. 7:45 PM - 7:59 PM: Approaching Window Notice */}
      {isPre8PM && (
        <div className="px-4 py-2.5 bg-sky-50/80 border border-sky-100 rounded-2xl text-xs flex items-center justify-between text-sky-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600 animate-spin" />
            <span className="text-[11px] sm:text-xs">
              <strong>8:00 PM approaching:</strong> Make sure today's shift attendance and fee collections are logged in chat.
            </span>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 text-sky-500 hover:text-sky-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. 8:00 PM - 8:14 PM: Report Ready Alert */}
      {is8PMWindow && isUnsent && (
        <div className="px-4 py-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              8PM
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                8:00 PM Daily Report is Ready
              </div>
              <p className="text-[11px] text-emerald-700">
                Today's numbers are compiled. Review and dispatch to WhatsApp before 8:15 PM.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenReport}
            className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            Review &amp; Send WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};
