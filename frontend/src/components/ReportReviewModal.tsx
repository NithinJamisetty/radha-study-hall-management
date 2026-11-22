import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Clock,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { api, DailyReportItem } from '../services/api.ts';

interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportDispatched: () => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onReportDispatched 
}) => {
  const [report, setReport] = useState<DailyReportItem | null>(null);
  const [editableMarkdown, setEditableMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDraft = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await api.getTodayReport();
      setReport(data);
      setEditableMarkdown(data.formattedMarkdown);
    } catch (err) {
      setStatusMessage("Failed to fetch current draft.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDraft();
    }
  }, [isOpen]);

  const handleApproveAndSend = async () => {
    if (!report) return;
    setDispatching(true);
    setStatusMessage(null);
    try {
      await api.approveReport(report.reportDate, editableMarkdown, true);
      api.openInWhatsApp(editableMarkdown);
      setStatusMessage("✅ Report saved to Excel database & opened in WhatsApp!");
      setTimeout(() => {
        onReportDispatched();
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMessage("Failed to process report.");
    } finally {
      setDispatching(false);
    }
  };

  const handleSendNow = async () => {
    if (!report) return;
    setDispatching(true);
    setStatusMessage(null);
    try {
      await api.sendReportNow(report.reportDate);
      api.openInWhatsApp(editableMarkdown);
      setStatusMessage("⚡ Report saved to Excel & opened in WhatsApp!");
      setTimeout(() => {
        onReportDispatched();
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMessage("Failed to dispatch report now.");
    } finally {
      setDispatching(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const data = await api.generateDraftReport();
      setReport(data);
      setEditableMarkdown(data.formattedMarkdown);
    } catch (err) {
      setStatusMessage("Failed to refresh draft from Excel database.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOverdue = report?.status === 'OVERDUE_PENDING_DISPATCH' || 
    (new Date().getHours() > 20 || (new Date().getHours() === 20 && new Date().getMinutes() >= 15));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daily Report Review &amp; Dispatch
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Sends to WhatsApp group &bull; Stored in Excel DB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Overdue Warning */}
          {isOverdue && report?.status !== 'SENT' && report?.status !== 'AUTO_SENT' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Notice: 8:15 PM deadline reached. You can dispatch right now.</span>
              </div>
              <button
                onClick={handleSendNow}
                disabled={dispatching || loading}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all flex-shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                Send Now
              </button>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
              {statusMessage}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Edit any figures or notes before dispatching:</span>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-sync from Excel
            </button>
          </div>

          <textarea
            value={editableMarkdown}
            onChange={(e) => setEditableMarkdown(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs leading-relaxed p-4 bg-slate-50 text-slate-800 rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="Loading report preview from Excel..."
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Status: <span className="font-bold text-slate-800">{report?.status || 'PENDING'}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveAndSend}
              disabled={dispatching || loading}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {dispatching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  Approve &amp; Open WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
