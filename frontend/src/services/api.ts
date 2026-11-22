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
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, username }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getTodayReport(): Promise<DailyReportItem> {
    const res = await fetch(`${API_BASE}/reports/today`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async generateDraftReport(date?: string): Promise<DailyReportItem> {
    const url = date ? `${API_BASE}/reports/generate?date=${date}` : `${API_BASE}/reports/generate`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to generate report draft');
    return res.json();
  },

  async approveReport(date: string, updatedMarkdown: string, dispatchImmediately = true): Promise<DailyReportItem> {
    const res = await fetch(`${API_BASE}/reports/${date}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updatedMarkdown,
        approvedByUsername: 'admin',
        dispatchImmediately
      }),
    });
    if (!res.ok) throw new Error('Failed to approve report');
    return res.json();
  },

  async sendReportNow(date: string): Promise<DailyReportItem> {
    const res = await fetch(`${API_BASE}/reports/${date}/send-now`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to send report now');
    return res.json();
  },

  async getAllReports(): Promise<DailyReportItem[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async resolveMaintenance(ticketId: string) {
    const res = await fetch(`${API_BASE}/dashboard/maintenance/${ticketId}/resolve`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to resolve ticket');
    return res.json();
  },

  async getMaintenanceTickets() {
    const res = await fetch(`${API_BASE}/dashboard/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance tickets');
    return res.json();
  },

  async getTrainingTemplate() {
    const res = await fetch(`${API_BASE}/training/template`);
    if (!res.ok) throw new Error('Failed to fetch template');
    return res.json();
  },

  async saveTrainingTemplate(template: string, trainingPrompt: string) {
    const res = await fetch(`${API_BASE}/training/template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, trainingPrompt })
    });
    if (!res.ok) throw new Error('Failed to save template');
    return res.json();
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
