/**
 * AR360X — Agriculture & Plantations Management
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wheat, Trees, Plus, Minus, Sprout, ShieldAlert } from 'lucide-react';

export const CropsView: React.FC = () => {
  const { state, plantCrop, buyLand, sellLand } = useGame();
  const [landQty, setLandQty] = useState<number>(5);
  const [plantQty, setPlantQty] = useState<Record<string, number>>({
    wheat: 2,
    paddy: 2,
    tree: 2,
    coconut: 2,
  });

  const handlePlantQty = (crop: string, delta: number) => {
    setPlantQty((prev) => ({
      ...prev,
      [crop]: Math.max(1, (prev[crop] || 1) + delta),
    }));
  };

  const fastCropBonus = state.unlockedSkills.includes('sk_fastCrop') ? 2 : 0;
  const cycleDays = Math.max(4, 7 - fastCropBonus);

  const wheatProgress = Math.min(100, (state.agriculture.wheatGrowDays / cycleDays) * 100);
  const paddyProgress = Math.min(100, (state.agriculture.paddyGrowDays / cycleDays) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Farmland Acreage & Crop Plantations</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Cultivate Wheat, Paddy Rice, Fruit Orchards, and Coconut Palms. Maturation speed increases with agricultural skills.
          </p>
        </div>

        <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Owned Farmland</span>
          <span className="text-base font-bold font-mono text-amber-400">{state.agriculture.landOwned} Acres</span>
        </div>
      </div>

      {/* Farmland Acquisition & Expansion Card */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Acquire or Liquidate Farmland</h3>
            <p className="text-xs text-gray-400">Land Value: ₹1,000/acre · Resale at 90% (₹900/acre)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#0e1420] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setLandQty((q) => Math.max(1, q - 1))}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-3 text-white">{landQty} ac</span>
              <button
                onClick={() => setLandQty((q) => q + 1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => buyLand(landQty)}
              disabled={state.finances.cash < landQty * 1000}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl px-4 py-2 text-xs transition-colors"
            >
              Buy Land (₹{(landQty * 1000).toLocaleString()})
            </button>

            <button
              onClick={() => sellLand(landQty)}
              disabled={state.agriculture.landOwned < landQty}
              className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl px-4 py-2 text-xs transition-colors disabled:opacity-40"
            >
              Sell (₹{(landQty * 900).toLocaleString()})
            </button>
          </div>
        </div>
      </div>

      {/* Crops & Plantations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wheat Field */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
                🌾
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Golden Wheat
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {state.agriculture.wheatArea} acres
                  </span>
                </h3>
                <p className="text-xs text-gray-400">Cost: ₹500/acre · Harvest Cycle: {cycleDays} Days</p>
              </div>
            </div>
          </div>

          {/* Growth Progress */}
          <div className="space-y-1.5 bg-[#0e1420] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Growth Progress</span>
              <span className="font-mono font-bold text-amber-400">
                Day {state.agriculture.wheatGrowDays} / {cycleDays} ({Math.round(wheatProgress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${wheatProgress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center bg-[#0e1420] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handlePlantQty('wheat', -1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-3 text-white">{plantQty.wheat} ac</span>
              <button
                onClick={() => handlePlantQty('wheat', 1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => plantCrop('wheat', plantQty.wheat)}
              disabled={state.finances.cash < plantQty.wheat * 500}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Plant Wheat (₹{(plantQty.wheat * 500).toLocaleString()})
            </button>
          </div>
        </div>

        {/* Paddy Field */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                🌱
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Paddy Rice
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {state.agriculture.paddyArea} acres
                  </span>
                </h3>
                <p className="text-xs text-gray-400">Cost: ₹800/acre · High Monsoon Yield</p>
              </div>
            </div>
          </div>

          {/* Growth Progress */}
          <div className="space-y-1.5 bg-[#0e1420] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Growth Progress</span>
              <span className="font-mono font-bold text-emerald-400">
                Day {state.agriculture.paddyGrowDays} / {cycleDays} ({Math.round(paddyProgress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${paddyProgress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center bg-[#0e1420] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handlePlantQty('paddy', -1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-3 text-white">{plantQty.paddy} ac</span>
              <button
                onClick={() => handlePlantQty('paddy', 1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => plantCrop('paddy', plantQty.paddy)}
              disabled={state.finances.cash < plantQty.paddy * 800}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Plant Paddy (₹{(plantQty.paddy * 800).toLocaleString()})
            </button>
          </div>
        </div>

        {/* Fruit Trees Orchard */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-xl">
              🌳
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Fruit Orchard Trees
                <span className="text-xs font-mono font-bold text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/20">
                  {state.agriculture.treeCount} trees
                </span>
              </h3>
              <p className="text-xs text-gray-400">₹100/tree · Periodic harvest revenue every 7 days</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center bg-[#0e1420] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handlePlantQty('tree', -1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-3 text-white">{plantQty.tree}</span>
              <button
                onClick={() => handlePlantQty('tree', 1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => plantCrop('tree', plantQty.tree)}
              disabled={state.finances.cash < plantQty.tree * 100}
              className="flex-1 bg-lime-600 hover:bg-lime-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Plant Trees (₹{(plantQty.tree * 100).toLocaleString()})
            </button>
          </div>
        </div>

        {/* Coconut Groves */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl">
              🥥
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Coastal Coconut Palms
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                  {state.agriculture.coconutCount} palms
                </span>
              </h3>
              <p className="text-xs text-gray-400">₹250/tree · High periodic yields and coir byproducts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center bg-[#0e1420] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handlePlantQty('coconut', -1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-3 text-white">{plantQty.coconut}</span>
              <button
                onClick={() => handlePlantQty('coconut', 1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => plantCrop('coconut', plantQty.coconut)}
              disabled={state.finances.cash < plantQty.coconut * 250}
              className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Plant Palms (₹{(plantQty.coconut * 250).toLocaleString()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
