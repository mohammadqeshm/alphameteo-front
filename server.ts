import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Google Gen AI client safely
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (aiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export interface AgentAction {
  name: string;
  args: Record<string, any>;
  summary: string;
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
      required: ["locationName"]
    }
  },
  {
    name: "changeActiveLayer",
    description: "Switch the active meteorological field layer displayed across the interactive map canvases.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        layerId: {
          type: Type.STRING,
          description: "Layer identifier to activate: 'temperature' (2m Temp), 'wind' (10m Wind & Streamlines), 'pressure' (MSLP Isobars), 'precipitation' (Precip Accumulation), 'clouds' (Cloud Cover), 'humidity' (Relative Humidity), 'waves' (Ocean Waves), 'none' (Base Dark Map)."
        }
      },
      required: ["layerId"]
    }
  },
  {
    name: "setTimeStep",
    description: "Change the forecast timeline forecast step / simulation hour (0 to 120 hours).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        hour: {
          type: Type.NUMBER,
          description: "Forecast hour offset in hours from now (e.g. 0 for current, 24 for tomorrow, 72 for +3 days)."
        }
      },
      required: ["hour"]
    }
  },
  {
    name: "configureSplitLayout",
    description: "Configure multi-model or multi-parameter comparison view by splitting map viewport into multiple synchronized panels.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        layout: {
          type: Type.STRING,
          description: "Split layout style: 'single' (1 view), 'split-h' (2 horizontal panels), 'split-v' (2 vertical panels), 'quad' (4-way synchronized matrix)."
        }
      },
      required: ["layout"]
    }
  }
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
}

export interface ChatAgentRequest {
  messages: ChatMessage[];
  currentCoords?: {
    lat: number;
    lon: number;
    elevation: number;
  };
  activeState?: {
    activeLayerId?: string;
    activeLayersCount?: number;
    timelineHour?: number;
    locationName?: string;
    splitLayout?: string;
    activePanel?: string;
  };
}

export interface ChatAgentResponse {
  text: string;
  actions?: AgentAction[];
  groundingSources?: Array<{ title: string; url: string }>;
}

async function executeAgentChat(
  ai: GoogleGenAI,
  req: ChatAgentRequest
): Promise<ChatAgentResponse> {
  const contents = req.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text || "" }],
  }));

  const systemInstruction = `You are Alpha Meteo's Senior Atmospheric Research Scientist and Interactive Cockpit Copilot.
You have two core capabilities:
1. SCIENTIFIC METEOROLOGY & LIVE WEATHER: Provide authoritative, concise, deeply scientific meteorological explanations, weather updates, forecasts, and synoptic chart interpretations using Google Search Grounding when helpful.
2. INTERACTIVE UI CONTROL: You can execute actions on behalf of the user in the workstation UI:
- navigateToLocation: Zoom/pan the map to any city, mountain, region, ocean.
- changeActiveLayer: Switch weather layers ('temperature', 'wind', 'pressure', 'precipitation', 'clouds', 'humidity', 'waves', 'none').
- setTimeStep: Advance or rewind simulation hours (+0h to +120h).
- configureSplitLayout: Switch between 'single', 'split-h', 'split-v', 'quad' comparison views.

Context:
- Current Map Focus: ${req.activeState?.locationName || "Selected Coordinates"} (Lat: ${req.currentCoords?.lat ?? 35.689}, Lon: ${req.currentCoords?.lon ?? 51.389}, Elevation: ${req.currentCoords?.elevation ?? 1200}m)
- Active Layer: ${req.activeState?.activeLayerId || "temperature"}
- Timeline Step: +${req.activeState?.timelineHour || 0}h
- Viewport Layout: ${req.activeState?.splitLayout || "single"}

Language: Match user language (Persian / English). Be professional, precise, and supportive.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents as any,
      config: {
        systemInstruction,
        tools: [
          { googleSearch: {} },
          { functionDeclarations: agentToolDeclarations }
        ],
      }
    });

    const candidate = response.candidates?.[0];
    const functionCalls = response.functionCalls;
    const actions: AgentAction[] = [];

    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        let summary = `Execute ${call.name}`;
        if (call.name === "navigateToLocation") {
          summary = `Navigating to ${call.args?.locationName || "location"}`;
        } else if (call.name === "changeActiveLayer") {
          summary = `Switched map layer to ${call.args?.layerId}`;
        } else if (call.name === "setTimeStep") {
          summary = `Set forecast step to +${call.args?.hour}h`;
        } else if (call.name === "configureSplitLayout") {
          summary = `Set split screen layout to ${call.args?.layout}`;
        }

        actions.push({
          name: call.name,
          args: call.args as Record<string, any>,
          summary,
        });
      }
    }

    const groundingSources: Array<{ title: string; url: string }> = [];
    const searchChunks = candidate?.groundingMetadata?.groundingChunks;
    if (searchChunks && Array.isArray(searchChunks)) {
      searchChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingSources.push({
            title: chunk.web.title,
            url: chunk.web.uri,
          });
        }
      });
    }

    let responseText = response.text || "";
    if (!responseText && actions.length > 0) {
      responseText = `Completed actions: ${actions.map(a => a.summary).join(", ")}.`;
    }

    return {
      text: responseText || "Weather analysis ready.",
      actions,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
    };
  } catch (error: any) {
    console.error("Agent execution error:", error?.message || error);
    throw error;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API 2: Get meteorological values for a given coordinate
  // This simulates GFS 0.25 degree precision meteorological output based on coordinates, elevation, and selected valid date.
  app.post("/api/weather/point", (req, res) => {
    const { lat, lon, timeOffset = 0, date = "25 May 2025" } = req.body;
    
    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Latitude and Longitude are required." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Seeded random based on latitude and longitude to keep values consistent for a location
    const seed = Math.sin(latitude) * Math.cos(longitude);
    const hash = (val: number) => {
      const x = Math.sin(seed + val) * 10000;
      return x - Math.floor(x);
    };

    // Calculate realistic weather parameters based on latitude (e.g. colder at poles, warmer at equator)
    // Colder at high latitudes, warmer near equator (0 lat)
    const baseTemp = 32 - Math.abs(latitude) * 0.6; // average equator 32C, poles -22C
    const tempDiurnal = Math.sin((timeOffset / 24) * 2 * Math.PI - Math.PI / 2) * 6; // diurnal cycle
    const localSeed = hash(1);
    const finalTemp = Math.round((baseTemp + tempDiurnal + (localSeed * 10 - 5)) * 10) / 10;

    // Wind speed: high at mid-latitudes, low at horse latitudes
    const baseWind = 3 + Math.abs(Math.sin(latitude * (Math.PI / 45))) * 12;
    const finalWind = Math.round((baseWind + hash(2) * 8) * 10) / 10;
    const windDirection = Math.round(hash(3) * 360);

    // Pressure: around 1013 hPa
    const basePressure = 1013.25 + (Math.sin(latitude * 0.1) * 15);
    const finalPressure = Math.round((basePressure + (hash(4) * 10 - 5)) * 10) / 10;

    // Precipitation: high in tropics, low in subtropical highs
    const basePrecip = Math.abs(latitude) < 10 ? 4.5 : (Math.abs(latitude) > 20 && Math.abs(latitude) < 35 ? 0.1 : 1.2);
    const finalPrecip = Math.round((basePrecip * hash(5) * 5) * 10) / 10;

    // Clouds
    const cloudCover = Math.round(hash(6) * 100);

    // Humidity
    const baseHumidity = 50 + (Math.sin(latitude * 0.2) * 20);
    const finalHumidity = Math.min(100, Math.max(10, Math.round(baseHumidity + (hash(7) * 30 - 15))));

    // Wave heights (significant height) - higher near oceans/high winds
    const waveHeight = Math.round((0.5 + (finalWind * 0.15) + hash(8) * 2) * 10) / 10;

    // Elevation estimate based on coordinate roughness
    const elevation = Math.round(Math.abs(Math.sin(latitude * 2) * Math.cos(longitude * 3)) * 2400 + Math.abs(hash(9)) * 120);

    return res.json({
      location: {
        lat: latitude,
        lon: longitude,
        elevation,
      },
      date,
      forecast: {
        temperature: finalTemp,       // in Celsius
        windSpeed: finalWind,         // in m/s
        windDirection,                // in degrees
        pressure: finalPressure,      // in hPa
        precipitation: finalPrecip,   // in mm
        clouds: cloudCover,           // in %
        humidity: finalHumidity,       // in %
        waves: waveHeight,            // in meters
      }
    });
  });

  // API 2.5: Worldwide Open-Ended Geocoding Lookup via OpenStreetMap Nominatim
  app.get("/api/geocode", async (req, res) => {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    try {
      const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`;
      const geoRes = await fetch(targetUrl, {
        headers: {
          "User-Agent": "AlphaMeteo-Geocoding-Agent/1.0"
        }
      });
      
      if (!geoRes.ok) throw new Error("Geocoding service unavailable");
      const data = await geoRes.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return res.json({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          importance: item.importance,
        });
      }

      return res.status(404).json({ error: "Location not found" });
    } catch (err: any) {
      console.warn("Geocoding lookup error:", err?.message || err);
      return res.status(500).json({ error: "Geocoding error" });
    }
  });

  // API 3: AI Meteorological Analysis
  // Takes the coordinate weather data and provides a short professional scientific report
  app.post("/api/weather/analyze", async (req, res) => {
    const { weatherData } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({ error: "weatherData is required." });
    }

    if (!aiClient) {
      return res.json({
        analysis: "AI Analysis is unavailable because the GEMINI_API_KEY environment variable is not set. Please add your key in Settings > Secrets to enable this feature."
      });
    }

    try {
      const prompt = `You are an expert research meteorologist interpreting output from the GFS 0.25° Global Forecast System.
Analyze the following meteorological readings at coordinates (${weatherData.location.lat}°N, ${weatherData.location.lon}°E), Elevation: ${weatherData.location.elevation}m:

Date/Run Context: ${weatherData.date}
- Temperature (2m above ground): ${weatherData.forecast.temperature} °C
- Wind Speed (10m above ground): ${weatherData.forecast.windSpeed} m/s at ${weatherData.forecast.windDirection}° heading
- Mean Sea Level Pressure: ${weatherData.forecast.pressure} hPa
- Total Cloud Cover: ${weatherData.forecast.clouds}%
- Relative Humidity (2m above ground): ${weatherData.forecast.humidity}%
- Precipitation (Total accumulation): ${weatherData.forecast.precipitation} mm
- Significant Wave Height: ${weatherData.forecast.waves} m

Provide a concise, highly professional meteorological summary (maximum 3 short paragraphs).
Use advanced scientific terminology (e.g., baroclinic, thermal gradient, pressure systems, orographic effects if high elevation, moisture convergence). Keep the tone clinical, objective, and deeply scientific.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert meteorological analysis bot. Respond using highly rigorous, scientific, and precise English weather-forecasting terminology."
        }
      });

      return res.json({
        analysis: response.text || "Failed to generate meteorological report."
      });
    } catch (error: any) {
      console.error("Gemini API Error in /api/weather/analyze:", error?.message || error);
      return res.json({
        fallback: true,
        analysis: "GEMINI_API_KEY_QUOTA_EXHAUSTED"
      });
    }
  });

  // API 4: Dual-mode AI Meteorologist & Interactive UI Agent
  // Can search web for meteorological queries and execute real UI tools (flyTo, setLayer, configureModel, etc.)
  app.post("/api/chat", async (req, res) => {
    const { messages, currentCoords, activeState } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "An array of messages is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY || aiApiKey;
    if (!apiKey) {
      return res.json({
        response: "AI Weather Assistant is offline. Please configure your GEMINI_API_KEY under the Settings > Secrets tab to activate real-time intelligence!"
      });
    }

    try {
      const client = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const agentResult = await executeAgentChat(client, {
        messages,
        currentCoords,
        activeState,
      });

      return res.json({
        response: agentResult.text,
        actions: agentResult.actions,
        groundingSources: agentResult.groundingSources,
      });
    } catch (error: any) {
      console.error("Gemini Agent Error in /api/chat:", error?.message || error);
      // Return 200 with quota notice and fallback trigger instead of 500 fatal crash
      return res.json({
        fallback: true,
        error: error?.message || "Rate limit or service error",
        response: "GEMINI_API_KEY_QUOTA_EXHAUSTED"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
