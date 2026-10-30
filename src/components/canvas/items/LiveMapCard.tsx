import React, { useState, useRef, useEffect } from "react";
import { LiveMapCanvasItem, SyncGroup } from "../../../types/canvas";
import { MeteoMap } from "../../MeteoMap";
import { WEATHER_LAYERS } from "../../../data";
import {
  Layers,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Link2,
  Unlink,
  Maximize2,
  Compass,
  Gauge
} from "lucide-react";

interface LiveMapCardProps {
  item: LiveMapCanvasItem;
  isSelected: boolean;
  syncGroups: SyncGroup[];
  onUpdate: (updated: Partial<LiveMapCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
}

export const LiveMapCard: React.FC<LiveMapCardProps> = ({
  item,
  isSelected,
  syncGroups,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [mapDrawings, setMapDrawings] = useState<any[]>([]);
  const [isMapLocked, setIsMapLocked] = useState<boolean>(false);
  const activeWeatherLayer = WEATHER_LAYERS.find(l => l.id === item.activeLayerId) || WEATHER_LAYERS[0];

  useEffect(() => {
    if (!cardRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const assignedSyncGroup = syncGroups.find(g => g.id === item.syncGroupId);

  const handleLayerChange = (layerId: string) => {
    const selected = WEATHER_LAYERS.find(l => l.id === layerId);
    if (selected) {
      onUpdate({
        activeLayerId: layerId,
        colorScaleName: selected.unit === "°C" ? "Thermal" : selected.unit === "hPa" ? "Pressure" : "Ocean"
      });
    }
  };

  const handleModelChange = (model: string) => {
    onUpdate({ model });
  };

  const handleLevelChange = (level: string) => {
    onUpdate({ level });
  };

  const handleToggleSyncGroup = () => {
    if (item.syncGroupId) {
      onUpdate({ syncGroupId: undefined });
    } else if (syncGroups.length > 0) {
      onUpdate({ syncGroupId: syncGroups[0].id });
    }
  };

  return (
    <div ref={cardRef} className="w-full h-full flex flex-col bg-[#0A0C10] rounded border border-[#1A1F2C] overflow-hidden shadow-2xl select-none">
      {/* Header bar */}
      <div className="h-9 bg-[#0E1118] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 cursor-move">
        {/* Title & Model Info */}
        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate tracking-tight">
            {item.title || `${item.model} — ${activeWeatherLayer.name}`}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {item.level || "Surface"}
          </span>
        </div>

        {/* Sync & Actions HUD */}
        <div className="flex items-center space-x-1.5 shrink-0" onMouseDown={e => e.stopPropagation()}>
          {/* Sync group badge */}
          {assignedSyncGroup ? (
            <button
              onClick={handleToggleSyncGroup}
              className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium transition"
              style={{ backgroundColor: `${assignedSyncGroup.color}20`, color: assignedSyncGroup.color, borderColor: `${assignedSyncGroup.color}40`, borderWidth: 1 }}
              title={`Linked to ${assignedSyncGroup.name} (Click to unlink)`}
            >
              <Link2 className="w-2.5 h-2.5" />
              <span>{assignedSyncGroup.name}</span>
            </button>
          ) : (
            <button
              onClick={handleToggleSyncGroup}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
              title="Add to Sync Group"
            >
              <Unlink className="w-3 h-3" />
            </button>
          )}

          {/* Interactive toggle */}
          <button
            onClick={() => setIsInteractive(!isInteractive)}
            className={`p-1 rounded transition ${isInteractive ? "text-cyan-400 bg-cyan-950/40" : "text-slate-500 hover:text-slate-300"}`}
            title={isInteractive ? "Map is interactive (Click to freeze canvas pan)" : "Map is frozen (Click to interact)"}
          >
            <Compass className="w-3 h-3" />
          </button>

          {/* Lock item */}
          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock item" : "Lock item position"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>

          {/* Duplicate */}
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate map card"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete from canvas"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="h-7 bg-[#07090D] border-b border-[#141824] px-2.5 flex items-center justify-between text-[10px] text-slate-400 shrink-0" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center space-x-2">
          {/* Layer Selector */}
          <select
            value={item.activeLayerId}
            onChange={(e) => handleLayerChange(e.target.value)}
            className="bg-[#121622] text-slate-200 border border-[#1A1F2C] rounded px-1.5 py-0.5 text-[10px] outline-none"
          >
            {WEATHER_LAYERS.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Model Selector */}
          <select
            value={item.model}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-[#121622] text-slate-200 border border-[#1A1F2C] rounded px-1.5 py-0.5 text-[10px] outline-none"
          >
            <option value="ECMWF HRES">ECMWF HRES 0.1°</option>
            <option value="GFS Global">GFS 0.25°</option>
            <option value="ICON Global">ICON 13km</option>
            <option value="EUMETSAT MTG">EUMETSAT MTG</option>
          </select>

          {/* Level Selector */}
          <select
            value={item.level || "Surface"}
            onChange={(e) => handleLevelChange(e.target.value)}
            className="bg-[#121622] text-slate-200 border border-[#1A1F2C] rounded px-1.5 py-0.5 text-[10px] outline-none"
          >
            <option value="Surface">Surface</option>
            <option value="1000hPa">1000 hPa</option>
            <option value="850hPa">850 hPa</option>
            <option value="700hPa">700 hPa</option>
            <option value="500hPa">500 hPa</option>
            <option value="300hPa">300 hPa</option>
            <option value="250hPa">250 hPa (Jet)</option>
          </select>
        </div>

        {/* Coordinates readout */}
        <div className="font-mono text-[9px] text-slate-500 hidden sm:flex items-center space-x-1">
          <span>{item.coords.lat.toFixed(2)}°N</span>
          <span>·</span>
          <span>{item.coords.lon.toFixed(2)}°E</span>
          <span>·</span>
          <span>Z{item.zoom.toFixed(1)}</span>
        </div>
      </div>

      {/* Map Content Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-black" onMouseDown={e => {
        if (!isInteractive) return;
        // Don't drag the canvas when interacting with the map
        e.stopPropagation();
      }}>
        {isVisible ? (
          <MeteoMap
            currentCoords={item.coords}
            onCoordsChange={(c) => {
              onUpdate({ coords: c });
            }}
            activeLayer={activeWeatherLayer}
            layerOpacity={item.layerOpacity ?? 85}
            minVal={activeWeatherLayer.min}
            maxVal={activeWeatherLayer.max}
            colorScaleName={item.colorScaleName || "Thermal"}
            visualizationStyle={item.visualizationStyle || "continuous"}
            activeLayers={[]}
            timelineHour={item.forecastHour || 0}
            activeTool="select"
            drawings={mapDrawings}
            setDrawings={setMapDrawings}
            mapLocked={isMapLocked || Boolean(item.isLocked)}
            onMapLockToggle={(locked) => setIsMapLocked(locked)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090D] text-slate-500 text-xs font-mono">
            <span className="text-cyan-400 mb-1">{item.model}</span>
            <span>{activeWeatherLayer.name}</span>
            <span className="text-[10px] text-slate-600 mt-2">Off-screen standby</span>
          </div>
        )}

        {/* Frozen Indicator overlay when non-interactive */}
        {!isInteractive && (
          <div 
            onClick={() => setIsInteractive(true)}
            className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center cursor-pointer group"
          >
            <span className="px-3 py-1 rounded bg-[#0A0C10]/90 text-[10px] font-mono text-slate-300 border border-[#1A1F2C] shadow-lg group-hover:border-cyan-500/50 transition">
              Click to activate interactive map
            </span>
          </div>
        )}
      </div>

      {/* Card Footer Telemetry */}
      <div className="h-6 bg-[#080A0E] border-t border-[#141824] px-3 flex items-center justify-between text-[9px] font-mono text-slate-500 shrink-0">
        <span className="truncate">Run: {item.run || "00Z"} · Valid: T+{item.forecastHour}h</span>
        <span className="text-cyan-500/80">LIVE MODEL FEED</span>
      </div>
    </div>
  );
};
