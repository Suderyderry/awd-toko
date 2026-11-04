import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';

interface DeviceFrameToggleProps {
  children: React.ReactNode;
}

export const DeviceFrameToggle: React.FC<DeviceFrameToggleProps> = ({ children }) => {
  const { deviceView, setDeviceView } = useMerchant();

  if (deviceView === 'desktop') {
    return <div className="w-full h-screen overflow-hidden flex flex-col">{children}</div>;
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-900/90 py-2 sm:py-3 px-2 sm:px-4 flex flex-col items-center justify-center">
      {/* Top Simple Bar */}
      <div className="mb-2 flex items-center justify-between w-full max-w-[412px] px-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Tampilan HP</span>
        </div>
        <button
          onClick={() => setDeviceView('desktop')}
          className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors"
        >
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span>Layar Penuh</span>
        </button>
      </div>

      {/* Phone Bezel */}
      <div className="w-full max-w-[412px] bg-slate-950 p-2 sm:p-2.5 rounded-[44px] shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 relative flex-1 max-h-[calc(100vh-3.25rem)] flex flex-col overflow-hidden">
        {/* Phone Screen */}
        <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-[34px] overflow-hidden flex-1 flex flex-col relative border border-slate-800/60 shadow-inner">
          
          {/* Bar Atas Bawaan HP (Native Status Bar) */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 z-40 select-none shrink-0 border-b border-slate-100 dark:border-slate-800/40">
            <span className="tracking-tight">09:41</span>
            {/* Camera Hole / Speaker Slit */}
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto -mt-0.5 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* Bar Bawah Bawaan HP (Native Bottom Home / Gesture Bar) */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-1.5 pb-2 flex justify-center z-40 select-none shrink-0 border-t border-slate-100 dark:border-slate-800/40">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
};
