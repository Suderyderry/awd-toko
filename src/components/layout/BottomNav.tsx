import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import { LayoutDashboard, ShoppingBag, Package, Wallet, Store } from 'lucide-react';

interface BottomNavProps {
  onOpenMoreMenu?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = () => {
  const { activeTab, setActiveTab, newOrdersCount } = useMerchant();

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: ShoppingBag, badge: newOrdersCount },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'wallet', label: 'Dompet', icon: Wallet },
    { id: 'store', label: 'Toko', icon: Store },
  ];

  return (
    <nav className="shrink-0 w-full z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white font-extrabold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
