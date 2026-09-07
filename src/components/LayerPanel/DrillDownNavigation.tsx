import React, { useState } from 'react';
import {
  CATEGORIES,
  DATA_SOURCES,
  WEATHER_VARIABLES,
  VERTICAL_LEVELS,
  VISUALIZATION_OPTIONS,
  COLOR_PALETTES
} from '../../data/meteoCatalog';
import {
  CategoryInfo,
  DataSourceModel,
  WeatherVariable,
  VerticalLevel,
  VisualizationOption,
  ColorPalette,
  ActiveLayer,
  VisualizationTypeEnum
} from '../../types';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Star,
  Info,
  Layers,
  Cpu,
  Radio,
  Radar,
  Satellite,
  Zap,
  Waves,
  Wind,
  Activity,
  Calendar,
  Archive,
  Map,
  Thermometer,
  Droplet,
  Droplets,
  Gauge,
  CloudRain,
  CloudSnow,
  Cloud,
  Eye,
  CloudFog,
  ShieldAlert,
  TrendingUp,
  RotateCw,
  ThermometerSnowflake,
  RefreshCw,
  Navigation,
  Compass,
  Box,
  Sliders,
  Grid,
  Square,
  Flame,
  Plane,
  SlidersHorizontal,
  Palette
} from 'lucide-react';

interface DrillDownNavigationProps {
  onAddLayer: (layer: ActiveLayer) => void;
  searchQuery: string;
}

// Icon helper mapping string iconName to Lucide component
const renderCategoryIcon = (iconName: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'Cpu': return <Cpu className={className} />;
    case 'Radio': return <Radio className={className} />;
    case 'Radar': return <Radar className={className} />;
    case 'Satellite': return <Satellite className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Waves': return <Waves className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Archive': return <Archive className={className} />;
    case 'Map': return <Map className={className} />;
    case 'Star': return <Star className={className} />;
    default: return <Layers className={className} />;
  }
};

const renderVariableIcon = (iconName: string, className: string = 'w-3.5 h-3.5') => {
  switch (iconName) {
    case 'Thermometer': return <Thermometer className={className} />;
    case 'Droplet': return <Droplet className={className} />;
    case 'Droplets': return <Droplets className={className} />;
    case 'Gauge': return <Gauge className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'CloudRain': return <CloudRain className={className} />;
    case 'CloudSnow': return <CloudSnow className={className} />;
    case 'Cloud': return <Cloud className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'CloudFog': return <CloudFog className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'RotateCw': return <RotateCw className={className} />;
    case 'Radar': return <Radar className={className} />;
    case 'ThermometerSnowflake': return <ThermometerSnowflake className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'Navigation': return <Navigation className={className} />;
    case 'Waves': return <Waves className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Box': return <Box className={className} />;
    default: return <Activity className={className} />;
  }
};

export const DrillDownNavigation: React.FC<DrillDownNavigationProps> = ({
  onAddLayer,
  searchQuery
}) => {
  // Step State
  // 1 = Category, 2 = Source/Model, 3 = Variable, 4 = Level, 5 = Visualization & Palette
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected drilldown state
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [selectedSource, setSelectedSource] = useState<DataSourceModel | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<WeatherVariable | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<VerticalLevel | null>(null);
  const [selectedViz, setSelectedViz] = useState<VisualizationOption | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);

  // Variable filter by category tab
  const [variableFilterCategory, setVariableFilterCategory] = useState<string>('all');

  // Handle Category select
  const handleSelectCategory = (cat: CategoryInfo) => {
    setSelectedCategory(cat);
    setSelectedSource(null);
    setSelectedVariable(null);
    setSelectedLevel(null);
    setSelectedViz(null);
    setSelectedPalette(null);
    setCurrentStep(2);
  };

  // Handle Source select
  const handleSelectSource = (src: DataSourceModel) => {
    setSelectedSource(src);
    setSelectedVariable(null);
    setSelectedLevel(null);
    setSelectedViz(null);
    setSelectedPalette(null);
    setCurrentStep(3);
  };

  // Handle Variable select
  const handleSelectVariable = (variable: WeatherVariable) => {
    setSelectedVariable(variable);
    
    // Set default level
    const defaultLvl = VERTICAL_LEVELS.find(l => l.id === variable.defaultLevelId) || VERTICAL_LEVELS[0];
    setSelectedLevel(defaultLvl);

    // Set default viz
    const defaultV = VISUALIZATION_OPTIONS.find(v => v.id === variable.defaultVisualizationId) || VISUALIZATION_OPTIONS[0];
    setSelectedViz(defaultV);

    // Set default palette
    const defaultP = COLOR_PALETTES.find(p => p.id === variable.defaultPaletteId) || COLOR_PALETTES[0];
    setSelectedPalette(defaultP);

    setCurrentStep(4);
  };

  // Handle Level select
  const handleSelectLevel = (lvl: VerticalLevel) => {
    setSelectedLevel(lvl);
    setCurrentStep(5);
  };

  // Create & Add Layer to Map
  const handleConfirmAddLayer = () => {
    if (!selectedCategory || !selectedSource || !selectedVariable || !selectedLevel || !selectedViz || !selectedPalette) return;

    const newActiveLayer: ActiveLayer = {
      instanceId: `layer_${selectedSource.id}_${selectedVariable.id}_${Date.now()}`,
      categoryId: selectedCategory.id,
      sourceId: selectedSource.id,
      sourceName: selectedSource.shortName,
      variableId: selectedVariable.id,
      variableName: selectedVariable.name,
      variableUnit: selectedVariable.unit,
      levelId: selectedLevel.id,
      levelName: selectedLevel.shortLabel,
      visualizationId: selectedViz.id,
      visualizationName: selectedViz.name,
      paletteId: selectedPalette.id,
      paletteColors: selectedPalette.colors,
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
      customLabel: `${selectedSource.shortName} ${selectedVariable.shortName} (${selectedLevel.shortLabel})`,
      minVal: selectedVariable.min,
      maxVal: selectedVariable.max,
      dateCreated: Date.now()
    };

    onAddLayer(newActiveLayer);

    // Reset drilldown to step 1 or step 3 for rapid additions
    setCurrentStep(3);
  };

  // Filter sources by selected category
  const filteredSources = DATA_SOURCES.filter(src => {
    if (selectedCategory?.id === 'favorites') return src.isFavorite;
    return src.categoryId === selectedCategory?.id;
  });

  // Filter variables by selected source
  const availableVariables = WEATHER_VARIABLES.filter(varItem => {
    if (!selectedSource) return true;
    return selectedSource.supportedVariableIds.includes(varItem.id);
  });

  const variableCategories = Array.from(new Set(availableVariables.map(v => v.category)));

  const displayedVariables = availableVariables.filter(v => {
    if (variableFilterCategory === 'all') return true;
    return v.category === variableFilterCategory;
  });

  // Available levels for chosen variable
  const availableLevels = VERTICAL_LEVELS.filter(lvl => {
    if (!selectedVariable) return true;
    return selectedVariable.supportedLevelIds.includes(lvl.id);
  });

  // Global search filtering if searchQuery is typed
  const isSearchActive = searchQuery.trim().length > 0;
  const searchResultsVariables = WEATHER_VARIABLES.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const searchResultsSources = DATA_SOURCES.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#08090C] text-slate-200 select-none overflow-hidden">
      
      {/* 1. BREADCRUMB PROGRESS BAR */}
      {!isSearchActive && (
        <div className="bg-[#0b0d13] px-3 py-2 border-b border-[#1A1C23] flex items-center justify-between overflow-x-auto custom-scrollbar shrink-0">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 whitespace-nowrap">
            
            {/* Step 1: Category */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`hover:text-white transition flex items-center space-x-1 ${currentStep === 1 ? 'text-blue-400 font-extrabold' : ''}`}
            >
              <span>{selectedCategory ? selectedCategory.name : 'Category'}</span>
            </button>

            {currentStep > 1 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}

            {/* Step 2: Source */}
            {currentStep >= 2 && (
              <button
                onClick={() => setCurrentStep(2)}
                className={`hover:text-white transition ${currentStep === 2 ? 'text-blue-400 font-extrabold' : ''}`}
              >
                <span>{selectedSource ? selectedSource.shortName : 'Source'}</span>
              </button>
            )}

            {currentStep > 2 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}

            {/* Step 3: Variable */}
            {currentStep >= 3 && (
              <button
                onClick={() => setCurrentStep(3)}
                className={`hover:text-white transition ${currentStep === 3 ? 'text-blue-400 font-extrabold' : ''}`}
              >
                <span>{selectedVariable ? selectedVariable.shortName : 'Variable'}</span>
              </button>
            )}

            {currentStep > 3 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}

            {/* Step 4: Level */}
            {currentStep >= 4 && (
              <button
                onClick={() => setCurrentStep(4)}
                className={`hover:text-white transition ${currentStep === 4 ? 'text-blue-400 font-extrabold' : ''}`}
              >
                <span>{selectedLevel ? selectedLevel.shortLabel : 'Level'}</span>
              </button>
            )}

            {currentStep > 4 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}

            {/* Step 5: Visualization */}
            {currentStep >= 5 && (
              <span className="text-blue-400 font-extrabold">
                {selectedViz ? selectedViz.name : 'Visualization'}
              </span>
            )}
          </div>

          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="text-slate-500 hover:text-white transition p-1 hover:bg-[#1A1C23] rounded ml-2"
              title="Back one step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. SEARCH MODE OVERRIDE */}
      {isSearchActive ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          <div className="text-[10px] uppercase font-black tracking-widest text-blue-400">
            Search Results for "{searchQuery}"
          </div>

          {/* Variables matched */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Weather Variables ({searchResultsVariables.length})</div>
            <div className="space-y-1.5">
              {searchResultsVariables.map(v => (
                <div
                  key={v.id}
                  onClick={() => {
                    const fallbackSource = DATA_SOURCES.find(s => s.supportedVariableIds.includes(v.id)) || DATA_SOURCES[0];
                    const cat = CATEGORIES.find(c => c.id === fallbackSource.categoryId) || CATEGORIES[0];
                    setSelectedCategory(cat);
                    setSelectedSource(fallbackSource);
                    handleSelectVariable(v);
                  }}
                  className="p-2.5 rounded-lg border border-[#1A1C23] bg-[#12141A]/60 hover:bg-blue-600/10 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded bg-[#1f2430] text-blue-400">
                      {renderVariableIcon(v.iconName)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{v.name}</div>
                      <div className="text-[9px] text-slate-500">{v.category} • Range: {v.min} to {v.max} {v.unit}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Sources matched */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Models & Data Sources ({searchResultsSources.length})</div>
            <div className="space-y-1.5">
              {searchResultsSources.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    const cat = CATEGORIES.find(c => c.id === s.categoryId) || CATEGORIES[0];
                    setSelectedCategory(cat);
                    handleSelectSource(s);
                  }}
                  className="p-2.5 rounded-lg border border-[#1A1C23] bg-[#12141A]/60 hover:bg-blue-600/10 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{s.name}</div>
                    <div className="text-[9px] text-slate-500">{s.provider} • Res: {s.spatialResolution}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL DRILL-DOWN STEPS */
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          
          {/* STEP 1: CATEGORY SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
                1. Select Data Source Category
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="p-3 rounded-lg border border-[#1A1C23] bg-[#12141A]/50 hover:bg-[#161a24] hover:border-blue-500/40 cursor-pointer transition flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-md bg-[#1c202c] border border-[#262b3a] flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                        {renderCategoryIcon(cat.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                            {cat.name}
                          </span>
                          {cat.badge && (
                            <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: MODEL / SOURCE SELECTION */}
          {currentStep === 2 && selectedCategory && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  2. Select {selectedCategory.name}
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  {filteredSources.length} Available
                </span>
              </div>

              {filteredSources.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No sources found for this category.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSources.map(src => (
                    <div
                      key={src.id}
                      onClick={() => handleSelectSource(src)}
                      className="p-3 rounded-lg border border-[#1A1C23] bg-[#12141A]/60 hover:bg-[#161a24] hover:border-blue-500/50 cursor-pointer transition group shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-200 group-hover:text-white">
                              {src.name}
                            </span>
                            {src.badge && (
                              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {src.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                            {src.provider}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition" />
                      </div>

                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {src.description}
                      </p>

                      <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-[#1f2430] text-[9px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-600 block text-[8px] uppercase font-sans">Resolution</span>
                          <span className="font-bold text-slate-300">{src.spatialResolution}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[8px] uppercase font-sans">Horizon</span>
                          <span className="font-bold text-slate-300">{src.forecastHorizon}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[8px] uppercase font-sans">Updates</span>
                          <span className="font-bold text-slate-300">{src.updateFrequency}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: WEATHER VARIABLE SELECTION */}
          {currentStep === 3 && selectedSource && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                3. Select Weather Variable ({selectedSource.shortName})
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar py-1">
                <button
                  onClick={() => setVariableFilterCategory('all')}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition whitespace-nowrap ${
                    variableFilterCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#12141A] text-slate-400 hover:text-white border border-[#1A1C23]'
                  }`}
                >
                  All ({availableVariables.length})
                </button>
                {variableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setVariableFilterCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition whitespace-nowrap ${
                      variableFilterCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#12141A] text-slate-400 hover:text-white border border-[#1A1C23]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Variables List */}
              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {displayedVariables.map(v => (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVariable(v)}
                    className="p-2.5 rounded-lg border border-[#1A1C23] bg-[#12141A]/60 hover:bg-blue-600/10 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-[#1c202c] border border-[#262b3a] flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                        {renderVariableIcon(v.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                            {v.name}
                          </span>
                          <span className="text-[9px] font-mono text-blue-400 font-bold bg-blue-500/10 px-1 rounded border border-blue-500/20">
                            {v.unit}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {v.category} • Default Level: {v.defaultLevelId}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: VERTICAL LEVEL SELECTION */}
          {currentStep === 4 && selectedVariable && (
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                4. Select Vertical Level for {selectedVariable.name}
              </div>

              <div className="space-y-1.5">
                {availableLevels.map(lvl => {
                  const isSelected = selectedLevel?.id === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => handleSelectLevel(lvl)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-[#12141A]/50 border-[#1A1C23] text-slate-300 hover:bg-[#161a24] hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'}`}>
                          {isSelected && <Check className="w-2 h-2 text-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{lvl.name}</div>
                          <div className="text-[9px] text-slate-500">{lvl.description}</div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#08090C] px-2 py-0.5 rounded border border-[#1A1C23]">
                        {lvl.shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Visualization Settings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: VISUALIZATION METHOD & COLOR PALETTE SELECTION */}
          {currentStep === 5 && selectedVariable && (
            <div className="space-y-4">
              <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                5. Visualization Method & Color Scale
              </div>

              {/* Rendering Method Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1.5 uppercase">
                  Rendering Style (Independent of Data)
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1 border border-[#1A1C23] rounded bg-[#0b0d13]">
                  {VISUALIZATION_OPTIONS.map(viz => {
                    const isSelected = selectedViz?.id === viz.id;
                    return (
                      <div
                        key={viz.id}
                        onClick={() => setSelectedViz(viz)}
                        className={`p-2 rounded cursor-pointer transition border flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-[#12141A] border-[#1A1C23] text-slate-300 hover:border-blue-500/30'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{viz.name}</div>
                          <div className="text-[9px] text-slate-500">{viz.description}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1.5 uppercase">
                  Color Palette Scale
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar p-1 border border-[#1A1C23] rounded bg-[#0b0d13]">
                  {COLOR_PALETTES.map(pal => {
                    const isSelected = selectedPalette?.id === pal.id;
                    return (
                      <div
                        key={pal.id}
                        onClick={() => setSelectedPalette(pal)}
                        className={`p-2 rounded cursor-pointer transition border flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-[#12141A] border-[#1A1C23] text-slate-300 hover:border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{pal.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                        </div>

                        {/* Live Color Ramp Strip */}
                        <div className="h-2.5 w-full rounded overflow-hidden flex border border-[#1A1C23]">
                          {pal.colors.map((c, idx) => (
                            <div key={idx} className="flex-1 h-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final Confirm Add Layer Button */}
              <div className="pt-2">
                <button
                  onClick={handleConfirmAddLayer}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-2 border border-blue-400/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD LAYER TO MAP STACK</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
