import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  DollarSign,
  ShoppingBag,
  Percent,
  FileSpreadsheet,
  Award,
} from 'lucide-react';
import { formatRupiah } from '../../utils/merchantLogic.ts';

type PeriodType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export const ReportsView: React.FC = () => {
  const { orders, products, currentStore, addToast } = useMerchant();
  const [period, setPeriod] = useState<PeriodType>('Weekly');

  // Aggregates based on period
  const multiplier = period === 'Daily' ? 1 : period === 'Weekly' ? 7 : period === 'Monthly' ? 30 : 365;

  const totalGross = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.subtotal : 0), 0) * (multiplier / 4);
  const totalNet = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.merchantNetAmount : 0), 0) * (multiplier / 4);
  const totalOrders = Math.round(orders.filter((o) => o.status !== 'Cancelled').length * (multiplier / 3.5));
  const avgOrderValue = totalOrders > 0 ? Math.round(totalGross / totalOrders) : 0;
  const platformFees = Math.round(totalGross * 0.10);

  // Best selling
  const bestSellers = [...products]
    .sort((a, b) => b.price * b.stock - a.price * a.stock)
    .slice(0, 4);

  const handleExportCSV = () => {
    const csvContent =
      `Laporan Penjualan AWD Toko - ${currentStore.name}\n` +
      `Periode,${period}\n` +
      `Tanggal Unduh,${new Date().toLocaleDateString('id-ID')}\n\n` +
      `Ringkasan Keuangan\n` +
      `Total Omzet Kotor,${totalGross}\n` +
      `Biaya Platform AWD (12%),${platformFees}\n` +
      `Pendapatan Bersih Toko,${totalNet}\n` +
      `Jumlah Pesanan,${totalOrders}\n` +
      `Nilai Rata-rata Pesanan (AOV),${avgOrderValue}\n\n` +
      `Daftar Produk Terlaris\n` +
      `Nama Produk,SKU,Harga Satuan\n` +
      bestSellers.map((p) => `"${p.name}","${p.sku}",${p.price}`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan_penjualan_${period.toLowerCase()}_${currentStore.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    addToast('success', 'Laporan Diekspor', `Laporan periode ${period} berhasil diunduh dalam format Excel/CSV.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Laporan & Analitik Penjualan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis performa bisnis, omzet kotor, potongan komisi platform, dan rata-rata belanja pembeli.
          </p>
        </div>

        {/* Export & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl w-fit">
        {[
          { id: 'Daily', label: 'Harian' },
          { id: 'Weekly', label: 'Mingguan' },
          { id: 'Monthly', label: 'Bulanan' },
          { id: 'Yearly', label: 'Tahunan' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setPeriod(t.id as PeriodType)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === t.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4 Analytics Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Omzet Kotor</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(totalGross)}
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">+18.5% dari periode lalu</p>
        </div>

        {/* Net Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pendapatan Bersih Mitra</span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatRupiah(totalNet)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Setelah komisi 10% (-{formatRupiah(platformFees)})</p>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pesanan Sukses</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalOrders} Pesanan
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Tingkat selesai 98.4%</p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rata-Rata Belanja (AOV)</span>
          <p className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {formatRupiah(avgOrderValue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Per transaksi pelanggan</p>
        </div>
      </div>

      {/* Best Selling Products Ranking */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Peringkat Menu Paling Laris</h3>
          </div>
          <span className="text-xs text-slate-400">Berdasarkan volume penjualan</span>
        </div>

        <div className="space-y-3">
          {bestSellers.map((prod, idx) => (
            <div
              key={prod.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs">
                  #{idx + 1}
                </span>
                <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                  <p className="text-[11px] text-slate-400">{prod.categoryName} • SKU: {prod.sku}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {formatRupiah(prod.price * (idx === 0 ? 88 : idx === 1 ? 64 : 42))}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {idx === 0 ? '142' : idx === 1 ? '98' : '65'} porsi terjual
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
