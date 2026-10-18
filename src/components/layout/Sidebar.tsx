/**
 * AR360X — 3-Layer Navigation Shell
 * Layer 1: Category Sidebar (Iconic 44x44 buttons)
 * Layer 2: Sub-Nav Bar (Pill buttons per category)
 * Layer 3: Bottom Dock & Quick Action Floating Panel
 */
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Search, Zap, X } from 'lucide-react';

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
  pages: { id: string; label: string; icon: string }[];
}

export const AR_CATEGORIES: CategoryDef[] = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: '🏠',
    pages: [{ id: 'dashboard', label: 'Executive Dashboard', icon: '🏠' }],
  },
  {
    id: 'farm',
    label: 'Livestock & Fields',
    icon: '🐄',
    pages: [
      { id: 'livestock', label: 'Livestock Ranch', icon: '🐄' },
      { id: 'crops', label: 'Crops & Fields', icon: '🌱' },
      { id: 'marketplace', label: 'Commodities Market', icon: '🛒' },
    ],
  },
  {
    id: 'factory',
    label: 'Processing Plants',
    icon: '🏭',
    pages: [
      { id: 'factories', label: 'Dairy & Goods Factory', icon: '🥛' },
      { id: 'workforce', label: 'Plant Automation', icon: '👷' },
    ],
  },
  {
    id: 'finance',
    label: 'Banking & Capital',
    icon: '🏦',
    pages: [
      { id: 'banking', label: 'Multi-Bank Accounts', icon: '🏦' },
      { id: 'analytics', label: 'P&L & Balance Sheet', icon: '📊' },
    ],
  },
  {
    id: 'assets',
    label: 'Real Estate & Businesses',
    icon: '🏘️',
    pages: [
      { id: 'realestate', label: 'Real Estate & Villas', icon: '🏠' },
      { id: 'businesses', label: 'Franchises & Partners', icon: '🏢' },
    ],
  },
  {
    id: 'markets',
    label: 'Securities & Crypto',
    icon: '📈',
    pages: [
      { id: 'stocks', label: 'Stock Exchange & IPOs', icon: '📈' },
      { id: 'crypto', label: 'Crypto Pit', icon: '₿' },
      { id: 'worldtrade', label: 'Global Export Market', icon: '🌍' },
    ],
  },
  {
    id: 'world',
    label: 'World & Travel',
    icon: '🌍',
    pages: [
      { id: 'travel', label: 'World Travel & Flights', icon: '✈️' },
      { id: 'worldtrade', label: 'NPC Merchant Network', icon: '🤝' },
    ],
  },
  {
    id: 'ventures',
    label: 'Commercial Ventures',
    icon: '🏪',
    pages: [
      { id: 'ventures', label: 'Restaurants & Hospitals', icon: '🏪' },
      { id: 'minigames', label: 'Casino & Lottery', icon: '🎰' },
    ],
  },
  {
    id: 'character',
    label: 'Progression & Skills',
    icon: '🧑',
    pages: [
      { id: 'skills', label: 'Skill Research Tree', icon: '🧠' },
      { id: 'missions', label: 'Missions & Milestones', icon: '🎯' },
      { id: 'settings', label: 'Save & Settings', icon: '⚙️' },
    ],
  },
];

export const NavigationShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, manualSave, resetGame, exportSaveJson } = useGame();

  // Find active category based on activeTab
  const getCatForTab = (tab: string) => {
    for (const cat of AR_CATEGORIES) {
      if (cat.pages.some((p) => p.id === tab)) return cat.id;
    }
    return 'home';
  };

  const [activeCat, setActiveCat] = useState<string>(() => getCatForTab(activeTab));
  const [showQuickAction, setShowQuickAction] = useState<boolean>(false);
  const [showCmdPalette, setShowCmdPalette] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setActiveCat(getCatForTab(activeTab));
  }, [activeTab]);

  // Keyboard shortcut '/' for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowCmdPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCmdPalette(false);
        setShowQuickAction(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentCatObj = AR_CATEGORIES.find((c) => c.id === activeCat) || AR_CATEGORIES[0];

  const handleSelectCategory = (catId: string) => {
    setActiveCat(catId);
    const cat = AR_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.pages.length > 0) {
      setActiveTab(cat.pages[0].id);
    }
  };

  // Flatten all pages for command palette
  const allPages = AR_CATEGORIES.flatMap((c) =>
    c.pages.map((p) => ({ ...p, catId: c.id, catLabel: c.label }))
  );
  const filteredPages = searchQuery.trim()
    ? allPages.filter(
        (p) =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.catLabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPages;

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-[#0d1117] relative">
      {/* Layer 1: Left Category Sidebar */}
      <aside className="w-14 sm:w-16 bg-[#161b22] border-r border-[#30363d] flex flex-col items-center py-2.5 gap-1 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto scrollbar-none z-40">
        {AR_CATEGORIES.map((cat) => {
          const isActive = activeCat === cat.id;

          return (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => handleSelectCategory(cat.id)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                  isActive
                    ? 'bg-[#00d4aa]/20 border border-[#00d4aa]/50 scale-105 shadow-md shadow-[#00d4aa]/20'
                    : 'bg-transparent hover:bg-[#21262d] border border-transparent hover:border-[#30363d]'
                }`}
                title={cat.label}
              >
                <span>{cat.icon}</span>
              </button>

              {/* Floating Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#21262d] border border-[#484f58] text-[#e6edf3] text-xs font-semibold px-2.5 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                {cat.label}
              </div>
            </div>
          );
        })}

        {/* Search Tool button */}
        <div className="mt-auto relative group pt-2 border-t border-[#30363d]">
          <button
            onClick={() => setShowCmdPalette(true)}
            className="w-10 h-10 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#00d4aa] flex items-center justify-center text-sm transition-colors"
            title="Search (/ key)"
          >
            <Search className="w-4 h-4" />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#21262d] border border-[#484f58] text-[#e6edf3] text-xs font-semibold px-2.5 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
            Search (Press /)
          </div>
        </div>
      </aside>

      {/* Layer 2 + 3: Sub-Nav Bar and Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16">
        {/* Layer 2: Sub-Nav Bar */}
        <div className="bg-[#161b22] border-b border-[#30363d] px-3 sm:px-5 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none sticky top-14 z-30">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6e7681] pr-2 border-r border-[#30363d] shrink-0 font-mono flex items-center gap-1">
            <span>{currentCatObj.icon}</span>
            <span>{currentCatObj.label}</span>
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {currentCatObj.pages.map((p) => {
              const isPageActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isPageActive
                      ? 'bg-[#00d4aa]/15 border border-[#00d4aa] text-[#00d4aa] font-bold shadow-sm'
                      : 'border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#00d4aa]/40 hover:bg-[#00d4aa]/5'
                  }`}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layer 3: Main Page Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>

      {/* Bottom Dock (Mobile & Desktop quick access) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-t border-[#30363d] px-3 py-1.5 flex items-center justify-between sm:justify-center gap-1.5">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'farm', icon: '🐄', label: 'Farm' },
            { id: 'factory', icon: '🏭', label: 'Factory' },
            { id: 'finance', icon: '🏦', label: 'Finance' },
            { id: 'assets', icon: '🏘️', label: 'Assets' },
            { id: 'markets', icon: '📈', label: 'Markets' },
            { id: 'ventures', icon: '🏪', label: 'Ventures' },
            { id: 'character', icon: '🧑', label: 'Me' },
          ].map((dock) => {
            const isDockActive = activeCat === dock.id;
            return (
              <button
                key={dock.id}
                onClick={() => handleSelectCategory(dock.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center min-w-[50px] transition-all ${
                  isDockActive
                    ? 'text-[#00d4aa] bg-[#00d4aa]/15 border border-[#00d4aa]/40'
                    : 'text-[#8b949e] hover:text-white bg-[#161b22] border border-[#30363d]'
                }`}
              >
                <span className="text-sm">{dock.icon}</span>
                <span>{dock.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Save / Load in dock */}
        <div className="hidden sm:flex items-center gap-1 ml-4 pl-3 border-l border-[#30363d]">
          <button
            onClick={manualSave}
            className="px-2 py-1 rounded text-[11px] font-mono font-bold bg-[#161b22] hover:bg-[#21262d] text-gray-300 border border-[#30363d] flex items-center gap-1"
            title="Save Game"
          >
            💾 Save
          </button>
          <button
            onClick={() => {
              const json = exportSaveJson();
              navigator.clipboard?.writeText(json);
              alert('Save data copied to clipboard!');
            }}
            className="px-2 py-1 rounded text-[11px] font-mono font-bold bg-[#161b22] hover:bg-[#21262d] text-gray-300 border border-[#30363d] flex items-center gap-1"
            title="Copy Save"
          >
            📂 Copy
          </button>
        </div>
      </div>

      {/* Floating Quick Action Button ⚡ */}
      <button
        onClick={() => setShowQuickAction(!showQuickAction)}
        className="fixed right-4 bottom-14 z-50 w-12 h-12 rounded-full bg-[#00d4aa] hover:bg-[#00b894] text-black font-extrabold text-xl flex items-center justify-center shadow-lg shadow-[#00d4aa]/40 transition-transform hover:scale-110 active:scale-95"
        title="Quick Actions"
      >
        ⚡
      </button>

      {/* Quick Action Flyout Menu */}
      {showQuickAction && (
        <div className="fixed right-4 bottom-28 z-50 w-60 bg-[#161b22] border border-[#484f58] rounded-2xl p-3 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex justify-between items-center px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#8b949e] font-mono border-b border-[#30363d] mb-1">
            <span>⚡ Quick Actions</span>
            <button onClick={() => setShowQuickAction(false)} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {[
            { label: 'Sell Milk & Cheese', icon: '🥛', cat: 'factory', tab: 'factories' },
            { label: 'Buy Livestock Animals', icon: '🐄', cat: 'farm', tab: 'livestock' },
            { label: 'Bank & Accounts', icon: '🏦', cat: 'finance', tab: 'banking' },
            { label: 'Stock Exchange', icon: '📈', cat: 'markets', tab: 'stocks' },
            { label: 'Crypto Trading', icon: '₿', cat: 'markets', tab: 'crypto' },
            { label: 'Launch Businesses', icon: '🏢', cat: 'assets', tab: 'businesses' },
            { label: 'Casino & Lottery', icon: '🎰', cat: 'ventures', tab: 'minigames' },
            { label: 'Global Exports', icon: '🌍', cat: 'markets', tab: 'worldtrade' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                handleSelectCategory(item.cat);
                setActiveTab(item.tab);
                setShowQuickAction(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-200 hover:text-[#00d4aa] hover:bg-[#21262d] transition-colors text-left"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Command Palette Modal (Triggered by / or Search Icon) */}
      {showCmdPalette && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setShowCmdPalette(false)}
        >
          <div
            className="w-full max-w-lg bg-[#161b22] border border-[#484f58] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d]">
              <Search className="w-5 h-5 text-[#00d4aa]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any page, market, or system... (Esc to close)"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-sans"
                autoFocus
              />
              <button onClick={() => setShowCmdPalette(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#30363d]/50 p-1">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    handleSelectCategory(page.catId);
                    setActiveTab(page.id);
                    setShowCmdPalette(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#21262d] rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{page.icon}</span>
                    <span className="font-bold text-white">{page.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                    {page.catLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
