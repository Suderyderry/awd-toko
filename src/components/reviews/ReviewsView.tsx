import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Star,
  MessageSquare,
  Send,
  CornerDownRight,
  Filter,
  CheckCircle2,
  Calendar,
  ThumbsUp,
} from 'lucide-react';
import { Review } from '../../types/index.ts';

export const ReviewsView: React.FC = () => {
  const { reviews, replyReview, currentStore } = useMerchant();

  const [starFilter, setStarFilter] = useState<number | 'All'>('All');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Rating metrics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter((r) => {
    if (starFilter === 'All') return true;
    return r.rating === starFilter;
  });

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyReview(reviewId, replyText);
    setReplyingReviewId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Ulasan & Penilaian Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tanggapi ulasan pembeli, bangun reputasi toko, dan pantau kepuasan rasa serta pelayanan pengiriman.
        </p>
      </div>

      {/* Rating Breakdown Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row items-center gap-6">
        {/* Big Score Block */}
        <div className="text-center md:border-r border-slate-200 dark:border-slate-700 md:pr-8 shrink-0">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            {averageRating}
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-400 my-1 text-lg">
            {'★'.repeat(Math.round(Number(averageRating)))}
            {'☆'.repeat(5 - Math.round(Number(averageRating)))}
          </div>
          <p className="text-xs text-slate-400">
            Total {totalReviews} Ulasan Pembeli
          </p>
        </div>

        {/* Star Progress Bars */}
        <div className="flex-1 w-full space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star as keyof typeof ratingCounts] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div
                key={star}
                onClick={() => setStarFilter(star === starFilter ? 'All' : (star as number))}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <span className="w-12 font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {star} Bintang
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-amber-400 rounded-full group-hover:bg-amber-500 transition-all"
                  />
                </div>
                <span className="w-8 text-right text-slate-400 text-[11px] font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Star Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStarFilter('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            starFilter === 'All'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Semua ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            onClick={() => setStarFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              starFilter === s
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{s}</span>
            <span className="text-amber-400">★</span>
            <span className="text-[10px] opacity-75">
              ({ratingCounts[s as keyof typeof ratingCounts] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-slate-400 text-xs">
            Belum ada ulasan untuk filter bintang ini.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3"
            >
              {/* Header: Customer, Rating, Order Ref */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customerAvatar}
                    alt={rev.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {rev.customerName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>No. Order: <b>{rev.orderId}</b></span>
                      <span>• {rev.orderDate}</span>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 text-base">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/40">
                "{rev.comment}"
              </p>

              {/* Existing Merchant Reply */}
              {rev.merchantReply && (
                <div className="ml-4 pl-3 border-l-2 border-blue-500 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Balasan dari {currentStore.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">• {rev.replyDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rev.merchantReply}
                  </p>
                </div>
              )}

              {/* Reply Form / Button */}
              {!rev.merchantReply && (
                <div>
                  {replyingReviewId === rev.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan terima kasih atau solusi untuk pelanggan..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Balasan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingReviewId(rev.id);
                        setReplyText(`Terima kasih banyak ${rev.customerName} atas ulasannya! Kami senang Anda menyukai hidangan kami.`);
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Balas Ulasan Ini</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
