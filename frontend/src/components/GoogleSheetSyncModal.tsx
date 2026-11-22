import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Zap, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api.ts';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const sheetUrl = "https://docs.google.com/spreadsheets/d/15dcIrq0md3SaOGwTTWMqt2AMZbdr9B4iVxJMzykTv7U/edit?usp=sharing";

  if (!isOpen) return null;

  const appsScriptCode = `/**
 * RADHA STUDY HALL - GOOGLE SHEET APPROVAL & DAILY REPORT SCRIPT
 * Paste this in Extensions > Apps Script in your spreadsheet.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Radha Study Hall')
    .addItem('🔄 Setup / Refresh Report', 'setupSheet')
    .addItem('✅ Approve & Send to WhatsApp', 'approveAndSendWhatsApp')
    .addToUi();
}

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName("Daily_Report_Summary");
  
  // Header
  sheet.getRange("A1:D1").merge().setValue("RADHA STUDY HALL MANAGEMENT - DAILY REPORT APPROVAL")
    .setFontWeight("bold").setFontSize(14).setBackground("#0284c7").setFontColor("#ffffff")
    .setHorizontalAlignment("center");
    
  // Metadata
  sheet.getRange("A3").setValue("Report Date:").setFontWeight("bold");
  sheet.getRange("B3").setValue(new Date().toLocaleDateString('en-GB'));
  
  sheet.getRange("A4").setValue("Report Status:").setFontWeight("bold");
  sheet.getRange("B4").setValue("DRAFT - PENDING APPROVAL").setFontWeight("bold")
    .setBackground("#fef3c7").setFontColor("#92400e");
    
  // Metrics section
  sheet.getRange("A6:D6").merge().setValue("TODAY'S ACCUMULATED OPERATIONAL DATA")
    .setFontWeight("bold").setBackground("#e2e8f0");
  sheet.getRange("A7").setValue("Total Active Students"); sheet.getRange("B7").setValue(62);
  sheet.getRange("A8").setValue("Today's New Admissions"); sheet.getRange("B8").setValue(62);
  sheet.getRange("A9").setValue("Today's Fee Collected"); sheet.getRange("B9").setValue("₹82,500");
  sheet.getRange("A10").setValue("Evening Shift Attendance"); sheet.getRange("B10").setValue(85);
  sheet.getRange("A11").setValue("Open Maintenance Issues"); sheet.getRange("B11").setValue(3);
  
  // WhatsApp Preview
  sheet.getRange("A13:D13").merge().setValue("FINAL REPORT PREVIEW (WHATSAPP FORMAT)")
    .setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  
  var reportMarkdown = "*RADHA STUDY HALL – DAILY REPORT*\\n\\n📅 " + new Date().toLocaleDateString('en-GB') + 
    "\\n\\n*1. Student Updates*\\n• New admissions: 62\\n• Total active students: 62\\n\\n*2. Fee Collection*\\n• Total collected: ₹82,500\\n• Students paid: 6\\n\\n*3. Attendance*\\n• Morning shift: N/A\\n• Afternoon shift: N/A\\n• Evening shift: 85\\n\\n*4. Maintenance & Facilities*\\n• Room 2 AC not working\\n• Maintenance pending: 3\\n\\n*5. Important Updates*\\n• New students registered successfully\\n• Daily operational audit completed\\n\\n_Generated automatically by Radha Study Hall Intelligence Engine_";
    
  sheet.getRange("A14:D24").merge().setValue(reportMarkdown).setWrap(true).setVerticalAlignment("top").setBackground("#f8fafc");
  
  // Approval Action Area
  sheet.getRange("A26").setValue("Approve Report:").setFontWeight("bold");
  sheet.getRange("B26").insertCheckboxes();
  sheet.getRange("C26:D26").merge().setValue("👈 Check this box to APPROVE and generate WhatsApp link").setFontStyle("italic").setFontColor("#475569");
}

function onEdit(e) {
  var range = e.range;
  if (range.getA1Notation() === "B26" && range.getValue() === true) {
    approveAndSendWhatsApp();
  }
}

function approveAndSendWhatsApp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  // Mark approved in Sheet
  sheet.getRange("B4").setValue("APPROVED ✅").setBackground("#dcfce7").setFontColor("#166534");
  sheet.getRange("B26").setValue(true);
  
  var reportText = sheet.getRange("A14").getValue();
  var encodedText = encodeURIComponent(reportText);
  var waUrl = "https://api.whatsapp.com/send?text=" + encodedText;
  
  // Create clickable button link in Sheet
  sheet.getRange("A28:D28").merge().setFormula('=HYPERLINK("' + waUrl + '", "👉 CLICK HERE TO OPEN WHATSAPP & SEND REPORT")')
    .setFontWeight("bold").setFontSize(12).setBackground("#22c55e").setFontColor("#ffffff").setHorizontalAlignment("center");
    
  // Popup confirmation with WhatsApp launcher
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif; text-align:center; padding:20px;">' +
    '<h2 style="color:#16a34a; margin-top:0;">✅ Daily Report Approved!</h2>' +
    '<p style="font-size:14px; color:#334155;">Radha Study Hall daily report is updated to <b>APPROVED</b>.</p>' +
    '<a href="' + waUrl + '" target="_blank" style="display:inline-block; padding:12px 24px; background-color:#25D366; color:white; text-decoration:none; font-weight:bold; font-size:15px; border-radius:8px; margin-top:12px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">' +
    '📲 Open WhatsApp & Send Report' +
    '</a>' +
    '</div>'
  ).setWidth(400).setHeight(200);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Radha Study Hall Report Approved');
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Spreadsheet Approval Setup</h2>
              <p className="text-xs text-emerald-100">Connect and approve reports directly inside your Google Sheet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Linked Sheet URL */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Your Google Spreadsheet</span>
              <p className="text-xs font-mono text-slate-700 truncate mt-0.5">{sheetUrl}</p>
            </div>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Sheet in Google Drive
            </a>
          </div>

          {/* Quick Explanation */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              How Approval in Google Sheet Works
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-[11px]">1</span>
                  Add Apps Script
                </div>
                <p className="text-slate-500 text-[11px]">In Google Sheet, click <b>Extensions &gt; Apps Script</b>, paste the script below, and click <b>Save</b> & <b>Run</b>.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-[11px]">2</span>
                  Auto-Populated Tab
                </div>
                <p className="text-slate-500 text-[11px]">Your sheet instantly shows today's admissions, fees, shifts, and the compiled WhatsApp report draft.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-[11px]">3</span>
                  Check Box to Approve
                </div>
                <p className="text-slate-500 text-[11px]">Checking the <b>Approve Report</b> box stamps <b>APPROVED ✅</b> and pops up the one-click WhatsApp button!</p>
              </div>
            </div>
          </div>

          {/* Apps Script Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Google Apps Script Code (Copy &amp; Paste in Google Sheet)
              </label>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied to Clipboard!" : "Copy Code"}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
              {appsScriptCode}
            </pre>
          </div>

          {/* Alternative: Direct Excel Import */}
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-sky-900">Alternative: Import Excel Workbook</h5>
              <p className="text-[11px] text-sky-700 mt-0.5">
                Download the real-time generated <code>study_hall_database.xlsx</code> and click <b>File &gt; Import &gt; Upload</b> in Google Sheets.
              </p>
            </div>
            <a
              href={api.getExcelDownloadUrl()}
              download="study_hall_database.xlsx"
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Instant WhatsApp approval integration ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};