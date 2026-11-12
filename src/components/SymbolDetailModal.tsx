import React from 'react';
import { MarketItem } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { TechnicalGauge } from './TechnicalGauge';
import { X, Bookmark, BookmarkCheck, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface SymbolDetailModalProps {
  item: MarketItem | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onOpenTrade: (symbol: string) => void;
}

export const SymbolDetailModal: React.FC<SymbolDetailModalProps> = ({
  item,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onOpenTrade,
}) => {
  if (!item) return null;

  const isUp = item.change >= 0;

  // Day range calc
  const dayRange = item.high24h - item.low24h || 1;
  const dayPos = Math.max(0, Math.min(100, ((item.price - item.low24h) / dayRange) * 100));

  // 52-week range calc
  const week52Range = item.week52High - item.week52Low || 1;
  const week52Pos = Math.max(0, Math.min(100, ((item.price - item.week52Low) / week52Range) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs select-none">
      <div className="flex flex-col bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded-xl w-full max-w-5xl max-h-[92vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#1e222d]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center font-bold text-base shrink-0">
              {item.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{item.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-[#2a2e39] text-neutral-600 dark:text-[#d1d4dc] font-mono uppercase">
                  {item.exchange} · {item.currency}
                </span>
                {item.sector && (
                  <span className="text-xs text-neutral-500 dark:text-[#787b86] hidden sm:inline">
                    · {item.sector}
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 dark:text-[#787b86] mt-0.5">{item.name}</div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onToggleWatchlist(item.symbol)}
              className={`p-2 rounded-md border transition-colors cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'border-neutral-200 dark:border-[#2a2e39] text-neutral-500 dark:text-[#787b86] hover:bg-neutral-100 dark:hover:bg-[#2a2e39]'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isWatchlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                onOpenTrade(item.symbol);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2962ff] hover:bg-[#1e53e5] rounded-md transition-colors cursor-pointer"
            >
              Paper Trade
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2e39] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price & Stats Highlight Bar */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
            <div className="flex items-baseline gap-3 font-mono tabular-nums">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                ${item.price.toLocaleString('en-US', {
                  minimumFractionDigits: item.price < 2 ? 4 : 2,
                  maximumFractionDigits: item.price < 2 ? 4 : 2,
                })}
              </span>
              <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {isUp ? '+' : ''}{item.change.toFixed(item.price < 2 ? 4 : 2)} ({isUp ? '+' : ''}{item.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono tabular-nums">
              <div>
                <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Prev Close</span>
                <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc]">${item.previousClose.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Day Open</span>
                <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc]">${item.open.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Technical Rating</span>
                <span className="font-bold text-[#089981]">{item.signal}</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div>
            <InteractiveChart item={item} height={380} />
          </div>

          {/* 2-Column: Key Metrics & Technical Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics (2 cols) */}
            <div className="lg:col-span-2 flex flex-col p-4 rounded-lg bg-neutral-50 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39]">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Key Financial Statistics</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono tabular-nums text-xs">
                <div className="p-2.5 rounded bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Volume</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{item.volumeFormatted}</span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Market Cap</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{item.marketCapFormatted || '-'}</span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">P/E Ratio</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{item.peRatio ? item.peRatio.toFixed(1) : '-'}</span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Dividend Yield</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{item.dividendYield ? `${(item.dividendYield).toFixed(2)}%` : '-'}</span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Beta</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{item.beta ? item.beta.toFixed(2) : '-'}</span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                  <span className="text-neutral-400 dark:text-[#787b86] block text-[11px]">Asset Class</span>
                  <span className="text-sm font-bold uppercase text-[#2962ff]">{item.assetClass}</span>
                </div>
              </div>

              {/* Day's Range Bar */}
              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-[#2a2e39] font-mono text-xs tabular-nums">
                <div className="flex justify-between text-neutral-500 dark:text-[#787b86] text-[11px] mb-1">
                  <span>Day's Range: Low ${item.low24h.toFixed(2)}</span>
                  <span>High ${item.high24h.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-[#131722] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2962ff] rounded-full" style={{ width: `${dayPos}%` }} />
                </div>
              </div>

              {/* 52-Week Range Bar */}
              <div className="mt-3 font-mono text-xs tabular-nums">
                <div className="flex justify-between text-neutral-500 dark:text-[#787b86] text-[11px] mb-1">
                  <span>52-Week Range: Low ${item.week52Low.toFixed(2)}</span>
                  <span>High ${item.week52High.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-[#131722] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${week52Pos}%` }} />
                </div>
              </div>

              {/* Company Description */}
              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-[#2a2e39]">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-1">About {item.name}</h4>
                <p className="text-xs text-neutral-600 dark:text-[#787b86] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Technical Gauge (1 col) */}
            <div className="lg:col-span-1">
              <TechnicalGauge item={item} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
