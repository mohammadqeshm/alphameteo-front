import { ClimateIndexId } from "../types/canvas";

export interface ClimateIndexMetadata {
  id: ClimateIndexId;
  name: string;
  fullName: string;
  agency: string;
  currentValue: number;
  anomaly: number;
  unit: string;
  status: string;
  phase?: string;
  description: string;
  history: Array<{ date: string; value: number; anomaly: number }>;
  mjoPhaseData?: {
    rmm1: number;
    rmm2: number;
    amplitude: number;
    phase: number;
    trajectory: Array<{ rmm1: number; rmm2: number; date: string; phase: number }>;
  };
}

export const CLIMATE_INDICES_DATABASE: Record<ClimateIndexId, ClimateIndexMetadata> = {
  nino34: {
    id: "nino34",
    name: "Niño 3.4",
    fullName: "East-Central Tropical Pacific SST Anomaly",
    agency: "NOAA CPC / OISST v2.1",
    currentValue: 26.8,
    anomaly: -0.65,
    unit: "°C",
    status: "La Niña Watch / Weak Neutral",
    description: "Primary operational index for ENSO phase determination (5°N-5°S, 170°W-120°W). Sustained anomalies below -0.5°C indicate La Niña conditions.",
    history: [
      { date: "May 2024", value: 28.2, anomaly: +0.45 },
      { date: "Jun 2024", value: 27.9, anomaly: +0.12 },
      { date: "Jul 2024", value: 27.4, anomaly: -0.21 },
      { date: "Aug 2024", value: 27.1, anomaly: -0.38 },
      { date: "Sep 2024", value: 26.9, anomaly: -0.52 },
      { date: "Oct 2024", value: 26.7, anomaly: -0.68 },
      { date: "Nov 2024", value: 26.6, anomaly: -0.74 },
      { date: "Dec 2024", value: 26.5, anomaly: -0.79 },
      { date: "Jan 2025", value: 26.6, anomaly: -0.71 },
      { date: "Feb 2025", value: 26.7, anomaly: -0.62 },
      { date: "Mar 2025", value: 26.8, anomaly: -0.58 },
      { date: "Latest", value: 26.8, anomaly: -0.65 },
    ]
  },
  iod: {
    id: "iod",
    name: "IOD (DMI)",
    fullName: "Indian Ocean Dipole - Dipole Mode Index",
    agency: "BOM Australia / ECMWF",
    currentValue: 0.38,
    anomaly: +0.38,
    unit: "°C",
    status: "Neutral Trending Positive",
    description: "Difference in SST anomaly between western equatorial Indian Ocean (50°E-70°E, 10°S-10°N) and south-eastern equatorial Indian Ocean (90°E-110°E, 10°S-0°). Positive IOD strongly modulates moisture advection into the Middle East, Persian Gulf, and southern Iran.",
    history: [
      { date: "Jun 2024", value: 0.12, anomaly: +0.12 },
      { date: "Jul 2024", value: 0.05, anomaly: +0.05 },
      { date: "Aug 2024", value: -0.18, anomaly: -0.18 },
      { date: "Sep 2024", value: -0.42, anomaly: -0.42 },
      { date: "Oct 2024", value: -0.28, anomaly: -0.28 },
      { date: "Nov 2024", value: -0.05, anomaly: -0.05 },
      { date: "Dec 2024", value: +0.14, anomaly: +0.14 },
      { date: "Jan 2025", value: +0.22, anomaly: +0.22 },
      { date: "Feb 2025", value: +0.31, anomaly: +0.31 },
      { date: "Latest", value: +0.38, anomaly: +0.38 },
    ]
  },
  mjo: {
    id: "mjo",
    name: "MJO (RMM)",
    fullName: "Madden-Julian Oscillation Wheeler-Hendon Index",
    agency: "BOM / NOAA Climate Prediction Center",
    currentValue: 1.62,
    anomaly: 1.62,
    unit: "Amp",
    status: "Active (Phase 2 - Equatorial Indian Ocean)",
    phase: "Phase 2",
    description: "Real-time Multivariate MJO index (RMM1, RMM2). Active phase 2/3 enhances deep tropical convection over the Indian Ocean, fueling sub-tropical jet moisture plumes into Hormozgan and the Oman Sea.",
    history: [
      { date: "-14d", value: 0.72, anomaly: 0.72 },
      { date: "-12d", value: 0.88, anomaly: 0.88 },
      { date: "-10d", value: 1.05, anomaly: 1.05 },
      { date: "-8d", value: 1.28, anomaly: 1.28 },
      { date: "-6d", value: 1.45, anomaly: 1.45 },
      { date: "-4d", value: 1.58, anomaly: 1.58 },
      { date: "-2d", value: 1.60, anomaly: 1.60 },
      { date: "Today", value: 1.62, anomaly: 1.62 },
    ],
    mjoPhaseData: {
      rmm1: -1.24,
      rmm2: 1.04,
      amplitude: 1.62,
      phase: 2,
      trajectory: [
        { date: "D-14", rmm1: 0.45, rmm2: -0.85, phase: 8 },
        { date: "D-12", rmm1: -0.12, rmm2: -0.65, phase: 1 },
        { date: "D-10", rmm1: -0.55, rmm2: -0.15, phase: 1 },
        { date: "D-08", rmm1: -0.88, rmm2: 0.32, phase: 2 },
        { date: "D-06", rmm1: -1.05, rmm2: 0.68, phase: 2 },
        { date: "D-04", rmm1: -1.18, rmm2: 0.88, phase: 2 },
        { date: "D-02", rmm1: -1.22, rmm2: 0.98, phase: 2 },
        { date: "Latest", rmm1: -1.24, rmm2: 1.04, phase: 2 },
      ]
    }
  },
  nao: {
    id: "nao",
    name: "NAO",
    fullName: "North Atlantic Oscillation Index",
    agency: "NOAA CPC",
    currentValue: 0.84,
    anomaly: +0.84,
    unit: "σ",
    status: "Positive Phase (+NAO)",
    description: "Normalized 500 hPa geopotential height anomaly difference between the Azores High and Icelandic Low. Positive phase steers active North Atlantic storm tracks eastward into the Mediterranean and Middle East troughing sectors.",
    history: [
      { date: "Aug 2024", value: -0.42, anomaly: -0.42 },
      { date: "Sep 2024", value: -0.18, anomaly: -0.18 },
      { date: "Oct 2024", value: +0.35, anomaly: +0.35 },
      { date: "Nov 2024", value: +0.62, anomaly: +0.62 },
      { date: "Dec 2024", value: +0.95, anomaly: +0.95 },
      { date: "Jan 2025", value: +0.78, anomaly: +0.78 },
      { date: "Latest", value: +0.84, anomaly: +0.84 },
    ]
  },
  ao: {
    id: "ao",
    name: "AO",
    fullName: "Arctic Oscillation Index",
    agency: "NOAA CPC",
    currentValue: 1.15,
    anomaly: +1.15,
    unit: "σ",
    status: "Positive Phase (+AO)",
    description: "First EOF of northern hemisphere 1000 hPa geopotential height anomalies. High positive values indicate a tight polar vortex and jet confinement to high latitudes.",
    history: [
      { date: "Oct 2024", value: -0.32, anomaly: -0.32 },
      { date: "Nov 2024", value: +0.12, anomaly: +0.12 },
      { date: "Dec 2024", value: +0.84, anomaly: +0.84 },
      { date: "Jan 2025", value: +1.42, anomaly: +1.42 },
      { date: "Latest", value: +1.15, anomaly: +1.15 },
    ]
  },
  soi: {
    id: "soi",
    name: "SOI",
    fullName: "Southern Oscillation Index",
    agency: "BOM Australia",
    currentValue: 6.8,
    anomaly: +6.8,
    unit: "index",
    status: "Neutral / Positive Tendency",
    description: "Standardized pressure difference between Tahiti and Darwin. Sustained values above +7 indicate La Niña tendency.",
    history: [
      { date: "Aug 2024", value: -1.2, anomaly: -1.2 },
      { date: "Sep 2024", value: +2.1, anomaly: +2.1 },
      { date: "Oct 2024", value: +4.8, anomaly: +4.8 },
      { date: "Nov 2024", value: +5.5, anomaly: +5.5 },
      { date: "Dec 2024", value: +7.2, anomaly: +7.2 },
      { date: "Latest", value: +6.8, anomaly: +6.8 },
    ]
  },
  oni: {
    id: "oni",
    name: "ONI",
    fullName: "Oceanic Niño Index (3-Month Running Mean)",
    agency: "NOAA CPC",
    currentValue: -0.52,
    anomaly: -0.52,
    unit: "°C",
    status: "Weak La Niña Threshold Met",
    description: "3-month running mean of ERSST.v5 SST anomalies in the Niño 3.4 region. Official NOAA metric for categorizing El Niño / La Niña episodes.",
    history: [
      { date: "AMJ 2024", value: +0.48, anomaly: +0.48 },
      { date: "MJJ 2024", value: +0.18, anomaly: +0.18 },
      { date: "JJA 2024", value: -0.15, anomaly: -0.15 },
      { date: "JAS 2024", value: -0.37, anomaly: -0.37 },
      { date: "ASO 2024", value: -0.52, anomaly: -0.52 },
      { date: "SON 2024", value: -0.65, anomaly: -0.65 },
      { date: "OND 2024", value: -0.74, anomaly: -0.74 },
      { date: "DJF 2025", value: -0.68, anomaly: -0.68 },
      { date: "Latest", value: -0.52, anomaly: -0.52 },
    ]
  },
  nino12: {
    id: "nino12",
    name: "Niño 1+2",
    fullName: "Coastal South American Tropical Pacific SST",
    agency: "NOAA CPC",
    currentValue: 23.4,
    anomaly: -0.88,
    unit: "°C",
    status: "Cool Anomaly",
    description: "Covers coastal Ecuador & Peru (0-10°S, 90°W-80°W). Sensitive to coastal upwelling and Kelvin wave arrival.",
    history: [
      { date: "Sep 2024", value: 22.1, anomaly: -1.20 },
      { date: "Oct 2024", value: 22.6, anomaly: -1.05 },
      { date: "Nov 2024", value: 23.0, anomaly: -0.92 },
      { date: "Dec 2024", value: 23.3, anomaly: -0.85 },
      { date: "Latest", value: 23.4, anomaly: -0.88 },
    ]
  },
  nino3: {
    id: "nino3",
    name: "Niño 3",
    fullName: "Eastern Tropical Pacific SST",
    agency: "NOAA CPC",
    currentValue: 25.1,
    anomaly: -0.72,
    unit: "°C",
    status: "Cool Anomaly",
    description: "Region 5°N-5°S, 150°W-90°W in the eastern equatorial Pacific.",
    history: [
      { date: "Oct 2024", value: 24.8, anomaly: -0.85 },
      { date: "Nov 2024", value: 25.0, anomaly: -0.78 },
      { date: "Dec 2024", value: 25.2, anomaly: -0.70 },
      { date: "Latest", value: 25.1, anomaly: -0.72 },
    ]
  },
  nino4: {
    id: "nino4",
    name: "Niño 4",
    fullName: "Western-Central Tropical Pacific SST",
    agency: "NOAA CPC",
    currentValue: 28.5,
    anomaly: -0.32,
    unit: "°C",
    status: "Near Neutral",
    description: "Region 5°N-5°S, 160°E-150°W. Important for Modoki El Niño diagnostics.",
    history: [
      { date: "Oct 2024", value: 28.6, anomaly: -0.22 },
      { date: "Nov 2024", value: 28.5, anomaly: -0.28 },
      { date: "Dec 2024", value: 28.4, anomaly: -0.35 },
      { date: "Latest", value: 28.5, anomaly: -0.32 },
    ]
  },
  pna: {
    id: "pna",
    name: "PNA",
    fullName: "Pacific-North American Pattern",
    agency: "NOAA CPC",
    currentValue: -0.45,
    anomaly: -0.45,
    unit: "σ",
    status: "Negative Phase",
    description: "Dominant mode of low-frequency variability in the Northern Hemisphere extratropics.",
    history: [
      { date: "Oct 2024", value: +0.22, anomaly: +0.22 },
      { date: "Nov 2024", value: -0.15, anomaly: -0.15 },
      { date: "Dec 2024", value: -0.62, anomaly: -0.62 },
      { date: "Latest", value: -0.45, anomaly: -0.45 },
    ]
  },
  pdo: {
    id: "pdo",
    name: "PDO",
    fullName: "Pacific Decadal Oscillation",
    agency: "NOAA NCEI",
    currentValue: -1.48,
    anomaly: -1.48,
    unit: "index",
    status: "Strong Negative Phase",
    description: "Leading EOF of monthly SST anomalies over the North Pacific poleward of 20°N.",
    history: [
      { date: "Aug 2024", value: -1.72, anomaly: -1.72 },
      { date: "Oct 2024", value: -1.55, anomaly: -1.55 },
      { date: "Dec 2024", value: -1.42, anomaly: -1.42 },
      { date: "Latest", value: -1.48, anomaly: -1.48 },
    ]
  },
  amo: {
    id: "amo",
    name: "AMO",
    fullName: "Atlantic Multidecadal Oscillation",
    agency: "NOAA PSL",
    currentValue: +0.31,
    anomaly: +0.31,
    unit: "°C",
    status: "Warm Phase",
    description: "Detrended basin-wide average of North Atlantic SST anomalies (0-80°N).",
    history: [
      { date: "Jun 2024", value: +0.42, anomaly: +0.42 },
      { date: "Sep 2024", value: +0.36, anomaly: +0.36 },
      { date: "Dec 2024", value: +0.29, anomaly: +0.29 },
      { date: "Latest", value: +0.31, anomaly: +0.31 },
    ]
  }
};

export function getClimateIndexData(indexId: ClimateIndexId): ClimateIndexMetadata {
  return CLIMATE_INDICES_DATABASE[indexId] || CLIMATE_INDICES_DATABASE.nino34;
}
