/**
 * AR360X — Skill Tree & Enterprise Advantages
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { SKILL_TREE_NODES } from '../../constants/initialState';
import { Brain, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export const SkillsView: React.FC = () => {
  const { state, unlockSkill } = useGame();

  const categories = [
    { id: 'dairy', title: '🥛 Dairy & Livestock Mastery' },
    { id: 'agri', title: '🌾 Agronomy & Crop Genetics' },
    { id: 'finance', title: '📈 Financial & Capital Markets' },
    { id: 'real', title: '🏠 Real Estate & Hospitality' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Technological Research & Skill Tree</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Unlock research nodes to permanently boost yields, cut interest rates, accelerate crop cycles, and automate facilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-violet-400 font-mono block">Available Points</span>
            <span className="text-base font-bold font-mono text-violet-300 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-violet-400" />
              {state.player.skillPoints} SP
            </span>
          </div>
        </div>
      </div>

      {/* 4 Skill Categories */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const nodes = SKILL_TREE_NODES.filter((n) => n.category === cat.id);

          return (
            <div key={cat.id} className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {cat.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {nodes.map((node) => {
                  const isUnlocked = state.unlockedSkills.includes(node.id);
                  const isReqMet = !node.requires || state.unlockedSkills.includes(node.requires);
                  const canAfford = state.player.skillPoints >= node.cost;

                  return (
                    <div
                      key={node.id}
                      className={`bg-[#131926] border rounded-2xl p-4 shadow-sm space-y-3 transition-all ${
                        isUnlocked
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : isReqMet
                          ? 'border-[#212836] hover:border-violet-500/50'
                          : 'border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {isUnlocked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : !isReqMet ? (
                            <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                          )}
                          <span>{node.name}</span>
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                          {node.cost} SP
                        </span>
                      </div>

                      <p className="text-xs text-gray-400">{node.desc}</p>

                      {node.requires && !isUnlocked && (
                        <div className="text-[10px] text-amber-400">
                          Prereq: {SKILL_TREE_NODES.find((n) => n.id === node.requires)?.name}
                        </div>
                      )}

                      <div>
                        {isUnlocked ? (
                          <span className="w-full block py-1.5 rounded-lg text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            UNLOCKED
                          </span>
                        ) : (
                          <button
                            onClick={() => unlockSkill(node.id)}
                            disabled={!isReqMet || !canAfford}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-1.5 rounded-lg text-xs transition-colors"
                          >
                            {!isReqMet ? 'Prerequisite Required' : canAfford ? 'Research Upgrade' : 'Need More SP'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
