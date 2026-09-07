import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Coordinate, WeatherLayer, ToolbarTool, DrawingItem } from "../types";
import { ZoomIn, ZoomOut, Compass, Maximize2, Crosshair, MapPin, Lock, Unlock } from "lucide-react";

// 300 deterministic random sample points across the map (Middle East & Iran bounding area)
const DEMO_POINTS = Array.from({ length: 300 }, (_, i) => {
  const seedLat = Math.sin(i * 123.456 + 7.89) * 10000;
  const seedLon = Math.cos(i * 456.789 + 1.23) * 10000;
  const lat = 22 + (seedLat - Math.floor(seedLat)) * 21; // range 22 to 43
  const lon = 40 + (seedLon - Math.floor(seedLon)) * 26; // range 40 to 66
  const baseValue = 5 + ((Math.sin(i * 98.76) + 1) / 2) * 90; // intensity 5 to 95
  return { lat, lon, value: baseValue };
});

// Create cache for the hour-based calculations to optimize canvas rendering speed dramatically
let cachedHour = -999;
const cachedDemoValues = new Float32Array(300);

const GRID_LAT_MIN = 15.0;
const GRID_LAT_MAX = 48.0;
const GRID_LON_MIN = 35.0;
const GRID_LON_MAX = 72.0;
const GRID_W = 185;
const GRID_H = 165;

const densityGrid = new Float32Array(GRID_W * GRID_H);

const updateDensityGrid = (hour: number, radius: number) => {
  if (cachedHour !== hour) {
    cachedHour = hour;
    for (let i = 0; i < DEMO_POINTS.length; i++) {
      const pt = DEMO_POINTS[i];
      const timeWave = Math.sin(hour * 0.12 + i * 0.7) * 12;
      cachedDemoValues[i] = Math.max(0, Math.min(100, pt.value + timeWave));
    }
  }

  densityGrid.fill(0);

  for (let i = 0; i < DEMO_POINTS.length; i++) {
    const pt = DEMO_POINTS[i];
    const ptVal = cachedDemoValues[i];

    const minCol = Math.max(0, Math.floor(((pt.lon - radius) - GRID_LON_MIN) / (GRID_LON_MAX - GRID_LON_MIN) * (GRID_W - 1)));
    const maxCol = Math.min(GRID_W - 1, Math.ceil(((pt.lon + radius) - GRID_LON_MIN) / (GRID_LON_MAX - GRID_LON_MIN) * (GRID_W - 1)));
    const minRow = Math.max(0, Math.floor(((pt.lat - radius) - GRID_LAT_MIN) / (GRID_LAT_MAX - GRID_LAT_MIN) * (GRID_H - 1)));
    const maxRow = Math.min(GRID_H - 1, Math.ceil(((pt.lat + radius) - GRID_LAT_MIN) / (GRID_LAT_MAX - GRID_LAT_MIN) * (GRID_H - 1)));

    for (let row = minRow; row <= maxRow; row++) {
      const nodeLat = GRID_LAT_MIN + (row / (GRID_H - 1)) * (GRID_LAT_MAX - GRID_LAT_MIN);
      const dLat = nodeLat - pt.lat;
      const dLat2 = dLat * dLat;

      for (let col = minCol; col <= maxCol; col++) {
        const nodeLon = GRID_LON_MIN + (col / (GRID_W - 1)) * (GRID_LON_MAX - GRID_LON_MIN);
        const dLon = nodeLon - pt.lon;
        const dist2 = dLat2 + dLon * dLon;

        if (dist2 < radius * radius) {
          const dist = Math.sqrt(dist2);
          const pct = 1 - (dist / radius);
          const weight = pct * pct * (3 - 2 * pct); // smoothstep
          
          densityGrid[row * GRID_W + col] += ptVal * weight;
        }
      }
    }
  }
};

const getDensityValue = (lat: number, lon: number) => {
  if (lat < GRID_LAT_MIN || lat > GRID_LAT_MAX || lon < GRID_LON_MIN || lon > GRID_LON_MAX) {
    return 0;
  }

  const c = ((lon - GRID_LON_MIN) / (GRID_LON_MAX - GRID_LON_MIN)) * (GRID_W - 1);
  const r = ((lat - GRID_LAT_MIN) / (GRID_LAT_MAX - GRID_LAT_MIN)) * (GRID_H - 1);

  const c0 = Math.floor(c);
  const c1 = Math.min(GRID_W - 1, c0 + 1);
  const r0 = Math.floor(r);
  const r1 = Math.min(GRID_H - 1, r0 + 1);

  const tc = c - c0;
  const tr = r - r0;

  const v00 = densityGrid[r0 * GRID_W + c0];
  const v01 = densityGrid[r0 * GRID_W + c1];
  const v10 = densityGrid[r1 * GRID_W + c0];
  const v11 = densityGrid[r1 * GRID_W + c1];

  const v_r0 = v00 * (1 - tc) + v01 * tc;
  const v_r1 = v10 * (1 - tc) + v11 * tc;

  return v_r0 * (1 - tr) + v_r1 * tr;
};

interface MeteoMapProps {
  currentCoords: Coordinate;
  onCoordsChange: (coords: Coordinate) => void;
  onHoverCoordsChange?: (coords: Coordinate | null) => void;
  activeLayer: WeatherLayer;
  layerOpacity: number;
  activeTool: ToolbarTool;
  onDrawingAdded?: (item: DrawingItem) => void;
  drawings: DrawingItem[];
  setDrawings: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
  timelineHour: number; // to animate weather based on GFS hour
  mapLocked: boolean;
  onMapLockToggle: (locked: boolean) => void;
  visualizationStyle?: "raw_pixel" | "discrete" | "continuous" | "contour_lines" | "filled_contour";
  colorScaleName?: string;
  minVal: number;
  maxVal: number;
  heatmapRadius?: number;
}

export const MeteoMap: React.FC<MeteoMapProps> = ({
  currentCoords,
  onCoordsChange,
  onHoverCoordsChange,
  activeLayer,
  layerOpacity,
  activeTool,
  onDrawingAdded,
  drawings,
  setDrawings,
  timelineHour,
  mapLocked,
  onMapLockToggle,
  visualizationStyle = "continuous",
  colorScaleName = "Thermal",
  minVal,
  maxVal,
  heatmapRadius = 3.5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const mapLockedRef = useRef(mapLocked);
  const activeToolRef = useRef(activeTool);
  const onHoverCoordsChangeRef = useRef(onHoverCoordsChange);

  useEffect(() => {
    mapLockedRef.current = mapLocked;
  }, [mapLocked]);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    onHoverCoordsChangeRef.current = onHoverCoordsChange;
  }, [onHoverCoordsChange]);

  // Pencil brush settings
  const [pencilColor, setPencilColor] = useState<string>("#EF4444"); // default red
  const [pencilSize, setPencilSize] = useState<number>(4); // default 4px (Medium)

  const pencilColorRef = useRef(pencilColor);
  const pencilSizeRef = useRef(pencilSize);

  useEffect(() => {
    pencilColorRef.current = pencilColor;
  }, [pencilColor]);

  useEffect(() => {
    pencilSizeRef.current = pencilSize;
  }, [pencilSize]);

  // Drawing selection and drag-resizing states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const drawingsRef = useRef<DrawingItem[]>([]);
  useEffect(() => {
    drawingsRef.current = drawings;
  }, [drawings]);

  const [dragInfo, setDragInfo] = useState<{
    itemId: string;
    cornerIndex: number;
  } | null>(null);
  const dragInfoRef = useRef<{
    itemId: string;
    cornerIndex: number;
  } | null>(null);
  useEffect(() => {
    dragInfoRef.current = dragInfo;
  }, [dragInfo]);

  // Lock or Unlock map interactions dynamically
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (mapLocked || activeTool === "pencil") {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    } else {
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.dragRotate.enable();
      map.keyboard.enable();
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
    }
  }, [mapLocked, activeTool, mapRef.current]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLinePoints, setCurrentLinePoints] = useState<[number, number][]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use reliable CartoDB Dark Matter style with preserveDrawingBuffer enabled for screenshot capture
    const darkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "carto-dark": {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors, © CARTO"
        }
      },
      layers: [
        {
          id: "carto-dark-layer",
          type: "raster",
          source: "carto-dark",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: darkStyle,
      center: [currentCoords.lon, currentCoords.lat],
      zoom: 5.5,
      pitch: 0,
      attributionControl: false,
      preserveDrawingBuffer: true,
      canvasContextAttributes: {
        preserveDrawingBuffer: true,
        antialias: true,
        powerPreference: "high-performance"
      },
      transformRequest: (url: string) => {
        return { url };
      }
    } as any);

    mapRef.current = map;

    // Attach instance and direct screenshot helpers onto the DOM container
    if (mapContainerRef.current) {
      (mapContainerRef.current as any).__mapInstance = map;
      (mapContainerRef.current as any).__canvasOverlay = canvasOverlayRef.current;
    }

    // Add navigation controls
    map.on("load", () => {
      // Listen for map moveend to sync coordinate panning
      map.on("moveend", () => {
        if (mapLockedRef.current) return;
        const center = map.getCenter();
        const newLat = parseFloat(center.lat.toFixed(4));
        const newLon = parseFloat(center.lng.toFixed(4));
        const approxElevation = Math.round(Math.abs(Math.sin(newLat * 2) * Math.cos(newLon * 3)) * 2400 + 40);
        onCoordsChange({ lat: newLat, lon: newLon, elevation: approxElevation });
      });

      // Map click handler
      map.on("click", (e) => {
        if (mapLockedRef.current) return;

        const { lng, lat } = e.lngLat;
        // Fetch approximate elevation
        const approxElevation = Math.round(Math.abs(Math.sin(lat * 2) * Math.cos(lng * 3)) * 2400 + 40);
        
        // If GIS drawing tools are active, let drawing logic handle it
        if (activeToolRef.current !== "select") {
          // Ignore clicks for pencil since we use drag-drawing
          if (activeToolRef.current !== "pencil") {
            handleMapGisClick(lat, lng);
          }
        } else {
          // SELECT TOOL ACTIVE - click to select drawing
          let clickedItemId: string | null = null;
          
          for (let i = drawingsRef.current.length - 1; i >= 0; i--) {
            const item = drawingsRef.current[i];
            
            if (item.type === "rectangle" && item.coordinates.length > 1) {
              const [c1, c2] = item.coordinates;
              const minLat = Math.min(c1[0], c2[0]);
              const maxLat = Math.max(c1[0], c2[0]);
              const minLon = Math.min(c1[1], c2[1]);
              const maxLon = Math.max(c1[1], c2[1]);
              
              if (lat >= minLat && lat <= maxLat && lng >= minLon && lng <= maxLon) {
                clickedItemId = item.id;
                break;
              }
            } else if (item.type === "circle" && item.coordinates.length > 0) {
              const center = item.coordinates[0];
              const distKm = haversineDistance(center, [lat, lng]);
              const radiusKm = item.properties?.radius || 120;
              if (distKm <= radiusKm) {
                clickedItemId = item.id;
                break;
              }
            } else if (item.type === "point" && item.coordinates.length > 0) {
              const ptCoord = item.coordinates[0];
              const pPt = map.project([ptCoord[1], ptCoord[0]]);
              const pClick = e.point;
              if (Math.hypot(pClick.x - pPt.x, pClick.y - pPt.y) <= 15) {
                clickedItemId = item.id;
                break;
              }
            } else {
              // For pencil and lines
              for (const ptCoord of item.coordinates) {
                const pPt = map.project([ptCoord[1], ptCoord[0]]);
                const pClick = e.point;
                if (Math.hypot(pClick.x - pPt.x, pClick.y - pPt.y) <= 15) {
                  clickedItemId = item.id;
                  break;
                }
              }
              if (clickedItemId) break;
            }
          }
          
          if (clickedItemId) {
            setSelectedId(clickedItemId);
          } else {
            // Only deselect if we did not start a drag
            if (!dragInfoRef.current) {
              setSelectedId(null);
              // Fallback to standard coordinate focus shift
              onCoordsChange({ lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lng.toFixed(4)), elevation: approxElevation });
            }
          }
        }
      });

      // Freehand Pencil Drawing & Select Drag events
      let isDrawingPencil = false;
      let pencilPoints: [number, number][] = [];

      map.on("mousedown", (e) => {
        if (activeToolRef.current === "pencil") {
          isDrawingPencil = true;
          const { lat, lng } = e.lngLat;
          pencilPoints = [[lat, lng]];
          setCurrentLinePoints([[lat, lng]]);
        } else if (activeToolRef.current === "select" && selectedIdRef.current) {
          // Check if click was close to a handle of the selected rectangle
          const item = drawingsRef.current.find((d) => d.id === selectedIdRef.current);
          if (item && item.type === "rectangle" && item.coordinates.length > 1) {
            const p1 = map.project([item.coordinates[0][1], item.coordinates[0][0]]);
            const p2 = map.project([item.coordinates[1][1], item.coordinates[1][0]]);
            const handles = [
              { x: p1.x, y: p1.y },
              { x: p2.x, y: p1.y },
              { x: p2.x, y: p2.y },
              { x: p1.x, y: p2.y }
            ];
            const clickPt = e.point;
            for (let i = 0; i < handles.length; i++) {
              const dist = Math.hypot(clickPt.x - handles[i].x, clickPt.y - handles[i].y);
              if (dist <= 15) {
                setDragInfo({ itemId: item.id, cornerIndex: i });
                map.dragPan.disable();
                return;
              }
            }
          }
        }
      });

      map.on("mousemove", (e) => {
        const { lng, lat } = e.lngLat;
        const hoverLat = parseFloat(lat.toFixed(4));
        const hoverLon = parseFloat(lng.toFixed(4));
        const approxElevation = Math.round(Math.abs(Math.sin(hoverLat * 2) * Math.cos(hoverLon * 3)) * 2400 + 40);
        if (onHoverCoordsChangeRef.current) {
          onHoverCoordsChangeRef.current({ lat: hoverLat, lon: hoverLon, elevation: approxElevation });
        }

        if (activeToolRef.current === "pencil" && isDrawingPencil) {
          const lastPt = pencilPoints[pencilPoints.length - 1];
          if (!lastPt || Math.hypot(lat - lastPt[0], lng - lastPt[1]) > 0.0005) {
            pencilPoints.push([lat, lng]);
            setCurrentLinePoints([...pencilPoints]);
          }
        } else if (activeToolRef.current === "select" && dragInfoRef.current) {
          const { itemId, cornerIndex } = dragInfoRef.current;
          
          setDrawings((prev) => {
            return prev.map((item) => {
              if (item.id === itemId && item.type === "rectangle") {
                const newCoords = [...item.coordinates] as [[number, number], [number, number]];
                if (cornerIndex === 0) {
                  newCoords[0] = [lat, lng];
                } else if (cornerIndex === 1) {
                  newCoords[0] = [lat, newCoords[0][1]];
                  newCoords[1] = [newCoords[1][0], lng];
                } else if (cornerIndex === 2) {
                  newCoords[1] = [lat, lng];
                } else if (cornerIndex === 3) {
                  newCoords[0] = [newCoords[0][0], lng];
                  newCoords[1] = [lat, newCoords[1][1]];
                }
                return { ...item, coordinates: newCoords };
              }
              return item;
            });
          });
        }
      });

      const finishPencilOrDrag = () => {
        if (activeToolRef.current === "pencil" && isDrawingPencil) {
          isDrawingPencil = false;
          if (pencilPoints.length > 1) {
            const newItem: DrawingItem = {
              id: Math.random().toString(36).substr(2, 9),
              type: "pencil",
              coordinates: [...pencilPoints],
              properties: {
                color: pencilColorRef.current,
                size: pencilSizeRef.current,
              }
            };
            setDrawings((prev) => [...prev, newItem]);
          }
          pencilPoints = [];
          setCurrentLinePoints([]);
        } else if (activeToolRef.current === "select" && dragInfoRef.current) {
          setDragInfo(null);
          if (!mapLockedRef.current) {
            map.dragPan.enable();
          }
        }
      };

      map.on("mouseup", finishPencilOrDrag);
      map.on("mouseleave", () => {
        finishPencilOrDrag();
        if (onHoverCoordsChangeRef.current) {
          onHoverCoordsChangeRef.current(null);
        }
      });

      // Support Touch for mobile freehand pencil drawing & resize
      map.on("touchstart", (e) => {
        if (activeToolRef.current === "pencil") {
          isDrawingPencil = true;
          const { lat, lng } = e.lngLat;
          pencilPoints = [[lat, lng]];
          setCurrentLinePoints([[lat, lng]]);
        } else if (activeToolRef.current === "select" && selectedIdRef.current) {
          const item = drawingsRef.current.find((d) => d.id === selectedIdRef.current);
          if (item && item.type === "rectangle" && item.coordinates.length > 1) {
            const p1 = map.project([item.coordinates[0][1], item.coordinates[0][0]]);
            const p2 = map.project([item.coordinates[1][1], item.coordinates[1][0]]);
            const handles = [
              { x: p1.x, y: p1.y },
              { x: p2.x, y: p1.y },
              { x: p2.x, y: p2.y },
              { x: p1.x, y: p2.y }
            ];
            const clickPt = e.point;
            for (let i = 0; i < handles.length; i++) {
              const dist = Math.hypot(clickPt.x - handles[i].x, clickPt.y - handles[i].y);
              if (dist <= 20) {
                setDragInfo({ itemId: item.id, cornerIndex: i });
                map.dragPan.disable();
                return;
              }
            }
          }
        }
      });

      map.on("touchmove", (e) => {
        if (activeToolRef.current === "pencil" && isDrawingPencil) {
          const { lat, lng } = e.lngLat;
          const lastPt = pencilPoints[pencilPoints.length - 1];
          if (!lastPt || Math.hypot(lat - lastPt[0], lng - lastPt[1]) > 0.0005) {
            pencilPoints.push([lat, lng]);
            setCurrentLinePoints([...pencilPoints]);
          }
        } else if (activeToolRef.current === "select" && dragInfoRef.current) {
          const { itemId, cornerIndex } = dragInfoRef.current;
          const { lat, lng } = e.lngLat;
          
          setDrawings((prev) => {
            return prev.map((item) => {
              if (item.id === itemId && item.type === "rectangle") {
                const newCoords = [...item.coordinates] as [[number, number], [number, number]];
                if (cornerIndex === 0) {
                  newCoords[0] = [lat, lng];
                } else if (cornerIndex === 1) {
                  newCoords[0] = [lat, newCoords[0][1]];
                  newCoords[1] = [newCoords[1][0], lng];
                } else if (cornerIndex === 2) {
                  newCoords[1] = [lat, lng];
                } else if (cornerIndex === 3) {
                  newCoords[0] = [newCoords[0][0], lng];
                  newCoords[1] = [lat, newCoords[1][1]];
                }
                return { ...item, coordinates: newCoords };
              }
              return item;
            });
          });
        }
      });

      map.on("touchend", finishPencilOrDrag);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ResizeObserver to resize MapLibre canvas and overlay canvas when split layout changes
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
      if (canvasOverlayRef.current) {
        const canvas = canvasOverlayRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    });
    observer.observe(mapContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Sync map center and zoom when props change from external inputs (e.g. search, AI agent flyTo)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    const center = map.getCenter();
    const currentZoom = map.getZoom();
    const latDiff = Math.abs(center.lat - currentCoords.lat);
    const lonDiff = Math.abs(center.lng - currentCoords.lon);
    const targetZoom = currentCoords.zoom !== undefined ? currentCoords.zoom : currentZoom;
    const zoomDiff = Math.abs(currentZoom - targetZoom);
    
    if (latDiff > 0.005 || lonDiff > 0.005 || zoomDiff > 0.4) {
      map.flyTo({
        center: [currentCoords.lon, currentCoords.lat],
        zoom: targetZoom,
        duration: 1400,
        essential: true,
        curve: 1.42,
      });
    }
  }, [currentCoords]);

  // Handle GIS clicks based on active tools
  const handleMapGisClick = (lat: number, lng: number) => {
    const newCoords: [number, number] = [lat, lng];
    const tool = activeToolRef.current;

    if (tool === "point") {
      const newItem: DrawingItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: "point",
        coordinates: [newCoords],
        properties: { color: "#3B82F6" }
      };
      setDrawings((prev) => [...prev, newItem]);
    } else if (tool === "ruler" || tool === "distance" || tool === "line") {
      setCurrentLinePoints((prev) => {
        const next = [...prev, newCoords];
        if (next.length > 1) {
          // Calculate cumulative distance in km
          let totalKm = 0;
          for (let i = 0; i < next.length - 1; i++) {
            totalKm += haversineDistance(next[i], next[i + 1]);
          }
          setMeasuredDistance(parseFloat(totalKm.toFixed(2)));
        }
        return next;
      });
    } else if (tool === "circle") {
      const newItem: DrawingItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: "circle",
        coordinates: [newCoords],
        properties: { radius: 120, color: "#10B981" }
      };
      setDrawings((prev) => [...prev, newItem]);
    } else if (tool === "rectangle") {
      const newItem: DrawingItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: "rectangle",
        coordinates: [
          newCoords,
          [newCoords[0] - 1.5, newCoords[1] + 2.5]
        ],
        properties: { color: "#F59E0B" }
      };
      setDrawings((prev) => [...prev, newItem]);
    } else if (tool === "text") {
      const textVal = prompt("Enter meteorological annotation text:");
      if (textVal) {
        const newItem: DrawingItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: "text",
          coordinates: [newCoords],
          properties: { text: textVal, color: "#EC4899" }
        };
        setDrawings((prev) => [...prev, newItem]);
      }
    }
  };

  // Complete drawing lines/ruler paths
  const finishLineDrawing = () => {
    if (currentLinePoints.length < 2) {
      setCurrentLinePoints([]);
      setMeasuredDistance(null);
      return;
    }
    const tool = activeToolRef.current;
    const newItem: DrawingItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: tool === "ruler" ? "ruler" : "line",
      coordinates: currentLinePoints,
      properties: { 
        text: measuredDistance ? `${measuredDistance} km` : undefined,
        color: tool === "ruler" ? "#EF4444" : "#3B82F6"
      }
    };
    setDrawings((prev) => [...prev, newItem]);
    setCurrentLinePoints([]);
    setMeasuredDistance(null);
  };

  // Haversine formula to compute geodesic distances
  const haversineDistance = (coords1: [number, number], coords2: [number, number]) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(coords2[0] - coords1[0]);
    const dLon = toRad(coords2[1] - coords1[1]);
    const lat1 = toRad(coords1[0]);
    const lat2 = toRad(coords2[0]);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Weather Map Rendering Engine (Canvas Overlaid and Synced)
  useEffect(() => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Weather simulation noise coordinates and particles
    let t = 0;

    // Wind flow particles
    const particlesCount = 280;
    const particles: Array<{ x: number; y: number; age: number; speed: number; length: number }> = [];
    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.random() * 100,
        speed: 1 + Math.random() * 2,
        length: 5 + Math.random() * 15,
      });
    }

    const drawWeatherOverlay = () => {
      if (!ctx || !canvas) return;

      if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
        if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          width = canvas.offsetWidth;
          height = canvas.offsetHeight;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const map = mapRef.current;
      if (!map) {
        animationFrameRef.current = requestAnimationFrame(drawWeatherOverlay);
        return;
      }

      if (activeLayer.id === "heatmap_demo") {
        updateDensityGrid(timelineHour, heatmapRadius);
      }

      t += 0.05;
      const zoom = map.getZoom();
      const center = map.getCenter();

      // Ensure canvas matches viewport bounds
      ctx.globalAlpha = layerOpacity / 100;

      // 1. SCIENTIFIC METEOROLOGICAL RASTER WEATHER FIELD RENDERING (Skipped if clean base map selected or opacity 0)
      if (activeLayer.id !== "none" && layerOpacity > 0) {
        const valueCache = new Map<number, number>();

      const getLayerValueRaw = (layerId: string, lat: number, lon: number, hour: number) => {
        const timeOffset = hour * 0.08;
        const latF = lat * 0.2;
        const lonF = lon * 0.2;

        if (layerId === "temperature") {
          const base = 35 - Math.abs(lat) * 0.75;
          const wave = Math.sin(latF * 1.5 + timeOffset) * 5 + Math.cos(lonF * 1.2 - timeOffset) * 4;
          const diurnal = Math.sin(timeOffset * 2) * 3;
          return Math.min(50, Math.max(-40, base + wave + diurnal));
        } else if (layerId === "wind") {
          const base = 8 + Math.sin(latF * 2.1 + timeOffset) * 12 + Math.cos(lonF * 1.8 - timeOffset) * 10;
          const jetStream = Math.exp(-Math.pow((Math.abs(lat) - 40) / 12, 2)) * 18;
          return Math.min(60, Math.max(0, Math.abs(base + jetStream)));
        } else if (layerId === "pressure") {
          const wave1 = Math.sin(latF * 1.2 + timeOffset * 0.5) * 22;
          const wave2 = Math.cos(lonF * 1.4 - timeOffset * 0.5) * 18;
          return Math.min(1050, Math.max(950, 1013.25 + wave1 + wave2));
        } else if (layerId === "precipitation") {
          const band = Math.sin(latF * 2.5 + lonF * 2.0 + timeOffset);
          if (band > 0.3) {
            return Math.min(100, Math.pow((band - 0.3) / 0.7, 1.8) * 85);
          }
          return 0;
        } else if (layerId === "humidity") {
          const wave = 60 + Math.sin(latF * 1.8 + timeOffset) * 25 + Math.cos(lonF * 1.5) * 20;
          return Math.min(100, Math.max(0, wave));
        } else if (layerId === "clouds") {
          const wave = 45 + Math.sin(latF * 2.2 - timeOffset) * 35 + Math.cos(lonF * 2.0 + timeOffset) * 25;
          return Math.min(100, Math.max(0, wave));
        } else if (layerId === "waves") {
          const wave = Math.abs(Math.sin(latF * 1.6 + timeOffset) * 5 + Math.cos(lonF * 1.4 - timeOffset) * 4);
          return Math.min(15, Math.max(0, wave));
        } else if (layerId === "heatmap_demo") {
          return getDensityValue(lat, lon);
        }

        const genericWave = 50 + Math.sin(latF * 1.5 + timeOffset) * 30 + Math.cos(lonF * 1.5 - timeOffset) * 20;
        return Math.min(100, Math.max(0, genericWave));
      };

      const getLayerValue = (layerId: string, lat: number, lon: number, hour: number) => {
        const latInt = Math.round(lat * 200); // Higher precision discrete coordinate key
        const lonInt = Math.round(lon * 200);
        const key = latInt * 100000 + lonInt;
        
        let val = valueCache.get(key);
        if (val !== undefined) {
          return val;
        }
        val = getLayerValueRaw(layerId, lat, lon, hour);
        valueCache.set(key, val);
        return val;
      };

      const getMappedColor = (layerId: string, pct: number, scaleName: string) => {
        const p = Math.max(0.01, Math.min(1.0, pct));
        if (scaleName === "Thermal") {
          if (p < 0.15) return `rgba(88, 28, 135, ${p * 0.85})`;
          if (p < 0.35) return `rgba(37, 99, 235, ${0.15 + p * 0.75})`;
          if (p < 0.55) return `rgba(16, 185, 129, ${0.2 + p * 0.7})`;
          if (p < 0.75) return `rgba(245, 158, 11, ${0.25 + p * 0.65})`;
          return `rgba(220, 38, 38, ${0.3 + p * 0.6})`;
        }
        if (scaleName === "Jet") {
          if (p < 0.2) return `rgba(30, 58, 138, ${p * 0.9})`;
          if (p < 0.45) return `rgba(6, 182, 212, ${0.15 + p * 0.8})`;
          if (p < 0.7) return `rgba(16, 185, 129, ${0.25 + p * 0.7})`;
          if (p < 0.85) return `rgba(234, 179, 8, ${0.3 + p * 0.65})`;
          return `rgba(220, 38, 38, ${0.35 + p * 0.6})`;
        }
        if (scaleName === "Spectral") {
          if (p < 0.25) return `rgba(49, 46, 129, ${p * 0.9})`;
          if (p < 0.5) return `rgba(13, 148, 136, ${0.2 + p * 0.75})`;
          if (p < 0.75) return `rgba(234, 179, 8, ${0.25 + p * 0.7})`;
          return `rgba(190, 24, 74, ${0.3 + p * 0.65})`;
        }
        if (scaleName === "Glow") {
          if (p < 0.25) return `rgba(131, 24, 67, ${p * 0.9})`;
          if (p < 0.5) return `rgba(147, 51, 234, ${0.2 + p * 0.75})`;
          if (p < 0.75) return `rgba(234, 179, 8, ${0.25 + p * 0.7})`;
          return `rgba(6, 182, 212, ${0.3 + p * 0.65})`;
        }
        return getAtmosphericColor(layerId, p);
      };

      const bounds = map.getBounds();
      const west = bounds.getWest();
      const east = bounds.getEast();
      const south = bounds.getSouth();
      const north = bounds.getNorth();

      // 1. SCHEMATIC METEOROLOGICAL BILINEAR GRIB INTERPOLATION RASTER ENGINE
      const gribStep = 0.25; // Simulated 25 km GRIB forecast model grid

      // Function to get bilinear-interpolated meteorological values for any arbitrary lat/lon
      const getBilinearGribValue = (layerId: string, lat: number, lon: number, hour: number) => {
        // Find the 4 bounding GRIB cell coordinates
        const lat0 = Math.floor(lat / gribStep) * gribStep;
        const lat1 = lat0 + gribStep;
        const lon0 = Math.floor(lon / gribStep) * gribStep;
        const lon1 = lon0 + gribStep;

        // Sample GRIB node values (coarse coordinates)
        const v00 = getLayerValue(layerId, lat0, lon0, hour);
        const v01 = getLayerValue(layerId, lat0, lon1, hour);
        const v10 = getLayerValue(layerId, lat1, lon0, hour);
        const v11 = getLayerValue(layerId, lat1, lon1, hour);

        // Compute bilinear weights
        const t_lat = (lat - lat0) / gribStep;
        const t_lon = (lon - lon0) / gribStep;

        // Perform standard spatial interpolation
        const v_lat0 = v00 * (1 - t_lon) + v01 * t_lon;
        const v_lat1 = v10 * (1 - t_lon) + v11 * t_lon;
        return v_lat0 * (1 - t_lat) + v_lat1 * t_lat;
      };

      // Create high-efficiency palette generator to map [0.0 - 1.0] percentages to direct RGBA bytes
      const getPaletteRGBA = (layerId: string, scaleName: string) => {
        const palCanvas = document.createElement("canvas");
        palCanvas.width = 256;
        palCanvas.height = 1;
        const palCtx = palCanvas.getContext("2d");
        if (!palCtx) return null;

        const grad = palCtx.createLinearGradient(0, 0, 256, 0);
        const stops = 16;
        for (let i = 0; i <= stops; i++) {
          const pct = i / stops;
          const color = getMappedColor(layerId, pct, scaleName);
          grad.addColorStop(pct, color);
        }

        palCtx.fillStyle = grad;
        palCtx.fillRect(0, 0, 256, 1);
        return palCtx.getImageData(0, 0, 256, 1).data;
      };

      const paletteData = getPaletteRGBA(activeLayer.id, colorScaleName);

      if (visualizationStyle !== "raw_pixel" && paletteData) {
        // Render continuous and discrete raster layers via bilinear geographic coordinate interpolation (Optimized to run at 60fps at 1:1 scale)
        const scale = 1.0; // Perfect 1:1 pixel representation for razor-sharp, smooth curves and gradients
        const offW = Math.ceil(width / scale);
        const offH = Math.ceil(height / scale);

        // Instantiate or fetch an offscreen canvas
        const offCanvas = document.createElement("canvas");
        offCanvas.width = offW;
        offCanvas.height = offH;
        const offCtx = offCanvas.getContext("2d");

        if (offCtx) {
          const imgData = offCtx.createImageData(offW, offH);
          const data = imgData.data;

          // 1. Build flat arrays for sparse geographic projection grid to bypass heavy map.unproject overhead
          const gridCols = 16;
          const gridRows = 16;
          const gridLats = new Float32Array((gridRows + 1) * (gridCols + 1));
          const gridLons = new Float32Array((gridRows + 1) * (gridCols + 1));

          for (let r = 0; r <= gridRows; r++) {
            const v = (r / gridRows) * offH;
            const y = v * scale;
            for (let c = 0; c <= gridCols; c++) {
              const u = (c / gridCols) * offW;
              const x = u * scale;
              const geo = map.unproject([x, y]);
              const idx = r * (gridCols + 1) + c;
              gridLats[idx] = geo.lat;
              gridLons[idx] = geo.lng;
            }
          }

          // 2. Pre-compute column interpolation ratios & cell indices to avoid inner-loop division and Math.floor
          const colIndices = new Int32Array(offW);
          const colTus = new Float32Array(offW);
          for (let u = 0; u < offW; u++) {
            const colRatio = u / offW;
            const c = Math.min(gridCols - 1, Math.floor(colRatio * gridCols));
            colIndices[u] = c;
            colTus[u] = colRatio * gridCols - c;
          }

          const bands = visualizationStyle === "discrete" ? 10 : 0;
          const isEdgeStyle = false;

          // Pre-calculate buffers to avoid repetitive math
          const pctBuffer = new Float32Array(offW * offH);
          const valBuffer = new Float32Array(offW * offH);
          const insideIranBuffer = new Uint8Array(offW * offH);

          // 3. Compute bilinear values and map them to the offscreen raster
          for (let v = 0; v < offH; v++) {
            const rowRatio = v / offH;
            const r = Math.min(gridRows - 1, Math.floor(rowRatio * gridRows));
            const tv = rowRatio * gridRows - r;
            const one_minus_tv = 1.0 - tv;
            const rowOffset = v * offW;

            for (let u = 0; u < offW; u++) {
              const c = colIndices[u];
              const tu = colTus[u];
              const one_minus_tu = 1.0 - tu;

              // Read flat projection grid coordinates directly
              const idx00 = r * (gridCols + 1) + c;
              const idx01 = idx00 + 1;
              const idx10 = idx00 + (gridCols + 1);
              const idx11 = idx10 + 1;

              const lat00 = gridLats[idx00];
              const lat01 = gridLats[idx01];
              const lat10 = gridLats[idx10];
              const lat11 = gridLats[idx11];

              const lon00 = gridLons[idx00];
              const lon01 = gridLons[idx01];
              const lon10 = gridLons[idx10];
              const lon11 = gridLons[idx11];

              // Bilinear interpolate coordinates
              const lat = one_minus_tv * (one_minus_tu * lat00 + tu * lat01) + tv * (one_minus_tu * lat10 + tu * lat11);
              const lon = one_minus_tv * (one_minus_tu * lon00 + tu * lon01) + tv * (one_minus_tu * lon10 + tu * lon11);

              // Allow global raster coverage for weather models (or restricted to densityGrid for heatmap)
              const isHeatmap = activeLayer.id === "heatmap_demo";
              const isInside = isHeatmap
                ? (lat >= GRID_LAT_MIN && lat <= GRID_LAT_MAX && lon >= GRID_LON_MIN && lon <= GRID_LON_MAX)
                : (lat >= -85 && lat <= 85 && lon >= -180 && lon <= 180);

              const bufferIdx = rowOffset + u;
              if (isInside) {
                insideIranBuffer[bufferIdx] = 1;

                // Retrieve value directly for heatmap or use Bilinear GRIB interpolation for weather metrics
                const val = isHeatmap ? getDensityValue(lat, lon) : getBilinearGribValue(activeLayer.id, lat, lon, timelineHour);
                let pct = (val - minVal) / (maxVal - minVal);
                pct = Math.max(0, Math.min(1, pct));

                valBuffer[bufferIdx] = val;
                pctBuffer[bufferIdx] = pct;
              } else {
                insideIranBuffer[bufferIdx] = 0;
              }
            }
          }

          // 4. Render colors with specific style modifiers
          for (let v = 0; v < offH; v++) {
            const rowOffset = v * offW;
            for (let u = 0; u < offW; u++) {
              const idx = rowOffset + u;
              const outIdx = idx * 4;

              if (insideIranBuffer[idx] === 0) {
                // Transparent outside Iran's forecast boundary
                data[outIdx] = 0;
                data[outIdx + 1] = 0;
                data[outIdx + 2] = 0;
                data[outIdx + 3] = 0;
                continue;
              }

              let pct = pctBuffer[idx];

              // Apply binning for discrete styles
              if (bands > 0) {
                pct = Math.floor(pct * bands) / bands;
              }

              const palIdx = Math.min(255, Math.max(0, Math.floor(pct * 255)));
              let r_val = paletteData[palIdx * 4];
              let g_val = paletteData[palIdx * 4 + 1];
              let b_val = paletteData[palIdx * 4 + 2];
              let a_val = paletteData[palIdx * 4 + 3];

              // Apply edge detection overlays for Contour Lines and Filled Contours
              if (isEdgeStyle && u < offW - 1 && v < offH - 1) {
                const rightIdx = idx + 1;
                const downIdx = idx + offW;

                const hasRightNeighbor = insideIranBuffer[rightIdx] === 1;
                const hasDownNeighbor = insideIranBuffer[downIdx] === 1;

                if (hasRightNeighbor && hasDownNeighbor) {
                  let rightPct = pctBuffer[rightIdx];
                  let downPct = pctBuffer[downIdx];

                  if (bands > 0) {
                    rightPct = Math.floor(rightPct * bands) / bands;
                    downPct = Math.floor(downPct * bands) / bands;
                  }

                  const diffRight = Math.abs(pct - rightPct);
                  const diffDown = Math.abs(pct - downPct);

                  if (diffRight > 0.001 || diffDown > 0.001) {
                    if (visualizationStyle === "contour_lines") {
                      // Sharp isohyet/isotherm line of appropriate color or white
                      r_val = 255;
                      g_val = 255;
                      b_val = 255;
                      a_val = 240; // High opacity white
                    } else if (visualizationStyle === "filled_contour") {
                      // Draw thin dark boundaries between bands
                      r_val = Math.max(0, r_val - 50);
                      g_val = Math.max(0, g_val - 50);
                      b_val = Math.max(0, b_val - 50);
                      a_val = Math.min(255, a_val + 40);
                    }
                  } else {
                    if (visualizationStyle === "contour_lines") {
                      // Transparent everywhere else in Contour Line style
                      a_val = 0;
                    }
                  }
                }
              }

              data[outIdx] = r_val;
              data[outIdx + 1] = g_val;
              data[outIdx + 2] = b_val;
              data[outIdx + 3] = Math.round(a_val * (layerOpacity / 100));
            }
          }

          offCtx.putImageData(imgData, 0, 0);

          // Draw offscreen buffer to main canvas with custom smoothing rules
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high"; // Smooth bilinear scaling for gradient overlays

          ctx.drawImage(offCanvas, 0, 0, width, height);
          ctx.restore();

          // Draw contour labels on top of the main canvas at high zoom levels
          if (zoom >= 6.8) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            ctx.font = "bold 9px var(--font-mono, monospace)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const labelStep = zoom >= 8.5 ? 24 : 48; // Screen pixel stride for sparse labels
            for (let v = labelStep; v < offH - labelStep; v += labelStep) {
              for (let u = labelStep; u < offW - labelStep; u += labelStep) {
                const idx = v * offW + u;
                if (insideIranBuffer[idx] === 1) {
                  // Sparsely plot numerical readings inside meteorological fields
                  const drawLabel = (u % (labelStep * 2) === 0) && (v % (labelStep * 2) === 0);

                  if (drawLabel) {
                    const screenX = u * scale;
                    const screenY = v * scale;
                    const val = valBuffer[idx];
                    ctx.fillText(`${Math.round(val)}`, screenX, screenY);
                  }
                }
              }
            }
            ctx.restore();
          }
        }
      } else {
        // Style: rawGribStep grid blocks (visualizationStyle === "raw_pixel")
        const rawGribStep = 0.08; // Locked native 9 km resolution GRIB grid cells
        const startLat = Math.floor(south / rawGribStep) * rawGribStep - rawGribStep;
        const endLat = Math.ceil(north / rawGribStep) * rawGribStep + rawGribStep;
        const startLon = Math.floor(west / rawGribStep) * rawGribStep - rawGribStep;
        const endLon = Math.ceil(east / rawGribStep) * rawGribStep + rawGribStep;

        const gridData: { 
          lat: number; 
          lon: number; 
          val: number; 
          pct: number;
          x: number; 
          y: number;
          cellW: number;
          cellH: number;
        }[] = [];

        for (let lat = startLat; lat <= endLat; lat += rawGribStep) {
          if (lat < -85 || lat > 85) continue;
          for (let lon = startLon; lon <= endLon; lon += rawGribStep) {
            const isHeatmap = activeLayer.id === "heatmap_demo";
            const isInside = isHeatmap
              ? (lat >= GRID_LAT_MIN && lat <= GRID_LAT_MAX && lon >= GRID_LON_MIN && lon <= GRID_LON_MAX)
              : (lat >= -85 && lat <= 85 && lon >= -180 && lon <= 180);

            if (!isInside) continue;

            let val = getLayerValue(activeLayer.id, lat, lon, timelineHour);
            let pct = (val - minVal) / (maxVal - minVal);
            pct = Math.max(0, Math.min(1, pct));

            const pt = map.project([lon, lat]);
            const ptNext = map.project([lon + rawGribStep, lat + rawGribStep]);

            const cellW = Math.abs(ptNext.x - pt.x);
            const cellH = Math.abs(ptNext.y - pt.y);

            gridData.push({
              lat,
              lon,
              val,
              pct,
              x: pt.x,
              y: pt.y,
              cellW,
              cellH
            });
          }
        }

        gridData.forEach((cell) => {
          const color = getMappedColor(activeLayer.id, cell.pct, colorScaleName);
          ctx.fillStyle = color;
          ctx.fillRect(
            cell.x - cell.cellW / 2,
            cell.y - cell.cellH / 2,
            cell.cellW + 0.5,
            cell.cellH + 0.5
          );

          if (zoom >= 7.5) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(
              cell.x - cell.cellW / 2,
              cell.y - cell.cellH / 2,
              cell.cellW,
              cell.cellH
            );
          }

          if (zoom >= 9.2) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            ctx.font = "8px var(--font-mono, monospace)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${Math.round(cell.val)}${activeLayer.id === "temperature" ? "" : activeLayer.unit}`, cell.x, cell.y);
          }
        });
      }
      } // End of activeLayer !== "none" && layerOpacity > 0

      // 2. DRAW GIS ITEMS PLOTTED BY THE USER
      ctx.globalAlpha = 1.0;
      drawings.forEach((item) => {
        if (item.coordinates.length === 0) return;

        // Convert geo coordinates to screen pixels
        const screenPoints = item.coordinates.map((coord) => {
          const projected = map.project([coord[1], coord[0]]); // [lon, lat]
          return projected;
        });

        const color = item.properties?.color || "#3B82F6";
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        if (item.type === "point") {
          const pt = screenPoints[0];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Selection highlight
          if (selectedId === item.id) {
            ctx.strokeStyle = "#EAB308";
            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 12, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } else if (item.type === "circle") {
          const pt = screenPoints[0];
          const radiusKm = item.properties?.radius || 120;
          const lat = item.coordinates[0][0];
          const lon = item.coordinates[0][1];
          
          const pCenter = map.project([lon, lat]);
          const offsetLat = lat + (radiusKm / 111);
          const pOffset = map.project([lon, offsetLat]);
          const dx = pOffset.x - pCenter.x;
          const dy = pOffset.y - pCenter.y;
          const radiusPixels = Math.max(3, Math.sqrt(dx * dx + dy * dy));

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPixels, 0, 2 * Math.PI);
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Selection highlight
          if (selectedId === item.id) {
            ctx.strokeStyle = "#EAB308";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radiusPixels + 6, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } else if (item.type === "rectangle") {
          if (screenPoints.length > 1) {
            const p1 = screenPoints[0];
            const p2 = screenPoints[1];
            ctx.beginPath();
            ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            ctx.globalAlpha = 0.15;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw interactive resize handles if selected
            if (selectedId === item.id) {
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 1.5;
              ctx.fillStyle = "#EAB308"; // Yellow handles

              const handles = [
                { x: p1.x, y: p1.y },
                { x: p2.x, y: p1.y },
                { x: p2.x, y: p2.y },
                { x: p1.x, y: p2.y }
              ];

              handles.forEach((h) => {
                ctx.beginPath();
                ctx.arc(h.x, h.y, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              });
            }
          }
        } else if (item.type === "line" || item.type === "ruler") {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
          ctx.stroke();

          // Draw vertex points
          screenPoints.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Draw measured text
          if (item.properties?.text) {
            const midIndex = Math.floor(screenPoints.length / 2);
            const midPt = screenPoints[midIndex];
            ctx.fillStyle = "#1E293B";
            ctx.font = "10px monospace";
            const textW = ctx.measureText(item.properties.text).width;
            ctx.fillRect(midPt.x - textW / 2 - 4, midPt.y - 14, textW + 8, 14);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(item.properties.text, midPt.x - textW / 2, midPt.y - 4);
          }

          // Selection highlight
          if (selectedId === item.id) {
            ctx.strokeStyle = "#EAB308";
            ctx.lineWidth = 1.5;
            screenPoints.forEach((pt) => {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 7, 0, 2 * Math.PI);
              ctx.stroke();
            });
          }
        } else if (item.type === "pencil") {
          ctx.lineWidth = item.properties?.size || 4;
          ctx.strokeStyle = item.properties?.color || "#EF4444";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
          ctx.stroke();

          // Selection highlight
          if (selectedId === item.id) {
            ctx.strokeStyle = "#EAB308";
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            for (let i = 1; i < screenPoints.length; i++) {
              ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } else if (item.type === "text" && item.properties?.text) {
          const pt = screenPoints[0];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = "rgba(15, 17, 21, 0.9)";
          ctx.font = "bold 11px system-ui";
          const textW = ctx.measureText(item.properties.text).width;
          ctx.fillRect(pt.x + 8, pt.y - 10, textW + 10, 18);
          ctx.strokeStyle = color;
          ctx.strokeRect(pt.x + 8, pt.y - 10, textW + 10, 18);

          ctx.fillStyle = "#F8FAFC";
          ctx.fillText(item.properties.text, pt.x + 13, pt.y + 3);

          // Selection highlight
          if (selectedId === item.id) {
            ctx.strokeStyle = "#EAB308";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(pt.x + 5, pt.y - 13, textW + 16, 24);
          }
        }
      });

      // 5. DRAW LIVE UNFINISHED LINES / MEASUREMENTS
      if (currentLinePoints.length > 0) {
        const screenPoints = currentLinePoints.map((coord) => {
          const projected = map.project([coord[1], coord[0]]);
          return projected;
        });

        if (activeTool === "pencil") {
          ctx.strokeStyle = pencilColorRef.current;
          ctx.fillStyle = pencilColorRef.current;
          ctx.lineWidth = pencilSizeRef.current;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
          ctx.stroke();
        } else {
          ctx.strokeStyle = "#EF4444";
          ctx.fillStyle = "#EF4444";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);

          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
          ctx.stroke();
          ctx.setLineDash([]); // Reset line dash

          screenPoints.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
            ctx.fill();
          });

          if (measuredDistance) {
            const lastPt = screenPoints[screenPoints.length - 1];
            ctx.fillStyle = "#EF4444";
            ctx.font = "10px monospace";
            ctx.fillText(`Measuring: ${measuredDistance} km`, lastPt.x + 10, lastPt.y - 10);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawWeatherOverlay);
    };

    if (mapContainerRef.current) {
      (mapContainerRef.current as any).__forceOverlayRepaint = drawWeatherOverlay;
    }
    drawWeatherOverlay();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeLayer, layerOpacity, drawings, currentLinePoints, timelineHour, selectedId, visualizationStyle, colorScaleName, minVal, maxVal]);

  // Scientific weather color mapping helper
  const getAtmosphericColor = (layerId: string, pct: number) => {
    const p = Math.max(0, Math.min(1, pct));
    
    if (layerId === "temperature") {
      // Warm thermo: Purple (cold) -> Blue -> Green -> Yellow -> Orange -> Red (hot)
      if (p < 0.2) return `rgba(88, 28, 135, ${0.1 + p * 0.5})`; // cold purple
      if (p < 0.4) return `rgba(37, 99, 235, ${0.1 + p * 0.5})`;  // cold blue
      if (p < 0.6) return `rgba(16, 185, 129, ${0.1 + p * 0.5})`; // mild green
      if (p < 0.8) return `rgba(245, 158, 11, ${0.1 + p * 0.5})`; // warm orange
      return `rgba(220, 38, 38, ${0.1 + p * 0.5})`; // extreme red
    }
    
    if (layerId === "humidity") {
      // Dry amber -> Cyan moisture -> Deep sky blue
      const blueVal = Math.round(150 + p * 105);
      const greenVal = Math.round(50 + p * 150);
      const redVal = Math.round(150 - p * 150);
      return `rgba(${redVal}, ${greenVal}, ${blueVal}, ${0.1 + p * 0.4})`;
    }

    if (layerId === "clouds") {
      // Gray transparent -> dense white vapor
      const gray = Math.round(80 + p * 175);
      return `rgba(${gray}, ${gray}, ${gray + 10}, ${p * 0.7})`;
    }

    if (layerId === "precipitation") {
      // Dark blue to glowing electric violet rain cell
      if (p < 0.2) return "rgba(0, 0, 0, 0)";
      return `rgba(${Math.round(20 + p * 60)}, ${Math.round(100 + p * 50)}, ${Math.round(200 + p * 55)}, ${p * 0.8})`;
    }

    if (layerId === "waves") {
      // Deep sea blue to light frothy cyan crests
      return `rgba(6, 182, 212, ${p * 0.6})`;
    }

    return "rgba(59, 130, 246, 0.2)";
  };

  // Manual zoom control
  const handleZoom = (amount: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      zoom: mapRef.current.getZoom() + amount,
      duration: 300,
    });
  };

  // Reset compass orientation to north
  const handleResetNorth = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 400,
    });
  };

  // Fit current state screen
  const handleFitBounds = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      zoom: 6.5,
      pitch: 30, // 3D tilt
      duration: 500,
    });
  };

  return (
    <div className="flex-1 relative h-full w-full bg-[#0E0E11] overflow-hidden">
      {/* Real WebGL MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" id="maplibre-view" />

      {/* Synchronized Analytical Overlay Canvas */}
      <canvas
        ref={canvasOverlayRef}
        className="absolute inset-0 z-20 w-full h-full pointer-events-none"
        id="meteo-analysis-canvas"
      />

      {/* Map Control Floating HUD (Top Right) */}
      <div className="absolute top-16 right-4 flex flex-col space-y-2 z-30" id="map-controls-hud">
        {/* Map Lock Button */}
        <button
          onClick={() => onMapLockToggle(!mapLocked)}
          className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg border transition-all duration-150 ${
            mapLocked 
              ? "bg-red-600 border-red-500 text-white hover:bg-red-500 hover:border-red-400 cursor-pointer" 
              : "bg-[#131316] border-[#2D2D30] text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          }`}
          id="btn-map-lock"
          title={mapLocked ? "Unlock Map Navigation (فعال‌سازی حرکت)" : "Lock Map Navigation (قفل کردن نقشه)"}
        >
          {mapLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        <div className="flex flex-col bg-[#131316] rounded-md overflow-hidden shadow-lg border border-[#2D2D30]">
          <button
            onClick={() => !mapLocked && handleZoom(0.8)}
            disabled={mapLocked}
            className={`w-8 h-8 flex items-center justify-center transition border-b border-[#2D2D30] ${
              mapLocked 
                ? "text-slate-600 cursor-not-allowed bg-[#131316]/60" 
                : "text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer"
            }`}
            id="btn-zoom-in"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => !mapLocked && handleZoom(-0.8)}
            disabled={mapLocked}
            className={`w-8 h-8 flex items-center justify-center transition ${
              mapLocked 
                ? "text-slate-600 cursor-not-allowed bg-[#131316]/60" 
                : "text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer"
            }`}
            id="btn-zoom-out"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => !mapLocked && handleResetNorth()}
          disabled={mapLocked}
          className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg border transition ${
            mapLocked 
              ? "bg-[#131316]/60 border-[#2D2D30]/40 text-slate-600 cursor-not-allowed" 
              : "bg-[#131316] border-[#2D2D30] text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          }`}
          id="btn-compass-reset"
          title="Reset View Orientation"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={() => !mapLocked && handleFitBounds()}
          disabled={mapLocked}
          className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg border transition ${
            mapLocked 
              ? "bg-[#131316]/60 border-[#2D2D30]/40 text-slate-600 cursor-not-allowed" 
              : "bg-[#131316] border-[#2D2D30] text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          }`}
          id="btn-gps-home"
          title="Focus Center Coordinates"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (mapLocked || !mapRef.current) return;
            const currentPitch = mapRef.current.getPitch();
            mapRef.current.easeTo({
              pitch: currentPitch > 10 ? 0 : 55, // toggle 3D isometric perspective
              duration: 500,
            });
          }}
          disabled={mapLocked}
          className={`w-8 h-8 text-xs font-bold font-mono rounded-md flex items-center justify-center shadow-lg border transition ${
            mapLocked 
              ? "bg-[#131316]/60 border-[#2D2D30]/40 text-slate-600 cursor-not-allowed" 
              : "bg-[#131316] border-[#2D2D30] text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          }`}
          id="btn-3d-tilt"
          title="Toggle 3D View"
        >
          3D
        </button>
      </div>

      {/* Floating Drawing Tool Status Indicator */}
      {activeTool !== "select" && (
        <div
          className="absolute top-16 left-4 bg-[#131316]/95 backdrop-blur-md p-3 rounded-lg border border-[#2D2D30] text-xs flex flex-col space-y-2 z-30 shadow-lg min-w-[260px]"
          id="active-tool-status"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-300">
                Active: <span className="text-blue-400 capitalize font-medium">{activeTool === "pencil" ? "Pencil Draw" : activeTool} Mode</span>
              </span>
            </div>
            
            {(activeTool === "line" || activeTool === "ruler" || activeTool === "distance") && currentLinePoints.length > 0 && (
              <button
                onClick={finishLineDrawing}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2 py-0.5 rounded text-[10px]"
              >
                Apply Path
              </button>
            )}
          </div>
          
          {activeTool === "pencil" ? (
            <div className="flex flex-col space-y-2 pt-1.5 border-t border-[#2D2D30]/40">
              {/* Color Selector */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 text-[10px] shrink-0">Color:</span>
                <div className="flex items-center space-x-1.5">
                  {[
                    { hex: "#EF4444", name: "Red" },
                    { hex: "#3B82F6", name: "Blue" },
                    { hex: "#10B981", name: "Green" },
                    { hex: "#F59E0B", name: "Orange" },
                    { hex: "#EAB308", name: "Yellow" },
                    { hex: "#A855F7", name: "Purple" },
                    { hex: "#FFFFFF", name: "White" }
                  ].map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setPencilColor(c.hex)}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        pencilColor === c.hex 
                          ? "border-white scale-125 shadow-md shadow-black" 
                          : "border-transparent hover:scale-115"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size/Thickness Selector */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">Brush Size:</span>
                <div className="flex items-center space-x-1">
                  {[2, 4, 8, 12].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setPencilSize(sz)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition ${
                        pencilSize === sz 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {sz === 2 ? "S" : sz === 4 ? "M" : sz === 8 ? "L" : "XL"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-[10px] pt-1 border-t border-[#2D2D30]/40">
              Click map to plot/draw
            </span>
          )}
        </div>
      )}

      {activeTool === "select" && selectedId && (() => {
        const item = drawings.find(d => d.id === selectedId);
        if (!item) return null;
        
        return (
          <div
            className="absolute top-16 left-4 bg-[#131316]/95 backdrop-blur-md p-3 rounded-lg border border-[#2D2D30] text-xs flex flex-col space-y-3 z-30 shadow-lg min-w-[280px]"
            id="selected-item-hud"
          >
            <div className="flex items-center justify-between border-b border-[#2D2D30]/60 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-slate-200 font-bold capitalize">
                  {item.type} Selected
                </span>
              </div>
              <button
                onClick={() => {
                  setDrawings(prev => prev.filter(d => d.id !== selectedId));
                  setSelectedId(null);
                }}
                className="text-red-400 hover:text-red-300 transition-colors font-bold px-1.5 py-0.5 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-[10px]"
                title="Delete item"
              >
                Delete
              </button>
            </div>

            {/* Color controls */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-slate-400 text-[10px]">Element Color:</span>
              <div className="flex items-center space-x-1.5">
                {[
                  { hex: "#EF4444", name: "Red" },
                  { hex: "#3B82F6", name: "Blue" },
                  { hex: "#10B981", name: "Green" },
                  { hex: "#F59E0B", name: "Orange" },
                  { hex: "#EAB308", name: "Yellow" },
                  { hex: "#A855F7", name: "Purple" },
                  { hex: "#FFFFFF", name: "White" }
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setDrawings(prev => prev.map(d => d.id === selectedId ? {
                        ...d,
                        properties: { ...d.properties, color: c.hex }
                      } : d));
                    }}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      item.properties?.color === c.hex 
                        ? "border-white scale-120 shadow-md shadow-black" 
                        : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Size controls depending on type */}
            {item.type === "circle" && (
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Geographic Radius:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {item.properties?.radius || 120} km
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={item.properties?.radius || 120}
                  onChange={(e) => {
                    const radius = parseInt(e.target.value);
                    setDrawings(prev => prev.map(d => d.id === selectedId ? {
                      ...d,
                      properties: { ...d.properties, radius }
                    } : d));
                  }}
                  className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {item.type === "pencil" && (
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Stroke Size:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {item.properties?.size || 4} px
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {[2, 4, 8, 12].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setDrawings(prev => prev.map(d => d.id === selectedId ? {
                          ...d,
                          properties: { ...d.properties, size: sz }
                        } : d));
                      }}
                      className={`flex-1 py-1 rounded text-[9px] font-bold transition ${
                        (item.properties?.size || 4) === sz 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {sz === 2 ? "S" : sz === 4 ? "M" : sz === 8 ? "L" : "XL"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {item.type === "rectangle" && (
              <div className="flex flex-col space-y-1 text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded border border-[#2D2D30]/40">
                <span className="font-semibold text-slate-300">💡 Map Interaction:</span>
                <span>Drag the <span className="text-amber-400 font-bold">yellow corner handles</span> on the map to resize this rectangle.</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
