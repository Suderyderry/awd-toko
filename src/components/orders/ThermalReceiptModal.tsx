import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  FileText,
  Sliders,
  UtensilsCrossed,
  Receipt,
  Download,
  Share2,
} from 'lucide-react';
import type { Order, Store } from '../../types/index.ts';
import { formatRupiah } from '../../utils/merchantLogic.ts';
import {
  generateThermalReceiptText,
  ThermalPaperWidth,
} from '../../utils/thermalReceipt.ts';

interface ThermalReceiptModalProps {
  order: Order | null;
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  store,
  isOpen,
  onClose,
  onToast,
}) => {
  const [paperWidth, setPaperWidth] = useState<ThermalPaperWidth>(58);
  const [receiptType, setReceiptType] = useState<'customer' | 'kitchen'>('customer');
  const [copies, setCopies] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !order) return null;

  const rawText = generateThermalReceiptText(order, store, paperWidth, receiptType);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    onToast('success', 'Teks ESC/POS Tersalin', 'Format struk teks monospaced siap dikirim ke Bluetooth printer.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
    onToast('info', 'Mencetak Struk', `Mencetak ${copies}x nota thermal ${paperWidth}mm...`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Print stylesheet injected dynamically for flawless thermal paper printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-printable,
          #thermal-receipt-printable * {
            visibility: visible !important;
          }
          #thermal-receipt-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperWidth === 58 ? '58mm' : '80mm'} !important;
            max-width: ${paperWidth === 58 ? '58mm' : '80mm'} !important;
            margin: 0 !important;
            padding: 3mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
          @page {
            size: ${paperWidth === 58 ? '58mm' : '80mm'} auto;
            margin: 0mm;
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-4"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Cetak Nota Thermal Printer (AWD POS)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {paperWidth}mm POS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Struk kasir siap cetak via Bluetooth / USB Thermal Printer (Panda, Eppos, Iware, Sunmi, Xprinter)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="p-3.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Paper Width (58mm vs 80mm) */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[11px] font-bold px-2 text-slate-400">Lebar Kertas:</span>
            <button
              onClick={() => setPaperWidth(58)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                paperWidth === 58
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              58mm (Standar)
            </button>
            <button
              onClick={() => setPaperWidth(80)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                paperWidth === 80
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              80mm (Lebar)
            </button>
          </div>

          {/* Receipt Type (Customer vs Kitchen Ticket) */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setReceiptType('customer')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                receiptType === 'customer'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Struk Pelanggan</span>
            </button>
            <button
              onClick={() => setReceiptType('kitchen')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                receiptType === 'kitchen'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Nota Dapur (KOT)</span>
            </button>
          </div>

          {/* Copies */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Rangkap:</span>
            <select
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value={1}>1 Lembar</option>
              <option value={2}>2 Lembar (Customer + Dapur)</option>
              <option value={3}>3 Lembar</option>
            </select>
          </div>
        </div>

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950/80 flex items-start justify-center">
          {/* Realistic High-Contrast Thermal Paper Card */}
          <div
            id="thermal-receipt-printable"
            style={{ width: paperWidth === 58 ? '320px' : '420px' }}
            className="bg-[#FFFDF9] text-slate-950 font-mono text-[11px] sm:text-xs p-5 rounded-sm shadow-xl border border-slate-200 transition-all select-text leading-tight tracking-tight relative"
          >
            {/* Serrated tear line accent at top with AWD official logo */}
            <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-center flex flex-col items-center">
              <img
                src="/assets/aistudio/Designer_b056b7f0.png"
                alt="AWD Arjawinangun Delivery"
                className="w-14 h-14 object-contain mb-1.5 contrast-125 filter grayscale hover:grayscale-0 transition-all"
              />
              <h2 className="font-black text-sm sm:text-base tracking-wider uppercase text-slate-900">
                AWD • ARJAWINANGUN DELIVERY
              </h2>
              <p className="font-extrabold text-xs sm:text-sm mt-0.5 uppercase tracking-wide">
                {store.name}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">{store.address}</p>
              <p className="text-[10px] text-slate-600">Telp/WA: {store.phone}</p>
            </div>

            {/* Receipt Type Pill */}
            <div className="py-1 text-center font-black tracking-widest text-xs border-y-2 border-slate-950 my-2">
              {receiptType === 'kitchen' ? '*** NOTA DAPUR (KOT) ***' : 'STRUK PEMBAYARAN RESMI'}
            </div>

            {/* Order Meta Info */}
            <div className="space-y-1 py-1.5 border-b border-dashed border-slate-300 text-[11px]">
              <div className="flex justify-between font-black text-xs sm:text-sm">
                <span>NO. PESANAN:</span>
                <span className="bg-slate-950 text-white px-1.5 py-0.5 rounded">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Pesan:</span>
                <span>{order.orderTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>No. Telp:</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="font-extrabold">{order.paymentMethod}</span>
              </div>
              {order.assignedDriver && (
                <div className="flex justify-between text-purple-900 font-bold">
                  <span>Driver:</span>
                  <span>{order.assignedDriver.name} ({order.assignedDriver.vehicleNumber})</span>
                </div>
              )}
            </div>

            {/* Delivery Destination */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
              <span className="font-bold">Alamat Pengantaran:</span>
              <p className="italic mt-0.5 leading-relaxed">{order.deliveryAddress}</p>
            </div>

            {/* Items Ordered Header */}
            <div className="py-1.5 font-bold border-b border-slate-950 flex justify-between mt-1 text-[11px]">
              <span>ITEM MENU</span>
              {receiptType === 'customer' && <span>TOTAL</span>}
            </div>

            {/* Items Rows */}
            <div className="divide-y divide-dashed divide-slate-200 py-1 space-y-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="pt-1 text-[11px]">
                  <div className="flex justify-between items-baseline font-bold">
                    <span>
                      <span className="font-black text-xs mr-1">[{item.quantity}x]</span>
                      {item.productName}
                    </span>
                    {receiptType === 'customer' && (
                      <span className="font-black shrink-0 ml-2">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </span>
                    )}
                  </div>
                  {item.variantName && (
                    <div className="text-[10px] text-slate-600 pl-5">
                      Varian: {item.variantName}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-[10px] font-black bg-amber-100 p-1 rounded mt-0.5 pl-2 text-amber-950">
                      * CATATAN: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Summary (Only for customer receipt) */}
            {receiptType === 'customer' && (
              <div className="pt-2 border-t-2 border-slate-950 mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal Makanan:</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Diskon Promosi:</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim:</span>
                  <span>{formatRupiah(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Komisi Platform (10%):</span>
                  <span>-{formatRupiah(order.platformFee)}</span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between text-xs sm:text-sm font-black border-t-2 border-slate-950 pt-1.5 mt-1">
                  <span>TOTAL BAYAR:</span>
                  <span className="text-sm sm:text-base">{formatRupiah(order.totalAmount)}</span>
                </div>

                <div className="flex justify-between text-[11px] font-bold text-emerald-800 pt-0.5">
                  <span>Pendapatan Bersih Mitra:</span>
                  <span>{formatRupiah(order.merchantNetAmount)}</span>
                </div>
              </div>
            )}

            {/* Barcode Graphic Pattern simulation */}
            <div className="my-3 text-center border-t border-dashed border-slate-300 pt-3">
              <div className="h-9 w-4/5 mx-auto bg-slate-950 flex items-center justify-center text-white text-[9px] tracking-[6px] font-mono">
                || | |||| | ||| || ||| |
              </div>
              <p className="text-[9px] text-slate-500 mt-1">AWD-{order.orderNumber}-TRX</p>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-600 border-t-2 border-dashed border-slate-300 pt-2 space-y-0.5">
              <p className="font-bold">Terima Kasih Telah Berbelanja!</p>
              <p>Simpan struk ini sebagai bukti pembayaran sah.</p>
              <p className="text-[9px]">Layanan Pelanggan: 0813-1037-1053 • Arjawinangun Delivery</p>
              <div className="pt-2 text-slate-400 font-bold text-[9px]">
                - - - - - GUNTING DI SINI - - - - -
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRaw}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks ESC/POS'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tutup
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Cetak Nota Thermal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
