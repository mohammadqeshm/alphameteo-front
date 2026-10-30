import React, { useState } from "react";
import { CanvasItem, CanvasItemType, ClimateIndexId, ChartType, AnnotationShape } from "../../types/canvas";
import {
  X,
  Compass,
  Activity,
  ChartLine,
  Type,
  FileImage,
  Layout,
  AlertTriangle,
  Upload,
  Plus
} from "lucide-react";

interface AddObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Partial<CanvasItem>) => void;
}

export const AddObjectModal: React.FC<AddObjectModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [activeTab, setActiveTab] = useState<"maps" | "indices" | "charts" | "annotations" | "text" | "frames">("maps");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none">
      <div className="w-[680px] max-w-[95vw] max-h-[85vh] bg-[#0A0D14] border border-[#1A1F2C] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="h-12 bg-[#0E121B] border-b border-[#1A1F2C] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-white tracking-wide">
              Add Meteorological Object to Canvas
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-[#181D2C] rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="h-10 bg-[#07090E] border-b border-[#181E2C] px-4 flex items-center space-x-1 shrink-0 overflow-x-auto custom-scrollbar">
          {[
            { id: "maps", label: "Live Maps", icon: Compass },
            { id: "indices", label: "Climate Indices", icon: Activity },
            { id: "charts", label: "Charts & Soundings", icon: ChartLine },
            { id: "annotations", label: "Synoptic GIS & Alerts", icon: AlertTriangle },
            { id: "text", label: "Forecaster Reasoning", icon: Type },
            { id: "frames", label: "Section Frames", icon: Layout },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  isSelected ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Catalog Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#06080C]">
          {activeTab === "maps" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "ECMWF 500 hPa Geopotential", layer: "pressure", level: "500hPa", model: "ECMWF HRES", desc: "Mid-tropospheric wave pattern, troughs, and cut-off lows" },
                { title: "GFS 850 hPa Theta-E & Moisture", layer: "temperature", level: "850hPa", model: "GFS Global", desc: "Low-level thermodynamic moisture tongue and frontal boundaries" },
                { title: "Surface MSLP & Wind Vectors", layer: "wind", level: "Surface", model: "ECMWF HRES", desc: "Surface pressure centers, sea breezes, and gale winds" },
                { title: "High-Res Radar & Convection", layer: "radar", level: "Surface", model: "EUMETSAT MTG", desc: "Precipitation cores, storm cells, and squall lines" },
                { title: "Lightning Flash Density", layer: "lightning", level: "Surface", model: "EUMETSAT MTG", desc: "Satellite lightning strike clusters and convection rate" },
                { title: "250 hPa Jet Stream Axis", layer: "wind", level: "250hPa", model: "GFS Global", desc: "Upper-tropospheric jet streak divergence sectors" },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddItem({
                      type: "live_map",
                      title: card.title,
                      activeLayerId: card.layer,
                      level: card.level,
                      model: card.model,
                      run: "00Z",
                      forecastHour: 18,
                      width: 480,
                      height: 440,
                      coords: { lat: 27.2, lon: 56.3, elevation: 15 },
                      zoom: 6.0
                    });
                    onClose();
                  }}
                  className="p-3 bg-[#0C101A] hover:bg-[#121726] border border-[#1A2234] hover:border-cyan-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 transition">
                      {card.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-3 pt-2 border-t border-[#161D2E]">
                    <span>{card.model}</span>
                    <span className="text-cyan-400 font-bold group-hover:translate-x-0.5 transition">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "indices" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "mjo", title: "MJO Wheeler-Hendon Phase Diagram", agency: "BOM Australia", desc: "Real-time 8-phase diagram tracking tropical convective waves" },
                { id: "iod", title: "Indian Ocean Dipole (DMI)", agency: "BOM / ECMWF", desc: "Western vs Eastern Indian Ocean SST anomaly dipole" },
                { id: "nino34", title: "ENSO — Niño 3.4 SST Anomaly", agency: "NOAA CPC", desc: "East-Central Tropical Pacific temperature anomaly" },
                { id: "nao", title: "North Atlantic Oscillation (NAO)", agency: "NOAA CPC", desc: "Mid-latitude Atlantic storm track steering mode" },
                { id: "ao", title: "Arctic Oscillation (AO)", agency: "NOAA CPC", desc: "Circumpolar vortex stability and polar air outbreak index" },
                { id: "soi", title: "Southern Oscillation Index (SOI)", agency: "BOM Australia", desc: "Tahiti - Darwin sea-level pressure difference" },
              ].map((idxCard, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddItem({
                      type: "climate_index",
                      title: idxCard.title,
                      indexId: idxCard.id as ClimateIndexId,
                      viewMode: idxCard.id === "mjo" ? "phase_diagram" : "timeseries",
                      dataSource: idxCard.agency as any,
                      width: idxCard.id === "mjo" ? 380 : 340,
                      height: 420
                    });
                    onClose();
                  }}
                  className="p-3 bg-[#0C101A] hover:bg-[#121726] border border-[#1A2234] hover:border-emerald-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-emerald-300 transition">
                      {idxCard.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {idxCard.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-3 pt-2 border-t border-[#161D2E]">
                    <span>{idxCard.agency}</span>
                    <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "charts" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "sounding", title: "Thermodynamic Skew-T Sounding", desc: "Atmospheric profile with CAPE, CIN, LCL, shear, and wind barbs" },
                { type: "meteogram", title: "7-Day High-Resolution Meteogram", desc: "Multi-parameter curve: Temp, Dewpoint, Precipitation bars, MSLP" },
                { type: "ensemble_plume", title: "Ensemble Plume Dispersion", desc: "50-member ensemble spread for temperature and rainfall certainty" },
              ].map((chart, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddItem({
                      type: "chart",
                      title: chart.title,
                      chartType: chart.type as ChartType,
                      locationName: "Bandar Abbas (OIKB)",
                      coords: { lat: 27.218, lon: 56.377, elevation: 10 },
                      model: "ECMWF / GFS Blended",
                      width: 480,
                      height: 460
                    });
                    onClose();
                  }}
                  className="p-3 bg-[#0C101A] hover:bg-[#121726] border border-[#1A2234] hover:border-amber-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition">
                      {chart.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {chart.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-end text-[9px] font-mono text-amber-400 font-bold mt-3 pt-2 border-t border-[#161D2E]">
                    <span className="group-hover:translate-x-0.5 transition">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "annotations" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { shape: "sticky_note", color: "#F59E0B", title: "Priority Forecaster Sticky Note", desc: "Quick observation or watch note with customizable alert tint" },
                { shape: "convective_watch", color: "#EF4444", title: "Severe Convective Watch Polygon", desc: "Red striped alert polygon designating thunderstorm risk area" },
                { shape: "arrow", color: "#38BDF8", title: "Jet Stream / Moisture Vector Arrow", desc: "Directional vector designating upper jet core or low-level jet" },
                { shape: "front_cold", color: "#3B82F6", title: "Cold Front Boundary Line", desc: "Synoptic blue line with pointed triangles" },
                { shape: "front_warm", color: "#EF4444", title: "Warm Front Boundary Line", desc: "Synoptic red line with warm semicircles" },
              ].map((anno, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddItem({
                      type: "annotation",
                      title: anno.title,
                      shape: anno.shape as AnnotationShape,
                      color: anno.color,
                      text: anno.shape === "sticky_note" ? "Forecaster priority memo..." : anno.title,
                      width: anno.shape === "sticky_note" ? 280 : 320,
                      height: anno.shape === "sticky_note" ? 180 : 140
                    });
                    onClose();
                  }}
                  className="p-3 bg-[#0C101A] hover:bg-[#121726] border border-[#1A2234] hover:border-blue-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-blue-300 transition">
                      {anno.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {anno.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-end text-[9px] font-mono text-blue-400 font-bold mt-3 pt-2 border-t border-[#161D2E]">
                    <span className="group-hover:translate-x-0.5 transition">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "text" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: "body", title: "Synoptic Reasoning Block", desc: "Multi-paragraph markdown analysis notes with headers and bullet points" },
                { role: "callout", title: "Hazard Alert Callout", desc: "High-contrast highlighted callout block for immediate forecaster actions" },
                { role: "h1", title: "Section Heading", desc: "Large bold typography title block for structuring the briefing canvas" },
              ].map((txt, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddItem({
                      type: "text",
                      title: txt.title,
                      textRole: txt.role as any,
                      content: txt.role === "callout" 
                        ? "IMMEDIATE ADVISORY: Marine vessels and port authorities in the Strait of Hormuz are advised of gale gusts exceeding 50 kts."
                        : "### 1. SYNOPTIC OVERVIEW:\nEnter analysis reasoning here...",
                      width: 480,
                      height: 320
                    });
                    onClose();
                  }}
                  className="p-3 bg-[#0C101A] hover:bg-[#121726] border border-[#1A2234] hover:border-cyan-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 transition">
                      {txt.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {txt.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-end text-[9px] font-mono text-cyan-400 font-bold mt-3 pt-2 border-t border-[#161D2E]">
                    <span className="group-hover:translate-x-0.5 transition">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "frames" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { theme: "cyan", title: "Synoptic Overview Frame", desc: "Cyan themed container for large-scale upper-air & surface charts" },
                { theme: "amber", title: "Mesoscale Hazards Frame", desc: "Amber themed container for radar, lightning, and soundings" },
                { theme: "rose", title: "Convective Warnings Frame", desc: "Rose themed container for severe watch polygons and bulletins" },
                { theme: "purple", title: "Climate Teleconnections Frame", desc: "Purple themed container for MJO, IOD, and ENSO indices" },
              ].map((frm, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddItem({
                      type: "frame",
                      title: frm.title.toUpperCase(),
                      colorTheme: frm.theme as any,
                      description: frm.desc,
                      width: 980,
                      height: 560
                    });
                    onClose();
                  }}
                  className="p-3 bg-[#0C101A] hover:bg-[#121726] border border-[#1A2234] hover:border-purple-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-purple-300 transition">
                      {frm.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {frm.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-end text-[9px] font-mono text-purple-400 font-bold mt-3 pt-2 border-t border-[#161D2E]">
                    <span className="group-hover:translate-x-0.5 transition">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
