import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Bike,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  CreditCard,
  Search,
  Filter,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { LIVE } from '../../lib/supabase.ts';
import { formatRupiah } from '../../utils/merchantLogic.ts';
import { ThermalReceiptModal } from './ThermalReceiptModal.tsx';

export const OrdersView: React.FC = () => {
  const {
    orders,
    currentStore,
    acceptOrder,
    rejectOrder,
    markPreparing,
    markReadyForPickup,
    completeOrder,
    simulateIncomingOrder,
    soundEnabled,
    setSoundEnabled,
    autoSimulate,
    setAutoSimulate,
    addToast,
  } = useMerchant();

  const [filterTab, setFilterTab] = useState<'All' | 'New' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderForThermalPrint, setOrderForThermalPrint] = useState<Order | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Bahan baku dapur habis');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (filterTab === 'New' && order.status !== 'New') return false;
    if (filterTab === 'Active' && !['Accepted', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OnDelivery'].includes(order.status)) return false;
    if (filterTab === 'Completed' && order.status !== 'Completed') return false;
    if (filterTab === 'Cancelled' && order.status !== 'Cancelled') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
      if (!matchNum && !matchCust && !matchItem) return false;
    }

    return true;
  });

  const newCount = orders.filter((o) => o.status === 'New').length;
  const activeCount = orders.filter((o) => ['Accepted', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OnDelivery'].includes(o.status)).length;

  const handleOpenReject = (order: Order) => {
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (selectedOrder) {
      rejectOrder(selectedOrder.id, rejectReason);
      setShowRejectModal(false);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Page Header with Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">Kelola Pesanan</h1>
            {newCount > 0 && (
              <span className="bg-orange-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full animate-pulse shadow-sm shadow-orange-500/30">
                {newCount} Pesanan Baru
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Terima pesanan, siapkan menu, dan serahkan ke driver AWD.
          </p>
        </div>

        {/* Live Simulation & Audio Controls */}
        {!LIVE && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={simulateIncomingOrder}
            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-sm shadow-orange-500/20 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>+ Order Baru</span>
          </button>

          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoSimulate
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Order Otomatis: {autoSimulate ? 'Aktif' : 'Mati'}
          </button>
        </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'Semua', count: orders.length },
            { id: 'New', label: 'Perlu Konfirmasi', count: newCount, badgeColor: 'bg-orange-500' },
            { id: 'Active', label: 'Diproses', count: activeCount, badgeColor: 'bg-blue-500' },
            { id: 'Completed', label: 'Selesai' },
            { id: 'Cancelled', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as typeof filterTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    filterTab === tab.id
                      ? 'bg-white text-blue-700'
                      : tab.badgeColor
                      ? `${tab.badgeColor} text-white`
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Pesanan / Pelanggan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Pesanan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Belum ada pesanan pada kategori ini. Pesanan baru dari pelanggan akan muncul di sini secara otomatis.
          </p>
          {!LIVE && (
          <button
            onClick={simulateIncomingOrder}
            className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
          >
            Tes Order Baru
          </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl border bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                order.status === 'New'
                  ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {/* Order Card Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      • {order.orderTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.paymentMethod}</span>
                    <span>• {order.distanceKm} km</span>
                  </div>
                </div>

                {/* Print Button & Status Badge */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderForThermalPrint(order)}
                    title="Cetak Nota Thermal POS (58mm/80mm)"
                    className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    aria-label="Cetak Nota Thermal"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px]">Cetak Struk</span>
                  </button>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      order.status === 'New'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 animate-pulse'
                        : order.status === 'Accepted'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        : order.status === 'Preparing'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : order.status === 'ReadyForPickup'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                        : order.status === 'PickedUp' || order.status === 'OnDelivery'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                        : order.status === 'Completed'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {order.status === 'New'
                      ? 'Pesanan Baru'
                      : order.status === 'Accepted'
                      ? 'Pesanan Diterima'
                      : order.status === 'Preparing'
                      ? 'Sedang Dimasak'
                      : order.status === 'ReadyForPickup'
                      ? 'Siap Diambil'
                      : order.status === 'PickedUp'
                      ? 'Diambil Driver'
                      : order.status === 'OnDelivery'
                      ? 'Dalam Pengantaran'
                      : order.status === 'Completed'
                      ? 'Selesai'
                      : 'Dibatalkan'}
                  </span>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-4 space-y-3.5 flex-1">
                {/* Customer Info */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={order.customerAvatar}
                      alt={order.customerName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                    title="Hubungi Pelanggan via WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/40">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed line-clamp-2">{order.deliveryAddress}</p>
                </div>

                {/* Items Ordered */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-extrabold text-emerald-600 text-xs w-5 text-center">
                          {item.quantity}x
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.productName}
                          </p>
                          {item.variantName && (
                            <p className="text-[10px] text-slate-400">Varian: {item.variantName}</p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                              Catatan: "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary & Platform Fee Breakdown */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/40 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Makanan:</span>
                    <span>{formatRupiah(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon Promosi:</span>
                      <span>-{formatRupiah(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Biaya Layanan AWD (12%):</span>
                    <span>-{formatRupiah(order.platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Pendapatan Bersih Toko:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {formatRupiah(order.merchantNetAmount)}
                    </span>
                  </div>
                </div>

                {/* Assigned Driver (if Ready or OnDelivery) */}
                {order.assignedDriver && (
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-bold text-purple-950 dark:text-purple-200">
                          {order.assignedDriver.name} ({order.assignedDriver.vehicleNumber})
                        </p>
                        <p className="text-[10px] text-purple-700 dark:text-purple-300">
                          {order.assignedDriver.vehicleType} • ⭐ {order.assignedDriver.rating}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">
                      Driver Siap
                    </span>
                  </div>
                )}

                {/* Rejection Reason if Cancelled */}
                {order.rejectReason && (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300">
                    Alasan Pembatalan: {order.rejectReason}
                  </div>
                )}
              </div>

              {/* Order Card Footer Actions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                {order.status === 'New' && (
                  <>
                    <button
                      onClick={() => handleOpenReject(order)}
                      className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-colors"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
                    >
                      ✓ Terima & Siapkan Dapur
                    </button>
                  </>
                )}

                {order.status === 'Accepted' && (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setOrderForThermalPrint(order)}
                      className="px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 hover:bg-blue-50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tiket Dapur</span>
                    </button>
                    <button
                      onClick={() => markPreparing(order.id)}
                      className="flex-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Mulai Memasak / Meracik</span>
                    </button>
                  </div>
                )}

                {order.status === 'Preparing' && (
                  <button
                    onClick={() => markReadyForPickup(order.id)}
                    className="w-full px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Tandai Siap Diambil Driver</span>
                  </button>
                )}

                {order.status === 'ReadyForPickup' && !LIVE && (
                  <button
                    onClick={() => completeOrder(order.id)}
                    className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Serahkan ke Driver & Selesaikan</span>
                  </button>
                )}

                {order.status === 'Completed' && (
                  <div className="w-full flex items-center justify-between">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pesanan Telah Selesai</span>
                    </div>
                    <button
                      onClick={() => setOrderForThermalPrint(order)}
                      className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Cetak Ulang</span>
                    </button>
                  </div>
                )}

                {order.status === 'Cancelled' && (
                  <div className="w-full text-center text-xs text-rose-500 font-bold">
                    Pesanan Telah Dibatalkan
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tolak Pesanan {selectedOrder.orderNumber}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih alasan penolakan pesanan. Pelanggan akan mendapatkan notifikasi dan pengembalian dana otomatis.
            </p>

            <div className="space-y-2">
              {[
                'Bahan baku dapur habis',
                'Toko sedang kelebihan pesanan (overload)',
                'Menu pesanan sudah tidak tersedia',
                'Toko sedang tutup sementara',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    rejectReason === reason
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal */}
      <ThermalReceiptModal
        order={orderForThermalPrint}
        store={currentStore}
        isOpen={Boolean(orderForThermalPrint)}
        onClose={() => setOrderForThermalPrint(null)}
        onToast={addToast}
      />
    </div>
  );
};
