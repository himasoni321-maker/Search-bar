import React from 'react';
import {
  Settings,
  Languages,
  Sliders,
  Shield,
  Volume2,
  Vibrate,
  X,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import { AppSettings } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenPermissionModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenPermissionModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Assistant Settings</h3>
              <p className="text-[11px] text-slate-400">Target language & OCR reticle configuration</p>
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
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Target Language Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-400" />
              <span>Default Translation Language</span>
            </label>
            <select
              value={settings.targetLanguage}
              onChange={(e) => onUpdateSettings({ targetLanguage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Reticle Size */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Target Reticle Size</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'magnifier'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ reticleSize: size })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all cursor-pointer ${
                    settings.reticleSize === size
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Speech Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio Pronunciation Speed</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{settings.speechSpeed}x</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onUpdateSettings({ speechSpeed: spd })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    settings.speechSpeed === spd
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {spd}x {spd === 1.0 ? '(Normal)' : spd < 1.0 ? '(Slower)' : '(Faster)'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Lookup on Drop Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 pr-3">
              <span className="font-semibold text-slate-200 block">Auto-Lookup on Drop</span>
              <span className="text-[11px] text-slate-400 block">
                Automatically triggers translation when reticle is released
              </span>
            </div>
            <button
              onClick={() => onUpdateSettings({ autoLookupOnDrop: !settings.autoLookupOnDrop })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoLookupOnDrop ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoLookupOnDrop ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Vibration Feedback */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 pr-3">
              <span className="font-semibold text-slate-200 block">Haptic Vibration Feedback</span>
              <span className="text-[11px] text-slate-400 block">
                Vibrates subtly when snapping over words
              </span>
            </div>
            <button
              onClick={() => onUpdateSettings({ vibrateFeedback: !settings.vibrateFeedback })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.vibrateFeedback ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.vibrateFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Android Permissions Card */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-slate-200 block">System Alert Window</span>
                <span className="text-[11px] text-slate-400 block">
                  Status: {settings.hasSystemAlertPermission ? 'Granted' : 'Needs Permission'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenPermissionModal();
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
