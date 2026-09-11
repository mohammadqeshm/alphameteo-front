export interface MTGLIFlash {
  id: string;
  time: number;
  lat: number;
  lon: number;
  camera: 1 | 2 | 3 | 4;
  cameraCode: "OC1" | "OC2" | "OC3" | "OC4";
  cameraName: string;
  radiance: number; // J/m²/sr
  durationMs: number;
  groupCount: number;
  eventCount: number;
  product: "LI-2-LFL" | "LI-2-LGR" | "LI-2-AF";
  satellite: string;
  ageSec?: number;
  ageTier?: number;
  color: string;
}

export interface MTGLITelemetryStats {
  operational: boolean;
  statusText: string;
  provider: string;
  satellite: string;
  orbitalSlot: string;
  instrument: string;
  wavelength: string;
  samplingDistanceSSP: string;
  totalActiveFlashes: number;
  ratePerMinute: number;
  lastDetectionTime: number;
  lastUpdated: number;
  // Official API outputs directly from satellite engine
  apiTimestamp?: number;
  apiTimestampIso?: string;
  apiTimeUtc?: string;
  apiTimeIran?: string;
  apiDateShamsi?: string;
  apiDateGregorian?: string;
  lastDetectionIso?: string;
  lastDetectionUtc?: string;
  lastDetectionIran?: string;
  lastDetectionSecondsAgo?: number;
  cameras: {
    oc1: { id: 1; name: string; region: string; flashes: number; active: boolean };
    oc2: { id: 2; name: string; region: string; flashes: number; active: boolean };
    oc3: { id: 3; name: string; region: string; flashes: number; active: boolean };
    oc4: { id: 4; name: string; region: string; flashes: number; active: boolean };
  };
}

export interface MTGLIPayload {
  apiTimestamp?: number;
  apiTimestampIso?: string;
  apiTimeUtc?: string;
  apiTimeIran?: string;
  apiDateShamsi?: string;
  apiDateGregorian?: string;
  lastDetectionTime?: number;
  lastDetectionIso?: string;
  lastDetectionUtc?: string;
  lastDetectionIran?: string;
  lastDetectionSecondsAgo?: number;
  stats: MTGLITelemetryStats;
  geojson: GeoJSON.FeatureCollection;
  coverage: GeoJSON.FeatureCollection;
}

class EumetsatMtgClientService {
  private static instance: EumetsatMtgClientService | null = null;
  private listeners: Set<(payload: MTGLIPayload) => void> = new Set();
  private statsListeners: Set<(stats: MTGLITelemetryStats) => void> = new Set();
  private currentPayload: MTGLIPayload | null = null;
  private coverageData: GeoJSON.FeatureCollection | null = null;
  private activeCameras: number[] = [1, 2, 3, 4];
  private showCoverageBoundary: boolean = true;
  private sse: EventSource | null = null;
  private pollingInterval: any = null;
  private isConnecting: boolean = false;

  private constructor() {}

  public static getInstance(): EumetsatMtgClientService {
    if (!EumetsatMtgClientService.instance) {
      EumetsatMtgClientService.instance = new EumetsatMtgClientService();
    }
    return EumetsatMtgClientService.instance;
  }

  public getActiveCameras(): number[] {
    return [...this.activeCameras];
  }

  public setCameraEnabled(cameraId: number, enabled: boolean) {
    if (enabled) {
      if (!this.activeCameras.includes(cameraId)) {
        this.activeCameras = [...this.activeCameras, cameraId].sort();
      }
    } else {
      this.activeCameras = this.activeCameras.filter(c => c !== cameraId);
    }
    this.refreshData();
  }

  public isCameraEnabled(cameraId: number): boolean {
    return this.activeCameras.includes(cameraId);
  }

  public getShowCoverageBoundary(): boolean {
    return this.showCoverageBoundary;
  }

  public setShowCoverageBoundary(show: boolean) {
    this.showCoverageBoundary = show;
  }

  public async fetchCoverage(): Promise<GeoJSON.FeatureCollection> {
    if (this.coverageData) return this.coverageData;
    try {
      const res = await fetch("/api/eumetsat/mtg-li/coverage");
      if (res.ok) {
        const data = await res.json();
        this.coverageData = data;
        return data;
      }
    } catch (e) {
      console.warn("Failed to fetch MTG-LI coverage geojson:", e);
    }
    return { type: "FeatureCollection", features: [] };
  }

  public async refreshData(): Promise<MTGLIPayload | null> {
    try {
      const query = this.activeCameras.join(",");
      const res = await fetch(`/api/eumetsat/mtg-li/live?cameras=${query}`);
      if (res.ok) {
        const payload: MTGLIPayload = await res.json();
        this.currentPayload = payload;
        if (payload.coverage) {
          this.coverageData = payload.coverage;
        }
        this.notifyListeners(payload);
        return payload;
      }
    } catch (e) {
      console.warn("Error fetching EUMETSAT MTG-LI data:", e);
    }
    return null;
  }

  public startLiveStream() {
    if (this.isConnecting || this.sse) return;
    this.isConnecting = true;

    // Initial fetch
    this.refreshData();

    // Start polling fallback every 8 seconds
    if (!this.pollingInterval) {
      this.pollingInterval = setInterval(() => {
        this.refreshData();
      }, 8000);
    }

    try {
      this.sse = new EventSource("/api/eumetsat/mtg-li/stream");
      this.sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "flash" && data.flash) {
            const flash: MTGLIFlash = data.flash;
            if (this.activeCameras.includes(flash.camera) && this.currentPayload) {
              // Prepend to current GeoJSON
              const feature: GeoJSON.Feature = {
                type: "Feature",
                id: flash.id,
                geometry: {
                  type: "Point",
                  coordinates: [flash.lon, flash.lat]
                },
                properties: {
                  ...flash,
                  ageSec: 0,
                  ageTier: 0
                }
              };
              const updatedFeatures = [feature, ...this.currentPayload.geojson.features.slice(0, 3000)];
              const updatedPayload: MTGLIPayload = {
                ...this.currentPayload,
                apiTimestamp: data.apiTimestamp || this.currentPayload.apiTimestamp,
                apiTimeUtc: data.apiTimeUtc || this.currentPayload.apiTimeUtc,
                apiTimeIran: data.apiTimeIran || this.currentPayload.apiTimeIran,
                apiDateShamsi: data.apiDateShamsi || this.currentPayload.apiDateShamsi,
                apiDateGregorian: data.apiDateGregorian || this.currentPayload.apiDateGregorian,
                lastDetectionTime: flash.time,
                lastDetectionUtc: data.lastDetectionUtc || this.currentPayload.lastDetectionUtc,
                lastDetectionIran: data.lastDetectionIran || this.currentPayload.lastDetectionIran,
                lastDetectionSecondsAgo: data.lastDetectionSecondsAgo ?? 0,
                geojson: {
                  type: "FeatureCollection",
                  features: updatedFeatures
                },
                stats: {
                  ...this.currentPayload.stats,
                  apiTimestamp: data.apiTimestamp || this.currentPayload.stats.apiTimestamp,
                  apiTimeUtc: data.apiTimeUtc || this.currentPayload.stats.apiTimeUtc,
                  apiTimeIran: data.apiTimeIran || this.currentPayload.stats.apiTimeIran,
                  apiDateShamsi: data.apiDateShamsi || this.currentPayload.stats.apiDateShamsi,
                  apiDateGregorian: data.apiDateGregorian || this.currentPayload.stats.apiDateGregorian,
                  totalActiveFlashes: updatedFeatures.length,
                  lastDetectionTime: flash.time,
                  lastDetectionUtc: data.lastDetectionUtc || this.currentPayload.stats.lastDetectionUtc,
                  lastDetectionIran: data.lastDetectionIran || this.currentPayload.stats.lastDetectionIran,
                  lastDetectionSecondsAgo: data.lastDetectionSecondsAgo ?? 0,
                  lastUpdated: Date.now()
                }
              };
              this.currentPayload = updatedPayload;
              this.notifyListeners(updatedPayload);
            }
          } else if (data.type === "connected" && this.currentPayload) {
            this.currentPayload = {
              ...this.currentPayload,
              apiTimestamp: data.apiTimestamp,
              apiTimeUtc: data.apiTimeUtc,
              apiTimeIran: data.apiTimeIran,
              apiDateShamsi: data.apiDateShamsi,
              apiDateGregorian: data.apiDateGregorian,
              lastDetectionTime: data.lastDetectionTime,
              lastDetectionUtc: data.lastDetectionUtc,
              lastDetectionSecondsAgo: data.lastDetectionSecondsAgo
            };
            this.notifyListeners(this.currentPayload);
          }
        } catch (err) {}
      };

      this.sse.onerror = () => {
        this.sse?.close();
        this.sse = null;
        this.isConnecting = false;
      };
    } catch (e) {
      this.isConnecting = false;
    }
  }

  public stopLiveStream() {
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isConnecting = false;
  }

  public subscribe(cb: (payload: MTGLIPayload) => void): () => void {
    this.listeners.add(cb);
    if (this.currentPayload) {
      cb(this.currentPayload);
    } else {
      this.refreshData();
    }
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getCurrentPayload(): MTGLIPayload | null {
    return this.currentPayload;
  }

  public getGeoJSON(cameras?: number[], timeFilter?: "all" | "15m" | "5m" | "2m"): GeoJSON.FeatureCollection {
    if (!this.currentPayload?.geojson) {
      return { type: "FeatureCollection", features: [] };
    }
    const targetCameras = cameras || this.activeCameras;
    const now = Date.now();
    let maxAgeSec = Infinity;
    if (timeFilter === "2m") maxAgeSec = 120;
    else if (timeFilter === "5m") maxAgeSec = 300;
    else if (timeFilter === "15m") maxAgeSec = 900;

    const filteredFeatures = this.currentPayload.geojson.features.filter((f) => {
      const cam = (f.properties as any)?.camera;
      if (!targetCameras.includes(cam)) return false;

      if (maxAgeSec !== Infinity) {
        const time = (f.properties as any)?.time || 0;
        const ageSec = Math.max(0, Math.round((now - time) / 1000));
        if (ageSec > maxAgeSec) return false;
      }
      return true;
    });
    return {
      type: "FeatureCollection",
      features: filteredFeatures
    };
  }

  private notifyListeners(payload: MTGLIPayload) {
    for (const cb of this.listeners) {
      try {
        cb(payload);
      } catch (e) {}
    }
    for (const cb of this.statsListeners) {
      try {
        cb(payload.stats);
      } catch (e) {}
    }
  }
}

export const eumetsatMtgService = EumetsatMtgClientService.getInstance();
