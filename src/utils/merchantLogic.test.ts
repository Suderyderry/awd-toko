import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  calculateOrderFinancials,
  calculateAvailableStock,
  isLowStock,
  isOutOfStock,
  canTransitionOrderStatus,
  canStoreReceiveOrders,
  validateWithdrawal,
  calculatePromotionDiscount,
  PLATFORM_COMMISSION_RATE,
  MIN_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_FEE,
} from './merchantLogic.ts';

test('formatRupiah formats numbers correctly', () => {
  assert.equal(formatRupiah(50000), 'Rp50.000');
  assert.equal(formatRupiah(0), 'Rp0');
  assert.equal(formatRupiah(1250500), 'Rp1.250.500');
});

test('calculateOrderFinancials correctly deducts 10% platform commission', () => {
  // Order of Rp 100.000 with 0 discount
  const result1 = calculateOrderFinancials(100000, 0);
  assert.equal(result1.subtotal, 100000);
  assert.equal(result1.platformFee, 10000); // 10%
  assert.equal(result1.merchantNetAmount, 90000);

  // Order with Rp 20.000 discount
  const result2 = calculateOrderFinancials(100000, 20000);
  assert.equal(result2.taxableAmount, 80000);
  assert.equal(result2.platformFee, 8000); // 10% of 80k
  assert.equal(result2.merchantNetAmount, 72000);
});

test('stock calculations and low-stock alerts', () => {
  assert.equal(calculateAvailableStock(10, 3), 7);
  assert.equal(calculateAvailableStock(2, 5), 0); // never negative

  assert.equal(isLowStock(4), true);
  assert.equal(isLowStock(5), false);
  assert.equal(isLowStock(0), false); // 0 is out of stock, not low
  assert.equal(isOutOfStock(0), true);
  assert.equal(isOutOfStock(-1), true);
  assert.equal(isOutOfStock(1), false);
});

test('order status transitions adhere to marketplace lifecycle', () => {
  assert.equal(canTransitionOrderStatus('New', 'Accepted'), true);
  assert.equal(canTransitionOrderStatus('New', 'Cancelled'), true);
  assert.equal(canTransitionOrderStatus('New', 'Completed'), false); // Cannot jump directly

  assert.equal(canTransitionOrderStatus('Accepted', 'Preparing'), true);
  assert.equal(canTransitionOrderStatus('Preparing', 'ReadyForPickup'), true);
  assert.equal(canTransitionOrderStatus('ReadyForPickup', 'PickedUp'), true);
  assert.equal(canTransitionOrderStatus('PickedUp', 'OnDelivery'), true);
  assert.equal(canTransitionOrderStatus('OnDelivery', 'Delivered'), true);
  assert.equal(canTransitionOrderStatus('Delivered', 'Completed'), true);

  assert.equal(canTransitionOrderStatus('Completed', 'New'), false);
  assert.equal(canTransitionOrderStatus('Cancelled', 'Accepted'), false);
});

test('store visibility and order eligibility rules', () => {
  // Unverified store cannot receive orders
  const unverified = canStoreReceiveOrders('Open', false);
  assert.equal(unverified.canReceive, false);

  // Closed store cannot receive orders
  const closed = canStoreReceiveOrders('Closed', true);
  assert.equal(closed.canReceive, false);

  // Holiday store cannot receive orders
  const holiday = canStoreReceiveOrders('Holiday', true);
  assert.equal(holiday.canReceive, false);

  // Open & verified store can receive orders
  const openVerified = canStoreReceiveOrders('Open', true);
  assert.equal(openVerified.canReceive, true);

  // Busy store can receive orders with warning
  const busyVerified = canStoreReceiveOrders('Busy', true);
  assert.equal(busyVerified.canReceive, true);
});

test('withdrawal validation validates min amount and Rp2.500 fee', () => {
  // Below minimum Rp50.000
  const belowMin = validateWithdrawal(40000, 200000);
  assert.equal(belowMin.valid, false);
  assert.match(belowMin.error || '', /Minimal penarikan/);

  // Insufficient balance to cover amount + Rp2.500 fee
  const insufficient = validateWithdrawal(100000, 101000); // 100k + 2.5k = 102.5k needed
  assert.equal(insufficient.valid, false);
  assert.match(insufficient.error || '', /Saldo tidak mencukupi/);

  // Valid withdrawal
  const valid = validateWithdrawal(100000, 150000);
  assert.equal(valid.valid, true);
  assert.equal(valid.fee, WITHDRAWAL_FEE);
  assert.equal(valid.netAmount, 100000);
});

test('promotion calculation logic', () => {
  // Minimum purchase check
  assert.equal(calculatePromotionDiscount('Percentage', 20, 50000, 30000), 0);

  // 20% discount on 100.000
  assert.equal(calculatePromotionDiscount('Percentage', 20, 50000, 100000), 20000);

  // Fixed discount 15.000
  assert.equal(calculatePromotionDiscount('Fixed', 15000, 50000, 60000), 15000);
});
