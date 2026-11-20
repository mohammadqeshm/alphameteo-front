import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CustomCompositeLayer, CompositeSubLayer } from '../../types';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Zap,
  Cloud,
  Thermometer,
  Wind,
  Gauge,
  CloudRain,
  Check,
  Sparkles,
  GripVertical,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass
} from 'lucide-react';

interface CustomCompositeLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (composite: CustomCompositeLayer, andActivate?: boolean) => void;
  initialComposite?: CustomCompositeLayer | null;
}

// Preset popular layers that meteorologists commonly combine
const POPULAR_LAYER_PRESETS: {
  sourceId: string;
  sourceName: string;
  variableId: string;
  variableName: string;
  variableUnit: string;
  levelId: string;
  levelName: string;
  defaultOpacity: number;
  icon: any;
  badge: string;
}[] = [
  {
    sourceId: 'eumetsat_mtg_li',
    sourceName: 'EUMETSAT MTG-I1',
    variableId: 'mtg_li_lightning',
    variableName: 'Live Lightning (MTG-LI)',
    variableUnit: 'flashes',
    levelId: 'surface',
    levelName: 'Surface',
    defaultOpacity: 100,
    icon: Zap,
    badge: 'LIVE OBS'
  },
  {
    sourceId: 'nasa_gibs_cloud',
    sourceName: 'NASA GIBS Satellite',
    variableId: 'nasa_cloud_cover',
    variableName: 'Satellite Cloud Cover (NASA GIBS)',
    variableUnit: '%',
    levelId: 'toa',
    levelName: 'Top of Atmosphere',
    defaultOpacity: 85,
    icon: Cloud,
    badge: 'SATELLITE'
  },
  {
    sourceId: 'radar_composite',
    sourceName: 'Doppler Radar Net',
    variableId: 'radar_composite',
    variableName: 'Weather Radar Reflectivity (dBZ)',
    variableUnit: 'dBZ',
    levelId: 'surface',
    levelName: 'Surface Composite',
    defaultOpacity: 90,
    icon: CloudRain,
    badge: 'DOPPLER'
  },
  {
    sourceId: 'gfs_025',
    sourceName: 'GFS 0.25°',
    variableId: 'wind_10m',
    variableName: 'Wind Speed & Vectors (10m)',
    variableUnit: 'kt',
    levelId: '10m',
    levelName: '10 meters',
    defaultOpacity: 90,
    icon: Wind,
    badge: 'NWP'
  },
  {
    sourceId: 'gfs_025',
    sourceName: 'GFS 0.25°',
    variableId: 'temp_2m',
    variableName: 'Air Temperature (2m)',
    variableUnit: '°C',
    levelId: '2m',
    levelName: '2 meters',
    defaultOpacity: 80,
    icon: Thermometer,
    badge: 'NWP'
  },
  {
    sourceId: 'gfs_025',
    sourceName: 'GFS 0.25°',
    variableId: 'mslp',
    variableName: 'Mean Sea Level Pressure & Isobars (MSLP)',
    variableUnit: 'hPa',
    levelId: 'surface',
    levelName: 'Sea Level',
    defaultOpacity: 85,
    icon: Gauge,
    badge: 'NWP'
  },
  {
    sourceId: 'gfs_025',
    sourceName: 'GFS 0.25°',
    variableId: 'precip_accum',
    variableName: 'Accumulated Precipitation',
    variableUnit: 'mm',
    levelId: 'surface',
    levelName: 'Surface',
    defaultOpacity: 85,
    icon: CloudRain,
    badge: 'NWP'
  },
  {
    sourceId: 'gfs_025',
    sourceName: 'GFS 0.25°',
    variableId: 'cape_sbcape',
    variableName: 'Convective Available Potential Energy (CAPE)',
    variableUnit: 'J/kg',
    levelId: 'surface',
    levelName: 'Surface Based',
    defaultOpacity: 75,
    icon: Zap,
    badge: 'SEVERE'
  }
];

// Realistic GeoJSON datasets for Preview Map
const PREVIEW_LIGHTNING_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [49.5, 37.2] }, properties: { intensity: 140, color: '#facc15', size: 8 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [51.4, 35.7] }, properties: { intensity: 120, color: '#facc15', size: 9 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [48.3, 33.5] }, properties: { intensity: 90, color: '#38bdf8', size: 7 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [52.5, 29.6] }, properties: { intensity: 85, color: '#eab308', size: 7 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [54.3, 31.9] }, properties: { intensity: 70, color: '#94a3b8', size: 6 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [56.3, 27.2] }, properties: { intensity: 130, color: '#facc15', size: 8 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [59.6, 36.3] }, properties: { intensity: 95, color: '#38bdf8', size: 7 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [46.3, 38.1] }, properties: { intensity: 60, color: '#94a3b8', size: 6 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [50.8, 29.0] }, properties: { intensity: 115, color: '#facc15', size: 8 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [48.7, 31.3] }, properties: { intensity: 80, color: '#eab308', size: 7 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [53.2, 36.6] }, properties: { intensity: 135, color: '#facc15', size: 9 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [51.8, 32.6] }, properties: { intensity: 75, color: '#38bdf8', size: 6 } }
  ]
};

const PREVIEW_RADAR_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[47.5, 36.0], [52.0, 37.0], [53.5, 35.5], [49.0, 34.0], [47.5, 36.0]]]
      },
      properties: { dbz: 30, color: '#22c55e' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[48.8, 36.2], [51.2, 36.8], [52.0, 35.8], [49.8, 34.8], [48.8, 36.2]]]
      },
      properties: { dbz: 45, color: '#eab308' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[49.5, 36.3], [50.8, 36.6], [51.2, 35.9], [50.0, 35.4], [49.5, 36.3]]]
      },
      properties: { dbz: 55, color: '#ef4444' }
    }
  ]
};

const PREVIEW_WIND_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[46, 38], [48.5, 37.5]] }, properties: { speed: 25 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[49, 36], [51.5, 35.5]] }, properties: { speed: 30 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[52, 34], [54.5, 33.5]] }, properties: { speed: 20 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[47, 32], [49.5, 31.5]] }, properties: { speed: 35 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[53, 30], [55.5, 29.5]] }, properties: { speed: 18 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[56, 28], [58.5, 27.5]] }, properties: { speed: 40 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[57, 36], [59.5, 35.5]] }, properties: { speed: 22 } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[49, 29], [51.5, 28.5]] }, properties: { speed: 28 } }
  ]
};

const PREVIEW_MSLP_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[44, 40], [50, 39], [56, 38.5], [62, 39]] }, properties: { label: '1020 hPa' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[44, 36], [50, 35], [56, 34.5], [62, 35]] }, properties: { label: '1016 hPa' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[44, 32], [50, 31], [56, 30.5], [62, 31]] }, properties: { label: '1012 hPa' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[44, 28], [50, 27], [56, 26.5], [62, 27]] }, properties: { label: '1008 hPa' } }
  ]
};

const PREVIEW_TEMP_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[45, 41], [55, 41], [55, 35], [45, 35], [45, 41]]]
      },
      properties: { color: 'rgba(59, 130, 246, 0.45)' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[45, 35], [62, 35], [62, 29], [45, 29], [45, 35]]]
      },
      properties: { color: 'rgba(234, 179, 8, 0.45)' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[46, 29], [62, 29], [62, 24], [46, 24], [46, 29]]]
      },
      properties: { color: 'rgba(239, 68, 68, 0.45)' }
    }
  ]
};

const PREVIEW_CAPE_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[48, 35], [53, 36.5], [54, 32], [49, 31.5], [48, 35]]]
      },
      properties: { color: 'rgba(168, 85, 247, 0.5)' }
    }
  ]
};

// Map variableId to the layer IDs inside MapLibre
const VARIABLE_TO_MAP_LAYERS: Record<string, string[]> = {
  nasa_cloud_cover: ['comp-layer-nasa_cloud_cover'],
  temp_2m: ['comp-layer-temp_2m'],
  radar_composite: ['comp-layer-radar_composite'],
  precip_accum: ['comp-layer-radar_composite'],
  cape_sbcape: ['comp-layer-cape_sbcape'],
  mslp: ['comp-layer-mslp'],
  wind_10m: ['comp-layer-wind_10m'],
  mtg_li_lightning: ['comp-layer-mtg_li_lightning-halo', 'comp-layer-mtg_li_lightning']
};

export const CustomCompositeLayerModal: React.FC<CustomCompositeLayerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialComposite
}) => {
  const [name, setName] = useState<string>(() => initialComposite?.name || '');
  const [description, setDescription] = useState<string>(() => initialComposite?.description || '');
  const [subLayers, setSubLayers] = useState<CompositeSubLayer[]>(() => {
    if (initialComposite?.subLayers && initialComposite.subLayers.length > 0) {
      return [...initialComposite.subLayers];
    }
    // Default starter sub-layers: Lightning on top, Satellite clouds underneath
    return [
      {
        id: `sub_mtg_li_${Date.now()}`,
        sourceId: 'eumetsat_mtg_li',
        sourceName: 'EUMETSAT MTG-I1',
        variableId: 'mtg_li_lightning',
        variableName: 'Live Lightning (MTG-LI)',
        variableUnit: 'flashes',
        levelId: 'surface',
        levelName: 'Surface',
        opacity: 100,
        blendMode: 'normal'
      },
      {
        id: `sub_nasa_cloud_${Date.now() + 1}`,
        sourceId: 'nasa_gibs_cloud',
        sourceName: 'NASA GIBS',
        variableId: 'nasa_cloud_cover',
        variableName: 'Satellite Cloud Cover (NASA GIBS)',
        variableUnit: '%',
        levelId: 'toa',
        levelName: 'Top of Atmosphere',
        opacity: 85,
        blendMode: 'normal'
      }
    ];
  });

  const [selectedPresetToAdd, setSelectedPresetToAdd] = useState<string>(POPULAR_LAYER_PRESETS[0].variableId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Real MapLibre Map Refs & State
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Update initial fields if initialComposite changes
  useEffect(() => {
    if (initialComposite) {
      setName(initialComposite.name || '');
      setDescription(initialComposite.description || '');
      if (initialComposite.subLayers && initialComposite.subLayers.length > 0) {
        setSubLayers([...initialComposite.subLayers]);
      }
    }
  }, [initialComposite]);

  // Initialize Real MapLibre Map inside modal
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // High-performance keyless Esri Dark Tactical basemap with NASA Satellite option
    const modalDarkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'esri-dark-gray-base': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri, OpenStreetMap contributors'
        },
        'nasa-clouds-preview': {
          type: 'raster',
          tiles: [
            'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'
          ],
          tileSize: 256,
          maxzoom: 9
        },
        'esri-dark-gray-labels': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri'
        }
      },
      layers: [
        {
          id: 'esri-dark-gray-base-layer',
          type: 'raster',
          source: 'esri-dark-gray-base',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-opacity': 1.0,
            'raster-contrast': 0.08
          }
        },
        {
          id: 'comp-layer-nasa_cloud_cover',
          type: 'raster',
          source: 'nasa-clouds-preview',
          minzoom: 0,
          maxzoom: 9,
          layout: {
            visibility: 'none'
          },
          paint: {
            'raster-opacity': 0.85,
            'raster-fade-duration': 150
          }
        },
        {
          id: 'esri-dark-gray-labels-layer',
          type: 'raster',
          source: 'esri-dark-gray-labels',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-opacity': 0.85
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: modalDarkStyle,
      center: [53.6880, 32.4279], // Iran & Middle East Center
      zoom: 4.8,
      attributionControl: false
    });

    mapRef.current = map;

    // Attach error handler to safely absorb transient tile 404s/aborts
    map.on('error', (e) => {
      const err = (e as any)?.error || e;
      const msg = (err?.message || String(err || '')).toLowerCase();
      if (
        msg.includes('failed to fetch') ||
        msg.includes('ajaxerror') ||
        msg.includes('404') ||
        msg.includes('aborterror') ||
        msg.includes('tile') ||
        msg.includes('network')
      ) {
        return;
      }
      console.warn('Preview map non-fatal warning:', e);
    });

    map.on('load', () => {
      setIsMapLoaded(true);

      // 1. Temperature Polygons Source & Layer
      map.addSource('preview-temp-source', {
        type: 'geojson',
        data: PREVIEW_TEMP_DATA
      });
      map.addLayer({
        id: 'comp-layer-temp_2m',
        type: 'fill',
        source: 'preview-temp-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.8
        }
      });

      // 2. CAPE Source & Layer
      map.addSource('preview-cape-source', {
        type: 'geojson',
        data: PREVIEW_CAPE_DATA
      });
      map.addLayer({
        id: 'comp-layer-cape_sbcape',
        type: 'fill',
        source: 'preview-cape-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.75
        }
      });

      // 3. Radar Reflectivity Source & Layer
      map.addSource('preview-radar-source', {
        type: 'geojson',
        data: PREVIEW_RADAR_DATA
      });
      map.addLayer({
        id: 'comp-layer-radar_composite',
        type: 'fill',
        source: 'preview-radar-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.85
        }
      });

      // 4. MSLP Isobars Source & Layer
      map.addSource('preview-mslp-source', {
        type: 'geojson',
        data: PREVIEW_MSLP_DATA
      });
      map.addLayer({
        id: 'comp-layer-mslp',
        type: 'line',
        source: 'preview-mslp-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.5,
          'line-dasharray': [4, 2],
          'line-opacity': 0.85
        }
      });

      // 5. Wind Vectors Source & Layer
      map.addSource('preview-wind-source', {
        type: 'geojson',
        data: PREVIEW_WIND_DATA
      });
      map.addLayer({
        id: 'comp-layer-wind_10m',
        type: 'line',
        source: 'preview-wind-source',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.2,
          'line-opacity': 0.9
        }
      });

      // 6. Lightning Source & Layers (Pulsing Glow Halo + Crisp White Center)
      map.addSource('preview-lightning-source', {
        type: 'geojson',
        data: PREVIEW_LIGHTNING_DATA
      });
      map.addLayer({
        id: 'comp-layer-mtg_li_lightning-halo',
        type: 'circle',
        source: 'preview-lightning-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['get', 'size'],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.6,
          'circle-blur': 0.4
        }
      });
      map.addLayer({
        id: 'comp-layer-mtg_li_lightning',
        type: 'circle',
        source: 'preview-lightning-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 3.5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': ['get', 'color'],
          'circle-opacity': 1.0
        }
      });

      // Initial trigger to sync sub-layers visibility and stack order
      syncLayersOnMap(map, subLayers);
    });

    map.on('mousemove', (e) => {
      setHoverCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(2)),
        lon: parseFloat(e.lngLat.lng.toFixed(2))
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setIsMapLoaded(false);
    };
  }, [isOpen]);

  // Synchronize Sub-layers Visibility, Opacity, and Stack Order onto Real Map
  const syncLayersOnMap = (map: maplibregl.Map, currentSubLayers: CompositeSubLayer[]) => {
    if (!map || !map.isStyleLoaded()) return;

    try {
      // 1. Update visibility and opacity for every layer
      Object.keys(VARIABLE_TO_MAP_LAYERS).forEach((varId) => {
        const sub = currentSubLayers.find((s) => s.variableId === varId);
        const layerIds = VARIABLE_TO_MAP_LAYERS[varId] || [];

        layerIds.forEach((lId) => {
          if (!map.getLayer(lId)) return;

          if (sub) {
            map.setLayoutProperty(lId, 'visibility', 'visible');
            const op = Math.max(0.05, Math.min(1.0, sub.opacity / 100));

            // Set appropriate opacity property based on layer type
            if (lId === 'comp-layer-nasa_cloud_cover') {
              map.setPaintProperty(lId, 'raster-opacity', op);
            } else if (lId.includes('lightning')) {
              if (lId.includes('halo')) {
                map.setPaintProperty(lId, 'circle-opacity', op * 0.6);
              } else {
                map.setPaintProperty(lId, 'circle-opacity', op);
              }
            } else if (lId.includes('wind') || lId.includes('mslp')) {
              map.setPaintProperty(lId, 'line-opacity', op);
            } else {
              map.setPaintProperty(lId, 'fill-opacity', op * 0.85);
            }
          } else {
            map.setLayoutProperty(lId, 'visibility', 'none');
          }
        });
      });

      // 2. REORDER: In subLayers, index 0 is TOP (highest visual priority).
      // In MapLibre, calling map.moveLayer(id) with no 2nd arg places that layer at the top!
      // So if we loop from BOTTOM (last index) to TOP (index 0), moving each layer,
      // the TOP layer (index 0) will end up at the very top of the visual stack!
      const reversed = [...currentSubLayers].reverse();
      reversed.forEach((sub) => {
        const layerIds = VARIABLE_TO_MAP_LAYERS[sub.variableId] || [];
        layerIds.forEach((lId) => {
          if (map.getLayer(lId)) {
            map.moveLayer(lId);
          }
        });
      });

      // Keep city and border labels on top of basemap
      if (map.getLayer('esri-dark-gray-labels-layer')) {
        map.moveLayer('esri-dark-gray-labels-layer');
      }
    } catch (err) {
      console.warn('Layer sync warning in modal map:', err);
    }
  };

  // Sync sub-layers whenever subLayers state changes and map is loaded
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      syncLayersOnMap(mapRef.current, subLayers);
    }
  }, [subLayers, isMapLoaded]);

  // ResizeObserver to ensure MapLibre fills container properly
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  // Add layer from preset
  const handleAddPreset = () => {
    const preset = POPULAR_LAYER_PRESETS.find(p => p.variableId === selectedPresetToAdd);
    if (!preset) return;

    if (subLayers.some(l => l.variableId === preset.variableId)) {
      setErrorMsg(`Layer "${preset.variableName}" is already in the stack.`);
      return;
    }

    const newSub: CompositeSubLayer = {
      id: `sub_${preset.variableId}_${Date.now()}`,
      sourceId: preset.sourceId,
      sourceName: preset.sourceName,
      variableId: preset.variableId,
      variableName: preset.variableName,
      variableUnit: preset.variableUnit,
      levelId: preset.levelId,
      levelName: preset.levelName,
      opacity: preset.defaultOpacity,
      blendMode: 'normal'
    };

    setSubLayers(prev => [...prev, newSub]);
    setErrorMsg(null);
  };

  // Move layer up (higher in stack = rendered on top)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSubLayers(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  // Move layer down (lower in stack = rendered below)
  const handleMoveDown = (index: number) => {
    if (index === subLayers.length - 1) return;
    setSubLayers(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // Drag & Drop Reordering Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setSubLayers(prev => {
      const copy = [...prev];
      const [movedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, movedItem);
      return copy;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Remove layer
  const handleRemoveLayer = (id: string) => {
    setSubLayers(prev => prev.filter(l => l.id !== id));
  };

  // Change sub-layer opacity
  const handleOpacityChange = (id: string, opacity: number) => {
    setSubLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  // Submit
  const handleSubmit = (andActivate: boolean) => {
    if (!name.trim()) {
      setErrorMsg('Please enter a name for the composite layer.');
      return;
    }
    if (subLayers.length === 0) {
      setErrorMsg('Add at least 1 sub-layer to create a composite.');
      return;
    }

    const composite: CustomCompositeLayer = {
      id: initialComposite?.id || `composite_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      createdAt: initialComposite?.createdAt || Date.now(),
      subLayers: subLayers
    };

    onSave(composite, andActivate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-6xl h-[90vh] bg-[#1a1a1a] border border-[#2b2b2b] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#212121] border-b border-[#2e2e2e] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-500/20 border border-blue-500/40 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{initialComposite ? 'Edit Custom Composite Layer' : 'Custom Composite Layer Builder'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Real Map Preview
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure and drag-and-drop layers on the left with live MapLibre preview on the right
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body - Split Two Columns */}
        <div className="flex-1 flex flex-col-reverse md:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT SIDE: LAYER CONTROLS & SUB-LAYERS LIST */}
          <div 
            className="w-full md:w-[48%] lg:w-[45%] flex flex-col border-t md:border-t-0 md:border-r border-[#2b2b2b] bg-[#1a1a1a] overflow-hidden"
          >
            {/* Scrollable Configuration */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <span className="font-bold">Error:</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Name & Description */}
              <div className="space-y-2.5 bg-[#222222] p-3.5 rounded-xl border border-[#2e2e2e]">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Composite Layer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="e.g., Convection & Thunderstorm (Lightning + Clouds)"
                    className="w-full bg-[#171717] border border-[#383838] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Combine EUMETSAT lightning feed with NASA satellite cloud cover"
                    className="w-full bg-[#171717] border border-[#383838] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* 2. Add New Sub-layer Selector */}
              <div className="bg-[#222222] p-3.5 rounded-xl border border-[#2e2e2e] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Add Layer to Composite</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Layer Catalog</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedPresetToAdd}
                    onChange={(e) => setSelectedPresetToAdd(e.target.value)}
                    className="flex-1 bg-[#171717] border border-[#383838] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none transition cursor-pointer"
                  >
                    {POPULAR_LAYER_PRESETS.map((p) => {
                      const isAdded = subLayers.some((l) => l.variableId === p.variableId);
                      return (
                        <option 
                          key={p.variableId} 
                          value={p.variableId} 
                          disabled={isAdded}
                          className="bg-[#171717] text-slate-200"
                        >
                          {p.variableName} ({p.sourceName}) {isAdded ? '✓ Added' : ''}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddPreset}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* 3. Sub-layers Stack (Reorderable via Drag & Drop or Buttons) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Layer Order & Opacity ({subLayers.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Top item in list = Topmost layer on map
                  </span>
                </div>

                {subLayers.length === 0 ? (
                  <div className="p-8 text-center bg-[#222222] border border-dashed border-[#383838] rounded-xl text-slate-400 text-xs">
                    No layers added yet. Select layers from the catalog above to combine them.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subLayers.map((layer, index) => {
                      const isFirst = index === 0;
                      const isLast = index === subLayers.length - 1;
                      const isDragged = draggedIndex === index;
                      const isOver = dragOverIndex === index;

                      return (
                        <div
                          key={layer.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`p-3 rounded-xl border transition-all ${
                            isDragged 
                              ? 'opacity-40 border-dashed border-cyan-500 bg-[#282828]'
                              : isOver
                              ? 'border-cyan-400 bg-[#262e3d] shadow-lg shadow-cyan-950/50'
                              : 'bg-[#222222] border-[#2e2e2e] hover:border-[#3d3d3d]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            {/* Drag handle & Order Badge & Title */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400 transition p-0.5"
                                title="Drag & Drop to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                isFirst
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-[#2c2c2c] text-slate-400 border border-[#3a3a3a]'
                              }`}>
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                  <span>{layer.variableName}</span>
                                  {isFirst && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded font-bold">
                                      TOP
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {layer.sourceName} • {layer.levelName}
                                </div>
                              </div>
                            </div>

                            {/* Reorder Buttons & Delete */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => handleMoveUp(index)}
                                className="p-1 rounded bg-[#2a2a2a] hover:bg-[#353535] text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                title="Move Up (Higher Priority)"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => handleMoveDown(index)}
                                className="p-1 rounded bg-[#2a2a2a] hover:bg-[#353535] text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                title="Move Down (Lower Priority)"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveLayer(layer.id)}
                                className="p-1 rounded bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition cursor-pointer ml-1"
                                title="Remove layer from composite"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Opacity Slider */}
                          <div className="flex items-center gap-2 pt-1.5 border-t border-[#2a2a2a]">
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">Opacity</span>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={layer.opacity}
                              onChange={(e) => handleOpacityChange(layer.id, parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-500 h-1 bg-[#171717] rounded cursor-pointer"
                            />
                            <span className="text-[9.5px] font-mono font-bold text-cyan-400 shrink-0 w-7 text-right">
                              {layer.opacity}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Left Column Footer Actions */}
            <div className="p-3.5 bg-[#212121] border-t border-[#2e2e2e] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#383838] text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#353535] text-white border border-[#444444] rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Save Only
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Activate Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: REAL MAPLIBRE LIVE MAP PREVIEW */}
          <div className="flex-1 flex flex-col bg-[#111318] relative overflow-hidden min-h-[300px]">
            
            {/* Top Preview Map HUD Header */}
            <div className="p-3 bg-[#191c24]/90 backdrop-blur-md border-b border-[#252a38] flex items-center justify-between z-20">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span className="text-xs font-bold text-slate-100">
                  Live MapLibre Preview & Stack Order
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  WebGL 3D Map
                </span>
              </div>

              {/* Coordinates & Navigation Controls */}
              <div className="flex items-center space-x-2">
                {hoverCoords && (
                  <span className="text-[10px] font-mono text-slate-400 bg-[#161a24] px-2 py-0.5 rounded border border-[#232838] hidden sm:inline-block">
                    {hoverCoords.lat}° N, {hoverCoords.lon}° E
                  </span>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => mapRef.current?.zoomIn()}
                    className="p-1 bg-[#232838] hover:bg-[#2e3549] text-slate-200 rounded text-xs transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => mapRef.current?.zoomOut()}
                    className="p-1 bg-[#232838] hover:bg-[#2e3549] text-slate-200 rounded text-xs transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      mapRef.current?.flyTo({ center: [53.6880, 32.4279], zoom: 4.8 });
                    }}
                    className="p-1 bg-[#232838] hover:bg-[#2e3549] text-slate-200 rounded text-xs transition cursor-pointer"
                    title="Reset Camera to Region Center"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Real MapLibre Map Container */}
            <div className="flex-1 w-full h-full relative">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

              {/* Floating Bottom Preview Layer Stack HUD */}
              <div 
                className="absolute bottom-3 left-3 right-3 md:right-auto bg-[#131620]/90 backdrop-blur-md border border-[#232a3d] rounded-xl p-2.5 shadow-2xl z-20 flex flex-col space-y-1.5 max-w-sm pointer-events-none select-none"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 border-b border-[#232a3d] pb-1">
                  <span>Active Stack Order on Map:</span>
                  <span className="text-cyan-400 font-mono">{subLayers.length} Layers</span>
                </div>

                <div className="space-y-1">
                  {subLayers.map((layer, idx) => (
                    <div 
                      key={layer.id}
                      className="flex items-center justify-between text-[9px] font-mono text-slate-300"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] ${
                          idx === 0 ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[170px]">{layer.variableName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>{layer.opacity}%</span>
                        {idx === 0 && <span className="text-cyan-400 font-bold">[TOP]</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
