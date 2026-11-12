import React, { useState } from 'react';
import { HEATMAP_DATA, HeatmapItem } from '../data/mockMarkets';
import { Grid, Filter, TrendingUp, Info } from 'lucide-react';

interface MarketHeatmapProps {
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ onSelectSymbol, selectedSymbol }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  const sectors = ['All', 'Technology', 'Communication Services', 'Consumer Cyclical', 'Financial', 'Healthcare', 'Energy'];

  const filteredItems = selectedSector === 'All'
    ? HEATMAP_DATA
    : HEATMAP_DATA.filter((i) => i.sector === selectedSector);

  // Helper for TradingView heatmap color coding
  const getColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-[#089981] hover:bg-[#0aa68c] text-white';
    if (pct >= 1.5) return 'bg-[#159a85] hover:bg-[#19ab94] text-white';
    if (pct > 0.0) return 'bg-[#1e786b] hover:bg-[#238779] text-white';
    if (pct === 0.0) return 'bg-neutral-600 hover:bg-neutral-500 text-white';
    if (pct > -1.5) return 'bg-[#a3323d] hover:bg-[#b23743] text-white';
    if (pct > -3.0) return 'bg-[#cf2d3c] hover:bg-[#de3544] text-white';
    return 'bg-[#f23645] hover:bg-[#ff3b4b] text-white';
  };

  // Group by sector for layout
  const sectorsInView = Array.from(new Set(filteredItems.map((i) => i.sector)));

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[#2962ff]" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Stock Market Heatmap</h3>
            <p className="text-[11px] text-neutral-500 dark:text-[#787b86]">
              S&P 500 index components sized by Market Cap and colored by 1D change
            </p>
          </div>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-neutral-100 dark:bg-[#131722] rounded-md text-xs">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedSector === s
                  ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Treemap Canvas */}
      <div className="flex flex-col gap-3 pt-4 min-h-[380px]">
        {sectorsInView.map((sectorName) => {
          const itemsInSector = filteredItems.filter((i) => i.sector === sectorName);
          const totalSectorCap = itemsInSector.reduce((acc, curr) => acc + curr.marketCap, 0);

          return (
            <div
              key={sectorName}
              className="flex flex-col border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-2.5 bg-neutral-50/50 dark:bg-[#131722]/40"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-neutral-700 dark:text-[#d1d4dc]">{sectorName}</span>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-[#787b86]">
                  ${(totalSectorCap / 1000).toFixed(1)}T Mkt Cap
                </span>
              </div>

              {/* Flex Grid proportional to relative weights */}
              <div className="flex flex-wrap gap-1.5">
                {itemsInSector.map((item) => {
                  const weightRatio = item.marketCap / totalSectorCap;
                  // Dynamic flex basis based on market cap size
                  const flexPercent = Math.max(12, Math.min(65, weightRatio * 100));
                  const isSelected = selectedSymbol === item.symbol;

                  return (
                    <button
                      key={item.symbol}
                      onClick={() => onSelectSymbol(item.symbol)}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{ flex: `${flexPercent} 1 120px` }}
                      className={`relative flex flex-col justify-between p-2.5 rounded min-h-[78px] transition-all cursor-pointer shadow-xs ${getColor(
                        item.changePercent
                      )} ${
                        isSelected ? 'ring-2 ring-white dark:ring-[#2962ff] shadow-md z-10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs tracking-tight">{item.symbol}</span>
                        <span className="text-[10px] font-mono opacity-80">${item.price.toFixed(item.price < 10 ? 2 : 1)}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-medium opacity-85 truncate max-w-[90px]">{item.name}</div>
                        <div className="text-xs font-mono font-bold mt-0.5">
                          {item.changePercent >= 0 ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-neutral-100 dark:border-[#2a2e39] text-[11px] text-neutral-500 dark:text-[#787b86]">
        <div className="flex items-center gap-1.5 font-mono">
          <span>-3%</span>
          <div className="flex h-3 w-40 rounded overflow-hidden">
            <span className="flex-1 bg-[#f23645]" />
            <span className="flex-1 bg-[#cf2d3c]" />
            <span className="flex-1 bg-[#a3323d]" />
            <span className="flex-1 bg-neutral-600" />
            <span className="flex-1 bg-[#1e786b]" />
            <span className="flex-1 bg-[#159a85]" />
            <span className="flex-1 bg-[#089981]" />
          </div>
          <span>+3%</span>
        </div>

        {hoveredItem ? (
          <div className="flex items-center gap-2 font-mono tabular-nums text-neutral-900 dark:text-white">
            <span className="font-bold">{hoveredItem.symbol}</span>
            <span>·</span>
            <span>{hoveredItem.name}</span>
            <span>·</span>
            <span>${hoveredItem.price.toFixed(2)}</span>
            <span className={hoveredItem.changePercent >= 0 ? 'text-[#089981] font-semibold' : 'text-[#f23645] font-semibold'}>
              {hoveredItem.changePercent >= 0 ? '+' : ''}{hoveredItem.changePercent.toFixed(2)}%
            </span>
          </div>
        ) : (
          <span className="text-[11px]">Hover over an asset to inspect · Click to view full chart</span>
        )}
      </div>
    </div>
  );
};
