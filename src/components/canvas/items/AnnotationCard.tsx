import React from "react";
import { AnnotationCanvasItem } from "../../../types/canvas";
import { Lock, Unlock, Trash2, Copy, AlertTriangle } from "lucide-react";

interface AnnotationCardProps {
  item: AnnotationCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<AnnotationCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const AnnotationCard: React.FC<AnnotationCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="w-full h-full relative select-none">
      {/* Sticky Note */}
      {item.shape === "sticky_note" ? (
        <div 
          className="w-full h-full rounded shadow-2xl p-3 flex flex-col justify-between border cursor-move"
          style={{
            backgroundColor: `${item.color}15`,
            borderColor: `${item.color}60`
          }}
        >
          <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${item.color}30` }}>
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: item.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>
                {item.title || "Forecaster Note"}
              </span>
            </div>
            <div className="flex items-center space-x-1" onMouseDown={e => e.stopPropagation()}>
              <button onClick={onDuplicate} className="p-0.5 text-slate-400 hover:text-white transition">
                <Copy className="w-2.5 h-2.5" />
              </button>
              <button onClick={onDelete} className="p-0.5 text-slate-400 hover:text-red-400 transition">
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          <p className="flex-1 text-xs font-mono py-2 text-slate-200 whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar">
            {item.text}
          </p>

          <div className="text-[8px] font-mono text-slate-500 flex justify-between">
            <span>PRIORITY NOTE</span>
            <span>ALERT LEVEL 2</span>
          </div>
        </div>
      ) : item.shape === "convective_watch" ? (
        /* Convective Watch Alert Polygon */
        <div 
          className="w-full h-full rounded border-2 border-dashed flex flex-col items-center justify-center p-3 relative cursor-move overflow-hidden"
          style={{
            borderColor: item.color,
            backgroundColor: `${item.color}10`
          }}
        >
          {/* Diagonal Warning stripes */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${item.color}, ${item.color} 10px, transparent 10px, transparent 20px)`
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase mb-1"
              style={{ backgroundColor: `${item.color}30`, color: item.color }}
            >
              SEVERE CONVECTIVE WATCH
            </span>
            <span className="text-xs font-bold text-slate-200 mt-1 max-w-[90%]">
              {item.text || "Thunderstorm Watch Zone"}
            </span>
          </div>

          <div className="absolute top-1 right-1 flex items-center space-x-1" onMouseDown={e => e.stopPropagation()}>
            <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-400 transition">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : item.shape === "front_cold" ? (
        /* Cold Front Line with Triangles */
        <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
          <line x1="0" y1="20" x2="200" y2="20" stroke="#3B82F6" strokeWidth="3" />
          {[30, 80, 130, 180].map((x, i) => (
            <polygon key={i} points={`${x},20 ${x+12},20 ${x+6},8`} fill="#3B82F6" />
          ))}
          <text x="10" y="36" fill="#3B82F6" fontSize="9" fontWeight="bold" fontFamily="monospace">
            COLD FRONT
          </text>
        </svg>
      ) : item.shape === "front_warm" ? (
        /* Warm Front Line with Semicircles */
        <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
          <line x1="0" y1="20" x2="200" y2="20" stroke="#EF4444" strokeWidth="3" />
          {[30, 80, 130, 180].map((x, i) => (
            <path key={i} d={`M ${x} 20 A 7 7 0 0 1 ${x+14} 20 Z`} fill="#EF4444" />
          ))}
          <text x="10" y="36" fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
            WARM FRONT
          </text>
        </svg>
      ) : (
        /* Jet Stream / Moisture Vector Arrow */
        <svg viewBox="0 0 240 60" className="w-full h-full overflow-visible">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={item.color || "#38BDF8"} />
            </marker>
          </defs>
          <line
            x1="10"
            y1="30"
            x2="220"
            y2="30"
            stroke={item.color || "#38BDF8"}
            strokeWidth="3.5"
            strokeDasharray="6 3"
            markerEnd="url(#arrowhead)"
          />
          <text x="20" y="20" fill={item.color || "#38BDF8"} fontSize="9" fontWeight="bold" fontFamily="monospace">
            {item.text || "SUBTROPICAL JET AXIS (95+ KTS)"}
          </text>
        </svg>
      )}
    </div>
  );
};
