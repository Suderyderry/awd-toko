/**
 * Layar masuk / daftar toko / menunggu persetujuan admin (mode live, Supabase Auth).
 */
import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import { STORE_CATEGORIES } from '../../lib/liveApi.ts';
import { Toasts } from '../common/Toasts.tsx';

const field =
  'w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const Shell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-start sm:items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
    <Toasts />
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 p-5 space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <img src="/assets/aistudio/Designer_b056b7f0.png" alt="Logo AWD" className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200" />
        <div>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          <p className="text-[11px] font-semibold text-blue-600">AWD Mitra Toko · Arjawinangun Delivery</p>
        </div>
      </div>
      {children}
    </div>
  </div>
);

export const LiveGate: React.FC = () => {
  const { liveStatus, liveReason, signInEmail, registerAccount, signOutLive, refreshLive, addToast, merchant, currentStore } = useMerchant();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pemilik, setPemilik] = useState('');
  const [hp, setHp] = useState('');
  const [namaToko, setNamaToko] = useState('');
  const [kategori, setKategori] = useState(STORE_CATEGORIES[0]);
  const [alamat, setAlamat] = useState('');
  const [desa, setDesa] = useState('');
  const [jamBuka, setJamBuka] = useState('07:00');
  const [jamTutup, setJamTutup] = useState('21:00');
  const [deskripsi, setDeskripsi] = useState('');

  if (liveStatus === 'loading') {
    return <Shell title="Memuat…"><p className="text-sm text-slate-500">Menyambung ke server AWD…</p></Shell>;
  }

  if (liveStatus === 'pending' || liveStatus === 'rejected' || liveStatus === 'suspended') {
    const title = liveStatus === 'pending' ? 'Menunggu Persetujuan' : liveStatus === 'rejected' ? 'Pendaftaran Ditolak' : 'Toko Ditangguhkan';
    return (
      <Shell title={title}>
        <p className="text-sm text-slate-700">
          Toko <b>{currentStore.name || merchant.ownerName}</b>{' '}
          {liveStatus === 'pending' && 'sudah terdaftar dan sedang ditinjau oleh admin AWD. Halaman ini otomatis diperbarui setelah disetujui.'}
          {liveStatus === 'rejected' && 'belum disetujui.'}
          {liveStatus === 'suspended' && 'sedang ditangguhkan oleh admin AWD.'}
        </p>
        {liveReason && <p className="text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800">Alasan: {liveReason}</p>}
        <div className="flex gap-2">
          <button onClick={() => refreshLive()} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm">Cek Status</button>
          <button onClick={() => signOutLive()} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm">Keluar</button>
        </div>
      </Shell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { addToast('error', 'Email belum benar', 'Masukkan alamat email yang benar.'); return; }
    if (password.length < 6) { addToast('error', 'Kata sandi pendek', 'Kata sandi minimal 6 karakter.'); return; }
    if (mode === 'register' || liveStatus === 'noStore') {
      if (namaToko.trim().length < 3 || pemilik.trim().length < 2 || alamat.trim().length < 5 || hp.replace(/\D/g, '').length < 9) {
        addToast('error', 'Data belum lengkap', 'Isi nama pemilik, HP, nama toko, dan alamat dengan benar.');
        return;
      }
    }
    setBusy(true);
    if (mode === 'login') await signInEmail(email, password);
    else await registerAccount(email, password, { pemilik, hp, namaToko, kategori, alamat, desa, jamBuka, jamTutup, deskripsi });
    setBusy(false);
  };

  return (
    <Shell title={mode === 'login' ? 'Masuk Toko' : 'Daftar Toko Baru'}>
      {liveStatus === 'noStore' && (
        <p className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800">
          Akun ini belum punya toko. Pakai email lain, atau keluar lalu daftar toko baru.
          <button onClick={() => signOutLive()} className="ml-2 font-bold underline">Keluar</button>
        </p>
      )}
      <form onSubmit={submit} className="space-y-3 text-xs">
        {mode === 'register' && (
          <>
            <div><label className="font-semibold block mb-1" htmlFor="t-pemilik">Nama Pemilik</label>
              <input id="t-pemilik" className={field} value={pemilik} onChange={(e) => setPemilik(e.target.value)} autoComplete="name" /></div>
            <div><label className="font-semibold block mb-1" htmlFor="t-hp">Nomor HP / WhatsApp</label>
              <input id="t-hp" type="tel" className={field} value={hp} onChange={(e) => setHp(e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" /></div>
            <div><label className="font-semibold block mb-1" htmlFor="t-toko">Nama Toko / Warung</label>
              <input id="t-toko" className={field} value={namaToko} onChange={(e) => setNamaToko(e.target.value)} /></div>
            <div><label className="font-semibold block mb-1" htmlFor="t-kat">Kategori</label>
              <select id="t-kat" className={field} value={kategori} onChange={(e) => setKategori(e.target.value)}>
                {STORE_CATEGORIES.map((k) => <option key={k} value={k}>{k}</option>)}
              </select></div>
            <div><label className="font-semibold block mb-1" htmlFor="t-alamat">Alamat Lengkap Toko</label>
              <input id="t-alamat" className={field} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Jalan, No., RT/RW" /></div>
            <div><label className="font-semibold block mb-1" htmlFor="t-desa">Desa / Kelurahan</label>
              <input id="t-desa" className={field} value={desa} onChange={(e) => setDesa(e.target.value)} placeholder="Contoh: Jungjang" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="font-semibold block mb-1" htmlFor="t-buka">Jam Buka</label>
                <input id="t-buka" type="time" className={field} value={jamBuka} onChange={(e) => setJamBuka(e.target.value)} /></div>
              <div><label className="font-semibold block mb-1" htmlFor="t-tutup">Jam Tutup</label>
                <input id="t-tutup" type="time" className={field} value={jamTutup} onChange={(e) => setJamTutup(e.target.value)} /></div>
            </div>
            <div><label className="font-semibold block mb-1" htmlFor="t-desk">Deskripsi (opsional)</label>
              <input id="t-desk" className={field} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} /></div>
          </>
        )}
        <div><label className="font-semibold block mb-1" htmlFor="t-email">Alamat Email</label>
          <input id="t-email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></div>
        <div><label className="font-semibold block mb-1" htmlFor="t-pass">Kata Sandi</label>
          <input id="t-pass" type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div>
        <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm disabled:opacity-60">
          {busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftarkan Toko'}
        </button>
      </form>
      <p className="text-center text-xs text-slate-500">
        {mode === 'login' ? (
          <>Belum punya akun toko? <button onClick={() => setMode('register')} className="text-blue-600 font-bold">Daftar di sini</button></>
        ) : (
          <>Sudah punya akun? <button onClick={() => setMode('login')} className="text-blue-600 font-bold">Masuk</button></>
        )}
      </p>
    </Shell>
  );
};
