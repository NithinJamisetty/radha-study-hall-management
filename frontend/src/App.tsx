import { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { NotificationBanner } from './components/NotificationBanner.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { ChatWidget } from './components/ChatWidget.tsx';
import { ReportReviewModal } from './components/ReportReviewModal.tsx';
import { MaintenanceList } from './components/MaintenanceList.tsx';
import { ReportHistory } from './components/ReportHistory.tsx';
import { BotTrainingStudio } from './components/BotTrainingStudio.tsx';
import { InstallAppModal } from './components/InstallAppModal.tsx';
import { api, DashboardStats } from './services/api.ts';
import { notificationService } from './services/notificationService.ts';
import { JarvisAlertToast } from './components/JarvisAlertToast.tsx';
import { RefreshCw, Smartphone, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Initialize Autonomous Radha Jarvis Hourly Mobile Watcher
  useEffect(() => {
    notificationService.startHourlyWatcher();
    return () => notificationService.stopHourlyWatcher();
  }, []);

  const loadStats = async () => {
    setRefreshing(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.warn("Backend not yet active or unreachable. Showing live local state.");
      setStats({
        today: new Date().toISOString().split('T')[0],
        totalActiveStudents: 185,
        todayNewAdmissions: 5,
        todayStudentsLeft: 0,
        todayFeeCollected: 12500,
        todayFeePaidCount: 12,
        morningAttendance: 72,
        afternoonAttendance: 68,
        eveningAttendance: 85,
        openMaintenanceTickets: 1,
        recentMaintenance: [
          {
            id: 'm1',
            item: 'AC',
            location: 'ROOM 2',
            issue: 'AC in Room 2 is not working',
            priority: 'HIGH',
            status: 'OPEN'
          }
        ],
        todayReport: {
          id: 'rep-today',
          reportDate: new Date().toISOString().split('T')[0],
          formattedMarkdown: `*RADHA STUDY HALL – DAILY REPORT*\n\n22 November 2026 | Sunday\n\n*1. Student Updates*\n• New admissions: 5\n• Total active students: 185\n\n*2. Fee Collection*\n• Total collected: ₹12,500\n• Paid students: 12\n\n*3. Attendance*\n• Morning shift: 72\n• Afternoon shift: 68\n• Evening shift: 85\n\n*4. Maintenance*\n• ROOM 2 AC — Not working\n• Maintenance pending: 1\n\nGenerated automatically\n8:00 PM`,
          status: 'PENDING_APPROVAL',
          draftCreatedAt: new Date().toISOString(),
          dispatchChannel: 'WHATSAPP'
        }
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openReportsModal={() => setIsModalOpen(true)}
        pendingReportCount={stats?.todayReport?.status === 'PENDING_APPROVAL' ? 1 : 0}
        onInstallApp={() => setIsInstallModalOpen(true)}
        canInstall={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile & Tablet Brand Mascot */}
            <div className="lg:hidden relative">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-300 p-0.5 overflow-hidden shadow-xs flex items-center justify-center">
                <img 
                  src="/images/avatar_girl_3d.png" 
                  alt="Radha Study Hall"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                Radha Study Hall
              </h1>
              <p className="text-[11px] text-emerald-600 font-semibold capitalize">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'chat' && 'AI Chat Assistant'}
                {activeTab === 'training' && 'Bot Report Studio'}
                {activeTab === 'reports' && 'WhatsApp Daily Reports'}
                {activeTab === 'maintenance' && 'Facility Repairs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Report Review Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200/70 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Preview</span> 8 PM Report
            </button>

            {/* Install PWA Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="hidden sm:flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>

            <button
              onClick={loadStats}
              disabled={refreshing}
              title="Refresh Live Data"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto pb-20 lg:pb-8">
          {/* 8:00 PM Notification & Status Banner */}
          <NotificationBanner
            onOpenReport={() => setIsModalOpen(true)}
            reportStatus={stats?.todayReport?.status}
            reportMarkdown={stats?.todayReport?.formattedMarkdown}
          />

          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              openReviewModal={() => setIsModalOpen(true)}
              switchToChat={() => setActiveTab('chat')}
              onRefresh={loadStats}
              onNavigateTab={(tab: string) => setActiveTab(tab as TabType)}
            />
          )}

          {activeTab === 'chat' && (
            <ChatWidget onUpdateEvent={loadStats} />
          )}

          {activeTab === 'training' && <BotTrainingStudio />}

          {activeTab === 'reports' && <ReportHistory />}

          {activeTab === 'maintenance' && <MaintenanceList />}
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={stats?.todayReport?.status === 'PENDING_APPROVAL' ? 1 : 0}
        />
      </div>

      {/* 8:00 PM Review & Approval Modal */}
      <ReportReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportDispatched={loadStats}
      />

      {/* Install App PWA Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Floating In-App Jarvis Alert Banner */}
      <JarvisAlertToast />
    </div>
  );
}
