export interface LiveStroke {
  id: number;
  lat: number;
  lon: number;
  time: number;
  ageSec: number;
  ageTier: number; // 0: <2m, 1: 2-10m, 2: 10-20m, 3: 20-30m
  color: string;
  dev?: number;
  del?: number;
}

export interface LightningNetworkStats {
  connected: boolean;
  source: string;
  network: string;
  totalStrikes: number;
  recentLast2Min: number;
  recentLast10Min: number;
  ratePerMinute: number;
  lastStrikeTime: number;
  lastUpdated: number;
  regions: {
    iran: number;
    yemen: number;
    middleEast: number;
    europe: number;
    americas: number;
    africa: number;
    asia: number;
  };
}

export interface LiveLightningPayload {
  stats: LightningNetworkStats;
  geojson: GeoJSON.FeatureCollection;
}

export class LightningService {
  private static instance: LightningService | null = null;
  private isRunning = false;
  private pollInterval: any = null;
  private sse: EventSource | null = null;

  private payload: LiveLightningPayload = {
    stats: {
      connected: true,
      source: "Global Blitzortung / LightningMaps Live Network",
      network: "VLF/LF Time-of-Arrival (ToA) Sensor Grid",
      totalStrikes: 0,
      recentLast2Min: 0,
      recentLast10Min: 0,
      ratePerMinute: 0,
      lastStrikeTime: Date.now(),
      lastUpdated: Date.now(),
      regions: {
        iran: 0,
        yemen: 0,
        middleEast: 0,
        europe: 0,
        americas: 0,
        africa: 0,
        asia: 0
      }
    },
    geojson: {
      type: "FeatureCollection",
      features: []
    }
  };

  private listeners: Set<(payload: LiveLightningPayload) => void> = new Set();
  private strikeListeners: Set<(stroke: LiveStroke) => void> = new Set();

  private constructor() {}

  public static getInstance(): LightningService {
    if (!LightningService.instance) {
      LightningService.instance = new LightningService();
    }
    return LightningService.instance;
  }

  public async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // 1. Initial snapshot fetch
    await this.fetchData();

    // 2. Start SSE stream for instant live strikes
    this.startSSE();

    // 3. Regular sync poll every 12 seconds
    this.pollInterval = setInterval(() => {
      this.fetchData();
    }, 12000);
  }

  public stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    this.isRunning = false;
  }

  private startSSE() {
    if (typeof window === "undefined" || !window.EventSource) return;

    try {
      if (this.sse) {
        this.sse.close();
      }

      this.sse = new EventSource("/api/lightning/stream");

      this.sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "stroke" && data.stroke) {
            const s = data.stroke;
            const stroke: LiveStroke = {
              id: s.id,
              lat: s.lat,
              lon: s.lon,
              time: s.time,
              ageSec: Math.max(0, Math.round((Date.now() - s.time) / 1000)),
              ageTier: 0,
              color: "#EF4444",
              dev: s.dev,
              del: s.del
            };

            // Notify single-stroke listeners (for sound or flash visual)
            for (const cb of this.strikeListeners) {
              try {
                cb(stroke);
              } catch (e) {}
            }
          }
        } catch (e) {}
      };

      this.sse.onerror = () => {
        // Reconnect will be handled automatically by EventSource
      };
    } catch (e) {
      console.warn("[LightningService] SSE initiation error:", e);
    }
  }

  public async fetchData(): Promise<LiveLightningPayload> {
    try {
      const res = await fetch("/api/lightning/live");
      if (res.ok) {
        const json: LiveLightningPayload = await res.json();
        this.payload = json;
        this.notifyListeners();
      }
    } catch (e) {
      console.warn("[LightningService] Error fetching live lightning data:", e);
    }
    return this.payload;
  }

  public async refresh(): Promise<LiveLightningPayload> {
    try {
      const res = await fetch("/api/lightning/refresh", { method: "POST" });
      if (res.ok) {
        const json: LiveLightningPayload = await res.json();
        this.payload = json;
        this.notifyListeners();
      }
    } catch (e) {
      console.warn("[LightningService] Error refreshing lightning data:", e);
    }
    return this.payload;
  }

  public getPayload(): LiveLightningPayload {
    return this.payload;
  }

  public getGeoJSON(): GeoJSON.FeatureCollection {
    return this.payload.geojson;
  }

  public getStats(): LightningNetworkStats {
    return this.payload.stats;
  }

  public subscribe(listener: (payload: LiveLightningPayload) => void): () => void {
    this.listeners.add(listener);
    listener(this.payload);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onNewStrike(listener: (stroke: LiveStroke) => void): () => void {
    this.strikeListeners.add(listener);
    return () => {
      this.strikeListeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.payload);
      } catch (err) {
        console.error("[LightningService] Listener error:", err);
      }
    }
  }
}
