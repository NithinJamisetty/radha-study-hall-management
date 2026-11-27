import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  FileText, 
  Wrench, 
  Sliders,
  Download,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.ts';

export type TabType = 'dashboard' | 'chat' | 'reports' | 'maintenance' | 'training';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openReportsModal: () => void;
  pendingReportCount: number;
  onInstallApp: () => void;
  canInstall: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  pendingReportCount,
  onInstallApp,
  canInstall
}) => {
  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-400/30 p-0.5 flex items-center justify-center overflow-hidden shadow-md">
            <img 
              src="/images/avatar_girl_3d.png" 
              alt="Radha Study Hall"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight">Radha Study Hall</h1>
          <p className="text-[11px] text-emerald-400 font-medium">Ops &amp; Daily Automation</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'dashboard' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'chat' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquareText className="w-4 h-4" />
            <span>AI Admin Chat</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/20">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'reports' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            <span>Daily Reports</span>
          </div>
          {pendingReportCount > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
              Ready
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'maintenance' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Facility Repairs</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'training' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Bot Training Studio</span>
        </button>
      </nav>

      {/* Visual Study Hall Status Card */}
      <div className="px-3.5 pb-2">
        <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <img 
            src="/images/dash_seat_management.png" 
            alt="Seat Management" 
            className="w-9 h-9 object-contain drop-shadow"
          />
          <div>
            <div className="text-[11px] font-bold text-white">Study Hall Database</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Excel Synced Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => window.open(api.getExcelDownloadUrl(), '_blank')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Excel DB</span>
        </button>

        <button
          onClick={onInstallApp}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>Install as Mobile App</span>
        </button>
      </div>
    </aside>
  );
};
