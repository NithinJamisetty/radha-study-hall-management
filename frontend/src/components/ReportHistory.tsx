import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  RefreshCw, 
  Copy, 
  Check, 
  MessageCircle,
  Sparkles
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
      {/* Visual Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-200/70 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200/80 p-2 flex items-center justify-center flex-shrink-0 shadow-xs">
            <img 
              src="/images/study3.png" 
              alt="Radha Study Hall Archive" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Historical Records
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Radha Study Hall Daily Archives
            </h2>
            <p className="text-xs text-slate-500">
              Review, copy, or re-dispatch previous 8:00 PM WhatsApp summaries
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="p-2.5 text-slate-400 hover:text-slate-700 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
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
        <div className="lg:col-span-2 bg-[#f0fdf4]/50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-emerald-100/80">
              <div className="flex items-center gap-2">
                <img 
                  src="/images/avatar_girl_3d.png" 
                  alt="Radha Study Hall" 
                  className="w-7 h-7 rounded-full object-cover border border-emerald-200"
                />
                <span className="font-semibold text-slate-700">
                  Report Date: <strong className="text-slate-900">{selectedReport?.reportDate || 'None'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 rounded-xl border border-slate-200/80 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {selectedReport?.formattedMarkdown && (
                  <button
                    onClick={() => api.openInWhatsApp(selectedReport.formattedMarkdown)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3 fill-current" />
                    Open in WhatsApp
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto bg-white p-5 rounded-2xl border border-emerald-100/60 shadow-2xs">
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
