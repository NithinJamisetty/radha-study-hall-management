import React from 'react';
import { X, Smartphone, Download, CheckCircle, Share, PlusSquare } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Header with App Icon */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden">
              <img 
                src="/icon-192.png" 
                alt="Radha Study Hall Icon" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Install Radha Study Hall</h2>
              <p className="text-xs text-emerald-200">Home Screen App with Icon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/70">
            <img 
              src="/icon-192.png" 
              alt="Radha Study Hall Icon" 
              className="w-10 h-10 rounded-xl shadow-xs object-cover"
            />
            <div className="text-xs">
              <div className="font-bold text-emerald-950">Radha Study Hall</div>
              <div className="text-[11px] text-emerald-700">Official Mobile App Icon Configured</div>
            </div>
          </div>

          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install to Phone Now</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                How to Add to Home Screen:
              </div>

              {/* iPhone / iPad */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>On iPhone &amp; iPad (Safari):</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  1. Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-600" /> at the bottom of Safari.
                  <br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" />.
                  <br />
                  3. Tap <strong>Add</strong> in the top-right corner. The app icon will appear with the 3D mascot!
                </p>
              </div>

              {/* Android */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>On Android (Chrome):</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  1. Tap the <strong>3 vertical dots</strong> (⋮) in the top right.
                  <br />
                  2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
