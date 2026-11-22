import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  RefreshCw,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { api, DailyReportItem } from '../services/api.ts';

export const ReportHistory: React.FC = () => {
  const [reports, setReports] = useState<DailyReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReportItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getAllReports();
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCopy = () => {
    if (!selectedReport?.formattedMarkdown) return;
    navigator.clipboard.writeText(selectedReport.formattedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Historical Daily Reports</h2>
            <p className="text-xs text-slate-500">Access previous summaries and group broadcast records</p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          title="Refresh reports"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {reports.length === 0 ? (
            <div className="text-xs text-slate-400 py-12 text-center">
              No historical reports found yet.
            </div>
          ) : (
            reports.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedReport?.id === r.id
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {r.reportDate}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    r.status === 'SENT' || r.status === 'AUTO_SENT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : 'bg-amber-50 text-amber-800 border-amber-200/60'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Channel: {r.dispatchChannel}</span>
                  <span>{r.dispatchedAt ? new Date(r.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Report Preview Card */}
        <div className="lg:col-span-2 bg-[#f0fdf4]/40 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-emerald-100/80">
              <span className="font-semibold text-slate-700">
                Date: <strong className="text-slate-900">{selectedReport?.reportDate || 'None'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 rounded-lg border border-slate-200/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {selectedReport?.formattedMarkdown && (
                  <button
                    onClick={() => api.openInWhatsApp(selectedReport.formattedMarkdown)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3 h-3 fill-current" />
                    Open WhatsApp
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto bg-white p-4 rounded-2xl border border-emerald-100/60 shadow-2xs">
              {selectedReport?.formattedMarkdown || "Select a date on the left to preview its report."}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Dispatched via: {selectedReport?.dispatchChannel || 'WHATSAPP'}
          </div>
        </div>
      </div>
    </div>
  );
};
