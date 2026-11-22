import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Save, 
  RefreshCw, 
  MessageCircle, 
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.ts';

export const BotTrainingStudio: React.FC = () => {
  const [template, setTemplate] = useState('');
  const [promptGuide, setPromptGuide] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getTrainingTemplate()
      .then(data => {
        setTemplate(data.template || '');
        setPromptGuide(data.trainingPrompt || '');
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSavedSuccess(false);
    try {
      await api.saveTrainingTemplate(template, promptGuide);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save training template");
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: 'classic' | 'minimal' | 'polite') => {
    if (preset === 'classic') {
      setTemplate(`*RADHA STUDY HALL – DAILY REPORT*

📅 {DATE}

*1. Student Updates*
• New admissions: {NEW_ADMISSIONS}
• Total active students: {ACTIVE_STUDENTS}
• Departures: {STUDENTS_LEFT}

*2. Fee Collection*
• Total collected: ₹{TOTAL_FEES}
• Students paid: {PAID_STUDENTS_COUNT}

*3. Attendance*
• Morning shift: {MORNING_ATTENDANCE}
• Afternoon shift: {AFTERNOON_ATTENDANCE}
• Evening shift: {EVENING_ATTENDANCE}

*4. Maintenance & Facilities*
{MAINTENANCE_SECTION}

_Generated automatically by Radha Study Hall Intelligence Engine_`);
    } else if (preset === 'minimal') {
      setTemplate(`*RADHA STUDY HALL SUMMARY* | {DATE}
━━━━━━━━━━━━━━━━━━
👥 Active: {ACTIVE_STUDENTS} (+{NEW_ADMISSIONS} new)
💰 Fees: ₹{TOTAL_FEES} ({PAID_STUDENTS_COUNT} paid)
⏰ Attendance: M:{MORNING_ATTENDANCE} | A:{AFTERNOON_ATTENDANCE} | E:{EVENING_ATTENDANCE}
🔧 Maintenance:
{MAINTENANCE_SECTION}
━━━━━━━━━━━━━━━━━━
Radha Study Hall Desk`);
    } else if (preset === 'polite') {
      setTemplate(`🙏 *Namaskaram / Good Evening All!*
Here is the Radha Study Hall Operational Update for *{DATE}*:

✨ *Admissions & Students:*
- New enrollments today: {NEW_ADMISSIONS}
- Total active students: {ACTIVE_STUDENTS}

💵 *Fee Collections:*
- Amount collected today: ₹{TOTAL_FEES}

🕒 *Shift Turnout:*
- Morning: {MORNING_ATTENDANCE} students
- Afternoon: {AFTERNOON_ATTENDANCE} students
- Evening: {EVENING_ATTENDANCE} students

🛠️ *Facility & Repairs:*
{MAINTENANCE_SECTION}

Have a wonderful evening ahead! 🌸`);
    }
  };

  const insertTag = (tag: string) => {
    setTemplate(prev => prev + tag);
  };

  const previewRendered = template
    .replace('{DATE}', new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }))
    .replace('{ACTIVE_STUDENTS}', '190')
    .replace('{NEW_ADMISSIONS}', '5')
    .replace('{STUDENTS_LEFT}', '0')
    .replace('{TOTAL_FEES}', '12,500')
    .replace('{PAID_STUDENTS_COUNT}', '12')
    .replace('{MORNING_ATTENDANCE}', '72')
    .replace('{AFTERNOON_ATTENDANCE}', '68')
    .replace('{EVENING_ATTENDANCE}', '85')
    .replace('{MAINTENANCE_SECTION}', '• Room 2 AC — Not working (Technician scheduled)');

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Studio Header: Illustrated with Radha Study Hall Mascot */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI Bot Guidance &amp; Training
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Radha Study Hall Report Studio
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Guide the AI assistant on how your 8:00 PM WhatsApp group report should look. Customize sections, greetings, and click dynamic tags to insert live numbers.
          </p>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? "Saved & Trained!" : "Save & Train Bot"}
            </button>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center flex-shrink-0 z-10 bg-emerald-50/80 border border-emerald-100 p-4 rounded-3xl text-center space-y-2">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-300 shadow-xs bg-white p-0.5">
            <img 
              src="/images/avatar_girl_3d.png" 
              alt="Radha Study Hall Mascot" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-[11px] font-bold text-emerald-950">WhatsApp Auto-Sync</span>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Load Preset Layout:</span>
        <button
          onClick={() => loadPreset('classic')}
          className="px-3 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          Classic Numbered
        </button>
        <button
          onClick={() => loadPreset('minimal')}
          className="px-3 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          Compact Minimalist
        </button>
        <button
          onClick={() => loadPreset('polite')}
          className="px-3 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          Warm &amp; Professional
        </button>
      </div>

      {/* Two Column Layout: Editor & Live WhatsApp Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Template Layout Structure
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Use {'{TAGS}'} for live figures</span>
          </div>

          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={14}
            className="w-full font-mono text-xs p-4 bg-slate-50 text-slate-800 rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            placeholder="Define your report layout here..."
          />

          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs text-slate-700 space-y-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
              Click to insert dynamic variables:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {[
                '{DATE}',
                '{ACTIVE_STUDENTS}',
                '{NEW_ADMISSIONS}',
                '{STUDENTS_LEFT}',
                '{TOTAL_FEES}',
                '{PAID_STUDENTS_COUNT}',
                '{MORNING_ATTENDANCE}',
                '{AFTERNOON_ATTENDANCE}',
                '{EVENING_ATTENDANCE}',
                '{MAINTENANCE_SECTION}'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live WhatsApp Bubble Preview with Mascot */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/images/avatar_girl_3d.png" 
                  alt="Radha Study Hall"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-200"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    Radha Study Hall WhatsApp Simulation
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Live Group Preview</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-semibold">
                8:00 PM Preview
              </span>
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="p-5 bg-[#e7f7ee]/60 border border-emerald-200/70 text-slate-900 rounded-3xl rounded-tr-xs shadow-xs text-xs font-sans leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto">
              {previewRendered}
              <div className="text-right text-[10px] text-emerald-700 mt-2 font-mono">
                8:00 PM ✓✓
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>You can also guide the bot directly in AI Chat:</span>
            <span className="text-slate-600 font-mono text-[11px]">"Report format should be..."</span>
          </div>
        </div>
      </div>
    </div>
  );
};
