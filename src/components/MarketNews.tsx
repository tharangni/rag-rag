import React, { useState } from 'react';
import { MARKET_NEWS } from '../data/mockMarkets';
import { MarketNewsItem } from '../types/market';
import { Newspaper, ExternalLink, X, Clock } from 'lucide-react';

interface MarketNewsProps {
  onSelectSymbol: (symbol: string) => void;
}

export const MarketNews: React.FC<MarketNewsProps> = ({ onSelectSymbol }) => {
  const [selectedArticle, setSelectedArticle] = useState<MarketNewsItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Equities', 'Crypto', 'Bonds', 'Commodities', 'Forex'];

  const filtered = filterCategory === 'All'
    ? MARKET_NEWS
    : MARKET_NEWS.filter((n) => n.category === filterCategory);

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#2962ff]" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Market News & Insights</h3>
            <p className="text-[11px] text-neutral-500 dark:text-[#787b86]">Live updates from global financial desks</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-0.5 bg-neutral-100 dark:bg-[#131722] rounded text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                filterCategory === c
                  ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 dark:text-[#787b86]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {filtered.map((news) => (
          <div
            key={news.id}
            onClick={() => setSelectedArticle(news)}
            className="flex flex-col justify-between p-3.5 rounded-lg border border-neutral-200 dark:border-[#2a2e39] bg-neutral-50/50 dark:bg-[#131722]/40 hover:border-[#2962ff] transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-[#787b86] mb-1.5">
                <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc]">{news.source}</span>
                <span>·</span>
                <span>{news.timeAgo}</span>
                <span>·</span>
                <span>{news.readTime}</span>
              </div>

              <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#2962ff] transition-colors leading-snug line-clamp-2 mb-2">
                {news.title}
              </h4>

              <p className="text-xs text-neutral-600 dark:text-[#787b86] line-clamp-2 leading-relaxed">
                {news.summary}
              </p>
            </div>

            {/* Related Tickers */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-100 dark:border-[#2a2e39]/60">
              <div className="flex items-center gap-1.5">
                {news.symbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSymbol(sym);
                    }}
                    className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-neutral-200 dark:bg-[#2a2e39] hover:bg-[#2962ff] hover:text-white text-neutral-700 dark:text-[#d1d4dc] rounded transition-colors cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  news.sentiment === 'bullish'
                    ? 'text-emerald-600 dark:text-[#089981]'
                    : news.sentiment === 'bearish'
                    ? 'text-rose-600 dark:text-[#f23645]'
                    : 'text-neutral-500'
                }`}
              >
                {news.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2e39] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-[#787b86] mb-2">
              <span className="font-semibold text-neutral-900 dark:text-white">{selectedArticle.source}</span>
              <span>·</span>
              <span>{selectedArticle.timeAgo}</span>
              <span>·</span>
              <span>{selectedArticle.category}</span>
            </div>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight mb-4">
              {selectedArticle.title}
            </h3>

            <div className="text-sm text-neutral-700 dark:text-[#d1d4dc] leading-relaxed space-y-3 pb-6 border-b border-neutral-100 dark:border-[#2a2e39]">
              <p>{selectedArticle.summary}</p>
              <p>
                Traders and portfolio managers are closely monitoring macroeconomic indicators, interest rate expectations, and liquidity flows. Cross-asset correlations reflect heightened tactical positioning across institutional and retail derivatives desks.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 dark:text-[#787b86]">Referenced Tickers:</span>
                {selectedArticle.symbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      onSelectSymbol(sym);
                      setSelectedArticle(null);
                    }}
                    className="px-2 py-1 text-xs font-mono font-bold bg-[#2962ff]/10 text-[#2962ff] rounded hover:bg-[#2962ff] hover:text-white transition-colors cursor-pointer"
                  >
                    View {sym}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md hover:opacity-90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
