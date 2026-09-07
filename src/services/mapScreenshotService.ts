import type { Map as MapLibreInstance } from "maplibre-gl";

export interface ScreenshotDimensions {
  width: number;
  height: number;
  label?: string;
}

export interface ScreenshotCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureMapScreenshotOptions {
  mapInstance: MapLibreInstance | any;
  mapContainer: HTMLElement;
  overlayCanvas?: HTMLCanvasElement | null;
  crop?: ScreenshotCrop | null;
  targetDimensions?: ScreenshotDimensions | null;
  forceOverlayRepaint?: () => void;
  onProgress?: (step: string) => void;
}

export interface ScreenshotResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Standard professional preset resolutions for meteorological exports
 */
export const SCREENSHOT_PRESETS: { id: string; label: string; width: number; height: number; description: string }[] = [
  { id: "current", label: "نمای فعلی (Current)", width: 0, height: 0, description: "رزولوشن متناسب با کادر انتخابی نمایشگر" },
  { id: "fhd", label: "1080p Full HD", width: 1920, height: 1080, description: "1920 × 1080 پیکسل (استاندارد وب و اسلاید)" },
  { id: "qhd", label: "2K QHD", width: 2560, height: 1440, description: "2560 × 1440 پیکسل (کیفیت بسیار بالا)" },
  { id: "uhd", label: "4K Ultra HD", width: 3840, height: 2160, description: "3840 × 2160 پیکسل (چاپ و گزارشات باکیفیت)" },
  { id: "square", label: "1:1 Square HD", width: 1200, height: 1200, description: "1200 × 1200 پیکسل (مناسب شبکه‌های اجتماعی)" },
  { id: "hd", label: "720p HD", width: 1280, height: 720, description: "1280 × 720 پیکسل (حجم بهینه)" }
];

/**
 * Validates that a captured canvas contains visible pixels and is not completely blank/transparent.
 */
export function validateCanvasPixels(canvas: HTMLCanvasElement): boolean {
  if (canvas.width <= 0 || canvas.height <= 0) return false;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const sampleCountX = 16;
  const sampleCountY = 16;
  const stepX = Math.max(1, Math.floor(canvas.width / sampleCountX));
  const stepY = Math.max(1, Math.floor(canvas.height / sampleCountY));

  let nonZeroCount = 0;
  let totalSamples = 0;

  for (let x = 5; x < canvas.width; x += stepX) {
    for (let y = 5; y < canvas.height; y += stepY) {
      totalSamples++;
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        const a = pixel[3];

        // Pixel has non-zero alpha and some color intensity
        if (a > 20 && (r > 5 || g > 5 || b > 5)) {
          nonZeroCount++;
        }
      } catch (err) {
        console.warn("Pixel read exception during validation:", err);
        return true; // Ignore if cross-origin restricts direct pixel inspection
      }
    }
  }

  return nonZeroCount > 0 && (nonZeroCount / Math.max(1, totalSamples)) > 0.05;
}

/**
 * Synchronously grabs an offscreen copy of the MapLibre WebGL canvas
 * directly inside MapLibre's render event hook so that the WebGL drawing buffer
 * is captured at its freshest moment before any browser compositor flush.
 */
function captureWebGLFrame(map: MapLibreInstance, timeoutMs: number = 2000): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    let captured = false;

    const performCapture = () => {
      if (captured) return;
      captured = true;

      try {
        const webglCanvas = map.getCanvas();
        const copy = document.createElement("canvas");
        copy.width = webglCanvas.width;
        copy.height = webglCanvas.height;
        const copyCtx = copy.getContext("2d");
        if (copyCtx) {
          copyCtx.drawImage(webglCanvas, 0, 0);
        }
        resolve(copy);
      } catch (err) {
        console.error("Error creating WebGL canvas copy:", err);
        // Fallback with blank canvas
        const empty = document.createElement("canvas");
        resolve(empty);
      }
    };

    // Attach one-time listener to the synchronous WebGL render event
    map.once("render", () => {
      performCapture();
    });

    // Request immediate map render
    map.triggerRepaint();

    // Fallback safety timeout
    setTimeout(() => {
      if (!captured) {
        performCapture();
      }
    }, timeoutMs);
  });
}

/**
 * Central MapScreenshotService responsible for capturing MapLibre WebGL map + analytical overlays.
 */
export class MapScreenshotService {
  /**
   * Captures a screenshot of the MapLibre map with all active layers and overlays.
   */
  public static async captureMapScreenshot(options: CaptureMapScreenshotOptions): Promise<ScreenshotResult> {
    const {
      mapInstance,
      mapContainer,
      overlayCanvas,
      crop,
      targetDimensions,
      forceOverlayRepaint,
      onProgress
    } = options;

    if (!mapInstance) {
      throw new Error("سرویس نقشه در دسترس نیست.");
    }

    if (!mapContainer) {
      throw new Error("المان نگهدارنده نقشه یافت نشد.");
    }

    onProgress?.("آماده‌سازی لایه‌های نقشه و داده‌های جوی...");

    // 1. Ensure style is loaded
    if (!mapInstance.isStyleLoaded()) {
      await new Promise<void>((res) => {
        if (mapInstance.isStyleLoaded()) res();
        else mapInstance.once("load", () => res());
        setTimeout(res, 1200);
      });
    }

    // 2. Trigger overlay repaint if available
    if (forceOverlayRepaint) {
      forceOverlayRepaint();
    }

    onProgress?.("تصویربرداری همگام از بافر WebGL نقشه پایه...");

    // 3. Capture WebGL frame synchronously inside MapLibre's render event
    let baseMapSnapshot = await captureWebGLFrame(mapInstance, 1500);

    // Validate that the base map actually captured visible content
    let isBaseMapValid = validateCanvasPixels(baseMapSnapshot);

    if (!isBaseMapValid) {
      onProgress?.("دریافت مجدد تایل‌های نقشه و تکمیل فریم گرافیکی...");
      // Secondary pass: wait for tile idle and capture again
      await new Promise<void>((res) => {
        if (mapInstance.areTilesLoaded()) {
          res();
        } else {
          mapInstance.once("idle", () => res());
          setTimeout(res, 1500);
        }
      });

      baseMapSnapshot = await captureWebGLFrame(mapInstance, 2000);
      isBaseMapValid = validateCanvasPixels(baseMapSnapshot);
    }

    // 4. Capture 2D Weather Overlay snapshot
    const overlaySnapshot = document.createElement("canvas");
    if (overlayCanvas && overlayCanvas.width > 0 && overlayCanvas.height > 0) {
      overlaySnapshot.width = overlayCanvas.width;
      overlaySnapshot.height = overlayCanvas.height;
      const oCtx = overlaySnapshot.getContext("2d");
      if (oCtx) {
        oCtx.drawImage(overlayCanvas, 0, 0);
      }
    }

    onProgress?.("برش و تنظیم ابعاد خروجی تصویر...");

    // 5. Compute crop and scaling coordinates
    const containerRect = mapContainer.getBoundingClientRect();
    const containerW = Math.max(1, containerRect.width);
    const containerH = Math.max(1, containerRect.height);

    // Source coordinates on WebGL canvas
    let sx = 0;
    let sy = 0;
    let sw = baseMapSnapshot.width;
    let sh = baseMapSnapshot.height;

    // Source coordinates on Overlay canvas
    let osx = 0;
    let osy = 0;
    let osw = overlaySnapshot.width > 0 ? overlaySnapshot.width : sw;
    let osh = overlaySnapshot.height > 0 ? overlaySnapshot.height : sh;

    if (crop) {
      // Calculate crop relative to container
      const scaleX = baseMapSnapshot.width / containerW;
      const scaleY = baseMapSnapshot.height / containerH;

      sx = Math.max(0, Math.min(baseMapSnapshot.width - 1, crop.x * scaleX));
      sy = Math.max(0, Math.min(baseMapSnapshot.height - 1, crop.y * scaleY));
      sw = Math.max(1, Math.min(baseMapSnapshot.width - sx, crop.width * scaleX));
      sh = Math.max(1, Math.min(baseMapSnapshot.height - sy, crop.height * scaleY));

      if (overlaySnapshot.width > 0 && overlaySnapshot.height > 0) {
        const oScaleX = overlaySnapshot.width / containerW;
        const oScaleY = overlaySnapshot.height / containerH;

        osx = Math.max(0, Math.min(overlaySnapshot.width - 1, crop.x * oScaleX));
        osy = Math.max(0, Math.min(overlaySnapshot.height - 1, crop.y * oScaleY));
        osw = Math.max(1, Math.min(overlaySnapshot.width - osx, crop.width * oScaleX));
        osh = Math.max(1, Math.min(overlaySnapshot.height - osy, crop.height * oScaleY));
      }
    }

    // Determine final output dimensions
    let outW = Math.round(sw);
    let outH = Math.round(sh);

    if (targetDimensions && targetDimensions.width > 0 && targetDimensions.height > 0) {
      outW = targetDimensions.width;
      outH = targetDimensions.height;
    }

    // Ensure dimensions are positive
    outW = Math.max(10, outW);
    outH = Math.max(10, outH);

    // 6. Create final composite canvas
    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = outW;
    compositeCanvas.height = outH;
    const ctx = compositeCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("خطا در ایجاد کانتکست گرافیکی ۲ بعدی.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill background base color
    ctx.fillStyle = "#0A0B10";
    ctx.fillRect(0, 0, outW, outH);

    // Layer 1: Draw base map
    if (baseMapSnapshot.width > 0 && baseMapSnapshot.height > 0) {
      ctx.drawImage(baseMapSnapshot, sx, sy, sw, sh, 0, 0, outW, outH);
    }

    // Layer 2: Draw meteorological and GIS overlay
    if (overlaySnapshot.width > 0 && overlaySnapshot.height > 0) {
      ctx.drawImage(overlaySnapshot, osx, osy, osw, osh, 0, 0, outW, outH);
    }

    onProgress?.("تولید فایل نهایی و کپی در حافظه...");

    // 7. Convert composite canvas to PNG Blob and Data URL
    const blob = await new Promise<Blob>((resolve, reject) => {
      compositeCanvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("خطا در تبدیل تصویر نهایی به فرمت PNG."));
      }, "image/png");
    });

    const dataUrl = compositeCanvas.toDataURL("image/png");

    return {
      blob,
      dataUrl,
      width: outW,
      height: outH
    };
  }
}
