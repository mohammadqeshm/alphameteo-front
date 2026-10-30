import { CanvasDocument } from "../types/canvas";

export const HORMOZGAN_CONVECTIVE_OUTLOOK_TEMPLATE: CanvasDocument = {
  id: "doc_hormozgan_convective_outlook",
  name: "Hormozgan Severe Convective Outlook",
  description: "24-Hour Synoptic & Mesoscale Deep Convective Assessment across the Strait of Hormuz & Southern Zagros",
  createdAt: Date.now() - 3600000 * 2,
  updatedAt: Date.now(),
  viewport: {
    x: 180,
    y: 80,
    zoom: 0.85
  },
  syncGroups: [
    {
      id: "sync_grp_hormozgan",
      name: "Hormozgan Mesoscale Extent",
      color: "#38BDF8",
      syncCoords: true,
      syncTime: true,
      coords: { lat: 27.1832, lon: 56.2666, elevation: 12 },
      zoom: 6.8,
      forecastHour: 18
    }
  ],
  items: [
    // FRAME 1: Synoptic Upper-Air & Surface Setup
    {
      id: "frame_synoptic",
      type: "frame",
      title: "FRAME 1: SYNOPTIC UPPER-AIR & SURFACE SETUP",
      colorTheme: "cyan",
      description: "ECMWF / GFS Cut-Off Low & Subtropical Jet Overlap",
      x: 40,
      y: 40,
      width: 1040,
      height: 600,
      zIndex: 1,
      createdAt: 1730000000000
    },
    // Map 1: ECMWF 500 hPa Geopotential
    {
      id: "map_ecmwf_500",
      type: "live_map",
      title: "ECMWF 0.1° — 500 hPa Geopotential & Absolute Vorticity",
      x: 70,
      y: 110,
      width: 470,
      height: 480,
      zIndex: 2,
      frameId: "frame_synoptic",
      coords: { lat: 27.2, lon: 56.3, elevation: 15 },
      zoom: 6.2,
      activeLayerId: "pressure",
      model: "ECMWF HRES",
      run: "00Z",
      forecastHour: 18,
      level: "500hPa",
      colorScaleName: "Pressure",
      visualizationStyle: "continuous",
      layerOpacity: 85,
      syncGroupId: "sync_grp_hormozgan",
      createdAt: 1730000001000
    },
    // Map 2: GFS 850 hPa Moisture & Wind Vectors
    {
      id: "map_gfs_850",
      type: "live_map",
      title: "GFS 0.25° — 850 hPa Equivalent Potential Temp (Theta-E)",
      x: 570,
      y: 110,
      width: 480,
      height: 480,
      zIndex: 2,
      frameId: "frame_synoptic",
      coords: { lat: 27.2, lon: 56.3, elevation: 15 },
      zoom: 6.2,
      activeLayerId: "temperature",
      model: "GFS Global",
      run: "00Z",
      forecastHour: 18,
      level: "850hPa",
      colorScaleName: "Thermal",
      visualizationStyle: "continuous",
      layerOpacity: 85,
      syncGroupId: "sync_grp_hormozgan",
      createdAt: 1730000002000
    },

    // FRAME 2: Mesoscale Convection & Soundings
    {
      id: "frame_mesoscale",
      type: "frame",
      title: "FRAME 2: MESOSCALE THERMODYNAMICS & RADAR ANALYSIS",
      colorTheme: "amber",
      description: "Severe Thunderstorm Parameters, CAPE / CIN & Vertical Shear",
      x: 1120,
      y: 40,
      width: 1040,
      height: 600,
      zIndex: 1,
      createdAt: 1730000003000
    },
    // Chart: Skew-T Sounding for Bandar Abbas
    {
      id: "chart_sounding_oikb",
      type: "chart",
      title: "Thermodynamic Skew-T Sounding — Bandar Abbas (OIKB)",
      chartType: "sounding",
      locationName: "Bandar Abbas Airport (OIKB)",
      coords: { lat: 27.218, lon: 56.377, elevation: 10 },
      model: "ECMWF / GFS Blended",
      x: 1150,
      y: 110,
      width: 480,
      height: 480,
      zIndex: 2,
      frameId: "frame_mesoscale",
      createdAt: 1730000004000
    },
    // Map Snapshot: Radar Reflectivity
    {
      id: "snapshot_radar_hormuz",
      type: "map_snapshot",
      title: "High-Res Radar Composite (Strait of Hormuz & Qeshm)",
      parameterName: "Composite Reflectivity (dBZ)",
      sourceModel: "Doppler Radar Network (IRIMO / OIKB)",
      modelRun: "Live Composite Scan",
      validTime: "T+18h Peak Diurnal Heat",
      forecastHour: 18,
      level: "Lowest Tilt 0.5°",
      imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=900&q=80",
      notes: "Intense convective multicell clusters with core reflectivity > 55 dBZ detected approaching Minab and north of Bandar Abbas.",
      x: 1660,
      y: 110,
      width: 470,
      height: 480,
      zIndex: 2,
      frameId: "frame_mesoscale",
      createdAt: 1730000005000
    },

    // FRAME 3: Climate Indices & Teleconnections
    {
      id: "frame_teleconnections",
      type: "frame",
      title: "FRAME 3: LARGE-SCALE TELECONNECTIONS & REGIONAL SST",
      colorTheme: "purple",
      description: "Indian Ocean Dipole (IOD), MJO Tropical Wave & ENSO Teleconnection",
      x: 40,
      y: 670,
      width: 1040,
      height: 540,
      zIndex: 1,
      createdAt: 1730000006000
    },
    // Climate Index 1: MJO Phase Diagram
    {
      id: "idx_mjo",
      type: "climate_index",
      title: "MJO Wheeler-Hendon Phase Diagram",
      indexId: "mjo",
      viewMode: "phase_diagram",
      dataSource: "BOM Australia",
      x: 70,
      y: 740,
      width: 380,
      height: 440,
      zIndex: 2,
      frameId: "frame_teleconnections",
      createdAt: 1730000007000
    },
    // Climate Index 2: IOD Dipole Mode Index
    {
      id: "idx_iod",
      type: "climate_index",
      title: "Indian Ocean Dipole (DMI)",
      indexId: "iod",
      viewMode: "timeseries",
      dataSource: "BOM Australia",
      x: 480,
      y: 740,
      width: 340,
      height: 440,
      zIndex: 2,
      frameId: "frame_teleconnections",
      createdAt: 1730000008000
    },
    // Climate Index 3: Nino 3.4
    {
      id: "idx_nino34",
      type: "climate_index",
      title: "ENSO — Niño 3.4 SST Anomaly",
      indexId: "nino34",
      viewMode: "summary",
      dataSource: "NOAA CPC",
      x: 850,
      y: 740,
      width: 200,
      height: 440,
      zIndex: 2,
      frameId: "frame_teleconnections",
      createdAt: 1730000009000
    },

    // FRAME 4: Forecaster Synoptic Reasoning & Warnings
    {
      id: "frame_briefing",
      type: "frame",
      title: "FRAME 4: FORECASTER SYNOPTIC REASONING & SEVERE WATCH",
      colorTheme: "rose",
      description: "Risk Matrix, Marine Advisory & Flash Flood Vulnerability",
      x: 1120,
      y: 670,
      width: 1040,
      height: 540,
      zIndex: 1,
      createdAt: 1730000010000
    },
    // Text: Forecaster Reasoning
    {
      id: "text_synoptic_notes",
      type: "text",
      title: "Hormozgan Convective Assessment Brief",
      textRole: "body",
      content: `### 1. SYNOPTIC ASSESSMENT:
A high-amplitude mid-tropospheric trough over central Iran is phasing with an intensifying subtropical jet streak (200 hPa winds > 95 kts) directly across the Strait of Hormuz. At lower levels, strong southerly maritime moisture advection from the Sea of Oman is driving precipitable water (PWAT) to anomalous values exceeding 48 mm (+2.5 σ).

### 2. THERMODYNAMIC ENVIRONMENT:
- **Surface-based CAPE**: 2400 to 3200 J/kg along coastal plain.
- **Bulk Wind Shear (0-6 km)**: 45 kts (favorable for organized multicells and discrete supercell structures).
- **Lifting Mechanism**: Intense sea-breeze front interacting with southern Zagros orographic barrier.

### 3. HAZARDS & IMPACTS:
- **Flash Flooding**: Rapid runoff likely in dry wadis (Rudbar, Minab, Jask sectors).
- **Severe Microbursts**: Surface gusts up to 55-65 kts, creating localized sandstorms prior to storm arrival.
- **Marine Gales**: Rough seas in Strait of Hormuz with wave heights 2.5 - 3.8m.`,
      x: 1150,
      y: 740,
      width: 610,
      height: 440,
      zIndex: 2,
      frameId: "frame_briefing",
      createdAt: 1730000011000
    },
    // Annotation: Sticky Note Warning
    {
      id: "anno_sticky_alert",
      type: "annotation",
      title: "Priority Forecaster Watch",
      shape: "sticky_note",
      color: "#F59E0B",
      text: "WATCH CRITERIA MET:\nHigh-risk convective initiation window 14:00 - 19:30 UTC. Monitor OIKB Doppler radar velocity shear and EUMETSAT MTG-LI lightning flash density.",
      x: 1790,
      y: 740,
      width: 340,
      height: 220,
      zIndex: 3,
      frameId: "frame_briefing",
      createdAt: 1730000012000
    },
    // Annotation: Convective Watch Polygon
    {
      id: "anno_convective_watch",
      type: "annotation",
      title: "Level 2 Convective Watch Polygon",
      shape: "convective_watch",
      color: "#EF4444",
      text: "SEVERE CONVECTIVE WATCH ZONE (Hormozgan & Strait of Hormuz)",
      x: 1790,
      y: 990,
      width: 340,
      height: 190,
      zIndex: 3,
      frameId: "frame_briefing",
      createdAt: 1730000013000
    }
  ]
};

export const MODEL_COMPARISON_TEMPLATE: CanvasDocument = {
  id: "doc_model_comparison",
  name: "ECMWF vs GFS Synoptic Comparison",
  description: "Cross-model verification board for 500 hPa Geopotential, MSLP, and 24h Accumulated Precipitation",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  viewport: { x: 120, y: 100, zoom: 0.9 },
  syncGroups: [
    {
      id: "sync_comp",
      name: "Middle East Synoptic Box",
      color: "#38BDF8",
      syncCoords: true,
      syncTime: true,
      coords: { lat: 32.0, lon: 53.0, elevation: 1200 },
      zoom: 4.8,
      forecastHour: 48
    }
  ],
  items: [
    {
      id: "f_ecmwf",
      type: "frame",
      title: "ECMWF INTEGRATED FORECAST SYSTEM (HRES 0.1°)",
      colorTheme: "cyan",
      x: 40,
      y: 40,
      width: 680,
      height: 600,
      zIndex: 1,
      createdAt: 1730000020000
    },
    {
      id: "m_ecmwf",
      type: "live_map",
      title: "ECMWF 500 hPa Height & MSLP",
      x: 60,
      y: 110,
      width: 640,
      height: 500,
      zIndex: 2,
      frameId: "f_ecmwf",
      coords: { lat: 32.0, lon: 53.0, elevation: 1200 },
      zoom: 4.8,
      activeLayerId: "pressure",
      model: "ECMWF HRES",
      run: "00Z",
      forecastHour: 48,
      level: "500hPa",
      colorScaleName: "Pressure",
      visualizationStyle: "continuous",
      layerOpacity: 85,
      syncGroupId: "sync_comp",
      createdAt: 1730000021000
    },
    {
      id: "f_gfs",
      type: "frame",
      title: "NOAA GLOBAL FORECAST SYSTEM (GFS 0.25°)",
      colorTheme: "amber",
      x: 760,
      y: 40,
      width: 680,
      height: 600,
      zIndex: 1,
      createdAt: 1730000022000
    },
    {
      id: "m_gfs",
      type: "live_map",
      title: "GFS 500 hPa Height & MSLP",
      x: 780,
      y: 110,
      width: 640,
      height: 500,
      zIndex: 2,
      frameId: "f_gfs",
      coords: { lat: 32.0, lon: 53.0, elevation: 1200 },
      zoom: 4.8,
      activeLayerId: "pressure",
      model: "GFS Global",
      run: "00Z",
      forecastHour: 48,
      level: "500hPa",
      colorScaleName: "Pressure",
      visualizationStyle: "continuous",
      layerOpacity: 85,
      syncGroupId: "sync_comp",
      createdAt: 1730000023000
    }
  ]
};

export const BLANK_CANVAS_TEMPLATE: CanvasDocument = {
  id: "doc_blank",
  name: "Untitled Meteorological Workspace",
  description: "Custom analysis canvas",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  viewport: { x: 300, y: 200, zoom: 1.0 },
  syncGroups: [],
  items: []
};
