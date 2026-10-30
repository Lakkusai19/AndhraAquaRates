import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buyerApi } from '../services/api';
import { PriceRevision } from '../types';
import { History, ArrowLeft, Clock, Calendar, TrendingUp, TrendingDown, Clock3, AlertCircle } from 'lucide-react';

export const PriceHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PriceRevision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await buyerApi.getPriceHistory();
        setHistory(res.data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/buyer/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-sky-700 font-bold mb-2 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-md shadow-sky-500/20 shrink-0">
                <img
                  src="/logo.png"
                  alt="ANDHRA AQUA RATES Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Price Revision History</h1>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Rolling 7-Day Window
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full audit log of all count-wise price updates made by your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Auto-Purge Policy Notice Banner */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-950 flex items-start gap-3">
          <Clock3 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-amber-900">Automatic 7-Day Purge Policy: </span>
            <span className="text-amber-800 leading-relaxed">
              Every single price modification is permanently timestamped with the exact date, hour, minute, and second. In accordance with system policy, revision records older than 1 week (7 days) are automatically deleted from the database.
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
              <p className="font-bold text-slate-600 text-sm mb-1">No Price Revisions in the Last 7 Days</p>
              <p className="max-w-md mx-auto text-slate-400">
                Revisions are created automatically whenever you submit or update an existing count rate. Old revisions past 7 days are automatically purged.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date & Exact Time</th>
                    <th className="py-3 px-4">Count Grade</th>
                    <th className="py-3 px-4">Market Hub</th>
                    <th className="py-3 px-4 text-right">Previous Rate</th>
                    <th className="py-3 px-4 text-right">Updated Rate</th>
                    <th className="py-3 px-4 text-center">Price Change</th>
                    <th className="py-3 px-4 text-center">Change Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {history.map((rev) => {
                    const prev = rev.previous_price ? Number(rev.previous_price) : null;
                    const next = Number(rev.new_price);
                    const diff = prev !== null ? next - prev : null;

                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          <div className="font-bold text-slate-800">
                            {new Date(rev.changed_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(rev.changed_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">{rev.count_label}</td>
                        <td className="py-3 px-4 text-slate-600">{rev.market_name}</td>
                        <td className="py-3 px-4 text-right text-slate-400 font-semibold line-through">
                          {rev.previous_price ? `₹${rev.previous_price}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                          ₹{rev.new_price}/kg
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {diff === null ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Initial Rate
                            </span>
                          ) : diff > 0 ? (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3 text-emerald-600" /> +₹{diff.toFixed(2)}
                            </span>
                          ) : diff < 0 ? (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 inline-flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3 text-rose-600" /> -₹{Math.abs(diff).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500">No Change</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                            {rev.change_source}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
