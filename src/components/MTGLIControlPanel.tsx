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
      eumetsatMtgService.stopLiveStream();
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
      name: "Camera 1 (North-West / NW)",
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
      name: "Camera 2 (North-East / NE)",
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
      name: "Camera 3 (South-West / SW)",
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
      name: "Camera 4 (South-East / SE)",
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
      className="absolute top-[84px] left-2.5 right-12 sm:top-3.5 sm:left-auto sm:right-14 z-40 sm:w-96 max-w-[calc(100%-4rem)] bg-[#0c1017]/95 backdrop-blur-md border border-sky-500/30 rounded-xl shadow-2xl text-white font-sans overflow-hidden transition-all duration-300"
    >
      {/* 1. Header with satellite credentials */}
      <div className="bg-gradient-to-r from-sky-950/80 via-[#0d1527] to-[#0c1017] p-2.5 sm:p-3 border-b border-sky-500/20 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 relative shrink-0">
            <Zap className="w-4 h-4 fill-sky-400/30 text-sky-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-xs font-black tracking-wide text-white truncate">EUMETSAT MTG-LI</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold shrink-0">
                SIMULATED
              </span>
            </div>
            <div className="text-[10px] text-sky-200/80 font-mono flex items-center space-x-1 truncate">
              <span>MTG-I1 (0.0° GEO)</span>
              <span>·</span>
              <span className="text-amber-300">777.4 nm</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Fetch Latest API Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3 sm:p-3.5 space-y-3 sm:space-y-3.5 text-xs max-h-[55dvh] sm:max-h-[75dvh] overflow-y-auto custom-scrollbar">
          {/* 2. Top Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">Active Flashes</div>
              <div className="text-sm font-black text-sky-400 font-mono">
                {stats?.totalActiveFlashes ?? 0}
              </div>
            </div>
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">Rate (/min)</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {stats?.ratePerMinute ?? 0}
              </div>
            </div>
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">Resolution</div>
              <div className="text-sm font-black text-amber-400 font-mono">
                4.5 km
              </div>
            </div>
            <div className="bg-[#131b2c] p-2 rounded-lg border border-sky-900/40">
              <div className="text-[10px] text-slate-400">Disk Coverage</div>
              <div className="text-sm font-black text-purple-400 font-mono">
                ~84%
              </div>
            </div>
          </div>

          {/* 3. Four Optical Cameras (OC1, OC2, OC3, OC4) Switches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>4 Optical Cameras (MTG-LI)</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {activeCameras.length} of 4 active
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
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleCamera(cam.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-transform ${
                          isEnabled
                            ? "bg-slate-900 shadow-inner"
                            : "bg-slate-800 text-slate-500"
                        }`}
                        style={{ color: isEnabled ? cam.color : undefined }}
                        title={isEnabled ? "Disable this camera" : "Enable this camera"}
                      >
                        {cam.code}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-200 truncate">{cam.name}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-400 truncate">{cam.region}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">
                        {cam.count}
                      </span>
                      {onFocusRegion && (
                        <button
                          onClick={() => onFocusRegion(cam.focusKey)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Zoom to camera coverage zone"
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
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Coverage Footprint (GeoJSON)</span>
              </div>
              <button
                onClick={() => onToggleCoverageBoundary(!showCoverageBoundary)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition ${
                  showCoverageBoundary
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {showCoverageBoundary ? "Visible" : "Hidden"}
              </button>
            </div>

            {/* Product Type (LFL, LGR, AF) */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] pt-1.5 border-t border-slate-800/80">
              <span className="text-slate-400">Product Level:</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
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

          {/* 5. Live Optical Strike Telemetry */}
          <div className="p-2.5 rounded-lg bg-[#0e131e] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Latest Lightning Telemetry</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-mono flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>No Map Popups</span>
              </span>
            </div>

            {selectedFlashInfo ? (
              <div className="font-mono text-[10px] space-y-1 bg-black/40 p-2 rounded border border-slate-800/60 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event ID:</span>
                  <span className="text-sky-300 truncate max-w-[170px]">{selectedFlashInfo.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-white">
                    {selectedFlashInfo.lat?.toFixed?.(3)}°N, {selectedFlashInfo.lon?.toFixed?.(3)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Optical Camera:</span>
                  <span className="text-emerald-300 font-bold">{selectedFlashInfo.cameraName || selectedFlashInfo.cameraCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Optical Radiance:</span>
                  <span className="text-amber-300">{selectedFlashInfo.radiance || "4.82"} J·m⁻²·sr⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pulse Duration:</span>
                  <span className="text-white">{selectedFlashInfo.durationMs || "65"} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Source Satellite:</span>
                  <span className="text-sky-400">Meteosat-12 (MTG-I1)</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-slate-500 text-[10px]">
                Waiting for telemetry stream from lightning service...
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-[9.5px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>On-map popups are suppressed to preserve clear visual inspection.</span>
            </div>
          </div>

          {/* 6. Quick Region Camera Focus Buttons */}
          {onFocusRegion && (
            <div className="flex items-center space-x-1.5 pt-1">
              <button
                onClick={() => onFocusRegion("full_disk")}
                className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
              >
                Full Disk View
              </button>
              <button
                onClick={() => onFocusRegion("oc2")}
                className="flex-1 py-1.5 px-2 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium transition"
              >
                Middle East Focus (OC2)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
