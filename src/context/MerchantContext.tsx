/**
 * AWD Toko - Global State Management Context
 * Supports multi-store switching, real-time incoming orders with sound,
 * inventory adjustments, wallet withdrawals, promotion toggling, and review replies.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Merchant,
  Store,
  Product,
  ProductCategory,
  Order,
  Promotion,
  Wallet,
  WalletTransaction,
  Withdrawal,
  Review,
  NotificationItem,
  StockAdjustment,
  OrderStatus,
  WithdrawalMethod,
  MerchantStatus,
  MerchantRegistrationData,
  RegistrationVerificationStatus,
} from '../types/index.ts';
import {
  INITIAL_MERCHANT,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PROMOTIONS,
  INITIAL_WALLET,
  INITIAL_TRANSACTIONS,
  INITIAL_WITHDRAWALS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STOCK_ADJUSTMENTS,
} from '../data/mockData.ts';
import {
  calculateOrderFinancials,
  calculateAvailableStock,
  validateWithdrawal,
  WITHDRAWAL_FEE,
} from '../utils/merchantLogic.ts';
import { playOrderNotificationSound, playAlertSound } from '../utils/audio.ts';
import type { DriverInfo, Product as ProductT, ProductStatus } from '../types/index.ts';
import { LIVE } from '../lib/supabase.ts';
import * as api from '../lib/liveApi.ts';

export type LiveStatus = 'loading' | 'loggedOut' | 'noStore' | 'pending' | 'rejected' | 'suspended' | 'ready';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface MerchantContextType {
  // Merchant & Stores
  merchant: Merchant;
  updateMerchantStatus: (status: MerchantStatus) => void;
  stores: Store[];
  currentStore: Store;
  setCurrentStoreId: (id: string) => void;
  updateCurrentStore: (data: Partial<Store>) => void;

  // Orders
  orders: Order[];
  activeOrdersCount: number;
  newOrdersCount: number;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  markPreparing: (orderId: string) => void;
  markReadyForPickup: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  simulateIncomingOrder: () => void;
  autoSimulate: boolean;
  setAutoSimulate: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Products & Inventory
  products: Product[];
  categories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'reservedStock'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  stockAdjustments: StockAdjustment[];
  adjustStock: (productId: string, type: 'Addition' | 'Reduction' | 'Adjustment', amount: number, reason: string) => void;

  // Promotions
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  togglePromotionActive: (id: string) => void;
  togglePromotionFeatured: (id: string) => void;

  // Reviews
  reviews: Review[];
  replyReview: (reviewId: string, replyText: string) => void;

  // Wallet
  wallet: Wallet;
  transactions: WalletTransaction[];
  withdrawals: Withdrawal[];
  requestWithdrawal: (
    amount: number,
    method: WithdrawalMethod,
    destName: string,
    destNumber: string,
    recipientName: string
  ) => { success: boolean; error?: string };

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // UI & Global Controls
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  deviceView: 'mobile' | 'desktop';
  setDeviceView: (val: 'mobile' | 'desktop') => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;

  // Registration & Account Lifecycle
  registrationData: MerchantRegistrationData;
  updateRegistrationStatus: (status: RegistrationVerificationStatus, reason?: string) => void;
  submitMerchantRegistration: (data: Omit<MerchantRegistrationData, 'id' | 'status' | 'submittedAt'>) => void;

  // Mode live (tersambung ke Supabase / panel admin)
  isLive: boolean;
  liveStatus: LiveStatus;
  liveReason?: string;
  signInEmail: (email: string, password: string) => Promise<boolean>;
  registerAccount: (email: string, password: string, form: api.RegisterForm) => Promise<boolean>;
  signOutLive: () => Promise<void>;
  refreshLive: () => Promise<void>;

  // Toast
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('desktop');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data
  const [merchant, setMerchant] = useState<Merchant>(LIVE ? api.EMPTY_MERCHANT : INITIAL_MERCHANT);
  const [stores, setStores] = useState<Store[]>(LIVE ? [api.EMPTY_STORE] : INITIAL_STORES);
  const [currentStoreId, setCurrentStoreId] = useState<string>(LIVE ? api.EMPTY_STORE.id : INITIAL_STORES[0].id);
  const [products, setProducts] = useState<Product[]>(LIVE ? [] : INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<ProductCategory[]>(LIVE ? api.LIVE_CATEGORIES.map((n) => ({ id: n, storeId: '', name: n })) : INITIAL_CATEGORIES);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(LIVE ? [] : INITIAL_STOCK_ADJUSTMENTS);
  const [orders, setOrders] = useState<Order[]>(LIVE ? [] : INITIAL_ORDERS);
  const [promotions, setPromotions] = useState<Promotion[]>(LIVE ? [] : INITIAL_PROMOTIONS);
  const [wallet, setWallet] = useState<Wallet>(LIVE ? { id: 'w-live', merchantId: '', availableBalance: 0, pendingBalance: 0, withdrawableBalance: 0 } : INITIAL_WALLET);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(LIVE ? [] : INITIAL_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(LIVE ? [] : INITIAL_WITHDRAWALS);
  const [reviews, setReviews] = useState<Review[]>(LIVE ? [] : INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(LIVE ? [] : INITIAL_NOTIFICATIONS);

  // Initial Registration Record for Arjawinangun local merchant (Warung Bu Iis - M1)
  const [registrationData, setRegistrationData] = useState<MerchantRegistrationData>({
    id: 'M1',
    ownerName: 'Imas S.',
    ownerPhone: '0813-1037-1053',
    isPhoneOtpVerified: true,
    email: 'warung.bu.iis@mail.id',
    password: '••••••••',
    passwordConfirmation: '••••••••',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    storeName: 'Warung Bu Iis',
    storeCategory: 'Warung Makan & Kuliner Tradisional',
    storeWhatsapp: '081310371053',
    storeLogoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    storeDescription: 'Nasi jamblang komplit daun jati, empal gentong kuah santan gurih, tahu gejrot khas Cirebon, es teh manis segar.',
    productTypes: ['Makanan Siap Saji / Lauk Pauk', 'Minuman Dingin & Hangat', 'Camilan & Kerupuk Tradisional'],
    fullAddress: 'Jl. Ki Hajar Dewantara No. 8, Arjawinangun',
    village: 'Jungjang',
    district: 'Arjawinangun',
    gpsLocation: {
      lat: -6.6508,
      lng: 108.4124,
      label: 'Jl. Ki Hajar Dewantara No. 8, Arjawinangun, Cirebon',
    },
    openingHours: '07:00',
    closingHours: '21:00',
    operationalDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    ktpPhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    agreedToTerms: true,
    status: 'Disetujui',
    submittedAt: '2026-03-28T09:15:00Z',
  });

  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0];

  // Helper Toast
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync with Live AWD Backend API (/api/v1/data)
  const syncWithBackend = useCallback(async () => {
    if (LIVE) return;
    try {
      const res = await fetch('/api/v1/data');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      // 1. Check M1 merchant verification and store status
      const m1 = data.D?.find((d: any) => d.id === 'M1' || (d.t === 'merchant' && (d.name.includes('Bu Iis') || d.name.includes('Bu Siti'))));
      if (m1) {
        if (m1.x?.vf) {
          const mappedStatus: RegistrationVerificationStatus =
            m1.x.vf === 'Disetujui' ? 'Disetujui' : m1.x.vf === 'Ditolak' ? 'Ditolak' : 'Menunggu Verifikasi';
          setRegistrationData((prev) => ({
            ...prev,
            status: mappedStatus,
            rejectionReason: m1.x.alasan,
          }));
          setMerchant((prev) => ({
            ...prev,
            status: mappedStatus === 'Disetujui' ? 'Verified' : mappedStatus === 'Ditolak' ? 'Rejected' : 'Pending',
          }));
          setStores((prev) =>
            prev.map((s) => ({
              ...s,
              isVerified: mappedStatus === 'Disetujui',
              operationalStatus: m1.s === 'Buka' ? 'Open' : m1.s === 'Tutup' ? 'Closed' : s.operationalStatus,
            }))
          );
        }
      }

      // 2. Sync Products for M1
      if (data.PR && data.PR['M1'] && Array.isArray(data.PR['M1']) && data.PR['M1'].length > 0) {
        setProducts((prev) => {
          const backendPrds = data.PR['M1'];
          return prev.map((p) => {
            const match = backendPrds.find((bp: any) => bp.id === p.id || bp.n === p.name);
            if (match) {
              return {
                ...p,
                price: Number(match.h) || p.price,
                stock: match.st !== undefined ? Number(match.st) : p.stock,
                status: Number(match.st) <= 0 ? 'OutOfStock' : (match.on === 0 ? 'Inactive' : 'Active'),
              };
            }
            return p;
          });
        });
      }

      // 3. Sync Orders
      if (data.O && Array.isArray(data.O)) {
        setOrders((prev) =>
          prev.map((ord) => {
            const match = data.O.find((bo: any) => bo.id === ord.id);
            if (match) {
              const statusMap: Record<string, OrderStatus> = {
                'Baru': 'New',
                'Diproses': 'Preparing',
                'Siap Diambil': 'ReadyForPickup',
                'Diantar': 'OnDelivery',
                'Selesai': 'Delivered',
                'Dibatalkan': 'Cancelled',
              };
              const mappedStatus = statusMap[match.s] || ord.status;
              const updated = { ...ord, status: mappedStatus };
              if (match.d && (!ord.assignedDriver || ord.assignedDriver.name !== match.d)) {
                updated.assignedDriver = {
                  id: 'drv_' + match.d.replace(/\s+/g, '_').toLowerCase(),
                  name: match.d,
                  phone: '0812-1000-8640',
                  vehicleNumber: 'E 2131 AB',
                  vehicleType: 'Motor AWD',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  rating: 4.8,
                };
              }
              return updated;
            }
            return ord;
          })
        );
      }
    } catch (err) {
      // quiet fail for background polling
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 6000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  // ===== MODE LIVE: tersambung ke Supabase (database yang sama dengan panel admin & aplikasi pelanggan) =====
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(LIVE ? 'loading' : 'ready');
  const [liveReason, setLiveReason] = useState<string | undefined>(undefined);
  const driversRef = useRef<Map<string, DriverInfo>>(new Map());
  const ordersRef = useRef<Order[]>([]);
  const storeIdRef = useRef<string>('');
  const soundRef = useRef<boolean>(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => { ordersRef.current = orders; }, [orders]);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);

  const resetLive = () => {
    unsubRef.current?.();
    unsubRef.current = null;
    setMerchant(api.EMPTY_MERCHANT);
    setStores([api.EMPTY_STORE]);
    setCurrentStoreId(api.EMPTY_STORE.id);
    setProducts([]);
    setOrders([]);
    setNotifications([]);
  };

  const loadAll = async (authUser: any) => {
    const b = await api.fetchMyStore(authUser.id, authUser.email ?? '');
    if (!b) { setLiveStatus('noStore'); return; }
    setMerchant(b.merchant);
    setStores([b.store]);
    setCurrentStoreId(b.store.id);
    storeIdRef.current = b.store.id;
    setLiveReason(b.alasan);
    const status: LiveStatus = b.suspended ? 'suspended' : b.vf === 'Menunggu' ? 'pending' : b.vf === 'Ditolak' ? 'rejected' : 'ready';
    if (status !== 'ready') { setLiveStatus(status); return; }

    driversRef.current = await api.fetchDrivers();
    const [prods, ords] = await Promise.all([
      api.fetchProducts(b.merchant.id, b.store.id),
      api.fetchOrders(b.store.id, driversRef.current),
    ]);
    setProducts(prods);
    setOrders(ords);
    setLiveStatus('ready');

    unsubRef.current?.();
    unsubRef.current = api.subscribeOrders((row: any) => {
      const o = api.toOrder(row, storeIdRef.current, driversRef.current);
      const known = ordersRef.current.some((x) => x.id === o.id);
      setOrders((prev) => (prev.some((x) => x.id === o.id) ? prev.map((x) => (x.id === o.id ? o : x)) : [o, ...prev]));
      if (!known && o.status === 'New') {
        if (soundRef.current) playOrderNotificationSound();
        setNotifications((prev) => [{
          id: 'notif_' + o.id, title: 'Orderan Baru Masuk! 🔔',
          message: `Pesanan #${o.orderNumber} dari ${o.customerName} sebesar Rp${o.totalAmount.toLocaleString('id-ID')}`,
          type: 'NewOrder', isRead: false, timestamp: 'Baru saja', orderId: o.id,
        }, ...prev]);
        addToast('success', '🔔 Orderan Baru!', `Pesanan #${o.orderNumber} dari ${o.customerName}`);
      }
    });
  };

  useEffect(() => {
    if (!LIVE) return;
    let alive = true;
    api.getSession().then(async (session) => {
      if (!alive) return;
      if (!session) { setLiveStatus('loggedOut'); return; }
      try { await loadAll(session.user); } catch (e: any) { addToast('error', 'Gagal memuat data', api.friendlyError(e)); setLiveStatus('loggedOut'); }
    });
    const off = api.onAuthChange((event) => { if (event === 'SIGNED_OUT') { resetLive(); setLiveStatus('loggedOut'); } });
    return () => { alive = false; off(); unsubRef.current?.(); };
  }, []);

  // Saat menunggu persetujuan admin: cek status tiap 15 detik
  useEffect(() => {
    if (!LIVE || (liveStatus !== 'pending' && liveStatus !== 'rejected')) return;
    const t = setInterval(() => {
      api.getSession().then((s) => { if (s) loadAll(s.user).catch(() => {}); });
    }, 15000);
    return () => clearInterval(t);
  }, [liveStatus]);

  // Saldo = pendapatan bersih dari pesanan yang sudah selesai
  useEffect(() => {
    if (!LIVE) return;
    const done = orders.filter((o) => o.status === 'Completed');
    const active = orders.filter((o) => ['Accepted', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OnDelivery'].includes(o.status));
    const avail = done.reduce((a, o) => a + o.merchantNetAmount, 0);
    const pend = active.reduce((a, o) => a + o.merchantNetAmount, 0);
    setWallet({ id: 'w-live', merchantId: merchant.id, availableBalance: avail, pendingBalance: pend, withdrawableBalance: avail });
    setTransactions(done.map((o) => ({
      id: 'tx-' + o.id, walletId: 'w-live', type: 'SalesIncome' as const, amount: o.subtotal, fee: o.platformFee,
      netAmount: o.merchantNetAmount, referenceId: o.orderNumber,
      description: `Penjualan #${o.orderNumber} (${o.customerName})`, date: o.orderTime, status: 'Success' as const,
    })));
  }, [orders, merchant.id]);

  const signInEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await api.signIn(email.trim(), password);
      if (error) throw error;
      setLiveStatus('loading');
      await loadAll(data.user);
      return true;
    } catch (e: any) {
      setLiveStatus('loggedOut');
      addToast('error', 'Gagal masuk', api.friendlyError(e));
      return false;
    }
  };

  const registerAccount = async (email: string, password: string, form: api.RegisterForm): Promise<boolean> => {
    try {
      const { data, error } = await api.signUp(email.trim(), password);
      if (error) throw error;
      if (!data.session || !data.user) {
        addToast('info', 'Cek email Anda', 'Akun dibuat. Konfirmasi email dulu, lalu masuk.');
        return false;
      }
      await api.registerStore(form);
      setLiveStatus('loading');
      await loadAll(data.user);
      addToast('success', 'Pendaftaran terkirim', 'Toko Anda menunggu persetujuan admin AWD.');
      return true;
    } catch (e: any) {
      addToast('error', 'Pendaftaran gagal', api.friendlyError(e));
      return false;
    }
  };

  const signOutLive = async () => {
    await api.signOut();
    resetLive();
    setLiveStatus('loggedOut');
  };

  const refreshLive = async () => {
    const s = await api.getSession();
    if (!s) { setLiveStatus('loggedOut'); return; }
    try { await loadAll(s.user); } catch (e: any) { addToast('error', 'Gagal memuat', api.friendlyError(e)); }
  };

  const liveOrder = async (orderId: string, aksi: 'terima' | 'siapkan' | 'siap' | 'tolak', okTitle: string, okMsg: string, alasan = '') => {
    try {
      const row = await api.orderAction(orderId, aksi, alasan);
      const o = api.toOrder(row, storeIdRef.current, driversRef.current);
      setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x)));
      addToast('success', okTitle, okMsg);
    } catch (e: any) {
      addToast('error', 'Gagal memproses pesanan', api.friendlyError(e));
    }
  };

  const liveSaveProduct = async (next: ProductT, isNew: boolean, okTitle: string, okMsg: string) => {
    try {
      await api.saveProduct(merchant.id, next);
      setProducts((prev) => (isNew ? [next, ...prev] : prev.map((p) => (p.id === next.id ? next : p))));
      addToast('success', okTitle, okMsg);
    } catch (e: any) {
      addToast('error', 'Gagal menyimpan produk', api.friendlyError(e));
    }
  };

  // Update Merchant Status & Synchronize Registration State
  const updateMerchantStatus = (status: MerchantStatus) => {
    if (LIVE) { addToast('info', 'Diatur oleh admin', 'Status verifikasi toko ditentukan oleh admin AWD.'); return; }
    setMerchant((prev) => ({ ...prev, status }));
    setStores((prev) =>
      prev.map((s) => (s.merchantId === merchant.id ? { ...s, isVerified: status === 'Verified' } : s))
    );
    
    // Sync Indonesian registration status
    const mappedRegStatus: RegistrationVerificationStatus =
      status === 'Verified' ? 'Disetujui' : status === 'Pending' ? 'Menunggu Verifikasi' : 'Ditolak';
    setRegistrationData((prev) => ({
      ...prev,
      status: mappedRegStatus,
      reviewedAt: new Date().toISOString(),
      rejectionReason: status === 'Rejected' ? 'Verifikasi berkas belum memenuhi persyaratan standar kepatuhan AWD.' : undefined,
    }));

    // Notify backend
    fetch('/api/v1/pengguna/M1/verifikasi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: mappedRegStatus }),
    }).catch(() => {});

    addToast('info', 'Status Mitra Diperbarui', `Status merchant: ${status} (${mappedRegStatus})`);
  };

  // Update Registration Status lifecycle explicitly
  const updateRegistrationStatus = (status: RegistrationVerificationStatus, reason?: string) => {
    if (LIVE) { addToast('info', 'Diatur oleh admin', 'Persetujuan toko dilakukan oleh admin AWD.'); return; }
    setRegistrationData((prev) => ({
      ...prev,
      status,
      reviewedAt: new Date().toISOString(),
      rejectionReason: status === 'Ditolak' ? (reason || 'Foto KTP tidak terbaca jelas atau koordinat GPS berada di luar jangkauan pengantaran.') : undefined,
    }));

    if (status === 'Disetujui') {
      setMerchant((prev) => ({ ...prev, status: 'Verified' }));
      setStores((prev) =>
        prev.map((s) => ({ ...s, isVerified: true }))
      );
      addToast('success', 'Pendaftaran Disetujui!', 'Selamat! Akun warung telah disetujui. Toko siap menerima pesanan, kelola stok & pencairan dana.');
    } else if (status === 'Menunggu Verifikasi') {
      setMerchant((prev) => ({ ...prev, status: 'Pending' }));
      setStores((prev) =>
        prev.map((s) => ({ ...s, isVerified: false }))
      );
      addToast('info', 'Status: Menunggu Verifikasi', 'Pengajuan pendaftaran sedang ditinjau oleh Tim Operasional AWD Arjawinangun.');
    } else {
      setMerchant((prev) => ({ ...prev, status: 'Rejected' }));
      setStores((prev) =>
        prev.map((s) => ({ ...s, isVerified: false }))
      );
      addToast('error', 'Pendaftaran Ditolak', reason || 'Periksa kembali dokumen KTP dan titik GPS lokasi warung Anda.');
    }

    // Persist verification change to backend API
    fetch('/api/v1/pengguna/M1/verifikasi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, alasan: reason }),
    }).catch((err) => console.warn('Verification sync failed:', err));
  };

  // Submit New Merchant Registration Form
  const submitMerchantRegistration = (data: Omit<MerchantRegistrationData, 'id' | 'status' | 'submittedAt'>) => {
    if (LIVE) return;
    const newId = 'reg_' + Date.now();
    const newReg: MerchantRegistrationData = {
      ...data,
      id: newId,
      status: 'Menunggu Verifikasi',
      submittedAt: new Date().toISOString(),
    };
    setRegistrationData(newReg);

    // Update merchant profile with owner info
    setMerchant((prev) => ({
      ...prev,
      ownerName: data.ownerName,
      phone: data.ownerPhone,
      email: data.email || prev.email,
      status: 'Pending',
      verificationDocs: {
        ...prev.verificationDocs,
        ktpUrl: data.ktpPhotoUrl || prev.verificationDocs.ktpUrl,
        submittedAt: new Date().toISOString(),
      },
    }));

    // Create and add new store into store list
    const newStoreId = 'str_' + Date.now();
    const createdStore: Store = {
      id: newStoreId,
      merchantId: merchant.id,
      name: data.storeName,
      description: data.storeDescription || `Warung kuliner & usaha lokal di ${data.village}, ${data.district}.`,
      logoUrl: data.storeLogoUrl,
      bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      address: `${data.fullAddress}, Desa ${data.village}, Kec. ${data.district}, Cirebon`,
      latitude: data.gpsLocation.lat,
      longitude: data.gpsLocation.lng,
      phone: data.ownerPhone,
      whatsapp: data.storeWhatsapp || data.ownerPhone,
      openingHours: data.openingHours,
      closingHours: data.closingHours,
      deliveryRadiusKm: 7,
      category: data.storeCategory.includes('Kuliner') || data.storeCategory.includes('Warung Makan') ? 'Restaurant' : 'UMKM',
      operationalStatus: 'Open',
      isVerified: false,
      rating: 5.0,
      reviewCount: 0,
    };

    setStores((prev) => [createdStore, ...prev]);
    setCurrentStoreId(newStoreId);

    // Send to AWD backend API /api/v1/auth/register
    fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err) => console.warn('Registration backend sync notice:', err));

    addToast(
      'success',
      'Pendaftaran Berhasil Dikirim!',
      `Warung "${data.storeName}" berhasil didaftarkan. Status: Menunggu Verifikasi.`
    );
  };

  // Update Current Store Info
  const updateCurrentStore = (data: Partial<Store>) => {
    if (LIVE) {
      void (async () => {
        try {
          if (data.operationalStatus) await api.setStoreOpen(data.operationalStatus === 'Open');
          const jam = data.openingHours || data.closingHours
            ? `${(data.openingHours ?? currentStore.openingHours).replace(':', '.')}-${(data.closingHours ?? currentStore.closingHours).replace(':', '.')}`
            : undefined;
          if (data.address !== undefined || data.phone !== undefined || data.description !== undefined || jam) {
            await api.updateStoreProfile({ alamat: data.address, hp: data.phone, jam, deskripsi: data.description });
          }
          setStores((prev) => prev.map((s) => (s.id === currentStore.id ? { ...s, ...data } : s)));
          addToast('success', 'Toko Diperbarui', 'Perubahan toko tersimpan di server.');
        } catch (e: any) {
          addToast('error', 'Gagal menyimpan toko', api.friendlyError(e));
        }
      })();
      return;
    }
    setStores((prev) => prev.map((s) => (s.id === currentStore.id ? { ...s, ...data } : s)));
    if (data.operationalStatus) {
      fetch('/api/v1/pengguna/merchant/M1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s: data.operationalStatus === 'Open' ? 'Buka' : 'Tutup' }),
      }).catch(() => {});
    }
    addToast('success', 'Toko Diperbarui', 'Informasi operasional toko berhasil disimpan.');
  };

  // Counts
  const activeOrdersCount = orders.filter((o) =>
    ['Accepted', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OnDelivery'].includes(o.status)
  ).length;
  const newOrdersCount = orders.filter((o) => o.status === 'New').length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Order Actions
  const acceptOrder = (orderId: string) => {
    if (LIVE) { void liveOrder(orderId, 'terima', 'Pesanan Diterima', 'Pesanan masuk ke tahap persiapan.'); return; }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Accepted' as OrderStatus } : o))
    );
    fetch(`/api/v1/pesanan/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Diproses' }),
    }).catch(() => {});
    addToast('success', 'Pesanan Diterima', 'Pesanan masuk ke tahap persiapan dapur.');
  };

  const rejectOrder = (orderId: string, reason: string) => {
    if (LIVE) { void liveOrder(orderId, 'tolak', 'Pesanan Ditolak', 'Pesanan dibatalkan dan pelanggan diberi tahu.', reason); return; }
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      // Return reserved stock
      target.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? { ...p, reservedStock: Math.max(0, p.reservedStock - item.quantity) }
              : p
          )
        );
      });
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'Cancelled' as OrderStatus, rejectReason: reason } : o
      )
    );
    fetch(`/api/v1/pesanan/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Dibatalkan' }),
    }).catch(() => {});
    addToast('info', 'Pesanan Ditolak', `Pesanan telah dibatalkan: ${reason}`);
  };

  const markPreparing = (orderId: string) => {
    if (LIVE) { void liveOrder(orderId, 'siapkan', 'Sedang Disiapkan', 'Pesanan sedang disiapkan.'); return; }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Preparing' as OrderStatus } : o))
    );
    fetch(`/api/v1/pesanan/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Diproses' }),
    }).catch(() => {});
    addToast('info', 'Sedang Disiapkan', 'Pesanan dalam proses peracikan bumbu / masak.');
  };

  const markReadyForPickup = (orderId: string) => {
    if (LIVE) { void liveOrder(orderId, 'siap', 'Siap Diambil', 'Admin AWD akan menugaskan driver untuk penjemputan.'); return; }
    // Assign simulated driver
    const mockDriver = {
      id: 'drv_' + Math.floor(Math.random() * 1000),
      name: 'Agus Setiawan',
      phone: '085712349988',
      vehicleNumber: 'B 3821 TUL',
      vehicleType: 'Honda Vario 160 Putih',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'ReadyForPickup' as OrderStatus,
              assignedDriver: mockDriver,
            }
          : o
      )
    );
    fetch(`/api/v1/pesanan/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Diantar', driver: mockDriver.name }),
    }).catch(() => {});
    addToast('success', 'Siap Diambil Driver', 'Driver AWD telah dihubungi untuk penjemputan.');
  };

  const completeOrder = (orderId: string) => {
    if (LIVE) { addToast('info', 'Diselesaikan driver/admin', 'Pesanan ditandai selesai setelah diantar ke pelanggan.'); return; }
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Deduct stock permanently and remove reserved
    order.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            const nextStock = Math.max(0, p.stock - item.quantity);
            const nextReserved = Math.max(0, p.reservedStock - item.quantity);
            return {
              ...p,
              stock: nextStock,
              reservedStock: nextReserved,
              status: nextStock <= 0 ? 'OutOfStock' : p.status,
            };
          }
          return p;
        })
      );
    });

    // Financials & Wallet update
    const netEarnings = order.merchantNetAmount;
    const platformFee = order.platformFee;

    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + netEarnings,
      withdrawableBalance: prev.withdrawableBalance + netEarnings,
    }));

    // Record transactions
    const txIncome: WalletTransaction = {
      id: 'tx_' + Date.now(),
      walletId: wallet.id,
      type: 'SalesIncome',
      amount: order.subtotal - order.discount,
      fee: platformFee,
      netAmount: netEarnings,
      referenceId: order.orderNumber,
      description: `Penjualan Selesai #${order.orderNumber} (${order.customerName})`,
      date: 'Baru saja',
      status: 'Success',
    };

    setTransactions((prev) => [txIncome, ...prev]);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Completed' as OrderStatus } : o))
    );

    fetch(`/api/v1/pesanan/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Selesai' }),
    }).catch(() => {});

    // Notification
    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: 'Pesanan Selesai!',
      message: `Pesanan #${order.orderNumber} selesai. Dana Rp${netEarnings.toLocaleString('id-ID')} masuk ke saldo dompet.`,
      type: 'OrderCompleted',
      isRead: false,
      timestamp: 'Baru saja',
      orderId: order.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast('success', 'Pesanan Selesai', `Pendapatan bersih ${netEarnings.toLocaleString('id-ID')} ditambahkan ke dompet.`);
  };

  // Simulate Incoming Order
  const simulateIncomingOrder = useCallback(() => {
    if (LIVE) return;
    if (currentStore.operationalStatus === 'Closed' || !currentStore.isVerified) {
      addToast('error', 'Toko Tidak Aktif', 'Toko sedang tutup atau belum terverifikasi. Tidak dapat menerima pesanan baru.');
      return;
    }

    const availableProducts = products.filter((p) => p.stock > 0);
    if (availableProducts.length === 0) return;

    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const qty = Math.min(randomProduct.stock, Math.floor(Math.random() * 2) + 1);
    const itemSubtotal = (randomProduct.discountPrice || randomProduct.price) * qty;

    const { platformFee, merchantNetAmount } = calculateOrderFinancials(itemSubtotal, 0);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const customerNames = ['Rizky Ramadhan', 'Annisa Putri', 'Fauzan Hidayat', 'Nadia Syahrini', 'Bayu Pratama'];
    const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber: `MA-${randomNum}`,
      storeId: currentStore.id,
      customerName: randomCustomer,
      customerPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      customerAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=150&q=80`,
      orderTime: 'Baru saja',
      items: [
        {
          id: 'itm_' + Date.now(),
          productId: randomProduct.id,
          productName: randomProduct.name,
          productImage: randomProduct.imageUrl,
          quantity: qty,
          unitPrice: randomProduct.discountPrice || randomProduct.price,
        },
      ],
      subtotal: itemSubtotal,
      discount: 0,
      deliveryFee: 10000,
      platformFee,
      totalAmount: itemSubtotal + 10000,
      merchantNetAmount,
      paymentMethod: 'GOPAY',
      deliveryAddress: 'Jl. Rasuna Said Kav. B4, Kuningan, Jakarta Selatan',
      distanceKm: 2.7,
      status: 'New',
      estimatedDeliveryMinutes: 20,
    };

    // Update reserved stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === randomProduct.id ? { ...p, reservedStock: p.reservedStock + qty } : p
      )
    );

    setOrders((prev) => [newOrder, ...prev]);

    // Ring sound
    if (soundEnabled) {
      playOrderNotificationSound();
    }

    // Add notification
    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: 'Orderan Baru Masuk! 🔔',
      message: `Pesanan #${newOrder.orderNumber} dari ${newOrder.customerName} sebesar Rp${newOrder.totalAmount.toLocaleString('id-ID')}`,
      type: 'NewOrder',
      isRead: false,
      timestamp: 'Baru saja',
      orderId: newOrder.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast('success', '🔔 Orderan Baru!', `Pesanan #${newOrder.orderNumber} dari ${newOrder.customerName}`);
  }, [currentStore, products, soundEnabled, addToast]);

  // Auto simulate interval
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      simulateIncomingOrder();
    }, 45000);
    return () => clearInterval(interval);
  }, [autoSimulate, simulateIncomingOrder]);

  // Product Actions
  const addProduct = (item: Omit<Product, 'id' | 'createdAt' | 'reservedStock'>) => {
    if (LIVE) {
      const np: Product = { ...item, id: api.newProductId(), reservedStock: 0, createdAt: new Date().toISOString() };
      void liveSaveProduct(np, true, 'Produk Ditambahkan', `Produk "${item.name}" tampil di aplikasi pelanggan.`);
      return;
    }
    const newProd: Product = {
      ...item,
      id: 'prd_' + Date.now(),
      reservedStock: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);

    // Sync with backend API
    fetch('/api/v1/produk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId: 'M1',
        n: item.name,
        k: item.categoryId,
        h: item.price,
        st: item.stock,
        d: item.description,
        img: item.imageUrl,
      }),
    }).catch(() => {});

    addToast('success', 'Produk Ditambahkan', `Produk "${item.name}" berhasil dipublikasikan.`);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    if (LIVE) {
      const cur = products.find((p) => p.id === id);
      if (cur) void liveSaveProduct({ ...cur, ...data }, false, 'Produk Diperbarui', 'Perubahan produk tersimpan.');
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    fetch(`/api/v1/produk/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
    addToast('success', 'Produk Diperbarui', 'Perubahan produk berhasil disimpan.');
  };

  const deleteProduct = (id: string) => {
    if (LIVE) {
      const prod = products.find((p) => p.id === id);
      void (async () => {
        try {
          await api.deleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          addToast('info', 'Produk Dihapus', `Produk "${prod?.name || ''}" dihapus dari etalase.`);
        } catch (e: any) { addToast('error', 'Gagal menghapus', api.friendlyError(e)); }
      })();
      return;
    }
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/v1/produk/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
    addToast('info', 'Produk Dihapus', `Produk "${prod?.name || ''}" telah dihapus dari etalase.`);
  };

  const duplicateProduct = (id: string) => {
    if (LIVE) {
      const t = products.find((p) => p.id === id);
      if (t) void liveSaveProduct({ ...t, id: api.newProductId(), name: `${t.name} (Salinan)`, createdAt: new Date().toISOString() }, true, 'Produk Diduplikasi', `Salinan "${t.name}" dibuat.`);
      return;
    }
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const cloned: Product = {
      ...target,
      id: 'prd_' + Date.now(),
      name: `${target.name} (Salinan)`,
      sku: `${target.sku}-CPY`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [cloned, ...prev]);
    addToast('success', 'Produk Diduplikasi', `Salinan produk "${target.name}" berhasil dibuat.`);
  };

  // Stock Adjustment
  const adjustStock = (
    productId: string,
    type: 'Addition' | 'Reduction' | 'Adjustment',
    amount: number,
    reason: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (LIVE) {
      let ns = prod.stock;
      if (type === 'Addition') ns += amount;
      else if (type === 'Reduction') ns = Math.max(0, ns - amount);
      else ns = Math.max(0, amount);
      const st: ProductStatus = ns <= 0 ? 'OutOfStock' : prod.status === 'OutOfStock' ? 'Active' : prod.status;
      void liveSaveProduct({ ...prod, stock: ns, status: st }, false, 'Stok Diperbarui', `Stok "${prod.name}" kini ${ns}.`);
      return;
    }

    let nextStock = prod.stock;
    if (type === 'Addition') nextStock += amount;
    else if (type === 'Reduction') nextStock = Math.max(0, nextStock - amount);
    else if (type === 'Adjustment') nextStock = Math.max(0, amount);

    const log: StockAdjustment = {
      id: 'adj_' + Date.now(),
      productId,
      productName: prod.name,
      type,
      amount,
      previousStock: prod.stock,
      newStock: nextStock,
      reason,
      timestamp: new Date().toISOString(),
    };

    setStockAdjustments((prev) => [log, ...prev]);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: nextStock,
              status: nextStock <= 0 ? 'OutOfStock' : p.status === 'OutOfStock' ? 'Active' : p.status,
            }
          : p
      )
    );

    // Alert if low stock
    if (nextStock < 5 && nextStock > 0 && soundEnabled) {
      playAlertSound();
      const alertNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: 'Peringatan Stok Rendah',
        message: `Stok "${prod.name}" tersisa ${nextStock} item.`,
        type: 'LowStock',
        isRead: false,
        timestamp: 'Baru saja',
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    // Sync with backend API
    fetch(`/api/v1/produk/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ st: nextStock }),
    }).catch(() => {});

    addToast('success', 'Stok Diperbarui', `Stok "${prod.name}" kini menjadi ${nextStock}.`);
  };

  // Promotions Actions
  const addPromotion = (promo: Omit<Promotion, 'id' | 'usageCount'>) => {
    const newPromo: Promotion = {
      ...promo,
      id: 'prm_' + Date.now(),
      usageCount: 0,
    };
    setPromotions((prev) => [newPromo, ...prev]);
    addToast('success', 'Promosi Dibuat', `Promo "${promo.title}" berhasil diaktifkan.`);
  };

  const togglePromotionActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const togglePromotionFeatured = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  // Review Actions
  const replyReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              merchantReply: replyText,
              replyDate: 'Hari ini',
            }
          : r
      )
    );
    addToast('success', 'Balasan Terkirim', 'Balasan ulasan berhasil disampaikan ke pelanggan.');
  };

  // Wallet Withdrawal Request
  const requestWithdrawal = (
    amount: number,
    method: WithdrawalMethod,
    destName: string,
    destNumber: string,
    recipientName: string
  ): { success: boolean; error?: string } => {
    if (LIVE) {
      addToast('info', 'Segera hadir', 'Penarikan dana belum tersedia. Hubungi admin AWD untuk pencairan.');
      return { success: false, error: 'Penarikan dana belum tersedia.' };
    }
    const check = validateWithdrawal(amount, wallet.withdrawableBalance);
    if (!check.valid) {
      addToast('error', 'Gagal Tarik Saldo', check.error || 'Nominal tidak memenuhi ketentuan.');
      return { success: false, error: check.error };
    }

    const totalDeducted = amount + WITHDRAWAL_FEE;
    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - totalDeducted,
      withdrawableBalance: prev.withdrawableBalance - totalDeducted,
    }));

    const newWd: Withdrawal = {
      id: 'wd_' + Date.now(),
      walletId: wallet.id,
      amount,
      fee: WITHDRAWAL_FEE,
      netAmount: amount,
      method,
      destinationName: destName,
      destinationNumber: destNumber,
      recipientName,
      status: 'Approved',
      requestedAt: new Date().toISOString(),
    };

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      walletId: wallet.id,
      type: 'Withdrawal',
      amount,
      fee: WITHDRAWAL_FEE,
      netAmount: -totalDeducted,
      referenceId: newWd.id,
      description: `Penarikan Saldo ke ${destName} (${destNumber})`,
      date: 'Baru saja',
      status: 'Success',
    };

    setWithdrawals((prev) => [newWd, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      'success',
      'Pencairan Diproses',
      `Penarikan dana Rp${amount.toLocaleString('id-ID')} ke ${destName} sedang ditransfer.`
    );
    return { success: true };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'Notifikasi Dibaca', 'Semua notifikasi ditandai telah dibaca.');
  };

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        updateMerchantStatus,
        stores,
        currentStore,
        setCurrentStoreId,
        updateCurrentStore,
        orders,
        activeOrdersCount,
        newOrdersCount,
        acceptOrder,
        rejectOrder,
        markPreparing,
        markReadyForPickup,
        completeOrder,
        simulateIncomingOrder,
        autoSimulate,
        setAutoSimulate,
        soundEnabled,
        setSoundEnabled,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        stockAdjustments,
        adjustStock,
        promotions,
        addPromotion,
        togglePromotionActive,
        togglePromotionFeatured,
        reviews,
        replyReview,
        wallet,
        transactions,
        withdrawals,
        requestWithdrawal,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeTab,
        setActiveTab,
        isDarkMode,
        setIsDarkMode,
        deviceView,
        setDeviceView,
        isOffline,
        setIsOffline,
        isLive: LIVE,
        liveStatus,
        liveReason,
        signInEmail,
        registerAccount,
        signOutLive,
        refreshLive,
        registrationData,
        updateRegistrationStatus,
        submitMerchantRegistration,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = (): MerchantContextType => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};
