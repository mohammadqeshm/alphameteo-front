import React from "react";
import { ChartCanvasItem } from "../../../types/canvas";
import { Lock, Unlock, Trash2, Copy, ChartLine, Wind } from "lucide-react";

interface ChartCardProps {
  item: ChartCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<ChartCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] rounded border border-[#1A1F2C] overflow-hidden shadow-2xl select-none">
      {/* Header bar */}
      <div className="h-9 bg-[#0E1118] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 cursor-move">
        <div className="flex items-center space-x-2 min-w-0">
          <ChartLine className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate tracking-tight">
            {item.title || `${item.chartType.toUpperCase()} — ${item.locationName}`}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <select
            value={item.chartType}
            onChange={(e) => onUpdate({ chartType: e.target.value as any })}
            className="bg-[#121622] text-slate-300 border border-[#1A1F2C] rounded px-1.5 py-0.5 text-[9px] outline-none"
          >
            <option value="sounding">Skew-T Sounding</option>
            <option value="meteogram">Meteogram (7-Day)</option>
            <option value="ensemble_plume">Ensemble Plume</option>
          </select>

          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock chart" : "Lock position"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate chart"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete chart"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Sounding / Meteogram Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#06080B] p-2 flex flex-col justify-between">
        {item.chartType === "sounding" ? (
          /* High-Fidelity Thermodynamic Skew-T Sounding */
          <div className="w-full h-full flex flex-col relative">
            {/* Thermodynamic Parameters HUD */}
            <div className="h-6 flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-[#141824] px-1 pb-1 mb-1">
              <span className="text-amber-400 font-bold">SBCAPE: 2840 J/kg</span>
              <span className="text-blue-400">CIN: -25 J/kg</span>
              <span className="text-cyan-400">PWAT: 46.2 mm</span>
              <span className="text-purple-400">0-6km Shear: 42 kts</span>
              <span className="text-emerald-400">LCL: 915 hPa</span>
            </div>

            {/* Skew-T Diagram SVG */}
            <div className="flex-1 w-full relative">
              <svg viewBox="0 0 360 260" className="w-full h-full overflow-hidden">
                {/* Background pressure grid lines (isobars) */}
                {[
                  { p: "1000", y: 240 },
                  { p: "850", y: 195 },
                  { p: "700", y: 155 },
                  { p: "500", y: 105 },
                  { p: "300", y: 55 },
                  { p: "200", y: 20 },
                ].map((lvl, idx) => (
                  <g key={idx}>
                    <line x1="30" y1={lvl.y} x2="330" y2={lvl.y} stroke="#1A2030" strokeWidth="0.8" />
                    <text x="5" y={lvl.y + 3} fill="#64748B" fontSize="7" fontFamily="monospace">
                      {lvl.p}
                    </text>
                  </g>
                ))}

                {/* Skewed Isotherms (45-degree angle lines) */}
                {[-30, -20, -10, 0, 10, 20, 30, 40].map((t, idx) => {
                  const baseX = 40 + idx * 36;
                  return (
                    <line
                      key={idx}
                      x1={baseX}
                      y1="250"
                      x2={baseX + 160}
                      y2="10"
                      stroke="#141B29"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                    />
                  );
                })}

                {/* Freezing Level (0°C isotherm highlighted) */}
                <line x1="148" y1="250" x2="308" y2="10" stroke="#0284C7" strokeWidth="0.9" strokeDasharray="4 2" />
                <text x="280" y="32" fill="#38BDF8" fontSize="6.5" fontFamily="monospace">0°C Level</text>

                {/* CAPE Area (Shaded region between environmental temp and ascending parcel) */}
                <path
                  d="M 180 195 Q 210 155 220 105 Q 215 55 190 20 L 175 20 Q 185 55 180 105 Q 160 155 150 195 Z"
                  fill="rgba(245, 158, 11, 0.18)"
                  stroke="#F59E0B"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <text x="185" y="115" fill="#F59E0B" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  CAPE
                </text>

                {/* Environmental Temperature Profile (T) - Red solid curve */}
                <path
                  d="M 215 240 L 180 195 L 160 155 L 140 105 L 110 55 L 90 20"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Dewpoint Temperature Profile (Td) - Green solid curve */}
                <path
                  d="M 185 240 L 155 195 L 125 155 L 95 105 L 60 55 L 45 20"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Wind Barbs on Right Boundary */}
                {[
                  { y: 240, spd: "15 kts", barb: "M 340 240 L 320 240 M 325 240 L 320 234" },
                  { y: 195, spd: "25 kts", barb: "M 340 195 L 320 195 M 325 195 L 320 188 M 329 195 L 324 188" },
                  { y: 155, spd: "35 kts", barb: "M 340 155 L 320 155 M 325 155 L 320 148 M 329 155 L 324 148 M 333 155 L 329 150" },
                  { y: 105, spd: "50 kts", barb: "M 340 105 L 320 105 M 325 105 L 325 96 L 331 105 Z" }, // Flag for 50 kts
                  { y: 55, spd: "85 kts", barb: "M 340 55 L 320 55 M 325 55 L 325 46 L 331 55 Z M 334 55 L 330 48 M 338 55 L 334 48" },
                  { y: 20, spd: "100 kts", barb: "M 340 20 L 320 20 M 325 20 L 325 11 L 331 20 Z M 332 20 L 332 11 L 338 20 Z" }
                ].map((wb, idx) => (
                  <path key={idx} d={wb.barb} stroke="#94A3B8" strokeWidth="1.4" fill="#94A3B8" />
                ))}

                {/* Legend */}
                <g transform="translate(40, 248)">
                  <line x1="0" y1="0" x2="15" y2="0" stroke="#EF4444" strokeWidth="2" />
                  <text x="20" y="3" fill="#EF4444" fontSize="6.5" fontFamily="monospace">Temp (T)</text>
                  <line x1="75" y1="0" x2="90" y2="0" stroke="#10B981" strokeWidth="2" />
                  <text x="95" y="3" fill="#10B981" fontSize="6.5" fontFamily="monospace">Dewpoint (Td)</text>
                </g>
              </svg>
            </div>
          </div>
        ) : (
          /* Multi-parameter Meteogram */
          <div className="w-full h-full flex flex-col justify-between py-1">
            <div className="h-6 flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-[#141824] px-1 pb-1">
              <span>ECMWF 0.1° High-Res Meteogram</span>
              <span className="text-cyan-400">7-Day Multi-Variable Trend</span>
            </div>

            <div className="flex-1 w-full relative flex items-center">
              <svg viewBox="0 0 360 180" className="w-full h-full">
                {/* Horizontal grid lines */}
                {[30, 70, 110, 150].map((y, idx) => (
                  <line key={idx} x1="20" y1={y} x2="350" y2={y} stroke="#171C28" strokeWidth="0.8" />
                ))}

                {/* Temperature curve (Red/Orange) */}
                <path
                  d="M 25 80 C 60 50, 100 110, 140 60 C 180 30, 220 90, 260 55 C 300 35, 330 65, 350 50"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2.2"
                />

                {/* Dewpoint curve (Green) */}
                <path
                  d="M 25 110 C 60 90, 100 130, 140 100 C 180 85, 220 120, 260 95 C 300 80, 330 105, 350 90"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.8"
                  strokeDasharray="3 2"
                />

                {/* Precipitation Bars (Blue on bottom) */}
                {[
                  { x: 50, h: 18 },
                  { x: 90, h: 5 },
                  { x: 130, h: 42 },
                  { x: 170, h: 65 },
                  { x: 210, h: 30 },
                  { x: 250, h: 10 },
                  { x: 290, h: 0 },
                  { x: 330, h: 22 },
                ].map((bar, idx) => (
                  <rect
                    key={idx}
                    x={bar.x}
                    y={170 - bar.h}
                    width="14"
                    height={bar.h}
                    fill="#38BDF8"
                    rx="1"
                    opacity="0.8"
                  />
                ))}

                <text x="30" y="25" fill="#F97316" fontSize="7" fontFamily="monospace">Temp (°C)</text>
                <text x="110" y="25" fill="#10B981" fontSize="7" fontFamily="monospace">Dewpoint (°C)</text>
                <text x="190" y="25" fill="#38BDF8" fontSize="7" fontFamily="monospace">Precip (mm/3h)</text>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-6 bg-[#080A0E] border-t border-[#141824] px-3 flex items-center justify-between text-[9px] font-mono text-slate-500 shrink-0">
        <span>Location: {item.locationName}</span>
        <span className="text-amber-400">CALCULATED PROFILE</span>
      </div>
    </div>
  );
};
