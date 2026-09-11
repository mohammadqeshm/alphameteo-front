import {
  CategoryInfo,
  DataSourceModel,
  VerticalLevel,
  WeatherVariable,
  VisualizationOption,
  ColorPalette,
  PresetWorkstation,
  ActiveLayer
} from "../types";

// ==========================================
// 1. CATEGORIES (First Level)
// ==========================================
export class CategoriesCatalog {
  static readonly CATEGORIES: CategoryInfo[] = [
    {
      id: "models",
      name: "Numerical Weather Models",
      iconName: "Cpu",
      description: "Global & regional NWP deterministic/ensemble models",
      badge: "12 Models",
      sourceCount: 12
    },
    {
      id: "live_obs",
      name: "مشاهدات زنده (Live Observations)",
      iconName: "Zap",
      description: "سامانه ماهواره‌ای رصد رعد و برق و صاعقه لحظه‌ای EUMETSAT MTG-LI (فضاپایه)",
      badge: "EUMETSAT Live",
      sourceCount: 1
    },
    {
      id: "radar",
      name: "Weather Radar",
      iconName: "Radar",
      description: "Doppler reflectivity, radial velocity & dual-pol product feeds",
      badge: "High-Res",
      sourceCount: 4
    },
    {
      id: "satellite",
      name: "Satellite Imagery",
      iconName: "Satellite",
      description: "GEO/LEO Infrared, Water Vapor, Visible & RGB Composites",
      badge: "10 min",
      sourceCount: 5
    },
    {
      id: "lightning",
      name: "رادار صاعقه و توفان تندری",
      iconName: "Zap",
      description: "رادار منطقه‌ای البروق (۱۵ دقیقه گذشته) + ماهواره فضاپایه MTG-LI و رادار داپلر همرفت",
      badge: "Live Radar",
      sourceCount: 3
    },
    {
      id: "ocean_marine",
      name: "Ocean & Marine",
      iconName: "Waves",
      description: "SST, wave height/period, surface currents & sea ice depth",
      badge: "Global",
      sourceCount: 5
    },
    {
      id: "air_quality",
      name: "Air Quality & Dust",
      iconName: "Wind",
      description: "PM2.5, PM10, Ozone, NO2, Dust Optical Depth & AQI",
      badge: "CAMS",
      sourceCount: 4
    },
    {
      id: "climate",
      name: "Climate & Reanalysis",
      iconName: "Activity",
      description: "ERA5 reanalysis, SST anomalies & long-term baselines",
      badge: "1979-2026",
      sourceCount: 4
    },
    {
      id: "seasonal",
      name: "Seasonal Forecasts",
      iconName: "Calendar",
      description: "ECMWF SEAS5, CFSv2 & NMME monthly/quarterly trends",
      badge: "9 Months",
      sourceCount: 3
    },
    {
      id: "historical",
      name: "Historical Archive",
      iconName: "Archive",
      description: "Past severe storm radar, cyclone tracks & sounding records",
      badge: "Database",
      sourceCount: 4
    },
    {
      id: "gis_custom",
      name: "GIS & Custom Layers",
      iconName: "Map",
      description: "Boundaries, terrain hillshade, airways, shipping & GeoJSON",
      badge: "Vector",
      sourceCount: 6
    },
    {
      id: "favorites",
      name: "Favorites & Presets",
      iconName: "Star",
      description: "Saved forecaster views, favorite models & custom color palettes",
      badge: "Quick Access",
      sourceCount: 8
    }
  ];
}

export const CATEGORIES: CategoryInfo[] = CategoriesCatalog.CATEGORIES;

// ==========================================
// 2. DATA SOURCES & MODELS (Second Level)
// ==========================================
export const DATA_SOURCES: DataSourceModel[] = [
  // NWP Models
  {
    id: "ecmwf_ifs",
    categoryId: "models",
    name: "ECMWF IFS (Integrated Forecasting System)",
    shortName: "ECMWF",
    provider: "European Centre for Medium-Range Weather Forecasts",
    spatialResolution: "0.1° (~9 km)",
    temporalResolution: "Hourly (0-90h), 3-hourly (90-240h)",
    forecastHorizon: "10 Days (240h)",
    updateFrequency: "4x Daily (00Z, 06Z, 12Z, 18Z)",
    description: "Gold-standard global operational deterministic forecast model.",
    badge: "Flagship",
    isFavorite: true,
    supportedVariableIds: [
      "temp_2m", "feels_like", "dew_point", "rel_hum", "mslp", "pressure",
      "wind_10m", "wind_gust", "precip_total", "snow_depth", "cloud_total",
      "visibility", "cape", "cin", "lifted_index", "helicity", "freezing_level",
      "pwat", "thickness_500_1000", "vorticity_500", "jet_stream_250"
    ]
  },
  {
    id: "gfs_025",
    categoryId: "models",
    name: "NOAA GFS (Global Forecast System)",
    shortName: "GFS",
    provider: "NWS / NCEP (United States)",
    spatialResolution: "0.25° (~28 km)",
    temporalResolution: "Hourly (0-120h), 3-hourly (120-384h)",
    forecastHorizon: "16 Days (384h)",
    updateFrequency: "4x Daily (00Z, 06Z, 12Z, 18Z)",
    description: "Global high-resolution mesoscale & synoptic scale operational forecast model.",
    badge: "Global",
    isFavorite: true,
    supportedVariableIds: [
      "temp_2m", "feels_like", "dew_point", "rel_hum", "mslp", "pressure",
      "wind_10m", "wind_gust", "precip_total", "snow_depth", "cloud_total",
      "visibility", "fog", "cape", "cin", "lifted_index", "helicity",
      "reflectivity_sim", "freezing_level", "pwat", "thickness_500_1000",
      "vorticity_500", "jet_stream_250"
    ]
  },
  {
    id: "icon_global",
    categoryId: "models",
    name: "DWD ICON (Icosahedral Nonhydrostatic)",
    shortName: "ICON",
    provider: "Deutscher Wetterdienst (Germany)",
    spatialResolution: "13 km Global",
    temporalResolution: "Hourly (0-78h), 3-hourly (78-180h)",
    forecastHorizon: "7.5 Days (180h)",
    updateFrequency: "4x Daily",
    description: "Unstructured icosahedral triangular grid model with high conservation properties.",
    badge: "High Precision",
    supportedVariableIds: [
      "temp_2m", "dew_point", "rel_hum", "mslp", "wind_10m", "wind_gust",
      "precip_total", "snow_depth", "cloud_total", "cape", "pwat", "vorticity_500"
    ]
  },
  {
    id: "icon_eu",
    categoryId: "models",
    name: "DWD ICON-EU (Regional Europe)",
    shortName: "ICON-EU",
    provider: "Deutscher Wetterdienst (Germany)",
    spatialResolution: "6.5 km Regional",
    temporalResolution: "Hourly",
    forecastHorizon: "5 Days (120h)",
    updateFrequency: "4x Daily",
    description: "High-resolution regional model focused on Europe and Middle East sectors.",
    badge: "Regional",
    supportedVariableIds: [
      "temp_2m", "feels_like", "dew_point", "rel_hum", "mslp", "wind_10m",
      "wind_gust", "precip_total", "snow_depth", "cloud_total", "fog",
      "cape", "reflectivity_sim", "pwat"
    ]
  },
  {
    id: "hrrr_3km",
    categoryId: "models",
    name: "NCEP HRRR (High-Resolution Rapid Refresh)",
    shortName: "HRRR",
    provider: "NOAA / NCEP",
    spatialResolution: "3 km Convection-Allowing",
    temporalResolution: "15 min / Hourly",
    forecastHorizon: "18-48 Hours",
    updateFrequency: "Hourly (24x/day)",
    description: "Real-time 3-km atmospheric convection-allowing model initialized with radar reflectivity.",
    badge: "3km Convective",
    isFavorite: true,
    supportedVariableIds: [
      "temp_2m", "wind_10m", "wind_gust", "precip_total", "cape", "cin",
      "helicity", "reflectivity_sim", "fog"
    ]
  },
  {
    id: "nam_12km",
    categoryId: "models",
    name: "NCEP NAM (North American Mesoscale)",
    shortName: "NAM",
    provider: "NOAA / NCEP",
    spatialResolution: "12 km Grid",
    temporalResolution: "3-hourly",
    forecastHorizon: "84 Hours",
    updateFrequency: "4x Daily",
    description: "Non-hydrostatic multiscale model specialized for regional mesoscale dynamics.",
    supportedVariableIds: ["temp_2m", "mslp", "wind_10m", "precip_total", "cape", "pwat"]
  },
  {
    id: "ukmo_global",
    categoryId: "models",
    name: "UK Met Office Unified Model",
    shortName: "UKMO",
    provider: "UK Met Office (United Kingdom)",
    spatialResolution: "10 km Global",
    temporalResolution: "3-hourly",
    forecastHorizon: "6 Days (144h)",
    updateFrequency: "2x Daily (00Z, 12Z)",
    description: "Deep-atmosphere non-hydrostatic formulation featuring ENDGame dynamics.",
    supportedVariableIds: ["temp_2m", "mslp", "wind_10m", "precip_total", "cloud_total", "jet_stream_250"]
  },
  {
    id: "arpege_global",
    categoryId: "models",
    name: "Météo-France ARPEGE",
    shortName: "ARPEGE",
    provider: "Météo-France",
    spatialResolution: "0.1° Europe / 0.25° Global",
    temporalResolution: "Hourly",
    forecastHorizon: "4 Days (102h)",
    updateFrequency: "4x Daily",
    description: "Spectral global model with stretched grid geometry over Europe.",
    supportedVariableIds: ["temp_2m", "mslp", "wind_10m", "precip_total", "cape"]
  },
  {
    id: "arome_13",
    categoryId: "models",
    name: "Météo-France AROME",
    shortName: "AROME",
    provider: "Météo-France",
    spatialResolution: "1.3 km Ultra High-Res",
    temporalResolution: "15 min / Hourly",
    forecastHorizon: "42 Hours",
    updateFrequency: "5x Daily",
    description: "Convective-scale non-hydrostatic numerical model for hazardous weather.",
    badge: "1.3km Convective",
    supportedVariableIds: ["temp_2m", "wind_10m", "wind_gust", "precip_total", "reflectivity_sim", "cape", "fog"]
  },
  {
    id: "gem_global",
    categoryId: "models",
    name: "Environment Canada GEM",
    shortName: "GEM",
    provider: "Canadian Meteorological Centre",
    spatialResolution: "15 km Global",
    temporalResolution: "3-hourly",
    forecastHorizon: "10 Days (240h)",
    updateFrequency: "2x Daily",
    description: "Global Environmental Multiscale model developed by ECCC.",
    supportedVariableIds: ["temp_2m", "mslp", "wind_10m", "precip_total", "snow_depth"]
  },
  {
    id: "jma_gsm",
    categoryId: "models",
    name: "Japan Meteorological Agency GSM",
    shortName: "JMA",
    provider: "JMA (Japan)",
    spatialResolution: "20 km Global",
    temporalResolution: "6-hourly",
    forecastHorizon: "11 Days",
    updateFrequency: "4x Daily",
    description: "Spectral global model tailored for tropical cyclones and East Asian monsoons.",
    supportedVariableIds: ["temp_2m", "mslp", "wind_10m", "precip_total", "pwat"]
  },
  {
    id: "wrf_custom",
    categoryId: "models",
    name: "WRF-ARW (Weather Research & Forecasting)",
    shortName: "WRF",
    provider: "ALPHA METEO High-Res Cluster",
    spatialResolution: "1 km Custom Grid",
    temporalResolution: "10 min",
    forecastHorizon: "36 Hours",
    updateFrequency: "On-demand / 6x Daily",
    description: "Custom operational mesoscale WRF-ARW v4.5 with Doppler radar assimilation.",
    badge: "1km Custom",
    isFavorite: true,
    supportedVariableIds: ["temp_2m", "wind_10m", "wind_gust", "precip_total", "reflectivity_sim", "cape", "helicity"]
  },

  // Live Observations - Exclusively EUMETSAT MTG-LI Lightning Imager per user requirement
  {
    id: "eumetsat_mtg_li",
    categoryId: "live_obs",
    name: "EUMETSAT MTG Lightning Imager (LI)",
    shortName: "MTG-LI EUMETSAT",
    provider: "EUMETSAT (Darmstadt, Germany)",
    spatialResolution: "4.5 km SSP (~7 km Europe/Middle East)",
    temporalResolution: "1 ms (1,000 frames/sec)",
    forecastHorizon: "Real-time Live Stream (0.0° GEO)",
    updateFrequency: "Continuous (Real-time)",
    description: "صاعقه‌نگار فضاپایه ماهواره متئوستم نسل ۳ (MTG-I1) با ۴ دوربین نوری نوار باریک ۷۷۷.۴ نانومتر اکسیژن اتمی برای ثبت صاعقه‌های درون ابر و ابر به زمین.",
    badge: "Official Live",
    isFavorite: true,
    supportedVariableIds: ["mtg_li_lightning"]
  },

  // Weather Radar
  {
    id: "radar_composite",
    categoryId: "radar",
    name: "Global Composite Doppler Radar",
    shortName: "Composite Radar",
    provider: "Multi-National Radar Network",
    spatialResolution: "500 m Grid",
    temporalResolution: "5 - 10 min",
    forecastHorizon: "Live + 2h Nowcast",
    updateFrequency: "5 Minutes",
    description: "Mosaic composite reflectivity from ground-based S-band and C-band dual-pol Doppler radars.",
    badge: "Live 5min",
    isFavorite: true,
    supportedVariableIds: ["reflectivity_sim", "precip_total"]
  },

  // Satellite
  {
    id: "sat_geo_ir",
    categoryId: "satellite",
    name: "Geostationary Satellite Infrared (10.8µm)",
    shortName: "Sat Infrared IR",
    provider: "EUMETSAT / NOAA / JMA",
    spatialResolution: "2 km Sub-satellite",
    temporalResolution: "10 min",
    forecastHorizon: "Live Loop",
    updateFrequency: "10 Minutes",
    description: "Infrared brightness temperature imagery with color enhancement scales.",
    badge: "GEO 10min",
    isFavorite: true,
    supportedVariableIds: ["temp_2m", "cloud_total"]
  },

  // Ocean Marine
  {
    id: "ocean_wavewatch",
    categoryId: "ocean_marine",
    name: "NOAA WAVEWATCH III",
    shortName: "WAVEWATCH III",
    provider: "NCEP / NOAA",
    spatialResolution: "0.5° Global Grid",
    temporalResolution: "3-hourly",
    forecastHorizon: "7 Days (180h)",
    updateFrequency: "4x Daily",
    description: "Spectral wave model forecasting swell height, direction, wave period, and wind waves.",
    supportedVariableIds: ["wave_height", "ocean_current", "sst", "sea_ice"]
  }
];

// ==========================================
// 3. VERTICAL ISOBARIC / HEIGHT LEVELS
// ==========================================
export const VERTICAL_LEVELS: VerticalLevel[] = [
  { id: "surface", name: "Surface / Ground Level", shortLabel: "Surface", description: "Skin surface / 0m elevation", type: "surface" },
  { id: "2m", name: "2 meters above ground", shortLabel: "2m", description: "Standard screen height for temperature & humidity", type: "height", altitudeKm: 0.002 },
  { id: "10m", name: "10 meters above ground", shortLabel: "10m", description: "Standard height for surface wind & gusts", type: "height", altitudeKm: 0.01 },
  { id: "1000hpa", name: "1000 hPa (~110 m)", shortLabel: "1000 hPa", description: "Near-surface isobaric level", type: "isobaric", altitudeKm: 0.1 },
  { id: "925hpa", name: "925 hPa (~750 m)", shortLabel: "925 hPa", description: "Low-level boundary layer transport", type: "isobaric", altitudeKm: 0.75 },
  { id: "850hpa", name: "850 hPa (~1,500 m)", shortLabel: "850 hPa", description: "Low-level jet, advection & freezing boundary", type: "isobaric", altitudeKm: 1.5 },
  { id: "700hpa", name: "700 hPa (~3,000 m)", shortLabel: "700 hPa", description: "Shortwave trough steering & moisture convergence", type: "isobaric", altitudeKm: 3.0 },
  { id: "500hpa", name: "500 hPa (~5,500 m)", shortLabel: "500 hPa", description: "Mid-tropospheric steering, vorticity & geopotential", type: "isobaric", altitudeKm: 5.5 },
  { id: "300hpa", name: "300 hPa (~9,000 m)", shortLabel: "300 hPa", description: "Subtropical jet stream & upper dynamics", type: "isobaric", altitudeKm: 9.0 },
  { id: "250hpa", name: "250 hPa (~10,500 m)", shortLabel: "250 hPa", description: "Polar front jet stream core (FL340)", type: "isobaric", altitudeKm: 10.5 },
  { id: "200hpa", name: "200 hPa (~12,000 m)", shortLabel: "200 hPa", description: "Upper troposphere outflow boundary", type: "isobaric", altitudeKm: 12.0 },
  { id: "tropopause", name: "Tropopause Level", shortLabel: "Tropopause", description: "Thermal tropopause height & potential vorticity (2 PVU)", type: "column" },
  { id: "column", name: "Integrated Total Column", shortLabel: "Column", description: "Entire integrated atmospheric column", type: "column" }
];

// ==========================================
// 4. WEATHER VARIABLES (Third Level)
// ==========================================
export const WEATHER_VARIABLES: WeatherVariable[] = [
  // Temperature Group
  {
    id: "temp_2m",
    name: "Temperature",
    shortName: "Temperature",
    category: "Thermodynamic",
    unit: "°C",
    description: "Air temperature standard reading",
    iconName: "Thermometer",
    supportedLevelIds: ["surface", "2m", "850hpa", "700hpa", "500hpa", "300hpa"],
    defaultLevelId: "2m",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "thermal",
    min: -50,
    max: 50,
    isFavorite: true
  },
  {
    id: "feels_like",
    name: "Feels Like (Apparent)",
    shortName: "Feels Like",
    category: "Thermodynamic",
    unit: "°C",
    description: "Apparent temperature combining wind chill and heat index",
    iconName: "Thermometer",
    supportedLevelIds: ["2m"],
    defaultLevelId: "2m",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "thermal",
    min: -50,
    max: 55
  },
  {
    id: "dew_point",
    name: "Dew Point",
    shortName: "Dew Point",
    category: "Thermodynamic",
    unit: "°C",
    description: "Atmospheric saturation temperature threshold",
    iconName: "Droplet",
    supportedLevelIds: ["2m", "850hpa", "700hpa"],
    defaultLevelId: "2m",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "thermal",
    min: -30,
    max: 35
  },
  {
    id: "rel_hum",
    name: "Relative Humidity",
    shortName: "Humidity",
    category: "Moisture",
    unit: "%",
    description: "Percentage water vapor pressure relative to saturation",
    iconName: "Droplets",
    supportedLevelIds: ["2m", "850hpa", "700hpa", "500hpa"],
    defaultLevelId: "2m",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "precipitation",
    min: 0,
    max: 100
  },

  // Pressure Group
  {
    id: "mslp",
    name: "MSLP (Mean Sea Level Pressure)",
    shortName: "MSLP",
    category: "Mass & Pressure",
    unit: "hPa",
    description: "Barometric pressure adjusted to mean sea level",
    iconName: "Gauge",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "contour_lines",
    defaultPaletteId: "neutral",
    min: 940,
    max: 1050,
    isFavorite: true
  },
  {
    id: "pressure",
    name: "Surface Pressure",
    shortName: "Surface Pres",
    category: "Mass & Pressure",
    unit: "hPa",
    description: "Actual station level atmospheric pressure",
    iconName: "Gauge",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "neutral",
    min: 800,
    max: 1040
  },

  // Wind Group
  {
    id: "wind_10m",
    name: "Wind Velocity & Streamlines",
    shortName: "Wind Speed",
    category: "Kinematics",
    unit: "m/s",
    description: "10-meter wind speed and particle animation stream",
    iconName: "Wind",
    supportedLevelIds: ["10m", "850hpa", "700hpa", "500hpa", "300hpa", "250hpa"],
    defaultLevelId: "10m",
    defaultVisualizationId: "wind_particles",
    defaultPaletteId: "wind",
    min: 0,
    max: 60,
    isFavorite: true
  },
  {
    id: "wind_gust",
    name: "Wind Gust",
    shortName: "Wind Gust",
    category: "Kinematics",
    unit: "m/s",
    description: "Peak 3-second turbulent wind speed vector",
    iconName: "Wind",
    supportedLevelIds: ["10m"],
    defaultLevelId: "10m",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "wind",
    min: 0,
    max: 75
  },

  // Precipitation & Hydrometeors
  {
    id: "precip_total",
    name: "Precipitation Rate / Accumulation",
    shortName: "Precipitation",
    category: "Hydrometeors",
    unit: "mm/h",
    description: "Liquid equivalent precipitation accumulation",
    iconName: "CloudRain",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "discrete_colors",
    defaultPaletteId: "precipitation",
    min: 0,
    max: 100,
    isFavorite: true
  },
  {
    id: "snow_depth",
    name: "Snow Depth & Accumulation",
    shortName: "Snow Depth",
    category: "Hydrometeors",
    unit: "cm",
    description: "Ground snow pack accumulation depth",
    iconName: "CloudSnow",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "filled_contours",
    defaultPaletteId: "neutral",
    min: 0,
    max: 200
  },

  // Cloud & Visibility
  {
    id: "cloud_total",
    name: "Total Cloud Cover",
    shortName: "Cloud Cover",
    category: "Aviation & Radiation",
    unit: "%",
    description: "Total integrated cloud fraction across all troposphere levels",
    iconName: "Cloud",
    supportedLevelIds: ["column"],
    defaultLevelId: "column",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "neutral",
    min: 0,
    max: 100
  },
  {
    id: "visibility",
    name: "Surface Visibility",
    shortName: "Visibility",
    category: "Aviation & Radiation",
    unit: "km",
    description: "Horizontal visual range near surface",
    iconName: "Eye",
    supportedLevelIds: ["2m"],
    defaultLevelId: "2m",
    defaultVisualizationId: "discrete_colors",
    defaultPaletteId: "thermal",
    min: 0,
    max: 50
  },
  {
    id: "fog",
    name: "Fog Index & Stratus",
    shortName: "Fog Index",
    category: "Aviation & Radiation",
    unit: "%",
    description: "Low radiation/advection fog formation probability",
    iconName: "CloudFog",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "heatmap",
    defaultPaletteId: "neutral",
    min: 0,
    max: 100
  },

  // Severe Convective Indices
  {
    id: "cape",
    name: "CAPE (Convective Available Potential Energy)",
    shortName: "CAPE",
    category: "Convective Severe",
    unit: "J/kg",
    description: "Buoyant kinetic energy available for convective updrafts",
    iconName: "Zap",
    supportedLevelIds: ["surface", "column"],
    defaultLevelId: "surface",
    defaultVisualizationId: "filled_contours",
    defaultPaletteId: "severe",
    min: 0,
    max: 5000,
    isFavorite: true
  },
  {
    id: "cin",
    name: "CIN (Convective Inhibition)",
    shortName: "CIN",
    category: "Convective Severe",
    unit: "J/kg",
    description: "Negative buoyant cap suppressing thunderstorm initiation",
    iconName: "ShieldAlert",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "filled_contours",
    defaultPaletteId: "neutral",
    min: -500,
    max: 0
  },
  {
    id: "lifted_index",
    name: "Lifted Index (LI)",
    shortName: "Lifted Index",
    category: "Convective Severe",
    unit: "K",
    description: "Parcel buoyancy deficit at 500 hPa level",
    iconName: "TrendingUp",
    supportedLevelIds: ["500hpa"],
    defaultLevelId: "500hpa",
    defaultVisualizationId: "contour_lines",
    defaultPaletteId: "severe",
    min: -12,
    max: 10
  },
  {
    id: "helicity",
    name: "Storm-Relative Helicity (SRH 0-3km)",
    shortName: "Helicity SRH",
    category: "Convective Severe",
    unit: "m²/s²",
    description: "Low-level directional & speed wind shear for supercell rotation",
    iconName: "RotateCw",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "filled_contours",
    defaultPaletteId: "severe",
    min: 0,
    max: 600
  },
  {
    id: "reflectivity_sim",
    name: "Composite Radar Reflectivity (dBZ)",
    shortName: "Reflectivity dBZ",
    category: "Hydrometeors",
    unit: "dBZ",
    description: "Simulated or active radar backscatter power",
    iconName: "Radar",
    supportedLevelIds: ["surface", "1000hpa"],
    defaultLevelId: "surface",
    defaultVisualizationId: "discrete_colors",
    defaultPaletteId: "radar",
    min: 0,
    max: 75,
    isFavorite: true
  },

  // Dynamics & Upper Level
  {
    id: "freezing_level",
    name: "Freezing Level (0°C Height)",
    shortName: "0°C Height",
    category: "Thermodynamic",
    unit: "m",
    description: "Geopotential altitude of the 0°C isotherm",
    iconName: "ThermometerSnowflake",
    supportedLevelIds: ["column"],
    defaultLevelId: "column",
    defaultVisualizationId: "contour_lines",
    defaultPaletteId: "thermal",
    min: 0,
    max: 6000
  },
  {
    id: "pwat",
    name: "PWAT (Precipitable Water)",
    shortName: "PWAT",
    category: "Moisture",
    unit: "mm",
    description: "Total integrated liquid water equivalent in vertical column",
    iconName: "Droplet",
    supportedLevelIds: ["column"],
    defaultLevelId: "column",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "precipitation",
    min: 0,
    max: 80
  },
  {
    id: "thickness_500_1000",
    name: "1000-500 hPa Thickness",
    shortName: "Thickness",
    category: "Synoptic",
    unit: "dam",
    description: "Geopotential thickness correlated with mean air column temp",
    iconName: "Layers",
    supportedLevelIds: ["column"],
    defaultLevelId: "column",
    defaultVisualizationId: "contour_lines",
    defaultPaletteId: "thermal",
    min: 492,
    max: 588
  },
  {
    id: "vorticity_500",
    name: "500 hPa Absolute Vorticity",
    shortName: "Vorticity 500",
    category: "Synoptic",
    unit: "10⁻⁵/s",
    description: "Mid-level spin & shortwave vorticity advection",
    iconName: "RefreshCw",
    supportedLevelIds: ["500hpa"],
    defaultLevelId: "500hpa",
    defaultVisualizationId: "filled_contours",
    defaultPaletteId: "severe",
    min: 0,
    max: 40
  },
  {
    id: "jet_stream_250",
    name: "Jet Stream Wind Vector (250 hPa)",
    shortName: "Jet Stream",
    category: "Upper Dynamics",
    unit: "m/s",
    description: "Upper tropospheric jet core velocity and direction",
    iconName: "Navigation",
    supportedLevelIds: ["250hpa", "300hpa", "200hpa"],
    defaultLevelId: "250hpa",
    defaultVisualizationId: "streamlines",
    defaultPaletteId: "wind",
    min: 20,
    max: 120,
    isFavorite: true
  },

  // Marine
  {
    id: "wave_height",
    name: "Significant Wave Height & Swell",
    shortName: "Wave Height",
    category: "Marine",
    unit: "m",
    description: "Mean height of highest one-third wave spectrum",
    iconName: "Waves",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "marine",
    min: 0,
    max: 18
  },
  {
    id: "ocean_current",
    name: "Ocean Surface Currents",
    shortName: "Ocean Currents",
    category: "Marine",
    unit: "m/s",
    description: "Surface geostrophic and wind-driven ocean current velocity",
    iconName: "Compass",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "animated_flow",
    defaultPaletteId: "marine",
    min: 0,
    max: 3
  },
  {
    id: "sst",
    name: "Sea Surface Temperature (SST)",
    shortName: "SST",
    category: "Marine",
    unit: "°C",
    description: "Oceanic upper boundary layer skin temperature",
    iconName: "Thermometer",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "smooth_gradient",
    defaultPaletteId: "thermal",
    min: -2,
    max: 35
  },
  {
    id: "sea_ice",
    name: "Sea Ice Concentration",
    shortName: "Sea Ice",
    category: "Marine",
    unit: "%",
    description: "Fractional coverage of ocean grid cell by ice pack",
    iconName: "Box",
    supportedLevelIds: ["surface"],
    defaultLevelId: "surface",
    defaultVisualizationId: "filled_contours",
    defaultPaletteId: "neutral",
    min: 0,
    max: 100
  },
  // MTG-LI Lightning variable
  {
    id: "mtg_li_lightning",
    name: "رعد و برق و صاعقه لحظه‌ای MTG-LI (فضاپایه)",
    shortName: "MTG-LI Lightning",
    category: "Thunderstorm & Convection",
    unit: "flashes/min",
    description: "تخلیه‌های الکتریکی ابر به زمین و درون ابر رصد شده با ۴ دوربین نوری ماهواره MTG-I1 متعلق به EUMETSAT با پوشش ۸۴٪ کره زمین در باند ۷۷۷.۴ نانومتر",
    iconName: "Zap",
    supportedLevelIds: ["column"],
    defaultLevelId: "column",
    defaultVisualizationId: "heatmap",
    defaultPaletteId: "spectral",
    min: 0,
    max: 100,
    isFavorite: true
  }
];

// ==========================================
// 5. VISUALIZATION METHODS (Independent of Data)
// ==========================================
export const VISUALIZATION_OPTIONS: VisualizationOption[] = [
  { id: "smooth_gradient", name: "Smooth Gradient", description: "Bilinear interpolated continuous color ramp", iconName: "Sliders", category: "raster" },
  { id: "discrete_colors", name: "Discrete Colors", description: "Banded color intervals with sharp legend thresholds", iconName: "Grid", category: "raster" },
  { id: "native_grid", name: "Native Grid Mesh", description: "Original NWP model grid cell polygon bounds", iconName: "Box", category: "grid" },
  { id: "pixel_grid", name: "Pixel Grid / Raw GRIB", description: "Unfiltered raw pixel array from source raster tile", iconName: "Square", category: "grid" },
  { id: "filled_contours", name: "Filled Contours", description: "Isopleth filled polygons with crisp stepped isolines", iconName: "Layers", category: "contour" },
  { id: "contour_lines", name: "Contour Lines (Isobars)", description: "Line isolines (isobars, isotherms) with numeric labels", iconName: "Activity", category: "contour" },
  { id: "heatmap", name: "Kernel Density Heatmap", description: "Gaussian smoothed intensity density map", iconName: "Flame", category: "raster" },
  { id: "wind_particles", name: "Wind Particle Animation", description: "GPU accelerated particle stream traces", iconName: "Wind", category: "particle" },
  { id: "wind_barbs", name: "Standard Wind Barbs", description: "Meteorological wind barbs (knots/m-s pennants & flags)", iconName: "Compass", category: "vector" },
  { id: "vector_arrows", name: "Vector Field Arrows", description: "Grid directional arrows proportional to magnitude", iconName: "Navigation", category: "vector" },
  { id: "streamlines", name: "Streamlines / Flow Traces", description: "Continuous fluid streamlines along vector field", iconName: "TrendingUp", category: "particle" },
  { id: "animated_flow", name: "Animated Fluid Flow", description: "Continuous flow animation with particle lifetime decay", iconName: "RefreshCw", category: "particle" },
  { id: "shaded_relief", name: "Shaded Relief / Hillshade", description: "3D topographical aspect and illuminated slope relief", iconName: "MapPin", category: "raster" }
];

// ==========================================
// 6. COLOR PALETTES
// ==========================================
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "thermal",
    name: "Standard Thermal (WMO)",
    description: "Classic violet to blue to green to yellow to deep red",
    colors: ["#3b0764", "#1d4ed8", "#0284c7", "#059669", "#eab308", "#dc2626", "#7f1d1d"],
    category: "thermal"
  },
  {
    id: "radar",
    name: "Doppler Radar Reflectivity (NWS)",
    description: "Standard 15-level NEXRAD dBZ color scale",
    colors: ["#00000000", "#04e9e7", "#019ff4", "#0300f4", "#02fd02", "#01c501", "#008e00", "#fdf802", "#e5bc00", "#fd9500", "#fd0000", "#d40000", "#bc0000", "#f800fd", "#9854c6", "#fdfdfd"],
    category: "radar"
  },
  {
    id: "satellite_ir",
    name: "Infrared Enhancement (BD Scale)",
    description: "Color enhanced top convective cloud tops",
    colors: ["#111827", "#374151", "#9ca3af", "#f97316", "#ef4444", "#ec4899", "#a855f7", "#3b82f6", "#06b6d4"],
    category: "satellite"
  },
  {
    id: "precipitation",
    name: "Hydro Precip Rate",
    description: "Transparent to cyan, navy blue, violet and magenta",
    colors: ["#00000000", "#38bdf8", "#0284c7", "#1d4ed8", "#6366f1", "#a855f7", "#ec4899"],
    category: "precipitation"
  },
  {
    id: "severe",
    name: "CAPE & Severe Convective",
    description: "High-contrast severe weather alert gradient",
    colors: ["#10b981", "#eab308", "#f97316", "#ef4444", "#be185d", "#881337"],
    category: "severe"
  },
  {
    id: "wind",
    name: "Kinematic Wind Speed",
    description: "Cyan velocity to gold, crimson and jet stream violet",
    colors: ["#06b6d4", "#3b82f6", "#10b981", "#eab308", "#f97316", "#dc2626", "#9333ea"],
    category: "wind"
  },
  {
    id: "marine",
    name: "Oceanic Deep Sea",
    description: "Deep oceanic navy to turquoise and teal",
    colors: ["#020617", "#0f172a", "#1e3a8a", "#0284c7", "#06b6d4", "#2dd4bf"],
    category: "marine"
  },
  {
    id: "neutral",
    name: "Monochromatic High-Contrast",
    description: "Greyscale contours for overlay readability",
    colors: ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#f8fafc"],
    category: "neutral"
  }
];

// ==========================================
// 7. DEFAULT INITIAL ACTIVE LAYERS STACK
// ==========================================
export const INITIAL_ACTIVE_LAYERS: ActiveLayer[] = [
  {
    instanceId: "layer_ecmwf_temp",
    categoryId: "models",
    sourceId: "ecmwf_ifs",
    sourceName: "ECMWF IFS (0.1°)",
    variableId: "temp_2m",
    variableName: "2m Temperature",
    variableUnit: "°C",
    levelId: "2m",
    levelName: "2 meters",
    visualizationId: "smooth_gradient",
    visualizationName: "Smooth Gradient",
    paletteId: "thermal",
    paletteColors: ["#3b0764", "#1d4ed8", "#0284c7", "#059669", "#eab308", "#dc2626", "#7f1d1d"],
    opacity: 85,
    visible: true,
    locked: false,
    zIndex: 1,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    invertPalette: false,
    blendMode: "normal",
    timelineSync: "main",
    customLabel: "ECMWF 2m Temp Field",
    minVal: -50,
    maxVal: 50,
    dateCreated: Date.now() - 10000
  },
  {
    instanceId: "layer_gfs_wind",
    categoryId: "models",
    sourceId: "gfs_025",
    sourceName: "NOAA GFS (0.25°)",
    variableId: "wind_10m",
    variableName: "10m Wind Particles",
    variableUnit: "m/s",
    levelId: "10m",
    levelName: "10 meters",
    visualizationId: "wind_particles",
    visualizationName: "Wind Particle Animation",
    paletteId: "wind",
    paletteColors: ["#06b6d4", "#3b82f6", "#10b981", "#eab308", "#f97316", "#dc2626", "#9333ea"],
    opacity: 90,
    visible: true,
    locked: false,
    zIndex: 2,
    brightness: 110,
    contrast: 100,
    saturation: 110,
    invertPalette: false,
    blendMode: "screen",
    timelineSync: "main",
    customLabel: "GFS Surface Streamlines",
    minVal: 0,
    maxVal: 60,
    dateCreated: Date.now() - 5000
  },
  {
    instanceId: "layer_radar_comp",
    categoryId: "radar",
    sourceId: "radar_composite",
    sourceName: "Global Doppler Radar",
    variableId: "reflectivity_sim",
    variableName: "Composite Reflectivity",
    variableUnit: "dBZ",
    levelId: "surface",
    levelName: "Surface",
    visualizationId: "discrete_colors",
    visualizationName: "Discrete dBZ Bands",
    paletteId: "radar",
    paletteColors: ["#00000000", "#04e9e7", "#019ff4", "#0300f4", "#02fd02", "#01c501", "#008e00", "#fdf802", "#e5bc00", "#fd9500", "#fd0000", "#d40000", "#bc0000", "#f800fd", "#9854c6", "#fdfdfd"],
    opacity: 100,
    visible: true,
    locked: false,
    zIndex: 3,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    invertPalette: false,
    blendMode: "normal",
    timelineSync: "main",
    customLabel: "Doppler Composite Mesh",
    minVal: 0,
    maxVal: 75,
    dateCreated: Date.now()
  }
];

// ==========================================
// 8. PRESET WORKSTATION VIEWS
// ==========================================
export const PRESET_WORKSTATIONS: PresetWorkstation[] = [
  {
    id: "severe_convective",
    name: "Severe Thunderstorm & Tornado Diagnostic",
    description: "Overlay GFS 3km HRRR Reflectivity + CAPE + 0-3km Helicity + Surface Wind Barbs",
    category: "Severe Weather",
    iconName: "Zap",
    layers: [
      { sourceId: "hrrr_3km", variableId: "cape", levelId: "surface", visualizationId: "filled_contours", opacity: 70 },
      { sourceId: "radar_composite", variableId: "reflectivity_sim", levelId: "surface", visualizationId: "discrete_colors", opacity: 95 },
      { sourceId: "gfs_025", variableId: "wind_10m", levelId: "10m", visualizationId: "wind_particles", opacity: 80 }
    ]
  },
  {
    id: "aviation_jetstream",
    name: "Aviation Route Jet Stream & Turbulence",
    description: "250 hPa Jet Core velocity + 500 hPa Geopotential Isobars + Clear Air Turbulence",
    category: "Aviation Operations",
    iconName: "Plane",
    layers: [
      { sourceId: "ecmwf_ifs", variableId: "jet_stream_250", levelId: "250hpa", visualizationId: "streamlines", opacity: 90 },
      { sourceId: "ecmwf_ifs", variableId: "thickness_500_1000", levelId: "500hpa", visualizationId: "contour_lines", opacity: 80 }
    ]
  },
  {
    id: "marine_cyclone",
    name: "Marine Swell & Oceanic Gale Analysis",
    description: "Significant wave height + Surface ocean currents + MSLP Isobars",
    category: "Marine & Off-Shore",
    iconName: "Waves",
    layers: [
      { sourceId: "ocean_wavewatch", variableId: "wave_height", levelId: "surface", visualizationId: "smooth_gradient", opacity: 85 },
      { sourceId: "ocean_wavewatch", variableId: "ocean_current", levelId: "surface", visualizationId: "animated_flow", opacity: 75 },
      { sourceId: "ecmwf_ifs", variableId: "mslp", levelId: "surface", visualizationId: "contour_lines", opacity: 90 }
    ]
  }
];
