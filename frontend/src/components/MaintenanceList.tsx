import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  RefreshCw,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.ts';

interface Ticket {
  id: string;
  itemName: string;
  location: string;
  issueDescription: string;
  priority: string;
  status: string;
  reportedDate: string;
}

export const MaintenanceList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/maintenance');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveMaintenance(id);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
    } catch (err) {
      alert("Failed to resolve ticket");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Visual Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-slate-50 border border-amber-200/70 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200/80 p-2 flex items-center justify-center flex-shrink-0 shadow-xs">
            <img 
              src="/images/ac_icon.png" 
              alt="Radha Study Hall Appliances" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Radha Study Hall Facility
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Appliance &amp; Maintenance Board
            </h2>
            <p className="text-xs text-slate-500">
              Track air conditioning, lighting, and power complaints logged by admins
            </p>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="p-2.5 text-slate-400 hover:text-slate-700 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          title="Refresh repairs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs sm:text-sm">
          No maintenance issues logged. Say "AC in Room 2 is not working" in AI Chat to record one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(t => (
            <div 
              key={t.id} 
              className={`p-5 rounded-3xl border transition-all ${
                t.status === 'RESOLVED' 
                  ? 'bg-slate-50/60 border-slate-200/60 opacity-60' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 p-1 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/images/ac_icon.png" 
                      alt="AC" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-bold text-sm text-slate-900">{t.itemName}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  t.status === 'RESOLVED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                    : 'bg-rose-50 text-rose-700 border-rose-200/60'
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {t.location}
                </span>
                <span>&bull;</span>
                <span className="text-slate-400 text-[11px]">{t.reportedDate}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t.issueDescription}
              </p>

              {t.status !== 'RESOLVED' ? (
                <button
                  onClick={() => handleResolve(t.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Fixed
                </button>
              ) : (
                <div className="text-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200/60">
                  ✓ Resolved
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
