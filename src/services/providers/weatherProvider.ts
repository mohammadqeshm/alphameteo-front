import { Coordinate, WeatherForecast } from "../../types";
import { generateClientMockWeather, generateMockAnalysis, generateMockChatResponse } from "../../mocks";
import { apiClient } from "../api/apiClient";

export interface WeatherPointPayload {
  location: Coordinate;
  forecast: WeatherForecast;
  date?: string;
  isMockData?: boolean;
  dataSource?: string;
}

export interface WeatherAnalysisResponse {
  analysis: string;
  isFallback?: boolean;
  source?: string;
}

export interface ChatAgentAction {
  name: string;
  args: Record<string, any>;
  summary: string;
}

export interface ChatAgentResponsePayload {
  response: string;
  actions?: ChatAgentAction[];
  groundingSources?: Array<{ title: string; url: string }>;
  fallback?: boolean;
}

export interface IWeatherDataProvider {
  getPointForecast(lat: number, lon: number, timeOffset?: number, date?: string): Promise<WeatherPointPayload>;
}

export interface IWeatherAnalysisProvider {
  analyzeWeather(weatherData: { location: Coordinate; forecast: WeatherForecast; date: string }): Promise<WeatherAnalysisResponse>;
}

export interface IAiChatProvider {
  sendMessage(params: {
    messages: Array<{ id: string; role: "user" | "assistant"; text: string }>;
    currentCoords?: Coordinate;
    activeState?: Record<string, any>;
  }): Promise<ChatAgentResponsePayload>;
}

/**
 * Production-ready weather data provider that calls Node backend proxy routes
 * with automatic, seamless fallback to deterministic client-side mock algorithms.
 */
export class WeatherDataProvider implements IWeatherDataProvider, IWeatherAnalysisProvider, IAiChatProvider {
  public async getPointForecast(
    lat: number,
    lon: number,
    timeOffset: number = 0,
    date?: string
  ): Promise<WeatherPointPayload> {
    try {
      const data = await apiClient<WeatherPointPayload>("/api/weather/point", {
        method: "POST",
        body: JSON.stringify({ lat, lon, timeOffset, date }),
        timeoutMs: 6000,
      });
      return {
        ...data,
        isMockData: false,
        dataSource: "GFS_025_SURFACE_INTERPOLATION",
      };
    } catch (err) {
      // Deterministic client-side fallback
      return generateClientMockWeather(lat, lon, timeOffset);
    }
  }

  public async analyzeWeather(weatherData: {
    location: Coordinate;
    forecast: WeatherForecast;
    date: string;
  }): Promise<WeatherAnalysisResponse> {
    try {
      const data = await apiClient<{ analysis: string; fallback?: boolean }>("/api/weather/analyze", {
        method: "POST",
        body: JSON.stringify({ weatherData }),
        timeoutMs: 12000,
      });

      if (!data.fallback && data.analysis && data.analysis !== "GEMINI_API_KEY_QUOTA_EXHAUSTED") {
        return {
          analysis: data.analysis,
          isFallback: false,
          source: "GEMINI_37_FLASH_SYNOPTIC",
        };
      }
    } catch {
      // Fall through to deterministic mock
    }

    return {
      analysis: generateMockAnalysis(weatherData.location, weatherData.forecast),
      isFallback: true,
      source: "ALPHA_METEO_DETERMINISTIC_EXPERT_SYSTEM",
    };
  }

  public async sendMessage(params: {
    messages: Array<{ id: string; role: "user" | "assistant"; text: string }>;
    currentCoords?: Coordinate;
    activeState?: Record<string, any>;
  }): Promise<ChatAgentResponsePayload> {
    try {
      const data = await apiClient<ChatAgentResponsePayload>("/api/chat", {
        method: "POST",
        body: JSON.stringify(params),
        timeoutMs: 15000,
      });

      if (!data.fallback && data.response !== "GEMINI_API_KEY_QUOTA_EXHAUSTED") {
        return data;
      }
    } catch {
      // Fall through to fallback
    }

    const lastMsg = params.messages[params.messages.length - 1]?.text || "";
    const coords = params.currentCoords || { lat: 35.6892, lon: 51.389, elevation: 1137 };
    return {
      response: generateMockChatResponse(lastMsg, coords, null),
      fallback: true,
    };
  }
}

export const weatherService = new WeatherDataProvider();
