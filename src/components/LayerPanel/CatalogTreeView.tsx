import React, { useState } from 'react';
import {
  CATEGORIES,
  DATA_SOURCES,
  WEATHER_VARIABLES,
  VERTICAL_LEVELS,
  VISUALIZATION_OPTIONS,
  COLOR_PALETTES
} from '../../data/meteoCatalog';
import { ActiveLayer } from '../../types';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Plus,
  Check,
  Eye,
  Radio,
  Radar,
  Satellite,
  Zap,
  Waves,
  Wind,
  Cpu,
  Map,
  Activity,
  Calendar,
  Archive,
  Star
} from 'lucide-react';

interface CatalogTreeViewProps {
  activeLayers: ActiveLayer[];
  onToggleLayerInCatalog: (newLayer: ActiveLayer) => void;
  onRemoveLayerInstance: (instanceId: string) => void;
}

export const CatalogTreeView: React.FC<CatalogTreeViewProps> = ({
  activeLayers,
  onToggleLayerInCatalog,
  onRemoveLayerInstance
}) => {
  // Collapsed state tracking
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    models: true,
    radar: true,
    satellite: true
  });
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({
    ecmwf_ifs: true,
    gfs_025: true,
    radar_composite: true
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleSource = (srcId: string) => {
    setExpandedSources(prev => ({ ...prev, [srcId]: !prev[srcId] }));
  };

  // Helper to check if a specific source + variable is currently active
  const isVariableActive = (sourceId: string, variableId: string) => {
    return activeLayers.find(l => l.sourceId === sourceId && l.variableId === variableId);
  };

  const handleToggleVariableInCatalog = (sourceId: string, variableId: string) => {
    const existing = isVariableActive(sourceId, variableId);
    if (existing) {
      onRemoveLayerInstance(existing.instanceId);
    } else {
      const source = DATA_SOURCES.find(s => s.id === sourceId);
      const category = CATEGORIES.find(c => c.id === source?.categoryId) || CATEGORIES[0];
      const variable = WEATHER_VARIABLES.find(v => v.id === variableId);
      if (!source || !variable) return;

      const defaultLvl = VERTICAL_LEVELS.find(l => l.id === variable.defaultLevelId) || VERTICAL_LEVELS[0];
      const defaultViz = VISUALIZATION_OPTIONS.find(v => v.id === variable.defaultVisualizationId) || VISUALIZATION_OPTIONS[0];
      const defaultPal = COLOR_PALETTES.find(p => p.id === variable.defaultPaletteId) || COLOR_PALETTES[0];

      const newLayer: ActiveLayer = {
        instanceId: `layer_${source.id}_${variable.id}_${Date.now()}`,
        categoryId: category.id,
        sourceId: source.id,
        sourceName: source.shortName,
        variableId: variable.id,
        variableName: variable.name,
        variableUnit: variable.unit,
        levelId: defaultLvl.id,
        levelName: defaultLvl.shortLabel,
        visualizationId: defaultViz.id,
        visualizationName: defaultViz.name,
        paletteId: defaultPal.id,
        paletteColors: defaultPal.colors,
        opacity: 90,
        visible: true,
        locked: false,
        zIndex: Date.now(),
        brightness: 100,
        contrast: 100,
        saturation: 100,
        invertPalette: false,
        blendMode: 'normal',
        timelineSync: 'main',
        customLabel: `${source.shortName} ${variable.shortName}`,
        minVal: variable.min,
        maxVal: variable.max,
        dateCreated: Date.now()
      };

      onToggleLayerInCatalog(newLayer);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 select-none bg-[#08090C] text-slate-200">
      <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
        GIS Data Catalog Matrix
      </div>

      {CATEGORIES.map(category => {
        const isCatExpanded = !!expandedCategories[category.id];
        const categorySources = DATA_SOURCES.filter(s => s.categoryId === category.id);

        if (categorySources.length === 0) return null;

        return (
          <div key={category.id} className="rounded-lg border border-[#1A1C23] bg-[#0d0f15]/80 overflow-hidden">
            {/* Category Node */}
            <div
              onClick={() => toggleCategory(category.id)}
              className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-[#161a24] transition"
            >
              <div className="flex items-center space-x-2">
                {isCatExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="text-xs font-bold text-slate-100">{category.name}</span>
              </div>

              <span className="text-[9px] font-mono text-slate-500 bg-[#12141A] px-1.5 py-0.2 rounded border border-[#1A1C23]">
                {categorySources.length} Sources
              </span>
            </div>

            {/* Source Level */}
            {isCatExpanded && (
              <div className="p-1 border-t border-[#1A1C23]/60 space-y-1 bg-[#090b0e]">
                {categorySources.map(source => {
                  const isSrcExpanded = !!expandedSources[source.id];
                  const sourceVariables = WEATHER_VARIABLES.filter(v =>
                    source.supportedVariableIds.includes(v.id)
                  );

                  return (
                    <div key={source.id} className="rounded border border-[#1A1C23]/50 bg-[#12141A]/40 overflow-hidden">
                      {/* Source Node Header */}
                      <div
                        onClick={() => toggleSource(source.id)}
                        className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-[#161a24] transition"
                      >
                        <div className="flex items-center space-x-2">
                          {isSrcExpanded ? (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-600" />
                          )}
                          <span className="text-xs font-bold text-slate-300">{source.name}</span>
                        </div>

                        <span className="text-[8px] font-mono text-slate-500">
                          {source.spatialResolution}
                        </span>
                      </div>

                      {/* Variables Leaf Nodes */}
                      {isSrcExpanded && (
                        <div className="p-1 border-t border-[#1A1C23]/30 space-y-1 bg-[#06070a]">
                          {sourceVariables.map(variable => {
                            const activeInst = isVariableActive(source.id, variable.id);
                            return (
                              <div
                                key={variable.id}
                                onClick={() => handleToggleVariableInCatalog(source.id, variable.id)}
                                className={`px-2.5 py-1.5 rounded flex items-center justify-between cursor-pointer transition border text-xs ${
                                  activeInst
                                    ? 'bg-blue-600/20 border-blue-500/80 text-white font-bold'
                                    : 'bg-transparent border-transparent hover:bg-[#12141a] text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                    activeInst ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-600'
                                  }`}>
                                    {activeInst && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span>{variable.name}</span>
                                </div>

                                <span className="text-[9px] font-mono text-slate-500">
                                  {variable.unit}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
