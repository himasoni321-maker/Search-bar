import React from 'react';
import { ShieldCheck, ShieldAlert, Layers, Smartphone, Sparkles, Check, X, Bell } from 'lucide-react';
import { AppSettings } from '../types';

interface SystemAlertPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SystemAlertPermissionModal: React.FC<SystemAlertPermissionModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Android System Permissions</h3>
              <p className="text-[11px] text-slate-400">Display over other apps (SYSTEM_ALERT_WINDOW)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Permission explanation banner */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2">
              {settings.hasSystemAlertPermission ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-semibold text-slate-200">
                {settings.hasSystemAlertPermission ? 'Overlay Permission Granted' : 'Permission Required'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              This permission allows the <strong>Floating Reticle</strong> and <strong>Result Card</strong> to float directly over all apps (PDF readers, Chrome, News feeds, E-books) for instant 1-tap translation without switching apps.
            </p>
          </div>

          {/* Android Toggle 1: System Alert Window */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 pr-4">
              <span className="font-semibold text-slate-200 block">Allow display over other apps</span>
              <span className="text-[11px] text-slate-400 block">
                Required for draggable target reticle and floating dictionary cards
              </span>
            </div>
            <button
              onClick={() => {
                const nextPerm = !settings.hasSystemAlertPermission;
                onUpdateSettings({
                  hasSystemAlertPermission: nextPerm,
                  isServiceRunning: nextPerm ? true : false,
                });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.hasSystemAlertPermission ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.hasSystemAlertPermission ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Android Toggle 2: Assistant Service Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 pr-4">
              <span className="font-semibold text-slate-200 block">Floating Assistant Service</span>
              <span className="text-[11px] text-slate-400 block">
                Keeps the floating reticle active and responsive to screen touches
              </span>
            </div>
            <button
              disabled={!settings.hasSystemAlertPermission}
              onClick={() => {
                onUpdateSettings({ isServiceRunning: !settings.isServiceRunning });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 ${
                settings.isServiceRunning ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.isServiceRunning ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Technical Architecture Details */}
          <div className="border-t border-slate-800 pt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Integrated Engines & APIs
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-800/40 rounded border border-slate-700/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Google ML Kit OCR</span>
              </div>
              <div className="p-2 bg-slate-800/40 rounded border border-slate-700/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span className="text-slate-300">Wikipedia REST API</span>
              </div>
              <div className="p-2 bg-slate-800/40 rounded border border-slate-700/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">Free Dictionary API</span>
              </div>
              <div className="p-2 bg-slate-800/40 rounded border border-slate-700/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-300">Web Speech TTS Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
