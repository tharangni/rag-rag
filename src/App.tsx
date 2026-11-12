import React, { useState, useEffect, useRef } from 'react';
import { MarketItem, PriceAlert, PaperPosition } from './types/market';
import { INITIAL_MARKETS } from './data/mockMarkets';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { InteractiveChart } from './components/InteractiveChart';
import { TechnicalGauge } from './components/TechnicalGauge';
import { MarketHeatmap } from './components/MarketHeatmap';
import { MarketMovers } from './components/MarketMovers';
import { GlobalIndices } from './components/GlobalIndices';
import { EconomicCalendar } from './components/EconomicCalendar';
import { MarketNews } from './components/MarketNews';
import { MarketScreener } from './components/MarketScreener';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { SearchModal } from './components/SearchModal';
import { SymbolDetailModal } from './components/SymbolDetailModal';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Zap,
  Info,
  Maximize2
} from 'lucide-react';

export default function App() {
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [activeTab, setActiveTab] = useState<'overview' | 'supercharts' | 'heatmaps' | 'screener' | 'calendar' | 'news'>('overview');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [inspectedSymbol, setInspectedSymbol] = useState<string | null>(null);

  // Watchlist & Alerts & Paper Trading state
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([
    'SPX',
    'NDX',
    'NVDA',
    'AAPL',
    'BTCUSD',
    'ETHUSD',
    'XAUUSD',
  ]);
  const [paperBalance, setPaperBalance] = useState<number>(100000.0);
  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>([
    { symbol: 'NVDA', shares: 50, avgPrice: 142.5, type: 'buy' },
    { symbol: 'BTCUSD', shares: 0.5, avgPrice: 89200, type: 'buy' },
  ]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    { id: 'al-1', symbol: 'BTCUSD', targetPrice: 95000, condition: 'above', createdAt: 'Today 09:15' },
    { id: 'al-2', symbol: 'NVDA', targetPrice: 155, condition: 'above', createdAt: 'Today 10:30' },
  ]);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  // Live simulation tick engine
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [flashSymbols, setFlashSymbols] = useState<Record<string, 'up' | 'down'>>({});

  // Sync theme with HTML root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Live simulation ticker loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick 1 to 2 random items to update
      setMarkets((prev) => {
        const next = [...prev];
        const numUpdates = Math.floor(Math.random() * 2) + 1;
        const newFlashes: Record<string, 'up' | 'down'> = {};

        for (let u = 0; u < numUpdates; u++) {
          const idx = Math.floor(Math.random() * next.length);
          const item = { ...next[idx] };
          const deltaPct = (Math.random() - 0.48) * 0.004; // small fluctuation ±0.2%
          const priceChange = item.price * deltaPct;
          const newPrice = Number((item.price + priceChange).toFixed(item.price < 2 ? 4 : 2));

          const direction = priceChange >= 0 ? 'up' : 'down';
          newFlashes[item.symbol] = direction;

          item.price = newPrice;
          item.change = Number((item.change + priceChange).toFixed(item.price < 2 ? 4 : 2));
          item.changePercent = Number(((item.change / item.previousClose) * 100).toFixed(2));
          item.high24h = Math.max(item.high24h, newPrice);
          item.low24h = Math.min(item.low24h, newPrice);

          // Update sparkline
          const sparkline = [...item.sparkline];
          sparkline.push(newPrice);
          if (sparkline.length > 12) sparkline.shift();
          item.sparkline = sparkline;

          // Check alerts
          alerts.forEach((al) => {
            if (al.symbol === item.symbol) {
              if (
                (al.condition === 'above' && newPrice >= al.targetPrice) ||
                (al.condition === 'below' && newPrice <= al.targetPrice)
              ) {
                setAlertToast(`Alert Triggered: ${item.symbol} reached $${newPrice.toFixed(2)}!`);
                setTimeout(() => setAlertToast(null), 5000);
              }
            }
          });

          next[idx] = item;
        }

        setFlashSymbols(newFlashes);
        setTimeout(() => setFlashSymbols({}), 600);

        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, alerts]);

  // Watchlist toggle handler
  const handleToggleWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  // Trade handler
  const handleTrade = (symbol: string, type: 'buy' | 'sell', shares: number, price: number) => {
    const totalCost = shares * price;
    if (type === 'buy') {
      if (paperBalance < totalCost) {
        setAlertToast('Insufficient paper funds for this order.');
        setTimeout(() => setAlertToast(null), 3000);
        return;
      }
      setPaperBalance((b) => b - totalCost);
      setPaperPositions((prev) => {
        const existing = prev.find((p) => p.symbol === symbol && p.type === 'buy');
        if (existing) {
          const totalShares = existing.shares + shares;
          const avgPrice = (existing.shares * existing.avgPrice + shares * price) / totalShares;
          return prev.map((p) => (p.symbol === symbol && p.type === 'buy' ? { ...p, shares: totalShares, avgPrice } : p));
        }
        return [...prev, { symbol, shares, avgPrice: price, type: 'buy' }];
      });
      setAlertToast(`Executed BUY ${shares} ${symbol} @ $${price.toFixed(2)}`);
      setTimeout(() => setAlertToast(null), 4000);
    } else {
      // Sell
      setPaperBalance((b) => b + totalCost);
      setPaperPositions((prev) => {
        const existing = prev.find((p) => p.symbol === symbol);
        if (!existing) return prev;
        if (existing.shares <= shares) {
          return prev.filter((p) => p.symbol !== symbol);
        }
        return prev.map((p) => (p.symbol === symbol ? { ...p, shares: p.shares - shares } : p));
      });
      setAlertToast(`Executed SELL ${shares} ${symbol} @ $${price.toFixed(2)}`);
      setTimeout(() => setAlertToast(null), 4000);
    }
  };

  const handleClosePosition = (symbol: string) => {
    const pos = paperPositions.find((p) => p.symbol === symbol);
    if (!pos) return;
    const item = markets.find((m) => m.symbol === symbol);
    const price = item ? item.price : pos.avgPrice;
    const value = pos.shares * price;
    setPaperBalance((b) => b + value);
    setPaperPositions((prev) => prev.filter((p) => p.symbol !== symbol));
    setAlertToast(`Closed position in ${symbol}`);
    setTimeout(() => setAlertToast(null), 3000);
  };

  const handleAddAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `al-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: 'Just now',
    };
    setAlerts((prev) => [...prev, newAlert]);
    setAlertToast(`Alert set for ${symbol} when price is ${condition} $${targetPrice}`);
    setTimeout(() => setAlertToast(null), 3000);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const selectedItem = markets.find((m) => m.symbol === selectedSymbol) || markets[0];
  const inspectedItem = markets.find((m) => m.symbol === inspectedSymbol) || null;

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131722] text-neutral-900 dark:text-[#d1d4dc] transition-colors flex flex-col font-sans">
      {/* Toast Alert Notification */}
      {alertToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#1e222d] text-white border border-[#2962ff] rounded-lg shadow-xl animate-in slide-in-from-bottom-4 duration-200">
          <Zap className="w-4 h-4 text-[#2962ff] shrink-0" />
          <span className="text-xs font-medium font-mono">{alertToast}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        setIsDark={setIsDark}
        isWatchlistOpen={isWatchlistOpen}
        setIsWatchlistOpen={setIsWatchlistOpen}
        paperBalance={paperBalance}
      />

      {/* Real-time Ticker Tape Ribbon */}
      <TickerTape
        markets={markets}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={(sym) => setSelectedSymbol(sym)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        flashSymbols={flashSymbols}
      />

      {/* Main Content Layout with optional Right Drawer */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
          {/* TAB 1: MARKETS OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Markets Hero Bar: Title & Sub-market Quick Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                    Markets Overview
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-[#787b86] mt-0.5">
                    Real-time global quotes, market momentum, and technical indicators across all major asset classes.
                  </p>
                </div>

                {/* Quick featured ticker chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg text-xs font-mono">
                  {['SPX', 'NDX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD', 'EURUSD'].map((sym) => {
                    const m = markets.find((item) => item.symbol === sym);
                    const isSelected = selectedSymbol === sym;
                    const isUp = m ? m.change >= 0 : true;

                    return (
                      <button
                        key={sym}
                        onClick={() => setSelectedSymbol(sym)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2962ff] text-white font-bold shadow-xs'
                            : 'text-neutral-600 dark:text-[#d1d4dc] hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{sym}</span>
                        {m && (
                          <span
                            className={`text-[10px] ${
                              isSelected
                                ? 'text-white/90'
                                : isUp
                                ? 'text-emerald-600 dark:text-[#089981]'
                                : 'text-rose-600 dark:text-[#f23645]'
                            }`}
                          >
                            {isUp ? '+' : ''}{m.changePercent.toFixed(1)}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Central Chart & Technical Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): Interactive Candlestick / Line Chart */}
                <div className="lg:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#787b86]">
                        Featured Chart
                      </span>
                      <span className="text-neutral-400 dark:text-[#787b86]">·</span>
                      <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                        {selectedItem.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleWatchlist(selectedItem.symbol)}
                        className={`p-1.5 rounded text-xs border flex items-center gap-1 cursor-pointer transition-colors ${
                          watchlistSymbols.includes(selectedItem.symbol)
                            ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                            : 'border-neutral-200 dark:border-[#2a2e39] text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                        title="Watchlist"
                      >
                        {watchlistSymbols.includes(selectedItem.symbol) ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px] hidden sm:inline">
                          {watchlistSymbols.includes(selectedItem.symbol) ? 'Saved' : 'Watch'}
                        </span>
                      </button>

                      <button
                        onClick={() => setInspectedSymbol(selectedItem.symbol)}
                        className="px-2.5 py-1 text-xs font-medium text-[#2962ff] bg-[#2962ff]/10 hover:bg-[#2962ff]/20 rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>

                  <InteractiveChart item={selectedItem} height={420} />
                </div>

                {/* Right (1 col): Technical Gauge */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <TechnicalGauge item={selectedItem} />

                  {/* Quick Paper Trade Card */}
                  <div className="flex flex-col p-4 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Quick Trade</span>
                      <span className="text-xs font-mono text-neutral-500 dark:text-[#787b86]">
                        {selectedItem.symbol} @ ${selectedItem.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTrade(selectedItem.symbol, 'buy', 10, selectedItem.price)}
                        className="py-2 px-3 bg-[#089981] hover:bg-[#0aa68c] text-white rounded font-bold text-xs cursor-pointer transition-colors text-center"
                      >
                        Buy 10 {selectedItem.symbol}
                      </button>
                      <button
                        onClick={() => handleTrade(selectedItem.symbol, 'sell', 10, selectedItem.price)}
                        className="py-2 px-3 bg-[#f23645] hover:bg-[#e02b3a] text-white rounded font-bold text-xs cursor-pointer transition-colors text-center"
                      >
                        Sell 10 {selectedItem.symbol}
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-400 dark:text-[#787b86] mt-2 text-center">
                      Simulated zero-risk paper trade execution
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Column: Market Movers & World Indices */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MarketMovers
                  markets={markets}
                  onSelectSymbol={(sym) => setSelectedSymbol(sym)}
                  selectedSymbol={selectedSymbol}
                />
                <GlobalIndices
                  markets={markets}
                  onSelectSymbol={(sym) => setSelectedSymbol(sym)}
                  selectedSymbol={selectedSymbol}
                />
              </div>

              {/* Interactive S&P 500 Heatmap Preview */}
              <div>
                <MarketHeatmap
                  onSelectSymbol={(sym) => setSelectedSymbol(sym)}
                  selectedSymbol={selectedSymbol}
                />
              </div>

              {/* 2-Column: Economic Calendar & Financial News */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EconomicCalendar />
                <MarketNews onSelectSymbol={(sym) => setSelectedSymbol(sym)} />
              </div>
            </div>
          )}

          {/* TAB 2: SUPERCHARTS SCREEN */}
          {activeTab === 'supercharts' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Supercharts Pro Terminal</h1>
                  <p className="text-xs text-neutral-500 dark:text-[#787b86]">
                    Interactive multi-timeframe financial charting with live candlestick data, volume profile, and moving averages.
                  </p>
                </div>

                {/* Asset selector strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg">
                  {markets.map((m) => (
                    <button
                      key={m.symbol}
                      onClick={() => setSelectedSymbol(m.symbol)}
                      className={`px-2.5 py-1 text-xs font-mono font-semibold rounded cursor-pointer whitespace-nowrap transition-colors ${
                        selectedSymbol === m.symbol
                          ? 'bg-[#2962ff] text-white shadow-xs'
                          : 'text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {m.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full height interactive chart */}
              <InteractiveChart item={selectedItem} height={520} />

              {/* Detail stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono tabular-nums text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] text-[10px] block">24h High</span>
                  <span className="font-bold text-neutral-900 dark:text-white">${selectedItem.high24h.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] text-[10px] block">24h Low</span>
                  <span className="font-bold text-neutral-900 dark:text-white">${selectedItem.low24h.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] text-[10px] block">Volume</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{selectedItem.volumeFormatted}</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] text-[10px] block">52W Range</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    ${selectedItem.week52Low.toFixed(0)} - ${selectedItem.week52High.toFixed(0)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] text-[10px] block">RSI (14)</span>
                  <span className="font-bold text-[#2962ff]">{selectedItem.oscillators.rsi.toFixed(1)}</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] text-[10px] block">Technical Rating</span>
                  <span className="font-bold text-[#089981]">{selectedItem.signal}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEATMAPS SCREEN */}
          {activeTab === 'heatmaps' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <MarketHeatmap
                onSelectSymbol={(sym) => {
                  setSelectedSymbol(sym);
                  setInspectedSymbol(sym);
                }}
                selectedSymbol={selectedSymbol}
              />
            </div>
          )}

          {/* TAB 4: SCREENER SCREEN */}
          {activeTab === 'screener' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <MarketScreener
                markets={markets}
                onSelectSymbol={(sym) => {
                  setSelectedSymbol(sym);
                  setInspectedSymbol(sym);
                }}
                selectedSymbol={selectedSymbol}
              />
            </div>
          )}

          {/* TAB 5: CALENDAR SCREEN */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <EconomicCalendar />
            </div>
          )}

          {/* TAB 6: NEWS SCREEN */}
          {activeTab === 'news' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <MarketNews
                onSelectSymbol={(sym) => {
                  setSelectedSymbol(sym);
                  setActiveTab('overview');
                }}
              />
            </div>
          )}
        </main>

        {/* Right Watchlist & Paper Trading Drawer */}
        <WatchlistSidebar
          isOpen={isWatchlistOpen}
          onClose={() => setIsWatchlistOpen(false)}
          watchlistSymbols={watchlistSymbols}
          onToggleWatchlist={handleToggleWatchlist}
          markets={markets}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={(sym) => setSelectedSymbol(sym)}
          paperBalance={paperBalance}
          onTrade={handleTrade}
          paperPositions={paperPositions}
          onClosePosition={handleClosePosition}
          alerts={alerts}
          onAddAlert={handleAddAlert}
          onRemoveAlert={handleRemoveAlert}
        />
      </div>

      {/* Symbol Detail Inspection Modal */}
      <SymbolDetailModal
        item={inspectedItem}
        onClose={() => setInspectedSymbol(null)}
        isWatchlisted={inspectedItem ? watchlistSymbols.includes(inspectedItem.symbol) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onOpenTrade={(sym) => {
          setSelectedSymbol(sym);
          setIsWatchlistOpen(true);
        }}
      />

      {/* Global Search Command Palette */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        markets={markets}
        onSelectSymbol={(sym) => {
          setSelectedSymbol(sym);
          setInspectedSymbol(sym);
        }}
      />

      {/* TradingView Markets Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#131722] py-6 px-4 lg:px-8 text-xs text-neutral-500 dark:text-[#787b86]">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2962ff] flex items-center justify-center text-white text-[10px] font-bold">
              TV
            </div>
            <span className="font-bold text-neutral-800 dark:text-[#d1d4dc]">TradingView Markets</span>
            <span>·</span>
            <span>Live Global Market Analysis & Financial Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://tradingview.com/markets"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[#2962ff] transition-colors"
            >
              <span>tradingview.com/markets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="font-mono text-[11px]">Real-time simulation engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
