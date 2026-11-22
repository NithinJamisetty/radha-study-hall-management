import React from 'react';
import { X, Smartphone, Download, CheckCircle, Monitor, Globe } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ 
  isOpen, 
  onClose, 
  deferredPrompt 
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Install StudyHall App</h2>
              <p className="text-xs text-sky-100">Standalone App on Desktop & Mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Install this platform as a native app on your phone, Mac, or PC. Access your study hall AI chat and reports with 1 tap from your home screen or dock without typing a URL.
          </p>

          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Click Here to Install Now
            </button>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                Browser Installation Steps:
              </div>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li>
                  <strong>Chrome / Edge (Mac/PC):</strong> Click the <strong>Install</strong> icon in the right side of the address bar (or Menu &gt; <em>Install Study Hall</em>).
                </li>
                <li>
                  <strong>Safari (Mac):</strong> Go to <strong>File</strong> &gt; <strong>Add to Dock</strong>.
                </li>
                <li>
                  <strong>iPhone / iPad:</strong> Tap the <strong>Share</strong> button &gt; <strong>Add to Home Screen</strong>.
                </li>
                <li>
                  <strong>Android:</strong> Tap the three dots &gt; <strong>Install App</strong>.
                </li>
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>PWA Enabled: Fast offline startup & background sync ready.</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
