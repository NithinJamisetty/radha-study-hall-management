import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  IndianRupee, 
  Clock, 
  Wrench, 
  FileText, 
  Search, 
  Filter, 
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats } from '../services/api.ts';

interface ActivityItem {
  id: string;
  timestamp: string;
  category: 'admission' | 'fee' | 'attendance' | 'maintenance' | 'report';
  title: string;
  description: string;
  source: 'AI Chat' | 'Smart Desk Map' | '8 PM Automation' | 'Admin';
  amount?: number;
  status: 'Completed' | 'Pending' | 'Logged';
}

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '20:00 Today',
    category: 'report',
    title: '8:00 PM WhatsApp Daily Report Compiled',
    description: 'Radha Jarvis compiled turnout across all 3 shifts (Morning: 72, Afternoon: 68, Evening: 85) with ₹12,500 collected fees.',
    source: '8 PM Automation',
    status: 'Pending'
  },
  {
    id: 'act-2',
    timestamp: '18:45 Today',
    category: 'attendance',
    title: 'Evening Shift Turnout Recorded',
    description: 'Evening shift logged 85 active students across AC cabins and quiet study zones.',
    source: 'AI Chat',
    status: 'Completed'
  },
  {
    id: 'act-3',
    timestamp: '17:30 Today',
    category: 'fee',
    title: 'Fee Collection Logged (₹12,500)',
    description: '12 students completed monthly subscription fee payments. Excel database synchronized.',
    source: 'AI Chat',
    amount: 12500,
    status: 'Completed'
  },
  {
    id: 'act-4',
    timestamp: '16:15 Today',
    category: 'admission',
    title: '5 New Student Admissions Enrolled',
    description: 'Total active students increased to 185 out of 220 seats capacity.',
    source: 'AI Chat',
    status: 'Completed'
  },
  {
    id: 'act-5',
    timestamp: '14:20 Today',
    category: 'maintenance',
    title: 'AC in Room 2 Issue Logged',
    description: 'AC in Room 2 reported not cooling properly. High priority repair ticket opened.',
    source: 'AI Chat',
    status: 'Pending'
  },
  {
    id: 'act-6',
    timestamp: '12:05 Today',
    category: 'attendance',
    title: 'Afternoon Shift Turnout Recorded',
    description: 'Afternoon shift logged 68 students present in reading halls.',
    source: 'Admin',
    status: 'Completed'
  },
  {
    id: 'act-7',
    timestamp: '08:30 Today',
    category: 'attendance',
    title: 'Morning Shift Turnout Recorded',
    description: 'Morning shift logged 72 students attending early morning study sessions.',
    source: 'Smart Desk Map',
    status: 'Completed'
  }
];

export const ActivityUniverse: React.FC<{ stats?: DashboardStats | null }> = () => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_ACTIVITIES.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportAudit = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Category,Title,Description,Source,Status\n" +
      SAMPLE_ACTIVITIES.map(e => `"${e.timestamp}","${e.category}","${e.title}","${e.description}","${e.source}","${e.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `radha_activity_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-sky-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30 mb-3">
              <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Live Operational Audit Universe</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Radha Study Hall Activity Stream
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Chronological feed of all operational events: student admissions, fee transactions, shift attendance checks, and automated daily report triggers.
            </p>
          </div>

          <button
            onClick={handleExportAudit}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'admission', label: 'Admissions' },
            { id: 'fee', label: 'Fees Collection' },
            { id: 'attendance', label: 'Shift Turnout' },
            { id: 'maintenance', label: 'Facility Repairs' },
            { id: 'report', label: 'WhatsApp Reports' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === btn.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>
      </div>

      {/* 3. Chronological Activity Feed */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-100">
          {filtered.map(act => {
            let icon = <Activity className="w-4 h-4 text-sky-600" />;
            let badgeBg = 'bg-sky-50 border-sky-200';

            if (act.category === 'admission') {
              icon = <Users className="w-4 h-4 text-emerald-600" />;
              badgeBg = 'bg-emerald-50 border-emerald-200';
            } else if (act.category === 'fee') {
              icon = <IndianRupee className="w-4 h-4 text-teal-600" />;
              badgeBg = 'bg-teal-50 border-teal-200';
            } else if (act.category === 'attendance') {
              icon = <Clock className="w-4 h-4 text-indigo-600" />;
              badgeBg = 'bg-indigo-50 border-indigo-200';
            } else if (act.category === 'maintenance') {
              icon = <Wrench className="w-4 h-4 text-rose-600" />;
              badgeBg = 'bg-rose-50 border-rose-200';
            } else if (act.category === 'report') {
              icon = <FileText className="w-4 h-4 text-amber-600" />;
              badgeBg = 'bg-amber-50 border-amber-200';
            }

            return (
              <div key={act.id} className="relative flex items-start gap-4 pl-2 group">
                {/* Timeline Icon Node */}
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 z-10 bg-white shadow-2xs group-hover:scale-105 transition-transform ${badgeBg}`}>
                  {icon}
                </div>

                {/* Event Details Card */}
                <div className="flex-1 bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/70 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {act.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    {act.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      Source: <strong className="text-slate-700">{act.source}</strong>
                    </span>

                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
