import React, { useState, useEffect, useRef } from 'react';
import { ActiveLayer, PresetWorkstation, WeatherVariable, DataSourceModel, CustomCompositeLayer } from '../../types';
import {
  DATA_SOURCES,
  WEATHER_VARIABLES,
  VERTICAL_LEVELS,
  PRESET_WORKSTATIONS,
  COLOR_PALETTES
} from '../../data/meteoCatalog';
import { CustomCompositeLayerModal } from './CustomCompositeLayerModal';
import {
  Search,
  X,
  Star,
  Check,
  MoreVertical,
  Thermometer,
  Wind,
  CloudRain,
  CloudSnow,
  Gauge,
  Droplets,
  Cloud,
  Eye,
  Zap,
  Waves,
  Satellite,
  Radar,
  Radio,
  Calendar,
  Layers,
  ChevronDown,
  Globe,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface LayerManagementPanelProps {
  activeLayers: ActiveLayer[];
  onAddLayer: (layer: ActiveLayer) => void;
  onUpdateLayer: (layer: ActiveLayer) => void;
  onRemoveLayer: (instanceId: string) => void;
  onDuplicateLayer: (layer: ActiveLayer) => void;
  onReorderLayers: (layers: ActiveLayer[]) => void;
  onClearAllLayers: () => void;
  onClosePanel: () => void;
}

type MainCategory = 'models' | 'observations' | 'climate' | 'favorites' | 'composite';

export const LayerManagementPanel: React.FC<LayerManagementPanelProps> = ({
  activeLayers,
  onAddLayer,
  onUpdateLayer,
  onRemoveLayer,
  onDuplicateLayer,
  onReorderLayers,
  onClearAllLayers,
  onClosePanel
}) => {
  // 1. Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Active Main Category
  const [activeCategory, setActiveCategory] = useState<MainCategory>('models');

  // 3. Selected Model ID
  const [selectedModelId, setSelectedModelId] = useState<string>('gfs_025');

  // Sync selectedModelId whenever activeLayers change from AI or user
  useEffect(() => {
    if (activeLayers.length > 0) {
      const topLayer = activeLayers[0];
      if (topLayer.sourceId) {
        setSelectedModelId(topLayer.sourceId);
      }
    }
  }, [activeLayers]);

  // 4. Sub-category Filter
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');

  // 5. Favorite Starred Variable IDs
  const [starredVarIds, setStarredVarIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alpha_meteo_starred_vars');
      return saved ? JSON.parse(saved) : ['temp_2m', 'mslp', 'wind_10m', 'reflectivity_sim', 'radar_composite', 'sat_geo_ir'];
    } catch {
      return ['temp_2m', 'mslp', 'wind_10m', 'reflectivity_sim', 'radar_composite', 'sat_geo_ir'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('alpha_meteo_starred_vars', JSON.stringify(starredVarIds));
    } catch (e) {
      console.error("Failed to save starred variables", e);
    }
  }, [starredVarIds]);

  // 6. Custom Composite Layers
  const DEFAULT_CUSTOM_COMPOSITES: CustomCompositeLayer[] = [
    {
      id: 'composite_convection_storm',
      name: 'Convection & Thunderstorm (Lightning + Clouds)',
      description: 'EUMETSAT MTG-LI lightning feed overlaid on NASA GIBS satellite cloud cover',
      createdAt: Date.now() - 3600000,
      subLayers: [
        {
          id: 'sub_mtg_1',
          sourceId: 'eumetsat_mtg_li',
          sourceName: 'EUMETSAT MTG-I1',
          variableId: 'mtg_li_lightning',
          variableName: 'Live Lightning (MTG-LI)',
          variableUnit: 'flashes',
          levelId: 'surface',
          levelName: 'Surface',
          opacity: 100,
          blendMode: 'normal'
        },
        {
          id: 'sub_nasa_2',
          sourceId: 'nasa_gibs_cloud',
          sourceName: 'NASA GIBS Satellite',
          variableId: 'nasa_cloud_cover',
          variableName: 'Satellite Cloud Cover (NASA GIBS)',
          variableUnit: '%',
          levelId: 'toa',
          levelName: 'Top of Atmosphere',
          opacity: 85,
          blendMode: 'normal'
        }
      ]
    },
    {
      id: 'composite_severe_system',
      name: 'Multi-Layer Storm System (Lightning + Clouds + Wind)',
      description: 'Combined lightning activity, satellite cloud cover, and 10m surface wind vectors',
      createdAt: Date.now() - 1800000,
      subLayers: [
        {
          id: 'sub_mtg_3',
          sourceId: 'eumetsat_mtg_li',
          sourceName: 'EUMETSAT MTG-I1',
          variableId: 'mtg_li_lightning',
          variableName: 'Live Lightning (MTG-LI)',
          variableUnit: 'flashes',
          levelId: 'surface',
          levelName: 'Surface',
          opacity: 100,
          blendMode: 'normal'
        },
        {
          id: 'sub_nasa_4',
          sourceId: 'nasa_gibs_cloud',
          sourceName: 'NASA GIBS Satellite',
          variableId: 'nasa_cloud_cover',
          variableName: 'Satellite Cloud Cover (NASA GIBS)',
          variableUnit: '%',
          levelId: 'toa',
          levelName: 'Top of Atmosphere',
          opacity: 80,
          blendMode: 'normal'
        },
        {
          id: 'sub_wind_5',
          sourceId: 'gfs_025',
          sourceName: 'GFS 0.25°',
          variableId: 'wind_10m',
          variableName: 'Wind Speed & Vectors (10m)',
          variableUnit: 'kt',
          levelId: '10m',
          levelName: '10 meters',
          opacity: 85,
          blendMode: 'normal'
        }
      ]
    }
  ];

  const [customComposites, setCustomComposites] = useState<CustomCompositeLayer[]>(() => {
    try {
      const saved = localStorage.getItem('alpha_meteo_custom_composite_layers');
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_COMPOSITES;
    } catch {
      return DEFAULT_CUSTOM_COMPOSITES;
    }
  });

  const [isCompositeModalOpen, setIsCompositeModalOpen] = useState<boolean>(false);
  const [editingComposite, setEditingComposite] = useState<CustomCompositeLayer | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('alpha_meteo_custom_composite_layers', JSON.stringify(customComposites));
    } catch (e) {
      console.error("Failed to save custom composite layers", e);
    }
  }, [customComposites]);

  // Activate all sub-layers in a composite layer according to their stack order
  const handleActivateComposite = (composite: CustomCompositeLayer) => {
    const newLayers: ActiveLayer[] = composite.subLayers.map((sub, idx) => {
      const variable = WEATHER_VARIABLES.find(v => v.id === sub.variableId);
      const source = DATA_SOURCES.find(s => s.id === sub.sourceId) || DATA_SOURCES[0];
      const level = VERTICAL_LEVELS.find(l => l.id === sub.levelId) || VERTICAL_LEVELS[0];
      const palette = COLOR_PALETTES.find(p => p.id === (sub.paletteId || variable?.defaultPaletteId)) || COLOR_PALETTES[0];

      return {
        instanceId: `comp_${composite.id}_${sub.variableId}_${Date.now()}_${idx}`,
        categoryId: source.categoryId || 'composite',
        sourceId: sub.sourceId,
        sourceName: sub.sourceName || source.shortName || source.name,
        variableId: sub.variableId,
        variableName: sub.variableName || variable?.name || sub.variableId,
        variableUnit: sub.variableUnit || variable?.unit || '',
        levelId: level.id,
        levelName: level.name,
        visualizationId: sub.visualizationId || variable?.defaultVisualizationId || 'smooth_gradient',
        visualizationName: 'Smooth Gradient',
        paletteId: palette.id,
        paletteColors: palette.colors,
        opacity: sub.opacity ?? 85,
        visible: true,
        locked: false,
        zIndex: composite.subLayers.length - idx,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        invertPalette: false,
        blendMode: sub.blendMode || 'normal',
        timelineSync: 'main',
        customLabel: `${composite.name}: ${sub.variableName}`,
        minVal: variable?.min ?? -50,
        maxVal: variable?.max ?? 50,
        dateCreated: Date.now() + idx
      };
    });

    onClearAllLayers();
    onReorderLayers(newLayers);
  };

  const isCompositeActive = (composite: CustomCompositeLayer) => {
    if (activeLayers.length === 0 || composite.subLayers.length === 0) return false;
    return composite.subLayers.every(sub =>
      activeLayers.some(al => al.variableId === sub.variableId || al.sourceId === sub.sourceId)
    );
  };

  const handleSaveComposite = (composite: CustomCompositeLayer, andActivate?: boolean) => {
    setCustomComposites(prev => {
      const exists = prev.some(c => c.id === composite.id);
      if (exists) {
        return prev.map(c => c.id === composite.id ? composite : c);
      }
      return [composite, ...prev];
    });

    if (andActivate) {
      handleActivateComposite(composite);
    }
  };

  const handleDeleteComposite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomComposites(prev => prev.filter(c => c.id !== id));
  };

  // 7. Level Selection Modal State
  const [levelModalTarget, setLevelModalTarget] = useState<{
    source: DataSourceModel;
    variable: WeatherVariable;
  } | null>(null);

  const [selectedLevelForModal, setSelectedLevelForModal] = useState<string>('2m');

  // 8. Category Custom Dropdown Menu State & Ref
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState<boolean>(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryOptions = [
    { id: 'models' as MainCategory, label: 'NWP', icon: Globe, iconColor: 'text-blue-400' },
    { id: 'observations' as MainCategory, label: 'LIVE', icon: Radio, iconColor: 'text-emerald-400' },
    { id: 'climate' as MainCategory, label: 'CLIMATE', icon: Calendar, iconColor: 'text-purple-400' },
    { id: 'composite' as MainCategory, label: `COMPOSITE (${customComposites.length})`, icon: Sparkles, iconColor: 'text-cyan-400' },
    { id: 'favorites' as MainCategory, label: `STARS (${starredVarIds.length})`, icon: Star, iconColor: 'text-amber-400 fill-amber-400' }
  ];

  // Toggle Favorite Star
  const toggleStarVariable = (varId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredVarIds(prev =>
      prev.includes(varId) ? prev.filter(id => id !== varId) : [...prev, varId]
    );
  };

  // Check if Layer is Active
  const getActiveLayerInstance = (sourceId: string, varId: string) => {
    return activeLayers.find(l => l.sourceId === sourceId && l.variableId === varId);
  };

  // Toggle Layer Active State (Single active layer)
  const handleToggleLayer = (source: DataSourceModel, variable: WeatherVariable, customLevelId?: string) => {
    const existing = getActiveLayerInstance(source.id, variable.id);
    if (existing) {
      onRemoveLayer(existing.instanceId);
    } else {
      onClearAllLayers(); // Clear previous active layers so only 1 layer is active at a time
      const targetLevel = VERTICAL_LEVELS.find(l => l.id === (customLevelId || variable.defaultLevelId || '2m')) || VERTICAL_LEVELS[0];
      const palette = COLOR_PALETTES.find(p => p.id === variable.defaultPaletteId) || COLOR_PALETTES[0];

      const newLayer: ActiveLayer = {
        instanceId: `layer_${source.id}_${variable.id}_${Date.now()}`,
        categoryId: source.categoryId || 'models',
        sourceId: source.id,
        sourceName: source.shortName || source.name,
        variableId: variable.id,
        variableName: variable.name,
        variableUnit: variable.unit,
        levelId: targetLevel.id,
        levelName: targetLevel.name,
        visualizationId: variable.defaultVisualizationId || 'smooth_gradient',
        visualizationName: 'Smooth Gradient',
        paletteId: palette.id,
        paletteColors: palette.colors,
        opacity: 85,
        visible: true,
        locked: false,
        zIndex: 1,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        invertPalette: false,
        blendMode: 'normal',
        timelineSync: 'main',
        customLabel: `${source.shortName} - ${variable.name}`,
        minVal: variable.min,
        maxVal: variable.max,
        dateCreated: Date.now()
      };

      onAddLayer(newLayer);
    }
  };

  // Load Preset Workstation
  const handleLoadPreset = (preset: PresetWorkstation) => {
    onClearAllLayers();
    preset.layers.forEach((layerPartial, idx) => {
      const newLayer: ActiveLayer = {
        instanceId: `preset_${preset.id}_${idx}_${Date.now()}`,
        categoryId: layerPartial.categoryId || 'models',
        sourceId: layerPartial.sourceId || 'gfs_025',
        sourceName: layerPartial.sourceName || 'GFS 0.25°',
        variableId: layerPartial.variableId || 'temp_2m',
        variableName: layerPartial.variableName || '2m Temperature',
        variableUnit: layerPartial.variableUnit || '°C',
        levelId: layerPartial.levelId || '2m',
        levelName: layerPartial.levelName || '2 meters',
        visualizationId: layerPartial.visualizationId || 'smooth_gradient',
        visualizationName: 'Smooth Gradient',
        paletteId: layerPartial.paletteId || 'thermal',
        paletteColors: layerPartial.paletteColors || ["#3b0764", "#1d4ed8", "#0284c7", "#059669", "#eab308", "#dc2626", "#7f1d1d"],
        opacity: layerPartial.opacity || 90,
        visible: true,
        locked: false,
        zIndex: idx + 1,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        invertPalette: false,
        blendMode: 'normal',
        timelineSync: 'main',
        customLabel: `${preset.name} - ${layerPartial.variableName || 'Layer'}`,
        minVal: layerPartial.minVal || -50,
        maxVal: layerPartial.maxVal || 50,
        dateCreated: Date.now() + idx
      };

      onAddLayer(newLayer);
    });

    setActiveCategory('models');
  };

  // Icon Mapping
  const getIcon = (variableId: string) => {
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

  const currentModel = DATA_SOURCES.find(s => s.id === selectedModelId) || DATA_SOURCES[0];
  const nwpModels = DATA_SOURCES.filter(s => s.categoryId === 'models');
  // Per user instruction: LIVE section must contain strictly and exclusively the EUMETSAT MTG-LI lightning parameter
  const obsSources = DATA_SOURCES.filter(s => s.id === 'eumetsat_mtg_li' || s.categoryId === 'live_obs');
  const climateSources = DATA_SOURCES.filter(s => ['climate', 'seasonal', 'historical'].includes(s.categoryId));

  // Search Results Filter
  const searchResults = searchQuery.trim() ? WEATHER_VARIABLES.flatMap(v => {
    const matchingSources = DATA_SOURCES.filter(s =>
      s.supportedVariableIds.includes(v.id) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       s.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       v.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return matchingSources.map(s => ({ source: s, variable: v }));
  }) : [];

  // Unified Layer Parameter Card Component
  const renderLayerCard = (source: DataSourceModel, variable: WeatherVariable, keySuffix?: string | number) => {
    const isActive = !!getActiveLayerInstance(source.id, variable.id);
    const isStarred = starredVarIds.includes(variable.id);
    const IconComp = getIcon(variable.id);

    return (
      <div
        key={`${source.id}_${variable.id}_${keySuffix ?? ''}`}
        onClick={() => handleToggleLayer(source, variable)}
        className={`group relative p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
          isActive
            ? 'bg-gradient-to-r from-blue-950/40 via-[#13192E] to-[#111422] border-blue-500/70 shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/30'
            : 'bg-[#111422] border-[#1D2235] hover:border-slate-600 hover:bg-[#15192B]'
        }`}
      >
        {/* Active Indicator Bar */}
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        )}

        <div className="flex items-center space-x-3 min-w-0 flex-1 pl-1">
          <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
            isActive
              ? 'bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-sm'
              : 'bg-[#181D2E] text-slate-400 border-[#252C42] group-hover:text-slate-200'
          }`}>
            <IconComp className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold truncate text-slate-100 group-hover:text-white transition">
                {variable.name}
              </span>
              {isActive && (
                <span className="flex items-center space-x-1 text-[9px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>ON</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
              <span className="bg-[#191F33] text-slate-300 font-mono px-1.5 py-0.5 rounded border border-[#272F48] shrink-0 font-medium">
                {source.shortName || source.name}
              </span>
              <span className="bg-[#191F33] text-slate-300 font-mono px-1.5 py-0.5 rounded border border-[#272F48] shrink-0 font-medium">
                {variable.unit}
              </span>
              {variable.defaultLevelId && (
                <span className="bg-[#191F33] text-slate-400 font-mono px-1.5 py-0.5 rounded border border-[#272F48] shrink-0">
                  {variable.defaultLevelId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => toggleStarVariable(variable.id, e)}
            className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-[#1D2338] rounded-md transition"
            title={isStarred ? "Remove Star" : "Star Parameter"}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLevelModalTarget({ source, variable });
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1D2338] rounded-md transition"
            title="Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10] text-slate-200 select-none overflow-hidden relative font-sans" id="layer-management-panel">
      
      {/* TOP HEADER: INTEGRATED SEARCH & CATEGORY SELECTOR */}
      <div className="p-3 bg-[#0E1017] border-b border-[#1A1E2C] space-y-2 shrink-0">
        
        {/* Top Row: Search Input + Compact Selection Dropdown Side-by-Side */}
        <div className="flex items-center space-x-2">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameters..."
              className="w-full bg-[#121520] hover:bg-[#161A28] focus:bg-[#0E1017] text-slate-100 text-xs rounded-lg border border-[#212638] focus:border-blue-500/80 pl-8 pr-7 py-2 focus:outline-none transition placeholder-slate-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Custom Category Dropdown with Icons for Every Option when Open */}
          <div className="relative shrink-0" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen(prev => !prev)}
              className="flex items-center space-x-1.5 bg-[#141724] hover:bg-[#191D2D] text-slate-100 font-bold text-xs px-2.5 py-2 rounded-lg border border-[#23283B] focus:outline-none focus:border-blue-500 cursor-pointer transition"
            >
              {activeCategory === 'models' && <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              {activeCategory === 'observations' && <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {activeCategory === 'climate' && <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              {activeCategory === 'composite' && <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              {activeCategory === 'favorites' && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}

              <span className="truncate max-w-[80px]">
                {categoryOptions.find(opt => opt.id === activeCategory)?.label}
              </span>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Items with Icons */}
            {isCategoryMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#121522] border border-[#23283B] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {categoryOptions.map(option => {
                  const IconComp = option.icon;
                  const isSelected = activeCategory === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(option.id);
                        setSearchQuery('');
                        setSubCategoryFilter('all');
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-blue-600/20 text-white'
                          : 'text-slate-300 hover:bg-[#191D2E] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <IconComp className={`w-4 h-4 shrink-0 ${option.iconColor}`} />
                        <span className="truncate">{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            onClick={onClosePanel}
            className="md:hidden p-2 rounded-lg bg-[#141724] hover:bg-[#191D2D] text-slate-400 hover:text-white border border-[#23283B] transition shrink-0"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button: Create Custom Composite Layer */}
        <button
          type="button"
          onClick={() => {
            setEditingComposite(null);
            setIsCompositeModalOpen(true);
          }}
          className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 hover:from-blue-600/35 hover:to-cyan-600/35 text-cyan-300 border border-cyan-500/35 hover:border-cyan-400 py-1.5 px-3 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          title="Build a custom composite layer by combining multiple parameters with stack ordering"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Create New Composite Layer</span>
        </button>

      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">

        {/* A: SEARCH RESULTS MODE */}
        {searchQuery.trim() !== '' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-0.5">
              <span>Matching Layers ({searchResults.length})</span>
              <button onClick={() => setSearchQuery('')} className="text-blue-400 hover:underline">
                Clear
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No matching layer parameters found.
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(({ source, variable }, idx) => renderLayerCard(source, variable, idx))}
              </div>
            )}
          </div>
        )}

        {/* B: NWP - NUMERICAL WEATHER MODELS */}
        {!searchQuery && activeCategory === 'models' && (
          <div className="space-y-3">
            {/* Model Switcher Dropdown */}
            <div className="bg-[#10131D] p-3 rounded-xl border border-[#1C2030] space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Select Model
              </label>
              <div className="relative">
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-[#161926] text-xs font-bold text-blue-300 p-2 rounded-lg border border-[#242A3E] appearance-none focus:outline-none focus:border-blue-500 pr-8"
                >
                  {nwpModels.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.spatialResolution})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Model Parameters */}
            <div className="space-y-2">
              {WEATHER_VARIABLES
                .filter(v => currentModel.supportedVariableIds.includes(v.id))
                .map(variable => renderLayerCard(currentModel, variable))}
            </div>
          </div>
        )}

        {/* C: LIVE - OBSERVATIONS, RADAR & SATELLITE */}
        {!searchQuery && activeCategory === 'observations' && (
          <div className="space-y-3">
            {obsSources.map(source => (
              <div key={source.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200">{source.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    {source.badge || 'Live'}
                  </span>
                </div>
                <div className="space-y-2">
                  {WEATHER_VARIABLES
                    .filter(v => source.supportedVariableIds.includes(v.id))
                    .map(variable => renderLayerCard(source, variable))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* D: CLIMATE FORECASTS */}
        {!searchQuery && activeCategory === 'climate' && (
          <div className="space-y-3">
            {climateSources.map(source => (
              <div key={source.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200">{source.name}</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                    Seasonal
                  </span>
                </div>
                <div className="space-y-2">
                  {WEATHER_VARIABLES
                    .filter(v => source.supportedVariableIds.includes(v.id))
                    .map(variable => renderLayerCard(source, variable))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* E: STARS / FAVORITES */}
        {!searchQuery && activeCategory === 'favorites' && (
          <div>
            {starredVarIds.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No starred parameters yet. Click the star icon on any layer to save it here.
              </div>
            ) : (
              <div className="space-y-2">
                {WEATHER_VARIABLES
                  .filter(v => starredVarIds.includes(v.id))
                  .map(variable => renderLayerCard(currentModel, variable))}
              </div>
            )}
          </div>
        )}

        {/* F: COMPOSITE - CUSTOM COMPOSITE LAYERS */}
        {!searchQuery && activeCategory === 'composite' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>My Composite Layers ({customComposites.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Combine multiple layers with custom render priority
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingComposite(null);
                  setIsCompositeModalOpen(true);
                }}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Layer</span>
              </button>
            </div>

            {customComposites.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-[#2b2b2b] rounded-xl bg-[#141414] text-slate-400 text-xs">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-300">No custom composite layers yet</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Click "New Layer" to combine lightning, satellite clouds, wind, and more with custom stack ordering.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {customComposites.map((composite) => {
                  const isActive = isCompositeActive(composite);

                  return (
                    <div
                      key={composite.id}
                      onClick={() => handleActivateComposite(composite)}
                      className={`group relative p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-950/40 via-[#13192E] to-[#111422] border-blue-500/70 shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/30'
                          : 'bg-[#111422] border-[#1D2235] hover:border-slate-600 hover:bg-[#15192B]'
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      )}

                      <div className="flex items-center space-x-3 min-w-0 flex-1 pl-1">
                        <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-sm'
                            : 'bg-[#181D2E] text-slate-400 border-[#252C42] group-hover:text-slate-200'
                        }`}>
                          <Layers className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold truncate text-slate-100 group-hover:text-white transition">
                              {composite.name}
                            </span>
                            {isActive && (
                              <span className="flex items-center space-x-1 text-[9px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span>ON</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
                            <span className="bg-[#191F33] text-cyan-400 font-mono px-1.5 py-0.5 rounded border border-[#272F48] shrink-0 font-medium">
                              COMPOSITE
                            </span>
                            <span className="bg-[#191F33] text-slate-300 font-mono px-1.5 py-0.5 rounded border border-[#272F48] shrink-0 font-medium">
                              {composite.subLayers.length} Layers
                            </span>
                            {composite.subLayers.length > 0 && (
                              <span className="bg-[#191F33] text-slate-400 font-mono px-1.5 py-0.5 rounded border border-[#272F48] shrink-0 truncate max-w-[130px]">
                                {composite.subLayers[0].variableName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side Action Buttons */}
                      <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingComposite(composite);
                            setIsCompositeModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1D2338] rounded-md transition"
                          title="Edit composite layer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteComposite(composite.id, e)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-[#1D2338] rounded-md transition"
                          title="Delete composite layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CUSTOM COMPOSITE LAYER BUILDER MODAL */}
      <CustomCompositeLayerModal
        isOpen={isCompositeModalOpen}
        onClose={() => {
          setIsCompositeModalOpen(false);
          setEditingComposite(null);
        }}
        onSave={handleSaveComposite}
        initialComposite={editingComposite}
      />

      {/* LEVEL PICKER MODAL */}
      {levelModalTarget && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#10131D] border border-[#23283B] rounded-xl p-4 w-full max-w-sm space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1C2030] pb-2">
              <div>
                <h3 className="text-xs font-bold text-white">
                  {levelModalTarget.variable.name}
                </h3>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {levelModalTarget.source.name}
                </span>
              </div>
              <button
                onClick={() => setLevelModalTarget(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Isobaric / Elevation Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {VERTICAL_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevelForModal(level.id)}
                    className={`p-2 rounded border text-left text-xs font-bold transition ${
                      selectedLevelForModal === level.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#141724] border-[#1E2335] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="block">{level.shortLabel}</span>
                    <span className="text-[8px] font-mono text-slate-500 block truncate">{level.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleToggleLayer(levelModalTarget.source, levelModalTarget.variable, selectedLevelForModal);
                setLevelModalTarget(null);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
            >
              Apply & Add Layer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
