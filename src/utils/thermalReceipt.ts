/**
 * AWD Toko - Thermal Printer Receipt Formatter
 * Supports 58mm (32 chars) and 80mm (48 chars) ESC/POS thermal receipt formatting,
 * kitchen order tickets (KOT), and high-contrast printable thermal receipts.
 */

import type { Order, Store } from '../types/index.ts';
import { formatRupiah } from './merchantLogic.ts';

export type ThermalPaperWidth = 58 | 80;

export function getLineWidth(widthMm: ThermalPaperWidth): number {
  return widthMm === 58 ? 32 : 48;
}

export function centerText(text: string, width: number): string {
  if (text.length >= width) return text.substring(0, width);
  const leftPadding = Math.floor((width - text.length) / 2);
  const rightPadding = width - text.length - leftPadding;
  return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
}

export function twoColumnText(left: string, right: string, width: number): string {
  const availableSpace = width - right.length;
  if (availableSpace <= 0) {
    return left.substring(0, width);
  }
  if (left.length >= availableSpace) {
    const truncatedLeft = left.substring(0, availableSpace - 1) + ' ';
    return truncatedLeft + right;
  }
  const spaces = ' '.repeat(width - left.length - right.length);
  return left + spaces + right;
}

export function dividerLine(char = '-', width: number): string {
  return char.repeat(width);
}

/**
 * Generate monospaced plain text formatted for 58mm or 80mm thermal printer
 */
export function generateThermalReceiptText(
  order: Order,
  store: Store,
  widthMm: ThermalPaperWidth = 58,
  type: 'customer' | 'kitchen' = 'customer'
): string {
  const w = getLineWidth(widthMm);
  const lines: string[] = [];

  // Header
  lines.push(centerText('AWD - ARJAWINANGUN DELIVERY', w));
  lines.push(centerText('AWD TOKO - MITRA RESMI', w));
  lines.push(centerText(store.name.toUpperCase(), w));
  if (store.phone) {
    lines.push(centerText(`Telp/WA: ${store.phone}`, w));
  }
  lines.push(dividerLine('=', w));

  // Type Indicator
  if (type === 'kitchen') {
    lines.push(centerText('*** NOTA DAPUR (KOT) ***', w));
  } else {
    lines.push(centerText('STRUK PEMBAYARAN RESMI', w));
  }
  lines.push(dividerLine('-', w));

  // Order Info
  lines.push(twoColumnText('No. Pesanan:', order.orderNumber, w));
  lines.push(twoColumnText('Waktu:', order.orderTime, w));
  lines.push(twoColumnText('Pelanggan:', order.customerName, w));
  lines.push(twoColumnText('No. HP:', order.customerPhone, w));
  lines.push(twoColumnText('Pembayaran:', order.paymentMethod, w));

  if (order.assignedDriver) {
    lines.push(twoColumnText('Driver:', `${order.assignedDriver.name} (${order.assignedDriver.vehicleNumber})`, w));
  }

  // Delivery Address
  lines.push(dividerLine('-', w));
  lines.push('Alamat Pengantaran:');
  lines.push(order.deliveryAddress);
  lines.push(dividerLine('=', w));

  // Items
  lines.push(centerText('DAFTAR PESANAN', w));
  lines.push(dividerLine('-', w));

  order.items.forEach((item) => {
    const itemTotal = formatRupiah(item.unitPrice * item.quantity);
    const itemHeader = `${item.quantity}x ${item.productName}`;

    if (type === 'kitchen') {
      // Kitchen view: highlight quantity and notes, no prices needed
      lines.push(`[${item.quantity}x] ${item.productName}`);
    } else {
      lines.push(twoColumnText(itemHeader, itemTotal, w));
    }

    if (item.variantName) {
      lines.push(`   Varian: ${item.variantName}`);
    }
    if (item.notes) {
      lines.push(`   *CATATAN: ${item.notes}*`);
    }
  });

  lines.push(dividerLine('-', w));

  // Financials (Only on customer receipt)
  if (type === 'customer') {
    lines.push(twoColumnText('Subtotal Makanan:', formatRupiah(order.subtotal), w));
    if (order.discount > 0) {
      lines.push(twoColumnText('Diskon Toko:', `-${formatRupiah(order.discount)}`, w));
    }
    lines.push(twoColumnText('Ongkos Kirim:', formatRupiah(order.deliveryFee), w));
    lines.push(twoColumnText('Komisi Platform (10%):', `-${formatRupiah(order.platformFee)}`, w));
    lines.push(dividerLine('=', w));
    lines.push(twoColumnText('TOTAL BAYAR:', formatRupiah(order.totalAmount), w));
    lines.push(twoColumnText('PENDAPATAN BERSIH:', formatRupiah(order.merchantNetAmount), w));
    lines.push(dividerLine('=', w));
  }

  // Footer
  lines.push(centerText('Terima Kasih Telah Berbelanja', w));
  lines.push(centerText('Simpan struk ini sebagai bukti sah', w));
  lines.push(centerText('Arjawinangun Delivery • CS: 0813-1037-1053', w));
  lines.push(dividerLine('-', w));
  lines.push(centerText('--- GUNTING DI SINI ---', w));

  return lines.join('\n');
}
