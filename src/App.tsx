/**
 * AWD Toko - Main Application Root
 * Aplikasi Kasir & Manajemen Toko Mitra Arjawinangun Delivery (AWD)
 */

import React, { useState } from 'react';
import { MerchantProvider, useMerchant } from './context/MerchantContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { Toasts } from './components/common/Toasts.tsx';
import { DeviceFrameToggle } from './components/common/DeviceFrameToggle.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { OrdersView } from './components/orders/OrdersView.tsx';
import { ProductsView } from './components/products/ProductsView.tsx';
import { WalletView } from './components/wallet/WalletView.tsx';
import { StoreManagementView } from './components/store/StoreManagementView.tsx';
import { MerchantRegistrationView } from './components/auth/MerchantRegistrationView.tsx';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal.tsx';
import { LiveGate } from './components/auth/LiveGate.tsx';
import { LIVE } from './lib/supabase.ts';

const MerchantAppContent: React.FC = () => {
  const { activeTab, deviceView, isDarkMode, liveStatus } = useMerchant();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Render view by active tab (Streamlined for pure Merchant operations)
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'products':
      case 'inventory':
        return <ProductsView />;
      case 'wallet':
      case 'reports':
        return <WalletView />;
      case 'store':
      case 'settings':
        return <StoreManagementView />;
      case 'register':
      case 'registration':
      case 'auth_docs':
      case 'profile':
        return LIVE ? <StoreManagementView /> : <MerchantRegistrationView />;
      default:
        return <DashboardView />;
    }
  };

  if (LIVE && liveStatus !== 'ready') return <LiveGate />;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-blue-600 selection:text-white flex flex-col">
        <Toasts />
        <NotificationCenterModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

        <DeviceFrameToggle>
          <div className="shrink-0 z-30">
            <Navbar onOpenNotifications={() => setIsNotifOpen(true)} />
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Desktop Sidebar (hidden on mobile) */}
            {deviceView === 'desktop' && <Sidebar />}

            {/* Main Content Area - Scrollable Pane */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 w-full focus:outline-none">
              <div className="max-w-7xl mx-auto w-full">
                {renderActiveView()}
              </div>
            </main>
          </div>

          {/* Bottom Nav on Mobile View */}
          {deviceView === 'mobile' && <BottomNav />}
        </DeviceFrameToggle>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MerchantProvider>
      <MerchantAppContent />
    </MerchantProvider>
  );
}
