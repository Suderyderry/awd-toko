import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Building2,
  Smartphone,
  AlertCircle,
  Clock,
  CheckCircle2,
  Shield,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  formatRupiah,
  MIN_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_FEE,
  validateWithdrawal,
} from '../../utils/merchantLogic.ts';
import { WithdrawalMethod } from '../../types/index.ts';

export const WalletView: React.FC = () => {
  const { wallet, transactions, withdrawals, requestWithdrawal, merchant, addToast } = useMerchant();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(MIN_WITHDRAWAL_AMOUNT);
  const [method, setMethod] = useState<WithdrawalMethod>('BankTransfer');
  const [destName, setDestName] = useState('Bank Central Asia (BCA)');
  const [destNumber, setDestNumber] = useState('8830192831');
  const [recipientName, setRecipientName] = useState(merchant.ownerName);

  const bankOptions = [
    'Bank Central Asia (BCA)',
    'Bank Mandiri',
    'Bank Rakyat Indonesia (BRI)',
    'Bank Negara Indonesia (BNI)',
    'Bank Syariah Indonesia (BSI)',
  ];

  const eWalletOptions = [
    'GoPay',
    'OVO',
    'DANA',
    'ShopeePay',
  ];

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = requestWithdrawal(withdrawAmount, method, destName, destNumber, recipientName);
    if (result.success) {
      setIsModalOpen(false);
    }
  };

  const validation = validateWithdrawal(withdrawAmount, wallet.withdrawableBalance);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Dompet Mitra & Saldo Penghasilan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau saldo penjualan bersih, potongan komisi platform 10%, dan lakukan penarikan dana ke rekening bank atau e-wallet.
        </p>
      </div>

      {/* 3 Balances Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 text-white shadow-xl shadow-blue-900/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-blue-100 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Saldo Siap Ditarik</span>
              <Wallet className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatRupiah(wallet.withdrawableBalance)}
            </p>
            <p className="text-[11px] text-blue-100 mt-1">
              Dapat dicairkan kapan saja ke bank / e-wallet
            </p>
          </div>

          <button
            onClick={() => {
              setWithdrawAmount(Math.min(wallet.withdrawableBalance, 500000) || MIN_WITHDRAWAL_AMOUNT);
              setIsModalOpen(true);
            }}
            disabled={wallet.withdrawableBalance < MIN_WITHDRAWAL_AMOUNT}
            className="mt-4 w-full py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
            <span>Tarik Saldo Sekarang</span>
          </button>
        </div>

        {/* Pending Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Saldo Tertahan (Pending)</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatRupiah(wallet.pendingBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Dari pesanan yang sedang dimasak & diantar driver
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
            Akan otomatis masuk ke saldo siap ditarik setelah pembeli menerima pesanan.
          </div>
        </div>

        {/* Platform Commission Rule Info */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Aturan Pencairan & Biaya</span>
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center justify-between">
                <span>Minimal Penarikan:</span>
                <b className="text-slate-900 dark:text-white">{formatRupiah(MIN_WITHDRAWAL_AMOUNT)}</b>
              </li>
              <li className="flex items-center justify-between">
                <span>Biaya Admin Bank/E-Wallet:</span>
                <b className="text-slate-900 dark:text-white">{formatRupiah(WITHDRAWAL_FEE)}</b>
              </li>
              <li className="flex items-center justify-between">
                <span>Komisi Platform:</span>
                <b className="text-emerald-600">10% per pesanan</b>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/40 text-[11px] text-slate-500">
            Pencairan diproses cepat 24/7 melalui sistem pencairan AWD.
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Riwayat Mutasi Saldo Dompet</h3>
          <span className="text-xs text-slate-400">{transactions.length} Transaksi</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'SalesIncome'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                      : tx.type === 'PlatformCommission'
                      ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      : tx.type === 'Withdrawal'
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                  }`}
                >
                  {tx.type === 'SalesIncome' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : tx.type === 'Withdrawal' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{tx.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Ref: {tx.referenceId} • {tx.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-black text-xs sm:text-sm ${
                    tx.netAmount > 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {tx.netAmount > 0 ? '+' : ''}
                  {formatRupiah(tx.netAmount)}
                </p>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tarik Saldo Dompet</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Withdrawable info */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs flex justify-between items-center text-blue-900 dark:text-blue-200">
              <span>Saldo Siap Ditarik:</span>
              <b className="text-sm font-extrabold">{formatRupiah(wallet.withdrawableBalance)}</b>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5 text-xs">
              {/* Method selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Metode Pencairan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('BankTransfer');
                      setDestName(bankOptions[0]);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                      method === 'BankTransfer'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Transfer Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('EWallet');
                      setDestName(eWalletOptions[0]);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                      method === 'EWallet'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>E-Wallet</span>
                  </button>
                </div>
              </div>

              {/* Destination Bank / E-Wallet */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih {method === 'BankTransfer' ? 'Bank Tujuan' : 'Layanan E-Wallet'}
                </label>
                <select
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  {(method === 'BankTransfer' ? bankOptions : eWalletOptions).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {method === 'BankTransfer' ? 'Nomor Rekening' : 'Nomor HP E-Wallet'}
                </label>
                <input
                  type="text"
                  required
                  value={destNumber}
                  onChange={(e) => setDestNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nominal Penarikan (Rp)
                  </label>
                  <span className="text-[11px] text-slate-400">Min. {formatRupiah(MIN_WITHDRAWAL_AMOUNT)}</span>
                </div>
                <input
                  type="number"
                  required
                  min={MIN_WITHDRAWAL_AMOUNT}
                  step={10000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {/* Quick nominal buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[100000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt)}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold hover:bg-slate-100"
                    >
                      {amt >= 1000000 ? `${amt / 1000000}Jt` : `${amt / 1000}rb`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(wallet.withdrawableBalance - WITHDRAWAL_FEE)}
                    className="px-2 py-1 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold ml-auto hover:bg-blue-100"
                  >
                    Semua
                  </button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Nominal Ditarik:</span>
                  <span>{formatRupiah(withdrawAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Biaya Admin AWD:</span>
                  <span>{formatRupiah(WITHDRAWAL_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Saldo Terpotong:</span>
                  <span className="text-rose-600 font-extrabold">{formatRupiah(withdrawAmount + WITHDRAWAL_FEE)}</span>
                </div>
              </div>

              {!validation.valid && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validation.error}</span>
                </div>
              )}

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!validation.valid}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold shadow-md shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Konfirmasi Tarik Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
