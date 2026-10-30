import React from "react";
import { FrameCanvasItem } from "../../../types/canvas";
import { Lock, Unlock, Trash2, Copy, Layout } from "lucide-react";

interface FrameCardProps {
  item: FrameCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<FrameCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const FrameCard: React.FC<FrameCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const themeColors = {
    cyan: { border: "border-cyan-500/40", text: "text-cyan-400", bg: "bg-cyan-500/5", badge: "bg-cyan-500/20 text-cyan-300" },
    amber: { border: "border-amber-500/40", text: "text-amber-400", bg: "bg-amber-500/5", badge: "bg-amber-500/20 text-amber-300" },
    rose: { border: "border-rose-500/40", text: "text-rose-400", bg: "bg-rose-500/5", badge: "bg-rose-500/20 text-rose-300" },
    purple: { border: "border-purple-500/40", text: "text-purple-400", bg: "bg-purple-500/5", badge: "bg-purple-500/20 text-purple-300" },
    default: { border: "border-[#1E2536]", text: "text-slate-300", bg: "bg-white/[0.01]", badge: "bg-slate-800 text-slate-300" }
  };

  const currentTheme = themeColors[item.colorTheme || "default"];

  return (
    <div className={`w-full h-full rounded-lg border-2 ${currentTheme.border} ${currentTheme.bg} flex flex-col justify-between p-4 pointer-events-none select-none transition`}>
      {/* Frame Header - pointer events enabled so forecaster can drag frame */}
      <div className="flex items-center justify-between pointer-events-auto bg-[#07090E]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#1A1F2C] cursor-move shadow-md">
        <div className="flex items-center space-x-2 min-w-0">
          <Layout className={`w-3.5 h-3.5 ${currentTheme.text}`} />
          <span className={`font-mono font-bold text-xs uppercase tracking-wider ${currentTheme.text}`}>
            {item.title}
          </span>
          {item.description && (
            <span className="text-[10px] text-slate-400 font-sans truncate hidden md:inline">
              · {item.description}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <select
            value={item.colorTheme || "default"}
            onChange={(e) => onUpdate({ colorTheme: e.target.value as any })}
            className="bg-[#121622] text-slate-300 border border-[#1A1F2C] rounded px-1 py-0.5 text-[9px] outline-none"
          >
            <option value="cyan">Cyan</option>
            <option value="amber">Amber</option>
            <option value="rose">Rose</option>
            <option value="purple">Purple</option>
            <option value="default">Default</option>
          </select>

          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock frame" : "Lock frame"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate frame"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete frame"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Frame boundary guides */}
      <div className="flex justify-between items-end text-[8px] font-mono text-slate-600 px-1">
        <span>SECTION CONTAINER</span>
        <span>{Math.round(item.width)} × {Math.round(item.height)} px</span>
      </div>
    </div>
  );
};
