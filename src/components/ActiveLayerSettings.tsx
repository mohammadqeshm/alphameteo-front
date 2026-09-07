import React, { useState } from "react";
import { WeatherLayer } from "../types";
import { Sliders, Eye, Sparkles, ChevronDown, ChevronRight, Search, X } from "lucide-react";

interface ActiveLayerSettingsProps {
  activeLayer: WeatherLayer;
  layerOpacity: number;
  onOpacityChange: (val: number) => void;
  minVal: number;
  maxVal: number;
  onMinValChange: (val: number) => void;
  onMaxValChange: (val: number) => void;
  colorScaleName: string;
  onColorScaleChange: (scale: string) => void;
  onAnalyzeCoords: () => void;
  isAnalyzing: boolean;
  visualizationStyle: "raw_pixel" | "discrete" | "continuous";
  onVisualizationStyleChange: (style: "raw_pixel" | "discrete" | "continuous") => void;
  heatmapRadius?: number;
  onHeatmapRadiusChange?: (val: number) => void;
}

export const ActiveLayerSettings: React.FC<ActiveLayerSettingsProps> = ({
  activeLayer,
  layerOpacity,
  onOpacityChange,
  minVal,
  maxVal,
  onMinValChange,
  onMaxValChange,
  colorScaleName,
  onColorScaleChange,
  onAnalyzeCoords,
  isAnalyzing,
  visualizationStyle = "continuous",
  onVisualizationStyleChange,
  heatmapRadius = 3.5,
  onHeatmapRadiusChange,
}) => {
  const [isStyleExpanded, setIsStyleExpanded] = useState(true);

  const getGradientClass = (scaleName: string, layer: WeatherLayer) => {
    switch (scaleName) {
      case "Thermal":
        return "from-purple-900 via-blue-600 via-green-500 via-yellow-500 to-red-600";
      case "Jet":
        return "from-blue-900 via-cyan-500 via-emerald-500 via-yellow-400 to-red-600";
      case "Spectral":
        return "from-indigo-900 via-teal-500 via-yellow-400 to-red-500";
      case "Glow":
        return "from-pink-900 via-fuchsia-600 via-yellow-400 to-cyan-300";
      default:
        return layer.gradient || "from-blue-950 via-cyan-700 via-blue-500 to-indigo-600";
    }
  };

  return (
    <div className="p-4 bg-[#08090C] border-t border-[#1A1C23] shrink-0 overflow-y-auto max-h-[55%] custom-scrollbar" id="active-layer-settings-box">
      {/* Header */}
      <div className="flex justify-between items-start mb-3.5">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-100">{activeLayer.name}</span>
          <span className="text-[10px] text-slate-500">{activeLayer.description}</span>
        </div>
        <div className="flex items-center space-x-2.5 text-slate-400">
          <button 
            onClick={onAnalyzeCoords}
            className="p-1 hover:text-blue-400 text-blue-500 rounded transition flex items-center space-x-1" 
            title="Scientific AI Analysis"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">AI ANALYZE</span>
          </button>
          <X className="w-4 h-4 hover:text-slate-200 cursor-pointer" />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Color Scale */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">Color scale</span>
          <div className="relative group">
            <select
              value={colorScaleName}
              onChange={(e) => onColorScaleChange(e.target.value)}
              className="bg-[#040507] text-xs text-slate-200 border border-[#1A1C23] rounded px-2 py-0.5 outline-none cursor-pointer appearance-none pr-6 font-medium"
            >
               <option value="Thermal">Thermal</option>
               <option value="Jet">Jet</option>
               <option value="Spectral">Spectral</option>
               <option value="Glow">Glow</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Expandable Visualization Style section */}
        <div className="bg-[#101216] border border-[#1E2129] rounded-lg p-2.5 space-y-2">
          <button
            type="button"
            onClick={() => setIsStyleExpanded(!isStyleExpanded)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-300 hover:text-white transition focus:outline-none"
          >
            <div className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span className="uppercase tracking-wider">Visualization Style</span>
            </div>
            {isStyleExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {isStyleExpanded && (
            <div className="pt-1.5 space-y-1.5 border-t border-[#1E2129]/60">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: "continuous", label: "Gradient", desc: "Smooth continuous blend" },
                  { value: "discrete", label: "Banded", desc: "Smooth stepped layers" },
                  { value: "raw_pixel", label: "Grid", desc: "Default raw pixels" }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onVisualizationStyleChange(item.value as any)}
                    className={`p-1.5 rounded border text-left flex flex-col justify-between transition-all duration-150 ${
                      visualizationStyle === item.value
                        ? "bg-blue-600/15 border-blue-500 text-blue-200"
                        : "bg-[#040507] border-[#1E2129] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                    <span className="text-[7.5px] text-slate-500 mt-0.5 leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gradient Scale Bar */}
        <div 
          className={`h-2.5 w-full rounded bg-gradient-to-r ${getGradientClass(colorScaleName, activeLayer)}`} 
          id="scale-gradient-bar" 
        />

        {/* Min/Max Inputs */}
        <div className="flex space-x-3.5">
          <div className="flex-1 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">Min Bounds</span>
            <div className="bg-[#040507] border border-[#1A1C23] rounded px-2 py-1 flex justify-between items-center">
              <input
                type="number"
                value={minVal}
                onChange={(e) => onMinValChange(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none w-14"
              />
              <span className="text-[10px] text-slate-500 font-mono font-bold">{activeLayer.unit}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">Max Bounds</span>
            <div className="bg-[#040507] border border-[#1A1C23] rounded px-2 py-1 flex justify-between items-center">
              <input
                type="number"
                value={maxVal}
                onChange={(e) => onMaxValChange(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none w-14"
              />
              <span className="text-[10px] text-slate-500 font-mono font-bold">{activeLayer.unit}</span>
            </div>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Opacity</span>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              value={layerOpacity}
              onChange={(e) => onOpacityChange(parseInt(e.target.value))}
              className="flex-1 h-1 bg-[#1A1C23] rounded-lg appearance-none cursor-pointer accent-blue-500"
              id="layer-opacity-range"
            />
            <span className="text-xs font-semibold w-8 text-right text-slate-300 font-mono">{layerOpacity}%</span>
          </div>
        </div>

        {/* Heatmap Radius Slider */}
        {activeLayer.id === "heatmap_demo" && (
          <div className="flex flex-col bg-[#0C0E12] border border-[#1E2129]/60 p-2.5 rounded-md mt-1.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex justify-between font-sans">
              <span>INFLUENCE RADIUS (DISTANCE)</span>
              <span className="text-blue-400 font-mono">{heatmapRadius.toFixed(1)}°</span>
            </span>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={heatmapRadius}
                onChange={(e) => onHeatmapRadiusChange?.(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-[#1A1C23] rounded-lg appearance-none cursor-pointer accent-blue-500"
                id="heatmap-radius-range"
              />
              <span className="text-xs font-semibold w-10 text-right text-slate-300 font-mono">{heatmapRadius.toFixed(1)}°</span>
            </div>
            <span className="text-[8.5px] text-slate-500 mt-1 leading-normal">
              Adjusts the geographic radius of influence for each station point. Overlapping radii create warmer spots.
            </span>
          </div>
        )}

        {/* More Options Section */}
        <div className="flex justify-between items-center pt-1.5 cursor-pointer text-slate-400 hover:text-slate-200 transition border-t border-[#1A1C23]/40">
          <span className="text-xs">Advanced interpolation (linear)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
