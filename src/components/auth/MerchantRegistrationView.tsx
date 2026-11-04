import React, { useState, useEffect } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Store as StoreIcon,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Boxes,
  Power,
  BarChart3,
  CreditCard,
  Check,
  RefreshCw,
  Navigation,
  Crosshair,
  Info,
  X,
  LogIn,
} from 'lucide-react';
import {
  MerchantRegistrationData,
  RegistrationVerificationStatus,
} from '../../types/index.ts';

// Arjawinangun Local Villages & Districts
const ARJAWINANGUN_VILLAGES = [
  'Jungjang',
  'Jungjang Wetan',
  'Arjawinangun',
  'Kebonturi',
  'Tegalgubug',
  'Tegalgubug Lor',
  'Sende',
  'Rawagatel',
  'Geyongan',
  'Karangsambung',
  'Bulak',
];

const CIREBON_DISTRICTS = [
  'Arjawinangun',
  'Panguragan',
  'Gegesik',
  'Susukan',
  'Kaliwedi',
  'Ciwaringin',
  'Klangenan',
  'Palimanan',
];

const BUSINESS_CATEGORIES = [
  'Warung Makan & Kuliner Tradisional',
  'Toko Kelontong & Sembako',
  'Kedai Kopi & Minuman Kekinian',
  'Toko Kue, Roti & Camilan',
  'Busana, Hijab & Tekstil (Tegalgubug)',
  'Apotek, Herbal & Toko Obat',
  'Sayur Segar, Daging & Hasil Tani',
  'Toko Elektronik & Servis HP',
  'UMKM & Jasa Lokal Lainnya',
];

const DEFAULT_PRODUCT_TAGS = [
  'Makanan Siap Saji',
  'Lauk Pauk Matang',
  'Minuman Dingin / Hangat',
  'Beras & Minyak Goreng',
  'Bumbu Dapur & Rempah',
  'Sayur Mayur Segar',
  'Camilan Tradisional',
  'Kebutuhan Rumah Tangga',
  'Pakaian & Sandang',
  'Pulsa & Listrik',
];

const ARJA_GPS_PRESETS = [
  { name: 'Pasar Gaya Arjawinangun', lat: -6.6508, lng: 108.4124, village: 'Jungjang' },
  { name: 'Pasar Sandang Tegalgubug', lat: -6.6342, lng: 108.4011, village: 'Tegalgubug' },
  { name: 'Stasiun Arjawinangun', lat: -6.6456, lng: 108.4189, village: 'Jungjang' },
  { name: 'Alun-Alun Arjawinangun', lat: -6.6521, lng: 108.4147, village: 'Arjawinangun' },
  { name: 'By Pass Kebonturi', lat: -6.6612, lng: 108.4231, village: 'Kebonturi' },
];

const PRESET_WARUNG_PHOTOS = [
  {
    name: 'Kuliner / Nasi',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sembako',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Kopi / Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
  },
];

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const MerchantRegistrationView: React.FC = () => {
  const {
    registrationData,
    updateRegistrationStatus,
    submitMerchantRegistration,
    setActiveTab,
    currentStore,
    updateCurrentStore,
    addToast,
  } = useMerchant();

  const [activeViewMode, setActiveViewMode] = useState<'login' | 'form' | 'statusHub'>('form');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('085224158990');
  const [loginPassword, setLoginPassword] = useState('ArjaBerkah2026!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form State
  const [ownerName, setOwnerName] = useState(registrationData.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(registrationData.ownerPhone || '');
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(registrationData.isPhoneOtpVerified ?? true);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [email, setEmail] = useState(registrationData.email || '');
  const [password, setPassword] = useState(registrationData.password || 'ArjaBerkah2026!');
  const [passwordConfirmation, setPasswordConfirmation] = useState(registrationData.passwordConfirmation || 'ArjaBerkah2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState(registrationData.ownerPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80');

  // Warung / Toko
  const [storeName, setStoreName] = useState(registrationData.storeName || '');
  const [storeCategory, setStoreCategory] = useState(registrationData.storeCategory || BUSINESS_CATEGORIES[0]);
  const [storeWhatsapp, setStoreWhatsapp] = useState(registrationData.storeWhatsapp || '');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [storeLogoUrl, setStoreLogoUrl] = useState(registrationData.storeLogoUrl || PRESET_WARUNG_PHOTOS[0].url);
  const [storeDescription, setStoreDescription] = useState(registrationData.storeDescription || '');
  const [selectedProductTags, setSelectedProductTags] = useState<string[]>(
    registrationData.productTypes?.length ? registrationData.productTypes : ['Makanan Siap Saji', 'Lauk Pauk Matang', 'Minuman Dingin / Hangat']
  );
  const [customTagInput, setCustomTagInput] = useState('');

  // Alamat & GPS
  const [fullAddress, setFullAddress] = useState(registrationData.fullAddress || '');
  const [village, setVillage] = useState(registrationData.village || ARJAWINANGUN_VILLAGES[0]);
  const [district, setDistrict] = useState(registrationData.district || CIREBON_DISTRICTS[0]);
  const [gpsLocation, setGpsLocation] = useState(
    registrationData.gpsLocation || {
      lat: -6.6508,
      lng: 108.4124,
      label: 'Pasar Gaya Arjawinangun Cirebon',
    }
  );
  const [isGpsLocating, setIsGpsLocating] = useState(false);

  // Operasional & Verifikasi Identitas
  const [openingHours, setOpeningHours] = useState(registrationData.openingHours || '07:00');
  const [closingHours, setClosingHours] = useState(registrationData.closingHours || '21:00');
  const [operationalDays, setOperationalDays] = useState<string[]>(
    registrationData.operationalDays?.length ? registrationData.operationalDays : DAYS_OF_WEEK
  );
  const [ktpPhotoUrl, setKtpPhotoUrl] = useState(
    registrationData.ktpPhotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
  );
  const [agreedToTerms, setAgreedToTerms] = useState(registrationData.agreedToTerms ?? true);

  // Sync whatsapp
  useEffect(() => {
    if (sameAsPhone) {
      setStoreWhatsapp(ownerPhone);
    }
  }, [sameAsPhone, ownerPhone]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendOtp = () => {
    if (!ownerPhone || ownerPhone.length < 9) {
      addToast('error', 'Nomor HP Kurang', 'Masukkan nomor HP aktif minimal 10 digit.');
      return;
    }
    setOtpSent(true);
    setOtpCountdown(60);
    setOtpInput('882910');
    addToast('info', 'OTP Terkirim', `Kode 6-digit terkirim ke ${ownerPhone} (Demo: 882910).`);
  };

  const handleVerifyOtp = () => {
    if (otpInput.trim() === '882910' || otpInput.trim().length === 6) {
      setIsPhoneOtpVerified(true);
      addToast('success', 'OTP Terverifikasi', 'Nomor HP berhasil divalidasi.');
    } else {
      addToast('error', 'OTP Salah', 'Masukkan 6 digit kode OTP yang benar.');
    }
  };

  const toggleDay = (day: string) => {
    if (operationalDays.includes(day)) {
      if (operationalDays.length === 1) return;
      setOperationalDays(operationalDays.filter((d) => d !== day));
    } else {
      setOperationalDays([...operationalDays, day]);
    }
  };

  const toggleProductTag = (tag: string) => {
    if (selectedProductTags.includes(tag)) {
      if (selectedProductTags.length === 1) return;
      setSelectedProductTags(selectedProductTags.filter((t) => t !== tag));
    } else {
      setSelectedProductTags([...selectedProductTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTagInput.trim();
    if (clean && !selectedProductTags.includes(clean)) {
      setSelectedProductTags([...selectedProductTags, clean]);
      setCustomTagInput('');
    }
  };

  const handleDetectCurrentLocation = () => {
    setIsGpsLocating(true);
    setTimeout(() => {
      const lat = Number((-6.6508 + (Math.random() - 0.5) * 0.004).toFixed(6));
      const lng = Number((108.4124 + (Math.random() - 0.5) * 0.004).toFixed(6));
      setGpsLocation({ lat, lng, label: `Lokasi GPS Terkunci (${village})` });
      setIsGpsLocating(false);
      addToast('success', 'GPS Terkunci', `Titik [${lat}, ${lng}] disimpan.`);
    }, 600);
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!ownerName.trim()) {
        addToast('error', 'Nama Wajib', 'Isi nama lengkap pemilik.');
        return false;
      }
      if (!ownerPhone.trim() || !isPhoneOtpVerified) {
        addToast('error', 'OTP Wajib', 'Kirim dan verifikasi kode OTP nomor HP.');
        return false;
      }
      if (!password || password !== passwordConfirmation) {
        addToast('error', 'Sandi Salah', 'Kata sandi minimal 6 karakter dan harus cocok.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!storeName.trim() || !storeCategory || !storeLogoUrl || selectedProductTags.length === 0) {
        addToast('error', 'Data Belum Lengkap', 'Nama warung, kategori, foto, dan jenis produk wajib diisi.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!fullAddress.trim() || !village || !district || !gpsLocation.lat) {
        addToast('error', 'Alamat & GPS Wajib', 'Lengkapi alamat dan tentukan titik GPS pada peta.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!openingHours || !closingHours || operationalDays.length === 0 || !agreedToTerms) {
        addToast('error', 'Belum Lengkap', 'Tentukan jam buka dan centang persetujuan S&K.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }
    submitMerchantRegistration({
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      isPhoneOtpVerified: true,
      email: email.trim() || undefined,
      password,
      passwordConfirmation,
      ownerPhotoUrl: ownerPhotoUrl || undefined,
      storeName: storeName.trim(),
      storeCategory,
      storeWhatsapp: storeWhatsapp.trim() || undefined,
      storeLogoUrl,
      storeDescription: storeDescription.trim() || undefined,
      productTypes: selectedProductTags,
      fullAddress: fullAddress.trim(),
      village,
      district,
      gpsLocation,
      openingHours,
      closingHours,
      operationalDays,
      ktpPhotoUrl: ktpPhotoUrl || undefined,
      agreedToTerms,
    });
    setActiveViewMode('statusHub');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      addToast('error', 'Login Gagal', 'Nomor HP / Email dan Kata Sandi wajib diisi.');
      return;
    }
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      addToast('success', 'Login Berhasil', `Selamat datang kembali, ${registrationData.ownerName || 'Hj. Siti Fatimah'}!`);
      setActiveTab('dashboard');
    }, 500);
  };

  return (
    <div className="space-y-3 pb-4 max-w-5xl mx-auto">
      {/* Slim Header Banner with AWD Gradient */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-3 sm:p-3.5 shadow-md shadow-blue-900/10 border border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Designer_b056b7f0.png"
              alt="AWD Ecosystem"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain bg-white p-0.5 border border-blue-300/40 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider bg-white/20 px-1.5 py-0.2 rounded text-blue-100">
                  Portal Mitra Warung & Toko
                </span>
                <span className="text-[10px] text-blue-200">Arjawinangun Delivery</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight mt-0.5">
                {activeViewMode === 'login'
                  ? 'Masuk ke Akun Mitra Warung'
                  : activeViewMode === 'statusHub'
                  ? 'Status Verifikasi & Fitur Merchant'
                  : 'Formulir Pendaftaran App Merchant'}
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-black/25 p-1 rounded-lg border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('login')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'login'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              onClick={() => setActiveViewMode('form')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'form'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pendaftaran</span>
            </button>
            <button
              onClick={() => setActiveViewMode('statusHub')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'statusHub'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Status Akun</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                registrationData.status === 'Disetujui'
                  ? 'bg-emerald-100 text-emerald-800'
                  : registrationData.status === 'Menunggu Verifikasi'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {registrationData.status === 'Disetujui' ? 'Aktif' : registrationData.status === 'Menunggu Verifikasi' ? 'Pending' : 'Ditolak'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATUS LIFECYCLE BAR */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Status Akun:</span>
          <span
            className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
              registrationData.status === 'Disetujui'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : registrationData.status === 'Menunggu Verifikasi'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
            }`}
          >
            {registrationData.status === 'Disetujui'
              ? '✓ Disetujui'
              : registrationData.status === 'Menunggu Verifikasi'
              ? '⏳ Menunggu Verifikasi'
              : '✕ Ditolak'}
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">• Estimasi 1x24 jam kerja</span>
        </div>

        {/* Quick Simulator Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Uji:</span>
          <button
            onClick={() => updateRegistrationStatus('Menunggu Verifikasi')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              registrationData.status === 'Menunggu Verifikasi'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ⏳ Menunggu
          </button>
          <button
            onClick={() => updateRegistrationStatus('Disetujui')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              registrationData.status === 'Disetujui'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ✓ Disetujui
          </button>
          <button
            onClick={() => updateRegistrationStatus('Ditolak', 'Foto KTP tidak jelas / titik GPS warung belum presisi.')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              registrationData.status === 'Ditolak'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ✕ Ditolak
          </button>
        </div>
      </div>

      {/* ===================== VIEW MODE: LOGIN MITRA ===================== */}
      {activeViewMode === 'login' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1 border border-blue-200 dark:border-blue-800/60">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Masuk ke Portal Mitra AWD
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khusus pemilik toko & warung lokal Arjawinangun. Kelola pesanan, produk & operasional.
            </p>
          </div>

          {/* Login Method Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'phone'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Nomor HP / WA</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'email'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Akun</span>
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {/* Identifier input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {loginMethod === 'phone' ? 'Nomor HP Aktif / WhatsApp Warung *' : 'Alamat Email Terdaftar *'}
              </label>
              <div className="relative">
                {loginMethod === 'phone' ? (
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type={loginMethod === 'phone' ? 'tel' : 'email'}
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder={loginMethod === 'phone' ? 'Contoh: 085224158990' : 'nama@warunganda.com'}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi *
                </label>
                <button
                  type="button"
                  onClick={() => addToast('info', 'Bantuan Sandi', 'Silakan gunakan sandi demo ArjaBerkah2026! atau hubungi admin AWD.')}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Lupa sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier(loginMethod === 'phone' ? '085224158990' : 'siti.warungarja@gmail.com');
                  setLoginPassword('ArjaBerkah2026!');
                  addToast('info', 'Demo Diisi', 'Kredensial akun Warung Bu Siti telah dimuat.');
                }}
                className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-blue-600 font-medium"
              >
                ✨ Isi Otomatis Akun Demo
              </button>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Akun Terverifikasi
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk ke Dashboard Warung</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum mendaftarkan warung atau toko Anda?{' '}
              <button
                type="button"
                onClick={() => setActiveViewMode('form')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Daftar Mitra Sekarang
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ===================== VIEW MODE: STATUS HUB ===================== */}
      {activeViewMode === 'statusHub' && (
        <div className="space-y-3">
          {/* Status Detail Card */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border ${
              registrationData.status === 'Disetujui'
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-blue-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : registrationData.status === 'Menunggu Verifikasi'
                ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                : 'bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0">
                  {registrationData.status === 'Disetujui' ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : registrationData.status === 'Menunggu Verifikasi' ? (
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-spin" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded bg-white/70 dark:bg-black/30">
                      ID: {registrationData.id}
                    </span>
                    <span className="text-[10px] opacity-75">Terkirim: {new Date(registrationData.submittedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black">
                    {registrationData.status === 'Disetujui'
                      ? 'Pendaftaran Disetujui — Warung Siap Buka!'
                      : registrationData.status === 'Menunggu Verifikasi'
                      ? 'Pendaftaran Sedang Ditinjau Tim AWD'
                      : 'Pendaftaran Ditolak / Perlu Perbaikan'}
                  </h2>
                  <p className="text-xs opacity-90 mt-0.5 max-w-xl">
                    {registrationData.status === 'Disetujui'
                      ? `Selamat ${registrationData.ownerName}! Warung "${registrationData.storeName}" di Desa ${registrationData.village}, Kec. ${registrationData.district} sudah aktif.`
                      : registrationData.status === 'Menunggu Verifikasi'
                      ? `Berkas pendaftaran pemilik "${registrationData.ownerName}" dan lokasi warung "${registrationData.storeName}" sedang diverifikasi tim AWD.`
                      : `Alasan: ${registrationData.rejectionReason || 'Foto KTP tidak jelas atau titik GPS belum akurat'}. Silakan perbaiki formulir.`}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {registrationData.status === 'Ditolak' ? (
                  <button
                    onClick={() => {
                      setActiveViewMode('form');
                      setCurrentStep(1);
                    }}
                    className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Perbaiki Formulir</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveViewMode('form')}
                    className="h-8 px-3 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-white flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Rincian Berkas</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION: 5 FITUR TAMBAHAN PASCA-PENDAFTARAN */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Fitur Tambahan Pasca-Pendaftaran
                </h3>
                <p className="text-[11px] text-slate-500">
                  Akses langsung 5 pilar manajemen merchant AWD setelah akun aktif:
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                {registrationData.status === 'Disetujui' ? '✓ Semua Fitur Aktif' : '⏳ Terbuka Pasca-Verifikasi'}
              </span>
            </div>

            {/* 5 Specific Features in Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {/* Feature 1 */}
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">1. Kelola Produk & Stok</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Atur harga normal/diskon, stok real-time, foto menu, dan variasi porsi/topping.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="mt-2.5 h-7 px-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-between shadow-xs"
                >
                  <span>Buka Produk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Feature 2 */}
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">2. Terima / Tolak Pesanan</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Notifikasi lonceng order masuk, alur dapur, dan cetak struk kasir Bluetooth.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="mt-2.5 h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-between shadow-xs"
                >
                  <span>Lihat Order</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Feature 3 */}
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Power className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">3. Status Buka / Tutup</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Kontrol jam operasional: Buka saat siap, atau Tutup saat istirahat/stok habis.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = currentStore.operationalStatus === 'Open' ? 'Closed' : 'Open';
                    updateCurrentStore({ operationalStatus: next });
                  }}
                  className={`mt-2.5 h-7 px-2.5 rounded-md text-white font-bold text-[11px] flex items-center justify-between shadow-xs ${
                    currentStore.operationalStatus === 'Open'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <span>{currentStore.operationalStatus === 'Open' ? 'Tutup Warung' : 'Buka Warung'}</span>
                  <span className="text-[10px] opacity-80">({currentStore.operationalStatus === 'Open' ? 'Aktif' : 'Tutup'})</span>
                </button>
              </div>

              {/* Feature 4 */}
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">4. Riwayat & Pendapatan</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Laporan penjualan harian/bulanan dengan pemotongan transparan komisi AWD 10%.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="mt-2.5 h-7 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-between shadow-xs"
                >
                  <span>Laporan Omzet</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Feature 5 */}
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">5. Rekening & Pencairan</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Tarik saldo instan ke rekening bank (BCA, Mandiri, BRI, BNI) atau E-Wallet.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="mt-2.5 h-7 px-2.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-between shadow-xs"
                >
                  <span>Dompet Payout</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW MODE: FORMULIR PENDAFTARAN ===================== */}
      {activeViewMode === 'form' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Step Progress Wizard Bar - Compact */}
          <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 p-2 sm:p-2.5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 max-w-4xl mx-auto">
              {[
                { step: 1, title: '1. Pemilik & Akun', desc: 'Nama, HP, OTP, Sandi' },
                { step: 2, title: '2. Data Warung', desc: 'Nama, Kategori, Foto' },
                { step: 3, title: '3. Alamat & GPS', desc: 'Desa, Kec & Peta' },
                { step: 4, title: '4. Berkas & S&K', desc: 'Jam Buka, KTP, Syarat' },
              ].map((item) => {
                const isPassed = currentStep > item.step;
                const isCurrent = currentStep === item.step;
                return (
                  <button
                    key={item.step}
                    onClick={() => {
                      if (item.step < currentStep || validateStep(currentStep)) {
                        setCurrentStep(item.step);
                      }
                    }}
                    className={`flex items-center gap-2 p-1.5 px-2 rounded-lg text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isPassed
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${
                        isCurrent
                          ? 'bg-white text-blue-700'
                          : isPassed
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isPassed ? '✓' : item.step}
                    </span>
                    <div className="min-w-0 truncate">
                      <p className="text-[11px] truncate leading-tight">{item.title}</p>
                      <p className={`text-[9px] truncate ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="p-3.5 sm:p-5 space-y-4">
            {/* Quick Switch to Login Banner */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 text-xs">
              <span className="text-[11px] text-blue-900 dark:text-blue-200">
                Sudah memiliki akun warung terdaftar?
              </span>
              <button
                type="button"
                onClick={() => setActiveViewMode('login')}
                className="text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Masuk ke Akun Mitra</span>
              </button>
            </div>

            {/* ================= STEP 1: DATA PEMILIK DAN AKUN ================= */}
            {currentStep === 1 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Data Pemilik dan Akun Merchant
                    </h3>
                    <p className="text-[11px] text-slate-400">Identitas pemilik usaha untuk keperluan login & verifikasi rekening.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    Langkah 1/4
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Nama lengkap pemilik - Wajib */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nama Lengkap Pemilik</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Contoh: Hj. Siti Fatimah / Budi Santoso"
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Nomor HP aktif - Wajib · OTP */}
                  <div className="space-y-1 md:col-span-2 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nomor HP Aktif</span>
                      </label>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white">
                        Wajib · OTP
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">
                          +62
                        </span>
                        <input
                          type="tel"
                          value={ownerPhone.startsWith('+62') ? ownerPhone.slice(3) : ownerPhone.startsWith('0') ? ownerPhone.slice(1) : ownerPhone}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '');
                            setOwnerPhone('0' + raw);
                            setIsPhoneOtpVerified(false);
                          }}
                          placeholder="81234567890"
                          className="w-full h-8 pl-10 pr-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpCountdown > 0}
                        className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs disabled:opacity-60 whitespace-nowrap"
                      >
                        {otpCountdown > 0 ? `Kirim Ulang (${otpCountdown}s)` : 'Kirim Kode OTP (WA/SMS)'}
                      </button>
                    </div>

                    {/* OTP verification input box */}
                    {otpSent && !isPhoneOtpVerified && (
                      <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="6 Digit"
                            className="w-24 h-7 text-center text-xs font-black tracking-widest rounded border border-slate-300 dark:border-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => setOtpInput('882910')}
                            className="text-[10px] text-blue-600 dark:text-blue-400 underline font-medium"
                          >
                            Kode Demo: 882910
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="h-7 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Verifikasi
                        </button>
                      </div>
                    )}

                    {isPhoneOtpVerified && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Nomor HP Terverifikasi OTP</span>
                      </div>
                    )}
                  </div>

                  {/* Email - Opsional */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Alamat Email</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Opsional
                      </span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: warung.arja@gmail.com"
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Kata sandi - Wajib */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kata Sandi</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="w-full h-8 px-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi kata sandi - Wajib */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Konfirmasi Sandi</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Ulangi sandi"
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Foto profil pemilik - Opsional */}
                  <div className="space-y-1 md:col-span-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>Foto Profil Pemilik</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Opsional
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                      <img
                        src={ownerPhotoUrl}
                        alt="Profil"
                        className="w-10 h-10 rounded-lg object-cover border border-white dark:border-slate-700 shadow-xs shrink-0"
                      />
                      <div className="flex items-center gap-2">
                        <label className="h-7 px-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs">
                          <Upload className="w-3 h-3" />
                          <span>Pilih Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setOwnerPhotoUrl(URL.createObjectURL(f));
                            }}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">JPG/PNG maks 5MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(1)) setCurrentStep(2);
                    }}
                    className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Lanjut ke Data Warung</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: DATA WARUNG / TOKO ================= */}
            {currentStep === 2 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Data Warung / Toko & Kategori Produk
                    </h3>
                    <p className="text-[11px] text-slate-400">Informasi etalase toko yang akan dilihat pembeli di aplikasi AWD.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    Langkah 2/4
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Nama warung / toko - Wajib */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <StoreIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nama Warung / Toko</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Contoh: Warung Nasi Jamblang Daun Jati Bu Siti"
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Kategori usaha - Wajib */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kategori Usaha</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <select
                      value={storeCategory}
                      onChange={(e) => setStoreCategory(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WhatsApp usaha - Opsional */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nomor WhatsApp Usaha</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Opsional
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="samePhone"
                        checked={sameAsPhone}
                        onChange={(e) => {
                          setSameAsPhone(e.target.checked);
                          if (e.target.checked) setStoreWhatsapp(ownerPhone);
                        }}
                        className="rounded text-blue-600"
                      />
                      <label htmlFor="samePhone" className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                        Sama dengan nomor HP pemilik ({ownerPhone || 'Belum diisi'})
                      </label>
                    </div>
                    {!sameAsPhone && (
                      <input
                        type="tel"
                        value={storeWhatsapp}
                        onChange={(e) => setStoreWhatsapp(e.target.value)}
                        placeholder="Contoh: 081298765432"
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                    )}
                  </div>

                  {/* Foto warung / logo usaha - Wajib */}
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Foto Warung / Logo Usaha</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                      <img
                        src={storeLogoUrl}
                        alt="Logo"
                        className="w-16 h-16 rounded-lg object-cover border border-white dark:border-slate-700 shadow-xs shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <p className="text-[10px] text-slate-400">Pilih cepat foto etalase warung:</p>
                        <div className="flex flex-wrap gap-1">
                          {PRESET_WARUNG_PHOTOS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setStoreLogoUrl(preset.url)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                                storeLogoUrl === preset.url
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi usaha - Opsional */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deskripsi Usaha</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Opsional
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Jelaskan menu andalan atau keunggulan produk Anda..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  {/* Jenis produk yang dijual - Wajib */}
                  <div className="space-y-1.5 md:col-span-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5 text-blue-600" />
                        <span>Jenis Produk yang Dijual</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib (Min. 1)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {DEFAULT_PRODUCT_TAGS.map((tag) => {
                        const isSelected = selectedProductTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleProductTag(tag)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span>{tag}</span>
                            {isSelected ? <Check className="w-2.5 h-2.5" /> : <span>+</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add custom tag */}
                    <div className="pt-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        placeholder="Tambah jenis produk lain..."
                        className="flex-1 h-7 px-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="h-7 px-2.5 rounded-md bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(2)) setCurrentStep(3);
                    }}
                    className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Lanjut ke Alamat & Titik GPS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ALAMAT LENGKAP & TITIK PETA (GPS) ================= */}
            {currentStep === 3 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Alamat Lengkap & Titik Lokasi Peta (GPS)
                    </h3>
                    <p className="text-[11px] text-slate-400">Titik koordinat penjemputan pesanan oleh kurir pengantar AWD.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    Langkah 3/4
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Kecamatan - Wajib */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kecamatan</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      {CIREBON_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          Kec. {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Desa / Kelurahan - Wajib */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Desa / Kelurahan</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      {ARJAWINANGUN_VILLAGES.map((v) => (
                        <option key={v} value={v}>
                          Desa {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alamat lengkap warung - Wajib */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Alamat Lengkap Warung</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="Jalan, nomor, RT/RW, gang, atau patokan (contoh: Jl. By Pass No. 88 depan minimarket)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      required
                    />
                  </div>

                  {/* Titik lokasi pada peta (GPS) - Wajib */}
                  <div className="space-y-2 md:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Titik Lokasi GPS (Peta)</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                          Wajib
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={isGpsLocating}
                        className="h-7 px-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <Navigation className={`w-3 h-3 ${isGpsLocating ? 'animate-spin' : ''}`} />
                        <span>{isGpsLocating ? 'Mencari...' : 'Lokasi GPS Saya'}</span>
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1">
                      {ARJA_GPS_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setGpsLocation({ lat: preset.lat, lng: preset.lng, label: preset.name });
                            setVillage(preset.village);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            gpsLocation.label === preset.name
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          📍 {preset.name}
                        </button>
                      ))}
                    </div>

                    {/* Compact Interactive Map Canvas */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 text-white p-3 h-36 flex flex-col justify-between">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:14px_14px]" />
                      <div className="relative z-10 flex items-center justify-between text-[11px]">
                        <span className="font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{district}, Cirebon</span>
                        </span>
                        <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded">
                          Radius 7km
                        </span>
                      </div>

                      {/* Pin Center */}
                      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md flex items-center justify-center border border-white">
                          <StoreIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                          {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng.toFixed(5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(3)) setCurrentStep(4);
                    }}
                    className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Lanjut ke Jam Buka & KTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: JAM OPERASIONAL & VERIFIKASI KTP ================= */}
            {currentStep === 4 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Jam Operasional, Foto KTP & Persetujuan
                    </h3>
                    <p className="text-[11px] text-slate-400">Jadwal buka toko dan dokumen kepatuhan identitas mitra AWD.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    Langkah 4/4
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Jam Operasional - Wajib */}
                  <div className="space-y-2 md:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Jam Operasional & Hari Buka</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                        Wajib
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Jam Buka:</span>
                        <input
                          type="time"
                          value={openingHours}
                          onChange={(e) => setOpeningHours(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          required
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Jam Tutup:</span>
                        <input
                          type="time"
                          value={closingHours}
                          onChange={(e) => setClosingHours(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1">Hari Aktif:</span>
                      <div className="flex flex-wrap gap-1">
                        {DAYS_OF_WEEK.map((day) => {
                          const isActive = operationalDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Foto KTP Pemilik - Sesuai Kebijakan Verifikasi */}
                  <div className="space-y-1.5 md:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Foto KTP Pemilik</span>
                      </label>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300">
                        Sesuai Kebijakan Verifikasi
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <img
                        src={ktpPhotoUrl}
                        alt="KTP"
                        className="w-24 h-16 rounded-md object-cover border border-slate-200 dark:border-slate-600 shrink-0"
                      />
                      <div className="space-y-1">
                        <label className="h-7 px-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs">
                          <Upload className="w-3 h-3" />
                          <span>Unggah KTP</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setKtpPhotoUrl(URL.createObjectURL(f));
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">Pastikan NIK dan Nama terbaca jelas.</p>
                      </div>
                    </div>
                  </div>

                  {/* Persetujuan Syarat dan Ketentuan - Wajib */}
                  <div className="space-y-1.5 md:col-span-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="termsAgree"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                        required
                      />
                      <label htmlFor="termsAgree" className="text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer leading-tight">
                        Saya menyetujui seluruh{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="font-bold text-blue-600 dark:text-blue-400 underline inline"
                        >
                          Syarat & Ketentuan Kemitraan AWD
                        </button>{' '}
                        termasuk skema komisi 10% dan kode etik kebersihan warung.
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    className="h-9 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kirim Formulir Pendaftaran Warung</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* MODAL: SYARAT DAN KETENTUAN KEMITRAAN AWD */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Syarat & Ketentuan Mitra AWD
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/50">
                <p className="font-bold text-blue-900 dark:text-blue-200">
                  Arjawinangun Delivery (AWD) Ekosistem
                </p>
                <p className="text-[10px] text-blue-800 dark:text-blue-300">
                  Pemberdayaan warung makan, sembako, dan UMKM lokal Kabupaten Cirebon.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">1. Verifikasi Data Asli</h4>
                <p>Pemilik wajib memberikan data identitas dan titik GPS warung yang akurat.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">2. Standar Kualitas Makanan</h4>
                <p>Menjaga kebersihan, higienitas, dan kehalalan makanan yang disajikan.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">3. Komisi Platform 10%</h4>
                <p>Komisi 10% otomatis dipotong dari tiap transaksi selesai untuk sistem dan kurir.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">4. Pencairan Dana Payout</h4>
                <p>Saldo dapat ditarik sewaktu-waktu ke bank atau e-wallet dalam 1x24 jam kerja.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Saya Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
