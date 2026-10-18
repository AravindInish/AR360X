/**
 * AR360X — Cryptocurrency Trading Desk
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Coins, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

export const CryptoView: React.FC = () => {
  const { state, buyCrypto, sellCrypto } = useGame();
  const [selectedCoinId, setSelectedCoinId] = useState<string>('btc');
  const [inrBuyAmount, setInrBuyAmount] = useState<number>(5000);
  const [sellCoinQty, setSellCoinQty] = useState<number>(0.001);

  const selectedCoin = state.cryptoCoins.find((c) => c.id === selectedCoinId) || state.cryptoCoins[0];
  const cryptoPortfolioVal = state.cryptoCoins.reduce((sum, c) => sum + c.holding * c.price, 0);

  const renderSparkline = (history: number[], isUp: boolean, color: string) => {
    if (history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const pts = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * 90;
      const y = 30 - ((val - min) / range) * 22 - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width="90" height="30" className="overflow-visible">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Cryptocurrency & Digital Asset Exchange</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Volatile decentralized assets with high momentum, 24/7 liquidity, and fractional purchasing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Crypto Net Worth</span>
            <span className="text-base font-bold font-mono text-amber-400">₹{Math.round(cryptoPortfolioVal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Crypto Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.cryptoCoins.map((coin) => {
          const prev = coin.history[coin.history.length - 2] || coin.price;
          const chg = coin.price - prev;
          const chgPct = prev > 0 ? ((chg / prev) * 100).toFixed(2) : '0';
          const isUp = chg >= 0;
          const isSelected = coin.id === selectedCoinId;

          return (
            <div
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`bg-[#131926] border rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-3 ${
                isSelected ? 'border-amber-500 shadow-amber-500/10' : 'border-[#212836] hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" style={{ color: coin.color }}>{coin.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{coin.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{coin.symbol}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-white block">₹{coin.price.toLocaleString()}</span>
                  <span className={`text-[11px] font-semibold flex items-center justify-end ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {chg >= 0 ? '+' : ''}{chgPct}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#0d121c] p-2 rounded-xl border border-white/5">
                <div className="text-xs font-mono">
                  <span className="text-[10px] text-gray-400 block uppercase">Holding</span>
                  <span className="text-emerald-400 font-bold">{coin.holding.toFixed(4)} {coin.symbol}</span>
                </div>
                {renderSparkline(coin.history, isUp, coin.color)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trade Execution Panel for Selected Crypto */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="text-3xl" style={{ color: selectedCoin.color }}>{selectedCoin.icon}</span>
            <div>
              <h3 className="text-base font-bold text-white">Trade {selectedCoin.name} ({selectedCoin.symbol})</h3>
              <p className="text-xs text-gray-400">Spot Market Price: ₹{selectedCoin.price.toLocaleString()} · 24h Volatility: {(selectedCoin.vol * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-gray-400 block">Your Holding Value</span>
            <span className="text-sm font-bold text-amber-400">₹{Math.round(selectedCoin.holding * selectedCoin.price).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Buy with INR */}
          <div className="bg-[#0e1420] p-4 rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono text-emerald-400">Buy with Cash</h4>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">INR Investment (₹)</label>
              <input
                type="number"
                value={inrBuyAmount}
                onChange={(e) => setInrBuyAmount(Math.max(100, Number(e.target.value)))}
                min={100}
                className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-1 block font-mono">
                Est. Receive: {(inrBuyAmount / selectedCoin.price).toFixed(6)} {selectedCoin.symbol}
              </span>
            </div>
            <button
              onClick={() => buyCrypto(selectedCoin.id, inrBuyAmount)}
              disabled={state.finances.cash < inrBuyAmount}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Buy {selectedCoin.symbol} (₹{inrBuyAmount.toLocaleString()})
            </button>
          </div>

          {/* Sell to INR */}
          <div className="bg-[#0e1420] p-4 rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono text-rose-400">Sell {selectedCoin.symbol}</h4>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Quantity to Liquidate</label>
              <input
                type="number"
                value={sellCoinQty}
                onChange={(e) => setSellCoinQty(Math.max(0.0001, Number(e.target.value)))}
                step="0.001"
                min={0.0001}
                className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-1 block font-mono">
                Est. Payout: ₹{Math.round(sellCoinQty * selectedCoin.price).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => sellCrypto(selectedCoin.id, sellCoinQty)}
              disabled={selectedCoin.holding < sellCoinQty}
              className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 disabled:opacity-40 font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Sell {sellCoinQty} {selectedCoin.symbol}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
