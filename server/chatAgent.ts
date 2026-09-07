import { GoogleGenAI } from "@google/genai";
import { AgentAction, agentToolDeclarations } from "./agentTools.js";

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

export async function processAgentChat(
  ai: GoogleGenAI,
  req: ChatAgentRequest
): Promise<ChatAgentResponse> {
  const contents = req.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text || "" }],
  }));

  const systemInstruction = `You are "Alpha Meteo AI Agent" — an autonomous direct copilot and meteorological intelligence system for the Alpha Meteo professional workstation, powered directly by Google Gemini models.

YOUR CORE RESPONSIBILITIES:
1. REASON AND ANSWER DYNAMICALLY & SCIENTIFICALLY:
   - Answer all user questions thoroughly, scientifically, and in the user's language (Persian/Farsi or English).
   - If asked about climate records (such as driest inhabited place on Earth = Arica, Chile / Atacama Desert; or McMurdo Dry Valleys in Antarctica for uninhabited; hottest surface = Lut Desert 80.8°C; hottest standard station air = Death Valley / Ahvaz; coldest = Vostok / Oymyakon), analyze the question accurately and provide deep, rich context.

2. DIRECT UI WORKSTATION ACTIONS VIA FUNCTION CALLING:
   - When the user asks about a location, requests a map move/zoom, asks to view a layer, or requests a forecast time step, you MUST invoke the appropriate function call(s):
     * \`navigateToLocation(latitude, longitude, locationName, zoomLevel)\` -> Use accurate coordinates (e.g. Arica/Atacama: lat -18.478, lon -70.312; Lut Desert: lat 30.5, lon 59.1; Death Valley: lat 36.53, lon -116.93; Tehran: lat 35.69, lon 51.39; Ahvaz: lat 31.32, lon 48.67; Oymyakon: lat 63.46, lon 142.77, etc.).
     * \`configureCatalogLayer(sourceId, variableId, levelId, opacity, paletteId)\` -> (e.g. sourceId: 'gfs_025', 'ecmwf_ifs', 'icon_global'; variableId: 'temp_2m', 'cloud_total', 'wind_10m', 'precip_total', 'mslp').
     * \`setWeatherLayer(layerId, opacity, visualizationStyle)\` -> ('temperature', 'wind', 'precipitation', 'clouds', 'pressure', 'humidity', 'radar', 'waves').
     * \`setTimelineForecastHour(hour, autoPlay)\` -> Forecast hour (0 to 384).
     * \`setSplitScreenMode(layout, syncPanning)\` -> ('single', 'dual', 'quad').
     * \`openUIPanel(panelName)\` -> ('layers', 'settings', 'notes', 'news').

3. RESPONSE FORMATTING:
   - Provide your complete, intelligent response.
   - Summarize any executed workstation actions at the end with clear confirmation bullet points (e.g. "✅ نقشه با موفقیت بر روی شهر آریکا (شیلی) تنظیم و زوم گردید.").

Current Workstation State:
- Focus Coordinates: ${req.currentCoords ? `${req.currentCoords.lat.toFixed(4)}°N, ${req.currentCoords.lon.toFixed(4)}°E (Elevation: ${req.currentCoords.elevation}m)` : "Default"}
- Current Focus Location: ${req.activeState?.locationName || "Tehran, Iran"}
- Active Weather Layer: ${req.activeState?.activeLayerId || "temperature"}
- Active Stacked Layers: ${req.activeState?.activeLayersCount || 0}
- Current Forecast Step: +${req.activeState?.timelineHour || 15}h
- Multi-Map Split: ${req.activeState?.splitLayout || "single"}
`;

  // Try candidate models in order to ensure resilience against free tier per-model rate limits
  const candidateModels = [
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction,
          tools: [
            { functionDeclarations: agentToolDeclarations }
          ]
        }
      });

      const actions: AgentAction[] = [];
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        for (const fc of functionCalls) {
          let summary = `Executing ${fc.name}`;
          if (fc.name === "navigateToLocation") {
            const loc = (fc.args as any)?.locationName || "Coordinates";
            summary = `انتقال و زوم نقشه به ${loc} (${(fc.args as any)?.latitude?.toFixed(2)}°, ${(fc.args as any)?.longitude?.toFixed(2)}°)`;
          } else if (fc.name === "setWeatherLayer") {
            summary = `تغییر لایه نقشه به ${(fc.args as any)?.layerId}`;
          } else if (fc.name === "configureCatalogLayer") {
            summary = `تنظیم مدل ${(fc.args as any)?.sourceId} با متغیر ${(fc.args as any)?.variableId}`;
          } else if (fc.name === "setTimelineForecastHour") {
            summary = `تنظیم گام زمانی پیش‌بینی به +${(fc.args as any)?.hour} ساعت`;
          } else if (fc.name === "setSplitScreenMode") {
            summary = `تغییر حالت چندنقشه‌ای به ${(fc.args as any)?.layout}`;
          } else if (fc.name === "openUIPanel") {
            summary = `باز کردن پنل: ${(fc.args as any)?.panelName}`;
          }

          actions.push({
            name: fc.name,
            args: (fc.args as Record<string, any>) || {},
            summary,
          });
        }
      }

      // Extract text from model response or candidate parts
      let responseText = "";
      if (response.text) {
        responseText = response.text;
      } else if (response.candidates?.[0]?.content?.parts) {
        const textParts = response.candidates[0].content.parts
          .filter((p: any) => typeof p.text === "string" && p.text.trim())
          .map((p: any) => p.text);
        responseText = textParts.join("\n");
      }

      if (!responseText.trim() && actions.length > 0) {
        const actionSummaries = actions.map(a => a.summary).join("\n- ");
        responseText = `دستورات با موفقیت توسط مدل جمنای بر روی سامانه هواشناسی اجرا گردید:\n- ${actionSummaries}`;
      }

      // Extract grounding sources if any
      const groundingSources: Array<{ title: string; url: string }> = [];
      const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
      if (Array.isArray(groundingChunks)) {
        for (const chunk of groundingChunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            groundingSources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
            });
          }
        }
      }

      return {
        text: responseText,
        actions: actions.length > 0 ? actions : undefined,
        groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
      };
    } catch (err: any) {
      lastError = err;
      const isQuota = err?.status === "RESOURCE_EXHAUSTED" || err?.message?.includes("429") || err?.message?.includes("quota");
      if (isQuota) {
        console.warn(`Model ${model} hit free-tier rate limit/quota. Retrying with next model in pool...`);
        continue;
      }
      throw err;
    }
  }

  // If all candidate models in the pool were rate-limited or exhausted, throw the last error to let server handle gracefully
  throw lastError;
}
