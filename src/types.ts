export interface Coordinate {
  lat: number;
  lon: number;
  elevation: number;
  zoom?: number;
}

export interface WeatherForecast {
  temperature: number; // °C
  windSpeed: number;   // m/s
  windDirection: number; // degrees
  pressure: number;    // hPa
  precipitation: number; // mm
  clouds: number;      // %
  humidity: number;    // %
  waves: number;       // meters
  cape?: number;       // J/kg
  dewPoint?: number;   // °C
  visibility?: number; // km
  gust?: number;       // m/s
}

export interface WeatherLayer {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  description: string;
  defaultValue?: number;
  gradient?: string;
  thumbnail?: string;
  icon?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  description: string;
  badge?: string;
  sourceCount: number;
}

export interface DataSourceModel {
  id: string;
  categoryId: string;
  name: string;
  shortName: string;
  provider: string; // e.g. ECMWF, NOAA, DWD, Météo-France, etc.
  spatialResolution: string; // e.g. 0.1° (9km), 3km, 0.25°
  temporalResolution: string; // e.g. Hourly, 3-hourly, 6-hourly
  forecastHorizon: string; // e.g. 10 Days, 16 Days, 18 Hours
  updateFrequency: string; // e.g. 4x daily (00Z, 06Z, 12Z, 18Z)
  description: string;
  badge?: string;
  isFavorite?: boolean;
  supportedVariableIds: string[];
}

export interface VerticalLevel {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  type: 'surface' | 'isobaric' | 'height' | 'column' | 'ocean_depth';
  altitudeKm?: number;
}

export interface WeatherVariable {
  id: string;
  name: string;
  shortName: string;
  category: string;
  unit: string;
  description: string;
  iconName: string;
  supportedLevelIds: string[];
  defaultLevelId: string;
  defaultVisualizationId: VisualizationTypeEnum;
  defaultPaletteId: string;
  min: number;
  max: number;
  isFavorite?: boolean;
}

export type VisualizationTypeEnum =
  | 'smooth_gradient'
  | 'discrete_colors'
  | 'native_grid'
  | 'pixel_grid'
  | 'filled_contours'
  | 'contour_lines'
  | 'heatmap'
  | 'wind_particles'
  | 'wind_barbs'
  | 'vector_arrows'
  | 'streamlines'
  | 'animated_flow'
  | 'shaded_relief';

export interface VisualizationOption {
  id: VisualizationTypeEnum;
  name: string;
  description: string;
  iconName: string;
  category: 'raster' | 'vector' | 'contour' | 'particle' | 'grid';
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // HEX or CSS color codes
  category: 'thermal' | 'radar' | 'satellite' | 'precipitation' | 'severe' | 'wind' | 'marine' | 'neutral';
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'color-dodge'
  | 'hard-light'
  | 'difference';

export interface ActiveLayer {
  instanceId: string;
  categoryId: string;
  sourceId: string;
  sourceName: string;
  variableId: string;
  variableName: string;
  variableUnit: string;
  levelId: string;
  levelName: string;
  visualizationId: VisualizationTypeEnum;
  visualizationName: string;
  paletteId: string;
  paletteColors: string[];
  opacity: number; // 0 - 100
  visible: boolean;
  locked: boolean;
  zIndex: number;
  brightness: number; // 50 - 150 %
  contrast: number; // 50 - 150 %
  saturation: number; // 0 - 200 %
  invertPalette: boolean;
  blendMode: BlendMode;
  timelineSync: 'main' | 'static' | 'offset_12h';
  customLabel?: string;
  groupId?: string;
  minVal: number;
  maxVal: number;
  dateCreated: number;
}

export interface LayerGroup {
  id: string;
  name: string;
  collapsed: boolean;
  visible: boolean;
}

export interface PresetWorkstation {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  layers: Partial<ActiveLayer>[];
}

export interface ChatMessageAction {
  name: string;
  args: Record<string, any>;
  summary: string;
  status?: "pending" | "executed" | "failed";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  actions?: ChatMessageAction[];
  groundingSources?: Array<{ title: string; url: string }>;
  isAgentExecuting?: boolean;
}

export type ActivePanel = "layers" | "layer_settings" | "chat" | "favorites" | "bookmarks" | "alerts" | "profile" | "notes" | "news";

export type ToolbarTool =
  | "select"
  | "ruler"
  | "distance"
  | "bearing"
  | "area"
  | "point"
  | "line"
  | "rectangle"
  | "polygon"
  | "circle"
  | "box"
  | "text"
  | "pencil"
  | "eraser";

export interface DrawingItem {
  id: string;
  type: ToolbarTool;
  coordinates: [number, number][]; // lat, lon
  properties?: {
    text?: string;
    radius?: number;
    elevation?: number;
    color?: string;
    size?: number;
  };
}

export type SplitLayoutMode = 'single' | 'dual' | 'triple' | 'quad';

export interface MapPaneState {
  id: string;
  title: string;
  activeLayer: WeatherLayer;
  layerOpacity: number;
  minVal: number;
  maxVal: number;
  colorScaleName: string;
  visualizationStyle: "raw_pixel" | "discrete" | "continuous";
  activeLayers: ActiveLayer[];
  coords: Coordinate;
}

export interface LightningStrike {
  id: string;
  lat: number;
  lon: number;
  timeMs: number;
  delay: number;
  region: number;
  detectorsCount: number;
  polarity: number;
  receivedAt: number;
}

export interface LightningStats {
  connected: boolean;
  server?: string;
  totalActiveStrikes: number;
  strikesPerMinute: number;
  activeSseClients: number;
}


