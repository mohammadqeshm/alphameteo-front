import { Coordinate, WeatherLayer } from "../types";

export type CanvasItemType = 
  | "live_map"
  | "map_snapshot"
  | "climate_index"
  | "chart"
  | "image"
  | "text"
  | "annotation"
  | "frame";

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number; // 0.1 to 4.0 (10% to 400%)
}

export interface SyncGroup {
  id: string;
  name: string;
  color: string;
  syncCoords: boolean;
  syncTime: boolean;
  coords?: Coordinate;
  zoom?: number;
  forecastHour?: number;
}

export interface BaseCanvasItem {
  id: string;
  type: CanvasItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isLocked?: boolean;
  frameId?: string;
  title?: string;
  createdAt: number;
}

export interface LiveMapCanvasItem extends BaseCanvasItem {
  type: "live_map";
  coords: Coordinate;
  zoom: number;
  activeLayerId: string;
  model: string;
  run: string;
  forecastHour: number;
  level: string; // e.g. "surface", "500hPa", "850hPa", "250hPa"
  colorScaleName?: string;
  visualizationStyle?: "continuous" | "discrete" | "raw_pixel";
  layerOpacity?: number;
  syncGroupId?: string;
}

export interface MapSnapshotCanvasItem extends BaseCanvasItem {
  type: "map_snapshot";
  imageUrl: string;
  parameterName: string;
  sourceModel: string;
  modelRun: string;
  validTime: string;
  forecastHour: number;
  level?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  notes?: string;
}

export type ClimateIndexId = 
  | "nino12" 
  | "nino3" 
  | "nino34" 
  | "nino4" 
  | "oni" 
  | "soi" 
  | "mjo" 
  | "iod" 
  | "nao" 
  | "ao" 
  | "pna" 
  | "pdo" 
  | "amo";

export interface ClimateIndexCanvasItem extends BaseCanvasItem {
  type: "climate_index";
  indexId: ClimateIndexId;
  viewMode: "summary" | "timeseries" | "anomaly" | "phase_diagram";
  dataSource: "NOAA CPC" | "BOM Australia" | "ECMWF Copernicus" | "JMA";
}

export type ChartType = 
  | "sounding" 
  | "meteogram" 
  | "ensemble_plume" 
  | "time_series" 
  | "hodograph";

export interface ChartCanvasItem extends BaseCanvasItem {
  type: "chart";
  chartType: ChartType;
  locationName: string;
  coords: Coordinate;
  parameter?: string;
  model: string;
  timeRangeDays?: number;
}

export interface ImageCanvasItem extends BaseCanvasItem {
  type: "image";
  src: string;
  caption?: string;
  isStaticReference?: boolean;
  aspectRatio?: number;
}

export interface TextCanvasItem extends BaseCanvasItem {
  type: "text";
  content: string;
  textRole: "h1" | "h2" | "body" | "callout" | "caption";
  backgroundColor?: string;
  textColor?: string;
}

export type AnnotationShape = 
  | "arrow" 
  | "front_cold" 
  | "front_warm" 
  | "front_occluded" 
  | "trough_axis" 
  | "ridge_axis" 
  | "convective_watch" 
  | "sticky_note";

export interface AnnotationCanvasItem extends BaseCanvasItem {
  type: "annotation";
  shape: AnnotationShape;
  color: string;
  strokeWidth?: number;
  text?: string;
  points?: Array<{ x: number; y: number }>;
}

export interface FrameCanvasItem extends BaseCanvasItem {
  type: "frame";
  title: string;
  colorTheme: "default" | "cyan" | "amber" | "rose" | "purple";
  description?: string;
}

export type CanvasItem = 
  | LiveMapCanvasItem
  | MapSnapshotCanvasItem
  | ClimateIndexCanvasItem
  | ChartCanvasItem
  | ImageCanvasItem
  | TextCanvasItem
  | AnnotationCanvasItem
  | FrameCanvasItem;

export interface CanvasDocument {
  id: string;
  name: string;
  description?: string;
  items: CanvasItem[];
  viewport: CanvasViewport;
  syncGroups: SyncGroup[];
  createdAt: number;
  updatedAt: number;
}

export type CanvasTool = 
  | "select" 
  | "hand" 
  | "frame" 
  | "live_map" 
  | "climate_index" 
  | "chart" 
  | "text" 
  | "annotation" 
  | "image";

export interface CanvasHistoryState {
  past: CanvasItem[][];
  present: CanvasItem[];
  future: CanvasItem[][];
}
