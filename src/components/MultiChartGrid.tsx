import React, { useState } from 'react';
import { MarketItem, MultiChartLayout } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { LayoutGrid, Square, Columns, Rows, Grid2X2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MultiChartGridProps {
  markets: MarketItem[];
  primarySymbol: string;
}

export const MultiChartGrid: React.FC<MultiChartGridProps> = ({ markets, primarySymbol }) => {
  const [layout, setLayout] = useState<MultiChartLayout>('1x2');
  const [paneSymbols, setPaneSymbols] = useState<string[]>([
    primarySymbol,
    'BTCUSD',
    'SPX',
    'XAUUSD',
  ]);

  const setSymbolForPane = (index: number, symbol: string) => {
    soundEngine.playClick();
    setPaneSymbols((prev) => {
      const next = [...prev];
      next[index] = symbol;
      return next;
    });
  };

  const getPaneItem = (index: number) => {
    const sym = paneSymbols[index] || primarySymbol;
    return markets.find((m) => m.symbol === sym) || markets[0];
  };

  const layouts: { id: MultiChartLayout; label: string; icon: React.ReactNode }[] = [
    { id: '1x1', label: 'Single Pane (1x1)', icon: <Square className="w-3.5 h-3.5" /> },
    { id: '1x2', label: 'Side by Side (1x2)', icon: <Columns className="w-3.5 h-3.5" /> },
    { id: '2x1', label: 'Stacked (2x1)', icon: <Rows className="w-3.5 h-3.5" /> },
    { id: '2x2', label: 'Quad Grid (2x2)', icon: <Grid2X2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Top Multi-Chart Layout Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
            <LayoutGrid className="w-4 h-4 text-[#2962ff]" />
            <span>TradingView Pro Multi-Chart Grid</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            Synchronized crosshairs & independent asset timeframes
          </span>
        </div>

        {/* Layout Switcher buttons */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#131722] p-1 rounded-md">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                soundEngine.playClick();
                setLayout(l.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                layout === l.id
                  ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-bold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title={l.label}
            >
              {l.icon}
              <span className="hidden sm:inline font-mono">{l.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid container */}
      <div
        className={`grid gap-4 ${
          layout === '1x1'
            ? 'grid-cols-1'
            : layout === '1x2'
            ? 'grid-cols-1 lg:grid-cols-2'
            : layout === '2x1'
            ? 'grid-cols-1'
            : 'grid-cols-1 lg:grid-cols-2'
        }`}
      >
        {/* Pane 1 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-neutral-600 dark:text-[#787b86]">Pane 1</span>
            <select
              value={paneSymbols[0]}
              onChange={(e) => setSymbolForPane(0, e.target.value)}
              className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] font-mono font-bold text-neutral-900 dark:text-white cursor-pointer"
            >
              {markets.map((m) => (
                <option key={m.symbol} value={m.symbol}>
                  {m.symbol} - {m.name}
                </option>
              ))}
            </select>
          </div>
          <InteractiveChart item={getPaneItem(0)} height={layout === '2x2' ? 360 : 440} />
        </div>

        {/* Pane 2 */}
        {(layout === '1x2' || layout === '2x1' || layout === '2x2') && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-bold text-neutral-600 dark:text-[#787b86]">Pane 2</span>
              <select
                value={paneSymbols[1]}
                onChange={(e) => setSymbolForPane(1, e.target.value)}
                className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] font-mono font-bold text-neutral-900 dark:text-white cursor-pointer"
              >
                {markets.map((m) => (
                  <option key={m.symbol} value={m.symbol}>
                    {m.symbol} - {m.name}
                  </option>
                ))}
              </select>
            </div>
            <InteractiveChart item={getPaneItem(1)} height={layout === '2x2' ? 360 : 440} />
          </div>
        )}

        {/* Pane 3 & 4 for 2x2 */}
        {layout === '2x2' && (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-bold text-neutral-600 dark:text-[#787b86]">Pane 3</span>
                <select
                  value={paneSymbols[2]}
                  onChange={(e) => setSymbolForPane(2, e.target.value)}
                  className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] font-mono font-bold text-neutral-900 dark:text-white cursor-pointer"
                >
                  {markets.map((m) => (
                    <option key={m.symbol} value={m.symbol}>
                      {m.symbol} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <InteractiveChart item={getPaneItem(2)} height={360} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-bold text-neutral-600 dark:text-[#787b86]">Pane 4</span>
                <select
                  value={paneSymbols[3]}
                  onChange={(e) => setSymbolForPane(3, e.target.value)}
                  className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] font-mono font-bold text-neutral-900 dark:text-white cursor-pointer"
                >
                  {markets.map((m) => (
                    <option key={m.symbol} value={m.symbol}>
                      {m.symbol} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <InteractiveChart item={getPaneItem(3)} height={360} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
