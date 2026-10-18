/**
 * AR360X — Top Navigation & Real-Time Status Bar
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { WEATHER_CONDITIONS } from '../../constants/initialState';
import { Box, Play, Pause, FastForward } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    state,
    netWorthData,
    isPaused,
    speed,
    setSpeed,
    togglePause,
    advanceDayManually,
    setShow3DModal,
  } = useGame();

  const currentWeather = WEATHER_CONDITIONS[state.weather.current] || WEATHER_CONDITIONS.sunny;

  const totalBank = state.bankAccounts.reduce((sum, b) => sum + b.balance, 0) + state.finances.bankLegacy;
  const totalLoan = state.activeLoans.reduce((sum, l) => sum + l.amount, 0) + state.creditCards.reduce((sum, c) => sum + c.outstanding, 0);

  const formatShort = (n: number) => {
    if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(Math.floor(state.clock.simMinutes / 60));
  const mm = pad(state.clock.simMinutes % 60);

  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] px-3 sm:px-5 h-14 flex items-center gap-3 select-none">
      {/* Title */}
      <div className="flex items-center gap-2 shrink-0">
        <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#00d4aa] flex items-center gap-1.5 font-mono">
          <span>AR360X</span>
          <span className="text-[10px] bg-[#00d4aa]/15 text-[#00d4aa] px-1.5 py-0.5 rounded border border-[#00d4aa]/30">v21</span>
        </h1>
      </div>

      <div className="w-[1px] h-7 bg-[#30363d] shrink-0 hidden sm:block"></div>

      {/* Top Stats: Cash, Bank, Debt */}
      <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-1">
        <div className="flex flex-col shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e]">Cash</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${state.finances.cash < 0 ? 'text-[#f85149]' : 'text-[#e6edf3]'}`}>
            {formatShort(state.finances.cash)}
          </span>
        </div>

        <div className="flex flex-col shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e]">Bank</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-[#58a6ff]">
            {formatShort(totalBank)}
          </span>
        </div>

        <div className="flex flex-col shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e]">Loan</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${totalLoan > 0 ? 'text-[#f85149]' : 'text-[#8b949e]'}`}>
            {formatShort(totalLoan)}
          </span>
        </div>
      </div>

      {/* Right Cluster: Speed, Clock, Net Worth, 3D */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {/* Speed Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-lg p-0.5 font-mono text-xs">
          <button
            onClick={togglePause}
            className={`p-1 rounded transition-colors ${isPaused ? 'bg-[#ffd700]/20 text-[#ffd700]' : 'text-[#8b949e] hover:text-white'}`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                speed === s && !isPaused ? 'bg-[#00d4aa]/20 text-[#00d4aa] font-bold border border-[#00d4aa]/40' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              {s}×
            </button>
          ))}
          <button
            onClick={advanceDayManually}
            className="p-1 rounded text-[#8b949e] hover:text-[#00d4aa]"
            title="Skip 1 Day"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sim Clock */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs font-mono text-[#8b949e]">
          <span className="text-[#00d4aa] font-semibold">Day {state.clock.dayCount}</span>
          <span>·</span>
          <span>{pad(state.clock.simDate.day)}-{pad(state.clock.simDate.month)}-{state.clock.simDate.year}</span>
          <span>·</span>
          <span className="text-white font-bold">{hh}:{mm}</span>
        </div>

        {/* Weather Tag */}
        <div
          className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border"
          style={{
            backgroundColor: `${currentWeather.color}15`,
            borderColor: `${currentWeather.color}40`,
            color: currentWeather.color,
          }}
          title={currentWeather.desc}
        >
          <span>{currentWeather.icon}</span>
          <span>{currentWeather.name.split(' ')[0]}</span>
        </div>

        {/* Net Worth Badge */}
        <div className="bg-[#00d4aa]/15 border border-[#00d4aa]/30 text-[#00d4aa] rounded-lg px-2.5 py-1 text-xs font-bold font-mono">
          NW: {formatShort(netWorthData.netWorth)}
        </div>

        {/* 3D Diorama Launch Button */}
        <button
          onClick={() => setShow3DModal(true)}
          className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-[#00d4aa]/30 transition-all active:scale-95"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">3D View</span>
        </button>
      </div>
    </header>
  );
};
