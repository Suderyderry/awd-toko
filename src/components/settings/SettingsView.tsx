import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Settings,
  User,
  Store,
  Bell,
  Lock,
  KeyRound,
  Shield,
  Smartphone,
  CheckCircle2,
  Save,
  Moon,
  Volume2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { merchant, currentStore, soundEnabled, setSoundEnabled, isDarkMode, setIsDarkMode, addToast } = useMerchant();

  const [ownerName, setOwnerName] = useState(merchant.ownerName);
  const [email, setEmail] = useState(merchant.email);
  const [phone, setPhone] = useState(merchant.phone);

  // Security
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [pin, setPin] = useState('849201');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification Preferences
  const [notifNewOrder, setNotifNewOrder] = useState(true);
  const [notifStockWarning, setNotifStockWarning] = useState(true);
  const [notifReview, setNotifReview] = useState(true);
  const [notifPromoExpired, setNotifPromoExpired] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Profil Diperbarui', 'Data profil merchant berhasil disimpan.');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Keamanan Diperbarui', 'PIN penarikan dan kata sandi berhasil diperbarui.');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Pengaturan Akun & Keamanan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola profil pemilik, preferensi notifikasi push suara, PIN pencairan saldo, dan autentikasi dua faktor (2FA).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Management */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Profil Pemilik Usaha</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Pemilik
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Terdaftar
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon Utama
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Security & PIN */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Lock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Keamanan & PIN Penarikan</h3>
          </div>

          <form onSubmit={handleSaveSecurity} className="space-y-3.5">
            {/* 2FA Toggle */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Autentikasi 2 Langkah (2FA)</p>
                <p className="text-[11px] text-slate-400">Verifikasi OTP via WhatsApp saat penarikan dana</p>
              </div>
              <input
                type="checkbox"
                checked={is2FAEnabled}
                onChange={(e) => {
                  setIs2FAEnabled(e.target.checked);
                  addToast('info', '2FA', e.target.checked ? '2FA telah diaktifkan' : '2FA dinonaktifkan');
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* PIN Penarikan */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                PIN Transaksi Dompet (6 Digit)
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-center tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20"
              >
                Perbarui Keamanan
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Preferensi Notifikasi Push</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Suara Lonceng Pesanan Baru</p>
                <p className="text-[11px] text-slate-400">Bunyikan nada dering saat orderan pelanggan masuk</p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Peringatan Stok Rendah</p>
                <p className="text-[11px] text-slate-400">Notifikasi saat stok produk kurang dari 5</p>
              </div>
              <input
                type="checkbox"
                checked={notifStockWarning}
                onChange={(e) => setNotifStockWarning(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Ulasan & Rating Baru</p>
                <p className="text-[11px] text-slate-400">Notifikasi saat pembeli memberikan review</p>
              </div>
              <input
                type="checkbox"
                checked={notifReview}
                onChange={(e) => setNotifReview(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Display & App Experience */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Moon className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tampilan & Pengalaman Aplikasi</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Mode Gelap (Dark Mode)</p>
                <p className="text-[11px] text-slate-400">Mengurangi kelelahan mata saat melayani pesanan malam</p>
              </div>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-500 text-[11px] space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">AWD Toko - Versi 2.4.0</p>
              <p>Aplikasi Khusus Pemilik Toko & Warung Mitra Arjawinangun Delivery (AWD).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
