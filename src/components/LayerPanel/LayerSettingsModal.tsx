import React, { useState } from 'react';
import { ActiveLayer, BlendMode } from '../../types';
import { COLOR_PALETTES, VERTICAL_LEVELS, VISUALIZATION_OPTIONS } from '../../data/meteoCatalog';
import { X, Sliders, Palette, Check, RotateCcw, Clock, Layers } from 'lucide-react';

interface LayerSettingsModalProps {
  layer: ActiveLayer | null;
  onClose: () => void;
  onUpdateLayer: (layer: ActiveLayer) => void;
}

export const LayerSettingsModal: React.FC<LayerSettingsModalProps> = ({
  layer,
  onClose,
  onUpdateLayer
}) => {
  if (!layer) return null;

  const [brightness, setBrightness] = useState(layer.brightness);
  const [contrast, setContrast] = useState(layer.contrast);
  const [saturation, setSaturation] = useState(layer.saturation);
  const [invertPalette, setInvertPalette] = useState(layer.invertPalette);
  const [blendMode, setBlendMode] = useState<BlendMode>(layer.blendMode);
  const [minVal, setMinVal] = useState(layer.minVal);
  const [maxVal, setMaxVal] = useState(layer.maxVal);
  const [paletteId, setPaletteId] = useState(layer.paletteId);
  const [timelineSync, setTimelineSync] = useState(layer.timelineSync);

  const handleSave = () => {
    const pal = COLOR_PALETTES.find(p => p.id === paletteId) || COLOR_PALETTES[0];
    let finalColors = [...pal.colors];
    if (invertPalette) {
      finalColors.reverse();
    }

    onUpdateLayer({
      ...layer,
      brightness,
      contrast,
      saturation,
      invertPalette,
      blendMode,
      minVal,
      maxVal,
      paletteId: pal.id,
      paletteColors: finalColors,
      timelineSync
    });

    onClose();
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setInvertPalette(false);
    setBlendMode('normal');
    setMinVal(layer.minVal);
    setMaxVal(layer.maxVal);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#08090C] border border-[#1A1C23] rounded-xl w-full max-w-md overflow-hidden shadow-2xl text-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1A1C23] flex items-center justify-between bg-[#0b0d13]">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Layer Fine-Tuning: {layer.customLabel || layer.variableName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Visual Adjustments (Brightness, Contrast, Saturation) */}
          <div className="space-y-3 bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23]">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
              Raster Display Parameters
            </span>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Brightness</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Contrast</span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-1 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Color Saturation</span>
                <span>{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-1 bg-[#1A1C23] rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Color Scale Domain Limits */}
          <div className="space-y-2 bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23]">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
              Value Scale Domain Range ({layer.variableUnit})
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Scale Minimum</label>
                <input
                  type="number"
                  value={minVal}
                  onChange={(e) => setMinVal(Number(e.target.value))}
                  className="w-full bg-[#12141A] text-xs text-white p-1.5 rounded border border-[#212530] focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Scale Maximum</label>
                <input
                  type="number"
                  value={maxVal}
                  onChange={(e) => setMaxVal(Number(e.target.value))}
                  className="w-full bg-[#12141A] text-xs text-white p-1.5 rounded border border-[#212530] focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 font-medium">Invert Palette Direction</span>
              <button
                onClick={() => setInvertPalette(!invertPalette)}
                className={`w-9 h-5 rounded-full transition p-0.5 ${
                  invertPalette ? 'bg-blue-600' : 'bg-[#1A1C23]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                  invertPalette ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Timeline Sync Behavior */}
          <div className="bg-[#0e1017] p-3 rounded-lg border border-[#1A1C23]">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">
              Timeline Behavior
            </span>
            <select
              value={timelineSync}
              onChange={(e) => setTimelineSync(e.target.value as any)}
              className="w-full bg-[#12141A] text-xs text-slate-200 rounded border border-[#212530] p-1.5 focus:outline-none font-medium"
            >
              <option value="main">Synchronize with Master Forecast Timeline</option>
              <option value="static">Static (Fix to Current GRIB Step)</option>
              <option value="offset_12h">Offset +12h Future Step Comparison</option>
            </select>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#1A1C23] flex items-center justify-between bg-[#0b0d13]">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Settings</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition shadow-md"
            >
              Apply Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
