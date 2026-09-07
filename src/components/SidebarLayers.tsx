import React, { useState } from "react";
import { WeatherLayer } from "../types";
import { WEATHER_LAYERS } from "../data";
import { Eye, MoreVertical, Plus, ChevronUp, ChevronDown, TriangleAlert, ChartLine, Database, Settings as GearIcon, Layers } from "lucide-react";

interface SidebarLayersProps {
  activeLayer: WeatherLayer;
  onLayerSelect: (layer: WeatherLayer) => void;
  onClose: () => void;
  onSubmenuClick: (menu: string) => void;
}

export const SidebarLayers: React.FC<SidebarLayersProps> = ({
  activeLayer,
  onLayerSelect,
  onClose,
  onSubmenuClick,
}) => {
  const [showMyLayers, setShowMyLayers] = useState(true);
  const [showWeatherLayers, setShowWeatherLayers] = useState(true);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#08090C] text-slate-200 select-none" id="layers-panel">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#1A1C23] flex justify-between items-center bg-[#08090C]">
        <h2 className="text-xs font-bold tracking-widest text-slate-100 uppercase font-sans">LAYERS</h2>
        <button 
          onClick={onClose} 
          className="text-slate-500 hover:text-slate-200 transition"
          id="btn-close-layers"
        >
          <Plus className="w-4 h-4 rotate-45" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
        {/* My Layers Category */}
        <div className="rounded-lg border border-[#1A1C23] overflow-hidden bg-[#12141A]/40">
          <div 
            onClick={() => setShowMyLayers(!showMyLayers)}
            className="px-3 py-2.5 flex justify-between items-center cursor-pointer hover:bg-[#1A1C23]/40 transition"
          >
            <div className="flex items-center space-x-2 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">My Layers</span>
            </div>
            <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
          </div>

          {showMyLayers && (
            <div className="p-2 text-[10px] text-slate-500 text-center border-t border-[#1A1C23]/20 font-medium py-3">
              No custom overlays imported yet.
            </div>
          )}
        </div>

        {/* Weather Layers Category */}
        <div className="rounded-lg border border-[#1A1C23] overflow-hidden bg-[#12141A]/40">
          <div 
            onClick={() => setShowWeatherLayers(!showWeatherLayers)}
            className="px-3 py-2.5 flex justify-between items-center cursor-pointer hover:bg-[#1A1C23]/40 transition text-blue-400"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Weather Layers</span>
            </div>
            {showWeatherLayers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>

          {showWeatherLayers && (
            <div className="p-1.5 space-y-1.5 border-t border-[#1A1C23]/20">
              {WEATHER_LAYERS.map((layer) => {
                const isSelected = layer.id === activeLayer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => onLayerSelect(layer)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition border ${
                      isSelected
                        ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "bg-transparent border-transparent hover:bg-[#1A1C23]/35"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded overflow-hidden relative border border-[#1A1C23]">
                        <img 
                          className="w-full h-full object-cover" 
                          src={layer.thumbnail} 
                          alt={layer.name} 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                          {layer.name}
                        </span>
                        <span className="text-[10px] text-slate-500">{layer.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-500">
                      <Eye className={`w-3.5 h-3.5 transition ${isSelected ? "text-blue-400" : "hover:text-slate-300"}`} />
                      <MoreVertical className="w-3.5 h-3.5 hover:text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sub Menus matching layout */}
        <div className="border-t border-[#1A1C23] pt-2 space-y-1">
          <button
            onClick={() => onSubmenuClick("warnings")}
            className="w-full px-3 py-2.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-[#1A1C23]/40 text-slate-400 hover:text-white transition"
          >
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <TriangleAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Warnings</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
          </button>

          <button
            onClick={() => onSubmenuClick("charts")}
            className="w-full px-3 py-2.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-[#1A1C23]/40 text-slate-400 hover:text-white transition"
          >
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <ChartLine className="w-3.5 h-3.5 text-emerald-500" />
              <span>Charts</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
          </button>

          <button
            onClick={() => onSubmenuClick("data")}
            className="w-full px-3 py-2.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-[#1A1C23]/40 text-slate-400 hover:text-white transition"
          >
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Data Sources</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
          </button>

          <button
            onClick={() => onSubmenuClick("settings")}
            className="w-full px-3 py-2.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-[#1A1C23]/40 text-slate-400 hover:text-white transition"
          >
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <GearIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};
