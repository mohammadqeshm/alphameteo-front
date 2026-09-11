import React, { useState, useEffect, useRef } from "react";
import { Coordinate, WeatherLayer, ChatMessage, ActivePanel, ToolbarTool, DrawingItem, WeatherForecast, ActiveLayer, SplitLayoutMode, MapPaneState } from "./types";
import { WEATHER_LAYERS, METEOROLOGICAL_STATIONS } from "./data";
import {
  DATA_SOURCES,
  WEATHER_VARIABLES,
  VERTICAL_LEVELS,
  COLOR_PALETTES,
  VISUALIZATION_OPTIONS
} from "./data/meteoCatalog";
import { MeteoMap } from "./components/MeteoMap";
import { processClientAgentFallbackAsync } from "./utils/naturalAgent";
import { SidebarLayers } from "./components/SidebarLayers";
import { LayerManagementPanel } from "./components/LayerPanel/LayerManagementPanel";
import { LayerSettingsPanel } from "./components/LayerPanel/LayerSettingsPanel";
import { SidebarChat } from "./components/SidebarChat";
import { ActiveLayerSettings } from "./components/ActiveLayerSettings";
import { SidebarNotes } from "./components/SidebarNotes";
import { SidebarNews } from "./components/SidebarNews";
import { SplitControls } from "./components/SplitControls";
import { ScreenshotCropper, CropRect } from "./components/ScreenshotCropper";
import { ScreenshotModal, ScreenshotMetadata } from "./components/ScreenshotModal";
import { MapScreenshotService, ScreenshotDimensions } from "./services/mapScreenshotService";
// @ts-ignore
import brandLogo from "./assets/images/alpha_meteo_logo_1784052061482.png";

// Lucide Icons
import {
  Search,
  Star,
  Play,
  Pause,
  Download,
  Bell,
  CircleHelp,
  ArrowUpRight,
  Plus,
  Trash2,
  Camera,
  Share2,
  MapPin,
  Settings as GearIcon,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  Info,
  X,
  Thermometer,
  Wind,
  Gauge,
  CloudRain,
  Cloud,
  Droplets,
  Waves,
  TriangleAlert,
  ChartLine,
  Database,
  Sparkles,
  Bot,
  Minimize2,
  Maximize2,
  Layers,
  MousePointer,
  Ruler,
  Compass,
  Square,
  Circle,
  Box,
  Type,
  Pencil,
  Eraser,
  Bookmark,
  FileText,
  NotebookPen,
  Newspaper,
  User,
  Loader2,
  AlertTriangle,
  SlidersHorizontal,
  Sliders,
  Menu,
  Columns2,
  Grid2x2,
  LayoutGrid,
  Link2,
  Unlink,
  Calendar,
  Clock,
  Zap,
  RefreshCw
} from "lucide-react";
import { eumetsatMtgService, MTGLITelemetryStats } from "./services/eumetsatMtgService";

// Client-side Mock Weather Generator for pure frontend demonstration
function generateClientMockWeather(lat: number, lon: number, timeOffset: number) {
  const seed = Math.sin(lat) * Math.cos(lon);
  const hash = (val: number) => {
    const x = Math.sin(seed + val) * 10000;
    return x - Math.floor(x);
  };

  const baseTemp = 32 - Math.abs(lat) * 0.6;
  const tempDiurnal = Math.sin((timeOffset / 24) * 2 * Math.PI - Math.PI / 2) * 6;
  const localSeed = hash(1);
  const finalTemp = Math.round((baseTemp + tempDiurnal + (localSeed * 10 - 5)) * 10) / 10;

  const baseWind = 3 + Math.abs(Math.sin(lat * (Math.PI / 45))) * 12;
  const finalWind = Math.round((baseWind + hash(2) * 8) * 10) / 10;
  const windDirection = Math.round(hash(3) * 360);

  const basePressure = 1013.25 + (Math.sin(lat * 0.1) * 15);
  const finalPressure = Math.round((basePressure + (hash(4) * 10 - 5)) * 10) / 10;

  const basePrecip = Math.abs(lat) < 10 ? 4.5 : (Math.abs(lat) > 20 && Math.abs(lat) < 35 ? 0.1 : 1.2);
  const finalPrecip = Math.round((basePrecip * hash(5) * 5) * 10) / 10;

  const cloudCover = Math.round(hash(6) * 100);

  const baseHumidity = 50 + (Math.sin(lat * 0.2) * 20);
  const finalHumidity = Math.min(100, Math.max(10, Math.round(baseHumidity + (hash(7) * 30 - 15))));

  const waveHeight = Math.round((0.5 + (finalWind * 0.15) + hash(8) * 2) * 10) / 10;

  const elevation = Math.round(Math.abs(Math.sin(lat * 2) * Math.cos(lon * 3)) * 2400 + Math.abs(hash(9)) * 120);

  return {
    location: {
      lat,
      lon,
      elevation,
    },
    forecast: {
      temperature: finalTemp,
      windSpeed: finalWind,
      windDirection,
      pressure: finalPressure,
      precipitation: finalPrecip,
      clouds: cloudCover,
      humidity: finalHumidity,
      waves: waveHeight,
    }
  };
}

// Helper to format dynamic dates starting from today based on hour offset
function formatForecastDate(hourOffset: number, options: { includeYear?: boolean; onlyDate?: boolean; isShort?: boolean } = {}) {
  const date = new Date();
  date.setHours(date.getHours() + hourOffset);
  
  if (options.onlyDate) {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: options.isShort ? "short" : "long",
      year: options.includeYear ? "numeric" : undefined
    });
  }
  
  const dateStr = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: options.isShort ? "short" : "long",
    year: options.includeYear ? "numeric" : undefined
  });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes} (+${hourOffset}h)`;
}

// Client-side Mock AI Analysis Generator for pure frontend demonstration
function generateMockAnalysis(coords: Coordinate, weather: WeatherForecast) {
  const isHighElev = coords.elevation > 1500;
  return `[GFS INFERENCE MODEL 0.25° RESEARCH BRIEF]

1. BAROCLINIC PROFILE & TURBULENCE ASSESSMENT:
At coordinates ${coords.lat.toFixed(4)}°N, ${coords.lon.toFixed(4)}°E and elevation ${coords.elevation}m, the atmospheric column demonstrates stable geostrophic conditions with a surface pressure of ${weather.pressure} hPa. Ground-level boundary friction indicates a velocity of ${weather.windSpeed} m/s originating from a heading vector of ${weather.windDirection}°. ${isHighElev ? "Orographic barrier friction at this high altitude induces minor mountain turbulence wave formations in low-level flight sectors." : "Boundary-layer shear stresses are quiet, representing optimal conditions with negligible friction velocity."}

2. THERMODYNAMIC & MOISTURE GRADIENTS:
Relative humidity levels are stabilized at ${weather.humidity}%, with precipitable moisture accumulation estimates at ${weather.precipitation} mm. The active 2-meter air temperature is ${weather.temperature} °C, displaying a consistent diurnal trend aligned with the 00Z model run. Total cloud cover is ${weather.clouds}%, consisting primarily of stable stratified cloud bands at the mid-to-lower tropospheric interface.

3. CONVECTIVE TRIGGERS & REGIONAL FORECAST:
Thermodynamic stability is high across the sector with negligible Convective Available Potential Energy (CAPE) buildup. Wave friction heights of ${weather.waves}m are forecast in nearby marine tracks. Operators are advised to monitor upper isobaric charts for any minor jet stream instabilities or moisture convergence vectors in the evening steps.`;
}

// Client-side Mock AI Chat Simulator
function generateMockChatResponse(userMessage: string, coords: Coordinate, weather: WeatherForecast | null) {
  const msg = userMessage.toLowerCase();
  const isPersian = /[\u0600-\u06FF]/.test(userMessage);

  if (isPersian) {
    if (msg.includes("دما") || msg.includes("گرما") || msg.includes("سرما") || msg.includes("دمای")) {
      return `سلام همکار گرامی. بر اساس تحلیل مدل GFS 0.25° برای موقعیت جغرافیایی فعال شما (${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E):

۱. **تحلیل ترمودینامیکی**: دمای شبیه‌سازی شده در ارتفاع ۲ متری سطح زمین در حال حاضر برابر با **${weather?.temperature ?? 22} درجه سانتی‌گراد** است.
۲. **تغییرات روزانه (Diurnal)**: به دلیل ارتفاع منطقه (${coords.elevation} متر)، تغییرات دمایی تحت پدیده‌های سرمایش تابشی شبانه کوهستانی منظم است.
۳. **وضعیت رطوبتی**: با رطوبت نسبی ${weather?.humidity ?? 60}٪، نقطه شبنم در محدوده پایدار و غیرهمرفتی قرار دارد.

آیا تحلیل ترازهای باد یا فشار هوا در این نقطه را لازم دارید؟`;
    }

    if (msg.includes("باد") || msg.includes("طوفان") || msg.includes("وزش")) {
      return `تحلیل جریانات باد سینوپتیکی برای مختصات انتخاب شده شما:

۱. **سرعت و جهت**: باد در تراز استاندارد ۱۰ متری زمین با سرعت **${weather?.windSpeed ?? 5} متر بر ثانیه** و از جهت **${weather?.windDirection ?? 180} درجه** برآورد شده است.
۲. **گرادیان فشار**: فشار جوی در حدود **${weather?.pressure ?? 1013} هکتوپاسکال** است که گرادیان ملایمی در دشت‌های مجاور ایجاد می‌کند.
۳. **اثرات موج**: شبیه‌سازی امواج برای مناطق دریایی ارتفاع شاخص **${weather?.waves ?? 1.2} متر** را نشان می‌دهد.

با استفاده از منوی ترسیم در سمت چپ (GIS Tools) می‌توانید حوزه‌های تحت تأثیر باد شدید را به صورت دایره یا مستطیل علامت‌گذاری کنید.`;
    }

    if (msg.includes("باران") || msg.includes("بارش") || msg.includes("ابر") || msg.includes("بارندگی")) {
      return `ارزیابی پوشش ابر و پتانسیل بارش مدل GFS:

۱. **پوشش کلی ابر**: در حال حاضر پوشش ابر در این منطقه حدود **${weather?.clouds ?? 40}٪** تخمین زده می‌شود (بیشتر از نوع آلتوکومولوس میانی).
۲. **حجم بارش**: میزان تجمع بارندگی برابر با **${weather?.precipitation ?? 0} میلی‌متر** مدل‌سازی شده است که نشان‌دهنده هوایی پایدار در این گام زمانی است.
۳. **رطوبت نسبی جو**: این شاخص در مقدار **${weather?.humidity ?? 55}٪** قرار دارد که شرایط همگرایی مرطوب شدید را ایجاد نمی‌کند.

تغییرات ناگهانی دما در گام‌های زمانی بعدی را پایش کنید تا هرگونه روند صعودی همرفتی را شناسایی نمایید.`;
    }

    return `به ایستگاه هوش مصنوعی پیشرفته Alpha Meteo خوش آمدید. من دستیار سینوپتیک و پایش اتمسفر شما هستم.

در حال حاضر نقطه تمرکز شما روی نقشه دارای مشخصات زیر است:
- **مختصات جغرافیایی**: عرض ${coords.lat.toFixed(4)}° شمالی / طول ${coords.lon.toFixed(4)}° شرقی
- **ارتفاع از سطح دریا**: ${coords.elevation} متر
- **دمای اتمسفر (۲ متر)**: ${weather?.temperature ?? 15} درجه سانتی‌گراد
- **فشار اتمسفر**: ${weather?.pressure ?? 1013} hPa

کلیک روی نقاط مختلف نقشه فوراً داده‌های هواشناسی و ترازهای GFS را برای آن عرض و طول جغرافیایی شبیه‌سازی می‌کند. چه فاکتور هواشناسی دیگری را پایش کنیم؟`;
  } else {
    if (msg.includes("temp") || msg.includes("heat") || msg.includes("cold") || msg.includes("warm")) {
      return `Meteorological thermal assessment for your focused position (${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E):

1. **Surface Temperature**: Simulated at **${weather?.temperature ?? 20} °C** (2-meter level GFS estimation).
2. **Diurnal Cycle**: Expect moderate solar heating fluxes peaking in steps +12h to +18h, moderated by local elevation friction (${coords.elevation}m).
3. **Relative Humidity**: Current moisture saturation is at **${weather?.humidity ?? 60}%**, keeping dew points well below convective thresholds.

Would you like to analyze atmospheric soundings or isobaric wind contours for this coordinate?`;
    }

    if (msg.includes("wind") || msg.includes("storm") || msg.includes("gale") || msg.includes("gust")) {
      return `Atmospheric fluid dynamic and kinetic vector assessment:

1. **Velocity**: Calculated at **${weather?.windSpeed ?? 6} m/s** at a standard 10-meter measurement level.
2. **Heading Vector**: Aligning to a compass angle of **${weather?.windDirection ?? 240}°**.
3. **Baroclinic Shear**: The local sector exhibits stable geostrophic balance with minor wind shear, translating to a significant wave height estimate of **${weather?.waves ?? 1.5}m** in oceanic zones.

Utilize the Left Ruler tool to measure distance from the focused coordinates to regional pressure centers.`;
    }

    if (msg.includes("rain") || msg.includes("precip") || msg.includes("cloud") || msg.includes("snow")) {
      return `Atmospheric moisture and precipitation profiling:

1. **Total Precipitation**: Active GFS step models **${weather?.precipitation ?? 0} mm** of accumulated precipitation.
2. **Cloud Coverage**: Currently estimated at **${weather?.clouds ?? 50}%** cover, predominantly mid-altitude altocumulus.
3. **Saturation Index**: Relative Humidity is **${weather?.humidity ?? 55}%**, indicating moderate moisture convergence in the lower planetary boundary layer.

If low-level convergence combines with a fall in surface pressure, expect localized stratiform developments.`;
    }

    return `Welcome back, Meteorologist. This is Alpha Meteo's Clinical Intelligence Core.

Active GFS 0.25° Grid Coords:
- **Latitude**: ${coords.lat.toFixed(4)}° N
- **Longitude**: ${coords.lon.toFixed(4)}° E
- **Elevation**: ${coords.elevation} m
- **Surface Pressure**: ${weather?.pressure ?? 1013} hPa

You can click anywhere on the MapLibre viewport to update the live meteorological telemetry card, trigger a Clinical AI Atmospheric Briefing, or use the left toolbar to draw custom alert zones. How can I assist your analysis today?`;
  }
}

const DEFAULT_PANES: MapPaneState[] = [
  {
    id: "pane_1",
    title: "Map 1",
    activeLayer: WEATHER_LAYERS[0], // Clean Base Map
    layerOpacity: 0,
    minVal: 0,
    maxVal: 100,
    colorScaleName: "Thermal",
    visualizationStyle: "continuous",
    activeLayers: [],
    coords: { lat: 35.6892, lon: 51.3890, elevation: 1137 }
  },
  {
    id: "pane_2",
    title: "Map 2",
    activeLayer: WEATHER_LAYERS[1] || WEATHER_LAYERS[0], // Wind Speed
    layerOpacity: 85,
    minVal: (WEATHER_LAYERS[1] || WEATHER_LAYERS[0])?.min ?? 0,
    maxVal: (WEATHER_LAYERS[1] || WEATHER_LAYERS[0])?.max ?? 60,
    colorScaleName: "Wind",
    visualizationStyle: "continuous",
    activeLayers: [],
    coords: { lat: 35.6892, lon: 51.3890, elevation: 1137 }
  },
  {
    id: "pane_3",
    title: "Map 3",
    activeLayer: WEATHER_LAYERS[3] || WEATHER_LAYERS[0], // Precipitation Rate
    layerOpacity: 85,
    minVal: (WEATHER_LAYERS[3] || WEATHER_LAYERS[0])?.min ?? 0,
    maxVal: (WEATHER_LAYERS[3] || WEATHER_LAYERS[0])?.max ?? 100,
    colorScaleName: "Ocean",
    visualizationStyle: "continuous",
    activeLayers: [],
    coords: { lat: 35.6892, lon: 51.3890, elevation: 1137 }
  },
  {
    id: "pane_4",
    title: "Map 4",
    activeLayer: WEATHER_LAYERS[2] || WEATHER_LAYERS[0], // Pressure
    layerOpacity: 85,
    minVal: (WEATHER_LAYERS[2] || WEATHER_LAYERS[0])?.min ?? 950,
    maxVal: (WEATHER_LAYERS[2] || WEATHER_LAYERS[0])?.max ?? 1050,
    colorScaleName: "Pressure",
    visualizationStyle: "continuous",
    activeLayers: [],
    coords: { lat: 35.6892, lon: 51.3890, elevation: 1137 }
  }
];

export default function App() {
  // 1. Core State
  const [currentCoords, setCurrentCoords] = useState<Coordinate>({
    lat: 35.6892,
    lon: 51.3890,
    elevation: 1137,
  });
  const [hoverCoords, setHoverCoords] = useState<Coordinate | null>(null);
  const [mapLocked, setMapLocked] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>("Tehran, Iran");
  const [precipitationViewMode, setPrecipitationViewMode] = useState<"pixelated" | "gradient" | "contour">("gradient");
  const [precipitationColorTheme, setPrecipitationColorTheme] = useState<"ocean" | "fire" | "toxic" | "magma">("ocean");
  const [heatmapRadius, setHeatmapRadius] = useState<number>(3.5);

  // Split Screen Multi-Map State
  const [splitLayout, setSplitLayout] = useState<SplitLayoutMode>("single");
  const [activePaneIndex, setActivePaneIndex] = useState<number>(0);
  const [syncCoords, setSyncCoords] = useState<boolean>(true);
  const [panes, setPanes] = useState<MapPaneState[]>(DEFAULT_PANES);

  // Active Pane Getters
  const activePane = panes[activePaneIndex] || panes[0];
  const activeLayer = activePane.activeLayer;
  const layerOpacity = activePane.layerOpacity;
  const minVal = activePane.minVal;
  const maxVal = activePane.maxVal;
  const colorScaleName = activePane.colorScaleName;
  const visualizationStyle = activePane.visualizationStyle;
  const activeLayers = activePane.activeLayers;

  // Active Pane Setters
  const setActiveLayer = (layer: WeatherLayer) => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, activeLayer: layer, minVal: layer?.min ?? -30, maxVal: layer?.max ?? 40 } : p));
  };

  const handleSetActiveLayerForPane = (paneIndex: number, layer: WeatherLayer) => {
    setPanes(prev => prev.map((p, idx) => idx === paneIndex ? { ...p, activeLayer: layer, minVal: layer?.min ?? -30, maxVal: layer?.max ?? 40 } : p));
  };

  const setLayerOpacity = (val: number | ((prev: number) => number)) => {
    setPanes(prev => prev.map((p, idx) => {
      if (idx === activePaneIndex) {
        const nextVal = typeof val === 'function' ? val(p.layerOpacity) : val;
        return { ...p, layerOpacity: nextVal };
      }
      return p;
    }));
  };

  const setMinVal = (val: number) => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, minVal: val } : p));
  };

  const setMaxVal = (val: number) => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, maxVal: val } : p));
  };

  const setColorScaleName = (name: string) => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, colorScaleName: name } : p));
  };

  const setVisualizationStyle = (style: "raw_pixel" | "discrete" | "continuous") => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, visualizationStyle: style } : p));
  };

  const handleAddActiveLayer = (newLayer: ActiveLayer) => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, activeLayers: [newLayer, ...p.activeLayers] } : p));
  };

  const handleUpdateActiveLayer = (updatedLayer: ActiveLayer) => {
    setPanes(prev => prev.map((p, idx) => {
      if (idx === activePaneIndex) {
        return {
          ...p,
          activeLayers: p.activeLayers.map(l => l.instanceId === updatedLayer.instanceId ? updatedLayer : l)
        };
      }
      return p;
    }));
  };

  const handleRemoveActiveLayer = (instanceId: string) => {
    setPanes(prev => prev.map((p, idx) => {
      if (idx === activePaneIndex) {
        return {
          ...p,
          activeLayers: p.activeLayers.filter(l => l.instanceId !== instanceId)
        };
      }
      return p;
    }));
  };

  const handleDuplicateActiveLayer = (layer: ActiveLayer) => {
    const dup: ActiveLayer = {
      ...layer,
      instanceId: `layer_${layer.sourceId}_${layer.variableId}_dup_${Date.now()}`,
      customLabel: `${layer.customLabel || layer.variableName} (Copy)`,
      dateCreated: Date.now()
    };
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, activeLayers: [dup, ...p.activeLayers] } : p));
  };

  const handleReorderActiveLayers = (reordered: ActiveLayer[]) => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, activeLayers: reordered } : p));
  };

  const handleClearAllActiveLayers = () => {
    setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? { ...p, activeLayers: [] } : p));
  };

  // Check if lightning layer is active in current active pane
  const isLightningActive = 
    activeLayer?.id === "lightning" || 
    activeLayer?.id === "satellite_lightning" || 
    activeLayer?.id === "eumetsat_mtg_li" ||
    activeLayer?.id === "mtg_li_lightning" ||
    (activeLayer as any)?.variableId === "mtg_li_lightning" ||
    Boolean(activeLayers?.some(l => l.sourceId === "eumetsat_mtg_li" || l.variableId === "mtg_li_lightning" || (l as any).id === "lightning" || (l as any).id === "satellite_lightning"));

  const [lightningStats, setLightningStats] = useState<MTGLITelemetryStats | null>(null);
  const [lightningTimeFilter, setLightningTimeFilter] = useState<"all" | "15m" | "5m" | "2m">("all");
  const [liveClock, setLiveClock] = useState<Date>(new Date());

  // Real-time ticking clock for exact date and time with second-level precision
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setLiveClock(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Subscribe to live MTG-LI telemetry
  useEffect(() => {
    eumetsatMtgService.startLiveStream();
    const unsub = eumetsatMtgService.subscribe((payload) => {
      if (payload?.stats) {
        setLightningStats(payload.stats);
      }
    });
    return () => unsub();
  }, []);

  // Extract exact date & time directly provided by the satellite API engine
  const apiDateShamsi = lightningStats?.apiDateShamsi || (lightningStats?.apiTimestamp ? new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    dateStyle: 'full',
    timeZone: 'Asia/Tehran'
  }).format(new Date(lightningStats.apiTimestamp)) : new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(liveClock));

  const apiDateGregorian = lightningStats?.apiDateGregorian || (lightningStats?.apiTimestamp ? new Date(lightningStats.apiTimestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }) : liveClock.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }));

  const apiTimeUtc = lightningStats?.apiTimeUtc || (lightningStats?.apiTimestamp ? new Date(lightningStats.apiTimestamp).toISOString().slice(11, 19) + " UTC" : liveClock.toISOString().slice(11, 19) + " UTC");
  const apiTimeIran = lightningStats?.apiTimeIran || (lightningStats?.apiTimestamp ? new Date(lightningStats.apiTimestamp).toLocaleTimeString('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) : liveClock.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }));

  const lastDetectionTimeUtc = lightningStats?.lastDetectionUtc || (lightningStats?.lastDetectionTime ? new Date(lightningStats.lastDetectionTime).toISOString().slice(11, 19) + " UTC" : "--:--:-- UTC");
  const lastDetectionIran = lightningStats?.lastDetectionIran || (lightningStats?.lastDetectionTime ? new Date(lightningStats.lastDetectionTime).toLocaleTimeString('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) : "");
  const secondsAgo = lightningStats?.lastDetectionSecondsAgo ?? (lightningStats?.lastDetectionTime 
    ? Math.max(0, Math.floor((Date.now() - lightningStats.lastDetectionTime) / 1000))
    : 0);

  const handleMapCoordsChangeForPane = (paneIndex: number, newCoords: Coordinate) => {
    if (syncCoords) {
      setPanes(prev => prev.map(p => ({ ...p, coords: newCoords })));
      setCurrentCoords(newCoords);
    } else {
      setPanes(prev => prev.map((p, idx) => idx === paneIndex ? { ...p, coords: newCoords } : p));
      if (paneIndex === activePaneIndex) {
        setCurrentCoords(newCoords);
      }
    }
  };

  // 2. Navigation & Panel states
  const [activePanel, setActivePanel] = useState<ActivePanel>("layers");
  const [activeTool, setActiveTool] = useState<ToolbarTool>("select");
  const [showLeftDrawer, setShowLeftDrawer] = useState<boolean>(true);
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);

  // 3. Timeline Scrubber state
  const [timelineHour, setTimelineHour] = useState<number>(15); // Default +15h GFS step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeStep, setTimeStep] = useState<number>(3); // 1h, 3h, 6h, 12h increments

  // 4. Data states fetched from backend
  const [currentWeather, setCurrentWeather] = useState<WeatherForecast | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  // 5. Drawing (GIS annotation) items
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);

  // 6. Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<typeof METEOROLOGICAL_STATIONS>([]);

  // 7. AI Analysis briefs & Chat logs
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // 8. Custom user bookmark states
  const [favorites, setFavorites] = useState<Array<{ name: string; coords: Coordinate }>>([
    { name: "Tehran, Iran", coords: { lat: 35.6892, lon: 51.3890, elevation: 1137 } },
    { name: "London, UK", coords: { lat: 51.5074, lon: -0.1278, elevation: 25 } },
  ]);
  const [bookmarks, setBookmarks] = useState<string[]>(["Ahvaz Station", "Tromso Oceanic Buoy 2"]);

  // Resizable drawer width variables
  const [drawerWidth, setDrawerWidth] = useState<number>(360);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Global event listener to focus map when clicked from notes or news items
  useEffect(() => {
    const handleFocusMapEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ lat: number; lon: number; elevation?: number }>;
      if (customEv.detail && customEv.detail.lat !== undefined && customEv.detail.lon !== undefined) {
        const approxElevation = customEv.detail.elevation ?? Math.round(Math.abs(Math.sin(customEv.detail.lat * 2) * Math.cos(customEv.detail.lon * 3)) * 2400 + 40);
        const newCoords: Coordinate = {
          lat: customEv.detail.lat,
          lon: customEv.detail.lon,
          elevation: approxElevation,
          zoom: 7.5
        };
        handleMapCoordsChangeForPane(activePaneIndex, newCoords);
      }
    };

    window.addEventListener("focus-meteo-map", handleFocusMapEvent);
    return () => {
      window.removeEventListener("focus-meteo-map", handleFocusMapEvent);
    };
  }, [activePaneIndex, syncCoords]);

  // Screenshot and Crop Box states
  const mapViewportRef = useRef<HTMLElement | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<boolean>(false);
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startWidth = drawerWidth;
    const startX = e.clientX;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const newWidth = Math.max(220, Math.min(650, startWidth + (startX - moveEvent.clientX)));
      setDrawerWidth(newWidth);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Helper to dynamically calculate active layer value and unit for map telemetry card
  const getActiveLayerValue = () => {
    if (!currentWeather) return "N/A";
    switch (activeLayer.id) {
      case "temperature": return `${currentWeather.temperature} °C`;
      case "wind": return `${currentWeather.windSpeed} m/s`;
      case "pressure": return `${currentWeather.pressure} hPa`;
      case "precipitation": return `${currentWeather.precipitation} mm`;
      case "clouds": return `${currentWeather.clouds} %`;
      case "humidity": return `${currentWeather.humidity} %`;
      case "waves": return `${currentWeather.waves} m`;
      case "cape": return `${currentWeather.temperature ? Math.round(Math.abs(currentWeather.temperature * 115)) : 1200} J/kg`;
      case "snow": return `${currentWeather.precipitation ? Math.round(currentWeather.precipitation * 1.5) : 0} cm`;
      case "heavy_precipitation": return `${currentWeather.precipitation ? Math.round(currentWeather.precipitation * 3) : 15} mm/h`;
      default: return "N/A";
    }
  };

  // Sync min/max bounds when changing weather layers
  useEffect(() => {
    setMinVal(activeLayer.min);
    setMaxVal(activeLayer.max);
  }, [activeLayer]);

  // Fetch forecast readings for the selected point/hour from the Express backend
  useEffect(() => {
    let active = true;
    const fetchPointWeather = async () => {
      setWeatherLoading(true);
      try {
        const response = await fetch("/api/weather/point", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: currentCoords.lat,
            lon: currentCoords.lon,
            timeOffset: timelineHour,
            date: formatForecastDate(0, { includeYear: true, onlyDate: true })
          }),
        });
        if (!response.ok) throw new Error("Server response not OK");
        const data = await response.json();
        if (active && data && data.forecast) {
          setCurrentWeather(data.forecast);
          // Sync elevation if backend returns a calculated estimate
          if (data.location && data.location.elevation !== undefined) {
            setCurrentCoords(prev => ({ ...prev, elevation: data.location.elevation }));
          }
        } else {
          throw new Error("Invalid GFS payload format");
        }
      } catch (err) {
        console.warn("Express backend point weather feed offline. Using client-side model: ", err);
        if (active) {
          const clientWeather = generateClientMockWeather(currentCoords.lat, currentCoords.lon, timelineHour);
          setCurrentWeather(clientWeather.forecast);
          setCurrentCoords(prev => ({ ...prev, elevation: clientWeather.location.elevation }));
        }
      } finally {
        if (active) setWeatherLoading(false);
      }
    };

    fetchPointWeather();
    return () => {
      active = false;
    };
  }, [currentCoords.lat, currentCoords.lon, timelineHour]);

  // Timeline Auto Playback Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineHour((prev) => {
          let next = prev + timeStep;
          if (next > 360) next = 0; // Wrap around 360h (15-day) GFS forecast horizon
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, timeStep]);

  // Handle Search input
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = METEOROLOGICAL_STATIONS.filter((station) =>
      station.name.toLowerCase().includes(val.toLowerCase()) ||
      station.country.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(filtered);
  };

  // Select Search Suggestion
  const handleSelectStation = (station: typeof METEOROLOGICAL_STATIONS[0]) => {
    setCurrentCoords({ lat: station.lat, lon: station.lon, elevation: 120 });
    setLocationName(`${station.name}, ${station.country}`);
    setSearchQuery("");
    setSuggestions([]);
  };

  // Perform AI Atmospheric Analysis using server-side Gemini API
  const handlePerformAnalysis = async () => {
    if (!currentWeather) return;
    setIsAnalyzing(true);
    setAnalysisReport(null);

    const payload = {
      location: currentCoords,
      date: formatForecastDate(timelineHour, { includeYear: true }),
      forecast: currentWeather
    };

    try {
      const res = await fetch("/api/weather/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weatherData: payload }),
      });
      if (!res.ok) throw new Error("CORS or offline");
      const data = await res.json();
      if (data && data.analysis) {
        if (data.analysis.includes("GEMINI_API_KEY")) {
          // If key is not configured, fall back to our advanced client-side scientific generator
          setAnalysisReport(generateMockAnalysis(currentCoords, currentWeather));
        } else {
          setAnalysisReport(data.analysis);
        }
      } else {
        setAnalysisReport(data.error || generateMockAnalysis(currentCoords, currentWeather));
      }
    } catch (err) {
      console.warn("Analysis backend offline, triggering GFS high-fidelity client report: ", err);
      setAnalysisReport(generateMockAnalysis(currentCoords, currentWeather));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute Agent actions on workstation UI state
  const executeAgentAction = (action: { name: string; args: Record<string, any>; summary: string }) => {
    try {
      if (action.name === "navigateToLocation") {
        const { latitude, longitude, locationName: loc, zoomLevel } = action.args;
        let lat = latitude !== undefined ? parseFloat(latitude) : undefined;
        let lon = longitude !== undefined ? parseFloat(longitude) : undefined;

        // If coordinates not directly provided, search in stations catalog
        if ((lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) && loc) {
          const matchedStation = METEOROLOGICAL_STATIONS.find(s => 
            s.name.toLowerCase().includes(loc.toLowerCase()) || 
            loc.toLowerCase().includes(s.name.toLowerCase()) ||
            s.country.toLowerCase().includes(loc.toLowerCase())
          );
          if (matchedStation) {
            lat = matchedStation.lat;
            lon = matchedStation.lon;
          }
        }

        if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
          const approxElevation = Math.round(Math.abs(Math.sin(lat * 2) * Math.cos(lon * 3)) * 2400 + 40);
          const zoom = zoomLevel !== undefined ? Number(zoomLevel) : 8;
          const newCoords: Coordinate = { lat, lon, elevation: approxElevation, zoom };
          
          handleMapCoordsChangeForPane(activePaneIndex, newCoords);
          if (loc) {
            setLocationName(loc);
          }
        }
      } else if (action.name === "setWeatherLayer" || action.name === "changeActiveLayer") {
        const { layerId, opacity, visualizationStyle: vStyle } = action.args;
        const found = WEATHER_LAYERS.find(l => l.id === layerId);
        if (found) {
          setActiveLayer(found);
          if (opacity !== undefined) {
            setLayerOpacity(Math.max(0, Math.min(100, Number(opacity))));
          }
          if (vStyle) {
            setVisualizationStyle(vStyle);
          }
        }
      } else if (action.name === "configureCatalogLayer") {
        const { sourceId, variableId, levelId, opacity, paletteId } = action.args;
        
        // Find matching data from catalog
        const src = DATA_SOURCES.find(s => s.id === sourceId) || DATA_SOURCES[1]; // default GFS
        const variable = WEATHER_VARIABLES.find(v => v.id === variableId) || WEATHER_VARIABLES[0];
        const level = VERTICAL_LEVELS.find(l => l.id === (levelId || variable.defaultLevelId)) || VERTICAL_LEVELS[1];
        const palette = COLOR_PALETTES.find(p => p.id === (paletteId || variable.defaultPaletteId)) || COLOR_PALETTES[0];
        const visOption = VISUALIZATION_OPTIONS.find(o => o.id === variable.defaultVisualizationId) || VISUALIZATION_OPTIONS[0];

        const newActiveLayer: ActiveLayer = {
          instanceId: `layer_${src.id}_${variable.id}_${Date.now()}`,
          categoryId: src.categoryId,
          sourceId: src.id,
          sourceName: src.shortName,
          variableId: variable.id,
          variableName: variable.name,
          variableUnit: variable.unit,
          levelId: level.id,
          levelName: level.shortLabel,
          visualizationId: visOption.id,
          visualizationName: visOption.name,
          paletteId: palette.id,
          paletteColors: palette.colors,
          opacity: opacity !== undefined ? Number(opacity) : 85,
          visible: true,
          locked: false,
          zIndex: 1,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          invertPalette: false,
          blendMode: "normal",
          timelineSync: "main",
          customLabel: `${src.shortName} ${variable.name} (${level.shortLabel})`,
          minVal: variable.min,
          maxVal: variable.max,
          dateCreated: Date.now()
        };

        // Reset pane active layers to this newly selected layer
        setPanes(prev => prev.map((p, idx) => idx === activePaneIndex ? {
          ...p,
          activeLayers: [newActiveLayer]
        } : p));

        // Map to primary layer view
        if (variableId === "temp_2m" || variableId === "feels_like" || variableId === "dew_point") {
          const tempLayer = WEATHER_LAYERS.find(l => l.id === "temperature");
          if (tempLayer) setActiveLayer(tempLayer);
        } else if (variableId === "wind_10m" || variableId === "wind_gust" || variableId === "jet_stream_250") {
          const windLayer = WEATHER_LAYERS.find(l => l.id === "wind");
          if (windLayer) setActiveLayer(windLayer);
        } else if (variableId === "mslp" || variableId === "pressure") {
          const pressLayer = WEATHER_LAYERS.find(l => l.id === "pressure");
          if (pressLayer) setActiveLayer(pressLayer);
        } else if (variableId === "precip_total" || variableId === "precipitation" || variableId === "snow_depth") {
          const precipLayer = WEATHER_LAYERS.find(l => l.id === "precipitation");
          if (precipLayer) setActiveLayer(precipLayer);
        } else if (variableId === "cloud_total" || variableId === "fog") {
          const cloudLayer = WEATHER_LAYERS.find(l => l.id === "clouds");
          if (cloudLayer) setActiveLayer(cloudLayer);
        } else if (variableId === "rel_hum" || variableId === "humidity") {
          const humLayer = WEATHER_LAYERS.find(l => l.id === "humidity");
          if (humLayer) setActiveLayer(humLayer);
        } else if (variableId === "waves" || variableId === "wave_height" || variableId === "sst") {
          const wavesLayer = WEATHER_LAYERS.find(l => l.id === "waves");
          if (wavesLayer) setActiveLayer(wavesLayer);
        }
      } else if (action.name === "setTimelineForecastHour" || action.name === "setTimeStep") {
        const { hour, autoPlay } = action.args;
        if (hour !== undefined) {
          setTimelineHour(Math.max(0, Math.min(384, Number(hour))));
        }
        if (autoPlay !== undefined) {
          setIsPlaying(Boolean(autoPlay));
        }
      } else if (action.name === "setSplitScreenMode" || action.name === "configureSplitLayout") {
        const { layout, syncPanning } = action.args;
        let mappedLayout: SplitLayoutMode = "single";
        if (layout === "split-h" || layout === "dual") mappedLayout = "dual";
        else if (layout === "triple") mappedLayout = "triple";
        else if (layout === "split-v" || layout === "quad") mappedLayout = "quad";
        else if (["single", "dual", "triple", "quad"].includes(layout)) {
          mappedLayout = layout as SplitLayoutMode;
        }
        setSplitLayout(mappedLayout);
        if (syncPanning !== undefined) {
          setSyncCoords(Boolean(syncPanning));
        }
      } else if (action.name === "openUIPanel") {
        const { panelName } = action.args;
        if (panelName && ["layers", "layer_settings", "chat", "favorites", "bookmarks", "alerts", "profile", "notes", "news"].includes(panelName)) {
          setActivePanel(panelName as ActivePanel);
          setShowLeftDrawer(true);
        }
      }
    } catch (err) {
      console.error("Error executing agent action:", action, err);
    }
  };

  // Send AI Chat Message
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text,
      timestamp: new Date()
    };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          currentCoords: currentCoords,
          activeState: {
            activeLayerId: activeLayer.id,
            activeLayersCount: activeLayers.length,
            timelineHour: timelineHour,
            locationName: locationName,
            splitLayout: splitLayout,
            activePanel: activePanel,
          }
        }),
      });

      if (!res.ok) throw new Error("Server response not ok");
      const data = await res.json();
      
      if (data && (data.response || data.actions)) {
        if (data.response && data.response.includes("GEMINI_API_KEY")) {
          // If Gemini key is not configured or quota exceeded, use comprehensive agent engine
          const agentRes = await processClientAgentFallbackAsync(text, currentCoords, currentWeather);
          agentRes.actions.forEach(executeAgentAction);

          await new Promise(resolve => setTimeout(resolve, 300));
          const aiMsg: ChatMessage = {
            id: Math.random().toString(),
            role: "assistant",
            text: agentRes.replyText,
            actions: agentRes.actions,
            groundingSources: agentRes.groundingSources,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, aiMsg]);
        } else {
          // Execute actions returned from backend agent
          if (Array.isArray(data.actions) && data.actions.length > 0) {
            data.actions.forEach((act: any) => {
              executeAgentAction(act);
            });
          }

          const aiMsg: ChatMessage = {
            id: Math.random().toString(),
            role: "assistant",
            text: data.response,
            actions: data.actions,
            groundingSources: data.groundingSources,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, aiMsg]);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.warn("AI Chat backend offline/fallback, executing local natural agent: ", err);
      const agentRes = await processClientAgentFallbackAsync(text, currentCoords, currentWeather);
      agentRes.actions.forEach(executeAgentAction);

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: agentRes.replyText,
        actions: agentRes.actions,
        groundingSources: agentRes.groundingSources,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Save current location as favorite
  const handleToggleFavorite = () => {
    const exists = favorites.some(f => f.name === locationName || (f.coords.lat === currentCoords.lat && f.coords.lon === currentCoords.lon));
    if (exists) {
      setFavorites(prev => prev.filter(f => f.name !== locationName));
    } else {
      setFavorites(prev => [...prev, { name: locationName || "Custom Position", coords: currentCoords }]);
    }
  };

  // Handle map click location change
  const handleMapCoordsChange = (coords: Coordinate) => {
    setCurrentCoords(coords);
    setLocationName(`Selected Point (${coords.lat.toFixed(4)}°N, ${coords.lon.toFixed(4)}°E)`);
  };

  // Open the interactive crop box on the map
  const handleExportScreenshot = () => {
    setIsCropping(true);
  };

  // Execute snapshot of the cropped region with optional high-resolution target dimensions
  const handleConfirmCrop = async (crop: CropRect, targetDimensions?: ScreenshotDimensions | null) => {
    try {
      setIsCapturingScreenshot(true);

      // Find the main map viewport element
      const viewport = mapViewportRef.current;
      if (!viewport) {
        throw new Error("نمای نقشه یافت نشد.");
      }

      // Find active map container
      const allContainers = Array.from(viewport.querySelectorAll<HTMLElement>("#maplibre-view"));
      const activeContainer = (splitLayout !== "single" && allContainers[activePaneIndex])
        ? allContainers[activePaneIndex]
        : (allContainers[0] || viewport);

      const map = (activeContainer as any).__mapInstance;
      const overlayCanvas = (activeContainer as any).__canvasOverlay;
      const forceOverlayRepaint = (activeContainer as any).__forceOverlayRepaint;

      if (!map) {
        throw new Error("موتور نقشه MapLibre هنوز به طور کامل بارگذاری نشده است.");
      }

      const screenshot = await MapScreenshotService.captureMapScreenshot({
        mapInstance: map,
        mapContainer: activeContainer,
        overlayCanvas,
        crop,
        targetDimensions,
        forceOverlayRepaint,
        onProgress: (step) => {
          console.log("[Screenshot Pipeline]", step);
        }
      });

      setCapturedScreenshot(screenshot.dataUrl);
      setScreenshotModalOpen(true);
      setIsCropping(false);
      showToast(`تصویر نقشه با موفقیت ثبت شد (${screenshot.width} × ${screenshot.height} px)`, "success");
    } catch (err: any) {
      console.error("Screenshot capture error:", err);
      const errorMsg = err?.message || "Unable to capture the map. WebGL rendering or an external map layer prevented image export.";
      showToast(errorMsg, "error");
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Share layout config
  const handleShareLayout = () => {
    const shareText = `Alpha Meteo - GFS 0.25° Active Weather Map\nLat: ${currentCoords.lat}, Lon: ${currentCoords.lon}\nViewing: ${activeLayer.name}`;
    navigator.clipboard.writeText(shareText);
    showToast("مشخصات نقشه در کلیپ‌بورد کپی شد", "success");
  };

  return (
    <div className="h-screen w-screen flex flex-col antialiased text-xs text-slate-200 bg-[#060709] font-sans select-none" id="alpha-meteo-root">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="h-14 bg-[#08090C] border-b border-[#1A1C23] flex items-center justify-between px-4 shrink-0 z-50 shadow-md" id="global-header">
        <div className="flex items-center space-x-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-[#12141A] to-[#0A0B0E] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md border border-[#1A1C23]">
              <img
                src={brandLogo}
                alt="Alpha Meteo Logo"
                className="w-8.5 h-8.5 object-contain transition-transform duration-300 group-hover:rotate-6"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-white font-sans font-black tracking-wider text-sm uppercase">
              ALPHA <span className="text-blue-500 font-normal">METEO</span>
            </span>
          </div>

          {/* Search box with autocomplete suggestions */}
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-[#12141A] hover:bg-[#181B24] focus:bg-[#090A0E] text-slate-200 rounded border border-[#212530] pl-3 pr-9 py-1.5 focus:outline-none focus:border-blue-500 w-52 text-xs transition font-medium placeholder-slate-600"
              placeholder="Search location..."
              id="station-search-input"
            />
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
            
            {/* Search Suggestions List */}
            {suggestions.length > 0 && (
              <div className="absolute top-10 left-0 right-0 bg-[#08090C] border border-[#1A1C23] rounded shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar" id="search-suggestions-container">
                {suggestions.map((station, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectStation(station)}
                    className="p-2.5 hover:bg-blue-600/10 cursor-pointer text-slate-300 hover:text-white flex justify-between items-center transition border-b border-[#1A1C23]/30 text-[11px]"
                  >
                    <span className="font-semibold">{station.name}, <span className="text-slate-500 font-normal">{station.country}</span></span>
                    <span className="font-mono text-[9px] text-slate-500">{station.lat.toFixed(1)}°N, {station.lon.toFixed(1)}°E</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location details readout */}
          <div className="hidden sm:flex flex-col border-l border-[#1F222F] pl-4">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-200 text-xs truncate max-w-[130px]">{locationName}</span>
              <button 
                onClick={handleToggleFavorite}
                className="text-slate-500 hover:text-yellow-500 transition duration-150"
                title="Toggle Favorite Location"
              >
                <Star className={`w-3.5 h-3.5 ${favorites.some(f => f.name === locationName) ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </button>
            </div>
            <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-mono">
              <span>{currentCoords.lat.toFixed(4)}° N, {currentCoords.lon.toFixed(4)}° E</span>
              <span>•</span>
              <span>Elev: {currentCoords.elevation}m</span>
            </div>
          </div>
        </div>

        {/* Dynamic selectors matching top bar controls - Desktop Only */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4">
            {/* Model Selector */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Model</span>
              <div className="bg-[#12141A] border border-[#212530] rounded px-2.5 py-0.5 flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-300">GFS 0.25°</span>
                <span className="bg-blue-600/20 text-blue-400 font-black px-1 rounded text-[8px] border border-blue-500/30">+2</span>
              </div>
            </div>

            {/* Run Selector */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Run</span>
              <div className="bg-[#12141A] border border-[#212530] rounded px-2.5 py-0.5">
                <span className="text-xs font-bold text-slate-300">{formatForecastDate(0, { includeYear: true, onlyDate: true })} 00Z</span>
              </div>
            </div>

            {/* Valid Scrubber Display */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Valid Forecast Time</span>
              <div className="flex items-center bg-[#12141A] border border-[#212530] rounded overflow-hidden">
                <button 
                  onClick={() => setTimelineHour(prev => Math.max(0, prev - timeStep))}
                  className="px-2 py-0.5 hover:bg-[#1A1D27] text-slate-400 border-r border-[#212530] transition text-sm font-bold"
                >
                  ‹
                </button>
                <div className="px-3 py-0.5 flex items-center font-mono text-xs font-bold text-slate-200">
                  <span>{formatForecastDate(timelineHour, { includeYear: false })}</span>
                </div>
                <button 
                  onClick={() => setTimelineHour(prev => Math.min(360, prev + timeStep))}
                  className="px-2 py-0.5 hover:bg-[#1A1D27] text-slate-400 border-l border-[#212530] transition text-sm font-bold"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Playback controller */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Playback</span>
              <div className="flex items-center bg-[#12141A] border border-[#212530] rounded overflow-hidden h-[23px]">
                <button 
                  onClick={() => setTimelineHour(prev => Math.max(0, prev - timeStep))}
                  className="px-2 h-full hover:bg-[#1A1D27] text-slate-400 transition"
                  title="Previous Step"
                >
                  ‹
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 h-full hover:bg-[#1A1D27] text-blue-400 border-x border-[#212530] transition flex items-center justify-center"
                  title={isPlaying ? "Pause" : "Play Forecast Loop"}
                >
                  {isPlaying ? <Pause className="w-3 h-3 text-amber-500 fill-amber-500" /> : <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
                </button>
                <button 
                  onClick={() => setTimelineHour(prev => Math.min(360, prev + timeStep))}
                  className="px-2 h-full hover:bg-[#1A1D27] text-slate-400 transition"
                  title="Next Step"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Mobile controls toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setShowMobileControls(!showMobileControls)}
              className={`p-2 rounded border transition ${
                showMobileControls
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/50 animate-pulse"
                  : "bg-[#12141A] border-[#212530] text-slate-400 hover:text-white"
              }`}
              title="Toggle Forecast Controls"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* User controls icons */}
          <div className="flex items-center space-x-2 text-slate-400 border-l border-[#1F222F] pl-4 max-sm:pl-2">
            <button onClick={handleExportScreenshot} className="hover:text-slate-200 p-1.5 rounded hover:bg-[#12141A] transition" title="Download Meteorological Layout GRIB">
              <Download className="w-4 h-4" />
            </button>
            <button className="hover:text-slate-200 p-1.5 rounded hover:bg-[#12141A] relative transition max-sm:hidden" title="System Alerts">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            </button>
            <button className="hover:text-slate-200 p-1.5 rounded hover:bg-[#12141A] transition max-sm:hidden" title="GFS Documentation">
              <CircleHelp className="w-4 h-4" />
            </button>
            <div className="bg-[#212530] text-slate-200 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs select-none shrink-0">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Controls Collapsible Bar */}
      {showMobileControls && (
        <div className="lg:hidden bg-[#08090C] border-b border-[#1A1C23] px-4 py-2.5 flex flex-wrap gap-3 items-center justify-between shrink-0 z-40" id="mobile-controls-bar">
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            {/* Model Selector */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Model</span>
              <div className="bg-[#12141A] border border-[#212530] rounded px-2 py-0.5 flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-300">GFS 0.25°</span>
                <span className="bg-blue-600/20 text-blue-400 font-black px-1 rounded text-[8px] border border-blue-500/30">+2</span>
              </div>
            </div>

            {/* Run Selector */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Run</span>
              <div className="bg-[#12141A] border border-[#212530] rounded px-2 py-0.5">
                <span className="text-xs font-bold text-slate-300">{formatForecastDate(0, { onlyDate: true, isShort: true })} 00Z</span>
              </div>
            </div>

            {/* Playback controller */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Playback</span>
              <div className="flex items-center bg-[#12141A] border border-[#212530] rounded overflow-hidden h-[23px]">
                <button 
                  onClick={() => setTimelineHour(prev => Math.max(0, prev - timeStep))}
                  className="px-2 h-full hover:bg-[#1A1D27] text-slate-400 transition"
                  title="Previous Step"
                >
                  ‹
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 h-full hover:bg-[#1A1D27] text-blue-400 border-x border-[#212530] transition flex items-center justify-center"
                  title={isPlaying ? "Pause" : "Play Forecast Loop"}
                >
                  {isPlaying ? <Pause className="w-3 h-3 text-amber-500 fill-amber-500" /> : <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
                </button>
                <button 
                  onClick={() => setTimelineHour(prev => Math.min(360, prev + timeStep))}
                  className="px-2 h-full hover:bg-[#1A1D27] text-slate-400 transition"
                  title="Next Step"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Valid Scrubber Display */}
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans mb-0.5">Valid Forecast Time</span>
            <div className="flex items-center bg-[#12141A] border border-[#212530] rounded overflow-hidden w-full sm:w-auto justify-between">
              <button 
                onClick={() => setTimelineHour(prev => Math.max(0, prev - timeStep))}
                className="px-3 py-0.5 hover:bg-[#1A1D27] text-slate-400 border-r border-[#212530] transition text-sm font-bold"
              >
                ‹
              </button>
              <div className="px-3 py-0.5 flex items-center font-mono text-xs font-bold text-slate-200 flex-1 justify-center">
                <span>{formatForecastDate(timelineHour, { includeYear: false })}</span>
              </div>
              <button 
                onClick={() => setTimelineHour(prev => Math.min(360, prev + timeStep))}
                className="px-3 py-0.5 hover:bg-[#1A1D27] text-slate-400 border-l border-[#212530] transition text-sm font-bold"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CORE INTERFACE CONTAINER (Sidebar + Map + Secondary panels) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT GIS TOOLBAR with Human-Readable Labels */}
        <aside className="w-14 md:w-[72px] bg-[#08090C] border-r border-[#1A1C23] flex flex-col justify-between items-center py-2 shrink-0 z-40 shadow-lg max-md:absolute max-md:left-3 max-md:top-14 max-md:bottom-auto max-md:max-h-[calc(100vh-220px)] max-md:border max-md:rounded-lg max-md:shadow-2xl max-md:bg-[#08090C]/90 max-md:backdrop-blur-md max-md:py-3" id="left-gis-toolbar">
          <div className="flex flex-col items-center w-full space-y-0.5 overflow-y-auto custom-scrollbar">
            <div className="text-[7.5px] text-slate-500 uppercase font-black tracking-widest mb-1 select-none text-center hidden md:block">GIS Tools</div>
            
            {/* Pointer select tool */}
            <button
              onClick={() => setActiveTool("select")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "select" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Select / Focus Pin"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Select</span>
            </button>

            {/* Distance measure */}
            <button
              onClick={() => setActiveTool("ruler")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "ruler" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Geodesic Path Measure"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Measure</span>
            </button>

            {/* Distance vector tool */}
            <button
              onClick={() => setActiveTool("distance")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "distance" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Distance vector"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Distance</span>
            </button>

            {/* Bearing Tool */}
            <button
              onClick={() => setActiveTool("bearing")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "bearing" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Bearing Angle"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Bearing</span>
            </button>

            {/* Area Tool */}
            <button
              onClick={() => setActiveTool("area")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "area" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Area bounding"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Area</span>
            </button>

            {/* Point selector */}
            <button
              onClick={() => setActiveTool("point")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "point" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Plot Meteorological Station Marker"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Point</span>
            </button>

            {/* Line tool */}
            <button
              onClick={() => setActiveTool("line")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "line" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Plot Line"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Line</span>
            </button>

            {/* Rectangle GIS */}
            <button
              onClick={() => setActiveTool("rectangle")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "rectangle" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Draw Grid Bound Box"
            >
              <Square className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Rectangle</span>
            </button>

            {/* Polygon tool */}
            <button
              onClick={() => setActiveTool("polygon")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "polygon" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Draw Polygon"
            >
              <Circle className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Polygon</span>
            </button>

            {/* Circle GIS */}
            <button
              onClick={() => setActiveTool("circle")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "circle" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Draw Radial Alert Zone"
            >
              <Circle className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Circle</span>
            </button>

            {/* Box GIS */}
            <button
              onClick={() => setActiveTool("box")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "box" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Draw 3D Alert Grid"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Box</span>
            </button>

            {/* Text annotation */}
            <button
              onClick={() => setActiveTool("text")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "text" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Place Text Note Annotation"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Text</span>
            </button>

            {/* Pencil Annotation */}
            <button
              onClick={() => setActiveTool("pencil")}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                activeTool === "pencil" ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Draw Freehand Annotation"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Annotate</span>
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setDrawings([]);
                setActiveTool("select");
              }}
              className="w-10 md:w-14 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded flex flex-col items-center transition"
              title="Clear GIS Drawings"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold tracking-tight mt-0.5 hidden md:inline">Eraser</span>
            </button>
          </div>

          {/* Lower Toolbar tools */}
          <div className="flex flex-col items-center w-full space-y-1.5 border-t border-[#1A1C23] pt-2">
            <button
              onClick={handleExportScreenshot}
              className={`w-10 md:w-14 py-1.5 rounded flex flex-col items-center transition ${
                isCropping
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
              title="ثبت اسکرین‌شات از ناحیه دلخواه نقشه"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-bold tracking-tight hidden md:inline">Screenshot</span>
            </button>
            <button onClick={handleShareLayout} className="w-10 md:w-14 py-1 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded flex flex-col items-center transition" title="Copy Layer Settings Link">
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight hidden md:inline">Share</span>
            </button>
          </div>
        </aside>

        {/* CENTRAL AREA & RIGHT SIDE PANEL (Vertical Stack of Parameter tabs + Horizontal Flex of map + right bar) */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          
          {/* HORIZONTAL METEOROLOGICAL PARAMETERS TAB STRIP (Spans across the entire main screen width) */}
          <nav className="h-11 bg-[#0D0E12] border-b border-[#1A1C23] flex items-center px-4 justify-between shrink-0 z-30" id="weather-tabs-strip">
            <ul className="flex space-x-2 text-xs font-bold h-full items-center text-slate-400 overflow-x-auto custom-scrollbar">
              {WEATHER_LAYERS.map((layer) => {
                const isSelected = activeLayer.id === layer.id;
                return (
                  <li
                    key={layer.id}
                    onClick={() => setActiveLayer(layer)}
                    className={`h-full flex items-center cursor-pointer px-3 text-nowrap transition-all border-b-2 tracking-wide font-sans text-[11px] ${
                      isSelected
                        ? "border-blue-500 text-blue-400 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {layer.name}
                  </li>
                );
              })}
              <li className="h-full flex items-center cursor-pointer px-3 text-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-300 font-sans text-[11px]">
                More ▾
              </li>
            </ul>
            
            {/* Unit conversions & settings inside tabs */}
            <div className="flex items-center space-x-3 text-slate-400 shrink-0 select-none">
              <SplitControls
                splitLayout={splitLayout}
                onSelectLayout={(mode) => setSplitLayout(mode)}
                activePaneIndex={activePaneIndex}
                totalPanes={splitLayout === "single" ? 1 : splitLayout === "dual" ? 2 : splitLayout === "triple" ? 3 : 4}
                syncCoords={syncCoords}
                onToggleSyncCoords={() => setSyncCoords(!syncCoords)}
                activePaneTitle={activePane.title}
                activePaneLayerName={activeLayer.name}
              />
              <div className="flex items-center bg-[#07080B] px-2.5 py-0.5 rounded border border-[#1A1C23] text-[10px] font-mono font-bold">
                <span>°C ▾</span>
              </div>
              <button className="hover:text-white transition duration-150">
                <GearIcon className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
              </button>
            </div>
          </nav>

          {/* Map + Sidebar Container */}
          <div className="flex-1 flex relative overflow-hidden h-full">

            {/* MAP CANVAS VIEWPORT */}
            <main ref={mapViewportRef} className="flex-1 h-full relative flex flex-col overflow-hidden bg-zinc-950">
              
              {/* Interactive Screenshot Cropper Overlay */}
              <ScreenshotCropper
                isActive={isCropping}
                onCancel={() => setIsCropping(false)}
                onConfirm={handleConfirmCrop}
                containerRef={mapViewportRef}
                isCapturing={isCapturingScreenshot}
              />
              
              {/* Render MapLibre Instance(s) based on Split Layout */}
              <div className={`flex-1 h-full w-full relative z-10 ${
                splitLayout === "single"
                  ? "flex flex-col"
                  : splitLayout === "dual"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-1 bg-[#030406] p-1"
                  : splitLayout === "triple"
                  ? "grid grid-cols-2 grid-rows-2 gap-1 bg-[#030406] p-1"
                  : "grid grid-cols-2 grid-rows-2 gap-1 bg-[#030406] p-1"
              }`}>
                {panes.slice(0, splitLayout === "single" ? 1 : splitLayout === "dual" ? 2 : splitLayout === "triple" ? 3 : 4).map((pane, paneIdx) => {
                  const isActive = activePaneIndex === paneIdx;
                  
                  // Grid span logic for triple mode (pane 2 spans full width on bottom)
                  const gridClass = splitLayout === "triple" && paneIdx === 2
                    ? "col-span-2 row-span-1"
                    : "";

                  return (
                    <div
                      key={pane.id}
                      onClick={() => setActivePaneIndex(paneIdx)}
                      className={`relative flex flex-col h-full w-full overflow-hidden transition-all duration-150 rounded ${gridClass} ${
                        splitLayout !== "single"
                          ? isActive
                            ? "border-2 border-blue-500 shadow-xl shadow-blue-950/50 ring-1 ring-blue-500/50"
                            : "border border-[#1A1F2E] opacity-90 hover:opacity-100 hover:border-slate-500"
                          : ""
                      }`}
                    >
                      {/* Pane Header Bar in Split Screen View */}
                      {splitLayout !== "single" && (
                        <div className={`h-8 bg-[#090B10]/95 backdrop-blur-md border-b flex items-center justify-between px-2.5 z-20 shrink-0 text-slate-200 select-none ${
                          isActive ? "border-blue-500/50 bg-blue-950/25" : "border-[#1A1F2E]"
                        }`}>
                          {/* Left: Badge & Title */}
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                              isActive ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                            }`}>
                              {pane.title}
                            </span>

                            {isActive ? (
                              <span className="flex items-center space-x-1 text-[9px] font-bold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-400/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span>نقشه فعال</span>
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-500 hover:text-slate-300 transition">
                                (کلیک برای فعال‌سازی)
                              </span>
                            )}
                          </div>

                          {/* Center: Quick Layer Selection Dropdown */}
                          <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={pane.activeLayer.id}
                              onChange={(e) => {
                                const newLayer = WEATHER_LAYERS.find(l => l.id === e.target.value);
                                if (newLayer) {
                                  setActivePaneIndex(paneIdx);
                                  handleSetActiveLayerForPane(paneIdx, newLayer);
                                }
                              }}
                              className="bg-[#121622] text-blue-300 text-[10px] font-bold border border-[#232B3E] rounded px-2 py-0.5 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                            >
                              {WEATHER_LAYERS.map((layer) => (
                                <option key={layer.id} value={layer.id} className="bg-[#0D1017] text-slate-200">
                                  {layer.name} ({layer.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Right: Maximizing Focus View */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePaneIndex(paneIdx);
                                setSplitLayout("single");
                              }}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition"
                              title="بزرگنمایی کامل این نقشه (Single View)"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Map Instance */}
                      <div className="flex-1 h-full w-full relative">
                        <MeteoMap
                          currentCoords={pane.coords}
                          onCoordsChange={(newCoords) => handleMapCoordsChangeForPane(paneIdx, newCoords)}
                          onHoverCoordsChange={setHoverCoords}
                          activeLayer={pane.activeLayer}
                          layerOpacity={pane.layerOpacity}
                          activeTool={activeTool}
                          drawings={drawings}
                          setDrawings={setDrawings}
                          timelineHour={timelineHour}
                          mapLocked={mapLocked}
                          onMapLockToggle={setMapLocked}
                          visualizationStyle={pane.visualizationStyle}
                          colorScaleName={pane.colorScaleName}
                          minVal={pane.minVal}
                          maxVal={pane.maxVal}
                          heatmapRadius={heatmapRadius}
                          showLiveLightning={isLightningActive}
                          activeLayers={activeLayers}
                          lightningTimeFilter={lightningTimeFilter}
                        />

                        {/* Compact Layer Legend Tag at bottom-left of map pane */}
                        {splitLayout !== "single" && (
                          <div className="absolute bottom-3 left-3 bg-[#08090E]/90 backdrop-blur-md border border-[#1E2538] rounded-md px-2 py-1 z-20 flex items-center space-x-2 text-[9px] font-mono text-slate-300 select-none shadow-lg">
                            <span className="font-bold text-blue-400">{pane.activeLayer.name}:</span>
                            <span>{pane.minVal}</span>
                            <div
                              className="w-12 h-2 rounded-sm border border-white/20"
                              style={{
                                background: pane.activeLayer.gradient || "linear-gradient(to right, #1d4ed8, #059669, #eab308, #dc2626)"
                              }}
                            />
                            <span>{pane.maxVal} {pane.activeLayer.unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Scientific Analysis Overlay brief (Displays absolute over map when computed) */}
              {analysisReport && (
                <div className="absolute top-4 left-4 right-4 md:left-48 max-w-lg bg-[#08090C]/95 backdrop-blur-md border border-blue-500/40 rounded shadow-2xl p-4.5 z-40" id="ai-report-modal">
                  <div className="flex justify-between items-center border-b border-blue-500/20 pb-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Clinical AI Atmospheric Briefing</span>
                    </div>
                    <button 
                      onClick={() => setAnalysisReport(null)}
                      className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-[11px] leading-relaxed text-slate-300 font-sans space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1 select-text">
                    <div className="font-mono text-[9px] text-blue-400 bg-blue-950/20 border border-blue-900/30 p-2 rounded flex justify-between">
                      <span>Coordinates: {currentCoords.lat.toFixed(3)}°N, {currentCoords.lon.toFixed(3)}°E</span>
                      <span>GFS Precision</span>
                    </div>
                    <p className="whitespace-pre-wrap">{analysisReport}</p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2 border-t border-[#1A1C23] pt-3">
                    <button
                      onClick={() => {
                        const text = `Atmospheric Analysis\nCoords: ${currentCoords.lat}°N, ${currentCoords.lon}°E\n\n${analysisReport}`;
                        const blob = new Blob([text], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `GFS_Report_${currentCoords.lat}_${currentCoords.lon}.txt`;
                        a.click();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[9px] tracking-wider uppercase rounded transition"
                    >
                      Download report
                    </button>
                    <button
                      onClick={() => setAnalysisReport(null)}
                      className="px-3 py-1.5 bg-[#12141A] hover:bg-slate-800 border border-[#212530] text-slate-300 font-semibold text-[9px] tracking-wider uppercase rounded transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-40 flex items-center justify-center">
                  <div className="bg-[#08090C] border border-[#1A1C23] rounded p-6 shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Synthesizing Physics Model</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Querying NOAA GFS 0.25° grid datasets. Evaluating dew points, convective triggers, and vector baroclinics.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* HORIZONTAL COLOR LEGEND Overlay (Top Left on map) */}
              <div 
                className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#08090C]/90 backdrop-blur-md rounded-lg border border-[#1A1C23] px-3 py-2 z-30 flex flex-col space-y-1.5 shadow-xl select-none w-auto min-w-[200px] max-w-[calc(100vw-70px)] sm:max-w-xs md:max-w-sm transition-all" 
                id="map-color-legend"
                dir="ltr"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-slate-200 truncate max-w-[150px]">{activeLayer.name}</span>
                  {activeLayer.unit && (
                    <span className="font-black text-blue-400 uppercase tracking-wider ml-2 shrink-0">{activeLayer.unit}</span>
                  )}
                </div>

                <div className="w-full">
                  <div 
                    className={`h-2 w-full rounded-full bg-gradient-to-r ${activeLayer.gradient} shadow-inner border border-white/10`} 
                  />
                  {activeLayer.id !== "none" && (
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono pt-1">
                      <span>{minVal}</span>
                      <span className="hidden xs:inline">{Math.round(minVal + (maxVal - minVal) * 0.25)}</span>
                      <span>{Math.round(minVal + (maxVal - minVal) * 0.5)}</span>
                      <span className="hidden xs:inline">{Math.round(minVal + (maxVal - minVal) * 0.75)}</span>
                      <span>{maxVal}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DYNAMIC TIMELINE CONTROL PANEL (Bottom edge of map layout) */}
              {isLightningActive ? (
                /* REAL-TIME EUMETSAT MTG-LI SATELLITE LIGHTNING TIMELINE HUD */
                <div className="absolute bottom-4 left-4 right-4 z-30 bg-[#08090C]/95 backdrop-blur-md rounded-lg border border-amber-500/20 p-3 shadow-2xl flex flex-col space-y-2.5" id="timeline-scrubber-hud" dir="rtl">
                  {/* Top Row: Live Indicator, Satellite Source, Exact Date & Exact Time (to the second) */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 pb-2 border-b border-[#1A1C23]">
                    {/* Live Source Badge */}
                    <div className="flex items-center space-x-2 space-x-reverse select-none shrink-0">
                      <div className="flex items-center space-x-1.5 space-x-reverse bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 font-mono tracking-wider">LIVE OBS • 1,000 FPS</span>
                      </div>
                      <div className="flex items-center space-x-1.5 space-x-reverse bg-[#12141A] border border-[#212530] px-2.5 py-1 rounded-md">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-200">سنجنده صاعقه EUMETSAT MTG-I1 LI (0.0° GEO)</span>
                      </div>
                    </div>

                    {/* Exact Date & Time Directly From EUMETSAT API (Gregorian, Shamsi, UTC & Iran) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                      {/* Exact Date from Satellite API */}
                      <div className="flex items-center space-x-1.5 space-x-reverse bg-blue-950/40 text-blue-300 border border-blue-800/40 px-2.5 py-1 rounded-md shadow-sm" title="تاریخ رسمی دریافتی مستقیم از خروجی API ماهواره EUMETSAT">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[11px] font-bold text-slate-200">
                          {apiDateShamsi}
                        </span>
                        <span className="text-[10px] text-blue-400/80 border-r border-blue-800/50 pr-1.5 font-sans">
                          {apiDateGregorian}
                        </span>
                      </div>

                      {/* Exact Satellite API Output Clock */}
                      <div className="flex items-center space-x-1.5 space-x-reverse bg-amber-950/40 text-amber-300 border border-amber-800/40 px-2.5 py-1 rounded-md shadow-sm" title="زمان دقیق و رسمی ثبت‌شده در خروجی API (UTC و وقت ایران)">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[9px] text-amber-400/80 font-sans border-l border-amber-800/50 pl-1.5">
                          API TIME:
                        </span>
                        <span className="text-[11px] font-black tracking-wider text-amber-300">
                          {apiTimeUtc}
                        </span>
                        <span className="text-[10px] text-amber-400/80 border-r border-amber-800/50 pr-1.5">
                          {apiTimeIran}
                        </span>
                      </div>

                      {/* Last Detection Time directly from API */}
                      <div className="flex items-center space-x-1 space-x-reverse bg-[#141824] text-slate-300 border border-[#23293D] px-2.5 py-1 rounded-md text-[10px]" title="زمان تخلیه الکتریکی ثبت‌شده توسط دوربین‌های اپتیکال ماهواره در خروجی API">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>آخرین پالس API:</span>
                        <span className="text-emerald-400 font-bold">
                          {secondsAgo <= 2 ? "هم‌اکنون (زنده)" : `${secondsAgo} ثانیه پیش`}
                        </span>
                        <span className="text-slate-400 font-mono">({lastDetectionTimeUtc})</span>
                      </div>
                    </div>

                    {/* Stats & Instant Refresh */}
                    <div className="flex items-center space-x-2 space-x-reverse text-[10px] font-mono shrink-0">
                      <span className="bg-[#12141A] text-slate-400 px-2 py-0.5 rounded border border-[#212530]">
                        تعداد صاعقه‌ها: <strong className="text-amber-400">{lightningStats?.totalActiveFlashes ?? 0}</strong>
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            await eumetsatMtgService.refreshData();
                          } catch (e) {}
                        }}
                        className="flex items-center space-x-1 space-x-reverse bg-[#12141A] hover:bg-[#1A1D27] text-slate-300 hover:text-white px-2 py-0.5 rounded border border-[#212530] transition cursor-pointer"
                        title="بروزرسانی داده‌ها از API ماهواره"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-400" />
                        <span>تازه‌سازی API</span>
                      </button>
                    </div>
                  </div>

                  {/* Second Row: Time Filtering Shortcuts & Sensor Specifications */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto">
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">فیلتر بازه زمانی رصد:</span>
                      <div className="flex items-center space-x-1 space-x-reverse bg-[#12141A] p-0.5 rounded-md border border-[#212530]">
                        <button
                          onClick={() => setLightningTimeFilter("2m")}
                          className={`cursor-pointer px-2.5 py-1 rounded text-[10px] font-bold transition ${
                            lightningTimeFilter === "2m" 
                              ? "bg-amber-500 text-slate-950 shadow" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ⚡ ۲ دقیقه اخیر (تازه‌ترین)
                        </button>
                        <button
                          onClick={() => setLightningTimeFilter("5m")}
                          className={`cursor-pointer px-2.5 py-1 rounded text-[10px] font-bold transition ${
                            lightningTimeFilter === "5m" 
                              ? "bg-amber-500 text-slate-950 shadow" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ۵ دقیقه اخیر
                        </button>
                        <button
                          onClick={() => setLightningTimeFilter("15m")}
                          className={`cursor-pointer px-2.5 py-1 rounded text-[10px] font-bold transition ${
                            lightningTimeFilter === "15m" 
                              ? "bg-amber-500 text-slate-950 shadow" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ۱۵ دقیقه اخیر
                        </button>
                        <button
                          onClick={() => setLightningTimeFilter("all")}
                          className={`cursor-pointer px-2.5 py-1 rounded text-[10px] font-bold transition ${
                            lightningTimeFilter === "all" 
                              ? "bg-blue-600 text-white shadow" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ۳۰ دقیقه کامل (کل بافر زنده)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 space-x-reverse text-[9px] text-slate-400 font-mono w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-slate-400">
                        پوشش فعال: <span className="text-slate-300 font-bold">اروپا، ایران، خاورمیانه، آفریقا (OC1 - OC4)</span>
                      </span>
                      <span className="bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/30">
                        کانال نوری ۷۷۷.۴nm اکسیژن
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* FORECAST TIMELINE CONTROL PANEL (Bottom edge of map layout) */
                <div className="absolute bottom-4 left-4 right-4 z-30 bg-[#08090C]/95 backdrop-blur-md rounded-lg border border-[#1A1C23] p-3 shadow-2xl flex flex-col space-y-3" id="timeline-scrubber-hud">
                  {/* Top Row: Title, Playback buttons, and Step Size */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
                    <div className="flex items-center space-x-2 select-none shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-[10px] font-black text-slate-400 tracking-wider">FORECAST TIMELINE</span>
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold font-mono">
                        {formatForecastDate(timelineHour, { includeYear: true })}
                      </span>
                    </div>

                    {/* Playback & Step Controller */}
                    <div className="flex items-center space-x-1.5 bg-[#12141A] rounded border border-[#212530] p-0.5 shrink-0">
                      {/* Jump to first */}
                      <button
                        onClick={() => setTimelineHour(0)}
                        className="p-1 hover:bg-[#1A1D27] text-slate-400 hover:text-white rounded transition"
                        title="Jump to First (Today)"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>
                      {/* Step backward */}
                      <button
                        onClick={() => setTimelineHour(prev => Math.max(0, prev - timeStep))}
                        className="p-1 hover:bg-[#1A1D27] text-slate-400 hover:text-white rounded transition"
                        title="Step Backward"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      {/* Play/Pause */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-3 py-1 hover:bg-[#1A1D27] text-blue-400 border-x border-[#212530] transition flex items-center justify-center space-x-1 rounded-sm"
                        title={isPlaying ? "Pause Forecast Loop" : "Play Forecast Loop"}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-amber-500 hidden xs:inline">PAUSE</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-500 hidden xs:inline">PLAY</span>
                          </>
                        )}
                      </button>
                      {/* Step forward */}
                      <button
                        onClick={() => setTimelineHour(prev => Math.min(360, prev + timeStep))}
                        className="p-1 hover:bg-[#1A1D27] text-slate-400 hover:text-white rounded transition"
                        title="Step Forward"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {/* Jump to last */}
                      <button
                        onClick={() => setTimelineHour(360)}
                        className="p-1 hover:bg-[#1A1D27] text-slate-400 hover:text-white rounded transition"
                        title="Jump to Last (Day 15)"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Step Increment buttons */}
                    <div className="flex items-center space-x-1 bg-[#12141A] rounded p-0.5 border border-[#212530] shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black font-sans px-1 hidden sm:inline">STEP:</span>
                      {[1, 3, 6, 12, 24].map((step) => (
                        <button
                          key={step}
                          onClick={() => setTimeStep(step)}
                          className={`flex-1 sm:flex-initial px-2 py-0.5 rounded text-[9px] font-bold font-mono transition duration-150 ${
                            timeStep === step ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-200"
                          }`}
                        >
                          {step}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Second Row: Slider with reference ticks */}
                  <div className="relative h-7 flex items-end px-2">
                    <div className="absolute bottom-0 left-0 right-0 border-b border-[#1A1C23]" />
                    
                    {/* Active dynamic visual ticks/labels */}
                    <span className="absolute bottom-3 left-0 text-[9px] text-slate-500 font-bold font-mono">
                      Today
                    </span>
                    <span className="absolute bottom-3 left-[25%] text-[9px] text-slate-500 font-bold font-mono -translate-x-1/2 hidden sm:inline">
                      Day 4 ({formatForecastDate(96, { onlyDate: true, isShort: true })})
                    </span>
                    <span className="absolute bottom-3 left-[50%] text-[9px] text-slate-500 font-bold font-mono -translate-x-1/2 hidden sm:inline">
                      Day 8 ({formatForecastDate(192, { onlyDate: true, isShort: true })})
                    </span>
                    <span className="absolute bottom-3 left-[75%] text-[9px] text-slate-500 font-bold font-mono -translate-x-1/2 hidden sm:inline">
                      Day 11 ({formatForecastDate(264, { onlyDate: true, isShort: true })})
                    </span>
                    <span className="absolute bottom-3 right-0 text-[9px] text-slate-500 font-bold font-mono">
                      Day 15 ({formatForecastDate(360, { onlyDate: true, isShort: true })})
                    </span>

                    {/* Timeline slider itself */}
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step={timeStep}
                      value={timelineHour}
                      onChange={(e) => setTimelineHour(parseInt(e.target.value))}
                      className="absolute bottom-[-1px] left-0 right-0 w-full opacity-100 h-1.5 bg-transparent cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Third Row: Day List Shortcuts */}
                  <div className="hidden md:flex items-center justify-between border-t border-[#1A1C23] pt-2">
                    <div className="flex items-center space-x-2 w-28 shrink-0">
                      <span className="text-[10px] font-black text-slate-500 tracking-wider">JUMP TO DAY</span>
                    </div>
                    <div className="flex-1 flex justify-between items-center text-[9px] font-mono text-slate-500 px-4 overflow-x-auto custom-scrollbar gap-1.5 py-0.5">
                      {Array.from({ length: 16 }).map((_, day) => {
                        const hr = day * 24;
                        const isActive = Math.abs(timelineHour - hr) < 12; // active day highlight
                        const dateObj = new Date();
                        dateObj.setDate(dateObj.getDate() + day);
                        const formattedDay = dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" });
                        return (
                          <button
                            key={day}
                            onClick={() => setTimelineHour(hr)}
                            className={`cursor-pointer px-2 py-0.5 rounded transition whitespace-nowrap text-[9px] font-bold ${
                              isActive 
                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
                            }`}
                            title={`Jump to ${formattedDay}`}
                          >
                            {day === 0 ? "Today" : `D${day}`}
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-[120px] ml-4 flex justify-end text-[9px] text-slate-400 font-mono font-bold shrink-0">
                      <span className="bg-blue-950/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-900/30">Step +{timelineHour}h</span>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* RIGHT AREA (Sidebar Panel + Far Right Global Dock in a single container) */}
        <aside className="flex h-full shrink-0 border-l border-[#1A1C23] z-30 bg-[#08090C] overflow-hidden max-md:absolute max-md:right-0 max-md:top-0 max-md:bottom-0 max-md:h-full max-md:border-l-0 max-md:shadow-2xl" id="right-side-container">
          {/* Collapsible Config & Selection Panel */}
          {showLeftDrawer && (
            <div 
              className="bg-[#08090C] flex flex-col h-full overflow-hidden relative border-r border-[#1A1C23] max-w-[calc(100vw-56px)]" 
              id="right-sidebar-panel"
              style={{ width: `${drawerWidth}px` }}
            >
              {/* Left drag resizer handle */}
              <div 
                className={`absolute top-0 left-0 bottom-0 w-1.5 cursor-col-resize z-50 hover:bg-blue-500/40 active:bg-blue-500 transition-colors ${isResizing ? "bg-blue-500" : "bg-transparent"}`}
                onPointerDown={handleResizeStart}
                title="Drag to resize panel"
              />

              {activePanel === "layers" && (
                <LayerManagementPanel
                  activeLayers={activeLayers}
                  onAddLayer={handleAddActiveLayer}
                  onUpdateLayer={handleUpdateActiveLayer}
                  onRemoveLayer={handleRemoveActiveLayer}
                  onDuplicateLayer={handleDuplicateActiveLayer}
                  onReorderLayers={handleReorderActiveLayers}
                  onClearAllLayers={handleClearAllActiveLayers}
                  onClosePanel={() => setShowLeftDrawer(false)}
                />
              )}

              {activePanel === "layer_settings" && (
                <LayerSettingsPanel
                  activeLayers={activeLayers}
                  onUpdateActiveLayer={handleUpdateActiveLayer}
                  activeLayer={activeLayer}
                  layerOpacity={layerOpacity}
                  onOpacityChange={(val) => setLayerOpacity(val)}
                  minVal={minVal}
                  maxVal={maxVal}
                  onMinValChange={(val) => setMinVal(val)}
                  onMaxValChange={(val) => setMaxVal(val)}
                  colorScaleName={colorScaleName}
                  onColorScaleChange={(val) => setColorScaleName(val)}
                  onAnalyzeCoords={handlePerformAnalysis}
                  isAnalyzing={isAnalyzing}
                  visualizationStyle={visualizationStyle}
                  onVisualizationStyleChange={setVisualizationStyle}
                  heatmapRadius={heatmapRadius}
                  onHeatmapRadiusChange={setHeatmapRadius}
                  onClose={() => setShowLeftDrawer(false)}
                />
              )}

              {activePanel === "chat" && (
                <SidebarChat
                  currentCoords={currentCoords}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isSending={chatLoading}
                />
              )}

              {activePanel === "favorites" && (
                <div className="flex flex-col h-full p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">FAVORITE STATIONS</h3>
                    <button onClick={() => setShowLeftDrawer(false)} className="text-slate-500 hover:text-white md:hidden text-xs">Close</button>
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                    {favorites.map((fav, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCurrentCoords(fav.coords);
                          setLocationName(fav.name);
                        }}
                        className="p-2.5 rounded border border-[#1A1C23] bg-[#12141A]/40 hover:border-blue-500/50 cursor-pointer transition text-slate-300"
                      >
                        <div className="font-semibold">{fav.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {fav.coords.lat.toFixed(2)}°N, {fav.coords.lon.toFixed(2)}°E
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === "bookmarks" && (
                <div className="flex flex-col h-full p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">MAP BOOKMARKS</h3>
                    <button onClick={() => setShowLeftDrawer(false)} className="text-slate-500 hover:text-white md:hidden text-xs">Close</button>
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                    {bookmarks.map((b, i) => (
                      <div key={i} className="p-2.5 rounded border border-[#1A1C23] bg-[#12141A]/40 text-slate-300 text-xs flex justify-between items-center">
                        <span>{b}</span>
                        <Trash2 
                          className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 cursor-pointer"
                          onClick={() => setBookmarks(prev => prev.filter(item => item !== b))}
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const name = prompt("Enter bookmark tag name:");
                        if (name) setBookmarks(prev => [...prev, name]);
                      }}
                      className="w-full py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-semibold tracking-wider rounded border border-blue-500/20 uppercase"
                    >
                      + ADD CURRENT CONFIG
                    </button>
                  </div>
                </div>
              )}

              {activePanel === "alerts" && (
                <div className="flex flex-col h-full p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">SEVERE METEO ALERTS</h3>
                    <button onClick={() => setShowLeftDrawer(false)} className="text-slate-500 hover:text-white md:hidden text-xs">Close</button>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-2.5 rounded bg-red-950/20 border border-red-500/30 text-red-400 text-[11px] leading-relaxed">
                      <div className="flex items-center space-x-1.5 font-bold mb-1">
                        <TriangleAlert className="w-4 h-4 text-red-500" />
                        <span>High Wind Advisory</span>
                      </div>
                      Atmospheric shear vector forces exceeding 25m/s forecasted in northern marine sectors. Small vessel warnings active.
                    </div>
                    <div className="p-2.5 rounded bg-amber-950/15 border border-amber-500/20 text-amber-400 text-[11px] leading-relaxed">
                      <div className="flex items-center space-x-1.5 font-bold mb-1">
                        <TriangleAlert className="w-4 h-4 text-amber-500" />
                        <span>Jet Stream Instability</span>
                      </div>
                      Upper level cyclonic friction developing in Central Asian mountain troughs. Severe air turbulence warnings in effect.
                    </div>
                  </div>
                </div>
              )}

              {activePanel === "profile" && (
                <div className="flex flex-col h-full p-4 space-y-3 text-slate-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">OPERATOR IDENTITY</h3>
                    <button onClick={() => setShowLeftDrawer(false)} className="text-slate-500 hover:text-white md:hidden text-xs">Close</button>
                  </div>
                  <div className="space-y-2.5 p-3 rounded bg-[#07080B] border border-[#1A1C23] text-[11px]">
                    <div className="flex justify-between border-b border-[#1A1C23]/40 pb-1.5">
                      <span className="text-slate-500">Operator Email</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[150px]">mhmdsalhy631@gmail.com</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A1C23]/40 pb-1.5">
                      <span className="text-slate-500">Clearance Node</span>
                      <span className="font-bold text-emerald-400 font-mono">LEVEL 3 (ADMIN)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Node IP</span>
                      <span className="font-mono text-slate-400">10.128.0.35</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-relaxed pt-2">
                    Authorized meteorology terminal connected to primary GRIB and GFS forecast dataset feeds at NOAA. 
                  </div>
                </div>
              )}

              {activePanel === "notes" && (
                <SidebarNotes
                  currentCoords={currentCoords}
                  activeLayer={activeLayer}
                  onCoordsChange={(coords) => {
                    setCurrentCoords(coords);
                    setLocationName(`Coordinates: ${coords.lat.toFixed(3)}°N, ${coords.lon.toFixed(3)}°E`);
                  }}
                />
              )}

              {activePanel === "news" && (
                <SidebarNews
                  currentCoords={currentCoords}
                  activeLayer={activeLayer}
                  onFocusLocation={(coords) => {
                    setCurrentCoords(coords);
                    setLocationName(`Location focus: ${coords.lat.toFixed(3)}°N, ${coords.lon.toFixed(3)}°E`);
                  }}
                  onCopyToNotes={(text) => {
                    const savedNotes = localStorage.getItem("meteo_notes");
                    let parsed = [];
                    if (savedNotes) {
                      try {
                        parsed = JSON.parse(savedNotes);
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    if (parsed.length === 0) {
                      parsed.push({
                        id: Math.random().toString(36).substring(2, 11),
                        title: "Synced Bulletins Note",
                        content: `<div>${text}</div>`,
                        createdAt: new Date().toLocaleDateString("en-US"),
                        updatedAt: new Date().toLocaleDateString("en-US")
                      });
                    } else {
                      parsed[0].content += `<div><br></div><div>${text}</div>`;
                      parsed[0].updatedAt = new Date().toLocaleDateString("en-US");
                    }
                    localStorage.setItem("meteo_notes", JSON.stringify(parsed));
                    window.dispatchEvent(new CustomEvent("meteo-notes-updated"));
                  }}
                />
              )}

            </div>
          )}

          {/* 3. FAR RIGHT GLOBAL UTILITY NAVIGATION PANEL BAR */}
          <div className="w-14 bg-[#08090C] flex flex-col items-center py-2 space-y-1.5 shrink-0 h-full border-l border-[#1A1C23]/50" id="far-right-global-dock">
            <div className="text-[7.5px] text-slate-500 uppercase font-black tracking-widest mb-1 select-none text-center">GIS Dock</div>

            {/* Layers tab */}
            <button
              onClick={() => {
                if (activePanel === "layers" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("layers");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition ${
                activePanel === "layers" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Layer Catalog & Stack"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">Layers</span>
            </button>

            {/* Notes tab (Pencil on paper / notebook icon - Second position) */}
            <button
              onClick={() => {
                if (activePanel === "notes" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("notes");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition relative ${
                activePanel === "notes" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Meteorological Notes & Journal"
            >
              <NotebookPen className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">Notes</span>
            </button>

            {/* Layer Settings & Styling tab */}
            <button
              onClick={() => {
                if (activePanel === "layer_settings" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("layer_settings");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition ${
                activePanel === "layer_settings" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="تنظیمات لایه‌ها / Layer Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">Style</span>
            </button>

            {/* AI Chat assistant tab */}
            <button
              onClick={() => {
                if (activePanel === "chat" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("chat");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition relative ${
                activePanel === "chat" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Meteo AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">AI Chat</span>
            </button>

            {/* Favorites tab */}
            <button
              onClick={() => {
                if (activePanel === "favorites" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("favorites");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition ${
                activePanel === "favorites" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Favorite Stations"
            >
              <Star className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">Favorites</span>
            </button>

            {/* Bookmarks tab */}
            <button
              onClick={() => {
                if (activePanel === "bookmarks" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("bookmarks");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition ${
                activePanel === "bookmarks" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="My Config Bookmarks"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">Saves</span>
            </button>

            {/* News Tab */}
            <button
              onClick={() => {
                if (activePanel === "news" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("news");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition relative ${
                activePanel === "news" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Synoptic News & Bulletins"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">News</span>
            </button>

            {/* Active Alerts */}
            <button
              onClick={() => {
                if (activePanel === "alerts" && showLeftDrawer) {
                  setShowLeftDrawer(false);
                } else {
                  setActivePanel("alerts");
                  setShowLeftDrawer(true);
                }
              }}
              className={`w-14 py-1.5 flex flex-col items-center transition relative ${
                activePanel === "alerts" && showLeftDrawer
                  ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              title="Warning Advisories"
            >
              <TriangleAlert className="w-3.5 h-3.5" />
              <span className="text-[7.5px] font-medium tracking-tight">Alerts</span>
              <span className="absolute top-1 right-3 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            </button>

            {/* Profile tab (Bottom) */}
            <div className="mt-auto pt-2 border-t border-[#1A1C23] w-full flex flex-col items-center">
              <button
                onClick={() => {
                  if (activePanel === "profile" && showLeftDrawer) {
                    setShowLeftDrawer(false);
                  } else {
                    setActivePanel("profile");
                    setShowLeftDrawer(true);
                  }
                }}
                className={`w-14 py-1.5 flex flex-col items-center transition ${
                  activePanel === "profile" && showLeftDrawer
                    ? "bg-blue-600/15 text-blue-400 border-r-2 border-blue-500 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
                title="Operator Identity"
              >
                <User className="w-3.5 h-3.5" />
                <span className="text-[7.5px] font-medium tracking-tight">Profile</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. BASE ANALYTICAL STATUS BAR FOOTER */}
      <footer className="h-8 bg-[#040507] border-t border-[#1A1C23] flex items-center justify-between px-4 text-[10px] text-slate-500 shrink-0 z-50 shadow-inner" id="global-status-bar">
        {/* Left Side: GFS Data Feed status */}
        <div className="flex items-center space-x-5 select-none">
          <div className="flex items-center space-x-1.5">
            <span>Model:</span>
            <span className="font-semibold text-slate-300 font-mono">GFS 0.25° Grid</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-emerald-500 font-bold uppercase text-[9px]">Active feed</span>
          </div>
          <span className="text-slate-800">|</span>
          <div>
            <span>Run Sync:</span>
            <span className="font-semibold text-slate-300 ml-1 font-mono">10 min ago</span>
          </div>
        </div>

        {/* Center Readouts: Mouse Focus geography details (Only shown when hovering on map) */}
        {hoverCoords ? (
          <div className="flex items-center space-x-6 font-mono text-[9px] select-all">
            <div>
              <span className="text-slate-500 uppercase tracking-widest">Lat:</span>
              <span className="font-bold text-slate-300 ml-1">{hoverCoords.lat.toFixed(4)}° N</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <div>
              <span className="text-slate-500 uppercase tracking-widest">Lon:</span>
              <span className="font-bold text-slate-300 ml-1">{hoverCoords.lon.toFixed(4)}° E</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <div>
              <span className="text-slate-500 uppercase tracking-widest">Elevation:</span>
              <span className="font-bold text-slate-300 ml-1">{hoverCoords.elevation} m</span>
            </div>
          </div>
        ) : (
          <div className="h-4" />
        )}

        {/* Right Readouts: Metric system, interface language */}
        <div className="flex items-center space-x-5 select-none">
          <div className="cursor-pointer hover:text-slate-300 transition duration-150">
            <span>System:</span>
            <span className="font-bold text-slate-300 ml-1">Metric (°C, m/s, hPa)</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-300 transition duration-150">
            <span>Language:</span>
            <span className="font-bold text-slate-300 font-mono">English</span>
            <span className="text-[8px] text-slate-500">▼</span>
          </div>
        </div>
      </footer>

      {/* Screenshot Preview, Annotation and Export Modal */}
      <ScreenshotModal
        isOpen={screenshotModalOpen}
        onClose={() => setScreenshotModalOpen(false)}
        capturedImage={capturedScreenshot}
        metadata={{
          locationName: locationName,
          coords: currentCoords,
          activeLayer: activeLayer,
          forecastStep: timelineHour,
          dateStr: formatForecastDate(timelineHour, { includeYear: true }),
          forecast: currentWeather,
          activeLayers: activeLayers,
        }}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-12 right-6 z-[100] px-4 py-2.5 rounded-lg shadow-2xl text-xs font-sans flex items-center gap-2 border backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 text-rose-200 border-rose-500/40"
              : "bg-blue-950/90 text-blue-200 border-blue-500/40"
          }`}
        >
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
