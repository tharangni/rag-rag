import React from 'react';
import { DrawingTool } from '../types/market';
import {
  MousePointer,
  TrendingUp,
  Minus,
  Percent,
  Target,
  Ruler,
  Trash2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onClearDrawings: () => void;
  drawingsCount: number;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  onSelectTool,
  onClearDrawings,
  drawingsCount,
}) => {
  const tools: { id: DrawingTool; label: string; icon: React.ReactNode }[] = [
    { id: 'cursor', label: 'Crosshair / Pointer (V)', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'trendline', label: 'Trendline Tool (Alt+T)', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'horizontal', label: 'Horizontal Ray / Level (Alt+H)', icon: <Minus className="w-4 h-4" /> },
    { id: 'fibonacci', label: 'Fibonacci Retracement (Alt+F)', icon: <Percent className="w-4 h-4" /> },
    { id: 'position', label: 'Long / Short Position Tool', icon: <Target className="w-4 h-4" /> },
    { id: 'measure', label: 'Measurement Tool (Shift+Click)', icon: <Ruler className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col items-center gap-1 p-1 bg-white dark:bg-[#1e222d] border border-neutral-200 dark:border-[#2a2e39] rounded-lg shrink-0 select-none shadow-xs">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => {
              soundEngine.playClick();
              onSelectTool(t.id);
            }}
            className={`p-2 rounded-md transition-all cursor-pointer relative group ${
              isActive
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-neutral-500 dark:text-[#787b86] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2e39]'
            }`}
            title={t.label}
          >
            {t.icon}

            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 px-2 py-1 text-[11px] whitespace-nowrap bg-neutral-900 text-white rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {t.label}
            </div>
          </button>
        );
      })}

      <div className="w-4 h-[1px] bg-neutral-200 dark:bg-[#2a2e39] my-1" />

      {/* Clear drawings button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          onClearDrawings();
        }}
        disabled={drawingsCount === 0}
        className={`p-2 rounded-md transition-all cursor-pointer relative group ${
          drawingsCount > 0
            ? 'text-neutral-500 dark:text-[#787b86] hover:text-rose-500 hover:bg-rose-500/10'
            : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
        }`}
        title={`Clear Drawings (${drawingsCount})`}
      >
        <Trash2 className="w-4 h-4" />
        {drawingsCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#2962ff] rounded-full" />
        )}
      </button>
    </div>
  );
};
