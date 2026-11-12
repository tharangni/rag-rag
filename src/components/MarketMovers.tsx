import React, { useState } from 'react';
import { MarketItem } from '../types/market';
import { TrendingUp, TrendingDown, Flame, Award } from 'lucide-react';

interface MarketMoversProps {
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export const MarketMovers: React.FC<MarketMoversProps> = ({
  markets,
  onSelectSymbol,
  selectedSymbol,
}) => {
  const [tab, setTab] = useState<'gainers' | 'losers' | 'active' | '52w'>('gainers');

  // Filter stocks and crypto for movers
  const eligible = markets.filter((m) => m.assetClass === 'stocks' || m.assetClass === 'crypto');

  let sorted: MarketItem[] = [];
  if (tab === 'gainers') {
    sorted = [...eligible].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  } else if (tab === 'losers') {
    sorted = [...eligible].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  } else if (tab === 'active') {
    sorted = [...eligible].sort((a, b) => b.volume - a.volume).slice(0, 5);
  } else {
    // 52w highs (closest to week52High)
    sorted = [...eligible]
      .sort((a, b) => (b.price / b.week52High) - (a.price / a.week52High))
      .slice(0, 5);
  }

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Market Movers</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 mt-3 bg-neutral-100 dark:bg-[#131722] rounded-md text-xs">
        <button
          onClick={() => setTab('gainers')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium cursor-pointer transition-colors ${
            tab === 'gainers'
              ? 'bg-white dark:bg-[#2a2e39] text-emerald-600 dark:text-[#089981] font-bold shadow-xs'
              : 'text-neutral-600 dark:text-[#787b86]'
          }`}
        >
          Gainers
        </button>
        <button
          onClick={() => setTab('losers')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium cursor-pointer transition-colors ${
            tab === 'losers'
              ? 'bg-white dark:bg-[#2a2e39] text-rose-600 dark:text-[#f23645] font-bold shadow-xs'
              : 'text-neutral-600 dark:text-[#787b86]'
          }`}
        >
          Losers
        </button>
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium cursor-pointer transition-colors ${
            tab === 'active'
              ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-bold shadow-xs'
              : 'text-neutral-600 dark:text-[#787b86]'
          }`}
        >
          Most Active
        </button>
        <button
          onClick={() => setTab('52w')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium cursor-pointer transition-colors ${
            tab === '52w'
              ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-bold shadow-xs'
              : 'text-neutral-600 dark:text-[#787b86]'
          }`}
        >
          52W Highs
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-[#2a2e39] mt-2">
        {sorted.map((item) => {
          const isUp = item.change >= 0;
          const isSelected = selectedSymbol === item.symbol;

          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`flex items-center justify-between py-2.5 px-2 hover:bg-neutral-50 dark:hover:bg-[#131722]/50 rounded transition-colors text-left cursor-pointer ${
                isSelected ? 'bg-neutral-100 dark:bg-[#222736]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center font-bold text-xs shrink-0">
                  {item.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-xs text-neutral-900 dark:text-white">{item.symbol}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-[#787b86] truncate max-w-[110px]">{item.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono tabular-nums text-right">
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    ${item.price.toFixed(item.price < 2 ? 4 : 2)}
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-[#787b86]">Vol {item.volumeFormatted}</div>
                </div>

                <div
                  className={`px-2 py-0.5 rounded text-xs font-bold min-w-[62px] text-center ${
                    isUp
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#089981]'
                      : 'bg-rose-500/10 text-rose-600 dark:text-[#f23645]'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
