/**
 * AR360X — Livestock Ranch Management
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LivestockKind } from '../../types/game';
import { Beef, Heart, Plus, Minus, Stethoscope, Sparkles } from 'lucide-react';

interface AnimalConfig {
  kind: LivestockKind;
  name: string;
  emoji: string;
  desc: string;
  yieldInfo: string;
}

const ANIMALS_META: AnimalConfig[] = [
  { kind: 'Cow', name: 'Dairy Cows', emoji: '🐄', desc: 'High-yield milk producers and primary dung contributors for biogas.', yieldInfo: '6L Milk/day · 2 Dung/day' },
  { kind: 'Goat', name: 'Caprine Goats', emoji: '🐐', desc: 'Hardy livestock yielding rich goat milk and premium tannery skins.', yieldInfo: '2L Milk/day · 1 Dung/day · Skins' },
  { kind: 'Sheep', name: 'Woolen Sheep', emoji: '🐑', desc: 'Provides organic wool, resilient leather pelts, and farm manure.', yieldInfo: '1 Dung/day · Skins' },
  { kind: 'Chicken', name: 'Poultry Chickens', emoji: '🐔', desc: 'Continuous egg layers with low feed overhead and fast scaling.', yieldInfo: '1 Egg/day each' },
];

export const LivestockView: React.FC = () => {
  const { state, buyLivestock, sellLivestock, feedLivestock, consultVet } = useGame();
  const [quantities, setQuantities] = useState<Record<LivestockKind, number>>({
    Cow: 1,
    Goat: 1,
    Sheep: 1,
    Chicken: 5,
  });

  const handleQtyChange = (kind: LivestockKind, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [kind]: Math.max(1, prev[kind] + delta),
    }));
  };

  const totalAnimals = Object.values(state.livestock).reduce((s, a) => s + a.count, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Beef className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Livestock Ranch & Veterinary Station</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Maintain animal health, feed pastures, and breed your herds. Healthy animals produce maximum milk and eggs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-3.5 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Ranch Population</span>
            <span className="text-base font-bold font-mono text-emerald-400">{totalAnimals} Animals</span>
          </div>

          <button
            onClick={consultVet}
            disabled={state.finances.cash < 800}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Consult Vet (+25 HP all · ₹800)</span>
          </button>
        </div>
      </div>

      {/* 4 Livestock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ANIMALS_META.map((meta) => {
          const item = state.livestock[meta.kind];
          const qty = quantities[meta.kind] || 1;
          const totalBuyCost = item.basePrice * qty;
          const canAfford = state.finances.cash >= totalBuyCost;
          const canSell = item.count >= qty;
          const sellRev = Math.round(item.basePrice * qty * 0.85);

          const healthColor = item.health > 70 ? 'bg-emerald-500' : item.health > 40 ? 'bg-amber-500' : 'bg-rose-500';

          return (
            <div key={meta.kind} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1c2436] flex items-center justify-center text-2xl shadow-inner border border-white/5">
                    {meta.emoji}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {meta.name}
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {item.count} owned
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
                  </div>
                </div>
              </div>

              {/* Health Progress Bar */}
              <div className="space-y-1.5 bg-[#0e1420] p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> Herd Health
                  </span>
                  <span className="font-mono font-bold text-white">{item.health}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${healthColor}`} style={{ width: `${item.health}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                  <span>Daily Yield: {meta.yieldInfo}</span>
                  <button
                    onClick={() => feedLivestock(meta.kind)}
                    disabled={item.count <= 0 || state.finances.cash < 25}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors disabled:opacity-40"
                  >
                    Feed Grass (+15 HP)
                  </button>
                </div>
              </div>

              {/* Pricing & Trade Controls */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs text-gray-300 font-mono">
                  <span>Unit Price: ₹{item.basePrice.toLocaleString()}</span>
                  <span>Resale: ₹{Math.round(item.basePrice * 0.85).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#0e1420] border border-white/10 rounded-xl p-1">
                    <button
                      onClick={() => handleQtyChange(meta.kind, -1)}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-xs px-3 text-white">{qty}</span>
                    <button
                      onClick={() => handleQtyChange(meta.kind, 1)}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => buyLivestock(meta.kind, qty)}
                    disabled={!canAfford}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Buy ({qty}) · ₹{totalBuyCost.toLocaleString()}
                  </button>

                  <button
                    onClick={() => sellLivestock(meta.kind, qty)}
                    disabled={!canSell}
                    className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl px-4 py-2 text-xs transition-colors disabled:opacity-40"
                  >
                    Sell ({qty}) · ₹{sellRev.toLocaleString()}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
