import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Bell, Sparkles } from 'lucide-react';

interface AndroidStatusBarProps {
  isServiceRunning: boolean;
  onOpenPermissionModal: () => void;
  targetLanguageName: string;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  isServiceRunning,
  onOpenPermissionModal,
  targetLanguageName,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-md text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800/80 select-none z-30">
      {/* Left: Time and Active Overlay Notification */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight text-slate-100">{time || '09:41'}</span>
        
        {isServiceRunning ? (
          <button
            onClick={onOpenPermissionModal}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
            title="Floating Assistant active over screen"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Floating OCR ({targetLanguageName})</span>
          </button>
        ) : (
          <button
            onClick={onOpenPermissionModal}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
          >
            <Bell className="w-2.5 h-2.5" />
            <span>Overlay Inactive</span>
          </button>
        )}
      </div>

      {/* Right: Android System Icons */}
      <div className="flex items-center gap-2 text-slate-400">
        <div className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-300">
          <span>5G</span>
        </div>
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium text-slate-300">92%</span>
          <Battery className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>
    </div>
  );
};
