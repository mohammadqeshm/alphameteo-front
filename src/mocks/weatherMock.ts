import { Coordinate, WeatherForecast } from "../types";

export interface MockWeatherResult {
  location: Coordinate;
  forecast: WeatherForecast;
  isMockData: true;
  dataSource: "ALPHA_SYNTHETIC_GFS_025_GENERATOR";
}

/**
 * Deterministic pseudo-random seed generator based on latitude and longitude coordinates.
 * Generates continuous, realistic meteorological fields across the globe without discontinuities.
 */
export function generateClientMockWeather(
  lat: number,
  lon: number,
  timeOffset: number = 0
): MockWeatherResult {
  const seed = Math.sin(lat) * Math.cos(lon);
  const hash = (val: number) => {
    const x = Math.sin(seed + val) * 10000;
    return x - Math.floor(x);
  };

  // 1. Temperature (°C) - latitude-dependent base + diurnal sinusoidal curve + local noise
  const baseTemp = 32 - Math.abs(lat) * 0.6; // ~32°C at equator down to -22°C at poles
  const tempDiurnal = Math.sin((timeOffset / 24) * 2 * Math.PI - Math.PI / 2) * 6;
  const localSeed = hash(1);
  const finalTemp = Math.round((baseTemp + tempDiurnal + (localSeed * 10 - 5)) * 10) / 10;

  // 2. Wind Speed (m/s) & Direction (deg)
  const baseWind = 3 + Math.abs(Math.sin(lat * (Math.PI / 45))) * 12;
  const finalWind = Math.round((baseWind + hash(2) * 8) * 10) / 10;
  const windDirection = Math.round(hash(3) * 360);

  // 3. Pressure (hPa)
  const basePressure = 1013.25 + (Math.sin(lat * 0.1) * 15);
  const finalPressure = Math.round((basePressure + (hash(4) * 10 - 5)) * 10) / 10;

  // 4. Precipitation (mm/h)
  const basePrecip = Math.abs(lat) < 10 ? 4.5 : (Math.abs(lat) > 20 && Math.abs(lat) < 35 ? 0.1 : 1.2);
  const finalPrecip = Math.round((basePrecip * hash(5) * 5) * 10) / 10;

  // 5. Cloud Cover (%)
  const cloudCover = Math.round(hash(6) * 100);

  // 6. Relative Humidity (%)
  const baseHumidity = 50 + (Math.sin(lat * 0.2) * 20);
  const finalHumidity = Math.min(100, Math.max(10, Math.round(baseHumidity + (hash(7) * 30 - 15))));

  // 7. Wave Height (m)
  const waveHeight = Math.round((0.5 + (finalWind * 0.15) + hash(8) * 2) * 10) / 10;

  // 8. Elevation Estimate (m)
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
    },
    isMockData: true,
    dataSource: "ALPHA_SYNTHETIC_GFS_025_GENERATOR"
  };
}

export interface FormatForecastDateOptions {
  includeYear?: boolean;
  onlyDate?: boolean;
  isShort?: boolean;
}

export function formatForecastDate(
  hourOffset: number,
  options: FormatForecastDateOptions = {}
): string {
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
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${dateStr} ${hours}:${minutes} (+${hourOffset}h)`;
}
