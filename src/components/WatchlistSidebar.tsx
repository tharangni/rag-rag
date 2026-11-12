import React, { useState } from 'react';
import { MarketItem, PriceAlert, PaperPosition } from '../types/market';
import { OrderBookDOM } from './OrderBookDOM';
import { Bookmark, Bell, DollarSign, Plus, Trash2, X, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
  markets: MarketItem[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  paperBalance: number;
  onTrade: (symbol: string, type: 'buy' | 'sell', shares: number, price: number) => void;
  paperPositions: PaperPosition[];
  onClosePosition: (symbol: string) => void;
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, price: number, condition: 'above' | 'below') => void;
  onRemoveAlert: (id: string) => void;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  onToggleWatchlist,
  markets,
  selectedSymbol,
  onSelectSymbol,
  paperBalance,
  onTrade,
  paperPositions,
  onClosePosition,
  alerts,
  onAddAlert,
  onRemoveAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'dom' | 'trade' | 'alerts'>('watchlist');

  // Trade form state
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  // Alert form state
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  const selectedItem = markets.find((m) => m.symbol === selectedSymbol) || markets[0];
  const watchlistItems = markets.filter((m) => watchlistSymbols.includes(m.symbol));

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || tradeShares <= 0) return;
    soundEngine.playOrderFilled();
    onTrade(selectedItem.symbol, tradeType, tradeShares, selectedItem.price);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(alertTargetPrice);
    if (!selectedItem || isNaN(target) || target <= 0) return;
    soundEngine.playClick();
    onAddAlert(selectedItem.symbol, target, alertCondition);
    setAlertTargetPrice('');
  };

  if (!isOpen) return null;

  return (
    <aside className="w-84 shrink-0 border-l border-neutral-200 dark:border-[#2a2e39] bg-white dark:bg-[#1e222d] flex flex-col h-[calc(100vh-89px)] sticky top-[89px] z-30 transition-all select-none">
      {/* Top Header of the sidebar */}
      <div className="flex items-center justify-between px-2.5 py-2 border-b border-neutral-200 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#181c27]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('watchlist');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-bold shadow-xs'
                : 'text-neutral-500 dark:text-[#787b86]'
            }`}
            title="Watchlist"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="text-[11px]">List</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('dom');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'dom'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-bold shadow-xs'
                : 'text-neutral-500 dark:text-[#787b86]'
            }`}
            title="Level 2 Order Book Depth"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px]">L2 DOM</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('trade');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'trade'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-bold shadow-xs'
                : 'text-neutral-500 dark:text-[#787b86]'
            }`}
            title="Paper Trading Order Ticket"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-[11px]">Trade</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('alerts');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'alerts'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-bold shadow-xs'
                : 'text-neutral-500 dark:text-[#787b86]'
            }`}
            title="Price Alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="text-[11px]">Alerts</span>
          </button>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#2a2e39] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Watchlist */}
      {activeTab === 'watchlist' && (
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-2.5 border-b border-neutral-100 dark:border-[#2a2e39] flex items-center justify-between text-xs text-neutral-500 dark:text-[#787b86]">
            <span>{watchlistItems.length} Symbols Pinned</span>
            <span className="text-[10px] font-mono">Live Sync</span>
          </div>

          <div className="flex-1 divide-y divide-neutral-100 dark:divide-[#2a2e39]">
            {watchlistItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 dark:text-[#787b86]">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No symbols in your watchlist.</p>
                <p className="mt-1 text-[11px]">Click the bookmark icon on any asset to add it here.</p>
              </div>
            ) : (
              watchlistItems.map((item) => {
                const isUp = item.change >= 0;
                const isSelected = selectedSymbol === item.symbol;

                return (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectSymbol(item.symbol);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-[#131722]/60 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-neutral-100 dark:bg-[#222736]' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">{item.symbol}</span>
                        <span className="text-[10px] text-neutral-400 dark:text-[#787b86] uppercase">
                          {item.exchange}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-[#787b86] truncate max-w-[100px]">
                        {item.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {item.price.toFixed(item.price < 2 ? 4 : 2)}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            isUp ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playClick();
                          onToggleWatchlist(item.symbol);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500 rounded transition-opacity cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Level 2 DOM (Order Book) */}
      {activeTab === 'dom' && (
        <div className="flex-1 flex flex-col p-2 overflow-y-auto">
          <OrderBookDOM
            item={selectedItem}
            onQuickTrade={(type, shares, price) => {
              onTrade(selectedItem.symbol, type, shares, price);
            }}
          />
        </div>
      )}

      {/* Tab 3: Paper Trading Simulator */}
      {activeTab === 'trade' && (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          {/* Account Balance */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] mb-3">
            <div className="text-[11px] text-neutral-500 dark:text-[#787b86] mb-0.5">Available Cash</div>
            <div className="text-lg font-bold font-mono text-[#089981]">
              ${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Quick Order Ticket */}
          <form onSubmit={handleExecuteTrade} className="flex flex-col gap-2.5 p-3 rounded-lg bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 dark:text-white">Order: {selectedItem.symbol}</span>
              <span className="font-mono text-xs text-neutral-600 dark:text-[#d1d4dc]">
                ${selectedItem.price.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTradeType('buy')}
                className={`py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                  tradeType === 'buy'
                    ? 'bg-[#089981] text-white shadow-xs'
                    : 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-600 dark:text-[#787b86]'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTradeType('sell')}
                className={`py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                  tradeType === 'sell'
                    ? 'bg-[#f23645] text-white shadow-xs'
                    : 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-600 dark:text-[#787b86]'
                }`}
              >
                SELL
              </button>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 dark:text-[#787b86] block mb-1">
                Quantity (Shares / Units):
              </label>
              <input
                type="number"
                min="1"
                value={tradeShares}
                onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2.5 py-1 text-xs bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-[#2962ff]"
              />
            </div>

            <div className="flex justify-between text-xs font-mono pt-1 text-neutral-600 dark:text-[#787b86]">
              <span>Est. Total:</span>
              <span className="font-bold text-neutral-900 dark:text-white">
                ${(tradeShares * selectedItem.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-xs font-bold text-white rounded transition-colors cursor-pointer mt-1 ${
                tradeType === 'buy' ? 'bg-[#089981] hover:bg-[#0aa68c]' : 'bg-[#f23645] hover:bg-[#e02b3a]'
              }`}
            >
              Confirm Market {tradeType.toUpperCase()}
            </button>
          </form>

          {/* Open Positions */}
          <div className="mt-4 flex-1">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-[#787b86] uppercase tracking-wider block mb-2">
              Open Positions ({paperPositions.length})
            </span>

            {paperPositions.length === 0 ? (
              <p className="text-xs text-neutral-400 dark:text-[#787b86] text-center py-4">
                No active positions open.
              </p>
            ) : (
              <div className="space-y-2">
                {paperPositions.map((pos) => {
                  const currentMkt = markets.find((m) => m.symbol === pos.symbol);
                  const currentPrice = currentMkt ? currentMkt.price : pos.avgPrice;
                  const pl = (currentPrice - pos.avgPrice) * pos.shares * (pos.type === 'buy' ? 1 : -1);
                  const plPct = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100 * (pos.type === 'buy' ? 1 : -1);
                  const isUp = pl >= 0;

                  return (
                    <div
                      key={pos.symbol}
                      className="p-2.5 rounded bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] text-xs font-mono"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {pos.symbol} ({pos.type.toUpperCase()})
                        </span>
                        <button
                          onClick={() => {
                            soundEngine.playOrderFilled();
                            onClosePosition(pos.symbol);
                          }}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-500 dark:text-[#787b86]">
                        <span>{pos.shares} units @ ${pos.avgPrice.toFixed(2)}</span>
                        <span className={`font-bold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {isUp ? '+' : ''}${pl.toFixed(2)} ({isUp ? '+' : ''}{plPct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Price Alerts */}
      {activeTab === 'alerts' && (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          <form onSubmit={handleCreateAlert} className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] mb-4">
            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Set Alert for {selectedItem.symbol}</span>
              <span className="font-mono text-neutral-500 text-[11px]">${selectedItem.price.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setAlertCondition('above')}
                className={`py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                  alertCondition === 'above'
                    ? 'bg-[#2962ff] text-white'
                    : 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-600 dark:text-[#787b86]'
                }`}
              >
                Price ≥ Target
              </button>
              <button
                type="button"
                onClick={() => setAlertCondition('below')}
                className={`py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                  alertCondition === 'below'
                    ? 'bg-[#2962ff] text-white'
                    : 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-600 dark:text-[#787b86]'
                }`}
              >
                Price ≤ Target
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                placeholder={`Target Price`}
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-[#2962ff]"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#2962ff] text-white rounded text-xs font-semibold hover:bg-[#1e53e5] cursor-pointer"
              >
                Set
              </button>
            </div>
          </form>

          <div className="flex-1 space-y-2">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="flex items-center justify-between p-2.5 rounded bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-neutral-900 dark:text-white">
                    {al.symbol} {al.condition === 'above' ? '≥' : '≤'} ${al.targetPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-sans">{al.createdAt}</div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onRemoveAlert(al.id);
                  }}
                  className="p-1 text-neutral-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
