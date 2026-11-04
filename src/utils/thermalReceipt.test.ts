import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLineWidth,
  centerText,
  twoColumnText,
  dividerLine,
  generateThermalReceiptText,
} from './thermalReceipt.ts';
import type { Order, Store } from '../types/index.ts';

const mockStore: Store = {
  id: 'str_001',
  merchantId: 'mch_001',
  name: 'Ayam Goreng Arja',
  description: 'Ayam krispi lezat',
  logoUrl: '',
  bannerUrl: '',
  address: 'Jl. Tebet Raya No. 42',
  latitude: -6.2,
  longitude: 106.8,
  phone: '081298765432',
  whatsapp: '6281298765432',
  openingHours: '08:00',
  closingHours: '22:00',
  deliveryRadiusKm: 8,
  category: 'Restaurant',
  operationalStatus: 'Open',
  isVerified: true,
  rating: 4.8,
  reviewCount: 100,
};

const mockOrder: Order = {
  id: 'ord_001',
  orderNumber: 'MA-9999',
  storeId: 'str_001',
  customerName: 'Budi Santoso',
  customerPhone: '08123456789',
  customerAvatar: '',
  orderTime: '10:30 WIB',
  items: [
    {
      id: 'itm_01',
      productId: 'prd_01',
      productName: 'Ayam Geprek',
      productImage: '',
      quantity: 2,
      unitPrice: 20000,
      variantName: 'Paha Atas',
      notes: 'Pedas level 5',
    },
  ],
  subtotal: 40000,
  discount: 5000,
  deliveryFee: 10000,
  platformFee: 3500,
  totalAmount: 45000,
  merchantNetAmount: 31500,
  paymentMethod: 'GOPAY',
  deliveryAddress: 'Jl. Casablanca No. 10',
  distanceKm: 2.5,
  status: 'Accepted',
};

test('getLineWidth returns correct character limits for 58mm and 80mm', () => {
  assert.equal(getLineWidth(58), 32);
  assert.equal(getLineWidth(80), 48);
});

test('centerText centers strings within line width', () => {
  const centered = centerText('TEST', 10);
  assert.equal(centered.length, 10);
  assert.equal(centered.trim(), 'TEST');
});

test('twoColumnText aligns left and right text cleanly', () => {
  const line = twoColumnText('Subtotal:', 'Rp40.000', 32);
  assert.equal(line.length, 32);
  assert.match(line, /^Subtotal:/);
  assert.match(line, /Rp40\.000$/);
});

test('dividerLine produces exact character width line', () => {
  assert.equal(dividerLine('=', 32).length, 32);
  assert.equal(dividerLine('-', 48).length, 48);
});

test('generateThermalReceiptText formats customer receipt with items and totals', () => {
  const receipt = generateThermalReceiptText(mockOrder, mockStore, 58, 'customer');
  assert.match(receipt, /ARJAWINANGUN DELIVERY/);
  assert.match(receipt, /AYAM GORENG ARJA/);
  assert.match(receipt, /MA-9999/);
  assert.match(receipt, /Budi Santoso/);
  assert.match(receipt, /Ayam Geprek/);
  assert.match(receipt, /Pedas level 5/);
  assert.match(receipt, /TOTAL BAYAR:/);
  assert.match(receipt, /GUNTING DI SINI/);
});

test('generateThermalReceiptText formats kitchen order ticket without financial totals', () => {
  const kot = generateThermalReceiptText(mockOrder, mockStore, 58, 'kitchen');
  assert.match(kot, /NOTA DAPUR \(KOT\)/);
  assert.match(kot, /\[2x\] Ayam Geprek/);
  assert.doesNotMatch(kot, /TOTAL BAYAR:/);
  assert.doesNotMatch(kot, /PENDAPATAN BERSIH:/);
});
