import React, { useState, useMemo, useRef } from 'react';
import { MarketItem, Candle, Timeframe, ChartDrawing, DrawingTool, ChartStyle } from '../types/market';
import { generateCandles } from '../data/mockMarkets';
import { DrawingToolbar } from './DrawingToolbar';
import {
  BarChart3,
  TrendingUp,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface InteractiveChartProps {
  item: MarketItem;
  height?: number;
  showIndicatorsControl?: boolean;
  showToolbar?: boolean;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  item,
  height = 460,
  showIndicatorsControl = true,
  showToolbar = true,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');

  // Indicators state
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);
  const [showVWAP, setShowVWAP] = useState(false);

  // Drawing state
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([
    // Default sample horizontal support level
    {
      id: 'd-sample-1',
      type: 'horizontal',
      startX: 50,
      startY: 200,
      price: item.price * 0.985,
      color: '#089981',
      text: 'Major Support $',
    },
  ]);
  const [currentDrawing, setCurrentDrawing] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Candle series
  const candles: Candle[] = useMemo(() => {
    return generateCandles(item.price, timeframe, 52);
  }, [item.price, timeframe, item.symbol]);

  // Transform candles for Heikin-Ashi if selected
  const displayCandles: Candle[] = useMemo(() => {
    if (chartStyle !== 'heikin') return candles;
    const ha: Candle[] = [];
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (i === 0) {
        ha.push({ ...c });
      } else {
        const prevHa = ha[i - 1];
        const haClose = (c.open + c.high + c.low + c.close) / 4;
        const haOpen = (prevHa.open + prevHa.close) / 2;
        const haHigh = Math.max(c.high, haOpen, haClose);
        const haLow = Math.min(c.low, haOpen, haClose);
        ha.push({
          ...c,
          open: Number(haOpen.toFixed(item.price < 2 ? 4 : 2)),
          high: Number(haHigh.toFixed(item.price < 2 ? 4 : 2)),
          low: Number(haLow.toFixed(item.price < 2 ? 4 : 2)),
          close: Number(haClose.toFixed(item.price < 2 ? 4 : 2)),
        });
      }
    }
    return ha;
  }, [candles, chartStyle, item.price]);

  // Compute Moving Averages, Bollinger Bands, RSI, MACD
  const { sma20Values, sma50Values, bbUpper, bbLower, rsiValues, macdHist, vwapValues } = useMemo(() => {
    const s20: (number | null)[] = [];
    const s50: (number | null)[] = [];
    const bbUp: (number | null)[] = [];
    const bbLow: (number | null)[] = [];
    const rsi: (number | null)[] = [];
    const macd: (number | null)[] = [];
    const vwap: (number | null)[] = [];

    let cumVol = 0;
    let cumVolPrice = 0;

    for (let i = 0; i < displayCandles.length; i++) {
      // VWAP
      const typical = (displayCandles[i].high + displayCandles[i].low + displayCandles[i].close) / 3;
      cumVol += displayCandles[i].volume;
      cumVolPrice += typical * displayCandles[i].volume;
      vwap.push(cumVolPrice / cumVol);

      // SMA 20 & Bollinger
      if (i >= 19) {
        let sum20 = 0;
        for (let j = 0; j < 20; j++) sum20 += displayCandles[i - j].close;
        const mean = sum20 / 20;
        s20.push(mean);

        let variance = 0;
        for (let j = 0; j < 20; j++) variance += Math.pow(displayCandles[i - j].close - mean, 2);
        const stdev = Math.sqrt(variance / 20);
        bbUp.push(mean + 2 * stdev);
        bbLow.push(mean - 2 * stdev);
      } else {
        s20.push(null);
        bbUp.push(null);
        bbLow.push(null);
      }

      // SMA 50
      if (i >= 49) {
        let sum50 = 0;
        for (let j = 0; j < 50; j++) sum50 += displayCandles[i - j].close;
        s50.push(sum50 / 50);
      } else {
        s50.push(null);
      }

      // RSI (14)
      if (i >= 14) {
        let gains = 0;
        let losses = 0;
        for (let j = 0; j < 14; j++) {
          const diff = displayCandles[i - j].close - displayCandles[i - j].open;
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(100 - 100 / (1 + rs));
      } else {
        rsi.push(50);
      }

      // MACD histogram mock
      const macdVal = (Math.sin(i * 0.3) * item.price * 0.008);
      macd.push(macdVal);
    }

    return {
      sma20Values: s20,
      sma50Values: s50,
      bbUpper: bbUp,
      bbLower: bbLow,
      rsiValues: rsi,
      macdHist: macd,
      vwapValues: vwap,
    };
  }, [displayCandles, item.price]);

  // Subpanes sizing math
  const chartHeight = isFullscreen ? 680 : height;
  const paddingRight = 75; // for price axis
  const paddingBottom = 26; // for time axis
  const paddingTop = 25;
  const paddingLeft = 14;

  const width = 840; // SVG viewBox coordinate width
  const renderWidth = width - paddingLeft - paddingRight;

  // Sub-pane heights
  const subpaneRSIHeight = showRSI ? 65 : 0;
  const subpaneMACDHeight = showMACD ? 65 : 0;
  const subpanesTotal = subpaneRSIHeight + subpaneMACDHeight;

  const mainAreaHeight = chartHeight - paddingTop - paddingBottom - subpanesTotal;
  const volumeHeight = showVolume ? mainAreaHeight * 0.20 : 0;
  const pricePlotHeight = mainAreaHeight - volumeHeight - 8;

  // Min and Max prices for scaling
  const allPrices = displayCandles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  // Volume scale
  const maxVolume = Math.max(...displayCandles.map((c) => c.volume));

  // Coord transforms
  const getY = (price: number) => {
    return paddingTop + pricePlotHeight - ((price - minPrice) / priceRange) * pricePlotHeight;
  };

  const getPriceFromY = (y: number) => {
    const ratio = (paddingTop + pricePlotHeight - y) / pricePlotHeight;
    return minPrice + ratio * priceRange;
  };

  const getX = (index: number) => {
    const step = renderWidth / (displayCandles.length - 1 || 1);
    return paddingLeft + index * step;
  };

  const activeCandle = hoverIndex !== null && displayCandles[hoverIndex]
    ? displayCandles[hoverIndex]
    : displayCandles[displayCandles.length - 1];
  const isUp = activeCandle ? activeCandle.close >= activeCandle.open : true;
  const candleChange = activeCandle ? activeCandle.close - activeCandle.open : 0;
  const candleChangePct = activeCandle && activeCandle.open ? (candleChange / activeCandle.open) * 100 : 0;

  // Y-axis grid ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange * i) / 4;
      const y = getY(price);
      ticks.push({ price, y });
    }
    return ticks;
  }, [minPrice, priceRange, pricePlotHeight]);

  // X-axis time markers
  const xTicks = useMemo(() => {
    const ticks = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i * (displayCandles.length - 1)) / (count - 1));
      if (displayCandles[idx]) {
        ticks.push({
          time: displayCandles[idx].time,
          x: getX(idx),
        });
      }
    }
    return ticks;
  }, [displayCandles, renderWidth]);

  // Path generators
  const linePath = useMemo(() => {
    return displayCandles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(c.close).toFixed(1)}`).join(' ');
  }, [displayCandles]);

  const areaPath = useMemo(() => {
    if (displayCandles.length === 0) return '';
    const firstX = getX(0).toFixed(1);
    const lastX = getX(displayCandles.length - 1).toFixed(1);
    const baselineY = (paddingTop + pricePlotHeight).toFixed(1);
    return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }, [linePath, displayCandles, pricePlotHeight]);

  // SMA paths
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

  // Bollinger Bands path
  const bbPath = useMemo(() => {
    if (!showBollinger) return { upper: '', lower: '', area: '' };
    let upPath = '';
    let lowPath = '';
    let started = false;
    const pointsUp: string[] = [];
    const pointsLow: string[] = [];

    bbUpper.forEach((val, i) => {
      if (val !== null && bbLower[i] !== null) {
        const x = getX(i).toFixed(1);
        const yUp = getY(val).toFixed(1);
        const yLow = getY(bbLower[i]!).toFixed(1);
        upPath += `${!started ? 'M' : 'L'} ${x} ${yUp} `;
        lowPath += `${!started ? 'M' : 'L'} ${x} ${yLow} `;
        pointsUp.push(`${x},${yUp}`);
        pointsLow.unshift(`${x},${yLow}`);
        started = true;
      }
    });

    const area = pointsUp.length > 0 ? `M ${pointsUp.join(' L ')} L ${pointsLow.join(' L ')} Z` : '';
    return { upper: upPath, lower: lowPath, area };
  }, [bbUpper, bbLower, showBollinger]);

  // VWAP path
  const vwapPath = useMemo(() => {
    if (!showVWAP) return '';
    return vwapValues.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val!).toFixed(1)}`).join(' ');
  }, [vwapValues, showVWAP]);

  const candleBarWidth = Math.max(3, (renderWidth / displayCandles.length) * 0.65);

  // Mouse handlers for crosshair and interactive drawing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * chartHeight;

    const clampedX = Math.max(paddingLeft, Math.min(paddingLeft + renderWidth, mouseX));
    const step = renderWidth / (displayCandles.length - 1 || 1);
    const index = Math.round((clampedX - paddingLeft) / step);

    if (index >= 0 && index < displayCandles.length) {
      setHoverIndex(index);
    }

    if (currentDrawing) {
      setCurrentDrawing({ ...currentDrawing, currentX: mouseX, currentY: mouseY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'cursor') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * chartHeight;

    if (activeTool === 'horizontal') {
      soundEngine.playOrderFilled();
      const price = getPriceFromY(mouseY);
      setDrawings((prev) => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: 'horizontal',
          startX: paddingLeft,
          startY: mouseY,
          price,
          color: '#2962ff',
          text: `Level: $${price.toFixed(item.price < 2 ? 4 : 2)}`,
        },
      ]);
      setActiveTool('cursor');
    } else if (activeTool === 'position') {
      soundEngine.playOrderFilled();
      const entryPrice = getPriceFromY(mouseY);
      setDrawings((prev) => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: 'position',
          startX: mouseX,
          startY: mouseY,
          price: entryPrice,
          targetPrice: entryPrice * 1.04,
          stopPrice: entryPrice * 0.98,
          color: '#089981',
          text: 'Long Position 1:2 R:R',
        },
      ]);
      setActiveTool('cursor');
    } else {
      // Start drag drawing for trendline, fibonacci, measure
      setCurrentDrawing({ startX: mouseX, startY: mouseY, currentX: mouseX, currentY: mouseY });
    }
  };

  const handleMouseUp = () => {
    if (!currentDrawing) return;
    soundEngine.playOrderFilled();
    const newDrawing: ChartDrawing = {
      id: `draw-${Date.now()}`,
      type: activeTool,
      startX: currentDrawing.startX,
      startY: currentDrawing.startY,
      endX: currentDrawing.currentX,
      endY: currentDrawing.currentY,
      color: activeTool === 'fibonacci' ? '#f59e0b' : '#2962ff',
    };
    setDrawings((prev) => [...prev, newDrawing]);
    setCurrentDrawing(null);
    setActiveTool('cursor');
  };

  const takeSnapshot = () => {
    soundEngine.playOrderFilled();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  return (
    <div
      className={`relative flex bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded-lg overflow-hidden select-none transition-colors ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Left Drawing Toolbar */}
      {showToolbar && (
        <div className="p-2 border-r border-neutral-200 dark:border-[#2a2e39] bg-neutral-50/70 dark:bg-[#181c27] flex flex-col justify-between">
          <DrawingToolbar
            activeTool={activeTool}
            onSelectTool={(tool) => setActiveTool(tool)}
            onClearDrawings={() => setDrawings([])}
            drawingsCount={drawings.length}
          />
          <div className="flex flex-col items-center text-[10px] text-neutral-400 font-mono pt-2">
            PRO
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Pro Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200 dark:border-[#2a2e39] bg-neutral-50 dark:bg-[#1e222d] text-xs">
          {/* Symbol & Timeframe */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white text-sm">
              <span>{item.symbol}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2962ff]/10 text-[#2962ff] font-mono">
                PRO
              </span>
            </div>

            {/* Timeframe Selectors */}
            <div className="flex items-center bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded p-0.5">
              {(['1D', '5D', '1M', '3M', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    soundEngine.playClick();
                    setTimeframe(tf);
                  }}
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

            {/* Chart Style Picker */}
            <div className="flex items-center bg-white dark:bg-[#131722] border border-neutral-200 dark:border-[#2a2e39] rounded p-0.5">
              {[
                { id: 'candles', label: 'Candles' },
                { id: 'hollow', label: 'Hollow' },
                { id: 'heikin', label: 'Heikin-Ashi' },
                { id: 'area', label: 'Area' },
                { id: 'line', label: 'Line' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setChartStyle(style.id as ChartStyle);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    chartStyle === style.id
                      ? 'bg-neutral-200 dark:bg-[#2a2e39] text-neutral-900 dark:text-white font-semibold'
                      : 'text-neutral-500 dark:text-[#787b86]'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicators & Pro Tools */}
          <div className="flex items-center gap-1.5">
            {showIndicatorsControl && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowBollinger(!showBollinger);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                    showBollinger
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  BB (20,2)
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowSMA20(!showSMA20);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                    showSMA20
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  SMA 20
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowVWAP(!showVWAP);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                    showVWAP
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  VWAP
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowRSI(!showRSI);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                    showRSI
                      ? 'bg-[#2962ff]/10 border-[#2962ff]/40 text-[#2962ff] font-bold'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  RSI (14)
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowMACD(!showMACD);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                    showMACD
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-[#089981] font-bold'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  MACD
                </button>
              </div>
            )}

            <button
              onClick={takeSnapshot}
              className="p-1 text-neutral-500 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-[#2a2e39] cursor-pointer"
              title="Take Chart Snapshot (Export)"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-1 text-neutral-500 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-[#2a2e39] cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* HUD Data Bar */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5 text-[11px] font-mono tabular-nums bg-white dark:bg-[#131722] border-b border-neutral-100 dark:border-[#1e222d] text-neutral-600 dark:text-[#787b86]">
          <div className="flex items-center gap-3">
            <span>{activeCandle?.time}</span>
            <span>O: <b className="text-neutral-900 dark:text-white">{activeCandle?.open.toFixed(item.price < 2 ? 4 : 2)}</b></span>
            <span>H: <b className="text-neutral-900 dark:text-white">{activeCandle?.high.toFixed(item.price < 2 ? 4 : 2)}</b></span>
            <span>L: <b className="text-neutral-900 dark:text-white">{activeCandle?.low.toFixed(item.price < 2 ? 4 : 2)}</b></span>
            <span>C: <b className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>{activeCandle?.close.toFixed(item.price < 2 ? 4 : 2)}</b></span>
            <span className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
              {isUp ? '+' : ''}{candleChange.toFixed(item.price < 2 ? 4 : 2)} ({isUp ? '+' : ''}{candleChangePct.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-4">
            {showRSI && (
              <span className="text-[#2962ff]">
                RSI(14): <b>{rsiValues[hoverIndex !== null ? hoverIndex : rsiValues.length - 1]?.toFixed(1)}</b>
              </span>
            )}
            {showVolume && (
              <span>Vol: <b>{activeCandle?.volume.toLocaleString()}</b></span>
            )}
          </div>
        </div>

        {/* Main Canvas with SVG */}
        <div className="relative flex-1 bg-white dark:bg-[#131722] cursor-crosshair overflow-hidden">
          {snapshotTaken && (
            <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-[#2962ff] text-white text-xs font-semibold rounded shadow-lg animate-in fade-in">
              Chart Snapshot Captured!
            </div>
          )}

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-8xl font-black text-neutral-900/[0.03] dark:text-white/[0.03] tracking-widest">
              {item.symbol}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${width} ${chartHeight}`}
            className="w-full h-full block"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={`proArea-${item.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
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
                <text
                  x={width - paddingRight + 6}
                  y={y + 3.5}
                  className="fill-neutral-500 dark:fill-[#787b86] font-mono text-[10px] tabular-nums"
                >
                  {price.toFixed(item.price < 2 ? 4 : 2)}
                </text>
              </g>
            ))}

            {/* Vertical Grid lines */}
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

            {/* Bollinger Bands Shaded Area & Lines */}
            {showBollinger && bbPath.area && (
              <>
                <path d={bbPath.area} fill="#a855f7" fillOpacity="0.08" />
                <path d={bbPath.upper} fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
                <path d={bbPath.lower} fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
              </>
            )}

            {/* Volume Histogram */}
            {showVolume &&
              displayCandles.map((c, i) => {
                const x = getX(i) - candleBarWidth / 2;
                const barH = (c.volume / (maxVolume || 1)) * volumeHeight;
                const y = paddingTop + mainAreaHeight - barH;
                const candleUp = c.close >= c.open;
                return (
                  <rect
                    key={`vol-${i}`}
                    x={x}
                    y={y}
                    width={candleBarWidth}
                    height={barH}
                    fill={candleUp ? '#089981' : '#f23645'}
                    fillOpacity="0.3"
                  />
                );
              })}

            {/* Candlesticks Rendering */}
            {(chartStyle === 'candles' || chartStyle === 'hollow' || chartStyle === 'heikin') &&
              displayCandles.map((c, i) => {
                const xCenter = getX(i);
                const candleUp = c.close >= c.open;
                const color = candleUp ? '#089981' : '#f23645';

                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);

                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
                const isHollow = chartStyle === 'hollow' && candleUp;

                return (
                  <g key={`candle-${i}`}>
                    <line x1={xCenter} y1={yHigh} x2={xCenter} y2={yLow} stroke={color} strokeWidth="1.2" />
                    <rect
                      x={xCenter - candleBarWidth / 2}
                      y={bodyTop}
                      width={candleBarWidth}
                      height={bodyHeight}
                      fill={isHollow ? 'transparent' : color}
                      stroke={color}
                      strokeWidth="1"
                      rx="0.5"
                    />
                  </g>
                );
              })}

            {/* Line / Area Rendering */}
            {(chartStyle === 'line' || chartStyle === 'area') && (
              <>
                {chartStyle === 'area' && <path d={areaPath} fill={`url(#proArea-${item.symbol})`} />}
                <path d={linePath} fill="none" stroke="#2962ff" strokeWidth="2" strokeLinejoin="round" />
              </>
            )}

            {/* Moving Averages */}
            {showSMA20 && sma20Path && (
              <path d={sma20Path} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
            )}
            {showSMA50 && sma50Path && (
              <path d={sma50Path} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
            )}
            {showVWAP && vwapPath && (
              <path d={vwapPath} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,2" />
            )}

            {/* User Drawings on Chart */}
            {drawings.map((d) => {
              if (d.type === 'horizontal' && d.price) {
                const y = getY(d.price);
                return (
                  <g key={d.id}>
                    <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke={d.color || '#2962ff'} strokeWidth="1.5" strokeDasharray="4,3" />
                    <rect x={paddingLeft + 4} y={y - 14} width="110" height="14" fill="#1e222d" stroke={d.color || '#2962ff'} rx="2" />
                    <text x={paddingLeft + 8} y={y - 3} fill={d.color || '#2962ff'} className="font-mono text-[9px] font-bold">
                      {d.text || `$${d.price.toFixed(2)}`}
                    </text>
                  </g>
                );
              }
              if (d.type === 'trendline' && d.endX !== undefined && d.endY !== undefined) {
                return (
                  <line
                    key={d.id}
                    x1={d.startX}
                    y1={d.startY}
                    x2={d.endX}
                    y2={d.endY}
                    stroke={d.color || '#2962ff'}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              }
              if (d.type === 'fibonacci' && d.endX !== undefined && d.endY !== undefined) {
                const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
                const dy = d.endY - d.startY;
                return (
                  <g key={d.id}>
                    {fibLevels.map((lvl) => {
                      const yLevel = d.startY + dy * lvl;
                      return (
                        <g key={lvl}>
                          <line x1={paddingLeft} y1={yLevel} x2={width - paddingRight} y2={yLevel} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
                          <text x={paddingLeft + 4} y={yLevel - 3} fill="#f59e0b" className="font-mono text-[8px]">
                            Fib {(lvl * 100).toFixed(1)}%
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              }
              if (d.type === 'position' && d.price) {
                const yEntry = getY(d.price);
                const yTarget = getY(d.targetPrice || d.price * 1.04);
                const yStop = getY(d.stopPrice || d.price * 0.98);
                return (
                  <g key={d.id} opacity="0.85">
                    {/* Profit box (Green) */}
                    <rect x={d.startX - 50} y={yTarget} width="100" height={yEntry - yTarget} fill="#089981" fillOpacity="0.2" stroke="#089981" strokeWidth="1" rx="2" />
                    {/* Loss box (Red) */}
                    <rect x={d.startX - 50} y={yEntry} width="100" height={yStop - yEntry} fill="#f23645" fillOpacity="0.2" stroke="#f23645" strokeWidth="1" rx="2" />
                    <text x={d.startX - 45} y={yTarget + 12} fill="#089981" className="font-mono text-[9px] font-bold">Target +4.0%</text>
                    <text x={d.startX - 45} y={yStop - 4} fill="#f23645" className="font-mono text-[9px] font-bold">Stop -2.0%</text>
                  </g>
                );
              }
              return null;
            })}

            {/* Currently drawing active line */}
            {currentDrawing && (
              <line
                x1={currentDrawing.startX}
                y1={currentDrawing.startY}
                x2={currentDrawing.currentX}
                y2={currentDrawing.currentY}
                stroke="#2962ff"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            )}

            {/* Subpane RSI (14) */}
            {showRSI && (
              <g transform={`translate(0, ${paddingTop + mainAreaHeight})`}>
                <line x1={paddingLeft} y1="0" x2={width - paddingRight} y2="0" stroke="currentColor" className="text-neutral-200 dark:text-[#2a2e39]" strokeWidth="1" />
                {/* 70 overbought / 30 oversold bands */}
                <line x1={paddingLeft} y1="18" x2={width - paddingRight} y2="18" stroke="#f23645" strokeDasharray="3,3" strokeWidth="0.8" opacity="0.6" />
                <line x1={paddingLeft} y1="46" x2={width - paddingRight} y2="46" stroke="#089981" strokeDasharray="3,3" strokeWidth="0.8" opacity="0.6" />
                <text x={width - paddingRight + 6} y="22" fill="#787b86" className="font-mono text-[9px]">70</text>
                <text x={width - paddingRight + 6} y="50" fill="#787b86" className="font-mono text-[9px]">30</text>
                {/* RSI Line */}
                <path
                  d={rsiValues.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${(64 - (v! / 100) * 64).toFixed(1)}`).join(' ')}
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Subpane MACD */}
            {showMACD && (
              <g transform={`translate(0, ${paddingTop + mainAreaHeight + subpaneRSIHeight})`}>
                <line x1={paddingLeft} y1="0" x2={width - paddingRight} y2="0" stroke="currentColor" className="text-neutral-200 dark:text-[#2a2e39]" strokeWidth="1" />
                <line x1={paddingLeft} y1="32" x2={width - paddingRight} y2="32" stroke="#787b86" strokeDasharray="2,2" strokeWidth="0.8" opacity="0.5" />
                {macdHist.map((val, i) => {
                  const x = getX(i) - 2;
                  const barH = Math.min(25, Math.abs(val!) * 15);
                  const y = val! >= 0 ? 32 - barH : 32;
                  return (
                    <rect
                      key={`macd-${i}`}
                      x={x}
                      y={y}
                      width="4"
                      height={Math.max(1, barH)}
                      fill={val! >= 0 ? '#089981' : '#f23645'}
                      fillOpacity="0.75"
                    />
                  );
                })}
              </g>
            )}

            {/* Interactive Crosshair & Cursor */}
            {hoverIndex !== null && displayCandles[hoverIndex] && (
              <g>
                <line x1={getX(hoverIndex)} y1={paddingTop} x2={getX(hoverIndex)} y2={chartHeight - paddingBottom} stroke="#787b86" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={paddingLeft} y1={getY(displayCandles[hoverIndex].close)} x2={width - paddingRight} y2={getY(displayCandles[hoverIndex].close)} stroke="#787b86" strokeDasharray="3,3" strokeWidth="1" />
                <g transform={`translate(${width - paddingRight}, ${getY(displayCandles[hoverIndex].close) - 10})`}>
                  <rect x="0" y="0" width="70" height="20" fill="#2962ff" rx="2" />
                  <text x="6" y="14" fill="#ffffff" className="font-mono text-[10px] tabular-nums font-semibold">
                    {displayCandles[hoverIndex].close.toFixed(item.price < 2 ? 4 : 2)}
                  </text>
                </g>
              </g>
            )}

            {/* Current Price Marker */}
            <line x1={paddingLeft} y1={getY(item.price)} x2={width - paddingRight} y2={getY(item.price)} stroke={item.change >= 0 ? '#089981' : '#f23645'} strokeDasharray="1,2" strokeWidth="1.2" />
            <g transform={`translate(${width - paddingRight}, ${getY(item.price) - 10})`}>
              <rect x="0" y="0" width="70" height="20" fill={item.change >= 0 ? '#089981' : '#f23645'} rx="2" />
              <text x="6" y="14" fill="#ffffff" className="font-mono text-[10px] tabular-nums font-bold">
                {item.price.toFixed(item.price < 2 ? 4 : 2)}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
