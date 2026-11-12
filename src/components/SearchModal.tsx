import React, { useState, useEffect, useRef } from 'react';
import { MarketItem } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  markets,
  onSelectSymbol,
}) => {
  const [query, setQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown handler for Escape & Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = markets.filter((m) => {
    if (filterClass !== 'all' && m.assetClass !== filterClass) return false;
    if (
      query &&
      !m.symbol.toLowerCase().includes(query.toLowerCase()) &&
      !m.name.toLowerCase().includes(query.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-[#2a2e39]">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search symbol, currency, or company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2e39] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-neutral-100 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#131722] text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'forex', label: 'Forex' },
            { id: 'indices', label: 'Indices' },
            { id: 'commodities', label: 'Commodities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterClass(cat.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                filterClass === cat.id
                  ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-bold shadow-xs'
                  : 'text-neutral-500 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-[#2a2e39]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 dark:text-[#787b86]">
              No matching assets found for "{query}".
            </div>
          ) : (
            results.map((item) => {
              const isUp = item.change >= 0;

              return (
                <div
                  key={item.symbol}
                  onClick={() => {
                    onSelectSymbol(item.symbol);
                    onClose();
                  }}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-[#131722]/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center font-bold text-xs shrink-0">
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">{item.symbol}</span>
                        <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-neutral-100 dark:bg-[#2a2e39] text-neutral-500 dark:text-[#787b86]">
                          {item.assetClass}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-[#787b86] truncate max-w-[220px]">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono tabular-nums text-right">
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                        ${item.price.toFixed(item.price < 2 ? 4 : 2)}
                      </div>
                      <div className={`text-[10px] font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-100 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#131722] text-[11px] text-neutral-400 dark:text-[#787b86] font-mono">
          <span>{results.length} assets available</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-[#2a2e39] rounded text-[10px] text-neutral-700 dark:text-neutral-300">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
