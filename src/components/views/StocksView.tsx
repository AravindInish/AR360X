/**
 * AR360X — Stock Exchange, IPOs, Options & Dividends Terminal
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Activity, FileText } from 'lucide-react';

export const StocksView: React.FC = () => {
  const { state, buyStock, sellStock, placeLimitOrder, cancelLimitOrder, applyIPO, buyOption } = useGame();

  const [activeTab, setActiveTab] = useState<'market' | 'ipo' | 'fo' | 'dividends'>('market');
  const [selectedStockId, setSelectedStockId] = useState<string>('AGROTECH');
  const [tradeQty, setTradeQty] = useState<number>(5);

  // Limit order
  const [limitQty, setLimitQty] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(400);
  const [limitType, setLimitType] = useState<'buy' | 'sell'>('buy');

  // Options F&O
  const [foType, setFoType] = useState<'call' | 'put'>('call');
  const [foContracts, setFoContracts] = useState<number>(1);

  const selectedStock = state.stocks.find((s) => s.id === selectedStockId) || state.stocks[0];
  const portfolioVal = state.stocks.reduce((sum, s) => sum + s.holding * s.price, 0);
  const totalCostBasis = state.stocks.reduce((sum, s) => sum + s.holding * s.avgBuy, 0);
  const totalPnl = portfolioVal - totalCostBasis;

  const renderStockSparkline = (history: number[], isUp: boolean) => {
    if (history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const pts = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * 120;
      const y = 35 - ((val - min) / range) * 28 - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width="120" height="35" className="overflow-visible">
        <polyline
          points={pts}
          fill="none"
          stroke={isUp ? '#10b981' : '#f43f5e'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">National Securities & Equities Exchange</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Trade blue-chip equities, subscribe to primary market IPOs, and hedge risk with Options derivatives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Equities Portfolio</span>
            <span className="text-base font-bold font-mono text-emerald-400">₹{portfolioVal.toLocaleString()}</span>
          </div>

          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Unrealized P&L</span>
            <span className={`text-base font-bold font-mono ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#212836] pb-2">
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'market' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          📈 Listed Equities ({state.stocks.length})
        </button>
        <button
          onClick={() => setActiveTab('ipo')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ipo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          📢 IPO Initial Offerings ({state.advancedFinance.ipos.length})
        </button>
        <button
          onClick={() => setActiveTab('fo')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'fo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚡ Futures & Options (F&O)
        </button>
        <button
          onClick={() => setActiveTab('dividends')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'dividends' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          💰 Dividend Yields
        </button>
      </div>

      {/* TAB 1: Listed Equities */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Stocks Table */}
          <div className="lg:col-span-2 bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white">Equities Price Board</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-mono text-gray-400 border-b border-white/5">
                  <tr>
                    <th className="pb-2">Company</th>
                    <th className="pb-2">Sector</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Change</th>
                    <th className="pb-2">Trend</th>
                    <th className="pb-2">Holding</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {state.stocks.map((stock) => {
                    const prev = stock.history[stock.history.length - 2] || stock.price;
                    const chg = stock.price - prev;
                    const isUp = chg >= 0;
                    const isSelected = stock.id === selectedStockId;

                    return (
                      <tr
                        key={stock.id}
                        onClick={() => setSelectedStockId(stock.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                      >
                        <td className="py-2.5 font-sans">
                          <span className="font-bold text-white block">{stock.id}</span>
                          <span className="text-[10px] text-gray-400">{stock.name}</span>
                        </td>
                        <td className="py-2.5 text-gray-400">{stock.sector}</td>
                        <td className="py-2.5 font-bold text-white">₹{stock.price}</td>
                        <td className={`py-2.5 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{chg}
                        </td>
                        <td className="py-2.5">{renderStockSparkline(stock.history, isUp)}</td>
                        <td className="py-2.5 text-white">{stock.holding} sh</td>
                        <td className="py-2.5 text-right font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStockId(stock.id);
                            }}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Trade Execution Box */}
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedStock.name}</h3>
                <span className="text-xs text-gray-400 font-mono">{selectedStock.id} · {selectedStock.sector}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-bold text-emerald-400 block">₹{selectedStock.price}</span>
                <span className="text-[11px] text-gray-400">Holding: {selectedStock.holding}</span>
              </div>
            </div>

            {/* Quick Instant Buy / Sell */}
            <div className="space-y-3 bg-[#0e1420] p-3.5 rounded-xl border border-white/5">
              <label className="text-[11px] text-gray-400 block font-mono">Trade Quantity (Shares)</label>
              <input
                type="number"
                value={tradeQty}
                onChange={(e) => setTradeQty(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
              <div className="text-xs text-gray-400 flex justify-between font-mono">
                <span>Total Cost:</span>
                <span className="text-white font-bold">₹{(tradeQty * selectedStock.price).toLocaleString()}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => buyStock(selectedStock.id, tradeQty)}
                  disabled={state.finances.cash < tradeQty * selectedStock.price}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs"
                >
                  Buy ({tradeQty})
                </button>
                <button
                  onClick={() => sellStock(selectedStock.id, tradeQty)}
                  disabled={selectedStock.holding < tradeQty}
                  className="flex-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl py-2 text-xs disabled:opacity-40"
                >
                  Sell ({tradeQty})
                </button>
              </div>
            </div>

            {/* Limit Order Execution */}
            <div className="space-y-3 bg-[#0e1420] p-3.5 rounded-xl border border-white/5">
              <h4 className="text-xs font-bold uppercase font-mono text-gray-300">Place Limit Order</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-gray-400 block">Type</label>
                  <select
                    value={limitType}
                    onChange={(e) => setLimitType(e.target.value as 'buy' | 'sell')}
                    className="w-full bg-[#171f2e] border border-white/10 rounded-lg p-1 text-white"
                  >
                    <option value="buy">Limit Buy</option>
                    <option value="sell">Limit Sell</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block">Target (₹)</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    className="w-full bg-[#171f2e] border border-white/10 rounded-lg p-1 text-white font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => placeLimitOrder(selectedStock.id, 'stock', limitType, limitQty, limitPrice)}
                className="w-full bg-[#1f293d] hover:bg-[#2b3752] text-gray-200 border border-white/10 rounded-xl py-1.5 text-xs font-semibold"
              >
                Set Limit {limitType.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IPO Market */}
      {activeTab === 'ipo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.advancedFinance.ipos.map((ipo) => (
              <div key={ipo.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-white">{ipo.name}</h4>
                    <span className="text-xs text-gray-400 font-mono">{ipo.sector}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    {ipo.status}
                  </span>
                </div>

                <p className="text-xs text-gray-300">{ipo.desc}</p>

                <div className="grid grid-cols-3 gap-2 bg-[#0e1420] p-3 rounded-xl border border-white/5 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Issue Price</span>
                    <span className="font-bold text-white">₹{ipo.issuePrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Lot Size</span>
                    <span className="font-bold text-white">{ipo.lotSize} sh</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Closes Day</span>
                    <span className="font-bold text-amber-400">{ipo.closeDay}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => applyIPO(ipo.id, 1)}
                    disabled={ipo.status !== 'open' || state.finances.cash < ipo.lotSize * ipo.issuePrice}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
                  >
                    Apply 1 Lot (₹{(ipo.lotSize * ipo.issuePrice).toLocaleString()})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Futures & Options (F&O) */}
      {activeTab === 'fo' && (
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Options Derivative Desk</h3>
            <span className="text-xs text-gray-400">7-Day Contract Expiries · In-the-money profit settlements</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0e1420] p-4 rounded-xl border border-white/5 text-xs">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Underlying Asset</label>
              <select
                value={selectedStockId}
                onChange={(e) => setSelectedStockId(e.target.value)}
                className="w-full bg-[#171f2e] border border-white/10 rounded-lg p-2 text-white"
              >
                {state.stocks.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} (Spot: ₹{s.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Option Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFoType('call')}
                  className={`flex-1 py-1.5 rounded-lg font-bold ${
                    foType === 'call' ? 'bg-emerald-600 text-white' : 'bg-[#171f2e] text-gray-400'
                  }`}
                >
                  CALL 📈
                </button>
                <button
                  onClick={() => setFoType('put')}
                  className={`flex-1 py-1.5 rounded-lg font-bold ${
                    foType === 'put' ? 'bg-rose-600 text-white' : 'bg-[#171f2e] text-gray-400'
                  }`}
                >
                  PUT 📉
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Contracts Qty</label>
              <input
                type="number"
                value={foContracts}
                onChange={(e) => setFoContracts(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-full bg-[#171f2e] border border-white/10 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => buyOption(selectedStock.id, foType, selectedStock.price, foContracts, Math.round(selectedStock.price * 0.05))}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs"
              >
                Buy {foType.toUpperCase()} (₹{(foContracts * Math.round(selectedStock.price * 0.05)).toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Dividends */}
      {activeTab === 'dividends' && (
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white">Quarterly Equities Dividend Ledger</h3>
          <p className="text-xs text-gray-400">
            Dividend-paying companies disburse periodic shareholder returns based on your current holding.
          </p>

          <div className="space-y-2">
            {state.stocks.filter((s) => s.dividendYield).map((s) => (
              <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-[#0e1420] border border-white/5 text-xs font-mono">
                <div>
                  <span className="font-bold text-white block">{s.name} ({s.id})</span>
                  <span className="text-[11px] text-gray-400">Holding: {s.holding} shares · Annual Yield: {((s.dividendYield || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">
                    Est: ₹{Math.round(s.holding * s.price * ((s.dividendYield || 0) / 4)).toLocaleString()} / qtr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
