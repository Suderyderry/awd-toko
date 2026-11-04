/**
 * AWD Toko – penghubung ke database Supabase (sama dengan panel admin & aplikasi pelanggan).
 */
import { supabase } from './supabase.ts';
import type { Merchant, Store, Product, ProductStatus, Order, OrderStatus, DriverInfo } from '../types/index.ts';
import { calculateOrderFinancials } from '../utils/merchantLogic.ts';

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#dbeafe"/><text x="150" y="165" font-size="64" text-anchor="middle" fill="#2563eb" font-family="sans-serif">AWD</text></svg>'
  );

export const LIVE_CATEGORIES = ['Makanan', 'Minuman', 'Kue', 'Camilan', 'Obat bebas', 'Suplemen', 'Alat kesehatan', 'Sembako', 'Lainnya'];
export const STORE_CATEGORIES = ['Makanan', 'Kue', 'Minuman', 'Obat & kesehatan', 'Sembako'];

/* ---------------- Akun ---------------- */
export const getSession = async () => (await supabase.auth.getSession()).data.session;
export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signUp = (email: string, password: string) => supabase.auth.signUp({ email, password });
export const signOut = () => supabase.auth.signOut();
export const onAuthChange = (cb: (event: string) => void) => {
  const { data } = supabase.auth.onAuthStateChange((event) => cb(event));
  return () => data.subscription.unsubscribe();
};

export function friendlyError(e: any): string {
  const m = String(e?.message ?? e ?? '');
  if (/invalid login/i.test(m)) return 'Email atau kata sandi salah.';
  if (/already registered|already been registered/i.test(m)) return 'Email ini sudah terdaftar. Silakan masuk.';
  if (/password/i.test(m) && /(least|short|weak)/i.test(m)) return 'Kata sandi minimal 6 karakter.';
  if (/rate limit/i.test(m)) return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
  if (/network|failed to fetch/i.test(m)) return 'Tidak ada koneksi internet.';
  return m || 'Terjadi kesalahan.';
}

/* ---------------- Toko ---------------- */
export type Verification = 'Menunggu' | 'Disetujui' | 'Ditolak';
export interface StoreBundle { merchant: Merchant; store: Store; vf: Verification; alasan?: string; suspended: boolean }

export async function fetchMyStore(authId: string, email: string): Promise<StoreBundle | null> {
  const { data, error } = await supabase
    .from('pengguna').select('id,nama,status,data').eq('auth_id', authId).eq('tipe', 'merchant').maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const d: any = data.data ?? {};
  const x: any = d.x ?? {};
  const vf = (x.vf as Verification) || 'Disetujui';
  const [lat, lng] = String(x.gps ?? '-6.6432, 108.4125').split(',').map((v) => parseFloat(v.trim()));
  const [buka, tutup] = String(x.jam ?? '07.00-21.00').split('-').map((v) => v.trim().replace('.', ':'));
  const suspended = data.status === 'Ditangguhkan';
  const merchant: Merchant = {
    id: String(data.id), ownerName: String(d.sub ?? ''), email: String(x.email ?? email), phone: String(d.hp ?? ''),
    status: suspended ? 'Suspended' : vf === 'Disetujui' ? 'Verified' : vf === 'Ditolak' ? 'Rejected' : 'Pending',
    verificationDocs: {}, createdAt: String(d.jn ?? ''),
  };
  const store: Store = {
    id: 'store-' + data.id, merchantId: String(data.id), name: String(data.nama), description: String(x.desc ?? ''),
    logoUrl: PLACEHOLDER_IMG, bannerUrl: PLACEHOLDER_IMG, address: String(d.adr ?? ''),
    latitude: isNaN(lat) ? -6.6432 : lat, longitude: isNaN(lng) ? 108.4125 : lng,
    phone: String(d.hp ?? ''), whatsapp: String(d.hp ?? ''), openingHours: buka || '07:00', closingHours: tutup || '21:00',
    deliveryRadiusKm: 7, category: String(x.kat ?? 'Makanan'), operationalStatus: data.status === 'Buka' ? 'Open' : 'Closed',
    isVerified: vf === 'Disetujui' && !suspended, rating: Number(d.r) || 5, reviewCount: 0,
  };
  return { merchant, store, vf, alasan: x.alasan ? String(x.alasan) : undefined, suspended };
}

export interface RegisterForm {
  pemilik: string; hp: string; namaToko: string; kategori: string; alamat: string; desa: string;
  jamBuka: string; jamTutup: string; deskripsi: string;
}
export async function registerStore(f: RegisterForm): Promise<void> {
  const { error } = await supabase.rpc('daftar_toko', {
    p_pemilik: f.pemilik, p_hp: f.hp, p_nama_toko: f.namaToko, p_kategori: f.kategori, p_alamat: f.alamat,
    p_desa: f.desa, p_jam: `${f.jamBuka.replace(':', '.')}-${f.jamTutup.replace(':', '.')}`,
    p_deskripsi: f.deskripsi, p_lat: -6.6432, p_lng: 108.4125,
  });
  if (error) throw new Error(error.message);
}
export async function setStoreOpen(open: boolean): Promise<void> {
  const { error } = await supabase.rpc('ubah_status_toko', { p_status: open ? 'Buka' : 'Tutup' });
  if (error) throw new Error(error.message);
}
export async function updateStoreProfile(p: { alamat?: string; hp?: string; jam?: string; deskripsi?: string }): Promise<void> {
  const { error } = await supabase.rpc('ubah_profil_toko', {
    p_alamat: p.alamat ?? null, p_hp: p.hp ?? null, p_jam: p.jam ?? null, p_deskripsi: p.deskripsi ?? null,
  });
  if (error) throw new Error(error.message);
}

/* ---------------- Produk ---------------- */
export function toProduct(row: any, storeId: string): Product {
  const d: any = row.data ?? {};
  const stock = Number(d.st) || 0;
  const active = d.on === 1 || d.on === true || d.on === '1';
  const status: ProductStatus = !active ? 'Inactive' : stock <= 0 ? 'OutOfStock' : 'Active';
  const cat = String(d.k || 'Lainnya');
  return {
    id: String(row.id), storeId, categoryId: cat, categoryName: cat, name: String(d.n ?? ''), description: String(d.d ?? ''),
    imageUrl: d.img && !String(d.img).startsWith('data:') ? String(d.img) : PLACEHOLDER_IMG,
    price: Number(d.h) || 0, discountPrice: d.dp ? Number(d.dp) : undefined, stock, reservedStock: 0,
    weightGrams: Number(d.w) || 0, sku: String(d.kd ?? ''), status, createdAt: String(d.dibuat ?? ''),
  };
}
const productData = (p: Product, existing?: any) => ({
  ...(existing ?? {}),
  id: p.id, n: p.name, k: p.categoryName || p.categoryId, h: p.price, st: p.stock,
  on: p.status === 'Inactive' ? 0 : 1, kd: p.sku, d: p.description,
  img: p.imageUrl && !p.imageUrl.startsWith('data:') && p.imageUrl !== PLACEHOLDER_IMG ? p.imageUrl : '',
  dp: p.discountPrice ?? 0, w: p.weightGrams ?? 0,
  dibuat: existing?.dibuat ?? new Date().toISOString(),
});
export async function fetchProducts(merchantId: string, storeId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('produk').select('id,data').eq('merchant_id', merchantId).order('urut', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toProduct(r, storeId));
}
export const newProductId = () => 'PM' + Math.random().toString(36).slice(2, 10).toUpperCase();
export async function saveProduct(merchantId: string, p: Product): Promise<void> {
  const { data: cur } = await supabase.from('produk').select('data').eq('id', p.id).maybeSingle();
  const { error } = await supabase.from('produk').upsert(
    { id: p.id, merchant_id: merchantId, data: productData(p, cur?.data) }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('produk').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* ---------------- Pesanan ---------------- */
export async function fetchDrivers(): Promise<Map<string, DriverInfo>> {
  const { data } = await supabase.from('driver_publik').select('*');
  const map = new Map<string, DriverInfo>();
  for (const r of data ?? []) map.set(String(r.nama), driverFrom(String(r.nama), r));
  return map;
}
const driverFrom = (name: string, r?: any): DriverInfo => ({
  id: 'drv-' + name, name, phone: '', vehicleNumber: String(r?.plat ?? ''), vehicleType: String(r?.kendaraan ?? ''),
  avatar: PLACEHOLDER_IMG, rating: Number(r?.rating) || 5,
});
const mapStatus = (s: string, tahap: string): OrderStatus => {
  switch (s) {
    case 'Diproses': return tahap === 'Siap Diambil' ? 'ReadyForPickup' : tahap === 'Disiapkan' ? 'Preparing' : 'Accepted';
    case 'Diantar': return 'OnDelivery';
    case 'Selesai': return 'Completed';
    case 'Dibatalkan': return 'Cancelled';
    default: return 'New';
  }
};
export function toOrder(row: any, storeId: string, drivers?: Map<string, DriverInfo>): Order {
  const d: any = row.data ?? {};
  const a: any = d.alamat ?? {};
  const rawStatus = String(row.status ?? d.s ?? 'Baru');
  const subtotal = Number(d.subtotal) || 0;
  const fin = calculateOrderFinancials(subtotal, 0);
  const driverName = String(d.d ?? '');
  const when = d.dibuat ? new Date(d.dibuat) : null;
  return {
    id: String(row.id), orderNumber: String(row.id), storeId, customerName: String(d.c ?? ''),
    customerPhone: String(a.phone ?? ''), customerAvatar: PLACEHOLDER_IMG,
    orderTime: when && !isNaN(when.getTime()) ? when.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja',
    items: (d.items ?? []).map((i: any, n: number) => ({
      id: `${row.id}-${n}`, productId: String(i.id), productName: String(i.name), productImage: PLACEHOLDER_IMG,
      quantity: Number(i.quantity) || 1, unitPrice: Number(i.price) || 0, notes: i.notes || undefined,
    })),
    subtotal, discount: 0, deliveryFee: Number(d.ongkir) || 0, platformFee: fin.platformFee,
    totalAmount: Number(row.total ?? d.p) || 0, merchantNetAmount: fin.merchantNetAmount,
    paymentMethod: 'CASH_ON_DELIVERY',
    deliveryAddress: [a.streetAddress, a.village, a.district].filter(Boolean).join(', '),
    distanceKm: 0, status: mapStatus(rawStatus, String(d.tahap ?? '')),
    assignedDriver: driverName ? drivers?.get(driverName) ?? driverFrom(driverName) : undefined,
    rejectReason: d.alasan_tolak || undefined, estimatedDeliveryMinutes: 25,
  };
}
export async function fetchOrders(storeId: string, drivers?: Map<string, DriverInfo>): Promise<Order[]> {
  const { data, error } = await supabase.from('pesanan').select('id,status,total,data').order('urut', { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => toOrder(r, storeId, drivers));
}
export async function orderAction(id: string, aksi: 'terima' | 'siapkan' | 'siap' | 'tolak', alasan = ''): Promise<any> {
  const { data, error } = await supabase.rpc('aksi_pesanan', { p_id: id, p_aksi: aksi, p_alasan: alasan });
  if (error) throw new Error(error.message);
  return data;
}
export function subscribeOrders(onRow: (row: any, event: string) => void): () => void {
  const channel = supabase
    .channel('pesanan-toko')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pesanan' },
      (p: any) => { if (p?.new?.id) onRow(p.new, p.eventType); })
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}

export const EMPTY_MERCHANT: Merchant = {
  id: '', ownerName: '', email: '', phone: '', status: 'Pending', verificationDocs: {}, createdAt: '',
};
export const EMPTY_STORE: Store = {
  id: 'store-none', merchantId: '', name: '', description: '', logoUrl: PLACEHOLDER_IMG, bannerUrl: PLACEHOLDER_IMG,
  address: '', latitude: -6.6432, longitude: 108.4125, phone: '', whatsapp: '', openingHours: '07:00', closingHours: '21:00',
  deliveryRadiusKm: 7, category: 'Makanan', operationalStatus: 'Closed', isVerified: false, rating: 5, reviewCount: 0,
};
