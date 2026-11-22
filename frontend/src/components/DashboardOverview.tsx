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
  Check
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
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                8:15 PM Daily Report Pending
              </h4>
              <p className="text-[11px] text-amber-700">
                Report draft is compiled. Click below to review or send directly to WhatsApp.
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
              {sendingNow ? "Opening..." : "Send via WhatsApp Now"}
            </button>
          </div>
        </div>
      )}

      {/* Main Hero Card: Clean, Calm & Modern */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Database Connected
            </span>
            <span className="text-xs text-slate-600 font-medium">{formattedDate}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Radha Study Hall Command
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Message the bot throughout the day to track admissions, fees, and attendance. Your 8:00 PM WhatsApp report is prepared automatically.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleSendNow}
            disabled={sendingNow}
            className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all duration-150"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{sendingNow ? "Opening WhatsApp..." : "Send to WhatsApp"}</span>
          </button>

          <button
            onClick={switchToChat}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors text-center"
          >
            AI Chat Update
          </button>

          <button
            onClick={() => setIsSheetModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Configure Google Spreadsheet approval"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Google Sheet Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid: 4 Clean Minimalist Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Students */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Students</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.totalActiveStudents ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <UserPlus className="w-3.5 h-3.5" />
              +{stats?.todayNewAdmissions ?? 0} new today
            </div>
          </div>
        </div>

        {/* Fees Collected */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fee Collection</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{(stats?.todayFeeCollected ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {stats?.todayFeePaidCount ?? 0} student payments
            </div>
          </div>
        </div>

        {/* Shift Attendance */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evening Shift</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.eveningAttendance ?? (stats?.morningAttendance ?? "—")}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Attendance logged
            </div>
          </div>
        </div>

        {/* Facility Complaints */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Facility Status</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              (stats?.openMaintenanceTickets ?? 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats?.openMaintenanceTickets ?? 0}
            </div>
            <div className={`text-[11px] font-medium mt-1 ${
              (stats?.openMaintenanceTickets ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {(stats?.openMaintenanceTickets ?? 0) === 0 ? "All clear" : "Active complaints"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: WhatsApp Report Preview + Active Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Daily Report WhatsApp Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Today's Daily Report Preview</h3>
                <p className="text-[11px] text-slate-400">Formatted and ready for your WhatsApp study hall group</p>
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
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy report text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Clean Message Bubble Preview */}
          <div className="bg-[#f0fdf4]/50 border border-emerald-100/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
            {stats?.todayReport?.formattedMarkdown || "Report draft compiles as messages arrive in AI Chat..."}
          </div>

          {/* Card Actions */}
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

        {/* Facility Complaints Quick Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Active Complaints</h3>
              </div>
              <span className="text-[11px] text-slate-400">Facility Maintenance</span>
            </div>

            {(!stats?.recentMaintenance || stats.recentMaintenance.length === 0) ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                All appliances operational. No open complaints!
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentMaintenance.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{m.item}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200/60">
                        {m.location}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 line-clamp-1">{m.issue}</p>
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
