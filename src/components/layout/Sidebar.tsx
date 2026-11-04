import { LIVE } from '../../lib/supabase.ts';
import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Store,
  Wallet,
  UserPlus,
  Shield,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, newOrdersCount, currentStore, merchant } = useMerchant();

  // 6 Essential Merchant Modules
  const primaryNav = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingBag, badge: newOrdersCount },
    { id: 'products', label: 'Menu & Produk', icon: Package },
    { id: 'wallet', label: 'Dompet & Saldo', icon: Wallet },
    { id: 'store', label: 'Pengaturan Toko', icon: Store },
    { id: 'register', label: 'Daftar Toko Baru', icon: UserPlus, specialTag: 'Baru' },
  ];

  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-2.5 flex flex-col justify-between hidden md:flex h-full overflow-y-auto">
      <div>
        {/* Merchant Identity Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-800/90 dark:to-slate-850 border border-blue-100 dark:border-blue-900/50 mb-2.5 shadow-xs">
          <div className="relative shrink-0">
            <img
              src="/assets/aistudio/Designer_b056b7f0.png"
              alt="AWD Toko"
              className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-blue-200 dark:border-blue-800 shadow-xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-600 border border-white dark:border-slate-800 flex items-center justify-center text-[6px] text-white font-black">
              ✓
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">{currentStore.name}</h4>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">{merchant.ownerName}</p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-0.5">
          <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 px-2.5 py-0.5">Menu Toko</p>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.specialTag && (
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  }`}>
                    {item.specialTag}
                  </span>
                )}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-orange-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Information Card & Admin Panel Link */}
      <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!LIVE && (<a
          href="/admin"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          title="Buka Panel Admin AWD"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px]">Panel Admin AWD</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>)}

        <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-[10px] text-blue-900 dark:text-blue-200">
          <p className="font-extrabold flex items-center gap-1 text-[11px]">
            <span>🏪 AWD Toko</span>
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Mitra Toko Arjawinangun Delivery. Kelola pesanan dan menu dengan mudah.
          </p>
        </div>
      </div>
    </aside>
  );
};
