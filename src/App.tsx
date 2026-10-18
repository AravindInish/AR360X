/**
 * AR360X — Ultimate Livestock & Business Empire Simulator
 * Main Application Entry with 3-Layer Navigation Shell
 */
import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/layout/Header';
import { NavigationShell } from './components/layout/Sidebar';
import { FarmDiorama } from './components/3d/FarmDiorama';

// Views
import { DashboardView } from './components/views/DashboardView';
import { LivestockView } from './components/views/LivestockView';
import { CropsView } from './components/views/CropsView';
import { FactoriesView } from './components/views/FactoriesView';
import { MarketView } from './components/views/MarketView';
import { BankingView } from './components/views/BankingView';
import { StocksView } from './components/views/StocksView';
import { CryptoView } from './components/views/CryptoView';
import { RealEstateView } from './components/views/RealEstateView';
import { BusinessView } from './components/views/BusinessView';
import { VenturesView } from './components/views/VenturesView';
import { WorldTradeView } from './components/views/WorldTradeView';
import { TravelView } from './components/views/TravelView';
import { MiniGamesView } from './components/views/MiniGamesView';
import { WorkforceView } from './components/views/WorkforceView';
import { SkillsView } from './components/views/SkillsView';
import { MissionsView } from './components/views/MissionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab, show3DModal, setShow3DModal, state } = useGame();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'livestock':
        return <LivestockView />;
      case 'crops':
        return <CropsView />;
      case 'factories':
        return <FactoriesView />;
      case 'marketplace':
        return <MarketView />;
      case 'banking':
        return <BankingView />;
      case 'stocks':
        return <StocksView />;
      case 'crypto':
        return <CryptoView />;
      case 'realestate':
        return <RealEstateView />;
      case 'businesses':
        return <BusinessView />;
      case 'ventures':
        return <VenturesView />;
      case 'worldtrade':
        return <WorldTradeView />;
      case 'travel':
        return <TravelView />;
      case 'minigames':
        return <MiniGamesView />;
      case 'workforce':
        return <WorkforceView />;
      case 'skills':
        return <SkillsView />;
      case 'missions':
        return <MissionsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const tickerItems: { id: string; text: string; isUp: boolean; isGold?: boolean }[] = [
    ...state.stocks.map((s) => {
      const prev = s.history[s.history.length - 2] || s.price;
      const isUp = s.price >= prev;
      return {
        id: s.id,
        text: `${s.id} ${isUp ? '▲' : '▼'}₹${s.price}`,
        isUp,
      };
    }),
    ...state.cryptoCoins.map((c) => {
      const prev = c.history[c.history.length - 2] || c.price;
      const isUp = c.price >= prev;
      return {
        id: c.symbol,
        text: `${c.icon} ${c.symbol} ${isUp ? '▲' : '▼'}₹${c.price.toLocaleString()}`,
        isUp,
      };
    }),
    ...state.commodities.map((cm) => ({
      id: cm.name,
      text: `${cm.name} ₹${cm.price.toLocaleString()}`,
      isUp: true,
      isGold: true,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col font-sans selection:bg-[#00d4aa]/30 selection:text-[#00d4aa]">
      <Header />

      {/* AR360X Continuous Scrolling Ticker Tape */}
      <div className="bg-[#161b22] border-b border-[#30363d] h-7 overflow-hidden flex items-center text-xs font-mono select-none">
        <div className="ticker-anim flex items-center gap-8 pl-full">
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={`${item.id}_${idx}`} className="inline-flex items-center gap-1.5 shrink-0">
              <span
                className={
                  item.isGold
                    ? 'text-[#ffd700] font-bold'
                    : item.isUp
                    ? 'text-[#3fb950] font-semibold'
                    : 'text-[#f85149] font-semibold'
                }
              >
                {item.text}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* 3-Layer Navigation & Page Shell */}
      <NavigationShell>
        {renderActiveView()}
      </NavigationShell>

      {/* Fullscreen 3D Diorama Modal */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
          <div className="relative w-full h-full md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a1118]">
            <FarmDiorama gameState={state} onClose={() => setShow3DModal(false)} isModal={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
