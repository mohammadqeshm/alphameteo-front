import { FunctionDeclaration, Type } from "@google/genai";

export interface AgentAction {
  name: string;
  args: Record<string, any>;
  summary: string;
}

export interface AgentActionExecution {
  id: string;
  toolName: string;
  summary: string;
  status: "executing" | "completed" | "failed";
  timestamp: number;
  params: Record<string, any>;
}

export const agentToolDeclarations: FunctionDeclaration[] = [
  {
    name: "navigateToLocation",
    description: "Move, fly, or zoom the meteorological map to a specific geographic city, country, region, ocean basin, or coordinate coordinates.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        locationName: {
          type: Type.STRING,
          description: "Name of the location, city or region (e.g. 'Shiraz, Iran', 'Tokyo, Japan', 'Gulf of Mexico', 'Death Valley')"
        },
        latitude: {
          type: Type.NUMBER,
          description: "Latitude coordinate (-90 to 90)"
        },
        longitude: {
          type: Type.NUMBER,
          description: "Longitude coordinate (-180 to 180)"
        },
        zoomLevel: {
          type: Type.NUMBER,
          description: "Zoom level between 3 (world/regional view) and 12 (city/local view). Default is 8."
        }
      },
      required: ["latitude", "longitude"]
    }
  },
  {
    name: "setWeatherLayer",
    description: "Switch the active weather overlay layer on the primary map.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        layerId: {
          type: Type.STRING,
          description: "The layer id to activate: 'temperature', 'wind', 'precipitation', 'clouds', 'pressure', 'humidity', 'radar', 'waves'."
        },
        opacity: {
          type: Type.NUMBER,
          description: "Opacity percentage (10 to 100)"
        },
        visualizationStyle: {
          type: Type.STRING,
          description: "'continuous', 'contoured', or 'discrete'"
        }
      },
      required: ["layerId"]
    }
  },
  {
    name: "configureCatalogLayer",
    description: "Activate or configure a specific meteorological model parameter (GFS, ECMWF, ICON, Radar) and add it to the active stack.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        sourceId: {
          type: Type.STRING,
          description: "Source NWP model: 'gfs_025', 'ecmwf_ifs', 'icon_global', 'radar_composite', 'copernicus_era5'"
        },
        variableId: {
          type: Type.STRING,
          description: "Weather variable id (e.g. 'temp_2m', 'cloud_total', 'wind_10m', 'precip_total', 'mslp', 'dew_point', 'reflectivity_sim')"
        },
        levelId: {
          type: Type.STRING,
          description: "Vertical level (e.g. '2m', '10m', 'surface', 'column', '850hpa', '500hpa', '250hpa')"
        },
        opacity: {
          type: Type.NUMBER,
          description: "Opacity percentage (0 to 100)"
        },
        paletteId: {
          type: Type.STRING,
          description: "Color palette ID (e.g. 'thermal', 'wind', 'precipitation', 'neutral', 'pressure')"
        }
      },
      required: ["sourceId", "variableId"]
    }
  },
  {
    name: "setTimelineForecastHour",
    description: "Move the forecast timeline scrubber to a specific forecast step in hours (+0h to +120h) or start/stop animation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        hour: {
          type: Type.NUMBER,
          description: "The forecast hour to select (e.g. 0, 6, 12, 24, 48, 72, 120)"
        },
        autoPlay: {
          type: Type.BOOLEAN,
          description: "Whether to start playing time-step animation automatically"
        }
      },
      required: ["hour"]
    }
  },
  {
    name: "setSplitScreenMode",
    description: "Toggle or configure multi-map comparison mode (single map, dual split, or quad split).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        layout: {
          type: Type.STRING,
          description: "The split layout to switch to: 'single', 'dual', or 'quad'"
        },
        syncPanning: {
          type: Type.BOOLEAN,
          description: "Whether pan/zoom is synchronized across all split maps"
        }
      },
      required: ["layout"]
    }
  },
  {
    name: "openUIPanel",
    description: "Open or focus a specific UI panel on the workstation (e.g. layers stack, layer settings, notes, news).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        panelName: {
          type: Type.STRING,
          description: "Panel to open: 'layers', 'settings', 'notes', 'news'"
        }
      },
      required: ["panelName"]
    }
  }
];
