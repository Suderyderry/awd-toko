import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  Mail,
  Lock,
  Globe,
  Camera,
  FileCheck,
} from 'lucide-react';
import { MerchantStatus } from '../../types/index.ts';
import { MerchantRegistrationView } from './MerchantRegistrationView.tsx';

export const AuthAndVerificationView: React.FC = () => {
  const { merchant, updateMerchantStatus, currentStore, addToast } = useMerchant();

  const [activeSubTab, setActiveSubTab] = useState<'verification' | 'loginMethods' | 'registration'>('verification');

  // Login simulation state
  const [loginMethod, setLoginMethod] = useState<'whatsapp' | 'email' | 'google'>('whatsapp');
  const [waPhone, setWaPhone] = useState('081298765432');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Verification document mock preview
  const [ktpUploaded, setKtpUploaded] = useState(true);
  const [selfieUploaded, setSelfieUploaded] = useState(true);
  const [npwpUploaded, setNpwpUploaded] = useState(true);
  const [nibUploaded, setNibUploaded] = useState(true);

  const handleSimulateSendOTP = () => {
    setOtpSent(true);
    addToast('info', 'OTP WhatsApp Terkirim', `Kode verifikasi 6 digit dikirim ke nomor ${waPhone}`);
  };

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Autentikasi Berhasil', `Selamat datang kembali, ${merchant.ownerName}!`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header with AWD Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-xl shadow-blue-900/15">
        <div className="flex items-center gap-4">
          <img
            src="/assets/aistudio/Designer_b056b7f0.png"
            alt="AWD Ecosystem"
            className="w-14 h-14 rounded-2xl object-contain bg-white p-1 border-2 border-blue-200/40 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                AWD Portal Mitra
              </span>
              <span className="text-xs text-blue-200">Arjawinangun Delivery</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Autentikasi & Verifikasi Toko
            </h1>
            <p className="text-xs text-blue-100 max-w-xl mt-0.5">
              Kelola dokumen legalitas merchant (KTP, Selfie, NPWP, NIB), simulasi login multi-metode, dan status verifikasi.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'verification'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Dokumen Legalitas & Status
        </button>
        <button
          onClick={() => setActiveSubTab('loginMethods')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'loginMethods'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Metode Login (WhatsApp / Email / Google)
        </button>
        <button
          onClick={() => setActiveSubTab('registration')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'registration'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>Form Pendaftaran Mitra Baru</span>
        </button>
      </div>

      {/* Verification Tab Content */}
      {activeSubTab === 'verification' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              merchant.status === 'Verified'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                : merchant.status === 'Pending'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
            }`}
          >
            <div className="flex items-start gap-3.5">
              {merchant.status === 'Verified' ? (
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              ) : merchant.status === 'Pending' ? (
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base">Status Akun: {merchant.status}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {merchant.status === 'Verified' ? 'Toko Siap Terima Order' : 'Toko Ditahan'}
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-1 max-w-xl">
                  {merchant.status === 'Verified'
                    ? 'Akun merchant telah diverifikasi resmi oleh Tim Kepatuhan AWD Arjawinangun Delivery. Toko dapat menerima pesanan dan melakukan penarikan dana tanpa hambatan.'
                    : merchant.status === 'Pending'
                    ? 'Dokumen KTP dan legalitas usaha sedang dalam proses verifikasi tim admin AWD (estimasi 1x24 jam kerja).'
                    : 'Akun merchant saat ini berstatus ditolak atau disuspend. Hubungi tim dukungan untuk pemulihan.'}
                </p>
              </div>
            </div>

            {/* Quick Admin Simulator Controls */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Simulasi Status Verifikasi (Admin):
              </p>
              <div className="flex items-center gap-1">
                {(['Verified', 'Pending', 'Rejected', 'Suspended'] as MerchantStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateMerchantStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      merchant.status === st
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Documents 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KTP */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Foto KTP Pemilik</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Terverifikasi
                  </span>
                </div>
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
                    alt="KTP"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                    NIK: 3174**********01
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Dokumen identitas resmi pemilik toko</p>
              </div>

              <button
                onClick={() => addToast('info', 'Upload Dokumen', 'Pilih berkas KTP baru dalam format JPG/PNG.')}
                className="mt-3 w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto KTP</span>
              </button>
            </div>

            {/* Selfie with KTP */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Selfie Pegang KTP</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Terverifikasi
                  </span>
                </div>
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Liveness Check ✓
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Verifikasi biometrik wajah langsung</p>
              </div>

              <button
                onClick={() => addToast('info', 'Upload Dokumen', 'Kamera selfie siap mendeteksi wajah.')}
                className="mt-3 w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ambil Selfie</span>
              </button>
            </div>

            {/* NPWP (Optional) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">NPWP Toko (Opsional)</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Terlampir
                  </span>
                </div>
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80"
                    alt="NPWP"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                    NPWP: 09.342.***.*-012
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Untuk pemotongan PPh 23 resmi</p>
              </div>

              <button
                onClick={() => addToast('info', 'Upload Dokumen', 'Pilih file NPWP.')}
                className="mt-3 w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah NPWP</span>
              </button>
            </div>

            {/* NIB / SIUP Business License (Optional) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">NIB / Izin Usaha</span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                    Terverifikasi
                  </span>
                </div>
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80"
                    alt="NIB"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                    NIB OSS: 120938491
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Izin Usaha Mikro Kecil (UMKM OSS)</p>
              </div>

              <button
                onClick={() => addToast('info', 'Upload Dokumen', 'Pilih file PDF NIB OSS.')}
                className="mt-3 w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah NIB</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Methods Tab Content */}
      {activeSubTab === 'loginMethods' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm space-y-6">
          <div className="text-center">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Pilihan Autentikasi Mitra
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              AWD Toko mendukung metode masuk aman untuk pemilik toko
            </p>
          </div>

          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setLoginMethod('whatsapp')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                loginMethod === 'whatsapp'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp OTP</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                loginMethod === 'email'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Email & Kata Sandi</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMethod('google')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                loginMethod === 'google'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-5 h-5 text-rose-500" />
              <span>Google Sign-In</span>
            </button>
          </div>

          {/* Form Based on Selected Method */}
          <form onSubmit={handleSimulateLogin} className="space-y-4 text-xs">
            {loginMethod === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Terdaftar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSimulateSendOTP}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20"
                    >
                      Kirim OTP
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Masukkan 6 Digit Kode OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Contoh: 849201"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {loginMethod === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email Merchant
                  </label>
                  <input
                    type="email"
                    defaultValue="pemilik@awd-toko.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {loginMethod === 'google' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-center space-y-2">
                <p className="text-slate-600 dark:text-slate-300">
                  Masuk menggunakan akun Google <b>{merchant.email}</b>
                </p>
                <p className="text-[11px] text-slate-400">
                  Terintegrasi dengan Supabase Auth OAuth Google Provider.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
            >
              Simulasikan Masuk Dashboard
            </button>
          </form>
        </div>
      )}

      {/* Registration Form Tab Content */}
      {activeSubTab === 'registration' && (
        <div className="pt-2">
          <MerchantRegistrationView />
        </div>
      )}
    </div>
  );
};
