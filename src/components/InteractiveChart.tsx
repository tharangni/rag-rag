import React, { useState, useMemo, useRef } from 'react';
import { MarketItem, Candle, Timeframe } from '../types/market';
import { generateCandles } from '../data/mockMarkets';
import { BarChart3, TrendingUp, Maximize2, Minimize2, Eye, EyeOff, Layers, Sliders } from 'lucide-react';

interface InteractiveChartProps {
  item: MarketItem;
  height?: number;
  showIndicatorsControl?: boolean;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  item,
  height = 420,
  showIndicatorsControl = true,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate candles based on current price and selected timeframe
  const candles: Candle[] = useMemo(() => {
    return generateCandles(item.price, timeframe, 52);
  }, [item.price, timeframe, item.symbol]);

  // Compute Simple Moving Averages
  const { sma20Values, sma50Values } = useMemo(() => {
    const s20: (number | null)[] = [];
    const s50: (number | null)[] = [];

    for (let i = 0; i < candles.length; i++) {
      if (i >= 19) {
        let sum20 = 0;
        for (let j = 0; j < 20; j++) sum20 += candles[i - j].close;
        s20.push(sum20 / 20);
      } else {
        s20.push(null);
      }

      if (i >= 49) {
        let sum50 = 0;
        for (let j = 0; j < 50; j++) sum50 += candles[i - j].close;
        s50.push(sum50 / 50);
      } else {
        s50.push(null);
      }
    }
    return { sma20Values: s20, sma50Values: s50 };
  }, [candles]);

  // Chart bounds & scales
  const chartHeight = isFullscreen ? 650 : height;
  const paddingRight = 70; // for Y-axis price labels
  const paddingBottom = 30; // for X-axis time labels
  const paddingTop = 25;
  const paddingLeft = 12;

  const width = 800; // SVG viewBox coordinate width
  const renderWidth = width - paddingLeft - paddingRight;
  const renderHeight = chartHeight - paddingTop - paddingBottom;
  const volumeHeight = showVolume ? renderHeight * 0.22 : 0;
  const pricePlotHeight = renderHeight - volumeHeight - 10;

  // Min and Max prices for scaling
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  // Volume scale
  const maxVolume = Math.max(...candles.map((c) => c.volume));

  // Coord transforms
  const getY = (price: number) => {
    return paddingTop + pricePlotHeight - ((price - minPrice) / priceRange) * pricePlotHeight;
  };

  const getX = (index: number) => {
    const step = renderWidth / (candles.length - 1 || 1);
    return paddingLeft + index * step;
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];
  const isUp = activeCandle ? activeCandle.close >= activeCandle.open : true;
  const candleChange = activeCandle ? activeCandle.close - activeCandle.open : 0;
  const candleChangePct = activeCandle && activeCandle.open ? (candleChange / activeCandle.open) * 100 : 0;

  // Y-axis grid ticks (5 steps)
  const yTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange * i) / 4;
      const y = getY(price);
      ticks.push({ price, y });
    }
    return ticks;
  }, [minPrice, priceRange, renderHeight]);

  // X-axis time markers (6 evenly spaced)
  const xTicks = useMemo(() => {
    const ticks = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i * (candles.length - 1)) / (count - 1));
      if (candles[idx]) {
        ticks.push({
          time: candles[idx].time,
          x: getX(idx),
        });
      }
    }
    return ticks;
  }, [candles, renderWidth]);

  // SVG Line path for line mode
  const linePath = useMemo(() => {
    return candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(c.close).toFixed(1)}`).join(' ');
  }, [candles]);

  const areaPath = useMemo(() => {
    if (candles.length === 0) return '';
    const firstX = getX(0).toFixed(1);
    const lastX = getX(candles.length - 1).toFixed(1);
    const baselineY = (paddingTop + pricePlotHeight).toFixed(1);
    return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }, [linePath, candles, pricePlotHeight]);

  // SMA 20 SVG Path
  const sma20Path = useMemo(() => {
    if (!showSMA20) return '';
    let started = false;
    let path = '';
    sma20Values.forEach((val, i) => {
      if (val !== null) {
        path += `${!started ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)} `;
        started = true;
      }
    });
    return path;
  }, [sma20Values, showSMA20]);

  // SMA 50 SVG Path
  const sma50Path = useMemo(() => {
    if (!showSMA50) return '';
    let started = false;
    let path = '';
    sma50Values.forEach((val, i) => {
      if (val !== null) {
        path += `${!started ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)} `;
        started = true;
      }
    });
    return path;
  }, [sma50Values, showSMA50]);

  // Candle width
  const candleBarWidth = Math.max(3, (renderWidth / candles.length) * 0.65);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const clampedX = Math.max(paddingLeft, Math.min(paddingLeft + renderWidth, mouseX));
    const step = renderWidth / (candles.length - 1 || 1);
    const index = Math.round((clampedX - paddingLeft) / step);
    if (index >= 0 && index < candles.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded-lg overflow-hidden select-none transition-colors ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#1e222d] text-xs">
        {/* Left: Asset info & current timeframe */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-neutral-900 dark:text-white">{item.symbol}</span>
            <span className="text-neutral-500 dark:text-[#787b86] text-xs">·</span>
            <span className="text-xs text-neutral-600 dark:text-[#787b86] hidden sm:inline">{item.exchange}</span>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded p-0.5">
            {(['1D', '5D', '1M', '3M', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 font-mono text-[11px] rounded transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white font-semibold'
                    : 'text-neutral-600 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded p-0.5">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                chartType === 'candles'
                  ? 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-[#787b86]'
              }`}
              title="Candlestick"
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                chartType === 'line'
                  ? 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-[#787b86]'
              }`}
              title="Line Chart"
            >
              Line
            </button>
          </div>
        </div>

        {/* Right: Indicators and Actions */}
        <div className="flex items-center gap-2">
          {showIndicatorsControl && (
            <div className="flex items-center gap-2 border-r border-neutral-200 dark:border-[#2a2e39] pr-2">
              <button
                onClick={() => setShowSMA20(!showSMA20)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  showSMA20
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
                title="Toggle SMA 20"
              >
                <span className="w-2 h-0.5 bg-amber-500 rounded-full inline-block" />
                SMA 20
              </button>

              <button
                onClick={() => setShowSMA50(!showSMA50)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  showSMA50
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
                title="Toggle SMA 50"
              >
                <span className="w-2 h-0.5 bg-sky-500 rounded-full inline-block" />
                SMA 50
              </button>

              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  showVolume
                    ? 'text-emerald-600 dark:text-[#089981] bg-emerald-500/10'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
                title="Toggle Volume"
              >
                Vol
              </button>
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-neutral-500 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-[#2a2e39] cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* TradingView-style HUD Bar (Open, High, Low, Close, Volume) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 text-[11px] font-mono tabular-nums bg-white dark:bg-[#131722] border-b border-neutral-100 dark:border-[#1e222d] text-neutral-600 dark:text-[#787b86]">
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 dark:text-[#787b86]">Time:</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc] font-medium">{activeCandle?.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 dark:text-[#787b86]">O:</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc]">{activeCandle?.open.toFixed(item.price < 2 ? 4 : 2)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 dark:text-[#787b86]">H:</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc]">{activeCandle?.high.toFixed(item.price < 2 ? 4 : 2)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 dark:text-[#787b86]">L:</span>
          <span className="text-neutral-800 dark:text-[#d1d4dc]">{activeCandle?.low.toFixed(item.price < 2 ? 4 : 2)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 dark:text-[#787b86]">C:</span>
          <span className={`font-semibold ${isUp ? 'text-emerald-600 dark:text-[#089981]' : 'text-rose-600 dark:text-[#f23645]'}`}>
            {activeCandle?.close.toFixed(item.price < 2 ? 4 : 2)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 dark:text-[#787b86]">Change:</span>
          <span className={`font-semibold ${isUp ? 'text-emerald-600 dark:text-[#089981]' : 'text-rose-600 dark:text-[#f23645]'}`}>
            {isUp ? '+' : ''}{candleChange.toFixed(item.price < 2 ? 4 : 2)} ({isUp ? '+' : ''}{candleChangePct.toFixed(2)}%)
          </span>
        </div>
        {showVolume && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-neutral-400 dark:text-[#787b86]">Vol:</span>
            <span className="text-neutral-800 dark:text-[#d1d4dc]">{activeCandle?.volume.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Main SVG Chart Canvas */}
      <div className="relative flex-1 bg-white dark:bg-[#131722] cursor-crosshair">
        {/* TradingView giant watermark in quiet opacity */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-7xl sm:text-8xl font-black text-neutral-900/[0.03] dark:text-white/[0.03] tracking-wider">
            {item.symbol}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-full block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area gradient for line chart */}
            <linearGradient id={`areaGradient-${item.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962ff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map(({ price, y }) => (
            <g key={price}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                strokeDasharray="2,3"
                className="text-neutral-200 dark:text-[#2a2e39]"
                strokeWidth="1"
              />
              {/* Y Axis Price Labels */}
              <text
                x={width - paddingRight + 6}
                y={y + 3.5}
                className="fill-neutral-500 dark:fill-[#787b86] font-mono text-[10px] tabular-nums"
              >
                {price.toLocaleString('en-US', {
                  minimumFractionDigits: price < 2 ? 4 : 2,
                  maximumFractionDigits: price < 2 ? 4 : 2,
                })}
              </text>
            </g>
          ))}

          {/* Grid lines (vertical) */}
          {xTicks.map(({ time, x }) => (
            <g key={time}>
              <line
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={chartHeight - paddingBottom}
                stroke="currentColor"
                strokeDasharray="2,3"
                className="text-neutral-200 dark:text-[#2a2e39]"
                strokeWidth="1"
              />
              {/* X Axis Time Labels */}
              <text
                x={x}
                y={chartHeight - paddingBottom + 16}
                textAnchor="middle"
                className="fill-neutral-500 dark:fill-[#787b86] font-mono text-[10px]"
              >
                {time}
              </text>
            </g>
          ))}

          {/* Volume Histogram (bottom zone) */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i) - candleBarWidth / 2;
              const barH = (c.volume / (maxVolume || 1)) * volumeHeight;
              const y = chartHeight - paddingBottom - barH;
              const candleUp = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x}
                  y={y}
                  width={candleBarWidth}
                  height={barH}
                  fill={candleUp ? '#089981' : '#f23645'}
                  fillOpacity="0.35"
                />
              );
            })}

          {/* Candlesticks Rendering */}
          {chartType === 'candles' &&
            candles.map((c, i) => {
              const xCenter = getX(i);
              const candleUp = c.close >= c.open;
              const color = candleUp ? '#089981' : '#f23645';

              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const yOpen = getY(c.open);
              const yClose = getY(c.close);

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));

              return (
                <g key={`candle-${i}`}>
                  {/* Wick / Shadow */}
                  <line
                    x1={xCenter}
                    y1={yHigh}
                    x2={xCenter}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={xCenter - candleBarWidth / 2}
                    y={bodyTop}
                    width={candleBarWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="0.8"
                    rx="0.5"
                  />
                </g>
              );
            })}

          {/* Line / Area Rendering */}
          {chartType === 'line' && (
            <>
              <path d={areaPath} fill={`url(#areaGradient-${item.symbol})`} />
              <path d={linePath} fill="none" stroke="#2962ff" strokeWidth="2" strokeLinejoin="round" />
            </>
          )}

          {/* SMA 20 Overlay */}
          {showSMA20 && sma20Path && (
            <path
              d={sma20Path}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="opacity-90"
            />
          )}

          {/* SMA 50 Overlay */}
          {showSMA50 && sma50Path && (
            <path
              d={sma50Path}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="opacity-90"
            />
          )}

          {/* Interactive Crosshair & Cursor */}
          {hoverIndex !== null && candles[hoverIndex] && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={chartHeight - paddingBottom}
                stroke="#787b86"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={paddingLeft}
                y1={getY(candles[hoverIndex].close)}
                x2={width - paddingRight}
                y2={getY(candles[hoverIndex].close)}
                stroke="#787b86"
                strokeDasharray="3,3"
                strokeWidth="1"
              />

              {/* Price Tag badge on Y-axis */}
              <g transform={`translate(${width - paddingRight}, ${getY(candles[hoverIndex].close) - 10})`}>
                <rect
                  x="0"
                  y="0"
                  width="65"
                  height="20"
                  fill="#2962ff"
                  rx="2"
                />
                <text
                  x="6"
                  y="14"
                  fill="#ffffff"
                  className="font-mono text-[10px] tabular-nums font-semibold"
                >
                  {candles[hoverIndex].close.toFixed(item.price < 2 ? 4 : 2)}
                </text>
              </g>

              {/* Date Tag badge on X-axis */}
              <g transform={`translate(${getX(hoverIndex) - 30}, ${chartHeight - paddingBottom})`}>
                <rect
                  x="0"
                  y="2"
                  width="60"
                  height="18"
                  fill="#1e222d"
                  stroke="#2a2e39"
                  rx="2"
                />
                <text
                  x="30"
                  y="15"
                  textAnchor="middle"
                  fill="#d1d4dc"
                  className="font-mono text-[9px] font-medium"
                >
                  {candles[hoverIndex].time}
                </text>
              </g>
            </g>
          )}

          {/* Current Live Price Horizontal Marker */}
          <line
            x1={paddingLeft}
            y1={getY(item.price)}
            x2={width - paddingRight}
            y2={getY(item.price)}
            stroke={item.change >= 0 ? '#089981' : '#f23645'}
            strokeDasharray="1,2"
            strokeWidth="1.2"
          />
          <g transform={`translate(${width - paddingRight}, ${getY(item.price) - 10})`}>
            <rect
              x="0"
              y="0"
              width="65"
              height="20"
              fill={item.change >= 0 ? '#089981' : '#f23645'}
              rx="2"
            />
            <text
              x="6"
              y="14"
              fill="#ffffff"
              className="font-mono text-[10px] tabular-nums font-bold"
            >
              {item.price.toFixed(item.price < 2 ? 4 : 2)}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
