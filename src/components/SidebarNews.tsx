import React, { useState } from "react";
import { 
  Newspaper, 
  Search, 
  Radio, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  Share2, 
  ExternalLink,
  Layers,
  MapPin,
  FileText
} from "lucide-react";
import { Coordinate, WeatherLayer } from "../types";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  date: string;
  time: string;
  category: "gfs" | "severe" | "climate" | "satellite";
  severity: "info" | "warning" | "danger";
  imageSeed: string;
  coords?: Coordinate;
}

interface SidebarNewsProps {
  currentCoords: Coordinate;
  activeLayer: WeatherLayer;
  onFocusLocation: (coords: Coordinate) => void;
  onCopyToNotes: (text: string) => void;
}

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Severe Changes in Middle East Jetstream Patterns",
    summary: "The latest numerical GFS models indicate unprecedented warm air advection shifting towards northern latitudes.",
    content: `Based on the latest GFS 0.25° weather model update, a deep polar trough is forming over the Black Sea, causing a significant southward displacement of the subtropical jetstream towards the Alborz region. This configuration carries high potential for severe convective wind gusts (up to 90 km/h) across central and eastern regions.

Analysts expect that over the next 72 hours, moisture advection from the Red Sea will increase sharply, triggering severe convective rainstorms and lightning across the Zagros mountains. Station operators are advised to keep barometric sensors calibrated.`,
    source: "Alpha Meteo Analysis",
    date: "2026/07/15",
    time: "12:30",
    category: "gfs",
    severity: "warning",
    imageSeed: "jetstream",
    coords: { lat: 35.6892, lon: 51.3890, elevation: 1190 }
  },
  {
    id: "news-2",
    title: "Severe Tropical Cyclone Warning in Northern Indian Ocean",
    summary: "Infrared and water vapor satellite imagery confirms the formation of a deep low-pressure center with potential Category 3 development.",
    content: `The Indian Ocean Satellite Monitoring Center reports that rotational wind speeds around the cyclone's center have exceeded 55 knots. Tracking models project the path of this system towards the Makran Coast and the Gulf of Oman.

Wave heights are expected to exceed 4 meters near Chabahar Port. Sea state and wind speed layers in the Alpha Meteo dashboard must be monitored continuously. Small vessels are advised to avoid deep waters until further notice.`,
    source: "IMD Cyclone Center",
    date: "2026/07/14",
    time: "09:15",
    category: "severe",
    severity: "danger",
    imageSeed: "cyclone",
    coords: { lat: 25.2919, lon: 60.6212, elevation: 5 }
  },
  {
    id: "news-3",
    title: "Positive Sea Surface Temperature (SST) Anomaly in the Caspian Sea",
    summary: "Sea Surface Temperature (SST) in the southern basin is registering 3.5°C above the 30-year long-term mean.",
    content: `Satellite data from MODIS sensors indicate a steadily rising positive anomaly in Caspian Sea surface temperatures. This anomaly increases evaporation rates, which—when mixed with polar cold fronts in late summer—could yield extreme precipitation events along the Gilan and Mazandaran coastlines.

Furthermore, this anomaly is disrupting local marine ecosystems and accelerating the overall decline in Caspian Sea water levels.`,
    source: "Caspian Environmental Watch",
    date: "2026/07/13",
    time: "16:45",
    category: "climate",
    severity: "info",
    imageSeed: "caspian",
    coords: { lat: 37.5000, lon: 51.5000, elevation: -27 }
  },
  {
    id: "news-4",
    title: "Temporary Satellite Telemetry Outage Due to Solar Storm",
    summary: "A severe Coronal Mass Ejection (CME) has initiated a G3-class geomagnetic storm, impacting satellite sensors.",
    content: `The NOAA Space Weather Prediction Center reports that highly energetic charged particles from the recent solar flare are currently impacting Earth's magnetosphere. This interaction can cause temporary instability in high-frequency satellite telemetry links, impacting reflectivity and colorized satellite overlays.

If map frames experience a rendering delay, the dashboard will temporarily switch to cached offline vector tiles to ensure uninterrupted operation.`,
    source: "Space Weather Bureau",
    date: "2026/07/12",
    time: "21:00",
    category: "satellite",
    severity: "warning",
    imageSeed: "spaceweather"
  }
];

export const SidebarNews: React.FC<SidebarNewsProps> = ({
  currentCoords,
  activeLayer,
  onFocusLocation,
  onCopyToNotes
}) => {
  const [news, setNews] = useState<NewsItem[]>(SAMPLE_NEWS);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "gfs" | "severe" | "climate" | "satellite">("all");
  const [liveTickerIndex, setLiveTickerIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered list
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeNews = news.find(n => n.id === selectedNewsId);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "gfs": return "GFS Numerical Models";
      case "severe": return "Storms & Hazards";
      case "climate": return "Climate Anomalies";
      case "satellite": return "Satellite Data";
      default: return "General";
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "gfs": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "severe": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "climate": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "satellite": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "danger": return "🔴 RED WARNING";
      case "warning": return "🟡 ORANGE ADVISORY";
      default: return "🟢 NORMAL STATUS";
    }
  };

  // Live broadcast ticker ticks periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveTickerIndex((prev) => (prev + 1) % news.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [news.length]);

  return (
    <div className="flex flex-col h-full bg-[#08090C] text-slate-200" id="news-panel">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#1A1C23] flex flex-col space-y-2 bg-[#08090C] shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold tracking-widest text-slate-100 uppercase flex items-center space-x-2 font-sans">
            <Newspaper className="w-3.5 h-3.5 text-amber-500" />
            <span>Synoptic News & Bulletins</span>
          </h2>
          <span className="flex items-center space-x-1 text-[9px] bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Live Broadcast Ticker */}
      <div className="px-3 py-1.5 bg-[#0e1017] border-b border-[#1a1c23]/60 flex items-center space-x-2 text-[10px] text-amber-500 select-none overflow-hidden shrink-0" dir="ltr">
        <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
        <span className="font-bold shrink-0 text-slate-400 border-r border-slate-800 pr-2 mr-1">FEED:</span>
        <div className="flex-1 overflow-hidden relative h-4">
          <div className="absolute inset-0 transition-transform duration-500 ease-in-out truncate hover:text-white cursor-pointer"
               onClick={() => setSelectedNewsId(news[liveTickerIndex].id)}>
            {news[liveTickerIndex].title}
          </div>
        </div>
      </div>

      {activeNews ? (
        // Detailed Article View
        <div className="flex-1 flex flex-col overflow-hidden" dir="ltr">
          {/* Back Action Bar */}
          <div className="px-3 py-2 bg-[#0d0e13] border-b border-[#1A1C23] flex justify-between items-center shrink-0">
            <button 
              onClick={() => setSelectedNewsId(null)}
              className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-xs transition py-0.5 px-1.5 rounded hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to News list</span>
            </button>

            <div className="flex items-center space-x-2">
              {activeNews.coords && (
                <button
                  onClick={() => onFocusLocation(activeNews.coords!)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold rounded border border-blue-500/30 transition"
                  title="Focus map on report center"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Focus Map</span>
                </button>
              )}
              <button
                onClick={() => {
                  const markdownNotes = `<h3>📰 Bulletin: ${activeNews.title}</h3>
<div><strong>Source:</strong> ${activeNews.source} | <strong>Date:</strong> ${activeNews.date}</div>
<p>${activeNews.content.replace(/\n/g, '<br>')}</p>
<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 8px 0;">`;
                  onCopyToNotes(markdownNotes);
                  showToast("Report copied to your meteorological notes! 📋");
                }}
                className="flex items-center space-x-1 px-2 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white text-[10px] font-bold rounded border border-amber-500/30 transition"
                title="Append this report to your notebook"
              >
                <FileText className="w-3 h-3" />
                <span>Copy to Notes</span>
              </button>
            </div>
          </div>

          {toastMessage && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-3 py-1.5 text-[10.5px] text-emerald-300 font-semibold flex items-center justify-between animate-fadeIn">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Article Scroll Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar select-text bg-[#08090C]">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold ${getCategoryColor(activeNews.category)}`}>
                  {getCategoryLabel(activeNews.category)}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 font-mono">{activeNews.date} {activeNews.time}</span>
                <span className="text-slate-500">|</span>
                <span className="text-rose-400 font-bold">{getSeverityBadge(activeNews.severity)}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 leading-snug">{activeNews.title}</h3>
            </div>

            {/* Generated visual frame representing the simulation / radar screenshot */}
            <div className="relative w-full aspect-video rounded border border-[#232632] bg-[#0c0d13] overflow-hidden flex flex-col justify-between p-3 select-none">
              {/* Background tech design simulation */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-radial-at-c from-amber-500/40 to-transparent" />
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

              <div className="flex justify-between items-start z-10 font-mono text-[9px] text-slate-500">
                <span>SIMULATION FEED: #{activeNews.id}</span>
                <span className="text-amber-500 font-bold uppercase tracking-widest flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>SATELLITE SYNC</span>
                </span>
              </div>

              {/* Graphical placeholder representing meteorology visualization */}
              <div className="flex flex-col items-center justify-center space-y-1.5 z-10 flex-1 my-2">
                <Globe className="w-8 h-8 text-slate-600 animate-spin" style={{ animationDuration: '60s' }} />
                <span className="text-[10px] text-slate-400 font-medium font-sans">Remote Sensing & Advection</span>
                <span className="text-[9px] text-slate-600 font-mono">
                  {activeNews.coords ? `LAT: ${activeNews.coords.lat.toFixed(2)} / LON: ${activeNews.coords.lon.toFixed(2)}` : "GLOBAL PROJECTION MODEL"}
                </span>
              </div>

              <div className="flex justify-between items-center z-10 border-t border-slate-900/60 pt-1.5 text-[8.5px] text-slate-500 font-mono">
                <span>SOURCE: {activeNews.source}</span>
                <span>ALPHA METEO SYS 4.0</span>
              </div>
            </div>

            {/* Body Text */}
            <div className="text-slate-300 text-xs leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-800/40 pt-4 font-sans">
              {activeNews.content}
            </div>

            {/* Related dynamic simulation metadata */}
            <div className="p-3 rounded bg-[#0d0e13]/60 border border-[#1A1C23] text-[10px] text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-200">Technical Briefing & Tools:</span>
              <p className="leading-relaxed text-[9.5px] text-slate-400">
                To cross-examine these conditions, we highly recommend switching the map's weather overlay to the <span className="text-blue-400 font-semibold">{activeLayer.name}</span> layer over the specified coordinates and observing temporal trend diagrams.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // List View of News
        <div className="flex-1 flex flex-col overflow-hidden" dir="ltr">
          {/* Filter Toolbar */}
          <div className="p-3 bg-[#0d0e13] border-b border-[#1A1C23] flex flex-col space-y-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search weather bulletins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14161f] text-slate-200 text-xs pr-3 pl-8 py-2 rounded border border-[#212532] focus:border-amber-500/50 focus:outline-none transition font-sans placeholder-slate-600"
              />
            </div>

            {/* Category Tags Horizontal scroll */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 select-none custom-scrollbar text-[10px]">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 rounded transition whitespace-nowrap shrink-0 border ${
                  selectedCategory === "all" 
                    ? "bg-amber-600/10 text-amber-400 border-amber-500/40 font-bold" 
                    : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory("gfs")}
                className={`px-2.5 py-1 rounded transition whitespace-nowrap shrink-0 border ${
                  selectedCategory === "gfs" 
                    ? "bg-blue-600/10 text-blue-400 border-blue-500/40 font-bold" 
                    : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-300"
                }`}
              >
                GFS Model
              </button>
              <button
                onClick={() => setSelectedCategory("severe")}
                className={`px-2.5 py-1 rounded transition whitespace-nowrap shrink-0 border ${
                  selectedCategory === "severe" 
                    ? "bg-red-600/10 text-red-400 border-red-500/40 font-bold" 
                    : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-300"
                }`}
              >
                Hazards
              </button>
              <button
                onClick={() => setSelectedCategory("climate")}
                className={`px-2.5 py-1 rounded transition whitespace-nowrap shrink-0 border ${
                  selectedCategory === "climate" 
                    ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/40 font-bold" 
                    : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-300"
                }`}
              >
                Anomalies
              </button>
              <button
                onClick={() => setSelectedCategory("satellite")}
                className={`px-2.5 py-1 rounded transition whitespace-nowrap shrink-0 border ${
                  selectedCategory === "satellite" 
                    ? "bg-amber-600/10 text-amber-400 border-amber-500/40 font-bold" 
                    : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-300"
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Scrollable News Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-[#08090C]">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNewsId(item.id)}
                className="p-3 rounded-lg border border-[#1A1C23] bg-[#0c0d12]/50 hover:bg-[#12141c]/60 hover:border-amber-500/30 cursor-pointer transition flex flex-col space-y-2 group"
              >
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-semibold ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-slate-500">{item.date} • {item.time}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[11.5px] font-bold text-slate-200 group-hover:text-amber-400 transition leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-900/40 text-slate-500 font-mono">
                  <span>Source: {item.source}</span>
                  <span className="text-amber-500 font-bold group-hover:translate-x-[2px] transition-transform duration-150 flex items-center space-x-1">
                    <span>Read Analysis</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}

            {filteredNews.length === 0 && (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Newspaper className="w-8 h-8 text-slate-600 mx-auto opacity-40 animate-pulse" />
                <h5 className="text-[11px] font-bold">No bulletins found</h5>
                <p className="text-[9.5px] text-slate-600 font-sans">Try adjusting your search filters.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
