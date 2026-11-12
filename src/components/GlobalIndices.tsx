import React, { useState } from 'react';
import { MarketItem } from '../types/market';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';

interface GlobalIndicesProps {
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export const GlobalIndices: React.FC<GlobalIndicesProps> = ({
  markets,
  onSelectSymbol,
  selectedSymbol,
}) => {
  const [region, setRegion] = useState<'All' | 'Americas' | 'Europe' | 'Asia'>('All');

  const indices = markets.filter((m) => m.assetClass === 'indices');

  const filterByRegion = (item: MarketItem) => {
    if (region === 'All') return true;
    if (region === 'Americas') return item.country === 'United States';
    if (region === 'Europe') return item.country === 'Germany' || item.country === 'UK';
    if (region === 'Asia') return item.country === 'Japan' || item.country === 'China' || item.country === 'India';
    return true;
  };

  const displayed = indices.filter(filterByRegion);

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#2962ff]" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">World Indices</h3>
        </div>

        {/* Region tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-[#131722] rounded text-xs">
          {(['All', 'Americas', 'Europe', 'Asia'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                region === r
                  ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 dark:text-[#787b86]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Index Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {displayed.map((idx) => {
          const isUp = idx.change >= 0;
          const isSelected = selectedSymbol === idx.symbol;

          // Day range progress
          const dayRange = idx.high24h - idx.low24h || 1;
          const currentPos = Math.max(0, Math.min(100, ((idx.price - idx.low24h) / dayRange) * 100));

          return (
            <button
              key={idx.symbol}
              onClick={() => onSelectSymbol(idx.symbol)}
              className={`flex flex-col p-3 rounded-lg border border-neutral-200 dark:border-[#2a2e39] bg-neutral-50/60 dark:bg-[#131722]/50 hover:border-[#2962ff] transition-all text-left cursor-pointer ${
                isSelected ? 'ring-2 ring-[#2962ff] border-transparent' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{idx.symbol}</span>
                  <span className="text-[11px] text-neutral-500 dark:text-[#787b86] ml-1.5">{idx.country}</span>
                </div>
                <span
                  className={`text-xs font-bold font-mono ${
                    isUp ? 'text-emerald-600 dark:text-[#089981]' : 'text-rose-600 dark:text-[#f23645]'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="text-xs text-neutral-500 dark:text-[#787b86] truncate mb-2">{idx.name}</div>

              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                  {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs ${isUp ? 'text-emerald-600 dark:text-[#089981]' : 'text-rose-600 dark:text-[#f23645]'}`}>
                  {isUp ? '+' : ''}{idx.change.toFixed(2)}
                </span>
              </div>

              {/* Day Low / High meter */}
              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-[#2a2e39]/60 font-mono text-[10px] tabular-nums text-neutral-500 dark:text-[#787b86]">
                <div className="flex justify-between mb-1">
                  <span>L: {idx.low24h.toFixed(1)}</span>
                  <span>H: {idx.high24h.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-[#2a2e39] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2962ff] rounded-full"
                    style={{ width: `${currentPos}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
