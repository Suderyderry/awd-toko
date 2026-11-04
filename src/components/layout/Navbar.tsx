import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Store as StoreIcon,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ShieldCheck,
  ShieldAlert,
  Shield,
  ChevronDown,
  Code2,
  Zap,
  WifiOff,
} from 'lucide-react';
import { playOrderNotificationSound } from '../../utils/audio.ts';
import { OperationalStatus } from '../../types/index.ts';
import { LIVE } from '../../lib/supabase.ts';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    stores,
    currentStore,
    setCurrentStoreId,
    updateCurrentStore,
    merchant,
    updateMerchantStatus,
    unreadNotifsCount,
    newOrdersCount,
    soundEnabled,
    setSoundEnabled,
    isDarkMode,
    setIsDarkMode,
    deviceView,
    setDeviceView,
    isOffline,
    setIsOffline,
    simulateIncomingOrder,
    activeTab,
    setActiveTab,
  } = useMerchant();

  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showVerificationMenu, setShowVerificationMenu] = useState(false);

  const statusColors: Record<OperationalStatus, { bg: string; text: string; dot: string; label: string }> = {
    Open: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Toko Buka' },
    Closed: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', label: 'Toko Tutup' },
    Busy: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', label: 'Sedang Sibuk' },
    Holiday: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500', label: 'Sedang Libur' },
  };

  const currentStatusConfig = statusColors[currentStore.operationalStatus];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs px-4 py-1 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Mode Offline: Bekerja tanpa internet</span>
        </div>
      )}

      {/* Closed Store Warning */}
      {currentStore.operationalStatus === 'Closed' && (
        <div className="bg-rose-600 text-white text-xs px-4 py-1 text-center font-medium">
          ⚠️ Toko Anda sedang TUTUP. Toko tidak muncul di pencarian pelanggan.
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-13 flex items-center justify-between gap-2.5">
        {/* Brand & Store Selector */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="relative">
              <img
                src="/assets/aistudio/Designer_b056b7f0.png"
                alt="AWD Toko"
                className="w-8 h-8 rounded-lg object-contain drop-shadow-sm bg-white p-0.5 border border-blue-200 dark:border-blue-900 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-600 border border-white dark:border-slate-900 flex items-center justify-center text-[6px] text-white font-black shadow-xs">
                ✓
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 tracking-tight text-sm group-hover:opacity-90 transition-opacity">
                  AWD Toko
                </span>
                <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  Mitra
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">Mitra Toko Arjawinangun Delivery</p>
            </div>
          </div>

          {/* Store Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStoreDropdown(!showStoreDropdown);
                setShowStatusDropdown(false);
                setShowVerificationMenu(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[170px] sm:max-w-[220px] h-8"
              aria-label="Pilih Toko"
            >
              <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{currentStore.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
            </button>

            {showStoreDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pilih Toko ({stores.length})</p>
                </div>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentStoreId(s.id);
                      setShowStoreDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                      s.id === currentStore.id ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={s.logoUrl} alt={s.name} className="w-6 h-6 rounded-md object-cover" />
                      <div className="truncate">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.category} • ⭐ {s.rating}</p>
                      </div>
                    </div>
                    {s.id === currentStore.id && <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">Aktif</span>}
                  </button>
                ))}

                {/* Add new merchant store registration button */}
                <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-700 px-2 pb-1">
                  <button
                    onClick={() => {
                      setActiveTab('register');
                      setShowStoreDropdown(false);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>+ Daftar Toko Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Registration Button in Navbar */}
          <button
            onClick={() => setActiveTab('register')}
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>+ Daftar Toko</span>
          </button>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Operational Status Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowStoreDropdown(false);
                setShowVerificationMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-slate-200 dark:border-slate-700 ${currentStatusConfig.bg} ${currentStatusConfig.text} text-xs font-semibold`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.dot} animate-pulse`} />
              <span>{currentStatusConfig.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                {(['Open', 'Closed', 'Busy', 'Holiday'] as OperationalStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateCurrentStore({ operationalStatus: st });
                      setShowStatusDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <span className={`w-2 h-2 rounded-full ${statusColors[st].dot}`} />
                    <span>{statusColors[st].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verification Status Pill (Merchant Status) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowVerificationMenu(!showVerificationMenu);
                setShowStoreDropdown(false);
                setShowStatusDropdown(false);
              }}
              title="Status Verifikasi Toko"
              className={`flex items-center gap-1.5 px-2 h-8 rounded-lg text-xs font-semibold border ${
                merchant.status === 'Verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : merchant.status === 'Pending'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              {merchant.status === 'Verified' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              )}
              <span className="hidden sm:inline">
                {merchant.status === 'Verified' ? 'Terverifikasi' : merchant.status === 'Pending' ? 'Menunggu' : merchant.status}
              </span>
            </button>

            {showVerificationMenu && !LIVE && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs">
                <p className="font-bold text-slate-900 dark:text-white px-2 py-1">Status Toko</p>
                <p className="text-[10px] text-slate-500 px-2 pb-1">Pilih status verifikasi:</p>
                {[
                  { key: 'Verified', label: 'Terverifikasi' },
                  { key: 'Pending', label: 'Menunggu Verifikasi' },
                  { key: 'Rejected', label: 'Ditolak' },
                  { key: 'Suspended', label: 'Ditangguhkan' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      updateMerchantStatus(key as any);
                      setShowVerificationMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${
                      merchant.status === key ? 'font-bold text-blue-600' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{label}</span>
                    {merchant.status === key && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Simulate Order Button with Bell Chime */}
          {!LIVE && (
          <button
            onClick={simulateIncomingOrder}
            title="Tambah pesanan baru untuk uji coba"
            className="hidden sm:flex items-center gap-1 px-2.5 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>+ Order</span>
          </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playOrderNotificationSound();
            }}
            title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Senyap'}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
            aria-label="Pengaturan Suara"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* AWD Admin Panel Link */}
          {!LIVE && (
          <a
            href="/admin"
            target="_blank"
            rel="noreferrer"
            title="Buka Panel Admin AWD"
            className="h-8 px-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 transition-colors flex items-center gap-1 text-xs font-semibold shadow-xs"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Admin</span>
          </a>
          )}

          {/* Device Viewport Toggle (Phone Frame vs Desktop) */}
          <button
            onClick={() => setDeviceView(deviceView === 'mobile' ? 'desktop' : 'mobile')}
            title={deviceView === 'mobile' ? 'Ganti ke tampilan komputer' : 'Ganti ke tampilan HP'}
            className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs"
            aria-label="Ganti Tampilan Layar"
          >
            {deviceView === 'mobile' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xl:inline">Komputer</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xl:inline">HP</span>
              </>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            title="Ganti Mode Gelap/Terang"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
            aria-label="Notifikasi"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
