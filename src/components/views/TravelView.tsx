/**
 * AR360X — World Expeditions & Regional Flight Buffs
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { COUNTRIES_TRAVEL_CATALOG } from '../../constants/initialState';
import { Plane, MapPin, CheckCircle2 } from 'lucide-react';

export const TravelView: React.FC = () => {
  const { state, travelToCountry } = useGame();

  const current = COUNTRIES_TRAVEL_CATALOG.find((c) => c.id === state.travel.currentCountry) || COUNTRIES_TRAVEL_CATALOG[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Global Aviation & Trade Expeditions</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Charter business flights to international economic centers to acquire capital grants, livestock genetics, and stock advantages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Current Location</span>
            <span className="text-base font-bold text-white flex items-center gap-1.5">
              <span>{current.flag}</span>
              <span>{current.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Countries Flight Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COUNTRIES_TRAVEL_CATALOG.map((c) => {
          const isCurrent = state.travel.currentCountry === c.id;
          const isVisited = state.travel.visitedCountries.includes(c.id);
          const canFly = state.finances.cash >= c.cost;

          return (
            <div
              key={c.id}
              className={`bg-[#131926] border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                isCurrent ? 'border-emerald-500 shadow-emerald-500/10' : 'border-[#212836] hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <span className="text-[10px] text-gray-400 font-mono">{c.region}</span>
                  </div>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> HERE
                  </span>
                ) : isVisited ? (
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/20">
                    Visited
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-gray-300">{c.desc}</p>

              {/* Perks List */}
              <div className="bg-[#0e1420] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Flight Bonuses:</span>
                {c.bonuses.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-emerald-400">
                    <span>{b.icon}</span>
                    <span className="text-gray-300">{b.label}:</span>
                    <span className="font-bold">{b.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono font-bold text-white">
                  {c.isHome ? 'Free (Return)' : `Flight: ₹${c.cost.toLocaleString()}`}
                </span>
                <button
                  onClick={() => travelToCountry(c.id)}
                  disabled={isCurrent || (!c.isHome && !canFly)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                  }`}
                >
                  {isCurrent ? 'Current City' : c.isHome ? 'Return Home' : 'Book Flight'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
