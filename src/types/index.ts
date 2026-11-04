/**
 * AWD Toko - Core Types & Data Models
 * Ekosistem Pasar & Pengantaran Lokal Arjawinangun Delivery (AWD)
 */

export type MerchantStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';

export type StoreCategory =
  | 'Restaurant'
  | 'Grocery'
  | 'Pharmacy'
  | 'Bakery'
  | 'Electronics'
  | 'Fashion'
  | 'UMKM'
  | string;

export type OperationalStatus = 'Open' | 'Closed' | 'Busy' | 'Holiday';

export type ProductStatus = 'Active' | 'Inactive' | 'OutOfStock';

export type OrderStatus =
  | 'New'
  | 'Accepted'
  | 'Preparing'
  | 'ReadyForPickup'
  | 'PickedUp'
  | 'OnDelivery'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type PaymentMethod =
  | 'GOPAY'
  | 'OVO'
  | 'DANA'
  | 'SHOPEEPAY'
  | 'QRIS'
  | 'CASH_ON_DELIVERY';

export type PromotionType =
  | 'Percentage'
  | 'Fixed'
  | 'FreeDelivery'
  | 'BOGO'
  | 'Voucher';

export type TransactionType =
  | 'SalesIncome'
  | 'PlatformCommission'
  | 'Withdrawal'
  | 'Refund';

export type WithdrawalMethod = 'BankTransfer' | 'EWallet';

export interface VerificationDocument {
  ktpUrl?: string;
  selfieUrl?: string;
  npwpUrl?: string;
  businessLicenseUrl?: string; // NIB / SIUP
  submittedAt?: string;
  rejectionReason?: string;
}

export interface Merchant {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  status: MerchantStatus;
  verificationDocs: VerificationDocument;
  createdAt: string;
}

export interface Store {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  openingHours: string;
  closingHours: string;
  deliveryRadiusKm: number;
  category: StoreCategory;
  operationalStatus: OperationalStatus;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
}

export interface StoreBranch {
  id: string;
  storeId: string;
  branchName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  isOpen: boolean;
}

export interface ProductCategory {
  id: string;
  storeId: string;
  name: string;
  icon?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
  stock: number;
  reservedStock: number;
  weightGrams: number;
  sku: string;
  status: ProductStatus;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'Addition' | 'Reduction' | 'Adjustment';
  amount: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  variantName?: string;
  notes?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  avatar: string;
  rating: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  orderTime: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number; // 10%
  totalAmount: number;
  merchantNetAmount: number; // subtotal - discount - platformFee
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  distanceKm: number;
  status: OrderStatus;
  assignedDriver?: DriverInfo;
  rejectReason?: string;
  estimatedDeliveryMinutes?: number;
}

export interface Promotion {
  id: string;
  storeId: string;
  title: string;
  description: string;
  type: PromotionType;
  discountValue: number; // % or Rp
  minPurchase: number;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  isActive: boolean;
  usageCount: number;
}

export interface Wallet {
  id: string;
  merchantId: string;
  availableBalance: number;
  pendingBalance: number;
  withdrawableBalance: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  referenceId: string;
  description: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
}

export interface Withdrawal {
  id: string;
  walletId: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: WithdrawalMethod;
  destinationName: string;
  destinationNumber: string;
  recipientName: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  requestedAt: string;
}

export interface Review {
  id: string;
  storeId: string;
  orderId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  orderDate: string;
  merchantReply?: string;
  replyDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'NewOrder' | 'OrderCompleted' | 'LowStock' | 'PromoExpired' | 'Review';
  isRead: boolean;
  timestamp: string;
  orderId?: string;
}

export interface SalesReport {
  date: string;
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
}

export type RegistrationVerificationStatus = 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak';

export interface MerchantRegistrationData {
  id: string;
  // 1. Data Pemilik & Akun
  ownerName: string; // Wajib
  ownerPhone: string; // Wajib
  isPhoneOtpVerified: boolean; // Wajib · OTP
  email?: string; // Opsional
  password: string; // Wajib
  passwordConfirmation: string; // Wajib
  ownerPhotoUrl?: string; // Opsional

  // 2. Data Warung / Toko
  storeName: string; // Wajib
  storeCategory: string; // Wajib
  storeWhatsapp?: string; // Opsional
  storeLogoUrl: string; // Wajib
  storeDescription?: string; // Opsional
  productTypes: string[]; // Wajib

  // 3. Alamat & Titik Lokasi
  fullAddress: string; // Wajib
  village: string; // Wajib (Desa / Kelurahan)
  district: string; // Wajib (Kecamatan)
  gpsLocation: {
    lat: number;
    lng: number;
    label?: string;
  }; // Wajib

  // 4. Operasional & Verifikasi Identitas
  openingHours: string; // Wajib
  closingHours: string; // Wajib
  operationalDays: string[]; // Wajib
  ktpPhotoUrl?: string; // Sesuai kebijakan verifikasi
  agreedToTerms: boolean; // Wajib

  // Status & Metadata
  status: RegistrationVerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

