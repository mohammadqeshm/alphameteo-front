import React, { useState } from 'react';
import { ActiveLayer, WeatherLayer } from '../../types';
import { COLOR_PALETTES } from '../../data/meteoCatalog';
import { Sliders, Sparkles, X, RotateCcw, Palette, Eye, Sun, Contrast, Layers, ChevronDown } from 'lucide-react';

interface LayerSettingsPanelProps {
  activeLayers: ActiveLayer[];
  onUpdateActiveLayer: (layer: ActiveLayer) => void;
  // Legacy single layer props support
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
  visualizationStyle: 'raw_pixel' | 'discrete' | 'continuous';
  onVisualizationStyleChange: (style: 'raw_pixel' | 'discrete' | 'continuous') => void;
  heatmapRadius?: number;
  onHeatmapRadiusChange?: (val: number) => void;
  onClose?: () => void;
}

export const LayerSettingsPanel: React.FC<LayerSettingsPanelProps> = ({
  activeLayers,
  onUpdateActiveLayer,
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
  visualizationStyle,
  onVisualizationStyleChange,
  heatmapRadius = 3.5,
  onHeatmapRadiusChange,
  onClose
}) => {
  // Currently selected layer instance ID from the active stack (if available)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(
    activeLayers.length > 0 ? activeLayers[0].instanceId : ''
  );

  const selectedStackLayer = activeLayers.find(l => l.instanceId === selectedInstanceId) || activeLayers[0];

  return (
    <div className="flex flex-col h-full bg-[#08090C] text-slate-200 select-none overflow-hidden" id="layer-settings-panel">
      
      {/* 1. Header */}
      <div className="p-3 border-b border-[#1A1C23] bg-[#0b0d13] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Layer Settings & Styling
            </h2>
            <span className="text-[9px] font-mono text-slate-500 block">
              تنظیمات نمایش و رنگ‌بندی لایه‌ها
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

        {/* 2. Active Layer Selector Dropdown (If multiple layers exist) */}
        {activeLayers.length > 1 && (
          <div className="bg-[#0e1017] p-2.5 rounded-lg border border-[#1A1C23] space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 block">
              Select Active Layer to Edit
            </label>
            <div className="relative">
              <select
                value={selectedInstanceId}
                onChange={(e) => setSelectedInstanceId(e.target.value)}
                className="w-full bg-[#12141A] text-xs font-bold text-slate-100 p-2 rounded border border-[#212530] appearance-none focus:outline-none focus:border-blue-500 pr-8"
              >
                {activeLayers.map(layer => (
                  <option key={layer.instanceId} value={layer.instanceId}>
                    {layer.customLabel || `${layer.sourceName} - ${layer.variableName}`} ({layer.levelName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Selected Layer Info Summary */}
        <div className="bg-[#10131b] p-3 rounded-lg border border-[#1f2330] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              {selectedStackLayer ? (selectedStackLayer.customLabel || selectedStackLayer.variableName) : activeLayer.name}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {selectedStackLayer ? `${selectedStackLayer.sourceName} • ${selectedStackLayer.levelName}` : activeLayer.description}
            </span>
          </div>

          <button
            onClick={onAnalyzeCoords}
            disabled={isAnalyzing}
            className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded border border-blue-500/40 text-[10px] font-bold tracking-wider uppercase transition flex items-center space-x-1 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze'}</span>
          </button>
        </div>

        {/* 3. Visualization Mode */}
        <div className="bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Visualization Mode
            </span>
            <span className="text-[9px] font-mono text-blue-400 font-bold uppercase">
              {visualizationStyle}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'continuous', name: 'Continuous', desc: 'Smooth gradient' },
              { id: 'discrete', name: 'Banded', desc: 'Stepped layers' },
              { id: 'raw_pixel', name: 'Grid Pixels', desc: 'Raw raster' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => onVisualizationStyleChange(mode.id as any)}
                className={`p-2 rounded border text-left transition ${
                  visualizationStyle === mode.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#12141a] border-[#1A1C23] text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-xs font-bold block">{mode.name}</span>
                <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Color Scale & Palette Ramp Selection */}
        <div className="bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Color Ramp Scale
            </span>

            <select
              value={colorScaleName}
              onChange={(e) => onColorScaleChange(e.target.value)}
              className="bg-[#12141a] text-xs font-bold text-slate-200 border border-[#212530] rounded px-2 py-1 focus:outline-none"
            >
              <option value="Thermal">Thermal Scale</option>
              <option value="Jet">Jet Scale</option>
              <option value="Spectral">Spectral Scale</option>
              <option value="Glow">Glow Scale</option>
            </select>
          </div>

          {/* Preset Palettes Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {COLOR_PALETTES.map(p => {
              const isSelected = selectedStackLayer?.paletteId === p.id || colorScaleName.toLowerCase() === p.name.toLowerCase();
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onColorScaleChange(p.name);
                    if (selectedStackLayer) {
                      onUpdateActiveLayer({ ...selectedStackLayer, paletteId: p.id, paletteColors: p.colors });
                    }
                  }}
                  className={`p-2 rounded border text-left flex flex-col gap-1.5 transition ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-[#12141A] border-[#1A1C23] hover:border-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-200">{p.name}</span>
                  <div className="h-2 w-full rounded flex overflow-hidden border border-black/30">
                    {p.colors.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Domain Value Bounds (Min / Max) */}
        <div className="bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23] space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
            Data Bounds & Range Limits ({selectedStackLayer ? selectedStackLayer.variableUnit : activeLayer.unit})
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-500 block mb-1">Minimum Bound</label>
              <div className="flex items-center bg-[#12141A] border border-[#212530] rounded px-2 py-1">
                <input
                  type="number"
                  value={selectedStackLayer ? selectedStackLayer.minVal : minVal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onMinValChange(val);
                    if (selectedStackLayer) {
                      onUpdateActiveLayer({ ...selectedStackLayer, minVal: val });
                    }
                  }}
                  className="bg-transparent text-xs text-white font-mono w-full focus:outline-none"
                />
                <span className="text-[9px] font-mono text-slate-500">
                  {selectedStackLayer ? selectedStackLayer.variableUnit : activeLayer.unit}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 block mb-1">Maximum Bound</label>
              <div className="flex items-center bg-[#12141A] border border-[#212530] rounded px-2 py-1">
                <input
                  type="number"
                  value={selectedStackLayer ? selectedStackLayer.maxVal : maxVal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onMaxValChange(val);
                    if (selectedStackLayer) {
                      onUpdateActiveLayer({ ...selectedStackLayer, maxVal: val });
                    }
                  }}
                  className="bg-transparent text-xs text-white font-mono w-full focus:outline-none"
                />
                <span className="text-[9px] font-mono text-slate-500">
                  {selectedStackLayer ? selectedStackLayer.variableUnit : activeLayer.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Opacity Slider */}
        <div className="bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Layer Opacity
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {selectedStackLayer ? selectedStackLayer.opacity : layerOpacity}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={selectedStackLayer ? selectedStackLayer.opacity : layerOpacity}
            onChange={(e) => {
              const val = Number(e.target.value);
              onOpacityChange(val);
              if (selectedStackLayer) {
                onUpdateActiveLayer({ ...selectedStackLayer, opacity: val });
              }
            }}
            className="w-full h-1.5 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* 7. Fine-Tuning Filters (Brightness, Contrast, Saturation) */}
        {selectedStackLayer && (
          <div className="bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23] space-y-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
              Raster Fine-Tuning Filters
            </span>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Brightness</span>
                <span>{selectedStackLayer.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={selectedStackLayer.brightness}
                onChange={(e) => onUpdateActiveLayer({ ...selectedStackLayer, brightness: Number(e.target.value) })}
                className="w-full h-1 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Contrast</span>
                <span>{selectedStackLayer.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={selectedStackLayer.contrast}
                onChange={(e) => onUpdateActiveLayer({ ...selectedStackLayer, contrast: Number(e.target.value) })}
                className="w-full h-1 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Color Saturation</span>
                <span>{selectedStackLayer.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={selectedStackLayer.saturation}
                onChange={(e) => onUpdateActiveLayer({ ...selectedStackLayer, saturation: Number(e.target.value) })}
                className="w-full h-1 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
