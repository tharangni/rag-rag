import React, { useState } from 'react';
import { ECONOMIC_EVENTS } from '../data/mockMarkets';
import { Calendar as CalendarIcon, Filter, AlertCircle } from 'lucide-react';

export const EconomicCalendar: React.FC = () => {
  const [filterImpact, setFilterImpact] = useState<'all' | 'high'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'Today' | 'Tomorrow'>('all');

  const filtered = ECONOMIC_EVENTS.filter((e) => {
    if (filterImpact === 'high' && e.impact !== 'high') return false;
    if (filterDate !== 'all' && e.date !== filterDate) return false;
    return true;
  });

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#2962ff]" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Economic Calendar</h3>
            <p className="text-[11px] text-neutral-500 dark:text-[#787b86]">Key macroeconomic events & releases</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-[#131722] rounded">
            {(['all', 'Today', 'Tomorrow'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDate(d)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  filterDate === d
                    ? 'bg-white dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-500 dark:text-[#787b86]'
                }`}
              >
                {d === 'all' ? 'All Dates' : d}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFilterImpact(filterImpact === 'all' ? 'high' : 'all')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
              filterImpact === 'high'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-[#f23645] font-semibold'
                : 'border-neutral-200 dark:border-[#2a2e39] text-neutral-600 dark:text-[#787b86] hover:bg-neutral-100 dark:hover:bg-[#131722]'
            }`}
          >
            {filterImpact === 'high' ? 'High Impact Only' : 'All Impacts'}
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-[#2a2e39] text-neutral-400 dark:text-[#787b86] font-mono text-[11px]">
              <th className="py-2 px-2 font-normal">Time</th>
              <th className="py-2 px-2 font-normal">Country</th>
              <th className="py-2 px-2 font-normal">Impact</th>
              <th className="py-2 px-2 font-normal">Event</th>
              <th className="py-2 px-2 font-normal text-right">Actual</th>
              <th className="py-2 px-2 font-normal text-right">Forecast</th>
              <th className="py-2 px-2 font-normal text-right">Previous</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-[#2a2e39] font-mono tabular-nums">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-[#131722]/50 transition-colors">
                <td className="py-2.5 px-2 text-neutral-500 dark:text-[#787b86] whitespace-nowrap text-[11px]">
                  {item.date} {item.time}
                </td>
                <td className="py-2.5 px-2 whitespace-nowrap">
                  <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc] text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39]">
                    {item.countryCode}
                  </span>
                </td>
                <td className="py-2.5 px-2 whitespace-nowrap">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.impact === 'high'
                        ? 'text-rose-600 dark:text-[#f23645]'
                        : item.impact === 'medium'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {item.impact}
                  </span>
                </td>
                <td className="py-2.5 px-2 font-sans font-medium text-neutral-900 dark:text-white">
                  {item.event}
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-neutral-900 dark:text-white">
                  {item.actual}
                </td>
                <td className="py-2.5 px-2 text-right text-neutral-500 dark:text-[#787b86]">
                  {item.forecast}
                </td>
                <td className="py-2.5 px-2 text-right text-neutral-500 dark:text-[#787b86]">
                  {item.previous}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
