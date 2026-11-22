import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  RefreshCw,
  Clock
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Facility Maintenance Board</h2>
            <p className="text-xs text-slate-500">Track appliance repairs and complaints logged via AI Chat</p>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
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
              className={`p-5 rounded-2xl border transition-all ${
                t.status === 'RESOLVED' 
                  ? 'bg-slate-50/60 border-slate-200/60 opacity-60' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900">{t.itemName}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  t.status === 'RESOLVED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                    : 'bg-rose-50 text-rose-700 border-rose-200/60'
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
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
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
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
