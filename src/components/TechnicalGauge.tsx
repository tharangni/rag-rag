import React from 'react';
import { MarketItem, TechnicalSignal } from '../types/market';
import { Gauge, Info } from 'lucide-react';

interface TechnicalGaugeProps {
  item: MarketItem;
}

export const TechnicalGauge: React.FC<TechnicalGaugeProps> = ({ item }) => {
  // Convert signal to needle angle (-90deg to +90deg)
  const getAngle = (signal: TechnicalSignal) => {
    switch (signal) {
      case 'Strong Sell':
        return -72;
      case 'Sell':
        return -36;
      case 'Neutral':
        return 0;
      case 'Buy':
        return 36;
      case 'Strong Buy':
        return 72;
      default:
        return 0;
    }
  };

  const angle = getAngle(item.signal);

  const getSignalColor = (sig: TechnicalSignal) => {
    switch (sig) {
      case 'Strong Buy':
        return 'text-[#089981]';
      case 'Buy':
        return 'text-emerald-500';
      case 'Neutral':
        return 'text-neutral-500 dark:text-[#787b86]';
      case 'Sell':
        return 'text-rose-500';
      case 'Strong Sell':
        return 'text-[#f23645]';
    }
  };

  const totalOsc = item.oscillators.sell + item.oscillators.neutral + item.oscillators.buy;
  const totalMA = item.movingAverages.sell + item.movingAverages.neutral + item.movingAverages.buy;

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg p-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#2962ff]" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Technical Analysis</h3>
        </div>
        <span className="text-[11px] font-mono text-neutral-500 dark:text-[#787b86]">1D Interval</span>
      </div>

      {/* Speedometer Gauge Visual */}
      <div className="relative flex flex-col items-center pt-5 pb-2">
        <svg viewBox="0 0 200 115" className="w-48 overflow-visible">
          <defs>
            <linearGradient id="tvGaugeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f23645" />
              <stop offset="35%" stopColor="#f7525f" />
              <stop offset="50%" stopColor="#787b86" />
              <stop offset="65%" stopColor="#22ab94" />
              <stop offset="100%" stopColor="#089981" />
            </linearGradient>
          </defs>

          {/* Background track arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-neutral-200 dark:text-[#2a2e39]"
          />

          {/* Colored gradient arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#tvGaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-90"
          />

          {/* Needle pivot center */}
          <circle cx="100" cy="100" r="6" fill="#2962ff" />
          <circle cx="100" cy="100" r="3" fill="#ffffff" />

          {/* Needle pointer */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#2962ff"
            strokeWidth="3.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 100 100)`}
            className="transition-transform duration-500 ease-out"
          />
        </svg>

        {/* Current Signal Text */}
        <div className="mt-2 text-center">
          <span className={`text-base font-bold tracking-tight ${getSignalColor(item.signal)}`}>
            {item.signal}
          </span>
          <p className="text-[11px] text-neutral-500 dark:text-[#787b86] mt-0.5">
            Based on {totalOsc + totalMA} technical indicators
          </p>
        </div>
      </div>

      {/* Indicator Breakdown Breakdown Triad */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 dark:border-[#2a2e39] text-xs">
        {/* Oscillators Breakdown */}
        <div className="flex flex-col p-2.5 rounded bg-neutral-50 dark:bg-[#131722]/50 border border-neutral-100 dark:border-[#2a2e39]/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc] text-[11px]">Oscillators</span>
            <span className="font-mono text-[10px] text-neutral-500 dark:text-[#787b86]">
              RSI: {item.oscillators.rsi.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-rose-600 dark:text-[#f23645] font-semibold">{item.oscillators.sell} Sell</span>
            <span className="text-neutral-500 dark:text-[#787b86]">{item.oscillators.neutral} Neutral</span>
            <span className="text-emerald-600 dark:text-[#089981] font-semibold">{item.oscillators.buy} Buy</span>
          </div>
        </div>

        {/* Moving Averages Breakdown */}
        <div className="flex flex-col p-2.5 rounded bg-neutral-50 dark:bg-[#131722]/50 border border-neutral-100 dark:border-[#2a2e39]/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-neutral-800 dark:text-[#d1d4dc] text-[11px]">Moving Avg</span>
            <span className="font-mono text-[10px] text-neutral-500 dark:text-[#787b86]">15 Indicators</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-rose-600 dark:text-[#f23645] font-semibold">{item.movingAverages.sell} Sell</span>
            <span className="text-neutral-500 dark:text-[#787b86]">{item.movingAverages.neutral} Neutral</span>
            <span className="text-emerald-600 dark:text-[#089981] font-semibold">{item.movingAverages.buy} Buy</span>
          </div>
        </div>
      </div>

      {/* Support & Resistance Levels (calculated dynamically) */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-[#2a2e39] text-[11px] font-mono tabular-nums">
        <div className="flex items-center justify-between text-neutral-500 dark:text-[#787b86] mb-1">
          <span>Support (S1)</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc]">{(item.price * 0.985).toFixed(item.price < 2 ? 4 : 2)}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-500 dark:text-[#787b86] mb-1">
          <span>Pivot Point</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc]">{(item.price * 1.002).toFixed(item.price < 2 ? 4 : 2)}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-500 dark:text-[#787b86]">
          <span>Resistance (R1)</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc]">{(item.price * 1.018).toFixed(item.price < 2 ? 4 : 2)}</span>
        </div>
      </div>
    </div>
  );
};
