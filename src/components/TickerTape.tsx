import React from 'react';
import { MarketItem } from '../types/market';
import { TrendingUp, TrendingDown, Play, Pause } from 'lucide-react';

interface TickerTapeProps {
  markets: MarketItem[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  flashSymbols: Record<string, 'up' | 'down'>;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  markets,
  selectedSymbol,
  onSelectSymbol,
  isSimulating,
  onToggleSimulation,
  flashSymbols,
}) => {
  // Take premier key assets for the tape
  const tapeSymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'SOLUSD', 'NVDA', 'AAPL', 'TSLA', 'XAUUSD', 'CL', 'EURUSD'];
  const tapeItems = markets.filter((m) => tapeSymbols.includes(m.symbol));

  return (
    <div className="relative flex items-center bg-neutral-50 dark:bg-[#181c27] border-b border-neutral-200 dark:border-[#2a2e39] text-xs h-10 overflow-hidden select-none">
      {/* Simulation controller toggle badge */}
      <button
        onClick={onToggleSimulation}
        className={`shrink-0 flex items-center gap-1.5 px-3 h-full border-r border-neutral-200 dark:border-[#2a2e39] font-mono text-[11px] transition-colors cursor-pointer ${
          isSimulating
            ? 'text-emerald-700 dark:text-[#089981] bg-emerald-500/10 hover:bg-emerald-500/20'
            : 'text-neutral-500 dark:text-[#787b86] hover:bg-neutral-200 dark:hover:bg-[#222736]'
        }`}
        title={isSimulating ? 'Pause live market ticks' : 'Resume live market ticks'}
      >
        {isSimulating ? <Pause className="w-3 h-3 text-emerald-500" /> : <Play className="w-3 h-3" />}
        <span className="font-semibold">{isSimulating ? 'LIVE TICKS' : 'PAUSED'}</span>
      </button>

      {/* Ticker tape items scroll container */}
      <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth divide-x divide-neutral-200 dark:divide-[#2a2e39]">
        {tapeItems.map((item) => {
          const isUp = item.change >= 0;
          const flash = flashSymbols[item.symbol];
          const isSelected = selectedSymbol === item.symbol;

          // Mini SVG Sparkline
          const sparkline = item.sparkline || [];
          const min = Math.min(...sparkline);
          const max = Math.max(...sparkline);
          const range = max - min || 1;
          const points = sparkline
            .map((val, idx) => {
              const x = (idx / (sparkline.length - 1)) * 40;
              const y = 16 - ((val - min) / range) * 12;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`shrink-0 flex items-center gap-2.5 px-3.5 h-10 hover:bg-neutral-100 dark:hover:bg-[#1e222d] transition-colors cursor-pointer text-left ${
                isSelected ? 'bg-neutral-200/60 dark:bg-[#222736]' : ''
              } ${
                flash === 'up'
                  ? 'bg-emerald-500/20 dark:bg-emerald-500/25 duration-100'
                  : flash === 'down'
                  ? 'bg-rose-500/20 dark:bg-rose-500/25 duration-100'
                  : ''
              }`}
            >
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc] text-[11px] tracking-tight">
                  {item.symbol}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-[#787b86] truncate max-w-[70px]">
                  {item.name}
                </span>
              </div>

              {/* Mini Sparkline */}
              <svg width="40" height="18" className="opacity-80">
                <polyline
                  fill="none"
                  stroke={isUp ? '#089981' : '#f23645'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </svg>

              <div className="flex flex-col items-end font-mono tabular-nums leading-tight">
                <span className="text-[11px] font-medium text-neutral-900 dark:text-white">
                  {item.price.toLocaleString('en-US', {
                    minimumFractionDigits: item.price < 2 ? 4 : 2,
                    maximumFractionDigits: item.price < 2 ? 4 : 2,
                  })}
                </span>
                <div className={`flex items-center text-[10px] font-semibold ${isUp ? 'text-emerald-600 dark:text-[#089981]' : 'text-rose-600 dark:text-[#f23645]'}`}>
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
