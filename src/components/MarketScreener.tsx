import React, { useState, useMemo } from 'react';
import { MarketItem, AssetClass, TechnicalSignal } from '../types/market';
import { Filter, Search, ArrowUpDown, Download, Check } from 'lucide-react';

interface MarketScreenerProps {
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'signal';

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  markets,
  onSelectSymbol,
  selectedSymbol,
}) => {
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortAsc, setSortAsc] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  const filtered = useMemo(() => {
    return markets.filter((item) => {
      if (assetFilter !== 'all' && item.assetClass !== assetFilter) return false;
      if (signalFilter !== 'all' && item.signal !== signalFilter) return false;
      if (
        searchQuery &&
        !item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [markets, assetFilter, signalFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filtered, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Symbol', 'Name', 'Asset Class', 'Price', 'Change %', 'Volume', 'Signal', 'Country'];
    const rows = sorted.map((m) => [
      m.symbol,
      `"${m.name}"`,
      m.assetClass,
      m.price,
      m.changePercent,
      m.volume,
      m.signal,
      m.country,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradingview_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const getSignalBadge = (sig: TechnicalSignal) => {
    switch (sig) {
      case 'Strong Buy':
        return 'text-[#089981] font-bold';
      case 'Buy':
        return 'text-emerald-500 font-semibold';
      case 'Neutral':
        return 'text-neutral-500 dark:text-[#787b86]';
      case 'Sell':
        return 'text-rose-500 font-semibold';
      case 'Strong Sell':
        return 'text-[#f23645] font-bold';
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      {/* Title & Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Market Screener</h3>
          <p className="text-[11px] text-neutral-500 dark:text-[#787b86]">
            Filter and sort across global stocks, crypto, forex, indices, and commodities
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-[#d1d4dc] bg-neutral-100 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer"
        >
          {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
          <span>{copiedExport ? 'Downloaded' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-neutral-100 dark:border-[#2a2e39] text-xs">
        {/* Asset Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-neutral-100 dark:bg-[#131722] rounded text-xs">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'forex', label: 'Forex' },
            { id: 'indices', label: 'Indices' },
            { id: 'commodities', label: 'Commodities' },
            { id: 'bonds', label: 'Bonds' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAssetFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                assetFilter === tab.id
                  ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Signal dropdown */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#2962ff] w-44"
            />
          </div>

          {/* Technical Signal Filter */}
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-neutral-50 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded text-neutral-800 dark:text-[#d1d4dc] focus:outline-none focus:border-[#2962ff] cursor-pointer"
          >
            <option value="all">All Technicals</option>
            <option value="Strong Buy">Strong Buy</option>
            <option value="Buy">Buy</option>
            <option value="Neutral">Neutral</option>
            <option value="Sell">Sell</option>
            <option value="Strong Sell">Strong Sell</option>
          </select>
        </div>
      </div>

      {/* Screener Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-[#2a2e39] text-neutral-400 dark:text-[#787b86] font-mono text-[11px] select-none">
              <th
                onClick={() => toggleSort('symbol')}
                className="py-2.5 px-3 font-normal cursor-pointer hover:text-neutral-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('price')}
                className="py-2.5 px-3 font-normal text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('changePercent')}
                className="py-2.5 px-3 font-normal text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Change %</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('volume')}
                className="py-2.5 px-3 font-normal text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-normal text-right">Mkt Cap</th>
              <th
                onClick={() => toggleSort('signal')}
                className="py-2.5 px-3 font-normal text-center cursor-pointer hover:text-neutral-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Technical Rating</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-normal">Exchange</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-[#2a2e39] font-mono tabular-nums">
            {sorted.map((item) => {
              const isUp = item.change >= 0;
              const isSelected = selectedSymbol === item.symbol;

              return (
                <tr
                  key={item.symbol}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className={`hover:bg-neutral-50 dark:hover:bg-[#131722]/60 cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-100 dark:bg-[#222736]' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center font-bold text-[10px]">
                        {item.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white text-xs">{item.symbol}</span>
                        <span className="text-[11px] text-neutral-400 dark:text-[#787b86] ml-2 font-sans truncate max-w-[140px] inline-block align-middle">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-neutral-900 dark:text-white">
                    {item.price.toLocaleString('en-US', {
                      minimumFractionDigits: item.price < 2 ? 4 : 2,
                      maximumFractionDigits: item.price < 2 ? 4 : 2,
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-semibold ${
                        isUp ? 'text-emerald-600 dark:text-[#089981]' : 'text-rose-600 dark:text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-600 dark:text-[#d1d4dc]">
                    {item.volumeFormatted}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-600 dark:text-[#d1d4dc]">
                    {item.marketCapFormatted || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className={`text-[11px] ${getSignalBadge(item.signal)}`}>
                      {item.signal}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-neutral-500 dark:text-[#787b86] text-[11px]">
                    {item.exchange}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
