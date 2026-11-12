import React, { useState } from 'react';
import { Search, Moon, Sun, PanelRightClose, PanelRightOpen, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export type NavTab = 'overview' | 'supercharts' | 'multichart' | 'heatmaps' | 'screener' | 'strategy' | 'macro' | 'calendar' | 'news';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openSearch: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean) => void;
  paperBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openSearch,
  isDark,
  setIsDark,
  isWatchlistOpen,
  setIsWatchlistOpen,
  paperBalance,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
    if (next) soundEngine.playClick();
  };

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'supercharts', label: 'Supercharts' },
    { id: 'multichart', label: 'Multi-Grid' },
    { id: 'heatmaps', label: 'Heatmaps' },
    { id: 'screener', label: 'Screener' },
    { id: 'strategy', label: 'Strategy Quant' },
    { id: 'macro', label: 'Macro Matrix' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'news', label: 'News' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-4 lg:px-6 py-2.5 bg-white dark:bg-[#131722] border-b border-neutral-200 dark:border-[#2a2e39] transition-colors select-none">
      {/* Zone 1: Single text element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('overview');
          }}
          className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none"
        >
          {/* TradingView geometric logo */}
          <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white shadow-sm shadow-[#2962ff]/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M4 14h3v6H4v-6zm5-8h3v14H9V6zm5 4h3v10h-3V10zm5-7h3v17h-3V3z" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
              TradingView
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black tracking-wider bg-gradient-to-r from-[#2962ff] to-[#089981] text-white">
              PRO
            </span>
          </div>
        </button>

        {/* Quick Search Bar trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            openSearch();
          }}
          className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 ml-2 text-xs font-medium text-neutral-500 dark:text-[#787b86] bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Search markets (AAPL, BTC, NVDA...)</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-white dark:bg-[#2a2e39] rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2: Pro single-line navigation links */}
      <nav className="hidden xl:flex items-center gap-5 text-sm font-medium">
        {navLinks.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab(tab.id);
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs font-medium ${
              activeTab === tab.id
                ? 'border-[#2962ff] text-[#2962ff] font-bold'
                : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action group */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Terminal Audio FX Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-md transition-colors cursor-pointer ${
            soundEnabled
              ? 'text-neutral-700 dark:text-[#d1d4dc] hover:bg-neutral-100 dark:hover:bg-[#1e222d]'
              : 'text-neutral-400 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-[#1e222d]'
          }`}
          title={soundEnabled ? 'Terminal Audio FX: ON' : 'Terminal Audio FX: OFF'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#2962ff]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Paper Trade Balance Capsule */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-md font-mono tabular-nums text-neutral-700 dark:text-[#d1d4dc]">
          <span className="text-[10px] text-neutral-400 dark:text-[#787b86]">Cash:</span>
          <span className="font-bold text-[#089981]">
            ${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Dark/Light Theme Switcher */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsDark(!isDark);
          }}
          className="p-2 text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1e222d] rounded-md transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Watchlist & Order Drawer Toggle */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsWatchlistOpen(!isWatchlistOpen);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            isWatchlistOpen
              ? 'bg-[#2962ff] text-white hover:bg-[#1e53e5]'
              : 'bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] text-neutral-700 dark:text-[#d1d4dc] hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Toggle Watchlist & Order Book Panel"
        >
          {isWatchlistOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Watchlist</span>
        </button>
      </div>
    </header>
  );
};
