import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  FileText, 
  Wrench, 
  Sparkles,
  Sliders,
  Download,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api.ts';

interface SidebarProps {
  activeTab: 'dashboard' | 'chat' | 'reports' | 'maintenance' | 'training';
  setActiveTab: (tab: 'dashboard' | 'chat' | 'reports' | 'maintenance' | 'training') => void;
  openReportsModal: () => void;
  pendingReportCount: number;
  onInstallApp: () => void;
  canInstall: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  openReportsModal,
  pendingReportCount,
  onInstallApp,
  canInstall
}) => {
  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight">Radha Study Hall</h1>
          <p className="text-[11px] text-emerald-400 font-medium">Ops &amp; Daily Automation</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3.5 space-y-1 flex-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'dashboard' 
              ? 'bg-emerald-600/90 text-white shadow-xs' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'chat' 
              ? 'bg-emerald-600/90 text-white shadow-xs' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquareText className="w-4 h-4" />
            AI Admin Chat
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/20">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'training' 
              ? 'bg-emerald-600/90 text-white shadow-xs' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Bot Training Studio
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'reports' 
              ? 'bg-emerald-600/90 text-white shadow-xs' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            Daily Reports
          </div>
          {pendingReportCount > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
              Ready
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'maintenance' 
              ? 'bg-emerald-600/90 text-white shadow-xs' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Facility Repairs
        </button>
      </nav>

      {/* Footer Utilities */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-2">
        <a
          href={api.getExcelDownloadUrl()}
          download="study_hall_database.xlsx"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Download Excel DB
        </a>

        {canInstall && (
          <button
            onClick={onInstallApp}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-400" />
            Install as Mobile App
          </button>
        )}

        <div className="pt-2 px-1 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Excel Database Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
};
