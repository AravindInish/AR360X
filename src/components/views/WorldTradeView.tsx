/**
 * AR360X — Global Export & NPC Trade Network
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { EXPORT_COUNTRIES_CATALOG, NPC_TRADERS_CATALOG } from '../../constants/initialState';
import { Globe, Users, Handshake, Plane, ArrowRight } from 'lucide-react';

export const WorldTradeView: React.FC = () => {
  const { state, exportGoods, tradeNpc } = useGame();

  const [activeTab, setActiveTab] = useState<'export' | 'npc'>('export');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('usa');
  const [exportProduct, setExportProduct] = useState<string>('ghee');
  const [exportQty, setExportQty] = useState<number>(5);

  const selectedCountry = EXPORT_COUNTRIES_CATALOG.find((c) => c.id === selectedCountryId) || EXPORT_COUNTRIES_CATALOG[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">International Trade & Merchant Network</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch bulk export shipments across 10 global partners and trade with eccentric regional NPC brokers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Export Revenue</span>
            <span className="text-base font-bold font-mono text-emerald-400">₹{state.exports.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#212836] pb-2">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'export' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          ✈️ Global Export Quotas ({EXPORT_COUNTRIES_CATALOG.length} Nations)
        </button>
        <button
          onClick={() => setActiveTab('npc')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'npc' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🤝 NPC Merchant Network ({NPC_TRADERS_CATALOG.length} Traders)
        </button>
      </div>

      {/* TAB 1: GLOBAL EXPORT */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Countries List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
              Available Export Destinations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPORT_COUNTRIES_CATALOG.map((c) => {
                const rep = state.exports.reputation[c.id] || 0;
                const isSelected = c.id === selectedCountryId;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCountryId(c.id)}
                    className={`bg-[#131926] border rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-2 ${
                      isSelected ? 'border-sky-500 shadow-sky-500/10' : 'border-[#212836] hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{c.name}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">Currency: {c.currency}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ×{c.premium} Premium
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 flex justify-between">
                      <span>Demand: {c.focus.join(', ')}</span>
                      <span>Reputation: {rep}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Order Form */}
          <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="text-sm font-bold text-white">Export to {selectedCountry.name}</h3>
                <span className="text-xs text-sky-400 font-bold">Premium Multiplier: ×{selectedCountry.premium}</span>
              </div>
            </div>

            <div className="space-y-3 bg-[#0e1420] p-4 rounded-xl border border-white/5 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Select Export Commodity</label>
                <select
                  value={exportProduct}
                  onChange={(e) => setExportProduct(e.target.value)}
                  className="w-full bg-[#171f2e] border border-white/10 rounded-xl p-2 text-white font-semibold"
                >
                  <option value="ghee">🧈 Pure Desi Ghee (Stock: {state.inventory.ghee})</option>
                  <option value="cheese">🧀 Artisan Cheese (Stock: {state.inventory.cheese})</option>
                  <option value="milk">🥛 Raw Milk (Stock: {state.inventory.milk}L)</option>
                  <option value="eggs">🥚 Fresh Eggs (Stock: {state.inventory.eggs})</option>
                  <option value="leather">🥋 Cured Leather (Stock: {state.inventory.leather})</option>
                  <option value="biogas">⚡ BioGas Fuel (Stock: {state.inventory.biogas})</option>
                  <option value="soapOrganic">🌿 Organic Soap (Stock: {state.inventory.soapOrganic})</option>
                  <option value="face">🧴 Face Cream (Stock: {state.inventory.face})</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Shipment Quantity</label>
                <input
                  type="number"
                  value={exportQty}
                  onChange={(e) => setExportQty(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-full bg-[#171f2e] border border-white/10 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <button
                onClick={() => exportGoods(selectedCountry.id, exportProduct, exportQty)}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl py-2.5 text-xs transition-colors"
              >
                Dispatch Air Cargo ({exportQty} units)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NPC MERCHANTS */}
      {activeTab === 'npc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NPC_TRADERS_CATALOG.map((npc) => {
            const rel = state.npcTrade.relationships[npc.id] || { trust: 0, tradeCount: 0, lastTrade: 0 };

            return (
              <div key={npc.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{npc.avatar}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{npc.name}</h4>
                    <span className="text-[10px] text-gray-400">{npc.role}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300">{npc.desc}</p>

                <div className="space-y-1.5 bg-[#0e1420] p-3 rounded-xl border border-white/5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Trust Level</span>
                    <span className="font-mono font-bold text-sky-400">{rel.trust} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${rel.trust}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 block pt-1">
                    Bonus Threshold: {npc.trustThreshold} trust (+₹{npc.trustReward.toLocaleString()})
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">They Buy from You:</span>
                  {npc.buys.map((b) => (
                    <div key={b.key} className="flex justify-between items-center p-2 rounded-lg bg-[#0e1420] text-xs font-mono">
                      <span>{b.minQty}× {b.key} @ ₹{b.price}</span>
                      <button
                        onClick={() => tradeNpc(npc.id, 'sell', b.key, b.minQty)}
                        className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-sans font-semibold text-xs"
                      >
                        Sell to NPC
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
