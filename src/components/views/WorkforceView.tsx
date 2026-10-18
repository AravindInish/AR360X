/**
 * AR360X — Workforce Management & Task Automation
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { WORKER_CATALOG } from '../../constants/initialState';
import { Users, Sliders, CheckCircle2, DollarSign } from 'lucide-react';

export const WorkforceView: React.FC = () => {
  const { state, hireWorker, fireWorker, updateWorkerAllocations } = useGame();

  const totalWages = state.workers.reduce((s, w) => s + w.cost, 0);

  const isMeeraHired = state.workers.some((w) => w.bonus === 'dairyproc');
  const isRajanHired = state.workers.some((w) => w.bonus === 'livestockbuyer');
  const isSelviHired = state.workers.some((w) => w.bonus === 'eggfactory');
  const isKumarHired = state.workers.some((w) => w.bonus === 'biogasman');
  const isMuruganHired = state.workers.some((w) => w.bonus === 'leathersmith');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Workforce Management & Automation Roster</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Recruit specialized farmhands, factory leads, accountants, and brokers to automate daily enterprise routines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Daily Payroll</span>
            <span className="text-base font-bold font-mono text-rose-400">-₹{totalWages.toLocaleString()} / day</span>
          </div>
        </div>
      </div>

      {/* Automation Allocation Controls (shown when respective supervisors are hired) */}
      {(isMeeraHired || isRajanHired || isSelviHired || isKumarHired || isMuruganHired) && (
        <div className="bg-[#131926] border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Automation Allocation Protocols
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Meera Dairy Allocation */}
            {isMeeraHired && (
              <div className="bg-[#0e1420] p-4 rounded-xl border border-white/5 space-y-2">
                <h4 className="font-bold text-emerald-400">👩‍🏭 Meera — Dairy Processing Allocation</h4>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Ghee: {state.allocations.dairyProcessor.ghee}%</span>
                    <span>Cheese: {state.allocations.dairyProcessor.cheese}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ice Cream: {state.allocations.dairyProcessor.ice}%</span>
                    <span>Face Cream: {state.allocations.dairyProcessor.face}%</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-gray-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.allocations.dairyProcessor.autoSell}
                    onChange={(e) =>
                      updateWorkerAllocations('dairyProcessor', {
                        ...state.allocations.dairyProcessor,
                        autoSell: e.target.checked,
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                  <span>Auto-liquidate finished products to cash daily</span>
                </label>
              </div>
            )}

            {/* Rajan Livestock Buyer */}
            {isRajanHired && (
              <div className="bg-[#0e1420] p-4 rounded-xl border border-white/5 space-y-2">
                <h4 className="font-bold text-emerald-400">🤠 Rajan — Auto-Replacement Livestock Buyer</h4>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-gray-400">Budget Cap:</span>
                  <input
                    type="number"
                    value={state.allocations.livestockBuyer.budgetCap}
                    onChange={(e) =>
                      updateWorkerAllocations('livestockBuyer', {
                        ...state.allocations.livestockBuyer,
                        budgetCap: Number(e.target.value),
                      })
                    }
                    className="w-24 bg-[#171f2e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <label className="flex items-center gap-2 text-gray-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.allocations.livestockBuyer.enabled}
                    onChange={(e) =>
                      updateWorkerAllocations('livestockBuyer', {
                        ...state.allocations.livestockBuyer,
                        enabled: e.target.checked,
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                  <span>Enable automatic replacements</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workers Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKER_CATALOG.map((worker) => {
          const isHired = state.workers.some((w) => w.id === worker.id);
          const upfront = worker.cost * 3;

          return (
            <div key={worker.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{worker.emoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{worker.name}</h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">{worker.role}</span>
                  </div>
                </div>
                {isHired && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    HIRED
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-300">{worker.desc}</p>

              <div className="bg-[#0e1420] p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400">Salary:</span>
                <span className="text-amber-400 font-bold">₹{worker.cost} / day</span>
              </div>

              {isHired ? (
                <button
                  onClick={() => fireWorker(worker.id)}
                  className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Terminate Contract
                </button>
              ) : (
                <button
                  onClick={() => hireWorker(worker.id)}
                  disabled={state.finances.cash < upfront}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20"
                >
                  Hire Worker (Upfront: ₹{upfront.toLocaleString()})
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
