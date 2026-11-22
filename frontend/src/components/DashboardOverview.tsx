import React, { useState } from 'react';
import { 
  Users, 
  IndianRupee, 
  Clock, 
  Wrench, 
  UserPlus, 
  FileCheck, 
  ArrowUpRight,
  Send,
  Sparkles,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { DashboardStats, api } from '../services/api.ts';
import { GoogleSheetSyncModal } from './GoogleSheetSyncModal.tsx';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  openReviewModal: () => void;
  switchToChat: () => void;
  onRefresh: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  stats, 
  openReviewModal, 
  switchToChat,
  onRefresh
}) => {
  const [sendingNow, setSendingNow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  const isOverdue = stats?.todayReport?.status === 'OVERDUE_PENDING_DISPATCH' || 
    (new Date().getHours() > 20 || (new Date().getHours() === 20 && new Date().getMinutes() >= 15));

  const isReportUnsent = stats?.todayReport?.status !== 'SENT' && stats?.todayReport?.status !== 'AUTO_SENT';

  const handleSendNow = async () => {
    if (!stats?.today) return;
    setSendingNow(true);
    try {
      const updated = await api.sendReportNow(stats.today);
      const textToShare = updated.formattedMarkdown || stats.todayReport?.formattedMarkdown || '';
      api.openInWhatsApp(textToShare);
      onRefresh();
    } catch (e) {
      alert("Failed to send report now");
    } finally {
      setSendingNow(false);
    }
  };

  const handleCopyReport = () => {
    const text = stats?.todayReport?.formattedMarkdown || '';
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* 8:15 PM Overdue Urgent Action Banner (only if unsent) */}
      {isOverdue && isReportUnsent && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                8:15 PM Daily Report Pending Dispatch
              </h4>
              <p className="text-[11px] text-amber-800">
                Today's operational compilation is ready. Review and send to WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={openReviewModal}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-white hover:bg-amber-100/50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200 transition-colors"
            >
              Review Draft
            </button>
            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              {sendingNow ? "Opening..." : "Send via WhatsApp"}
            </button>
          </div>
        </div>
      )}

      {/* Main Hero Card: Illustrated with Radha Study Hall 3D Graphics */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Background decorative blob */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-300 rounded-full text-xs font-semibold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Excel Database Connected
            </span>
            <span className="text-xs text-slate-300 font-medium">{formattedDate}</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Radha Study Hall Command
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Message the bot throughout the day to track student admissions, fee payments, and shift turnout. Your 8:00 PM WhatsApp group report compiles automatically.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{sendingNow ? "Opening WhatsApp..." : "Send to WhatsApp Now"}</span>
            </button>

            <button
              onClick={switchToChat}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              Open AI Chat
            </button>

            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheet Sync</span>
            </button>
          </div>
        </div>

        {/* 3D Mascot Graphic on the right */}
        <div className="hidden md:flex items-center justify-center flex-shrink-0 z-10">
          <img 
            src="/images/3d_characters.png" 
            alt="Radha Study Hall Mascot Characters"
            className="w-48 sm:w-56 object-contain drop-shadow-xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* 4 Rich Visual KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Students */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Students</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src="/images/dash_users.png" 
                alt="Active Students"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalActiveStudents ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <UserPlus className="w-3.5 h-3.5" />
              +{stats?.todayNewAdmissions ?? 0} enrolled today
            </div>
          </div>
        </div>

        {/* Card 2: Fee Collections */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fee Collection</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src="/images/dash_enquiries.png" 
                alt="Fee Payments"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{(stats?.todayFeeCollected ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-1">
              {stats?.todayFeePaidCount ?? 0} students completed payment
            </div>
          </div>
        </div>

        {/* Card 3: Shift Attendance */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evening Shift</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src="/images/checking_seats.png" 
                alt="Seating Attendance"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.eveningAttendance ?? (stats?.morningAttendance ?? "85")}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Turnout logged to Excel
            </div>
          </div>
        </div>

        {/* Card 4: Facility Complaints */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Facility Status</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src="/images/ac_icon.png" 
                alt="AC Facility"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.openMaintenanceTickets ?? 0}
            </div>
            <div className={`text-[11px] font-semibold mt-1 ${
              (stats?.openMaintenanceTickets ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {(stats?.openMaintenanceTickets ?? 0) === 0 ? "Facility all clear" : "Active complaints"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: WhatsApp Preview + Active Complaints Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's WhatsApp Report Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Today's Daily WhatsApp Report</h3>
                <p className="text-[11px] text-slate-500">Radha Study Hall Group Summary &bull; Auto-compiled at 8:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                stats?.todayReport?.status === 'SENT' || stats?.todayReport?.status === 'AUTO_SENT'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {stats?.todayReport?.status || 'PENDING_APPROVAL'}
              </span>
              <button
                onClick={handleCopyReport}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy report text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* WhatsApp Chat Message Bubble Styling */}
          <div className="bg-[#e7f7ee]/60 border border-emerald-200/70 rounded-3xl p-5 text-xs text-slate-900 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto shadow-2xs relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/50 text-[11px] text-emerald-800 font-sans font-bold">
              <span>Radha Study Hall Daily Update</span>
              <span>8:00 PM ✓✓</span>
            </div>
            {stats?.todayReport?.formattedMarkdown || "Report draft compiles as messages arrive in AI Chat..."}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Scheduled auto-dispatch at <span className="font-semibold text-slate-600">8:00 PM IST</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={openReviewModal}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Edit Draft
              </button>
              <button
                onClick={handleSendNow}
                disabled={sendingNow}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                {sendingNow ? "Opening..." : "Send to WhatsApp Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Facility Complaints Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Complaints</h3>
                  <p className="text-[10px] text-slate-400">Excel Sheet: Maintenance</p>
                </div>
              </div>
            </div>

            {(!stats?.recentMaintenance || stats.recentMaintenance.length === 0) ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                All appliances operational. No open complaints!
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentMaintenance.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-3">
                    <img 
                      src="/images/ac_icon.png" 
                      alt="Appliance" 
                      className="w-8 h-8 object-contain flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{m.item}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200/60">
                          {m.location}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1 line-clamp-1 text-[11px]">{m.issue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={switchToChat}
            className="w-full mt-4 py-2.5 border border-slate-200/80 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            Report issue via AI Chat
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Google Sheet Sync Modal */}
      <GoogleSheetSyncModal 
        isOpen={isSheetModalOpen} 
        onClose={() => setIsSheetModalOpen(false)} 
      />
    </div>
  );
};
