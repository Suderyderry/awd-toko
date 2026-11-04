import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Tag,
  Plus,
  Percent,
  Truck,
  Gift,
  Ticket,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  Star,
} from 'lucide-react';
import { PromotionType } from '../../types/index.ts';
import { formatRupiah } from '../../utils/merchantLogic.ts';

export const PromotionsView: React.FC = () => {
  const {
    promotions,
    addPromotion,
    togglePromotionActive,
    togglePromotionFeatured,
    currentStore,
    addToast,
  } = useMerchant();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromotionType>('Percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minPurchase, setMinPurchase] = useState<number>(50000);
  const [startDate, setStartDate] = useState('2026-10-20');
  const [endDate, setEndDate] = useState('2026-11-10');
  const [isFeatured, setIsFeatured] = useState(false);

  const promoTypeIcons: Record<PromotionType, { icon: React.ReactNode; label: string; color: string }> = {
    Percentage: { icon: <Percent className="w-4 h-4" />, label: 'Diskon Persen', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    Fixed: { icon: <Tag className="w-4 h-4" />, label: 'Potongan Harga (Rp)', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' },
    FreeDelivery: { icon: <Truck className="w-4 h-4" />, label: 'Gratis Ongkir', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
    BOGO: { icon: <Gift className="w-4 h-4" />, label: 'Beli 1 Gratis 1', color: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
    Voucher: { icon: <Ticket className="w-4 h-4" />, label: 'Voucher Belanja', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('error', 'Form Tidak Lengkap', 'Judul promosi wajib diisi.');
      return;
    }

    addPromotion({
      storeId: currentStore.id,
      title,
      description,
      type,
      discountValue,
      minPurchase,
      startDate,
      endDate,
      isFeatured,
      isActive: true,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Promosi & Kupon Diskon
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {promotions.filter((p) => p.isActive).length} Aktif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tingkatkan omzet dan daya tarik toko dengan voucher, diskon persentase, dan gratis ongkir di AWD Marketplace.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-1.5 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Promosi Baru</span>
        </button>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promo) => {
          const typeConfig = promoTypeIcons[promo.type];

          return (
            <div
              key={promo.id}
              className={`rounded-2xl border bg-white dark:bg-slate-800 p-5 shadow-sm transition-all flex flex-col justify-between ${
                promo.isActive
                  ? promo.isFeatured
                    ? 'border-blue-400 dark:border-blue-700/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700/60'
                  : 'opacity-60 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${typeConfig.color}`}>
                    {typeConfig.icon}
                    <span>{typeConfig.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {promo.isFeatured && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        promo.isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {promo.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {promo.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {promo.description}
                </p>

                {/* Promo Value Display */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Besar Diskon</span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {promo.type === 'Percentage'
                        ? `${promo.discountValue}%`
                        : promo.type === 'BOGO'
                        ? 'Gratis 1 Item'
                        : formatRupiah(promo.discountValue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Min. Belanja</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {formatRupiah(promo.minPurchase)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Terpakai</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {promo.usageCount}x
                    </p>
                  </div>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Periode: {promo.startDate} s.d {promo.endDate}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => togglePromotionFeatured(promo.id)}
                  className={`flex items-center gap-1 font-semibold transition-colors ${
                    promo.isFeatured ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${promo.isFeatured ? 'fill-current' : ''}`} />
                  <span>{promo.isFeatured ? 'Hapus dari Highlight' : 'Jadikan Unggulan'}</span>
                </button>

                <button
                  onClick={() => togglePromotionActive(promo.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    promo.isActive
                      ? 'border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {promo.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Buat Promosi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Promosi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Diskon Jam Makan Siang 30%"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Berlaku untuk semua varian bento box"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Promosi
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PromotionType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Percentage">Diskon Persentase (%)</option>
                  <option value="Fixed">Potongan Harga Tetap (Rp)</option>
                  <option value="FreeDelivery">Gratis Ongkir</option>
                  <option value="BOGO">Beli 1 Gratis 1</option>
                  <option value="Voucher">Voucher Belanja</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nilai Diskon ({type === 'Percentage' ? '%' : 'Rp'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Minimal Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Tampilkan sebagai Promo Unggulan di Banner Toko
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                >
                  Aktifkan Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
