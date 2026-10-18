/**
 * AR360X — Central Commodity & Product Marketplace
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ShoppingCart, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export const MarketView: React.FC = () => {
  const { state, sellInventoryItem, buyLivestock, sellLivestock } = useGame();
  const [commQty, setCommQty] = useState<Record<string, number>>({ Copper: 1, 'Crude Oil': 1, 'Gold Bullion': 1, 'Silver Bar': 1 });

  const renderSparkline = (history: number[], color: string) => {
    if (history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const pts = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * 90;
      const y = 30 - ((val - min) / range) * 24 - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width="90" height="30" className="overflow-visible">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const processedGoods = [
    { key: 'ghee' as const, name: 'Desi Ghee', price: 300, stock: state.inventory.ghee, emoji: '🧈' },
    { key: 'ice' as const, name: 'Ice Cream', price: 200, stock: state.inventory.ice, emoji: '🍨' },
    { key: 'face' as const, name: 'Face Cream', price: 400, stock: state.inventory.face, emoji: '🧴' },
    { key: 'cheese' as const, name: 'Cheese Block', price: 250, stock: state.inventory.cheese, emoji: '🧀' },
    { key: 'leather' as const, name: 'Cured Leather', price: 200, stock: state.inventory.leather, emoji: '🥋' },
    { key: 'biogas' as const, name: 'BioGas Fuel', price: 60, stock: state.inventory.biogas, emoji: '⚡' },
    { key: 'soapOrganic' as const, name: 'Organic Soap', price: 150, stock: state.inventory.soapOrganic, emoji: '🌿' },
    { key: 'soapBeauty' as const, name: 'Beauty Soap', price: 120, stock: state.inventory.soapBeauty, emoji: '🧼' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Central Trading Exchange & Commodity Pit</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time wholesale commodities exchange with stochastic mean-reversion pricing, live order books, and finished farm inventory.
          </p>
        </div>

        <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Available Cash</span>
          <span className="text-base font-bold font-mono text-emerald-400">₹{state.finances.cash.toLocaleString()}</span>
        </div>
      </div>

      {/* 1. Commodities Spot Board */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          1. Spot Commodities Exchange
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.commodities.map((comm) => {
            const prev = comm.history[comm.history.length - 2] || comm.price;
            const chg = comm.price - prev;
            const chgPct = prev > 0 ? ((chg / prev) * 100).toFixed(1) : '0';
            const isUp = chg >= 0;
            const color = isUp ? '#10b981' : '#f43f5e';

            return (
              <div key={comm.name} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{comm.name}</h4>
                    <span className="text-[11px] text-gray-400">Holding: {comm.holding} {comm.unit}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white block">₹{comm.price.toLocaleString()}</span>
                    <span className={`text-xs font-semibold flex items-center justify-end ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {chg >= 0 ? '+' : ''}{chgPct}%
                    </span>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="flex justify-center bg-[#0d121c] p-2 rounded-xl border border-white/5">
                  {renderSparkline(comm.history, color)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (state.finances.cash >= comm.price) {
                        state.finances.cash -= comm.price;
                        comm.holding += 1;
                      }
                    }}
                    disabled={state.finances.cash < comm.price}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs transition-colors"
                  >
                    Buy 1
                  </button>
                  <button
                    onClick={() => {
                      if (comm.holding >= 1) {
                        comm.holding -= 1;
                        state.finances.cash += comm.price;
                      }
                    }}
                    disabled={comm.holding < 1}
                    className="flex-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl py-1.5 text-xs transition-colors disabled:opacity-40"
                  >
                    Sell 1
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Processed Farm Inventory Marketplace */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
          <ShoppingCart className="w-4 h-4 text-blue-400" />
          2. Wholesale Processed Goods Orderbook
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {processedGoods.map((item) => (
            <div key={item.key} className="bg-[#131926] border border-[#212836] rounded-xl p-3.5 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.stock} in stock
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                <p className="text-[11px] font-mono text-gray-400">₹{item.price} / unit</p>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => sellInventoryItem(item.key, 1, item.price)}
                  disabled={item.stock < 1}
                  className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 disabled:opacity-40 font-semibold rounded-lg py-1 text-xs transition-colors"
                >
                  Sell 1
                </button>
                <button
                  onClick={() => sellInventoryItem(item.key, item.stock, item.price)}
                  disabled={item.stock < 1}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 font-semibold rounded-lg px-2.5 py-1 text-xs transition-colors"
                  title="Sell all in stock"
                >
                  All
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Raw Materials & Livestock Trading Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Raw Farm Output */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-white">Direct Farm Output Sales</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>🥛 Raw Fresh Milk ({state.inventory.milk}L)</span>
              <button
                onClick={() => sellInventoryItem('milk', 10, 35)}
                disabled={state.inventory.milk < 10}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold disabled:opacity-40"
              >
                Sell 10L (₹350)
              </button>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>🥚 Fresh Farm Eggs ({state.inventory.eggs})</span>
              <button
                onClick={() => sellInventoryItem('eggs', 10, 6)}
                disabled={state.inventory.eggs < 10}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold disabled:opacity-40"
              >
                Sell 10 (₹60)
              </button>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>💩 Organic Farm Dung ({state.inventory.dung} u)</span>
              <button
                onClick={() => sellInventoryItem('dung', 10, 20)}
                disabled={state.inventory.dung < 10}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold disabled:opacity-40"
              >
                Sell 10 (₹200)
              </button>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>📜 Raw Animal Skins ({state.inventory.skins} u)</span>
              <button
                onClick={() => sellInventoryItem('skins', 2, 100)}
                disabled={state.inventory.skins < 2}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold disabled:opacity-40"
              >
                Sell 2 (₹200)
              </button>
            </div>
          </div>
        </div>

        {/* Live Cattle Auction & Trading */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-white">Live Animal Marketplace</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>🐄 Cow (₹9,000) · {state.livestock.Cow.count} owned</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => buyLivestock('Cow', 1)}
                  disabled={state.finances.cash < 9000}
                  className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Buy
                </button>
                <button
                  onClick={() => sellLivestock('Cow', 1)}
                  disabled={state.livestock.Cow.count < 1}
                  className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Sell
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>🐐 Goat (₹2,600) · {state.livestock.Goat.count} owned</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => buyLivestock('Goat', 1)}
                  disabled={state.finances.cash < 2600}
                  className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Buy
                </button>
                <button
                  onClick={() => sellLivestock('Goat', 1)}
                  disabled={state.livestock.Goat.count < 1}
                  className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Sell
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>🐑 Sheep (₹3,200) · {state.livestock.Sheep.count} owned</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => buyLivestock('Sheep', 1)}
                  disabled={state.finances.cash < 3200}
                  className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Buy
                </button>
                <button
                  onClick={() => sellLivestock('Sheep', 1)}
                  disabled={state.livestock.Sheep.count < 1}
                  className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Sell
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[#0e1420] border border-white/5">
              <span>🐔 Chicken (₹350) · {state.livestock.Chicken.count} owned</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => buyLivestock('Chicken', 1)}
                  disabled={state.finances.cash < 350}
                  className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Buy
                </button>
                <button
                  onClick={() => sellLivestock('Chicken', 1)}
                  disabled={state.livestock.Chicken.count < 1}
                  className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold disabled:opacity-40"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
