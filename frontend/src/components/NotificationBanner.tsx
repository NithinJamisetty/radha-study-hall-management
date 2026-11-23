import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MessageCircle, 
  X,
  CheckCircle2,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { notificationService, HOURLY_JARVIS_SCHEDULE } from '../services/notificationService.ts';

interface NotificationBannerProps {
  onOpenReport: () => void;
  reportStatus?: string;
  reportMarkdown?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  onOpenReport,
  reportStatus
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [hourlyEnabled, setHourlyEnabled] = useState(notificationService.isHourlyEnabled());
  const [dismissed, setDismissed] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000); // 15s check
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  const isPre8PM = hours === 19 && minutes >= 45; // 7:45 PM to 7:59 PM
  const is8PMWindow = hours === 20 && minutes < 15; // 8:00 PM to 8:14 PM
  const isUnsent = reportStatus !== 'SENT' && reportStatus !== 'AUTO_SENT';

  const handleEnableNotifications = async () => {
    const ok = await notificationService.requestPermission();
    setPermission(notificationService.getPermission());
    if (ok) {
      setHourlyEnabled(true);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  const handleSendTestAlert = async () => {
    setTestSent(true);
    await notificationService.sendTestNotification();
    setTimeout(() => setTestSent(false), 4000);
  };

  if (dismissed) return null;

  const currentHourSchedule = HOURLY_JARVIS_SCHEDULE[hours];

  return (
    <div className="w-full mb-4 space-y-2.5">
      {/* 1. Mobile Hourly Jarvis Notification Status Bar */}
      {permission !== 'granted' ? (
        <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <span>🤖 Enable Hourly Jarvis Mobile Alerts</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200/60 text-emerald-900 rounded-md font-semibold">
                  Hourly Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Receive proactive hourly guidance, shift headcount reminders, and the 8:00 PM report alert on your phone.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Activate
            </button>
            <button 
              onClick={() => setDismissed(true)} 
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 bg-white/90 border border-slate-200/80 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs text-slate-700">
              <strong className="text-emerald-900">Radha Jarvis Hourly Sentinel:</strong> Active on this device • Next alert at {hours + 1}:00
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTestAlert}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] rounded-lg border border-emerald-200/80 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {testSent ? 'Alert Sent! 📱' : 'Test Phone Alert'}
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
