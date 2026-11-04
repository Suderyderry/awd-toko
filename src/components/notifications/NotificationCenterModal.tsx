import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Bell,
  X,
  CheckCheck,
  ShoppingBag,
  AlertTriangle,
  Star,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { NotificationItem } from '../../types/index.ts';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
  } = useMerchant();

  if (!isOpen) return null;

  const notifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NewOrder':
        return <ShoppingBag className="w-4 h-4 text-orange-600" />;
      case 'LowStock':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'Review':
        return <Star className="w-4 h-4 text-amber-500 fill-current" />;
      case 'OrderCompleted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.type === 'NewOrder' || notif.type === 'OrderCompleted') {
      setActiveTab('orders');
    } else if (notif.type === 'LowStock') {
      setActiveTab('inventory');
    } else if (notif.type === 'Review') {
      setActiveTab('reviews');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-end p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pusat Notifikasi</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60 overflow-y-auto flex-1 p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada notifikasi saat ini.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-3 text-xs ${
                  notif.isRead
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm shrink-0 border border-slate-100 dark:border-slate-600">
                  {notifIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
