import React from "react";
import { CanvasTool, CanvasDocument } from "../../types/canvas";
import {
  MousePointer,
  Hand,
  Plus,
  Layout,
  Compass,
  Activity,
  ChartLine,
  Type,
  FileImage,
  Undo2,
  Redo2,
  Maximize2,
  Download,
  Link2,
  Layers,
  Sparkles,
  Command,
  Presentation,
  ZoomIn,
  ZoomOut,
  Maximize
} from "lucide-react";

interface CanvasToolbarProps {
  activeTool: CanvasTool;
  document: CanvasDocument;
  canUndo: boolean;
  canRedo: boolean;
  isPresentationMode: boolean;
  onSelectTool: (tool: CanvasTool) => void;
  onOpenAddModal: () => void;
  onOpenQuickAdd: () => void;
  onOpenSyncModal: () => void;
  onSelectTemplate: (templateKey: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onZoomToFit: () => void;
  onTogglePresentation: () => void;
  onExportPng: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  activeTool,
  document,
  canUndo,
  canRedo,
  isPresentationMode,
  onSelectTool,
  onOpenAddModal,
  onOpenQuickAdd,
  onOpenSyncModal,
  onSelectTemplate,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onZoomToFit,
  onTogglePresentation,
  onExportPng,
}) => {
  return (
    <div className="h-11 bg-[#0A0D14] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 select-none z-30 shadow-md">
      {/* Left: Document Name & Template Picker */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shrink-0" />
          <span className="font-bold text-xs text-white truncate max-w-[200px]">
            {document.name}
          </span>
        </div>

        {/* Template Selector Dropdown */}
        <select
          onChange={(e) => onSelectTemplate(e.target.value)}
          defaultValue=""
          className="bg-[#121622] hover:bg-[#181D2C] text-slate-300 border border-[#1A1F2C] rounded px-2 py-1 text-[10px] outline-none transition"
        >
          <option value="" disabled>Load Template...</option>
          <option value="hormozgan">Hormozgan Convective Outlook (Default)</option>
          <option value="model_comparison">ECMWF vs GFS Synoptic Comparison</option>
          <option value="blank">Blank Infinite Canvas</option>
        </select>
      </div>

      {/* Center: Tools Palette */}
      <div className="flex items-center bg-[#07090E] border border-[#181E2C] rounded-lg p-0.5 space-x-0.5">
        <button
          onClick={() => onSelectTool("select")}
          className={`p-1.5 rounded transition ${
            activeTool === "select" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
          }`}
          title="Select / Move Tool (V)"
        >
          <MousePointer className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectTool("hand")}
          className={`p-1.5 rounded transition ${
            activeTool === "hand" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
          }`}
          title="Pan Hand Tool (H or Space+Drag)"
        >
          <Hand className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-[#181E2C] mx-1" />

        {/* Add Object Modal button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition shadow-sm"
          title="Insert New Weather Item"
        >
          <Plus className="w-3 h-3" />
          <span>Add Item</span>
        </button>

        {/* Quick Add Palette shortcut */}
        <button
          onClick={onOpenQuickAdd}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#121622] rounded transition"
          title="Quick Search Palette (/)"
        >
          <Command className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-[#181E2C] mx-1" />

        {/* Direct quick-add items */}
        <button
          onClick={() => onSelectTool("live_map")}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#121622] rounded transition"
          title="New Live Map Card"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectTool("climate_index")}
          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-[#121622] rounded transition"
          title="New Climate Index (Niño / MJO / IOD)"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectTool("chart")}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#121622] rounded transition"
          title="New Meteorological Chart (Sounding / Meteogram)"
        >
          <ChartLine className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectTool("text")}
          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#121622] rounded transition"
          title="New Forecaster Reasoning Block"
        >
          <Type className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectTool("frame")}
          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-[#121622] rounded transition"
          title="New Section Frame"
        >
          <Layout className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: History, Sync Groups, Zoom & Export */}
      <div className="flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-1 border-r border-[#1A1F2C] pr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition ${canUndo ? "text-slate-300 hover:bg-[#121622]" : "text-slate-600 cursor-not-allowed"}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition ${canRedo ? "text-slate-300 hover:bg-[#121622]" : "text-slate-600 cursor-not-allowed"}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Groups modal trigger */}
        <button
          onClick={onOpenSyncModal}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-[#121622] hover:bg-[#181D2C] border border-[#1A1F2C] text-slate-300 text-[10px] font-mono transition"
          title="Manage Map Sync Groups"
        >
          <Link2 className="w-3 h-3 text-cyan-400" />
          <span>Sync ({document.syncGroups.length})</span>
        </button>

        {/* Zoom controls */}
        <div className="flex items-center bg-[#07090E] border border-[#181E2C] rounded p-0.5 space-x-0.5">
          <button
            onClick={onZoomOut}
            className="p-1 text-slate-400 hover:text-white rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={onResetZoom}
            className="px-1 text-[9px] font-mono font-bold text-slate-300 hover:text-white"
            title="Reset Zoom to 100%"
          >
            {Math.round(document.viewport.zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1 text-slate-400 hover:text-white rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={onZoomToFit}
            className="p-1 text-slate-400 hover:text-white rounded transition"
            title="Zoom to Fit All Items"
          >
            <Maximize className="w-3 h-3" />
          </button>
        </div>

        {/* Presentation Mode */}
        <button
          onClick={onTogglePresentation}
          className={`p-1.5 rounded transition ${
            isPresentationMode ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-white hover:bg-[#121622]"
          }`}
          title={isPresentationMode ? "Exit Presentation Mode" : "Briefing / Presentation Mode"}
        >
          <Presentation className="w-3.5 h-3.5" />
        </button>

        {/* Export to PNG */}
        <button
          onClick={onExportPng}
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition"
          title="Export Canvas to High-Res PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};
