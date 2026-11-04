import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Star,
  PlusCircle,
  Eye,
  Tag,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  ChevronRight,
  Boxes,
  Zap,
  Printer,
} from 'lucide-react';
import { formatRupiah, calculateOrderFinancials } from '../../utils/merchantLogic.ts';
import { ThermalReceiptModal } from '../orders/ThermalReceiptModal.tsx';
import type { Order } from '../../types/index.ts';
import { LIVE } from '../../lib/supabase.ts';

export const DashboardView: React.FC = () => {
  const {
    currentStore,
    orders,
    products,
    reviews,
    wallet,
    setActiveTab,
    simulateIncomingOrder,
    acceptOrder,
    addToast,
  } = useMerchant();

  const [orderForThermalPrint, setOrderForThermalPrint] = React.useState<Order | null>(null);

  // Statistics calculation
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const todaySales = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.merchantNetAmount, 0);
  const todayOrdersCount = orders.filter((o) => o.status !== 'Cancelled').length;
  const monthlyRevenue = 18450000 + todaySales;

  // Recent Orders (take top 4)
  const recentOrders = orders.slice(0, 4);

  // Low Stock Items (< 5)
  const lowStockProducts = products.filter((p) => p.stock < 5);

  // Top Selling Products
  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3);

  // Chart data (Simulated 7 days)
  const chartDays = [
    { day: 'Sen', amount: 840000, height: '45%' },
    { day: 'Sel', amount: 1120000, height: '60%' },
    { day: 'Rab', amount: 950000, height: '52%' },
    { day: 'Kam', amount: 1300000, height: '70%' },
    { day: 'Jum', amount: 1680000, height: '88%' },
    { day: 'Sab', amount: 2100000, height: '100%' },
    { day: 'Min', amount: 1850000, height: '92%' },
  ];

  return (
    <div className="space-y-3.5 pb-6 md:pb-2">
      {/* Welcome Banner with AWD Blue Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-3.5 sm:p-4 shadow-md shadow-blue-900/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.2 rounded-full backdrop-blur-sm">
                AWD Toko
              </span>
              <span className="text-[11px] text-blue-100">
                • {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight">
              Selamat datang, {currentStore.name}!
            </h1>
            <p className="text-[11px] text-blue-100 max-w-xl mt-0.5">
              Kelola pesanan masuk, cetak struk kasir, dan pantau penjualan toko Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!LIVE && (
            <button
              onClick={simulateIncomingOrder}
              className="h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>+ Order Baru</span>
            </button>
            )}
            <button
              onClick={() => setActiveTab('orders')}
              className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs transition-all border border-white/20"
            >
              Lihat Pesanan
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* 4 Top Statistics Cards - Compact Density */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Today's Sales */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Penjualan Hari Ini</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {formatRupiah(todaySales)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs kemarin</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Pesanan Hari Ini</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {todayOrdersCount} Pesanan
          </p>
          <div className="flex items-center gap-1 text-[10px] text-orange-600 font-semibold mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+3 pesanan baru</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Omzet Bulan Ini</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {formatRupiah(monthlyRevenue)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>Target 85% tercapai</span>
          </div>
        </div>

        {/* Store Rating */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Rating Toko</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              ⭐ {currentStore.rating.toFixed(1)}
            </p>
            <span className="text-[10px] text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {currentStore.reviewCount} ulasan pembeli
          </div>
        </div>
      </div>

      {/* 4 Quick Action Buttons - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 hover:shadow-xs transition-all flex items-center gap-2 group text-left"
        >
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Tambah Produk</h4>
            <p className="text-[10px] text-slate-400 truncate">Menu & varian baru</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-orange-500 hover:shadow-xs transition-all flex items-center gap-2 group text-left"
        >
          <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 group-hover:scale-105 transition-transform shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Pesanan Masuk</h4>
            <p className="text-[10px] text-slate-400 truncate">Pantau pesanan baru</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-purple-500 hover:shadow-xs transition-all flex items-center gap-2 group text-left"
        >
          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 group-hover:scale-105 transition-transform shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Status Toko</h4>
            <p className="text-[10px] text-slate-400 truncate">Buka/tutup & jam buka</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 hover:shadow-xs transition-all flex items-center gap-2 group text-left"
        >
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Tarik Saldo</h4>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">{formatRupiah(wallet.withdrawableBalance)}</p>
          </div>
        </button>
      </div>

      {/* Main Grid: Orders & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left Column (2 Cols): Recent Orders + Revenue Chart */}
        <div className="lg:col-span-2 space-y-3.5">
          {/* Recent Orders Widget */}
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 sm:p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Pesanan Terkini</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tindakan segera pesanan masuk</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={order.customerAvatar}
                      alt={order.customerName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{order.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">• {order.orderTime}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          order.status === 'New'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 animate-pulse'
                            : order.status === 'Accepted'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : order.status === 'Preparing'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : order.status === 'ReadyForPickup'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                            : order.status === 'Completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status === 'New' ? 'Baru' : order.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                        {order.customerName} • {order.items.length} Menu ({formatRupiah(order.totalAmount)})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setOrderForThermalPrint(order)}
                      title="Cetak Struk Thermal (58mm/80mm)"
                      className="px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      aria-label="Cetak Struk Thermal"
                    >
                      <Printer className="w-3 h-3 text-blue-600" />
                      <span>Struk</span>
                    </button>

                    {order.status === 'New' ? (
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] shadow-xs transition-all"
                      >
                        Terima
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Rincian
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart Widget - Compact */}
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 sm:p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Tren Penjualan 7 Hari</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Total pendapatan kotor seminggu: {formatRupiah(9840000)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Omzet Harian</span>
              </div>
            </div>

            {/* Simulated Bar Visual */}
            <div className="h-28 flex items-end justify-between gap-2 pt-2 pb-1 px-1 border-b border-slate-100 dark:border-slate-700">
              {chartDays.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group">
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-t-md h-20 flex items-end overflow-hidden">
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-400 rounded-t-md transition-all duration-500 group-hover:from-blue-600 group-hover:to-cyan-400"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Low Stock Alert + Top Products + Reviews Snippet */}
        <div className="space-y-3">
          {/* Low Stock Alert Widget */}
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Peringatan Stok</h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {lowStockProducts.length} Kritis
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-2">Semua stok produk aman.</p>
            ) : (
              <div className="space-y-1.5">
                {lowStockProducts.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    className="p-1.5 rounded-lg border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={p.imageUrl} alt={p.name} className="w-7 h-7 rounded-md object-cover shrink-0" />
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                          Sisa {p.stock}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shrink-0"
                    >
                      + Stok
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products Widget */}
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Menu Terlaris</h3>
              <button
                onClick={() => setActiveTab('products')}
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                Lihat
              </button>
            </div>

            <div className="space-y-2">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[9px] text-slate-600 dark:text-slate-300 shrink-0">
                      {idx + 1}
                    </span>
                    <img src={p.imageUrl} alt={p.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{formatRupiah(p.discountPrice || p.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px] shrink-0">
                    {p.stock + 120} laku
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Snippet */}
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Ulasan Pembeli</h3>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                Semua
              </button>
            </div>

            {reviews.slice(0, 1).map((rev) => (
              <div key={rev.id} className="py-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">{rev.customerName}</span>
                  <div className="flex text-amber-400 text-[10px]">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
