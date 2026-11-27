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
  ShieldCheck,
  CheckCircle2,
  Flame,
  Trophy,
  Target,
  ArrowRight,
  Zap,
  ChevronRight,
  Maximize2
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
  const [showCelebration, setShowCelebration] = useState(true);

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
  const occupancyPercent = Math.round((activeStudents / totalSeats) * 100);
  const feeTarget = 15000;
  const feeCollected = stats?.todayFeeCollected || 12500;
  const feePercent = Math.min(100, Math.round((feeCollected / feeTarget) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* 1. Gamified Duolingo-Style Daily Operational Streak Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Flame className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                7-Day Admin Streak 🔥
              </span>
              <span className="text-xs font-semibold text-emerald-100">Daily Quest 75% Complete</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white mt-0.5">
              "Amazing! Morning &amp; Evening shifts are logged and payments updated!"
            </h3>
          </div>
        </div>

        {/* Daily Quests Mini-Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 border border-white/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Attendance Logged</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 border border-white/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>₹12,500 Fees</span>
          </div>
          <button
            onClick={openReviewModal}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-black shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Preview 8 PM Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Overdue Alert (if unsent after 8:15 PM) */}
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

      {/* 3. Bento Playground Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Bento Hero Card (Spans 2 columns on lg) */}
        <div className="lg:col-span-2 p-6 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-emerald-500/20 group hover:shadow-xl transition-all">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-300 rounded-full text-xs font-semibold border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Excel Sync Active
              </span>
              <span className="text-xs text-slate-300 font-medium">{formattedDate}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Radha Study Hall Command
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-lg">
              Autonomous operations &amp; daily report intelligence. Message the assistant throughout the day to record admissions, fees, and shift attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-4 z-10">
            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{sendingNow ? "Opening..." : "Send to WhatsApp Now"}</span>
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
              <span>Google Sheet</span>
            </button>
          </div>
        </div>

        {/* Bento Widget: Spatial Smart Seats Progress Ring */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('seats')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spatial Capacity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 flex items-center justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeStudents}
              </span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">/ {totalSeats} seats</span>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                +{stats?.todayNewAdmissions || 5} enrolled today
              </p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${occupancyPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-slate-800">{occupancyPercent}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>View 220 Seat Grid</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Bento Widget: Daily Revenue Target */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Collection</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{feeCollected.toLocaleString()}
            </span>
            <p className="text-[11px] text-teal-700 font-bold mt-0.5">
              {stats?.todayFeePaidCount || 12} students completed payment
            </p>

            {/* Target Progress Bar */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                <span>Daily Target</span>
                <span>{feePercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${feePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Log Fee in AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Bento Widget: Daily Shift Attendance Trio */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Operating Shifts Turnout</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              3 Shifts Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Morning (6-12)</span>
              <span className="text-xl font-black text-slate-800 mt-1 block">{stats?.morningAttendance || 72}</span>
              <span className="text-[10px] text-emerald-600 font-bold">Checked In</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Afternoon (12-5)</span>
              <span className="text-xl font-black text-slate-800 mt-1 block">{stats?.afternoonAttendance || 68}</span>
              <span className="text-[10px] text-emerald-600 font-bold">Checked In</span>
            </div>

            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
              <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider block">Evening (5-11)</span>
              <span className="text-xl font-black text-sky-950 mt-1 block">{stats?.eveningAttendance || 85}</span>
              <span className="text-[10px] text-sky-700 font-bold">Peak Turnout</span>
            </div>
          </div>
        </div>

        {/* Bento Widget: Facility Sentinel */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('maintenance')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility Status</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.openMaintenanceTickets || 1}</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Active Ticket
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              {stats?.recentMaintenance?.[0]?.issue || 'AC in Room 2 is not working'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>View Repair Desk</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Bento Widget: Automation Studio Shortcut */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('automation')}
          className="bg-gradient-to-br from-teal-500 to-emerald-600 p-5 rounded-3xl text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-teal-100">Automation Studio</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-xl font-black">4 Active Flows</span>
            <p className="text-xs text-teal-100 mt-0.5">
              8 PM WhatsApp, Silent Sentinel, Fee Alerter running automatically.
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
            <span>Open Workflow Canvas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 4. Live WhatsApp 8:00 PM Simulation & Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                8:00 PM WhatsApp Group Report Simulation
              </h3>
              <p className="text-xs text-slate-500">
                Auto-compiled continuously from today's operational updates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Format"}</span>
            </button>

            <button
              onClick={handleSendNow}
              disabled={sendingNow}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingNow ? "Dispatching..." : "Send to Group"}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Balloon */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 font-mono text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
          {stats?.todayReport?.formattedMarkdown || `*RADHA STUDY HALL – DAILY REPORT*\n\nToday's operations compiled automatically at 8:00 PM.`}
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
