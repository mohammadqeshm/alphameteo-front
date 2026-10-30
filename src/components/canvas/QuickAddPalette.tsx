import React, { useState, useEffect, useRef } from "react";
import { CanvasItem } from "../../types/canvas";
import { Search, Compass, Activity, ChartLine, Type, AlertTriangle, Layout, X } from "lucide-react";

interface QuickAddPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemPartial: Partial<CanvasItem>) => void;
}

export const QuickAddPalette: React.FC<QuickAddPaletteProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const catalog: Array<{ title: string; category: string; icon: any; action: () => void }> = [
    {
      title: "ECMWF 500 hPa Geopotential Height",
      category: "Live Map",
      icon: Compass,
      action: () => onSelect({
        type: "live_map",
        title: "ECMWF 500 hPa Geopotential",
        activeLayerId: "pressure",
        level: "500hPa",
        model: "ECMWF HRES",
        width: 480,
        height: 440,
        coords: { lat: 27.2, lon: 56.3, elevation: 15 },
        zoom: 6.0
      })
    },
    {
      title: "GFS 850 hPa Theta-E Moisture",
      category: "Live Map",
      icon: Compass,
      action: () => onSelect({
        type: "live_map",
        title: "GFS 850 hPa Theta-E",
        activeLayerId: "temperature",
        level: "850hPa",
        model: "GFS Global",
        width: 480,
        height: 440,
        coords: { lat: 27.2, lon: 56.3, elevation: 15 },
        zoom: 6.0
      })
    },
    {
      title: "MJO Wheeler-Hendon Phase Diagram",
      category: "Climate Index",
      icon: Activity,
      action: () => onSelect({
        type: "climate_index",
        title: "MJO Wheeler-Hendon Phase Diagram",
        indexId: "mjo",
        viewMode: "phase_diagram",
        dataSource: "BOM Australia",
        width: 380,
        height: 420
      })
    },
    {
      title: "Indian Ocean Dipole (IOD DMI)",
      category: "Climate Index",
      icon: Activity,
      action: () => onSelect({
        type: "climate_index",
        title: "Indian Ocean Dipole (DMI)",
        indexId: "iod",
        viewMode: "timeseries",
        dataSource: "BOM Australia",
        width: 340,
        height: 420
      })
    },
    {
      title: "ENSO Niño 3.4 SST Anomaly",
      category: "Climate Index",
      icon: Activity,
      action: () => onSelect({
        type: "climate_index",
        title: "ENSO — Niño 3.4 SST Anomaly",
        indexId: "nino34",
        viewMode: "summary",
        dataSource: "NOAA CPC",
        width: 240,
        height: 380
      })
    },
    {
      title: "Thermodynamic Skew-T Sounding",
      category: "Chart",
      icon: ChartLine,
      action: () => onSelect({
        type: "chart",
        title: "Thermodynamic Skew-T Sounding",
        chartType: "sounding",
        locationName: "Bandar Abbas (OIKB)",
        coords: { lat: 27.218, lon: 56.377, elevation: 10 },
        model: "ECMWF / GFS Blended",
        width: 480,
        height: 460
      })
    },
    {
      title: "7-Day High-Resolution Meteogram",
      category: "Chart",
      icon: ChartLine,
      action: () => onSelect({
        type: "chart",
        title: "7-Day Meteogram",
        chartType: "meteogram",
        locationName: "Bandar Abbas (OIKB)",
        coords: { lat: 27.218, lon: 56.377, elevation: 10 },
        model: "ECMWF HRES",
        width: 480,
        height: 340
      })
    },
    {
      title: "Forecaster Synoptic Reasoning Block",
      category: "Text",
      icon: Type,
      action: () => onSelect({
        type: "text",
        title: "Forecaster Reasoning",
        textRole: "body",
        content: "### 1. SYNOPTIC ASSESSMENT:\nEnter notes here...",
        width: 480,
        height: 320
      })
    },
    {
      title: "Severe Convective Watch Polygon",
      category: "Annotation",
      icon: AlertTriangle,
      action: () => onSelect({
        type: "annotation",
        title: "Severe Convective Watch",
        shape: "convective_watch",
        color: "#EF4444",
        text: "SEVERE CONVECTIVE WATCH ZONE",
        width: 320,
        height: 160
      })
    },
    {
      title: "Section Frame Container",
      category: "Frame",
      icon: Layout,
      action: () => onSelect({
        type: "frame",
        title: "NEW ANALYSIS SECTION",
        colorTheme: "cyan",
        width: 900,
        height: 520
      })
    }
  ];

  const filtered = catalog.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-[520px] max-w-[90vw] bg-[#0A0D14] border border-[#1A1F2C] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
        <div className="h-12 border-b border-[#1A1F2C] px-3 flex items-center space-x-2 bg-[#0E121B]">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered.length > 0) {
                filtered[0].action();
                onClose();
              }
            }}
            placeholder="Type to search weather cards, maps, soundings, indices... (Press ESC to exit)"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium"
          />
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar bg-[#06080C]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching meteorological objects found
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#121622] cursor-pointer transition text-xs group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="p-1.5 rounded bg-[#161B28] text-slate-400 group-hover:text-cyan-300 transition">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-200 group-hover:text-white transition truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-[#0C101A] px-2 py-0.5 rounded border border-[#1A1F2C]">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
