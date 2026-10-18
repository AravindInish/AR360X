/**
 * AR360X — Financial Statements, Net Worth Trends & Analytics
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { BarChart3, TrendingUp, DollarSign, PieChart, ShieldAlert } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { state, netWorthData } = useGame();

  const nwHistory = state.history.netWorth;
  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  const renderNetWorthChart = () => {
    if (nwHistory.length < 2) return <p className="text-xs text-gray-500 py-6 text-center">Need more simulation days to plot trend line.</p>;

    const min = Math.min(...nwHistory);
    const max = Math.max(...nwHistory);
    const range = max - min || 1;
    const width = 600;
    const height = 140;

    const points = nwHistory.map((val, idx) => {
      const x = (idx / (nwHistory.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 30) - 15;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
          <defs>
            <linearGradient id="nwGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={pathData} fill="url(#nwGrad)" />
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Financial Statements & Analytics Ledger</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Consolidated corporate balance sheet, assets vs liabilities distribution, and historical capital appreciation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Audited Net Worth</span>
            <span className="text-base font-bold font-mono text-emerald-400">{formatCurrency(netWorthData.netWorth)}</span>
          </div>
        </div>
      </div>

      {/* Net Worth Chart */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            60-Day Net Worth Trajectory
          </h3>
          <span className="text-xs font-mono text-gray-400">Current: {formatCurrency(netWorthData.netWorth)}</span>
        </div>
        {renderNetWorthChart()}
      </div>

      {/* Balance Sheet: Assets vs Liabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Side */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-emerald-400">Total Assets (Capital Holdings)</h3>
            <span className="font-mono font-bold text-emerald-400">{formatCurrency(netWorthData.totalAssets)}</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Cash on Hand</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.cash)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Banking Savings Accounts</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.bank)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Investments (Stocks, Crypto, FDs, Bonds, SIP)</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.investments)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Livestock Herd</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.livestock)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Finished Goods & Raw Stock</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.products)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Farmland & Orchards</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.crops)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Real Estate (Houses & Farms)</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.realEstate)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Commercial Enterprises & Fleet</span>
              <span className="text-white font-bold">{formatCurrency(netWorthData.breakdown.enterprises + netWorthData.breakdown.equipment)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities Side */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-rose-400">Total Liabilities (Debts & Due)</h3>
            <span className="font-mono font-bold text-rose-400">{formatCurrency(netWorthData.totalLiabilities)}</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Bank Loans Outstanding</span>
              <span className="text-rose-400 font-bold">
                {formatCurrency(state.activeLoans.reduce((s, l) => s + l.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">Credit Card Balances</span>
              <span className="text-rose-400 font-bold">
                {formatCurrency(state.creditCards.reduce((s, c) => s + c.outstanding, 0))}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400">All-Time Tax Paid</span>
              <span className="text-gray-300 font-bold">{formatCurrency(state.finances.allTimeTaxPaid)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Total Revenue Generated</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(state.stats.totalRevenue)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1420] border border-white/5 space-y-1 text-xs">
            <span className="text-emerald-400 font-bold block">NET EQUITY FORMULA:</span>
            <p className="text-gray-400 font-mono">
              Net Worth = Assets ({formatCurrency(netWorthData.totalAssets)}) − Liabilities ({formatCurrency(netWorthData.totalLiabilities)}) = <strong className="text-white">{formatCurrency(netWorthData.netWorth)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
