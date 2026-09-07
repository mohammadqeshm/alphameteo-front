import React, { useState } from 'react';
import { PRESET_WORKSTATIONS, DATA_SOURCES, WEATHER_VARIABLES } from '../../data/meteoCatalog';
import { PresetWorkstation, ActiveLayer } from '../../types';
import {
  Star,
  Plus,
  Zap,
  Plane,
  Waves,
  Bookmark,
  Sparkles,
  Check,
  FolderPlus,
  Play
} from 'lucide-react';

interface FavoritesPresetsPanelProps {
  onLoadPreset: (preset: PresetWorkstation) => void;
  activeLayers: ActiveLayer[];
  onSaveCurrentAsPreset: (presetName: string, description: string) => void;
}

const renderPresetIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
    case 'Plane': return <Plane className="w-4 h-4 text-sky-400" />;
    case 'Waves': return <Waves className="w-4 h-4 text-cyan-400" />;
    default: return <Sparkles className="w-4 h-4 text-blue-400" />;
  }
};

export const FavoritesPresetsPanel: React.FC<FavoritesPresetsPanelProps> = ({
  onLoadPreset,
  activeLayers,
  onSaveCurrentAsPreset
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [customPresets, setCustomPresets] = useState<PresetWorkstation[]>([]);

  const handleSavePreset = () => {
    if (!newPresetName.trim() || activeLayers.length === 0) return;

    const newPreset: PresetWorkstation = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || `${activeLayers.length} Custom Active Meteorological Layers`,
      category: 'Custom Forecaster View',
      iconName: 'Sparkles',
      layers: activeLayers.map(l => ({ ...l }))
    };

    setCustomPresets(prev => [...prev, newPreset]);
    onSaveCurrentAsPreset(newPresetName.trim(), newPresetDesc.trim());
    setNewPresetName('');
    setNewPresetDesc('');
    setShowSaveModal(false);
  };

  const favoriteSources = DATA_SOURCES.filter(s => s.isFavorite);
  const favoriteVariables = WEATHER_VARIABLES.filter(v => v.isFavorite);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 select-none bg-[#08090C] text-slate-200">
      
      {/* 1. OPERATIONAL WORKSTATION PRESETS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            Operational Workstation Presets
          </div>

          <button
            onClick={() => setShowSaveModal(true)}
            disabled={activeLayers.length === 0}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 disabled:opacity-30 transition flex items-center space-x-1"
          >
            <FolderPlus className="w-3 h-3" />
            <span>Save Current</span>
          </button>
        </div>

        {/* Save Custom Preset Form */}
        {showSaveModal && (
          <div className="p-3 mb-3 bg-[#0d0f15] border border-blue-500/50 rounded-lg space-y-2">
            <span className="text-xs font-bold text-white block">Save Active Layer Stack as Preset</span>
            <input
              type="text"
              placeholder="Preset Title (e.g. Tehran Storm Briefing)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full bg-[#12141A] text-xs text-white p-2 rounded border border-[#212530] focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Brief description..."
              value={newPresetDesc}
              onChange={(e) => setNewPresetDesc(e.target.value)}
              className="w-full bg-[#12141A] text-xs text-white p-2 rounded border border-[#212530] focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Preset Cards */}
        <div className="space-y-2">
          {[...PRESET_WORKSTATIONS, ...customPresets].map(preset => (
            <div
              key={preset.id}
              className="p-3 rounded-lg border border-[#1A1C23] bg-[#12141a]/60 hover:bg-[#161a24] hover:border-blue-500/50 cursor-pointer transition group shadow-sm"
              onClick={() => onLoadPreset(preset)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded bg-[#1c202c] border border-[#262b3a] group-hover:bg-blue-600 transition">
                    {renderPresetIcon(preset.iconName)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                      {preset.name}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-500">
                      {preset.category} • {preset.layers.length} Multi-Layers
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white transition flex items-center space-x-1">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Load</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FAVORITE MODELS */}
      <div>
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
          Favorite Forecast Models
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {favoriteSources.map(src => (
            <div
              key={src.id}
              className="p-2 rounded border border-[#1A1C23] bg-[#12141A]/50 hover:border-blue-500/40 transition flex items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-200">{src.shortName}</span>
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. FAVORITE VARIABLES */}
      <div>
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
          Favorite Weather Variables
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {favoriteVariables.map(v => (
            <div
              key={v.id}
              className="p-2 rounded border border-[#1A1C23] bg-[#12141A]/50 hover:border-blue-500/40 transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-200">{v.name}</span>
                <span className="text-[9px] text-slate-500 block">{v.category} ({v.unit})</span>
              </div>
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
