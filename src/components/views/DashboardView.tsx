/**
 * AR360X — Flagship Interactive Dashboard
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { FarmDiorama } from '../3d/FarmDiorama';
import {
  TrendingUp,
  Box,
  Zap,
  ArrowUpRight,
  Search,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { state, netWorthData, setActiveTab, setShow3DModal } = useGame();

  const totalAnimals = Object.values(state.livestock).reduce((s, a) => s + a.count, 0);
  const totalBank = state.bankAccounts.reduce((sum, b) => sum + b.balance, 0) + state.finances.bankLegacy;
  const totalDebt = state.activeLoans.reduce((sum, l) => sum + l.amount, 0) + state.creditCards.reduce((sum, c) => sum + c.outstanding, 0);

  const formatShort = (n: number) => {
    if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  const quickTiles = [
    { icon: '🥛', label: 'Sell Dairy', tab: 'factories', badge: `${state.inventory.milk}L` },
    { icon: '🐄', label: 'Livestock Ranch', tab: 'livestock', badge: `${totalAnimals}` },
    { icon: '🌾', label: 'Crops & Land', tab: 'crops', badge: `${state.agriculture.landOwned}ac` },
    { icon: '🏦', label: 'Multi-Bank', tab: 'banking', badge: `${state.bankAccounts.length}` },
    { icon: '📈', label: 'Stock Exchange', tab: 'stocks', badge: '8 Cos' },
    { icon: '₿', label: 'Crypto Pit', tab: 'crypto', badge: 'BTC' },
    { icon: '🏠', label: 'Real Estate', tab: 'realestate', badge: `${state.realEstate.houses.length}` },
    { icon: '🏢', label: 'Enterprises', tab: 'businesses', badge: `${state.businesses.length}` },
    { icon: '🍽️', label: 'Restaurants', tab: 'ventures', badge: `${state.restaurants.length}` },
    { icon: '🏥', label: 'Hospitals', tab: 'ventures', badge: `${state.hospitals.length}` },
    { icon: '🚜', label: 'Fleet Rental', tab: 'ventures', badge: `${state.equipmentFleet.length}` },
    { icon: '🌍', label: 'Global Exports', tab: 'worldtrade', badge: '10 Cntr' },
    { icon: '🤝', label: 'NPC Traders', tab: 'worldtrade', badge: '6 NPC' },
    { icon: '🎰', label: 'Casino & Wheel', tab: 'minigames', badge: 'JACKPOT' },
    { icon: '✈️', label: 'World Travel', tab: 'travel', badge: 'Expedition' },
    { icon: '🧠', label: 'Skill Research', tab: 'skills', badge: `${state.player.skillPoints} SP` },
    { icon: '🎯', label: 'Missions', tab: 'missions', badge: 'Goals' },
    { icon: '📊', label: 'Financial Audit', tab: 'analytics', badge: 'Balance' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Search & Alerts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>🏠</span>
            <span>Empire Dashboard</span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Real-time management command across livestock, manufacturing, financial markets, and commercial ventures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShow3DModal(true)}
            className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#00d4aa]/30 transition-all hover:scale-105 active:scale-95"
          >
            <Box className="w-4 h-4" />
            <span>Launch 3D Ranch</span>
          </button>
        </div>
      </div>

      {/* Critical Alerts Banner (if any) */}
      {totalDebt > 50000 && (
        <div className="bg-[#f85149]/10 border border-[#f85149]/40 rounded-xl p-3 text-xs text-[#f85149] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Notice: High total liabilities ({formatShort(totalDebt)}). Check your repayment schedule under Banking to avoid interest penalties.</span>
        </div>
      )}

      {/* 6 AR360X Big Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="ar-card text-center p-3.5">
          <span className="text-2xl mb-1 block">💰</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block font-bold">Net Worth</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#00d4aa] block truncate">
            {formatShort(netWorthData.netWorth)}
          </span>
        </div>

        <div className="ar-card text-center p-3.5">
          <span className="text-2xl mb-1 block">💵</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block font-bold">Liquid Cash</span>
          <span className={`text-base sm:text-lg font-bold font-mono block truncate ${state.finances.cash < 0 ? 'text-[#f85149]' : 'text-white'}`}>
            {formatShort(state.finances.cash)}
          </span>
        </div>

        <div className="ar-card text-center p-3.5">
          <span className="text-2xl mb-1 block">🏦</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block font-bold">Bank Balance</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#58a6ff] block truncate">
            {formatShort(totalBank)}
          </span>
        </div>

        <div className="ar-card text-center p-3.5">
          <span className="text-2xl mb-1 block">💳</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block font-bold">Total Debt</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#f85149] block truncate">
            {formatShort(totalDebt)}
          </span>
        </div>

        <div className="ar-card text-center p-3.5">
          <span className="text-2xl mb-1 block">🐄</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block font-bold">Livestock</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#ffd700] block truncate">
            {totalAnimals} heads
          </span>
        </div>

        <div className="ar-card text-center p-3.5">
          <span className="text-2xl mb-1 block">🏢</span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block font-bold">Enterprises</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#bc8cff] block truncate">
            {state.businesses.length} active
          </span>
        </div>
      </div>

      {/* Embedded 3D Viewport Diorama */}
      <div className="ar-card p-0 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Live Interactive 3D Farm Diorama
            </span>
          </div>
          <span className="text-[11px] text-[#8b949e] font-mono">Orbit / Zoom / Inspect Ranch Assets</span>
        </div>
        <FarmDiorama gameState={state} isModal={false} />
      </div>

      {/* ⚡ Quick Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b949e] font-mono flex items-center gap-1.5">
            <span className="text-amber-400">⚡</span>
            <span>Quick Action Launchpad</span>
          </h3>
          <span className="text-[11px] text-[#6e7681] font-mono">Click any icon to jump directly into action</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2.5">
          {quickTiles.map((tile) => (
            <button
              key={tile.label}
              onClick={() => setActiveTab(tile.tab)}
              className="ar-card p-3 flex flex-col items-center justify-center text-center hover:border-[#00d4aa] hover:bg-[#00d4aa]/5 transition-all group active:scale-95 cursor-pointer relative"
            >
              {tile.badge && (
                <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold text-[#00d4aa] bg-[#00d4aa]/15 px-1 rounded border border-[#00d4aa]/30">
                  {tile.badge}
                </span>
              )}
              <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                {tile.icon}
              </span>
              <span className="text-xs font-bold text-white group-hover:text-[#00d4aa] transition-colors leading-tight">
                {tile.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Asset Valuation Breakdown & Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Breakdown Card */}
        <div className="ar-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <span>📊</span>
              <span>Asset Valuation Balance</span>
            </h4>
            <span className="text-xs font-mono font-bold text-[#00d4aa]">
              {formatShort(netWorthData.totalAssets)}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#21262d]">
              <span className="text-[#8b949e]">Cash & Banking Liquidity</span>
              <span className="text-white font-bold">{formatShort(netWorthData.breakdown.cash + netWorthData.breakdown.bank)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#212836]">
              <span className="text-[#8b949e]">Equities, Crypto & FDs</span>
              <span className="text-white font-bold">{formatShort(netWorthData.breakdown.investments)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#212836]">
              <span className="text-[#8b949e]">Livestock Herd</span>
              <span className="text-white font-bold">{formatShort(netWorthData.breakdown.livestock)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#212836]">
              <span className="text-[#8b949e]">Inventory & Goods</span>
              <span className="text-white font-bold">{formatShort(netWorthData.breakdown.products)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#212836]">
              <span className="text-[#8b949e]">Real Estate & Land</span>
              <span className="text-white font-bold">{formatShort(netWorthData.breakdown.realEstate + netWorthData.breakdown.crops)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8b949e]">Commercial Enterprises</span>
              <span className="text-white font-bold">{formatShort(netWorthData.breakdown.enterprises + netWorthData.breakdown.equipment)}</span>
            </div>
          </div>
        </div>

        {/* Live Operations & Market Feed */}
        <div className="lg:col-span-2 ar-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <span>📋</span>
              <span>Recent Operations & Market Events</span>
            </h4>
            <span className="text-[10px] text-[#6e7681] font-mono">Live Activity</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
            {state.eventLog.slice(0, 7).map((ev) => {
              const borderStyles = {
                success: 'border-l-2 border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]',
                warn: 'border-l-2 border-[#d29922] bg-[#d29922]/10 text-[#d29922]',
                danger: 'border-l-2 border-[#f85149] bg-[#f85149]/10 text-[#f85149]',
                info: 'border-l-2 border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]',
              };

              return (
                <div
                  key={ev.id}
                  className={`p-2.5 rounded-r-lg text-xs flex items-start justify-between gap-3 ${borderStyles[ev.type]}`}
                >
                  <p className="flex-1 leading-snug">{ev.msg}</p>
                  <span className="text-[10px] opacity-75 font-mono whitespace-nowrap">
                    Day {ev.day} · {ev.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
