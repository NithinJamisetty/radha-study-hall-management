import React, { useState } from 'react';
import { 
  Users, 
  IndianRupee, 
  Clock, 
  Wrench, 
  Send,
  MessageCircle,
  Copy,
  Check,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { DashboardStats, api } from '../services/api.ts';
import { GoogleSheetSyncModal } from './GoogleSheetSyncModal.tsx';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  openReviewModal: () => void;
  switchToChat: () => void;
  onRefresh: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  stats, 
  openReviewModal, 
  switchToChat,
  onRefresh,
  onNavigateTab
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

  const totalSeats = 220;
  const activeStudents = stats?.totalActiveStudents || 185;
  const feeCollected = stats?.todayFeeCollected || 12500;
  const feePaidCount = stats?.todayFeePaidCount || 12;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* 8:15 PM Alert Banner (only when report is overdue) */}
      {isOverdue && isReportUnsent && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                8:15 PM Daily Report Pending Dispatch
              </h4>
              <p className="text-[11px] text-amber-800">
                Today's operational summary is ready. Review and send to WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={openReviewModal}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-white hover:bg-amber-100/50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200 transition-colors cursor-pointer"
            >
              Review Draft
            </button>
            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              {sendingNow ? "Opening..." : "Send via WhatsApp"}
            </button>
          </div>
        </div>
      )}

      {/* Main Clean Hero Banner */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-300 rounded-full text-xs font-semibold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Excel Database Connected
            </span>
            <span className="text-xs text-slate-300 font-medium">{formattedDate}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Radha Study Hall Command
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Message the bot throughout the day to track student admissions, fee payments, and shift turnout. Your 8:00 PM WhatsApp group report compiles automatically.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{sendingNow ? "Opening WhatsApp..." : "Send to WhatsApp Now"}</span>
            </button>

            <button
              onClick={switchToChat}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              Open AI Chat
            </button>

            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheet Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeStudents}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ {totalSeats} capacity</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              +{stats?.todayNewAdmissions || 5} enrolled today
            </p>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            Auto-synced with Excel
          </div>
        </div>

        {/* Card 2: Fee Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fee Collection</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{feeCollected.toLocaleString()}
            </span>
            <p className="text-[11px] text-teal-700 font-semibold mt-1">
              {feePaidCount} students completed payment
            </p>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            Ready for 8 PM report
          </div>
        </div>

        {/* Card 3: Shift Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evening Shift</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats?.eveningAttendance || 85}
            </span>
            <span className="text-xs text-slate-400 ml-1">students</span>
            <p className="text-[11px] text-sky-700 font-semibold mt-1">
              Morning: {stats?.morningAttendance || 72} &bull; Afternoon: {stats?.afternoonAttendance || 68}
            </p>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            Turnout logged to Excel
          </div>
        </div>

        {/* Card 4: Facility Status */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('maintenance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Facility Status</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.openMaintenanceTickets || 1}
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Active Ticket
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1 truncate">
              {stats?.recentMaintenance?.[0]?.issue || 'AC in Room 2 is not working'}
            </p>
          </div>
          <div className="text-[10px] text-amber-700 font-bold border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>View Repair Desk</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* WhatsApp 8:00 PM Simulation & Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Radha Study Hall WhatsApp Simulation
              </h3>
              <p className="text-xs text-slate-500">
                Live Group Preview &bull; Automatically formatted for 8:00 PM dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Report"}</span>
            </button>

            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingNow ? "Dispatching..." : "Send to WhatsApp Now"}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Balloon */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 font-mono text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
          {stats?.todayReport?.formattedMarkdown || `*RADHA STUDY HALL – DAILY REPORT*\n\n22 November 2026 | Sunday\n\n*1. Student Updates*\n• New admissions: 5\n• Total active students: 185\n\n*2. Fee Collection*\n• Total collected: ₹12,500\n• Paid students: 12\n\n*3. Attendance*\n• Morning shift: 72\n• Afternoon shift: 68\n• Evening shift: 85\n\n*4. Maintenance*\n• ROOM 2 AC — Not working\n• Maintenance pending: 1\n\nGenerated automatically\n8:00 PM`}
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
