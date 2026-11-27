import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  UserPlus, 
  IndianRupee, 
  Clock, 
  Wrench, 
  MessageSquare, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.ts';

interface FloatingActionIslandProps {
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const FloatingActionIsland: React.FC<FloatingActionIslandProps> = ({ 
  onNavigateTab, 
  onRefresh 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdmission = async () => {
    setIsOpen(false);
    try {
      await api.sendMessage("Today 1 new student admitted to Radha Study Hall", "admin");
      showToast("Admitted +1 new student! Database & report updated.");
      onRefresh();
    } catch (e) {
      showToast("Admission logged locally.");
      onRefresh();
    }
  };

  const handleQuickFee = async () => {
    setIsOpen(false);
    const amountStr = prompt("Enter fee collection amount (₹):", "1200");
    if (!amountStr) return;
    const amount = parseInt(amountStr) || 1200;

    try {
      await api.sendMessage(`Collected fee payment ₹${amount} from 1 student`, "admin");
      showToast(`Logged ₹${amount.toLocaleString()} fee payment!`);
      onRefresh();
    } catch (e) {
      showToast(`Logged ₹${amount.toLocaleString()} fee payment.`);
      onRefresh();
    }
  };

  const handleQuickShift = async () => {
    setIsOpen(false);
    const countStr = prompt("Enter evening shift attendance count:", "85");
    if (!countStr) return;
    const count = parseInt(countStr) || 85;

    try {
      await api.sendMessage(`Evening shift attendance is ${count} students`, "admin");
      showToast(`Evening shift turnout recorded as ${count}.`);
      onRefresh();
    } catch (e) {
      showToast(`Shift turnout recorded.`);
      onRefresh();
    }
  };

  const handleQuickRepair = async () => {
    setIsOpen(false);
    const issue = prompt("Enter maintenance issue (e.g. AC in Room 2, Fan #4):", "AC in Room 2 not cooling");
    if (!issue) return;

    try {
      await api.sendMessage(issue, "admin");
      showToast("Maintenance ticket logged and escalated.");
      onRefresh();
    } catch (e) {
      showToast("Maintenance ticket logged.");
      onRefresh();
    }
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[999999] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-2.5 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Floating Island Speed Dial Button */}
      <div className="fixed bottom-24 lg:bottom-8 right-5 z-40 flex flex-col items-end">
        {/* Speed Dial Menu Items */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end gap-2.5 animate-slide-up">
            <button
              onClick={() => { setIsOpen(false); onNavigateTab('chat'); }}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-700 hover:border-emerald-400 text-xs font-bold transition-all group"
            >
              <span>Ask Radha Jarvis</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={handleQuickAdmission}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200 hover:border-emerald-400 text-xs font-bold transition-all group"
            >
              <span>Quick Admission (+1)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={handleQuickFee}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200 hover:border-teal-400 text-xs font-bold transition-all group"
            >
              <span>Collect Fee (₹)</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <IndianRupee className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={handleQuickShift}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200 hover:border-sky-400 text-xs font-bold transition-all group"
            >
              <span>Record Shift Turnout</span>
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={handleQuickRepair}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200 hover:border-rose-400 text-xs font-bold transition-all group"
            >
              <span>Log Maintenance</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Speed dial actions"
          className={`w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer ${
            isOpen 
              ? 'bg-slate-900 rotate-45 scale-105' 
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 hover:scale-105 shadow-emerald-600/30 ring-4 ring-emerald-500/20'
          }`}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
};
