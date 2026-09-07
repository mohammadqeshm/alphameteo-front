import React, { useState } from 'react';
import { ActiveLayer, BlendMode } from '../../types';
import { COLOR_PALETTES, VISUALIZATION_OPTIONS } from '../../data/meteoCatalog';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Edit2,
  Sliders,
  ArrowUp,
  ArrowDown,
  Palette,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Wind,
  CloudRain,
  CloudSnow,
  Gauge,
  Droplets,
  Cloud,
  Zap,
  Waves,
  Satellite,
  Radar,
  Radio,
  Calendar
} from 'lucide-react';

const getVariableIcon = (variableId: string) => {
  if (variableId.includes('temp') || variableId.includes('heat')) return Thermometer;
  if (variableId.includes('wind') || variableId.includes('jet')) return Wind;
  if (variableId.includes('precip') || variableId.includes('reflectivity')) return CloudRain;
  if (variableId.includes('snow')) return CloudSnow;
  if (variableId.includes('press') || variableId.includes('mslp')) return Gauge;
  if (variableId.includes('hum') || variableId.includes('dew') || variableId.includes('pwat')) return Droplets;
  if (variableId.includes('cloud')) return Cloud;
  if (variableId.includes('vis') || variableId.includes('fog')) return Eye;
  if (variableId.includes('cape') || variableId.includes('light') || variableId.includes('cin')) return Zap;
  if (variableId.includes('wave') || variableId.includes('sst')) return Waves;
  if (variableId.includes('sat')) return Satellite;
  if (variableId.includes('radar')) return Radar;
  if (variableId.includes('obs')) return Radio;
  if (variableId.includes('seas') || variableId.includes('climate')) return Calendar;
  return Layers;
};

interface ActiveLayersStackProps {
  layers: ActiveLayer[];
  onUpdateLayer: (updatedLayer: ActiveLayer) => void;
  onRemoveLayer: (instanceId: string) => void;
  onDuplicateLayer: (layer: ActiveLayer) => void;
  onReorderLayers: (reorderedLayers: ActiveLayer[]) => void;
  onOpenSettingsModal: (layer: ActiveLayer) => void;
  onClearAll: () => void;
}

export const ActiveLayersStack: React.FC<ActiveLayersStackProps> = ({
  layers,
  onUpdateLayer,
  onRemoveLayer,
  onDuplicateLayer,
  onReorderLayers,
  onOpenSettingsModal,
  onClearAll
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabelText, setEditLabelText] = useState<string>('');
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);

  // Move layer up in stack (increase zIndex)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...layers];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onReorderLayers(updated);
  };

  // Move layer down in stack (decrease zIndex)
  const handleMoveDown = (index: number) => {
    if (index === layers.length - 1) return;
    const updated = [...layers];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onReorderLayers(updated);
  };

  // Start inline rename
  const handleStartRename = (layer: ActiveLayer) => {
    setEditingId(layer.instanceId);
    setEditLabelText(layer.customLabel || layer.variableName);
  };

  // Confirm inline rename
  const handleSaveRename = (layer: ActiveLayer) => {
    if (editLabelText.trim()) {
      onUpdateLayer({ ...layer, customLabel: editLabelText.trim() });
    }
    setEditingId(null);
  };

  // Toggle Visibility
  const handleToggleVisibility = (layer: ActiveLayer) => {
    onUpdateLayer({ ...layer, visible: !layer.visible });
  };

  // Toggle Lock
  const handleToggleLock = (layer: ActiveLayer) => {
    onUpdateLayer({ ...layer, locked: !layer.locked });
  };

  // Change Opacity
  const handleOpacityChange = (layer: ActiveLayer, opacity: number) => {
    onUpdateLayer({ ...layer, opacity });
  };

  // Change Blend Mode
  const handleBlendModeChange = (layer: ActiveLayer, blendMode: BlendMode) => {
    onUpdateLayer({ ...layer, blendMode });
  };

  // Change Palette
  const handlePaletteChange = (layer: ActiveLayer, paletteId: string) => {
    const pal = COLOR_PALETTES.find(p => p.id === paletteId);
    if (pal) {
      onUpdateLayer({ ...layer, paletteId: pal.id, paletteColors: pal.colors });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 select-none bg-[#08090C] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            ACTIVE LAYER STACK
          </span>
          <span className="text-[9px] font-mono font-bold bg-blue-600/20 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/30">
            {layers.length} Layers
          </span>
        </div>

        {layers.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {layers.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[#1A1C23] rounded-lg bg-[#0c0e14]">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">No Active Layers Enabled</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Use Drill-Down or Catalog view to add weather parameters to your map.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {layers.map((layer, index) => {
            const isExpanded = expandedLayerId === layer.instanceId;
            const isEditing = editingId === layer.instanceId;
            const VariableIcon = getVariableIcon(layer.variableId);

            return (
              <div
                key={layer.instanceId}
                className={`rounded-lg border transition shadow-sm overflow-hidden ${
                  layer.visible
                    ? 'bg-[#12141a]/80 border-[#1A1C23] hover:border-blue-500/40'
                    : 'bg-[#0a0b0f] border-[#161822] opacity-60'
                }`}
              >
                {/* Main Card Header */}
                <div className="p-2.5 flex items-center justify-between gap-2">
                  
                  {/* Left: Move Controls + Layer Title */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {/* Up / Down Order Buttons */}
                    <div className="flex flex-col space-y-0.5 shrink-0">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-slate-500 hover:text-blue-400 disabled:opacity-20 transition"
                        title="Move Up (Higher Z-Index)"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === layers.length - 1}
                        className="text-slate-500 hover:text-blue-400 disabled:opacity-20 transition"
                        title="Move Down (Lower Z-Index)"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Color Palette Preview Mini Indicator */}
                    <div className="w-2.5 h-7 rounded overflow-hidden flex flex-col shrink-0 border border-[#1A1C23]">
                      {layer.paletteColors.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex-1 w-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>

                    {/* Layer Variable Icon */}
                    <div className="p-1 rounded bg-[#181C2B] border border-[#23283B] text-blue-400 shrink-0">
                      <VariableIcon className="w-3.5 h-3.5" />
                    </div>

                    {/* Label & Details */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            value={editLabelText}
                            onChange={(e) => setEditLabelText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(layer)}
                            className="bg-[#08090C] text-xs text-white px-2 py-0.5 rounded border border-blue-500 focus:outline-none w-full"
                          />
                          <button
                            onClick={() => handleSaveRename(layer)}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-100 truncate">
                            {layer.customLabel || `${layer.sourceName} - ${layer.variableName}`}
                          </span>
                          <button
                            onClick={() => handleStartRename(layer)}
                            className="text-slate-600 hover:text-slate-300 transition"
                            title="Rename Layer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 mt-0.5">
                        <span>{layer.sourceName}</span>
                        <span>•</span>
                        <span className="text-blue-400 font-bold">{layer.levelName}</span>
                        <span>•</span>
                        <span>{layer.visualizationName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Icons */}
                  <div className="flex items-center space-x-1 shrink-0 text-slate-400">
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => handleToggleVisibility(layer)}
                      className={`p-1.5 rounded transition ${
                        layer.visible ? 'text-blue-400 hover:bg-blue-600/10' : 'text-slate-600 hover:text-slate-300'
                      }`}
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      onClick={() => handleToggleLock(layer)}
                      className={`p-1.5 rounded transition ${
                        layer.locked ? 'text-amber-400 hover:bg-amber-600/10' : 'text-slate-600 hover:text-slate-300'
                      }`}
                      title={layer.locked ? 'Unlock Layer' : 'Lock Layer Settings'}
                    >
                      {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Expand Inline Controls */}
                    <button
                      onClick={() => setExpandedLayerId(isExpanded ? null : layer.instanceId)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1f2430] transition"
                      title="Expand Layer Settings"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Inline Quick Sliders (Opacity & Blend Mode) */}
                <div className="px-2.5 py-1.5 bg-[#090b0e] border-t border-[#1a1d28] flex items-center justify-between text-[10px] gap-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-slate-500 font-mono text-[9px] w-10">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      disabled={layer.locked}
                      onChange={(e) => handleOpacityChange(layer, Number(e.target.value))}
                      className="flex-1 h-1 bg-[#1A1C23] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-slate-300 font-mono font-bold text-[9px] w-8 text-right">
                      {layer.opacity}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => onDuplicateLayer(layer)}
                      className="p-1 text-slate-500 hover:text-slate-200 transition"
                      title="Duplicate Layer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenSettingsModal(layer)}
                      className="p-1 text-slate-500 hover:text-blue-400 transition"
                      title="Advanced Layer Settings"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveLayer(layer.instanceId)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Remove Layer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expanded Advanced Controls */}
                {isExpanded && (
                  <div className="p-3 bg-[#06070a] border-t border-[#1a1d28] space-y-3 text-xs">
                    {/* Blend Mode Selection */}
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                        Blending Mode
                      </label>
                      <select
                        value={layer.blendMode}
                        disabled={layer.locked}
                        onChange={(e) => handleBlendModeChange(layer, e.target.value as BlendMode)}
                        className="w-full bg-[#12141A] text-slate-200 text-xs rounded border border-[#212530] p-1.5 focus:outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="multiply">Multiply (Darken)</option>
                        <option value="screen">Screen (Lighten)</option>
                        <option value="overlay">Overlay (High Contrast)</option>
                        <option value="color-dodge">Color Dodge (Vivid Highlights)</option>
                        <option value="hard-light">Hard Light</option>
                        <option value="difference">Difference</option>
                      </select>
                    </div>

                    {/* Color Palette Picker */}
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                        Color Palette Ramp
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {COLOR_PALETTES.map(p => (
                          <button
                            key={p.id}
                            disabled={layer.locked}
                            onClick={() => handlePaletteChange(layer, p.id)}
                            className={`p-1.5 rounded border text-left flex flex-col gap-1 transition ${
                              layer.paletteId === p.id
                                ? 'bg-blue-600/20 border-blue-500'
                                : 'bg-[#12141A] border-[#1A1C23] hover:border-slate-500'
                            }`}
                          >
                            <span className="text-[9px] font-bold text-slate-300 truncate">{p.name}</span>
                            <div className="h-1.5 w-full rounded flex overflow-hidden">
                              {p.colors.map((c, i) => (
                                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
