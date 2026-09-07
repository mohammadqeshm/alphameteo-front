import React from 'react';
import { Search, X, Layers, GitFork, Star, LayoutGrid, SlidersHorizontal, Sparkles } from 'lucide-react';

export type ViewMode = 'drilldown' | 'tree' | 'active_stack' | 'presets';

interface HeaderSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeViewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeCount: number;
  favoritesCount: number;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  searchQuery,
  onSearchChange,
  activeViewMode,
  onViewModeChange,
  activeCount,
  favoritesCount
}) => {
  return (
    <div className="p-3 bg-[#08090C] border-b border-[#1A1C23] flex flex-col gap-2.5 shrink-0 select-none">
      {/* Title + Subtitle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-xs font-black tracking-widest text-slate-100 uppercase font-sans">
            DATA SOURCE LAYERS
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-[#12141A] px-2 py-0.5 rounded border border-[#1A1C23]">
          ALPHA v4.2
        </span>
      </div>

      {/* Global Fast Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search 100+ models, variables, radar, satellite..."
          className="w-full bg-[#12141A] hover:bg-[#161922] focus:bg-[#0d0e12] text-slate-200 text-xs rounded border border-[#212530] focus:border-blue-500/80 pl-9 pr-8 py-1.5 focus:outline-none transition placeholder-slate-500 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation View Mode Switcher */}
      <div className="grid grid-cols-4 gap-1 bg-[#0f1117] p-1 rounded-lg border border-[#1A1C23]">
        <button
          onClick={() => onViewModeChange('drilldown')}
          className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded text-[10px] font-bold transition ${
            activeViewMode === 'drilldown'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922]'
          }`}
          title="Progressive Source Drill-Down Mode"
        >
          <GitFork className="w-3 h-3" />
          <span className="truncate">Drill-Down</span>
        </button>

        <button
          onClick={() => onViewModeChange('tree')}
          className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded text-[10px] font-bold transition ${
            activeViewMode === 'tree'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922]'
          }`}
          title="Hierarchical Catalog Tree"
        >
          <LayoutGrid className="w-3 h-3" />
          <span className="truncate">Catalog</span>
        </button>

        <button
          onClick={() => onViewModeChange('active_stack')}
          className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded text-[10px] font-bold transition relative ${
            activeViewMode === 'active_stack'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922]'
          }`}
          title="Active Layer Stack Manager"
        >
          <Layers className="w-3 h-3" />
          <span className="truncate">Active</span>
          {activeCount > 0 && (
            <span className="ml-1 bg-blue-500 text-white font-mono text-[9px] px-1 rounded-full font-black">
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onViewModeChange('presets')}
          className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded text-[10px] font-bold transition ${
            activeViewMode === 'presets'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922]'
          }`}
          title="Workstation Presets & Favorites"
        >
          <Star className="w-3 h-3" />
          <span className="truncate">Presets</span>
        </button>
      </div>
    </div>
  );
};
