# AWD Toko (Android) – tersambung ke panel admin & aplikasi pelanggan

Aplikasi pemilik toko (React + Vite) dibungkus Capacitor menjadi APK lewat GitHub Actions.
Memakai database Supabase **yang sama** dengan `awd-admin` dan `awd-pelanggan`.

## Alur kerjanya
1. Pemilik toko daftar di aplikasi -> toko masuk panel admin sebagai **Menunggu verifikasi** (menu Verifikasi).
2. Admin **menyetujui** -> toko bisa dibuka dan tampil di aplikasi pelanggan.
3. Pelanggan memesan -> pesanan **muncul langsung** di aplikasi toko (bunyi + notifikasi).
4. Toko: **Terima -> Siapkan -> Siap diambil**. Admin menugaskan driver dan menyelesaikan pesanan.
5. Produk, harga, stok, dan buka/tutup toko yang diubah di aplikasi langsung dipakai aplikasi pelanggan.

## Belum tersambung
Promosi, ulasan, penarikan dana (saldo dihitung dari pesanan selesai), unggah foto logo/produk
(foto belum disimpan ke server), dan pembayaran online. Pesanan "Selesai" diatur oleh admin/driver.

## Langkah
1. **Supabase** SQL Editor: jalankan `supabase/toko.sql` (setelah `schema.sql` admin dan `pelanggan.sql`).
2. Pastikan di Authentication > Providers > Email: *Allow new users to sign up* **aktif**, *Confirm email* **mati**.
3. Buat repositori GitHub `awd-toko` (Public), unggah semua isi folder ini (termasuk `.github`).
4. Tab **Actions** > "Build APK Android (Toko)" > tunggu hijau > **Artifacts** > unduh `awd-toko-apk` > pasang `app-debug.apk` di HP.

URL dan kunci publishable Supabase sudah ada di `src/lib/supabase.ts` (aman dipublikasikan; data dilindungi RLS).

## Ikon aplikasi
Ikon diambil dari folder `assets/` (`icon-only.png`, `icon-foreground.png`, `icon-background.png`, masing-masing 1024x1024).
Saat build APK, ikon dibuat otomatis untuk semua ukuran layar Android. Untuk mengganti ikon, timpa ketiga file itu lalu unggah ulang.
