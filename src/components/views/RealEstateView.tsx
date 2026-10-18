/**
 * AR360X — Real Estate, Housing Development & Rental Yields
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Home, Building, Calculator, Plus, Minus, Trash2 } from 'lucide-react';

export const RealEstateView: React.FC = () => {
  const { state, buildHouse, sellHouse, buyFarm, sellFarm, buyLand, sellLand } = useGame();

  const [houseType, setHouseType] = useState<'hut' | 'villa' | 'bungalow' | 'guesthouse' | 'palace'>('villa');
  const [houseSqft, setHouseSqft] = useState<number>(800);
  const [houseQty, setHouseQty] = useState<number>(1);

  // Calculator state
  const [calcType, setCalcType] = useState<'hut' | 'villa' | 'bungalow' | 'guesthouse' | 'palace'>('bungalow');
  const [calcSqft, setCalcSqft] = useState<number>(1500);

  const baseRates = { hut: 600, villa: 1500, bungalow: 2500, guesthouse: 4000, palace: 8000 };
  const rentRates = { hut: 0.05, villa: 0.12, bungalow: 0.18, guesthouse: 0.25, palace: 0.4 };
  const houseIcons = { hut: '🛖', villa: '🏡', bungalow: '🏘️', guesthouse: '🏨', palace: '🏰' };

  const singleUnitCost = Math.round(houseSqft * (baseRates[houseType] / 100));
  const totalBuildCost = singleUnitCost * houseQty;
  const singleDailyRent = Math.round(houseSqft * rentRates[houseType]);

  // Total daily rent
  const dailyRentTotal =
    state.realEstate.farms * 150 +
    state.realEstate.houses.reduce((sum, h) => sum + h.dailyRent, 0);

  // Calculator math
  const calcCost = Math.round(calcSqft * (baseRates[calcType] / 100));
  const calcDailyRent = Math.round(calcSqft * rentRates[calcType]);
  const calcPaybackDays = calcDailyRent > 0 ? Math.ceil(calcCost / calcDailyRent) : 0;
  const calcAnnualRoi = calcCost > 0 ? ((calcDailyRent * 365) / calcCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Real Estate & Property Development Empire</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Construct modular residences, acquire commercial farmland, and collect continuous automated tenant rent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Daily Rent Flow</span>
            <span className="text-base font-bold font-mono text-emerald-400">+₹{dailyRentTotal.toLocaleString()} / day</span>
          </div>
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Properties</span>
            <span className="text-base font-bold font-mono text-purple-400">{state.realEstate.houses.length + state.realEstate.farms} Units</span>
          </div>
        </div>
      </div>

      {/* Modular House Construction Center */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🏗️</span>
            <span>Modular Housing Construction Desk</span>
          </h3>
          <span className="text-xs font-mono text-gray-400">Custom Dimensions & Automatic Tenant Leasing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#0e1420] p-4 rounded-xl border border-white/5 text-xs">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Architecture Type</label>
            <select
              value={houseType}
              onChange={(e) => setHouseType(e.target.value as typeof houseType)}
              className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold"
            >
              <option value="hut">🛖 Rural Eco-Hut (₹6/sqft)</option>
              <option value="villa">🏡 Modern Garden Villa (₹15/sqft)</option>
              <option value="bungalow">🏘️ Suburban Bungalow (₹25/sqft)</option>
              <option value="guesthouse">🏨 Boutique Guest House (₹40/sqft)</option>
              <option value="palace">🏰 Imperial Heritage Palace (₹80/sqft)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Floor Area (Sq. Ft.)</label>
            <input
              type="number"
              value={houseSqft}
              onChange={(e) => setHouseSqft(Math.max(100, Number(e.target.value)))}
              min={100}
              className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Quantity</label>
            <div className="flex items-center bg-[#171f2e] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setHouseQty((q) => Math.max(1, q - 1))}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-3 text-white flex-1 text-center">{houseQty}</span>
              <button
                onClick={() => setHouseQty((q) => q + 1)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={() => buildHouse(houseType, houseSqft, houseQty)}
              disabled={state.finances.cash < totalBuildCost}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl py-2.5 text-xs shadow-lg shadow-purple-600/20 transition-all"
            >
              Construct (₹{totalBuildCost.toLocaleString()})
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-400 font-mono px-1">
          <span>Daily Rent per Unit: <strong className="text-emerald-400">+₹{singleDailyRent}/day</strong></span>
          <span>Payback Period: <strong className="text-cyan-400">{Math.ceil(singleUnitCost / singleDailyRent)} Days</strong></span>
        </div>
      </div>

      {/* Property Portfolio Table */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Residential Holdings Ledger ({state.realEstate.houses.length} Units)</h3>
          <span className="text-xs text-gray-400 font-mono">Resale at 80% build valuation</span>
        </div>

        {state.realEstate.houses.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No properties constructed yet. Build your first villa or bungalow above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase font-mono text-gray-400 border-b border-white/5">
                <tr>
                  <th className="pb-2">Property</th>
                  <th className="pb-2">Sq. Ft.</th>
                  <th className="pb-2">Construction Cost</th>
                  <th className="pb-2">Market Resale</th>
                  <th className="pb-2">Daily Rent</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {state.realEstate.houses.map((h) => (
                  <tr key={h.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-sans font-bold text-white flex items-center gap-2">
                      <span>{houseIcons[h.type]}</span>
                      <span className="capitalize">{h.type}</span>
                    </td>
                    <td className="py-2.5 text-gray-300">{h.sqft} sqft</td>
                    <td className="py-2.5 text-gray-400">₹{h.buildCost.toLocaleString()}</td>
                    <td className="py-2.5 text-cyan-400 font-bold">₹{Math.round(h.buildCost * 0.8).toLocaleString()}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">+₹{h.dailyRent}/day</td>
                    <td className="py-2.5 text-right font-sans">
                      <button
                        onClick={() => sellHouse(h.id)}
                        className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                      >
                        Liquidate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROI & Payback Calculator Card */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          Real Estate Yield & Payback Simulator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Estimated Cost</span>
            <span className="text-base font-bold font-mono text-white mt-1 block">₹{calcCost.toLocaleString()}</span>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Daily Rent Flow</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">+₹{calcDailyRent}/day</span>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Breakeven Time</span>
            <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">{calcPaybackDays} Days</span>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Annualized ROI</span>
            <span className="text-base font-bold font-mono text-amber-400 mt-1 block">{calcAnnualRoi.toFixed(1)}% / yr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
