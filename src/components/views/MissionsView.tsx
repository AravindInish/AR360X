/**
 * AR360X — Missions, Milestones & Achievements
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { Award, Trophy, CheckCircle2, Circle } from 'lucide-react';

interface MissionDef {
  id: string;
  name: string;
  desc: string;
  reward: number;
  icon: string;
  check: (s: any) => boolean;
}

const MISSIONS: MissionDef[] = [
  { id: 'm1', name: 'First Cattle Acquisition', desc: 'Own at least 3 Dairy Cows', reward: 1500, icon: '🐄', check: (s) => s.livestock.Cow.count >= 3 },
  { id: 'm2', name: 'Dairy Producer', desc: 'Accumulate 100L of Raw Milk in inventory', reward: 2500, icon: '🥛', check: (s) => s.inventory.milk >= 100 },
  { id: 'm3', name: 'Egg Tycoon', desc: 'Own at least 25 Poultry Chickens', reward: 2000, icon: '🥚', check: (s) => s.livestock.Chicken.count >= 25 },
  { id: 'm4', name: 'Green Harvest', desc: 'Cultivate 10 or more acres of Farmland', reward: 3000, icon: '🌾', check: (s) => s.agriculture.landOwned >= 10 },
  { id: 'm5', name: 'Ghee Master', desc: 'Store 10 units of finished Pure Desi Ghee', reward: 2000, icon: '🧈', check: (s) => s.inventory.ghee >= 10 },
  { id: 'm6', name: 'Clean Energy Pioneer', desc: 'Refine 20 units of BioGas from farm waste', reward: 1800, icon: '⚡', check: (s) => s.inventory.biogas >= 20 },
  { id: 'm7', name: 'Bank Account Expansion', desc: 'Open accounts across 3 different banks', reward: 4000, icon: '🏛️', check: (s) => s.bankAccounts.length >= 3 },
  { id: 'm8', name: 'Wall Street Trader', desc: 'Hold 50 shares of any listed company', reward: 3500, icon: '📈', check: (s) => s.stocks.some((st: any) => st.holding >= 50) },
  { id: 'm9', name: 'Crypto Holder', desc: 'Hold at least 0.01 Bitcoin', reward: 5000, icon: '₿', check: (s) => (s.cryptoCoins.find((c: any) => c.id === 'btc')?.holding || 0) >= 0.01 },
  { id: 'm10', name: 'Housing Developer', desc: 'Construct at least 2 residential villas or bungalows', reward: 6000, icon: '🏡', check: (s) => s.realEstate.houses.length >= 2 },
  { id: 'm11', name: 'Franchise Builder', desc: 'Operate at least 2 commercial businesses', reward: 5000, icon: '🏢', check: (s) => s.businesses.length >= 2 },
  { id: 'm12', name: 'International Aviator', desc: 'Fly on an expedition to at least 2 countries', reward: 8000, icon: '✈️', check: (s) => s.travel.visitedCountries.length >= 2 },
  { id: 'm13', name: 'First Millionaire', desc: 'Reach a Total Net Worth exceeding ₹1,00,000', reward: 15000, icon: '💎', check: (s) => s.history.netWorth[s.history.netWorth.length - 1] >= 100000 },
];

export const MissionsView: React.FC = () => {
  const { state } = useGame();

  const completedCount = MISSIONS.filter((m) => m.check(state)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Imperial Missions & Milestones</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Complete strategic business objectives to gain capital grants and prestigious milestone badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Missions Cleared</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {completedCount} / {MISSIONS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MISSIONS.map((m) => {
          const isDone = m.check(state);

          return (
            <div
              key={m.id}
              className={`bg-[#131926] border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4 transition-all ${
                isDone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[#212836]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl p-2 rounded-xl bg-[#0e1420] border border-white/5">{m.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {m.name}
                    {isDone && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        COMPLETED
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                  <span className="text-xs font-mono font-bold text-amber-400 mt-2 block">
                    Reward: +₹{m.reward.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
