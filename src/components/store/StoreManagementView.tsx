import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Store as StoreIcon,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Building,
  Save,
  Compass,
} from 'lucide-react';
import { StoreCategory, OperationalStatus } from '../../types/index.ts';

export const StoreManagementView: React.FC = () => {
  const { currentStore, updateCurrentStore, addToast } = useMerchant();

  const [name, setName] = useState(currentStore.name);
  const [description, setDescription] = useState(currentStore.description);
  const [address, setAddress] = useState(currentStore.address);
  const [latitude, setLatitude] = useState(currentStore.latitude);
  const [longitude, setLongitude] = useState(currentStore.longitude);
  const [phone, setPhone] = useState(currentStore.phone);
  const [whatsapp, setWhatsapp] = useState(currentStore.whatsapp);
  const [openingHours, setOpeningHours] = useState(currentStore.openingHours);
  const [closingHours, setClosingHours] = useState(currentStore.closingHours);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(currentStore.deliveryRadiusKm);
  const [category, setCategory] = useState<StoreCategory>(currentStore.category);
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>(currentStore.operationalStatus);
  const [logoUrl, setLogoUrl] = useState(currentStore.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(currentStore.bannerUrl);

  const categories: StoreCategory[] = [
    'Restaurant',
    'Grocery',
    'Pharmacy',
    'Bakery',
    'Electronics',
    'Fashion',
    'UMKM',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentStore({
      name,
      description,
      address,
      latitude,
      longitude,
      phone,
      whatsapp,
      openingHours,
      closingHours,
      deliveryRadiusKm,
      category,
      operationalStatus,
      logoUrl,
      bannerUrl,
    });
  };

  // Quick map pin click simulator
  const handleMapClick = (latOffset: number, lngOffset: number) => {
    setLatitude((prev) => Number((prev + latOffset).toFixed(5)));
    setLongitude((prev) => Number((prev + lngOffset).toFixed(5)));
    addToast('info', 'Titik GPS Diperbarui', 'Koordinat toko diperbarui pada peta.');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Profil & Pengaturan Toko
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Atur informasi publik toko, jam operasional, radius layanan antar, dan pin lokasi Google Maps.
        </p>
      </div>

      {/* Closed Status Warning Rule */}
      {operationalStatus === 'Closed' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900 dark:text-rose-100">
              Aturan Marketplace: Toko Sedang Ditutup
            </h4>
            <p className="text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
              Toko berstatus "TUTUP" tidak akan muncul dalam hasil pencarian aplikasi pelanggan AWD dan tidak dapat menerima pesanan baru. Ubah status menjadi "BUKA" saat siap melayani pembeli.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner & Logo Visual Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="relative h-44 sm:h-52 bg-slate-200 dark:bg-slate-900 overflow-hidden">
            <img src={bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex items-end gap-3.5">
                <img
                  src={logoUrl}
                  alt="Store Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-lg shrink-0"
                />
                <div className="text-white drop-shadow-md">
                  <h3 className="font-extrabold text-base sm:text-lg">{name}</h3>
                  <p className="text-xs text-white/90">{category} • ⭐ {currentStore.rating}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL Foto Logo Toko
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL Banner Toko
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operational Status Box */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm space-y-3">
          <label className="block font-bold text-sm text-slate-900 dark:text-white">
            Status Operasional Toko
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'Open', label: 'Buka (Menerima Order)', color: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-emerald-500' },
              { id: 'Closed', label: 'Tutup (Toko Disembunyikan)', color: 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', dot: 'bg-rose-500' },
              { id: 'Busy', label: 'Sibuk (Ada Sedikit Delay)', color: 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-amber-500' },
              { id: 'Holiday', label: 'Libur Operasional', color: 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', dot: 'bg-purple-500' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setOperationalStatus(st.id as OperationalStatus)}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center gap-2 ${
                  operationalStatus === st.id ? `${st.color} shadow-sm ring-2 ring-emerald-500/20` : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* General Store Details */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Informasi Dasar Toko</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Toko *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Bisnis
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoreCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Toko
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon Toko
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp Pesanan
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Operating hours & delivery radius */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Buka
              </label>
              <input
                type="time"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Tutup
              </label>
              <input
                type="time"
                value={closingHours}
                onChange={(e) => setClosingHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Radius Antar (Km)
                </label>
                <span className="font-bold text-emerald-600">{deliveryRadiusKm} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={deliveryRadiusKm}
                onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Location & Google Maps Picker Box */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Titik Lokasi & Google Maps GPS</span>
              </h3>
              <p className="text-slate-400 mt-0.5">Penetapan titik jemput driver AWD</p>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {latitude}, {longitude}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Toko *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Interactive Simulated Google Maps Canvas */}
          <div className="relative h-48 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
            {/* Map grid lines background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Simulated Road network */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rotate-12" />
              <div className="h-full w-2 bg-slate-300 dark:bg-slate-600 -rotate-45" />
            </div>

            {/* Pin in center */}
            <div className="relative z-10 flex flex-col items-center animate-bounce">
              <div className="p-2 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 border-2 border-white">
                <MapPin className="w-5 h-5 fill-current" />
              </div>
              <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 shadow-md">
                {name}
              </span>
            </div>

            {/* Radius overlay circle */}
            <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-blue-500/40 bg-blue-500/10 pointer-events-none" />

            {/* Map Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleMapClick(0.001, 0.001)}
                className="p-1 hover:bg-slate-100 rounded text-slate-700 dark:text-slate-200 text-xs font-bold px-2"
                title="Geser Pin Ke Utara"
              >
                + Geser Pin
              </button>
              <button
                type="button"
                onClick={() => handleMapClick(-0.001, -0.001)}
                className="p-1 hover:bg-slate-100 rounded text-slate-700 dark:text-slate-200 text-xs font-bold px-2"
                title="Geser Pin Ke Selatan"
              >
                - Geser Pin
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Informasi Toko</span>
          </button>
        </div>
      </form>
    </div>
  );
};
