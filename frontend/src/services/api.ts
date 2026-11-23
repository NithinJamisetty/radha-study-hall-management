import {
  getLocalDashboardStats,
  saveLocalDashboardStats,
  getLocalReports,
  saveLocalReports,
  processMessageLocally,
  compileReportMarkdown
} from './localAiEngine.ts';
import { processJarvisMessage } from './jarvisEngine.ts';

export interface ChatResponse {
  messageId: string;
  reply: string;
  intent: string;
  isCorrection: boolean;
  extracted: {
    newAdmissions?: number;
    studentsLeft?: number;
    feeCollected?: number;
    feePayingStudents?: number;
    morningAttendance?: number;
    afternoonAttendance?: number;
    eveningAttendance?: number;
    maintenanceItems?: Array<{
      equipment: string;
      location: string;
      issue: string;
      priority: string;
    }>;
    operationalNotes?: string[];
  };
  timestamp: string;
}

export interface DashboardStats {
  today: string;
  totalActiveStudents: number;
  todayNewAdmissions: number;
  todayStudentsLeft: number;
  todayFeeCollected: number;
  todayFeePaidCount: number;
  morningAttendance?: number;
  afternoonAttendance?: number;
  eveningAttendance?: number;
  openMaintenanceTickets: number;
  recentMaintenance: Array<{
    id: string;
    item: string;
    location: string;
    issue: string;
    priority: string;
    status: string;
  }>;
  todayReport?: {
    id: string;
    reportDate: string;
    formattedMarkdown: string;
    status: string;
    approvedBy?: string;
    draftCreatedAt: string;
    dispatchedAt?: string;
    dispatchChannel: string;
  };
}

export interface DailyReportItem {
  id: string;
  reportDate: string;
  formattedMarkdown: string;
  status: string;
  approvedBy?: string;
  draftCreatedAt: string;
  dispatchedAt?: string;
  dispatchChannel: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

export const api = {
  getApiBase() {
    return API_BASE;
  },

  async sendMessage(message: string, username = 'admin'): Promise<ChatResponse> {
    // 1. Process directly with autonomous Radha Jarvis 2.0 intelligence
    // (Never treat greetings or queries as robotic database notes)
    const jarvisResponse = processJarvisMessage(message);

    // 2. If it contains actual study hall operational data (admissions, fees, shift attendance, repairs),
    // sync to backend & Excel database in background
    const hasDataToSync = jarvisResponse.extracted && (
      jarvisResponse.extracted.newAdmissions !== undefined ||
      jarvisResponse.extracted.feeCollected !== undefined ||
      jarvisResponse.extracted.eveningAttendance !== undefined ||
      jarvisResponse.extracted.morningAttendance !== undefined ||
      (jarvisResponse.extracted.maintenanceItems && jarvisResponse.extracted.maintenanceItems.length > 0)
    );

    if (hasDataToSync) {
      try {
        await fetch(`${API_BASE}/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, username }),
        });
      } catch (e) {
        // Backend not reached, local persistence already handled
      }
    }

    return jarvisResponse;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend not reached
    }
    return getLocalDashboardStats();
  },

  async getTodayReport(): Promise<DailyReportItem> {
    try {
      const res = await fetch(`${API_BASE}/reports/today`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend not reached
    }
    const stats = getLocalDashboardStats();
    if (stats.todayReport) return stats.todayReport;

    return {
      id: 'rep-' + stats.today,
      reportDate: stats.today,
      formattedMarkdown: compileReportMarkdown(
        stats.today,
        stats.totalActiveStudents,
        stats.todayNewAdmissions,
        stats.todayStudentsLeft,
        stats.todayFeeCollected,
        stats.todayFeePaidCount,
        stats.morningAttendance,
        stats.afternoonAttendance,
        stats.eveningAttendance,
        []
      ),
      status: 'PENDING_APPROVAL',
      draftCreatedAt: new Date().toISOString(),
      dispatchChannel: 'WHATSAPP'
    };
  },

  async generateDraftReport(date?: string): Promise<DailyReportItem> {
    try {
      const url = date ? `${API_BASE}/reports/generate?date=${date}` : `${API_BASE}/reports/generate`;
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    const stats = getLocalDashboardStats();
    return stats.todayReport!;
  },

  async approveReport(date: string, updatedMarkdown: string, dispatchImmediately = true): Promise<DailyReportItem> {
    try {
      const res = await fetch(`${API_BASE}/reports/${date}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedMarkdown,
          approvedByUsername: 'admin',
          dispatchImmediately
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const stats = getLocalDashboardStats();
    if (stats.todayReport) {
      stats.todayReport.status = dispatchImmediately ? 'DISPATCHED' : 'APPROVED';
      stats.todayReport.formattedMarkdown = updatedMarkdown;
      stats.todayReport.approvedBy = 'admin';
      if (dispatchImmediately) {
        stats.todayReport.dispatchedAt = new Date().toISOString();
      }
      saveLocalDashboardStats(stats);

      const reports = getLocalReports();
      const existingIdx = reports.findIndex(r => r.reportDate === date);
      if (existingIdx >= 0) {
        reports[existingIdx] = stats.todayReport;
      } else {
        reports.unshift(stats.todayReport);
      }
      saveLocalReports(reports);

      return stats.todayReport;
    }

    return {
      id: 'rep-' + date,
      reportDate: date,
      formattedMarkdown: updatedMarkdown,
      status: dispatchImmediately ? 'DISPATCHED' : 'APPROVED',
      approvedBy: 'admin',
      draftCreatedAt: new Date().toISOString(),
      dispatchedAt: dispatchImmediately ? new Date().toISOString() : undefined,
      dispatchChannel: 'WHATSAPP'
    };
  },

  async sendReportNow(date: string): Promise<DailyReportItem> {
    try {
      const res = await fetch(`${API_BASE}/reports/${date}/send-now`, {
        method: 'POST'
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const stats = getLocalDashboardStats();
    if (stats.todayReport) {
      stats.todayReport.status = 'DISPATCHED';
      stats.todayReport.dispatchedAt = new Date().toISOString();
      saveLocalDashboardStats(stats);
      api.openInWhatsApp(stats.todayReport.formattedMarkdown);
      return stats.todayReport;
    }

    const fallbackItem: DailyReportItem = {
      id: 'rep-' + date,
      reportDate: date,
      formattedMarkdown: `*RADHA STUDY HALL – DAILY REPORT*`,
      status: 'DISPATCHED',
      draftCreatedAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      dispatchChannel: 'WHATSAPP'
    };
    api.openInWhatsApp(fallbackItem.formattedMarkdown);
    return fallbackItem;
  },

  async getAllReports(): Promise<DailyReportItem[]> {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const localList = getLocalReports();
    if (localList.length > 0) return localList;

    const stats = getLocalDashboardStats();
    return stats.todayReport ? [stats.todayReport] : [];
  },

  async resolveMaintenance(ticketId: string) {
    try {
      const res = await fetch(`${API_BASE}/dashboard/maintenance/${ticketId}/resolve`, {
        method: 'PATCH'
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const stats = getLocalDashboardStats();
    const ticket = stats.recentMaintenance.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = 'RESOLVED';
      stats.openMaintenanceTickets = Math.max(0, stats.openMaintenanceTickets - 1);
      saveLocalDashboardStats(stats);
    }
    return { status: 'RESOLVED', ticketId };
  },

  async getMaintenanceTickets() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/maintenance`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const stats = getLocalDashboardStats();
    return stats.recentMaintenance;
  },

  async getTrainingTemplate() {
    try {
      const res = await fetch(`${API_BASE}/training/template`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const cached = localStorage.getItem('radha_study_hall_training_tpl');
    if (cached) {
      return JSON.parse(cached);
    }
    return {
      template: `*RADHA STUDY HALL – DAILY REPORT*\n\n📅 {date}\n\n*1. Student Updates*\n• New admissions: {newAdmissions}\n• Total active students: {totalActiveStudents}\n\n*2. Fee Collection*\n• Total collected: ₹{todayFeeCollected}\n\n*3. Attendance*\n• Evening shift: {eveningAttendance}\n\n*4. Maintenance & Facilities*\n{maintenanceSection}\n\n*5. Important Updates*\n• {operationalNotes}`,
      trainingPrompt: `You are the executive AI Operations Bot for Radha Study Hall. Parse natural language messages into admissions, fees, shift turnouts, and repair items.`
    };
  },

  async saveTrainingTemplate(template: string, trainingPrompt: string) {
    try {
      const res = await fetch(`${API_BASE}/training/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, trainingPrompt })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    localStorage.setItem('radha_study_hall_training_tpl', JSON.stringify({ template, trainingPrompt }));
    return { status: 'SAVED_LOCALLY', template, trainingPrompt };
  },

  getExcelDownloadUrl() {
    return `${API_BASE}/reports/download-excel`;
  },

  openInWhatsApp(rawText: string) {
    const waText = rawText
      .replace(/<b>(.*?)<\/b>/gi, '*$1*')
      .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '_$1_')
      .replace(/<br\s*\/?>/gi, '\n');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
  }
};
