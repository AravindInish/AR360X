/**
 * AR360X — Manufacturing & Processing Factories
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Factory, Milk, Sparkles, Flame, Shield, ArrowRight } from 'lucide-react';

export const FactoriesView: React.FC = () => {
  const {
    state,
    convertDairy,
    packEggs,
    convertLeather,
    convertBioGas,
    craftSoap,
    sellInventoryItem,
  } = useGame();

  const [dairyQty, setDairyQty] = useState({ ghee: 1, ice: 1, face: 1, cheese: 1 });
  const [eggPackQty, setEggPackQty] = useState({ single: 5, half: 2, dozen: 1 });
  const [leatherQty, setLeatherQty] = useState(2);
  const [biogasQty, setBiogasQty] = useState(5);
  const [soapQty, setSoapQty] = useState({ beauty: 2, organic: 2, detergent: 2 });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Value-Addition Manufacturing Plants</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Convert low-margin farm commodities (Milk, Eggs, Skins, Dung) into high-margin consumer products.
          </p>
        </div>

        {/* Raw Stock Summary Pill */}
        <div className="flex items-center gap-2 bg-[#0e1420] p-2 rounded-xl border border-white/5 text-xs font-mono">
          <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded">
            🥛 {state.inventory.milk}L Milk
          </span>
          <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-500/10 rounded">
            🥚 {state.inventory.eggs} Eggs
          </span>
          <span className="text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 rounded">
            💩 {state.inventory.dung} Dung
          </span>
          <span className="text-purple-400 font-bold px-2 py-0.5 bg-purple-500/10 rounded">
            📜 {state.inventory.skins} Skins
          </span>
        </div>
      </div>

      {/* 1. Dairy Processing Plant */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
            <Milk className="w-4 h-4 text-emerald-400" />
            1. Dairy Processing Complex (Stock: {state.inventory.milk}L Raw Milk)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ghee */}
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl">🧈</span>
                <h4 className="text-sm font-bold text-white mt-1">Pure Desi Ghee</h4>
                <span className="text-[11px] text-gray-400">Ratio: 4L Milk → 1 Unit</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-gray-400 block">Stock</span>
                <span className="text-sm font-bold text-emerald-400">{state.inventory.ghee}</span>
              </div>
            </div>

            <div className="text-xs text-gray-300 font-mono flex justify-between">
              <span>Market Price:</span>
              <span className="text-amber-400 font-bold">₹300 / unit</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => convertDairy('ghee', dairyQty.ghee)}
                disabled={state.inventory.milk < dairyQty.ghee * 4}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs transition-colors"
              >
                Make ({dairyQty.ghee})
              </button>
              <button
                onClick={() => sellInventoryItem('ghee', 1, 300)}
                disabled={state.inventory.ghee < 1}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
              >
                Sell (₹300)
              </button>
            </div>
          </div>

          {/* Ice Cream */}
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl">🍨</span>
                <h4 className="text-sm font-bold text-white mt-1">Ice Cream Tub</h4>
                <span className="text-[11px] text-gray-400">Ratio: 6L Milk → 1 Unit</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-gray-400 block">Stock</span>
                <span className="text-sm font-bold text-emerald-400">{state.inventory.ice}</span>
              </div>
            </div>

            <div className="text-xs text-gray-300 font-mono flex justify-between">
              <span>Market Price:</span>
              <span className="text-amber-400 font-bold">₹200 / unit</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => convertDairy('ice', dairyQty.ice)}
                disabled={state.inventory.milk < dairyQty.ice * 6}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs transition-colors"
              >
                Make ({dairyQty.ice})
              </button>
              <button
                onClick={() => sellInventoryItem('ice', 1, 200)}
                disabled={state.inventory.ice < 1}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
              >
                Sell (₹200)
              </button>
            </div>
          </div>

          {/* Face Cream */}
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl">🧴</span>
                <h4 className="text-sm font-bold text-white mt-1">Cosmetic Face Cream</h4>
                <span className="text-[11px] text-gray-400">Ratio: 10L Milk → 1 Unit</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-gray-400 block">Stock</span>
                <span className="text-sm font-bold text-emerald-400">{state.inventory.face}</span>
              </div>
            </div>

            <div className="text-xs text-gray-300 font-mono flex justify-between">
              <span>Market Price:</span>
              <span className="text-amber-400 font-bold">₹400 / unit</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => convertDairy('face', dairyQty.face)}
                disabled={state.inventory.milk < dairyQty.face * 10}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs transition-colors"
              >
                Make ({dairyQty.face})
              </button>
              <button
                onClick={() => sellInventoryItem('face', 1, 400)}
                disabled={state.inventory.face < 1}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
              >
                Sell (₹400)
              </button>
            </div>
          </div>

          {/* Artisan Cheese */}
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl">🧀</span>
                <h4 className="text-sm font-bold text-white mt-1">Artisan Block Cheese</h4>
                <span className="text-[11px] text-gray-400">Ratio: 5L Milk → 1 Unit</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-gray-400 block">Stock</span>
                <span className="text-sm font-bold text-emerald-400">{state.inventory.cheese}</span>
              </div>
            </div>

            <div className="text-xs text-gray-300 font-mono flex justify-between">
              <span>Market Price:</span>
              <span className="text-amber-400 font-bold">₹250 / unit</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => convertDairy('cheese', dairyQty.cheese)}
                disabled={state.inventory.milk < dairyQty.cheese * 5}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs transition-colors"
              >
                Make ({dairyQty.cheese})
              </button>
              <button
                onClick={() => sellInventoryItem('cheese', 1, 250)}
                disabled={state.inventory.cheese < 1}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
              >
                Sell (₹250)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Egg Sorting & Packing Facility */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          2. Egg Sorting & Packaging Station (Stock: {state.inventory.eggs} Raw Eggs)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">Single Graded Egg</h4>
                <p className="text-xs text-gray-400">1 raw egg = ₹5</p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">{state.inventory.eggSingle} pk</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => packEggs('single', eggPackQty.single)}
                disabled={state.inventory.eggs < eggPackQty.single}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs"
              >
                Pack ({eggPackQty.single})
              </button>
              <button
                onClick={() => sellInventoryItem('eggSingle', 5, 5)}
                disabled={state.inventory.eggSingle < 5}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Sell 5 (₹25)
              </button>
            </div>
          </div>

          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">Half-Dozen Carton (6×)</h4>
                <p className="text-xs text-gray-400">6 raw eggs = ₹25</p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">{state.inventory.eggHalf} pk</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => packEggs('half', eggPackQty.half)}
                disabled={state.inventory.eggs < eggPackQty.half * 6}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs"
              >
                Pack ({eggPackQty.half})
              </button>
              <button
                onClick={() => sellInventoryItem('eggHalf', 1, 25)}
                disabled={state.inventory.eggHalf < 1}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Sell (₹25)
              </button>
            </div>
          </div>

          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">Dozen Carton (12×)</h4>
                <p className="text-xs text-gray-400">12 raw eggs = ₹45</p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">{state.inventory.eggDozen} pk</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => packEggs('dozen', eggPackQty.dozen)}
                disabled={state.inventory.eggs < eggPackQty.dozen * 12}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-1.5 text-xs"
              >
                Pack ({eggPackQty.dozen})
              </button>
              <button
                onClick={() => sellInventoryItem('eggDozen', 1, 45)}
                disabled={state.inventory.eggDozen < 1}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Sell (₹45)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Leather Tannery & 4. BioGas Soap Refinery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leather Tannery */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
              🥋
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Commercial Leather Tannery</h4>
              <p className="text-xs text-gray-400">Skins: {state.inventory.skins} · Leather: {state.inventory.leather} units</p>
            </div>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Market Price:</span>
              <span className="font-mono font-bold text-purple-400">₹200 / unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Conversion Ratio:</span>
              <span className="font-mono text-gray-300">1 Raw Skin → 1 Cured Leather</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => convertLeather(leatherQty)}
              disabled={state.inventory.skins < leatherQty}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs"
            >
              Tan {leatherQty} Skins
            </button>
            <button
              onClick={() => sellInventoryItem('leather', 1, 200)}
              disabled={state.inventory.leather < 1}
              className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl px-4 py-2 text-xs disabled:opacity-40"
            >
              Sell (₹200)
            </button>
          </div>
        </div>

        {/* BioGas & Organic Soap */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">BioGas Digestor & Soap Refinery</h4>
              <p className="text-xs text-gray-400">Dung: {state.inventory.dung} · Gas: {state.inventory.biogas} u</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="bg-[#0e1420] p-2 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px]">Beauty Soap</span>
              <span className="font-bold text-pink-400">{state.inventory.soapBeauty}</span>
              <button
                onClick={() => craftSoap('beauty', 1)}
                disabled={state.inventory.milk < 1}
                className="mt-1.5 w-full bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 rounded-lg py-1 text-[10px] disabled:opacity-40"
              >
                Craft (₹120)
              </button>
            </div>

            <div className="bg-[#0e1420] p-2 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px]">Organic Soap</span>
              <span className="font-bold text-emerald-400">{state.inventory.soapOrganic}</span>
              <button
                onClick={() => craftSoap('organic', 1)}
                disabled={state.inventory.dung < 1}
                className="mt-1.5 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg py-1 text-[10px] disabled:opacity-40"
              >
                Craft (₹150)
              </button>
            </div>

            <div className="bg-[#0e1420] p-2 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px]">Detergent</span>
              <span className="font-bold text-cyan-400">{state.inventory.soapDetergent}</span>
              <button
                onClick={() => craftSoap('detergent', 1)}
                disabled={state.inventory.biogas < 1}
                className="mt-1.5 w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg py-1 text-[10px] disabled:opacity-40"
              >
                Craft (₹80)
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => convertBioGas(biogasQty)}
              disabled={state.inventory.dung < biogasQty}
              className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs"
            >
              Digest {biogasQty} Dung → BioGas
            </button>
            <button
              onClick={() => sellInventoryItem('biogas', 1, 60)}
              disabled={state.inventory.biogas < 1}
              className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl px-4 py-2 text-xs disabled:opacity-40"
            >
              Sell Gas (₹60)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
