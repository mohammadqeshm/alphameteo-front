import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  X,
  Maximize2,
  Crop,
  Move,
  Sparkles,
  Loader2,
  Tv,
  Monitor,
  Square,
  Check
} from "lucide-react";
import { SCREENSHOT_PRESETS, ScreenshotDimensions } from "../services/mapScreenshotService";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScreenshotCropperProps {
  isActive: boolean;
  onCancel: () => void;
  onConfirm: (rect: CropRect, targetDimensions?: ScreenshotDimensions | null) => void;
  containerRef: React.RefObject<HTMLElement | null>;
  isCapturing?: boolean;
}

export const ScreenshotCropper: React.FC<ScreenshotCropperProps> = ({
  isActive,
  onCancel,
  onConfirm,
  containerRef,
  isCapturing = false,
}) => {
  const [crop, setCrop] = useState<CropRect>({
    x: 100,
    y: 80,
    width: 640,
    height: 360,
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>("current");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState<CropRect>(crop);

  // Initialize crop centered when activated
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const w = Math.min(bounds.width * 0.85, 720);
    const h = Math.min(bounds.height * 0.85, 405); // 16:9 ratio default
    const x = Math.max(10, Math.round((bounds.width - w) / 2));
    const y = Math.max(10, Math.round((bounds.height - h) / 2));

    setCrop({ x, y, width: w, height: h });
    setSelectedPresetId("current");
  }, [isActive]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const preset = SCREENSHOT_PRESETS.find((p) => p.id === presetId);

    if (preset && preset.width > 0 && preset.height > 0) {
      // Calculate aspect ratio
      const ratio = preset.width / preset.height;
      let targetW = bounds.width * 0.9;
      let targetH = targetW / ratio;

      if (targetH > bounds.height * 0.9) {
        targetH = bounds.height * 0.9;
        targetW = targetH * ratio;
      }

      const x = Math.max(0, Math.round((bounds.width - targetW) / 2));
      const y = Math.max(0, Math.round((bounds.height - targetH) / 2));

      setCrop({
        x,
        y,
        width: Math.round(targetW),
        height: Math.round(targetH),
      });
    }
  };

  const handleFullMap = () => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    setCrop({
      x: 0,
      y: 0,
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    });
  };

  const beginDrag = (clientX: number, clientY: number, handle: string) => {
    if (isCapturing) return;
    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({ x: clientX, y: clientY });
    setInitialCrop(crop);
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    beginDrag(e.clientX, e.clientY, handle);
  };

  const handleTouchStart = (e: React.TouchEvent, handle: string) => {
    e.stopPropagation();
    if (e.touches.length === 0) return;
    beginDrag(e.touches[0].clientX, e.touches[0].clientY, handle);
  };

  useEffect(() => {
    const updateCropFromPoint = (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return;

      const bounds = containerRef.current.getBoundingClientRect();
      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;

      const minW = Math.min(160, Math.max(80, bounds.width * 0.45));
      const minH = Math.min(120, Math.max(80, bounds.height * 0.35));
      const maxW = bounds.width;
      const maxH = bounds.height;

      setCrop(() => {
        let newX = initialCrop.x;
        let newY = initialCrop.y;
        let newW = initialCrop.width;
        let newH = initialCrop.height;

        if (dragHandle === "move") {
          newX = Math.max(0, Math.min(maxW - initialCrop.width, initialCrop.x + dx));
          newY = Math.max(0, Math.min(maxH - initialCrop.height, initialCrop.y + dy));
        } else if (dragHandle === "se") {
          newW = Math.max(minW, Math.min(maxW - initialCrop.x, initialCrop.width + dx));
          newH = Math.max(minH, Math.min(maxH - initialCrop.y, initialCrop.height + dy));
        } else if (dragHandle === "sw") {
          const possibleW = initialCrop.width - dx;
          if (possibleW >= minW && initialCrop.x + dx >= 0) {
            newX = initialCrop.x + dx;
            newW = possibleW;
          }
          newH = Math.max(minH, Math.min(maxH - initialCrop.y, initialCrop.height + dy));
        } else if (dragHandle === "ne") {
          newW = Math.max(minW, Math.min(maxW - initialCrop.x, initialCrop.width + dx));
          const possibleH = initialCrop.height - dy;
          if (possibleH >= minH && initialCrop.y + dy >= 0) {
            newY = initialCrop.y + dy;
            newH = possibleH;
          }
        } else if (dragHandle === "nw") {
          const possibleW = initialCrop.width - dx;
          const possibleH = initialCrop.height - dy;
          if (possibleW >= minW && initialCrop.x + dx >= 0) {
            newX = initialCrop.x + dx;
            newW = possibleW;
          }
          if (possibleH >= minH && initialCrop.y + dy >= 0) {
            newY = initialCrop.y + dy;
            newH = possibleH;
          }
        } else if (dragHandle === "e") {
          newW = Math.max(minW, Math.min(maxW - initialCrop.x, initialCrop.width + dx));
        } else if (dragHandle === "s") {
          newH = Math.max(minH, Math.min(maxH - initialCrop.y, initialCrop.height + dy));
        } else if (dragHandle === "w") {
          const possibleW = initialCrop.width - dx;
          if (possibleW >= minW && initialCrop.x + dx >= 0) {
            newX = initialCrop.x + dx;
            newW = possibleW;
          }
        } else if (dragHandle === "n") {
          const possibleH = initialCrop.height - dy;
          if (possibleH >= minH && initialCrop.y + dy >= 0) {
            newY = initialCrop.y + dy;
            newH = possibleH;
          }
        }

        return { x: newX, y: newY, width: newW, height: newH };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCropFromPoint(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      e.preventDefault();
      updateCropFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      setDragHandle(null);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
      window.addEventListener("touchcancel", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
      window.removeEventListener("touchcancel", handleDragEnd);
    };
  }, [isDragging, dragHandle, dragStart, initialCrop]);

  const handleExecuteCapture = () => {
    const preset = SCREENSHOT_PRESETS.find((p) => p.id === selectedPresetId);
    let targetDimensions: ScreenshotDimensions | null = null;
    if (preset && preset.width > 0 && preset.height > 0) {
      targetDimensions = {
        width: preset.width,
        height: preset.height,
        label: preset.label,
      };
    }
    onConfirm(crop, targetDimensions);
  };

  if (!isActive) return null;

  const currentPreset = SCREENSHOT_PRESETS.find((p) => p.id === selectedPresetId);
  const displayResolution = currentPreset && currentPreset.width > 0
    ? `${currentPreset.width} × ${currentPreset.height} px (${currentPreset.label})`
    : `${Math.round(crop.width)} × ${Math.round(crop.height)} px`;

  return (
    <div className="absolute inset-0 z-50 pointer-events-auto select-none overflow-hidden animate-in fade-in duration-150">
      {/* Darkened backdrop overlay around the crop area */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="crop-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={crop.x}
              y={crop.y}
              width={crop.width}
              height={crop.height}
              fill="black"
              rx="4"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.68)"
          mask="url(#crop-mask)"
        />
      </svg>

      {/* Top Bar: Resolution Presets Selector */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 max-w-[calc(100%-1rem)] overflow-x-auto no-scrollbar bg-[#090C12]/95 backdrop-blur-md border border-blue-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-2xl flex items-center gap-1.5 z-40 text-xs select-none">
        <span className="text-[10.5px] sm:text-[11px] font-bold text-blue-300 ml-1 flex items-center gap-1 whitespace-nowrap shrink-0">
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Output Resolution:</span>
        </span>

        {SCREENSHOT_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              disabled={isCapturing}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-sans transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "bg-[#141824] text-slate-300 hover:text-white hover:bg-slate-800 border border-[#1F2536]"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* The Resizable & Draggable Crop Box */}
      <div
        style={{
          transform: `translate3d(${crop.x}px, ${crop.y}px, 0)`,
          width: `${crop.width}px`,
          height: `${crop.height}px`,
        }}
        className="absolute top-0 left-0 border-2 border-blue-400 rounded shadow-2xl ring-4 ring-blue-500/20 box-border pointer-events-auto cursor-move flex flex-col justify-between touch-none"
        onMouseDown={(e) => handleMouseDown(e, "move")}
        onTouchStart={(e) => handleTouchStart(e, "move")}
      >
        {/* Rule of thirds grid lines inside */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div />
        </div>

        {/* Top Info Banner on Crop Box */}
        <div className="bg-blue-950/85 backdrop-blur-md border-b border-blue-500/30 text-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[10.5px] font-mono flex items-center justify-between gap-2 rounded-t shrink-0">
          <span className="flex items-center gap-1.5 font-bold truncate">
            <Crop className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Selected Screenshot Region</span>
            <span className="sm:hidden">Crop Region</span>
          </span>
          <span className="bg-blue-500/20 px-1.5 sm:px-2 py-0.5 rounded border border-blue-400/30 font-bold text-blue-300 whitespace-nowrap shrink-0">
            {displayResolution}
          </span>
        </div>

        {/* Center Move Indicator */}
        <div className="self-center p-2 rounded-full bg-blue-600/30 border border-blue-400/40 text-white pointer-events-none opacity-80 shadow-lg">
          <Move className="w-4 h-4 text-blue-200" />
        </div>

        {/* Bottom Floating Control Bar */}
        <div
          className="bg-[#0A0D14]/95 backdrop-blur-md border-t border-blue-500/30 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 rounded-b shrink-0 z-30"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] text-slate-400 font-sans hidden md:block">
            Drag corners to resize selection or click Full Map to capture the entire viewport.
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 ml-auto">
            <button
              onClick={handleFullMap}
              disabled={isCapturing}
              className="px-2 sm:px-2.5 py-1.5 bg-[#181D2A] hover:bg-blue-900/40 text-blue-300 hover:text-white rounded-lg text-[10px] sm:text-[10.5px] font-sans transition border border-blue-700/50 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Expand crop box to full map viewport"
            >
              <Maximize2 className="w-3 h-3 text-blue-400" />
              <span>Full Map</span>
            </button>

            <button
              onClick={onCancel}
              disabled={isCapturing}
              className="px-2 sm:px-2.5 py-1.5 bg-[#181D2A] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] sm:text-[10.5px] font-sans transition border border-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <X className="w-3 h-3 text-slate-400" />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleExecuteCapture}
              disabled={isCapturing}
              className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10.5px] sm:text-[11px] font-bold transition shadow-lg shadow-blue-600/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Capture</span>
                  <span className="hidden sm:inline">Capture Screenshot</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Corner Resize Handles */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-blue-500 border-2 border-white rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "nw")}
          onTouchStart={(e) => handleTouchStart(e, "nw")}
        />
        <div
          className="absolute -top-2 -right-2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-blue-500 border-2 border-white rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "ne")}
          onTouchStart={(e) => handleTouchStart(e, "ne")}
        />
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-blue-500 border-2 border-white rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "sw")}
          onTouchStart={(e) => handleTouchStart(e, "sw")}
        />
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-blue-500 border-2 border-white rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "se")}
          onTouchStart={(e) => handleTouchStart(e, "se")}
        />

        {/* Edge Middle Handles */}
        <div
          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-blue-400 border border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "w")}
          onTouchStart={(e) => handleTouchStart(e, "w")}
        />
        <div
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-blue-400 border border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "e")}
          onTouchStart={(e) => handleTouchStart(e, "e")}
        />
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-blue-400 border border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "n")}
          onTouchStart={(e) => handleTouchStart(e, "n")}
        />
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-blue-400 border border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform touch-none"
          onMouseDown={(e) => handleMouseDown(e, "s")}
          onTouchStart={(e) => handleTouchStart(e, "s")}
        />
      </div>
    </div>
  );
};
