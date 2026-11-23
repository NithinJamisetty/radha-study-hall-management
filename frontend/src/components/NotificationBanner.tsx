import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MessageCircle, 
  X
} from 'lucide-react';

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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000); // 15s check
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  const isPre8PM = hours === 19 && minutes >= 45; // 7:45 PM to 7:59 PM
  const is8PMWindow = hours === 20 && minutes < 15; // 8:00 PM to 8:14 PM
  const isUnsent = reportStatus !== 'SENT' && reportStatus !== 'AUTO_SENT';

  // Only show banner during critical daily report workflow windows
  if (dismissed || (!isPre8PM && !(is8PMWindow && isUnsent))) {
    return null;
  }

  return (
    <div className="w-full mb-4 space-y-2.5 animate-fade-in">
      {/* 7:45 PM - 7:59 PM: Approaching Window Notice */}
      {isPre8PM && (
        <div className="px-4 py-2.5 bg-sky-50/80 border border-sky-100 rounded-2xl text-xs flex items-center justify-between text-sky-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600 animate-spin" />
            <span className="text-[11px] sm:text-xs">
              <strong>8:00 PM approaching:</strong> Make sure today's shift attendance and fee collections are logged in chat.
            </span>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 text-sky-500 hover:text-sky-700 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 8:00 PM - 8:14 PM: Report Ready Alert */}
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
            className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            Review &amp; Send WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};
