import React, { useMemo } from 'react';
import { MarketItem, OrderBookLevel } from '../types/market';
import { Layers, ArrowDown, ArrowUp } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface OrderBookDOMProps {
  item: MarketItem;
  onQuickTrade: (type: 'buy' | 'sell', shares: number, price: number) => void;
}

export const OrderBookDOM: React.FC<OrderBookDOMProps> = ({ item, onQuickTrade }) => {
  const currentPrice = item.price;
  const tickStep = currentPrice < 2 ? 0.0001 : currentPrice < 50 ? 0.02 : currentPrice < 500 ? 0.1 : 0.5;

  // Generate 8 ask levels and 8 bid levels
  const { asks, bids, spread, spreadBps, maxVolume } = useMemo(() => {
    const askLevels: OrderBookLevel[] = [];
    const bidLevels: OrderBookLevel[] = [];
    let cumAsk = 0;
    let cumBid = 0;

    // Asks (selling above market price) - listed ascending from market price up
    for (let i = 1; i <= 7; i++) {
      const price = Number((currentPrice + i * tickStep).toFixed(currentPrice < 2 ? 4 : 2));
      const amount = Math.floor(Math.random() * 350 + 50);
      cumAsk += amount;
      askLevels.unshift({ price, amount, total: cumAsk }); // reverse so highest ask is at top
    }

    // Bids (buying below market price) - listed descending from market price down
    for (let i = 1; i <= 7; i++) {
      const price = Number((currentPrice - i * tickStep).toFixed(currentPrice < 2 ? 4 : 2));
      const amount = Math.floor(Math.random() * 350 + 50);
      cumBid += amount;
      bidLevels.push({ price, amount, total: cumBid });
    }

    const lowestAsk = askLevels[askLevels.length - 1]?.price || currentPrice + tickStep;
    const highestBid = bids[0]?.price || currentPrice - tickStep;
    const sp = Math.max(0.01, lowestAsk - highestBid);
    const spBps = (sp / currentPrice) * 10000;
    const maxV = Math.max(cumAsk, cumBid) || 1;

    return { asks: askLevels, bids: bidLevels, spread: sp, spreadBps: spBps, maxVolume: maxV };
  }, [currentPrice, tickStep]);

  const handleRowClick = (type: 'buy' | 'sell', price: number) => {
    soundEngine.playClick();
    onQuickTrade(type, 10, price);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-3 text-xs font-mono select-none">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[#2a2e39] mb-2 font-sans">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#2962ff]" />
          <span className="font-bold text-xs text-neutral-900 dark:text-white">Order Book (Level 2)</span>
        </div>
        <span className="text-[10px] text-neutral-500 dark:text-[#787b86] font-mono">
          Spread: ${spread.toFixed(currentPrice < 2 ? 4 : 2)} ({spreadBps.toFixed(1)} bps)
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-[10px] text-neutral-400 dark:text-[#787b86] py-1 px-1 border-b border-neutral-100 dark:border-[#2a2e39]">
        <span>Price ({item.currency})</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Red) */}
      <div className="flex flex-col divide-y divide-transparent my-1">
        {asks.map((ask, idx) => {
          const depthPct = Math.min(100, (ask.total / maxVolume) * 100);
          return (
            <button
              key={`ask-${idx}`}
              onClick={() => handleRowClick('sell', ask.price)}
              className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-rose-500/10 rounded transition-colors text-left cursor-pointer group"
              title="Click to Sell Limit @ this price"
            >
              {/* Depth bar fill from right */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-rose-500/15 group-hover:bg-rose-500/25 rounded-xs transition-all pointer-events-none"
                style={{ width: `${depthPct}%` }}
              />
              <span className="text-[#f23645] font-semibold z-10">
                {ask.price.toFixed(currentPrice < 2 ? 4 : 2)}
              </span>
              <span className="text-right text-neutral-600 dark:text-[#d1d4dc] z-10">{ask.amount}</span>
              <span className="text-right text-neutral-400 dark:text-[#787b86] z-10">{ask.total}</span>
            </button>
          );
        })}
      </div>

      {/* Middle Current Price Spread Banner */}
      <div className="flex items-center justify-between py-1.5 px-2 bg-neutral-100 dark:bg-[#131722] rounded my-1 font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-neutral-900 dark:text-white">
            ${currentPrice.toFixed(currentPrice < 2 ? 4 : 2)}
          </span>
          {item.change >= 0 ? (
            <ArrowUp className="w-3.5 h-3.5 text-[#089981]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#f23645]" />
          )}
        </div>
        <span className={item.change >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
          {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Bids (Green) */}
      <div className="flex flex-col divide-y divide-transparent my-1">
        {bids.map((bid, idx) => {
          const depthPct = Math.min(100, (bid.total / maxVolume) * 100);
          return (
            <button
              key={`bid-${idx}`}
              onClick={() => handleRowClick('buy', bid.price)}
              className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-emerald-500/10 rounded transition-colors text-left cursor-pointer group"
              title="Click to Buy Limit @ this price"
            >
              {/* Depth bar fill from right */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#089981]/15 group-hover:bg-[#089981]/25 rounded-xs transition-all pointer-events-none"
                style={{ width: `${depthPct}%` }}
              />
              <span className="text-[#089981] font-semibold z-10">
                {bid.price.toFixed(currentPrice < 2 ? 4 : 2)}
              </span>
              <span className="text-right text-neutral-600 dark:text-[#d1d4dc] z-10">{bid.amount}</span>
              <span className="text-right text-neutral-400 dark:text-[#787b86] z-10">{bid.total}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
