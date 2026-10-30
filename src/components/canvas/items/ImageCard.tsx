import React from "react";
import { ImageCanvasItem } from "../../../types/canvas";
import { Lock, Unlock, Trash2, Copy, Image as ImageIcon } from "lucide-react";

interface ImageCardProps {
  item: ImageCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<ImageCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] rounded border border-[#1A1F2C] overflow-hidden shadow-2xl select-none">
      {/* Header bar */}
      <div className="h-8 bg-[#0E1118] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 cursor-move">
        <div className="flex items-center space-x-2 min-w-0">
          <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate tracking-tight">
            {item.title || "Image Reference"}
          </span>
          {item.isStaticReference && (
            <span className="text-[8px] font-mono text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/20">
              STATIC
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock image" : "Lock position"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate image"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete image"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Image body */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
        <img
          src={item.src}
          alt={item.caption || "Analysis reference"}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {item.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs p-1.5 text-[9px] text-slate-300 font-mono truncate">
            {item.caption}
          </div>
        )}
      </div>
    </div>
  );
};
