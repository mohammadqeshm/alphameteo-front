import React, { useState } from "react";
import { TextCanvasItem } from "../../../types/canvas";
import { Lock, Unlock, Trash2, Copy, FileText, Edit2, Check } from "lucide-react";

interface TextCardProps {
  item: TextCanvasItem;
  isSelected: boolean;
  onUpdate: (updated: Partial<TextCanvasItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const TextCard: React.FC<TextCardProps> = ({
  item,
  isSelected,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(item.content);

  const handleSave = () => {
    onUpdate({ content: editValue });
    setIsEditing(false);
  };

  return (
    <div className={`w-full h-full flex flex-col rounded border overflow-hidden shadow-xl select-none transition ${
      item.textRole === "callout" 
        ? "bg-[#10131B] border-blue-500/40" 
        : item.textRole === "h1" || item.textRole === "h2"
        ? "bg-[#0A0C10] border-[#1E2536]"
        : "bg-[#0A0C10] border-[#1A1F2C]"
    }`}>
      {/* Header bar */}
      <div className="h-8 bg-[#0E1118] border-b border-[#1A1F2C] px-3 flex items-center justify-between shrink-0 cursor-move">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate tracking-tight">
            {item.title || "Forecaster Reasoning"}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <select
            value={item.textRole}
            onChange={(e) => onUpdate({ textRole: e.target.value as any })}
            className="bg-[#121622] text-slate-300 border border-[#1A1F2C] rounded px-1.5 py-0.5 text-[9px] outline-none"
          >
            <option value="body">Body</option>
            <option value="callout">Callout</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="caption">Caption</option>
          </select>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="p-1 text-emerald-400 hover:bg-[#1A1F2C] rounded transition"
              title="Save text"
            >
              <Check className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
              title="Edit text"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => onUpdate({ isLocked: !item.isLocked })}
            className={`p-1 rounded transition ${item.isLocked ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
            title={item.isLocked ? "Unlock text" : "Lock position"}
          >
            {item.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#1A1F2C] rounded transition"
            title="Duplicate text"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-[#1A1F2C] rounded transition"
            title="Delete text"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Text Content */}
      <div 
        className="flex-1 w-full h-full p-4 overflow-y-auto custom-scrollbar bg-[#080A0E] cursor-text"
        onMouseDown={e => {
          if (isEditing) e.stopPropagation();
        }}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
            className="w-full h-full bg-transparent text-slate-200 font-sans text-xs outline-none resize-none leading-relaxed"
            placeholder="Type meteorological reasoning or analysis notes here..."
          />
        ) : (
          <div className={`prose prose-invert max-w-none text-slate-300 leading-relaxed ${
            item.textRole === "h1" 
              ? "text-xl font-bold text-white tracking-tight" 
              : item.textRole === "h2"
              ? "text-base font-semibold text-slate-100"
              : item.textRole === "caption"
              ? "text-[11px] text-slate-400 font-mono"
              : "text-xs space-y-2 font-normal"
          }`}>
            {item.content.split("\n\n").map((paragraph, idx) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-xs font-bold text-cyan-400 uppercase tracking-wider mt-2 mb-1">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              return (
                <p key={idx} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-5 bg-[#07080B] border-t border-[#141824] px-3 flex items-center justify-between text-[8px] font-mono text-slate-600 shrink-0">
        <span>Click to select · Double-click to edit</span>
        <span>SYNOPTIC LOG</span>
      </div>
    </div>
  );
};
