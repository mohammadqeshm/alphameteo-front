import WebSocket from "ws";

export interface LiveStroke {
  id: number;
  time: number; // millisecond timestamp
  lat: number;
  lon: number;
  del?: number; // delay in ms
  dev?: number; // deviation / accuracy in meters
  region?: number;
  src?: number;
  ageSec?: number;
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

export class LightningManager {
  private static instance: LightningManager | null = null;
  private ws: WebSocket | null = null;
  private isConnecting: boolean = false;
  private isDestroyed: boolean = false;
  private reconnectTimer: any = null;
  private pruneTimer: any = null;

  // Rolling cache of strikes within the last 30 minutes
  private strikes: Map<number, LiveStroke> = new Map();
  private maxBufferSize: number = 6000;
  private lastStrikeTime: number = Date.now();
  private connected: boolean = false;

  // SSE listeners
  private sseClients: Set<(stroke: LiveStroke) => void> = new Set();

  private constructor() {
    this.connectWebSocket();

    // Prune strikes older than 30 minutes every 30 seconds
    this.pruneTimer = setInterval(() => {
      this.pruneOldStrikes();
    }, 30000);
  }

  public static getInstance(): LightningManager {
    if (!LightningManager.instance) {
      LightningManager.instance = new LightningManager();
    }
    return LightningManager.instance;
  }

  private connectWebSocket() {
    if (this.isDestroyed || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const serverUrl = "wss://live.lightningmaps.org";
      console.log(`[LightningManager] Connecting to live lightning network: ${serverUrl}`);

      this.ws = new WebSocket(serverUrl, {
        headers: {
          Origin: "https://www.lightningmaps.org",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        handshakeTimeout: 10000
      });

      this.ws.on("open", () => {
        this.isConnecting = false;
        this.connected = true;
        console.log("[LightningManager] Connected to Live Global Lightning Network!");

        // Handshake subscription: a=31 requests all lightning detector stations worldwide
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              v: 24,
              i: {},
              s: 0,
              x: 0,
              w: 0,
              tx: 0,
              tw: 0,
              a: 31,
              z: 2,
              b: true,
              h: "",
              l: 0,
              from_lightningmaps_org: true
            })
          );
        }
      });

      this.ws.on("message", (raw: WebSocket.RawData) => {
        try {
          const text = raw.toString();
          const msg = JSON.parse(text);

          if (msg.strokes && Array.isArray(msg.strokes)) {
            const now = Date.now();
            for (const s of msg.strokes) {
              if (typeof s.lat === "number" && typeof s.lon === "number") {
                const strokeTime = s.time || now;
                const stroke: LiveStroke = {
                  id: s.id || Math.floor(Math.random() * 10000000),
                  time: strokeTime,
                  lat: Number(s.lat.toFixed(5)),
                  lon: Number(s.lon.toFixed(5)),
                  del: s.del,
                  dev: s.dev,
                  region: s.region,
                  src: s.src
                };

                this.strikes.set(stroke.id, stroke);
                if (strokeTime > this.lastStrikeTime) {
                  this.lastStrikeTime = strokeTime;
                }

                // Broadcast to SSE clients
                this.notifySse(stroke);
              }
            }

            // Cap buffer size if necessary
            if (this.strikes.size > this.maxBufferSize) {
              this.pruneOldStrikes();
            }
          }
        } catch (err: any) {
          // Ignore parse errors on keepalive ping/pong
        }
      });

      this.ws.on("error", (err: any) => {
        console.warn("[LightningManager] WebSocket warning/error:", err?.message || err);
        this.connected = false;
      });

      this.ws.on("close", () => {
        this.connected = false;
        this.isConnecting = false;
        console.warn("[LightningManager] Disconnected from live lightning network. Reconnecting in 3s...");
        this.scheduleReconnect();
      });
    } catch (err) {
      this.connected = false;
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, 3000);
  }

  private pruneOldStrikes() {
    const now = Date.now();
    const maxAgeMs = 30 * 60 * 1000; // 30 minutes

    for (const [id, s] of this.strikes.entries()) {
      if (now - s.time > maxAgeMs) {
        this.strikes.delete(id);
      }
    }

    // If still over buffer, remove oldest
    if (this.strikes.size > this.maxBufferSize) {
      const sorted = Array.from(this.strikes.values()).sort((a, b) => b.time - a.time);
      const keep = sorted.slice(0, this.maxBufferSize);
      this.strikes.clear();
      for (const s of keep) {
        this.strikes.set(s.id, s);
      }
    }
  }

  public subscribeSse(cb: (stroke: LiveStroke) => void): () => void {
    this.sseClients.add(cb);
    return () => {
      this.sseClients.delete(cb);
    };
  }

  private notifySse(stroke: LiveStroke) {
    for (const cb of this.sseClients) {
      try {
        cb(stroke);
      } catch (e) {}
    }
  }

  public getStats(): LightningNetworkStats {
    const now = Date.now();
    let recent2Min = 0;
    let recent10Min = 0;
    let iran = 0;
    let yemen = 0;
    let middleEast = 0;
    let europe = 0;
    let americas = 0;
    let africa = 0;
    let asia = 0;

    for (const s of this.strikes.values()) {
      const ageMs = now - s.time;
      if (ageMs <= 2 * 60 * 1000) recent2Min++;
      if (ageMs <= 10 * 60 * 1000) recent10Min++;

      const lat = s.lat;
      const lon = s.lon;

      if (lat >= 24 && lat <= 40 && lon >= 44 && lon <= 64) iran++;
      if (lat >= 12 && lat <= 19 && lon >= 42 && lon <= 54) yemen++;
      if (lat >= 12 && lat <= 42 && lon >= 32 && lon <= 65) middleEast++;
      if (lat >= 34 && lat <= 70 && lon >= -15 && lon <= 45) europe++;
      if (lon >= -140 && lon <= -30) americas++;
      if (lat >= -35 && lat <= 37 && lon >= -20 && lon <= 52) africa++;
      if (lat >= 0 && lat <= 60 && lon >= 65 && lon <= 150) asia++;
    }

    const ratePerMinute = Math.round(recent2Min / 2);

    return {
      connected: this.connected,
      source: "Global Blitzortung / LightningMaps Live Network",
      network: "VLF/LF Time-of-Arrival (ToA) Sensor Grid",
      totalStrikes: this.strikes.size,
      recentLast2Min: recent2Min,
      recentLast10Min: recent10Min,
      ratePerMinute,
      lastStrikeTime: this.lastStrikeTime,
      lastUpdated: now,
      regions: {
        iran,
        yemen,
        middleEast,
        europe,
        americas,
        africa,
        asia
      }
    };
  }

  public getGeoJSON() {
    const now = Date.now();
    const features: any[] = [];

    for (const s of this.strikes.values()) {
      const ageSec = Math.max(0, Math.round((now - s.time) / 1000));
      
      // Categorize age:
      // 0: Fresh (< 2 min)
      // 1: Recent (2 - 10 min)
      // 2: Medium (10 - 20 min)
      // 3: Older (20 - 30 min)
      let ageTier = 0;
      let color = "#EF4444"; // bright red/flash for < 2 min
      if (ageSec > 1200) {
        ageTier = 3;
        color = "#A855F7"; // purple
      } else if (ageSec > 600) {
        ageTier = 2;
        color = "#F97316"; // deep orange
      } else if (ageSec > 120) {
        ageTier = 1;
        color = "#EAB308"; // amber/yellow
      }

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [s.lon, s.lat] // MapLibre takes [longitude, latitude]
        },
        properties: {
          id: s.id,
          lat: s.lat,
          lon: s.lon,
          time: s.time,
          ageSec,
          ageTier,
          color,
          dev: s.dev || 1500,
          del: s.del || 0
        }
      });
    }

    return {
      type: "FeatureCollection",
      features
    };
  }

  public getLivePayload() {
    return {
      stats: this.getStats(),
      geojson: this.getGeoJSON()
    };
  }

  public forceReconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
    this.connectWebSocket();
  }
}
