/**
 * AR360X — Commercial Enterprises & Business Empire
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BUSINESS_CATALOG, PARTNER_CATALOG } from '../../constants/initialState';
import { Building2, Plus, Minus, ArrowUpRight, Handshake, DollarSign, Star } from 'lucide-react';

export const BusinessView: React.FC = () => {
  const {
    state,
    openBusiness,
    upgradeBusiness,
    injectBusinessCapital,
    partnerBusiness,
    closeBusiness,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'owned' | 'catalog' | 'partners'>('owned');
  const [selectedBizId, setSelectedBizId] = useState<number>(state.businesses[0]?.id || 1);
  const [capitalInjectAmt, setCapitalInjectAmt] = useState<number>(10000);

  const selectedBiz = state.businesses.find((b) => b.id === selectedBizId);
  const selectedConfig = BUSINESS_CATALOG.find((c) => c.id === selectedBiz?.catalogId);

  const totalDailyBizNet = state.businesses.reduce((sum, b) => {
    const config = BUSINESS_CATALOG.find((c) => c.id === b.catalogId);
    if (!config) return sum;
    const tierRevMult = config.tierRevMult[b.tier - 1] || 1;
    const extraBoost = 1 + Math.min(2.0, (b.extraInvestment || 0) / (config.openCost * 5));
    const grossRev = config.dailyRev * tierRevMult * extraBoost * b.qty;
    const grossExp = config.dailyExp * tierRevMult * b.qty;
    return sum + (grossRev - grossExp);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Commercial Enterprise & Franchise Empire</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Establish cafes, supermarkets, solar power plants, IT agencies, and hypermarkets. Inject capital and sign investor partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Daily Enterprise Net</span>
            <span className="text-base font-bold font-mono text-emerald-400">+₹{Math.round(totalDailyBizNet).toLocaleString()} / day</span>
          </div>
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">All-Time Profits</span>
            <span className="text-base font-bold font-mono text-cyan-400">₹{Math.round(state.bizAllTimeEarned).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#212836] pb-2">
        <button
          onClick={() => setActiveTab('owned')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'owned' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🏢 Active Businesses ({state.businesses.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'catalog' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🏪 New Enterprise Opportunities ({BUSINESS_CATALOG.length})
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'partners' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🤝 Investor & Partner Deals ({PARTNER_CATALOG.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE BUSINESSES */}
      {activeTab === 'owned' && (
        <div className="space-y-4">
          {state.businesses.length === 0 ? (
            <div className="bg-[#131926] border border-[#212836] rounded-2xl p-10 text-center space-y-3">
              <span className="text-4xl block">🏢</span>
              <h3 className="text-base font-bold text-white">No commercial businesses launched yet!</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Explore the Opportunities tab to open your first coffee shop, bakery, supermarket, or medical clinic.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Browse Enterprise Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.businesses.map((biz) => {
                const config = BUSINESS_CATALOG.find((c) => c.id === biz.catalogId);
                if (!config) return null;

                const tierRevMult = config.tierRevMult[biz.tier - 1] || 1;
                const extraBoost = 1 + Math.min(2.0, (biz.extraInvestment || 0) / (config.openCost * 5));
                const estDailyRev = Math.round(config.dailyRev * tierRevMult * extraBoost * biz.qty);
                const estDailyExp = Math.round(config.dailyExp * tierRevMult * biz.qty);
                const estNet = estDailyRev - estDailyExp;

                const tierNames = ['Starter Outlet', 'Regional Franchise', 'National Megacorp'];
                const canUpgrade = biz.tier < config.maxTier;
                const upgCost = canUpgrade ? config.tierUpCost[biz.tier - 1] : 0;

                return (
                  <div key={biz.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{config.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{config.name}</h4>
                          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                            Tier {biz.tier}: {tierNames[biz.tier - 1]}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {biz.qty} branches
                      </span>
                    </div>

                    <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Revenue:</span>
                        <span className="text-emerald-400 font-bold">+₹{estDailyRev.toLocaleString()}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Expenses:</span>
                        <span className="text-rose-400 font-bold">-₹{estDailyExp.toLocaleString()}/day</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1">
                        <span className="text-gray-400 font-sans">Net Cash Flow:</span>
                        <span className="text-cyan-400 font-bold">+₹{estNet.toLocaleString()}/day</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 flex justify-between items-center">
                      <span>Reputation: {biz.reputation.toFixed(1)} / 5.0 ⭐</span>
                      <span>Extra Capital: ₹{biz.extraInvestment.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {canUpgrade ? (
                        <button
                          onClick={() => upgradeBusiness(biz.id)}
                          disabled={state.finances.cash < upgCost}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
                        >
                          Upgrade (₹{upgCost.toLocaleString()})
                        </button>
                      ) : (
                        <span className="flex-1 py-2 text-center text-xs font-bold text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          Max Tier Achieved
                        </span>
                      )}
                      <button
                        onClick={() => closeBusiness(biz.id)}
                        className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl px-3 py-2 text-xs font-semibold"
                        title="Liquidate business"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUSINESS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUSINESS_CATALOG.map((biz) => {
            const owned = state.businesses.find((b) => b.catalogId === biz.id);
            const canAfford = state.finances.cash >= biz.openCost;
            const netDaily = biz.dailyRev - biz.dailyExp;

            return (
              <div key={biz.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{biz.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{biz.name}</h4>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">{biz.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a2336] text-gray-300 border border-white/5">
                    {biz.riskLevel} Risk
                  </span>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2">{biz.desc}</p>

                <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Launch Cost:</span>
                    <span className="text-white font-bold">₹{biz.openCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Net Profit:</span>
                    <span className="text-emerald-400 font-bold">+₹{netDaily.toLocaleString()} / day</span>
                  </div>
                </div>

                <button
                  onClick={() => openBusiness(biz.id, 1)}
                  disabled={!canAfford}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold rounded-xl py-2.5 text-xs shadow-lg shadow-cyan-600/20 transition-all"
                >
                  {owned ? `Open Additional Branch (₹${biz.openCost.toLocaleString()})` : `Launch Enterprise (₹${biz.openCost.toLocaleString()})`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PARTNERS & INVESTORS */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNER_CATALOG.map((partner) => (
            <div key={partner.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{partner.avatar}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{partner.name}</h4>
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">{partner.title}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">{partner.desc}</p>

              <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Capital Injection:</span>
                  <span className="text-white font-bold">₹{partner.investMin.toLocaleString()} - ₹{partner.investMax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Share:</span>
                  <span className="text-amber-400 font-bold">{partner.revSharePct}% of Gross</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-400 space-y-1">
                {partner.perks.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              {state.businesses.length > 0 ? (
                <button
                  onClick={() => partnerBusiness(state.businesses[0].id, partner.id, partner.investMin)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl py-2 text-xs transition-colors"
                >
                  Partner with {partner.name.split(' ')[0]} (+₹{partner.investMin.toLocaleString()})
                </button>
              ) : (
                <p className="text-[11px] text-gray-500 text-center">Open a business first to attract partners.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
