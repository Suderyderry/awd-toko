/**
 * AWD Toko - Pure Domain Logic & Rules
 * Covers 12% platform commission, Rp50k min withdrawal & Rp2.5k fee,
 * inventory triggers, store visibility, and order workflows.
 */

import type { OperationalStatus, OrderStatus, PromotionType } from '../types/index.ts';

export const PLATFORM_COMMISSION_RATE = 0.10; // 10% Platform Commission
export const MIN_WITHDRAWAL_AMOUNT = 50000;   // Rp50.000
export const WITHDRAWAL_FEE = 2500;           // Rp2.500
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Format Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp0';
  return 'Rp' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Calculate order financials with 10% platform fee deduction
 */
export function calculateOrderFinancials(subtotal: number, discount = 0) {
  const taxableAmount = Math.max(0, subtotal - discount);
  const platformFee = Math.round(taxableAmount * PLATFORM_COMMISSION_RATE);
  const merchantNetAmount = taxableAmount - platformFee;

  return {
    subtotal,
    discount,
    taxableAmount,
    platformFee,
    merchantNetAmount,
  };
}

/**
 * Available stock calculation
 */
export function calculateAvailableStock(currentStock: number, reservedStock: number): number {
  return Math.max(0, currentStock - reservedStock);
}

/**
 * Check if a product has low stock (< 5)
 */
export function isLowStock(stock: number): boolean {
  return stock > 0 && stock < LOW_STOCK_THRESHOLD;
}

/**
 * Check if product is out of stock
 */
export function isOutOfStock(stock: number): boolean {
  return stock <= 0;
}

/**
 * Validate order status transition state machine
 * Flow: New -> Accepted -> Preparing -> ReadyForPickup -> PickedUp -> OnDelivery -> Delivered -> Completed
 * Or Cancelled from New / Accepted
 */
export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (current === 'Completed' || current === 'Cancelled') return false;

  const validNextStates: Record<OrderStatus, OrderStatus[]> = {
    New: ['Accepted', 'Cancelled'],
    Accepted: ['Preparing', 'Cancelled'],
    Preparing: ['ReadyForPickup', 'Cancelled'],
    ReadyForPickup: ['PickedUp', 'Cancelled'],
    PickedUp: ['OnDelivery'],
    OnDelivery: ['Delivered'],
    Delivered: ['Completed'],
    Completed: [],
    Cancelled: [],
  };

  return validNextStates[current]?.includes(next) ?? false;
}

/**
 * Store visibility and order receipt rule:
 * - Only verified stores can receive orders
 * - Paused or closed or holiday stores cannot receive orders / hidden
 */
export function canStoreReceiveOrders(
  operationalStatus: OperationalStatus,
  isVerified: boolean
): { canReceive: boolean; reason?: string } {
  if (!isVerified) {
    return {
      canReceive: false,
      reason: 'Toko belum diverifikasi oleh Admin AWD.',
    };
  }

  if (operationalStatus === 'Closed') {
    return {
      canReceive: false,
      reason: 'Toko saat ini ditutup. Toko tidak muncul di pencarian pelanggan.',
    };
  }

  if (operationalStatus === 'Holiday') {
    return {
      canReceive: false,
      reason: 'Toko sedang libur operasional.',
    };
  }

  if (operationalStatus === 'Busy') {
    return {
      canReceive: true, // Can receive with delay warning
      reason: 'Toko sedang sibuk, waktu penyiapan makanan mungkin lebih lama.',
    };
  }

  return { canReceive: true };
}

/**
 * Validate withdrawal request against balance and minimum threshold
 */
export function validateWithdrawal(
  amount: number,
  withdrawableBalance: number
): {
  valid: boolean;
  error?: string;
  fee: number;
  netAmount: number;
} {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Masukkan nominal penarikan yang valid.', fee: WITHDRAWAL_FEE, netAmount: 0 };
  }

  if (amount < MIN_WITHDRAWAL_AMOUNT) {
    return {
      valid: false,
      error: `Minimal penarikan saldo adalah ${formatRupiah(MIN_WITHDRAWAL_AMOUNT)}.`,
      fee: WITHDRAWAL_FEE,
      netAmount: 0,
    };
  }

  const totalRequired = amount + WITHDRAWAL_FEE;
  if (totalRequired > withdrawableBalance) {
    return {
      valid: false,
      error: `Saldo tidak mencukupi untuk penarikan ${formatRupiah(amount)} + biaya admin ${formatRupiah(WITHDRAWAL_FEE)}. Saldo tersedia: ${formatRupiah(withdrawableBalance)}`,
      fee: WITHDRAWAL_FEE,
      netAmount: 0,
    };
  }

  return {
    valid: true,
    fee: WITHDRAWAL_FEE,
    netAmount: amount, // net deposited to bank/ewallet
  };
}

/**
 * Calculate promotion discount amount
 */
export function calculatePromotionDiscount(
  promoType: PromotionType,
  discountValue: number,
  minPurchase: number,
  cartTotal: number
): number {
  if (cartTotal < minPurchase) {
    return 0;
  }

  switch (promoType) {
    case 'Percentage':
      return Math.round((cartTotal * discountValue) / 100);
    case 'Fixed':
    case 'Voucher':
      return Math.min(cartTotal, discountValue);
    case 'FreeDelivery':
      return 10000; // standard delivery fee subsidy
    case 'BOGO':
      return Math.round(cartTotal * 0.5);
    default:
      return 0;
  }
}
