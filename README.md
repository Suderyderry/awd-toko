# AWD Toko (Android)

Aplikasi mitra toko Arjawinangun Delivery. Satu file web (`www/index.html`) dibungkus Capacitor menjadi APK lewat
GitHub Actions. Terhubung ke Supabase dan panel admin AWD (https://suderyderry.github.io/awd-admin/).

## Diatur dari panel admin
- Header (nama, slogan, logo, warna, tinggi, font) : Kelola Aplikasi Android > Aplikasi Toko > Tampilan
- Daftar layanan saat mendaftar : Kelola Aplikasi Android > Menu Layanan
- Kategori produk di form produk : Kelola Aplikasi Android > Aplikasi Toko > Kategori produk
- Persetujuan toko baru : Data Toko (ubah status Ditangguhkan menjadi Tutup/Buka); ongkir, estimasi, keterangan : Data Toko > Ubah
- Pesanan masuk/diproses/dibatalkan tampil juga di Transaksi & Pesanan; chat pelanggan terhubung ke aplikasi AWD Pelanggan.

## Fitur
Pesanan masuk (dering, getar, notifikasi), terima/tolak/siap, lacak driver di peta, kelola produk + diskon
(persen/Rp, minimal jumlah pcs), tandai habis, jadwal buka tutup, chat pelanggan, statistik, saldo dan pencairan.

## Login
Masuk memakai **nomor HP + kata sandi** (akun Supabase dibuat dari nomor HP: `08xxxx@toko.awd.app`).
SEMENTARA (uji coba): nomor HP bebas + kata sandi `123456` langsung masuk, akun dibuat otomatis. Untuk produksi ubah
`TEMP_PW` di `www/index.html` menjadi `''` (kosong) dan atur ulang kata sandi akun uji.

## Langkah
1. Supabase > SQL Editor: jalankan `supabase/1_bersihkan_database.sql` (jika mengulang) lalu `supabase/2_pasang_database.sql`.
2. Supabase > Authentication > Providers > Email: Allow new users to sign up = ON, Confirm email = OFF.
3. Unggah isi folder ini ke repositori GitHub (termasuk folder `.github`), lalu Actions > Build APK Android.
4. Unduh artifact `awd-toko-apk`, pasang `app-debug.apk`.

URL dan Publishable key Supabase tertanam di `www/index.html` (`CFG`). Kunci itu publik; data dilindungi RLS.
Jangan pernah memasukkan Secret/service_role key.

## Ikon
`assets/icon-only.png`, `icon-foreground.png`, `icon-background.png` (1024x1024). Ganti lalu commit untuk mengubah ikon.
