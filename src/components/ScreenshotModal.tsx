import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Download,
  PenTool,
  RotateCcw,
  Layers,
  Palette,
  Info,
  Maximize2,
  Check,
  FileImage,
  Sun,
  Eye,
  EyeOff
} from "lucide-react";
import { Coordinate, ActiveLayer, WeatherForecast, WeatherLayer } from "../types";

export interface ScreenshotMetadata {
  locationName: string;
  coords: Coordinate;
  activeLayer: WeatherLayer;
  forecastStep: number;
  dateStr: string;
  forecast?: WeatherForecast | null;
  activeLayers?: ActiveLayer[];
}

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  capturedImage: string | null;
  metadata: ScreenshotMetadata;
}

type OutputFormat = "png" | "jpeg" | "webp";

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  isOpen,
  onClose,
  capturedImage,
  metadata,
}) => {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState<number>(95);
  const [includeLegendOverlay, setIncludeLegendOverlay] = useState<boolean>(true);
  const [includeMetadataBanner, setIncludeMetadataBanner] = useState<boolean>(true);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#EF4444"); // Red default
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawings, setHasDrawings] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  // Load and draw base image onto canvas whenever capturedImage or overlay options change
  useEffect(() => {
    if (!isOpen || !capturedImage) return;

    const img = new Image();
    if (!capturedImage.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      baseImageRef.current = img;
      redrawFullCanvas();
    };

    img.onerror = (err) => {
      console.error("Screenshot image failed to load:", err);
    };

    img.src = capturedImage;

    // In case image loads synchronously from data URL
    if (img.complete && img.naturalWidth > 0) {
      baseImageRef.current = img;
      redrawFullCanvas();
    }
  }, [isOpen, capturedImage, includeLegendOverlay, includeMetadataBanner]);

  const redrawFullCanvas = () => {
    const canvas = canvasRef.current;
    const img = baseImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Draw main screenshot image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw Info / Metadata Overlay Banner at the bottom if enabled
    if (includeMetadataBanner) {
      const bannerHeight = Math.max(55, Math.round(canvas.height * 0.08));
      const bannerY = canvas.height - bannerHeight;

      // Dark translucent backdrop
      ctx.fillStyle = "rgba(7, 9, 13, 0.88)";
      ctx.fillRect(0, bannerY, canvas.width, bannerHeight);

      // Subtle top border line
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, bannerY);
      ctx.lineTo(canvas.width, bannerY);
      ctx.stroke();

      // Brand text on Left
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(bannerHeight * 0.28)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("ALPHA METEO WORKSTATION", 20, bannerY + bannerHeight * 0.35);

      ctx.fillStyle = "#94A3B8";
      ctx.font = `${Math.round(bannerHeight * 0.22)}px monospace`;
      ctx.fillText(
        `LOC: ${metadata.locationName} (${metadata.coords.lat.toFixed(3)}°N, ${metadata.coords.lon.toFixed(3)}°E) | STEP: +${metadata.forecastStep}h`,
        20,
        bannerY + bannerHeight * 0.72
      );

      // Layer & Date on Right
      ctx.textAlign = "right";
      ctx.fillStyle = "#60A5FA";
      ctx.font = `bold ${Math.round(bannerHeight * 0.26)}px sans-serif`;
      ctx.fillText(`LAYER: ${metadata.activeLayer.name.toUpperCase()}`, canvas.width - 20, bannerY + bannerHeight * 0.35);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = `${Math.round(bannerHeight * 0.22)}px sans-serif`;
      ctx.fillText(`${metadata.dateStr}`, canvas.width - 20, bannerY + bannerHeight * 0.72);
    }

    // Draw Weather Legend Bar if enabled
    if (includeLegendOverlay) {
      const legendW = Math.min(320, canvas.width * 0.35);
      const legendH = 26;
      const legendX = 20;
      const legendY = includeMetadataBanner
        ? canvas.height - Math.max(55, Math.round(canvas.height * 0.08)) - 38
        : canvas.height - 40;

      // Legend box background
      ctx.fillStyle = "rgba(11, 14, 20, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.roundRect ? ctx.roundRect(legendX - 6, legendY - 6, legendW + 12, legendH + 12, 6) : ctx.rect(legendX - 6, legendY - 6, legendW + 12, legendH + 12);
      ctx.fill();
      ctx.stroke();

      // Legend gradient bar
      const grad = ctx.createLinearGradient(legendX, 0, legendX + legendW, 0);
      if (metadata.activeLayer.id === "temperature") {
        grad.addColorStop(0, "#3b82f6");
        grad.addColorStop(0.25, "#06b6d4");
        grad.addColorStop(0.5, "#10b981");
        grad.addColorStop(0.75, "#eab308");
        grad.addColorStop(1, "#ef4444");
      } else if (metadata.activeLayer.id === "wind") {
        grad.addColorStop(0, "#e2e8f0");
        grad.addColorStop(0.3, "#38bdf8");
        grad.addColorStop(0.7, "#6366f1");
        grad.addColorStop(1, "#ec4899");
      } else if (metadata.activeLayer.id === "precipitation") {
        grad.addColorStop(0, "#f8fafc");
        grad.addColorStop(0.3, "#60a5fa");
        grad.addColorStop(0.7, "#2563eb");
        grad.addColorStop(1, "#7c3aed");
      } else {
        grad.addColorStop(0, "#1e293b");
        grad.addColorStop(0.5, "#64748b");
        grad.addColorStop(1, "#f8fafc");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(legendX, legendY + 12, legendW, 8);

      // Labels
      ctx.fillStyle = "#F1F5F9";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${metadata.activeLayer.min} ${metadata.activeLayer.unit}`, legendX, legendY + 8);
      ctx.textAlign = "right";
      ctx.fillText(`${metadata.activeLayer.max} ${metadata.activeLayer.unit}`, legendX + legendW, legendY + 8);
      ctx.textAlign = "center";
      ctx.fillText(`${metadata.activeLayer.name}`, legendX + legendW / 2, legendY + 8);
    }
  };

  // Canvas Drawing Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize * (canvas.width / 800);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
    setHasDrawings(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleResetDrawings = () => {
    redrawFullCanvas();
    setHasDrawings(false);
  };

  // Download export
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mimeType = "image/png";
    let extension = "png";
    if (outputFormat === "jpeg") {
      mimeType = "image/jpeg";
      extension = "jpg";
    } else if (outputFormat === "webp") {
      mimeType = "image/webp";
      extension = "webp";
    }

    const dataUrl = canvas.toDataURL(mimeType, quality / 100);
    const link = document.createElement("a");
    const safeLoc = metadata.locationName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 20);
    link.download = `AlphaMeteo_${safeLoc}_${metadata.activeLayer.id}_step${metadata.forecastStep}h.${extension}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B0D13] border border-[#1E2330] rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 bg-[#0E1118] border-b border-[#1A1F2C] px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>پیش‌نمایش و خروجی اسکرین‌شات باکیفیت</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/20 font-mono font-bold">
                  {canvasRef.current ? `${canvasRef.current.width} × ${canvasRef.current.height} px` : "HD Capture"}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {metadata.locationName} • {metadata.activeLayer.name} (+{metadata.forecastStep}h)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-[#1E2330]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Left: Toolbar / Controls, Right: Live Canvas Preview) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Canvas Preview Area */}
          <div className="flex-1 bg-[#040507] p-4 flex items-center justify-center overflow-auto relative select-none">
            <div className="relative max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden border border-[#1E2330] shadow-2xl bg-black">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`max-w-full max-h-[70vh] object-contain ${
                  drawingMode ? "cursor-crosshair" : "cursor-default"
                }`}
              />
            </div>
          </div>

          {/* Right/Side Settings & Tools Panel */}
          <div className="w-full md:w-80 bg-[#0A0C12] border-t md:border-t-0 md:border-l border-[#1A1F2C] p-4 flex flex-col justify-between shrink-0 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {/* Drawing Tools Toolset */}
              <div className="bg-[#10131C] border border-[#1A1F2C] rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-400" />
                    <span>قلم و علامت‌گذاری روی نقشه</span>
                  </span>
                  <button
                    onClick={() => setDrawingMode(!drawingMode)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      drawingMode
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-[#181C28] text-slate-400 hover:text-white border border-[#222736]"
                    }`}
                  >
                    {drawingMode ? "قلم فعال" : "فعال‌سازی قلم"}
                  </button>
                </div>

                {drawingMode && (
                  <div className="space-y-2.5 pt-1 animate-in fade-in">
                    {/* Color selection */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">رنگ قلم:</span>
                      <div className="flex items-center space-x-1.5">
                        {["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#FFFFFF"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setBrushColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-5 h-5 rounded-full transition transform ${
                              brushColor === c ? "scale-125 ring-2 ring-white" : "opacity-75 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Brush Size Slider */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">ضخامت:</span>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-28 accent-blue-500"
                      />
                      <span className="text-[10px] font-mono text-slate-300">{brushSize}px</span>
                    </div>

                    {hasDrawings && (
                      <button
                        onClick={handleResetDrawings}
                        className="w-full py-1 rounded bg-[#181C28] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-[#222736] hover:border-red-500/30 text-[10px] transition flex items-center justify-center gap-1 font-sans"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>پاک کردن رسم‌ها</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Overlays / Metadata Layer Toggles */}
              <div className="bg-[#10131C] border border-[#1A1F2C] rounded-xl p-3 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>لایه‌ها و راهنمای اطلاعات</span>
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded bg-[#151924] hover:bg-[#1A1E2C] border border-[#202534] cursor-pointer transition">
                    <span className="text-[10.5px] text-slate-300">نوار بنر مشخصات و موقعیت</span>
                    <input
                      type="checkbox"
                      checked={includeMetadataBanner}
                      onChange={(e) => setIncludeMetadataBanner(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded bg-[#151924] hover:bg-[#1A1E2C] border border-[#202534] cursor-pointer transition">
                    <span className="text-[10.5px] text-slate-300">راهنمای رنگی و مقیاس لایه (Legend)</span>
                    <input
                      type="checkbox"
                      checked={includeLegendOverlay}
                      onChange={(e) => setIncludeLegendOverlay(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Export Format & Quality */}
              <div className="bg-[#10131C] border border-[#1A1F2C] rounded-xl p-3 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-amber-400" />
                  <span>فرمت و کیفیت خروجی</span>
                </span>

                <div className="grid grid-cols-3 gap-1.5">
                  {(["png", "jpeg", "webp"] as OutputFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`py-1.5 rounded text-[10.5px] font-mono font-bold uppercase transition border ${
                        outputFormat === fmt
                          ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                          : "bg-[#151924] border-[#202534] text-slate-400 hover:text-white"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                {outputFormat !== "png" && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">کیفیت فشرده‌سازی:</span>
                    <input
                      type="range"
                      min="60"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-24 accent-blue-500"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{quality}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2 border-t border-[#1A1F2C]">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Download className="w-4 h-4" />
                <span>دانلود تصویر خروجی ({outputFormat.toUpperCase()})</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-1.5 bg-[#141824] hover:bg-[#1C2130] text-slate-400 hover:text-white text-[11px] rounded-lg transition border border-[#1E2330]"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
