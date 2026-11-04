import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  History,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  Search,
} from 'lucide-react';
import { calculateAvailableStock, isLowStock, isOutOfStock } from '../../utils/merchantLogic.ts';
import { Product } from '../../types/index.ts';

export const InventoryView: React.FC = () => {
  const { products, stockAdjustments, adjustStock, addToast } = useMerchant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'Addition' | 'Reduction' | 'Adjustment'>('Addition');
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Restok bahan baku dapur pagi');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Statistics
  const totalCurrentStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalReservedStock = products.reduce((acc, p) => acc + p.reservedStock, 0);
  const totalAvailableStock = products.reduce(
    (acc, p) => acc + calculateAvailableStock(p.stock, p.reservedStock),
    0
  );
  const lowStockCount = products.filter((p) => isLowStock(p.stock)).length;
  const outOfStockCount = products.filter((p) => isOutOfStock(p.stock)).length;

  const handleOpenAdjust = (p: Product, type: 'Addition' | 'Reduction' | 'Adjustment') => {
    setSelectedProduct(p);
    setAdjustType(type);
    setAdjustAmount(type === 'Adjustment' ? p.stock : 10);
    setAdjustReason(
      type === 'Addition'
        ? 'Restok bahan baku dapur pagi'
        : type === 'Reduction'
        ? 'Bahan rusak / kedaluwarsa'
        : 'Penyesuaian stok fisik (Stock Opname)'
    );
    setIsModalOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    adjustStock(selectedProduct.id, adjustType, adjustAmount, adjustReason);
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Manajemen Inventori & Stok
          </h1>
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <span className="bg-rose-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>{lowStockCount + outOfStockCount} Perlu Perhatian</span>
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau stok fisik, stok terpesan (reserved) oleh pesanan masuk, dan riwayat penyesuaian stok.
        </p>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Current Stock */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Stok Fisik</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalCurrentStock} Unit
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Semua item terdaftar</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Reserved Stock */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stok Terpesan (Reserved)</span>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              {totalReservedStock} Unit
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dikunci oleh order aktif</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Available Stock */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stok Siap Jual (Available)</span>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              {totalAvailableStock} Unit
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dapat dibeli pembeli</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Critical Stock Warning Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/50 dark:to-amber-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900 dark:text-rose-200">
              Peringatan Stok Kurang dari 5 & Stok Habis!
            </h4>
            <p className="text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
              Terdapat {outOfStockCount} produk habis dan {lowStockCount} produk mendekati batas minimal stok (kurang dari 5 item). Segera tambah stok agar tidak kehilangan potensi pesanan pelanggan.
            </p>
          </div>
        </div>
      )}

      {/* Product Stock Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Status Ketersediaan Stok Menu</h3>
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk / SKU..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Menu & SKU</th>
                <th className="py-3 px-4">Stok Fisik</th>
                <th className="py-3 px-4">Stok Reserved</th>
                <th className="py-3 px-4">Stok Siap Jual</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4 text-right">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredProducts.map((p) => {
                const available = calculateAvailableStock(p.stock, p.reservedStock);
                const isLow = isLowStock(p.stock);
                const isOut = isOutOfStock(p.stock);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {p.stock}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                      {p.reservedStock}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                        {available}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                          Habis
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          Rendah (&lt; 5)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(p, 'Addition')}
                          title="Tambah Stok"
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm shadow-blue-500/20"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Stok</span>
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(p, 'Reduction')}
                          title="Kurangi Stok"
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(p, 'Adjustment')}
                          title="Penyesuaian Manual (Opname)"
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Audit History Log */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Riwayat Mutasi & Penyesuaian Stok</h3>
          </div>
          <span className="text-xs text-slate-400">{stockAdjustments.length} Catatan Log</span>
        </div>

        <div className="space-y-2.5">
          {stockAdjustments.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    log.type === 'Addition'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : log.type === 'Reduction'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {log.type === 'Addition' ? '+ Penambahan' : log.type === 'Reduction' ? '- Pengurangan' : 'Opname / Set'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.productName}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Alasan: {log.reason} • Waktu: {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <span>Stok sebelumnya: <b className="text-slate-700 dark:text-slate-300">{log.previousStock}</b></span>
                <span className="mx-1.5">→</span>
                <span>Stok baru: <b className="text-emerald-600 font-extrabold">{log.newStock}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Penyesuaian Stok: {selectedProduct.name}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs flex justify-between">
              <span>Stok Saat Ini: <b>{selectedProduct.stock} unit</b></span>
              <span>Tersedia: <b className="text-blue-600 dark:text-blue-400">{calculateAvailableStock(selectedProduct.stock, selectedProduct.reservedStock)} unit</b></span>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4 text-xs">
              {/* Type selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Penyesuaian
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Addition', label: '+ Tambah' },
                    { id: 'Reduction', label: '- Kurang' },
                    { id: 'Adjustment', label: 'Set Langsung' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAdjustType(t.id as typeof adjustType)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        adjustType === t.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah (Unit)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-600/25 transition-all"
                >
                  Terapkan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
