import React from 'react';
import { Search, Moon, Sun, PanelRightClose, PanelRightOpen, Bell, TrendingUp, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'supercharts' | 'heatmaps' | 'screener' | 'calendar' | 'news';
  setActiveTab: (tab: 'overview' | 'supercharts' | 'heatmaps' | 'screener' | 'calendar' | 'news') => void;
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
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-4 lg:px-6 py-2.5 bg-white dark:bg-[#131722] border-b border-neutral-200 dark:border-[#2a2e39] transition-colors">
      {/* Zone 1: Single text element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none"
        >
          {/* TradingView signature geometric logo icon */}
          <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white shadow-sm shadow-[#2962ff]/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M4 14h3v6H4v-6zm5-8h3v14H9V6zm5 4h3v10h-3V10zm5-7h3v17h-3V3z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
              TradingView
            </span>
          </div>
        </button>

        {/* Quick Search Bar trigger */}
        <button
          onClick={openSearch}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 ml-2 text-xs font-medium text-neutral-500 dark:text-[#787b86] bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Search markets (e.g. AAPL, BTC, SPX)</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-white dark:bg-[#2a2e39] rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line text nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'overview'
              ? 'border-[#2962ff] text-[#2962ff] font-semibold'
              : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('supercharts')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'supercharts'
              ? 'border-[#2962ff] text-[#2962ff] font-semibold'
              : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Supercharts
        </button>
        <button
          onClick={() => setActiveTab('heatmaps')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'heatmaps'
              ? 'border-[#2962ff] text-[#2962ff] font-semibold'
              : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Heatmaps
        </button>
        <button
          onClick={() => setActiveTab('screener')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'screener'
              ? 'border-[#2962ff] text-[#2962ff] font-semibold'
              : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Screener
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'calendar'
              ? 'border-[#2962ff] text-[#2962ff] font-semibold'
              : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'news'
              ? 'border-[#2962ff] text-[#2962ff] font-semibold'
              : 'border-transparent text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          News
        </button>
      </nav>

      {/* Zone 3: 1 primary action group */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Paper Trade Balance Capsule */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-md font-mono tabular-nums text-neutral-700 dark:text-[#d1d4dc]">
          <span className="text-[11px] text-neutral-400 dark:text-[#787b86]">Paper Cash:</span>
          <span className="font-semibold text-emerald-600 dark:text-[#089981]">
            ${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={openSearch}
          className="sm:hidden p-2 text-neutral-600 dark:text-[#787b86] hover:bg-neutral-100 dark:hover:bg-[#1e222d] rounded-md cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Dark/Light Theme Switcher */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1e222d] rounded-md transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Watchlist & Order Drawer Toggle */}
        <button
          onClick={() => setIsWatchlistOpen(!isWatchlistOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            isWatchlistOpen
              ? 'bg-[#2962ff] text-white hover:bg-[#1e53e5]'
              : 'bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] text-neutral-700 dark:text-[#d1d4dc] hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Toggle Watchlist & Alerts Panel"
        >
          {isWatchlistOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Watchlist</span>
        </button>
      </div>
    </header>
  );
};
