import React from "react";
import { MapSnapshotCanvasItem } from "../../../types/canvas";
import { Lock, Unlock, Trash2, Copy, Camera, Calendar, MapPin, Maximize2 } from "lucide-react";

interface MapSnapshotCardProps {
  item: MapSnapshotCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<MapSnapshotCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const MapSnapshotCard: React.FC<MapSnapshotCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] rounded border border-[#1A1F2C] overflow-hidden shadow-2xl select-none">
      {/* Header bar */}
      <div className="h-9 bg-[#0E1118] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 cursor-move">
        <div className="flex items-center space-x-2 min-w-0">
          <Camera className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate tracking-tight">
            {item.title || item.parameterName}
          </span>
          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
            SNAPSHOT
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock snapshot" : "Lock position"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate snapshot"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete snapshot"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Snapshot Image Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center group">
        <img
          src={item.imageUrl}
          alt={item.title || item.parameterName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback radar simulation visual if external image fails
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Fallback graphical radar canvas if image fails or for mockup */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07080B] text-slate-500 p-4 -z-10">
          <Camera className="w-8 h-8 text-blue-400/50 mb-2" />
          <span className="text-xs font-mono font-medium text-slate-400">{item.parameterName}</span>
          <span className="text-[10px] text-slate-600 mt-1">{item.sourceModel}</span>
        </div>

        {/* Metadata Overlay Badge */}
        <div className="absolute bottom-2 left-2 right-2 bg-[#080A0E]/90 backdrop-blur-md rounded border border-[#1A1F2C] p-2 flex flex-col space-y-1 text-[9px] font-mono text-slate-300 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-blue-400 font-bold">{item.sourceModel}</span>
            <span>Run: {item.modelRun}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Valid: {item.validTime}</span>
            {item.level && <span>Level: {item.level}</span>}
          </div>
          {item.notes && (
            <p className="text-[9px] text-slate-400 font-sans line-clamp-2 border-t border-[#1A1F2C]/60 pt-1 mt-0.5">
              {item.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
