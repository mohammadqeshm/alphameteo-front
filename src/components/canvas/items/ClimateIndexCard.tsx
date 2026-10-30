import React from "react";
import { ClimateIndexCanvasItem } from "../../../types/canvas";
import { getClimateIndexData } from "../../../services/climateIndexService";
import { Lock, Unlock, Trash2, Copy, Activity, RefreshCw } from "lucide-react";

interface ClimateIndexCardProps {
  item: ClimateIndexCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<ClimateIndexCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ClimateIndexCard: React.FC<ClimateIndexCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const meta = getClimateIndexData(item.indexId);

  const isPositive = meta.anomaly >= 0;
  const isMjo = item.indexId === "mjo";

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] rounded border border-[#1A1F2C] overflow-hidden shadow-2xl select-none">
      {/* Header bar */}
      <div className="h-9 bg-[#0E1118] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 cursor-move">
        <div className="flex items-center space-x-2 min-w-0">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate tracking-tight">
            {meta.name} — {meta.fullName}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          {/* View mode toggle */}
          <select
            value={item.viewMode}
            onChange={(e) => onUpdate({ viewMode: e.target.value as any })}
            className="bg-[#121622] text-slate-300 border border-[#1A1F2C] rounded px-1.5 py-0.5 text-[9px] outline-none"
          >
            {isMjo ? (
              <>
                <option value="phase_diagram">Phase Diagram</option>
                <option value="timeseries">Amplitude History</option>
                <option value="summary">Summary</option>
              </>
            ) : (
              <>
                <option value="timeseries">Anomaly Chart</option>
                <option value="summary">Summary Card</option>
              </>
            )}
          </select>

          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock card" : "Lock position"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate card"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete card"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Metric Banner */}
      <div className="p-3 bg-[#080A0E] border-b border-[#141824] flex items-center justify-between shrink-0">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {meta.agency} · {meta.status}
          </div>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
              {meta.currentValue > 0 ? `+${meta.currentValue}` : meta.currentValue}
            </span>
            <span className="text-xs font-mono text-slate-400">{meta.unit}</span>
            <span className={`text-xs font-mono font-semibold tabular-nums ml-2 ${
              isPositive ? "text-rose-400" : "text-cyan-400"
            }`}>
              ({meta.anomaly > 0 ? `+${meta.anomaly}` : meta.anomaly} anomaly)
            </span>
          </div>
        </div>

        {meta.phase && (
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-slate-400">Active Sector</span>
            <div className="text-sm font-bold text-amber-400 font-mono">{meta.phase}</div>
          </div>
        )}
      </div>

      {/* Visual content based on view mode */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#07090C] p-3 flex flex-col justify-between">
        {isMjo && item.viewMode === "phase_diagram" && meta.mjoPhaseData ? (
          /* MJO Wheeler-Hendon Phase Diagram */
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative">
            <svg viewBox="-140 -140 280 280" className="w-full h-full max-h-[300px] overflow-visible">
              {/* Outer boundary box */}
              <rect x="-120" y="-120" width="240" height="240" fill="none" stroke="#1E2536" strokeWidth="1" />
              
              {/* Diagonal and cross phase quadrant axes */}
              <line x1="-120" y1="0" x2="120" y2="0" stroke="#1E2536" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="-120" x2="0" y2="120" stroke="#1E2536" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="-120" y1="-120" x2="120" y2="120" stroke="#181F2E" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="-120" y1="120" x2="120" y2="-120" stroke="#181F2E" strokeWidth="1" strokeDasharray="2 2" />

              {/* Unit Circle (Amplitude = 1.0) */}
              <circle cx="0" cy="0" r="45" fill="#0C101A" stroke="#334155" strokeWidth="1.2" strokeDasharray="4 2" />
              <text x="5" y="-48" fill="#64748B" fontSize="7" fontFamily="monospace">Amp = 1.0</text>

              {/* 8 Wheeler-Hendon Phase labels */}
              <text x="-95" y="60" fill="#94A3B8" fontSize="8" fontWeight="bold">Phase 1</text>
              <text x="-95" y="-50" fill="#38BDF8" fontSize="8" fontWeight="bold">Phase 2</text>
              <text x="-40" y="-95" fill="#38BDF8" fontSize="8" fontWeight="bold">Phase 3</text>
              <text x="35" y="-95" fill="#94A3B8" fontSize="8" fontWeight="bold">Phase 4</text>
              <text x="80" y="-50" fill="#94A3B8" fontSize="8" fontWeight="bold">Phase 5</text>
              <text x="80" y="60" fill="#94A3B8" fontSize="8" fontWeight="bold">Phase 6</text>
              <text x="35" y="105" fill="#94A3B8" fontSize="8" fontWeight="bold">Phase 7</text>
              <text x="-40" y="105" fill="#94A3B8" fontSize="8" fontWeight="bold">Phase 8</text>

              {/* Geographic Region Names */}
              <text x="-115" y="-124" fill="#64748B" fontSize="6.5" fontFamily="monospace">INDIAN OCEAN</text>
              <text x="35" y="-124" fill="#64748B" fontSize="6.5" fontFamily="monospace">MARITIME CONT.</text>
              <text x="60" y="128" fill="#64748B" fontSize="6.5" fontFamily="monospace">PACIFIC OCEAN</text>
              <text x="-115" y="128" fill="#64748B" fontSize="6.5" fontFamily="monospace">WESTERN HEMIS.</text>

              {/* Trajectory line connecting past days */}
              <path
                d={meta.mjoPhaseData.trajectory.reduce((acc, pt, i) => {
                  const sx = pt.rmm1 * 45;
                  const sy = -pt.rmm2 * 45; // Inverted Y in SVG
                  return i === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
                }, "")}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Past trajectory points */}
              {meta.mjoPhaseData.trajectory.map((pt, i) => {
                const isLatest = i === meta.mjoPhaseData!.trajectory.length - 1;
                const sx = pt.rmm1 * 45;
                const sy = -pt.rmm2 * 45;
                return (
                  <g key={i}>
                    <circle
                      cx={sx}
                      cy={sy}
                      r={isLatest ? 4.5 : 2.5}
                      fill={isLatest ? "#F59E0B" : "#38BDF8"}
                      stroke="#0A0C10"
                      strokeWidth={1}
                    />
                    {isLatest && (
                      <text x={sx + 6} y={sy + 3} fill="#F59E0B" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                        Latest
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          /* Time Series Anomaly Bars */
          <div className="flex-1 w-full h-full flex flex-col justify-end pb-2">
            <div className="h-full w-full flex items-end space-x-1.5 relative border-b border-[#1E2536]">
              {/* Zero midline */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#334155]/60 pointer-events-none" />

              {meta.history.map((h, i) => {
                const maxAbs = Math.max(...meta.history.map(pt => Math.abs(pt.anomaly)), 1.5);
                const barHeightPercent = (Math.abs(h.anomaly) / maxAbs) * 45; // Max 45% up or down from midline
                const isPos = h.anomaly >= 0;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#121622] text-slate-200 text-[8px] font-mono px-1 py-0.5 rounded border border-[#1A1F2C] pointer-events-none transition z-20 whitespace-nowrap">
                      {h.date}: {h.anomaly > 0 ? `+${h.anomaly}` : h.anomaly}
                    </div>

                    {/* Bar */}
                    <div className="w-full flex flex-col items-center h-full relative">
                      {isPos ? (
                        <div
                          className="w-full bg-rose-500/80 rounded-t-xs hover:bg-rose-400 transition"
                          style={{
                            height: `${barHeightPercent}%`,
                            position: "absolute",
                            bottom: "50%"
                          }}
                        />
                      ) : (
                        <div
                          className="w-full bg-cyan-500/80 rounded-b-xs hover:bg-cyan-400 transition"
                          style={{
                            height: `${barHeightPercent}%`,
                            position: "absolute",
                            top: "50%"
                          }}
                        />
                      )}
                    </div>

                    <span className="text-[7.5px] font-mono text-slate-500 mt-1 truncate max-w-full">
                      {h.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Synopsis footnote */}
        <p className="text-[9.5px] text-slate-400 font-sans line-clamp-2 border-t border-[#141824] pt-2 mt-1">
          {meta.description}
        </p>
      </div>

      {/* Footer */}
      <div className="h-6 bg-[#080A0E] border-t border-[#141824] px-3 flex items-center justify-between text-[9px] font-mono text-slate-500 shrink-0">
        <span>Attribution: {meta.agency}</span>
        <span className="text-emerald-400/80">REAL CLIMATE OBSERVATION</span>
      </div>
    </div>
  );
};
