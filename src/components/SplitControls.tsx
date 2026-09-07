import React, { useState, useRef, useEffect } from "react";
import { SplitLayoutMode, WeatherLayer } from "../types";
import { WEATHER_LAYERS } from "../data";
import {
  Square,
  Columns2,
  Grid2x2,
  LayoutGrid,
  Link2,
  Unlink,
  Check,
  Sparkles,
  Maximize2,
  ChevronDown,
  Layers,
  MapPin,
  HelpCircle
} from "lucide-react";

interface SplitControlsProps {
  splitLayout: SplitLayoutMode;
  onSelectLayout: (mode: SplitLayoutMode) => void;
  activePaneIndex: number;
  totalPanes: number;
  syncCoords: boolean;
  onToggleSyncCoords: () => void;
  activePaneTitle: string;
  activePaneLayerName: string;
}

export const SplitControls: React.FC<SplitControlsProps> = ({
  splitLayout,
  onSelectLayout,
  activePaneIndex,
  totalPanes,
  syncCoords,
  onToggleSyncCoords,
  activePaneTitle,
  activePaneLayerName,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const layoutOptions: Array<{
    id: SplitLayoutMode;
    titleFa: string;
    titleEn: string;
    count: number;
    desc: string;
    icon: React.ReactNode;
    renderPreview: () => React.ReactNode;
  }> = [
    {
      id: "single",
      titleFa: "یکتایی (۱ نقشه)",
      titleEn: "Single View (1 Map)",
      count: 1,
      desc: "نقشه استاندارد کامل تک پنجره",
      icon: <Square className="w-4 h-4" />,
      renderPreview: () => (
        <div className="w-10 h-7 bg-blue-500/20 border border-blue-400/60 rounded flex items-center justify-center text-[9px] text-blue-300 font-bold">
          1
        </div>
      )
    },
    {
      id: "dual",
      titleFa: "۲ تایی (دو نقشه عمودی)",
      titleEn: "Dual View (2 Maps)",
      count: 2,
      desc: "دو نقشه مجزا در کنار هم برای مقایسه مستقیم",
      icon: <Columns2 className="w-4 h-4" />,
      renderPreview: () => (
        <div className="w-10 h-7 grid grid-cols-2 gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-700">
          <div className="bg-blue-500/30 border border-blue-400/50 rounded-sm flex items-center justify-center text-[7px] text-blue-300 font-bold">1</div>
          <div className="bg-indigo-500/30 border border-indigo-400/50 rounded-sm flex items-center justify-center text-[7px] text-indigo-300 font-bold">2</div>
        </div>
      )
    },
    {
      id: "triple",
      titleFa: "۳ تایی (۲ بالا + ۱ پایین)",
      titleEn: "Triple View (3 Maps)",
      count: 3,
      desc: "دو نقشه در بالا و یک نقشه عریض در پایین",
      icon: <LayoutGrid className="w-4 h-4" />,
      renderPreview: () => (
        <div className="w-10 h-7 grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-700">
          <div className="bg-blue-500/30 border border-blue-400/50 rounded-sm flex items-center justify-center text-[6px] text-blue-300 font-bold">1</div>
          <div className="bg-indigo-500/30 border border-indigo-400/50 rounded-sm flex items-center justify-center text-[6px] text-indigo-300 font-bold">2</div>
          <div className="col-span-2 bg-emerald-500/30 border border-emerald-400/50 rounded-sm flex items-center justify-center text-[6px] text-emerald-300 font-bold">3</div>
        </div>
      )
    },
    {
      id: "quad",
      titleFa: "۴ تایی (چهار نقشه ۲×۲)",
      titleEn: "Quad View (4 Maps)",
      count: 4,
      desc: "چهار نقشه همزمان ۲ در ۲ برای بررسی چندگانه",
      icon: <Grid2x2 className="w-4 h-4" />,
      renderPreview: () => (
        <div className="w-10 h-7 grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-700">
          <div className="bg-blue-500/30 border border-blue-400/50 rounded-sm flex items-center justify-center text-[6px] text-blue-300 font-bold">1</div>
          <div className="bg-indigo-500/30 border border-indigo-400/50 rounded-sm flex items-center justify-center text-[6px] text-indigo-300 font-bold">2</div>
          <div className="bg-emerald-500/30 border border-emerald-400/50 rounded-sm flex items-center justify-center text-[6px] text-emerald-300 font-bold">3</div>
          <div className="bg-amber-500/30 border border-amber-400/50 rounded-sm flex items-center justify-center text-[6px] text-amber-300 font-bold">4</div>
        </div>
      )
    }
  ];

  const currentLayoutOption = layoutOptions.find(o => o.id === splitLayout) || layoutOptions[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="split-screen-controls">
      
      {/* Trigger Button */}
      <div className="flex items-center space-x-1 bg-[#12141A] hover:bg-[#181B24] border border-[#232838] rounded-lg p-1 transition shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-2.5 py-1 rounded text-xs font-bold transition ${
            splitLayout !== "single"
              ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300 border border-blue-500/40 shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
          title="تنظیمات اسپلیت نقشه (Split Screen Layout)"
        >
          {currentLayoutOption.icon}
          <span className="font-sans font-bold text-[11px] tracking-wide">
            {splitLayout === "single" ? "اسپلیت نقشه" : `${currentLayoutOption.count} نقشه`}
          </span>
          {splitLayout !== "single" && (
            <span className="bg-blue-500/30 text-blue-300 text-[9px] px-1.5 py-0.2 rounded font-mono border border-blue-400/30">
              P{activePaneIndex + 1}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Quick Position Sync Button when in multi-map mode */}
        {splitLayout !== "single" && (
          <button
            onClick={onToggleSyncCoords}
            className={`p-1.5 rounded transition border ${
              syncCoords
                ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                : "bg-[#181D2B] border-[#293046] text-slate-500 hover:text-slate-200"
            }`}
            title={syncCoords ? "موقعیت همه نقشه‌ها همگام است (Sync On)" : "موقعیت نقشه‌ها مستقل است (Sync Off)"}
          >
            {syncCoords ? <Link2 className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#0B0D14]/95 backdrop-blur-xl border border-[#232A3E] rounded-xl shadow-2xl z-50 p-3.5 text-slate-200 space-y-3 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Menu Header */}
          <div className="flex items-center justify-between border-b border-[#1E2436] pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30 text-blue-400">
                <Grid2x2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">چیدمان چند نقشه (Split Screen)</h4>
                <p className="text-[10px] text-slate-400">انتخاب تعداد نقشه‌ها برای مقایسه همزمان</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-xs p-1 hover:bg-[#181D2C] rounded transition"
            >
              ✕
            </button>
          </div>

          {/* Active Pane Info Notification */}
          <div className="bg-[#121726] border border-blue-500/30 rounded-lg p-2.5 flex items-start space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mt-1 shrink-0" />
            <div className="text-[11px] leading-snug">
              <span className="text-slate-400">نقشه فعال: </span>
              <span className="font-bold text-blue-300">{activePaneTitle}</span>
              <span className="text-slate-400"> ({activePaneLayerName})</span>
              <p className="text-[9px] text-slate-500 mt-1">
                هر لایه‌ای از منوها یا نوار بالا انتخاب کنید، روی نقشه فعال ست می‌شود.
              </p>
            </div>
          </div>

          {/* Grid Layout Options */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              انتخاب حالت چیدمان:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {layoutOptions.map((option) => {
                const isSelected = splitLayout === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      onSelectLayout(option.id);
                      setIsOpen(false);
                    }}
                    className={`group relative p-2.5 rounded-lg border cursor-pointer transition-all duration-150 flex items-center justify-between space-x-2.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-950/60 via-[#141B30] to-[#0E1220] border-blue-500 shadow-md shadow-blue-950/40 ring-1 ring-blue-500/40"
                        : "bg-[#111522] border-[#1E2436] hover:border-slate-500 hover:bg-[#161B2B]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className="shrink-0">
                        {option.renderPreview()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold text-slate-100 truncate block">
                            {option.titleFa}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 line-clamp-1 block mt-0.5">
                          {option.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-blue-500 text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Position Option Switch */}
          {splitLayout !== "single" && (
            <div
              onClick={onToggleSyncCoords}
              className="bg-[#121624] border border-[#21283B] rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:border-blue-500/40 transition"
            >
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-md ${syncCoords ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-500"}`}>
                  {syncCoords ? <Link2 className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">همگام‌سازی جابجایی و زوم (Sync Viewports)</span>
                  <span className="text-[9px] text-slate-400 block">
                    {syncCoords ? "همه نقشه‌ها رو یک نقطه سنک هستند" : "هر نقشه مستقلاً جابجا می‌شود"}
                  </span>
                </div>
              </div>

              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${syncCoords ? "bg-blue-600" : "bg-slate-800"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${syncCoords ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </div>
          )}

          {/* Bottom Help Tip */}
          <div className="pt-2 border-t border-[#1E2436] flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>کلیک روی هدر هر نقشه آن را فعال می‌کند.</span>
            </span>
            <button
              onClick={() => {
                onSelectLayout("single");
                setIsOpen(false);
              }}
              className="text-blue-400 hover:underline font-bold"
            >
              ریست به ۱ نقشه
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
