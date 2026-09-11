import React, { useState, useEffect } from "react";
import {
  Zap,
  Radio,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  Satellite,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Compass,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck
} from "lucide-react";
import { eumetsatMtgService, MTGLIPayload, MTGLITelemetryStats } from "../services/eumetsatMtgService";

interface MTGLIControlPanelProps {
  isVisible: boolean;
  onClose?: () => void;
  onFocusRegion?: (region: "full_disk" | "oc1" | "oc2" | "oc3" | "oc4") => void;
  showCoverageBoundary: boolean;
  onToggleCoverageBoundary: (show: boolean) => void;
  activeCameras: number[];
  onToggleCamera: (cameraId: number) => void;
}

export const MTGLIControlPanel: React.FC<MTGLIControlPanelProps> = ({
  isVisible,
  onClose,
  onFocusRegion,
  showCoverageBoundary,
  onToggleCoverageBoundary,
  activeCameras,
  onToggleCamera
}) => {
  const [stats, setStats] = useState<MTGLITelemetryStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<"LFL" | "LGR" | "AF">("LFL");
  const [selectedFlashInfo, setSelectedFlashInfo] = useState<any | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Start live subscription
    eumetsatMtgService.startLiveStream();

    const unsubscribe = eumetsatMtgService.subscribe((payload: MTGLIPayload) => {
      setStats(payload.stats);
      if (payload.geojson?.features?.length > 0) {
        setSelectedFlashInfo(payload.geojson.features[0].properties);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await eumetsatMtgService.refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const camerasConfig = [
    {
      id: 1,
      code: "OC1",
      name: "Camera 1 (شمال‌غربی / NW)",
      region: "Europe, UK, Scandinavia & N. Atlantic",
      color: "#38BDF8",
      bgColor: "bg-sky-500/10 border-sky-500/30 text-sky-400",
      activeBg: "bg-sky-500/20 text-sky-300 border-sky-400",
      count: stats?.cameras?.oc1?.flashes ?? 0,
      focusKey: "oc1" as const
    },
    {
      id: 2,
      code: "OC2",
      name: "Camera 2 (شمال‌شرقی / NE)",
      region: "Middle East, Iran, Iraq, Levant & Caspian",
      color: "#34D399",
      bgColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      activeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400",
      count: stats?.cameras?.oc2?.flashes ?? 0,
      focusKey: "oc2" as const
    },
    {
      id: 3,
      code: "OC3",
      name: "Camera 3 (جنوب‌غربی / SW)",
      region: "West Africa, Equatorial Atlantic & Brazil edge",
      color: "#FBBF24",
      bgColor: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      activeBg: "bg-amber-500/20 text-amber-300 border-amber-400",
      count: stats?.cameras?.oc3?.flashes ?? 0,
      focusKey: "oc3" as const
    },
    {
      id: 4,
      code: "OC4",
      name: "Camera 4 (جنوب‌شرقی / SE)",
      region: "East Africa, Yemen, Indian Ocean & Madagascar",
      color: "#F472B6",
      bgColor: "bg-pink-500/10 border-pink-500/30 text-pink-400",
      activeBg: "bg-pink-500/20 text-pink-300 border-pink-400",
      count: stats?.cameras?.oc4?.flashes ?? 0,
      focusKey: "oc4" as const
    }
  ];

  return (
    <div
      id="mtg-li-control-panel"
      className="absolute top-14 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-[#0c1017]/95 backdrop-blur-md border border-sky-500/30 rounded-xl shadow-2xl text-white font-sans overflow-hidden transition-all duration-300"
    >
      {/* 1. Header with satellite credentials */}
      <div className="bg-gradient-to-r from-sky-950/80 via-[#0d1527] to-[#0c1017] p-3 border-b border-sky-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 relative">
            <Zap className="w-4 h-4 fill-sky-400/30 text-sky-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <span className="text-xs font-black tracking-wide text-white">EUMETSAT MTG-LI</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                OPERATIONAL
              </span>
            </div>
            <div className="text-[10px] text-sky-200/80 font-mono flex items-center space-x-1 rtl:space-x-reverse">
              <span>MTG-I1 (0.0° GEO)</span>
              <span>·</span>
              <span className="text-amber-300">777.4 nm</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="بروزرسانی داده‌های لحظه‌ای / Fetch Latest API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? "گسترش پنل" : "جمع کردن پنل"}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 2. Top Telemetry Metrics */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">صاعقه‌های فعال</div>
              <div className="text-sm font-black text-sky-400 font-mono">
                {stats?.totalActiveFlashes ?? 0}
              </div>
            </div>
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">نرخ (در دقیقه)</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {stats?.ratePerMinute ?? 0}
              </div>
            </div>
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">دقت سنسور</div>
              <div className="text-sm font-black text-amber-400 font-mono">
                4.5 km
              </div>
            </div>
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">پوشش دیسک</div>
              <div className="text-sm font-black text-purple-400 font-mono">
                ~84%
              </div>
            </div>
          </div>

          {/* 3. Four Optical Cameras (OC1, OC2, OC3, OC4) Switches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-300 font-medium">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>۴ دوربین نوری MTG-LI (Optical Cameras)</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {activeCameras.length} از ۴ دوربین فعال
              </div>
            </div>

            <div className="space-y-1.5">
              {camerasConfig.map((cam) => {
                const isEnabled = activeCameras.includes(cam.id);
                return (
                  <div
                    key={cam.id}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                      isEnabled ? cam.activeBg : "bg-[#111622] border-slate-800 text-slate-400 opacity-65"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse flex-1 min-w-0">
                      <button
                        onClick={() => onToggleCamera(cam.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-transform ${
                          isEnabled
                            ? "bg-slate-900 shadow-inner"
                            : "bg-slate-800 text-slate-500"
                        }`}
                        style={{ color: isEnabled ? cam.color : undefined }}
                        title={isEnabled ? "غیرفعال کردن این دوربین" : "فعال کردن این دوربین"}
                      >
                        {cam.code}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <span className="font-semibold text-slate-200 truncate">{cam.name}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-400 truncate">{cam.region}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">
                        {cam.count}
                      </span>
                      {onFocusRegion && (
                        <button
                          onClick={() => onFocusRegion(cam.focusKey)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="زوم روی محدوده پوشش این دوربین"
                        >
                          <Compass className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onToggleCamera(cam.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                          isEnabled ? "bg-sky-500" : "bg-slate-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            isEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Coverage Footprint Toggle & Product Level */}
          <div className="p-2.5 rounded-lg bg-[#111726] border border-sky-900/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-300">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>نمایش چندضلعی محدوده پوشش (Coverage GeoJSON)</span>
              </div>
              <button
                onClick={() => onToggleCoverageBoundary(!showCoverageBoundary)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition ${
                  showCoverageBoundary
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {showCoverageBoundary ? "روشن (Visible)" : "خاموش (Hidden)"}
              </button>
            </div>

            {/* Product Type (LFL, LGR, AF) */}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
              <span className="text-slate-400">سطح محصول EUMETSAT:</span>
              <div className="flex space-x-1 rtl:space-x-reverse font-mono text-[10px]">
                <button
                  onClick={() => setSelectedProduct("LFL")}
                  className={`px-2 py-0.5 rounded transition ${
                    selectedProduct === "LFL"
                      ? "bg-sky-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  LI-2-LFL (Flashes)
                </button>
                <button
                  onClick={() => setSelectedProduct("LGR")}
                  className={`px-2 py-0.5 rounded transition ${
                    selectedProduct === "LGR"
                      ? "bg-sky-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  LI-2-LGR (Groups)
                </button>
              </div>
            </div>
          </div>

          {/* 5. Live Optical Strike Telemetry (Replaces on-map popup!) */}
          <div className="p-2.5 rounded-lg bg-[#0e131e] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-300 font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>آخرین تله‌متری صاعقه فضاپایه</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-mono flex items-center space-x-1 rtl:space-x-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>بدون پاپ‌آپ روی نقشه</span>
              </span>
            </div>

            {selectedFlashInfo ? (
              <div className="font-mono text-[10px] space-y-1 bg-black/40 p-2 rounded border border-slate-800/60 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">شناسه رویداد:</span>
                  <span className="text-sky-300 truncate max-w-[170px]">{selectedFlashInfo.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">موقعیت جغرافیایی:</span>
                  <span className="text-white">
                    {selectedFlashInfo.lat?.toFixed?.(3)}°N, {selectedFlashInfo.lon?.toFixed?.(3)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">دوربین ناظر:</span>
                  <span className="text-emerald-300 font-bold">{selectedFlashInfo.cameraName || selectedFlashInfo.cameraCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">انرژی نوری (Radiance):</span>
                  <span className="text-amber-300">{selectedFlashInfo.radiance || "4.82"} J·m⁻²·sr⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">طول مدت تخلیه (Duration):</span>
                  <span className="text-white">{selectedFlashInfo.durationMs || "65"} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ماهواره مبدا:</span>
                  <span className="text-sky-400">Meteosat-12 (MTG-I1)</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-slate-500 text-[10px]">
                در حال دریافت سیگنال از سرور EUMETSAT...
              </div>
            )}

            <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[9.5px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>پاپ‌آپ نقشه طبق درخواست غیرفعال است تا دید بصری کامل حفظ شود.</span>
            </div>
          </div>

          {/* 6. Quick Region Camera Focus Buttons */}
          {onFocusRegion && (
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse pt-1">
              <button
                onClick={() => onFocusRegion("full_disk")}
                className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
              >
                دید کامل دیسک (Full Disk)
              </button>
              <button
                onClick={() => onFocusRegion("oc2")}
                className="flex-1 py-1.5 px-2 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium transition"
              >
                کانون ایران و خاورمیانه (OC2)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
