import { Coordinate, WeatherForecast } from "../types";

export interface NaturalLanguageAgentResult {
  replyText: string;
  actions: Array<{
    name: string;
    args: Record<string, any>;
    summary: string;
  }>;
  groundingSources?: Array<{ title: string; url: string }>;
}

// Built-in high-speed geographic knowledge base for prominent cities, regions, and climate landmarks
export const GLOBAL_LOCATIONS: Record<string, { lat: number; lon: number; name: string; country: string; zoom: number }> = {
  // Middle East & Major Regional Centers
  "mashhad": { lat: 36.2972, lon: 59.6067, name: "Mashhad", country: "Iran", zoom: 9 },
  "tehran": { lat: 35.6892, lon: 51.3890, name: "Tehran", country: "Iran", zoom: 9 },
  "shiraz": { lat: 29.5918, lon: 52.5837, name: "Shiraz", country: "Iran", zoom: 9 },
  "esfahan": { lat: 32.6546, lon: 51.6680, name: "Isfahan", country: "Iran", zoom: 9 },
  "isfahan": { lat: 32.6546, lon: 51.6680, name: "Isfahan", country: "Iran", zoom: 9 },
  "tabriz": { lat: 38.0962, lon: 46.2731, name: "Tabriz", country: "Iran", zoom: 9 },
  "ahvaz": { lat: 31.3183, lon: 48.6706, name: "Ahvaz", country: "Iran", zoom: 9 },
  "kish": { lat: 26.5325, lon: 53.9840, name: "Kish Island", country: "Iran", zoom: 10 },
  "qeshm": { lat: 26.9585, lon: 56.2721, name: "Qeshm Island", country: "Iran", zoom: 10 },
  "bandar abbas": { lat: 27.1832, lon: 56.2666, name: "Bandar Abbas", country: "Iran", zoom: 9 },
  "rasht": { lat: 37.2809, lon: 49.5924, name: "Rasht", country: "Iran", zoom: 9 },
  "sari": { lat: 36.5659, lon: 53.0586, name: "Sari", country: "Iran", zoom: 9 },
  "gorgan": { lat: 36.8430, lon: 54.4374, name: "Gorgan", country: "Iran", zoom: 9 },
  "urmia": { lat: 37.5527, lon: 45.0761, name: "Urmia", country: "Iran", zoom: 9 },
  "ardabil": { lat: 38.2498, lon: 48.2933, name: "Ardabil", country: "Iran", zoom: 9 },
  "kermanshah": { lat: 34.3277, lon: 47.0778, name: "Kermanshah", country: "Iran", zoom: 9 },
  "sanandaj": { lat: 35.3219, lon: 46.9862, name: "Sanandaj", country: "Iran", zoom: 9 },
  "hamedan": { lat: 34.7983, lon: 48.5146, name: "Hamedan", country: "Iran", zoom: 9 },
  "zanjan": { lat: 36.6736, lon: 48.4787, name: "Zanjan", country: "Iran", zoom: 9 },
  "qazvin": { lat: 36.2797, lon: 50.0049, name: "Qazvin", country: "Iran", zoom: 9 },
  "karaj": { lat: 35.8327, lon: 50.9915, name: "Karaj", country: "Iran", zoom: 9 },
  "arak": { lat: 34.0954, lon: 49.7013, name: "Arak", country: "Iran", zoom: 9 },
  "qom": { lat: 34.6401, lon: 50.8764, name: "Qom", country: "Iran", zoom: 9 },
  "khorramabad": { lat: 33.4878, lon: 48.3558, name: "Khorramabad", country: "Iran", zoom: 9 },
  "ilam": { lat: 33.6374, lon: 46.4227, name: "Ilam", country: "Iran", zoom: 9 },
  "shahrekord": { lat: 32.3256, lon: 50.8644, name: "Shahrekord", country: "Iran", zoom: 9 },
  "yasuj": { lat: 30.6684, lon: 51.5876, name: "Yasuj", country: "Iran", zoom: 9 },
  "bushehr": { lat: 28.9234, lon: 50.8203, name: "Bushehr", country: "Iran", zoom: 9 },
  "kerman": { lat: 30.2839, lon: 57.0834, name: "Kerman", country: "Iran", zoom: 9 },
  "yazd": { lat: 31.8974, lon: 54.3569, name: "Yazd", country: "Iran", zoom: 9 },
  "zahedan": { lat: 29.4963, lon: 60.8629, name: "Zahedan", country: "Iran", zoom: 9 },
  "chabahar": { lat: 25.2969, lon: 60.6430, name: "Chabahar", country: "Iran", zoom: 9.5 },
  "semnan": { lat: 35.5769, lon: 53.3970, name: "Semnan", country: "Iran", zoom: 9 },
  "birjand": { lat: 32.8663, lon: 59.2211, name: "Birjand", country: "Iran", zoom: 9 },
  "bojnurd": { lat: 37.4747, lon: 57.3290, name: "Bojnurd", country: "Iran", zoom: 9 },
  "dehloran": { lat: 32.6941, lon: 47.2679, name: "Dehloran", country: "Iran", zoom: 9 },
  "shush": { lat: 32.1942, lon: 48.2436, name: "Shush", country: "Iran", zoom: 9 },
  "damavand": { lat: 35.7178, lon: 52.0650, name: "Mount Damavand", country: "Iran", zoom: 11 },
  "lut desert": { lat: 30.5000, lon: 59.1000, name: "Lut Desert (Hottest Land Surface)", country: "Iran", zoom: 8 },
  "gandom beryan": { lat: 31.1000, lon: 57.8000, name: "Gandom Beryan (Lut Desert)", country: "Iran", zoom: 9 },
  "dasht-e kavir": { lat: 34.5000, lon: 54.5000, name: "Dasht-e Kavir", country: "Iran", zoom: 7.5 },
  "persian gulf": { lat: 26.5000, lon: 52.0000, name: "Persian Gulf", country: "Marine Sector", zoom: 6.5 },
  "caspian sea": { lat: 39.5000, lon: 51.5000, name: "Caspian Sea", country: "Marine Sector", zoom: 6 },
  "gulf of oman": { lat: 24.5000, lon: 59.0000, name: "Gulf of Oman", country: "Indian Ocean", zoom: 6.5 },

  // Climate Extremes & World Metropolises
  "atacama": { lat: -24.5000, lon: -69.2500, name: "Atacama Desert", country: "Chile", zoom: 7.5 },
  "arica": { lat: -18.4783, lon: -70.3126, name: "Arica", country: "Chile", zoom: 9 },
  "mcmurdo dry valleys": { lat: -77.5000, lon: 162.5000, name: "McMurdo Dry Valleys", country: "Antarctica", zoom: 6 },
  "mcmurdo": { lat: -77.5000, lon: 162.5000, name: "McMurdo Dry Valleys", country: "Antarctica", zoom: 6 },
  "death valley": { lat: 36.5323, lon: -116.9325, name: "Death Valley", country: "USA", zoom: 8.5 },
  "vostok": { lat: -78.4644, lon: 106.8373, name: "Vostok Station", country: "Antarctica", zoom: 5 },
  "oymyakon": { lat: 63.4641, lon: 142.7737, name: "Oymyakon", country: "Russia (Siberia)", zoom: 8 },
  "london": { lat: 51.5074, lon: -0.1278, name: "London", country: "UK", zoom: 9 },
  "paris": { lat: 48.8566, lon: 2.3522, name: "Paris", country: "France", zoom: 9 },
  "new york": { lat: 40.7128, lon: -74.0060, name: "New York", country: "USA", zoom: 9 },
  "washington": { lat: 38.9072, lon: -77.0369, name: "Washington, D.C.", country: "USA", zoom: 9 },
  "los angeles": { lat: 34.0522, lon: -118.2437, name: "Los Angeles", country: "USA", zoom: 9 },
  "tokyo": { lat: 35.6762, lon: 139.6503, name: "Tokyo", country: "Japan", zoom: 9 },
  "dubai": { lat: 25.2048, lon: 55.2708, name: "Dubai", country: "UAE", zoom: 9 },
  "abu dhabi": { lat: 24.4539, lon: 54.3773, name: "Abu Dhabi", country: "UAE", zoom: 9 },
  "doha": { lat: 25.2854, lon: 51.5310, name: "Doha", country: "Qatar", zoom: 9 },
  "riyadh": { lat: 24.7136, lon: 46.6753, name: "Riyadh", country: "Saudi Arabia", zoom: 9 },
  "mecca": { lat: 21.3891, lon: 39.8579, name: "Mecca", country: "Saudi Arabia", zoom: 9.5 },
  "medina": { lat: 24.5247, lon: 39.5692, name: "Medina", country: "Saudi Arabia", zoom: 9.5 },
  "istanbul": { lat: 41.0082, lon: 28.9784, name: "Istanbul", country: "Turkey", zoom: 9 },
  "ankara": { lat: 39.9334, lon: 32.8597, name: "Ankara", country: "Turkey", zoom: 9 },
  "baghdad": { lat: 33.3152, lon: 44.3661, name: "Baghdad", country: "Iraq", zoom: 9 },
  "basra": { lat: 30.5085, lon: 47.7804, name: "Basra", country: "Iraq", zoom: 9 },
  "najaf": { lat: 31.9961, lon: 44.3298, name: "Najaf", country: "Iraq", zoom: 9 },
  "karbala": { lat: 32.6160, lon: 44.0249, name: "Karbala", country: "Iraq", zoom: 9 },
  "moscow": { lat: 55.7558, lon: 37.6173, name: "Moscow", country: "Russia", zoom: 9 },
  "sydney": { lat: -33.8688, lon: 151.2093, name: "Sydney", country: "Australia", zoom: 9 },
  "cairo": { lat: 30.0444, lon: 31.2357, name: "Cairo", country: "Egypt", zoom: 9 },
  "beijing": { lat: 39.9042, lon: 116.4074, name: "Beijing", country: "China", zoom: 9 },
  "shanghai": { lat: 31.2304, lon: 121.4737, name: "Shanghai", country: "China", zoom: 9 },
  "berlin": { lat: 52.5200, lon: 13.4050, name: "Berlin", country: "Germany", zoom: 9 },
  "rome": { lat: 41.9028, lon: 12.4964, name: "Rome", country: "Italy", zoom: 9 },
  "madrid": { lat: 40.4168, lon: -3.7038, name: "Madrid", country: "Spain", zoom: 9 },
  "amsterdam": { lat: 52.3676, lon: 4.9041, name: "Amsterdam", country: "Netherlands", zoom: 9 },
  "south pole": { lat: -82.8628, lon: 135.0000, name: "South Pole (Vostok Region)", country: "Antarctica", zoom: 4 },
  "north pole": { lat: 85.0000, lon: 0.0000, name: "Arctic Ocean", country: "North Pole", zoom: 4 },
};

// Safe word-boundary match helper to prevent partial substring collisions
function matchesExactLocationName(text: string, locationKey: string): boolean {
  const cleanKey = locationKey.trim().toLowerCase();
  if (cleanKey.length < 2) return false;

  const escapedKey = cleanKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(?:^|[\\s,.?!;:\\-()"])${escapedKey}(?:$|[\\s,.?!;:\\-()"])`, "i");
  return regex.test(text);
}

// Async geocoder for any unknown city or location worldwide
export async function lookupLocationWorldwide(query: string): Promise<{ lat: number; lon: number; name: string; country: string; zoom: number } | null> {
  const clean = query.trim().toLowerCase();

  // 1. Check local catalog first with strict exact token matching
  for (const [key, loc] of Object.entries(GLOBAL_LOCATIONS)) {
    if (matchesExactLocationName(clean, key) || clean === key) {
      return loc;
    }
  }

  // 2. Query OpenStreetMap geocoding endpoint
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.lat !== undefined && data.lon !== undefined) {
        return {
          lat: data.lat,
          lon: data.lon,
          name: data.name.split(",")[0] || query,
          country: data.name,
          zoom: 9
        };
      }
    }
  } catch (err) {
    console.warn("Geocoding lookup failed:", err);
  }

  return null;
}

export async function processClientAgentFallbackAsync(
  userText: string,
  currentCoords: Coordinate,
  currentWeather: WeatherForecast | null
): Promise<NaturalLanguageAgentResult> {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const actions: Array<{ name: string; args: Record<string, any>; summary: string }> = [];
  const actionConfirmations: string[] = [];

  // ----------------------------------------------------
  // STEP 1: DETECT CLIMATE EXTREMES & GEOGRAPHIC DESTINATIONS
  // ----------------------------------------------------
  let targetLocation: { lat: number; lon: number; name: string; country: string; zoom: number } | null = null;
  let factualAnswer = "";

  // CASE A: Driest Inhabited City or Driest Place on Earth
  if (lower.includes("driest") || lower.includes("least rain") || lower.includes("arid")) {
    if (lower.includes("inhabited") || lower.includes("city") || lower.includes("cities") || lower.includes("populated")) {
      targetLocation = GLOBAL_LOCATIONS["arica"];
      factualAnswer = `### 🏜️ Driest Inhabited City & Place on Earth:

1. **Driest Inhabited City on Earth:**
   - **Arica, Chile:** Located along the edge of the Atacama Desert, Arica holds the record as the **driest permanently inhabited city on Earth**, with an average annual rainfall of just **0.76 mm** and historical stretches exceeding 14 years (173 consecutive months) without measurable rain.

2. **Driest Non-Polar Desert:**
   - **Atacama Desert (Chile):** Parts of the hyper-arid core are so devoid of moisture that NASA uses its soils as an analog for Mars exploration.

3. **Driest Place Overall (Uninhabited):**
   - **McMurdo Dry Valleys (Antarctica):** With near-zero humidity and fierce katabatic winds (up to 320 km/h), this polar desert has seen virtually no precipitation for roughly **2 million years**.`;
    } else {
      targetLocation = GLOBAL_LOCATIONS["atacama"];
      factualAnswer = `### 🏜️ Driest Regions on Earth:

1. **Driest Place on Earth (Polar):**
   - **McMurdo Dry Valleys (Antarctica):** The lowest-humidity and driest environment on Earth, essentially ice-free and rain-free for ~2 million years.

2. **Driest Non-Polar & Inhabited Region:**
   - **Atacama Desert & Arica (Chile):** Averaging under 1 mm of precipitation annually; **Arica** is the driest inhabited city globally.

3. **Hyper-Arid Eurasian Basins:**
   - **Dasht-e Kavir & Lut Desert (Iran):** Hyper-arid basins averaging under 25–50 mm of annual rainfall.`;
    }
  }

  // CASE B: Hottest Point
  else if (lower.includes("hottest") || lower.includes("warmest") || lower.includes("highest temp") || lower.includes("heat record")) {
    if (lower.includes("iran") || lower.includes("surface")) {
      targetLocation = GLOBAL_LOCATIONS["lut desert"];
      factualAnswer = `### 🌡️ Highest Land Surface & Regional Temperature Records:

1. **Satellite Land Surface Temperature (NASA MODIS):**
   - **Lut Desert (Gandom Beryan / Rig-e Yalan, Iran):** Radiometric measurements from NASA Aqua and Terra satellites recorded a land surface temperature of **80.8 °C (177.4 °F)**, tied for the hottest planetary crust reading observed.

2. **Standard Synoptic Air Temperature (WMO Shelter):**
   - **Ahvaz, Shush & Dehloran (SW Iran):** In June 2017, the official synoptic station in Ahvaz recorded **54.0 °C**, among the highest reliably measured air temperatures in Asia.`;
    } else {
      targetLocation = GLOBAL_LOCATIONS["death valley"];
      factualAnswer = `### 🌍 Hottest Locations on Earth:

1. **Death Valley (Furnace Creek, California, USA):** Holds the highest officially verified WMO shelter air temperature at **54.0–56.7 °C**.
2. **Lut Desert (Iran):** Holds the satellite-derived land surface skin temperature record at **80.8 °C** via NASA Aqua/Terra radiometers.
3. **Mitribah (Kuwait) & Basra (Iraq):** Frequently record extreme summer air temperatures up to **53.9 °C**.`;
    }
  }

  // CASE C: Coldest Point
  else if (lower.includes("coldest") || lower.includes("lowest temp") || lower.includes("freezing record")) {
    if (lower.includes("inhabited") || lower.includes("city") || lower.includes("village")) {
      targetLocation = GLOBAL_LOCATIONS["oymyakon"];
      factualAnswer = `### ❄️ Coldest Permanently Inhabited Place on Earth:

- **Oymyakon (Sakha Republic, Siberia, Russia):** Known as the coldest permanently inhabited settlement on Earth, recording an official **-67.7 °C (-90 °F)** in 1933, with January daily averages near **-50 °C**.`;
    } else {
      targetLocation = GLOBAL_LOCATIONS["vostok"];
      factualAnswer = `### ❄️ Coldest Places on Earth:

1. **Vostok Station (Antarctica):** Recorded the lowest natural surface air temperature ever observed on Earth at **-89.2 °C (-128.6 °F)** on July 21, 1983.
2. **Oymyakon (Siberia, Russia):** Coldest permanently inhabited settlement at **-67.7 °C**.`;
    }
  }

  // STEP 2: IF NOT A KNOWN CLIMATE EXTREME, CHECK EXACT CITY / LANDMARK TOKEN MATCH
  if (!targetLocation) {
    for (const [key, loc] of Object.entries(GLOBAL_LOCATIONS)) {
      if (matchesExactLocationName(text, key)) {
        targetLocation = loc;
        break;
      }
    }
  }

  // STEP 3: PATTERN EXTRACTION FOR EXPLICIT NAVIGATION COMMANDS
  if (!targetLocation) {
    const locationPatterns = [
      /(?:fly to|go to|zoom to|zoom in on|show|focus on|pan to|move to)\s+([a-z0-9\s,.-]+)/i,
      /where is\s+([a-z0-9\s,.-]+)/i
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].replace(/\b(on the map|map|city|country|region|zoom|please|model|layer|cloud|precip|wind|temp)\b/gi, "").trim();
        if (candidate.length >= 2) {
          targetLocation = await lookupLocationWorldwide(candidate);
          if (targetLocation) break;
        }
      }
    }
  }

  // Apply location zoom action if found
  if (targetLocation) {
    actions.push({
      name: "navigateToLocation",
      args: {
        latitude: targetLocation.lat,
        longitude: targetLocation.lon,
        locationName: `${targetLocation.name} (${targetLocation.country})`,
        zoomLevel: targetLocation.zoom || 8.5
      },
      summary: `Fly & zoom map to ${targetLocation.name} (${targetLocation.country})`
    });
    actionConfirmations.push(`🗺️ Centered and zoomed map to **${targetLocation.name} (${targetLocation.country})** at (${targetLocation.lat.toFixed(2)}°, ${targetLocation.lon.toFixed(2)}°).`);
  }

  // ----------------------------------------------------
  // STEP 4: WEATHER MODEL & LAYER INTENT PARSING
  // ----------------------------------------------------
  const isGFS = lower.includes("gfs");
  const isECMWF = lower.includes("ecmwf");
  const isICON = lower.includes("icon");
  const selectedSourceId = isGFS ? "gfs_025" : isECMWF ? "ecmwf_ifs" : isICON ? "icon_global" : "gfs_025";
  const selectedSourceName = isGFS ? "NOAA GFS 0.25°" : isECMWF ? "ECMWF IFS 0.1°" : isICON ? "DWD ICON" : "NOAA GFS 0.25°";

  if (lower.includes("temp") || lower.includes("temperature") || lower.includes("thermal") || lower.includes("heat")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "temp_2m", levelId: "2m", opacity: 85, paletteId: "thermal" },
      summary: `Activate ${selectedSourceName} 2m Temperature layer`
    });
    actionConfirmations.push(`🌡️ Enabled **${selectedSourceName}** 2-meter temperature layer.`);
  } else if (lower.includes("cloud")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "cloud_total", levelId: "column", opacity: 85, paletteId: "neutral" },
      summary: `Activate ${selectedSourceName} Total Cloud Cover layer`
    });
    actionConfirmations.push(`☁️ Enabled **${selectedSourceName}** total cloud cover layer.`);
  } else if (lower.includes("wind") || lower.includes("storm") || lower.includes("gust")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "wind_10m", levelId: "10m", opacity: 85, paletteId: "wind" },
      summary: `Activate ${selectedSourceName} 10m Wind Streamlines layer`
    });
    actionConfirmations.push(`💨 Enabled **${selectedSourceName}** wind vector & streamlines layer.`);
  } else if (lower.includes("precip") || lower.includes("rain")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "precip_total", levelId: "surface", opacity: 85, paletteId: "precipitation" },
      summary: `Activate ${selectedSourceName} Precipitation layer`
    });
    actionConfirmations.push(`🌧️ Enabled **${selectedSourceName}** precipitation intensity layer.`);
  }

  // ----------------------------------------------------
  // STEP 5: TIMELINE STEP PARSING
  // ----------------------------------------------------
  const dayMatch = lower.match(/day\s*(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+)/i);
  if (dayMatch && dayMatch[1]) {
    const dayStr = dayMatch[1].toLowerCase();
    let dayNum = 1;
    if (dayStr === "first" || dayStr === "1") dayNum = 1;
    else if (dayStr === "second" || dayStr === "2") dayNum = 2;
    else if (dayStr === "third" || dayStr === "3") dayNum = 3;
    else if (dayStr === "fourth" || dayStr === "4") dayNum = 4;
    else if (dayStr === "fifth" || dayStr === "5") dayNum = 5;
    else if (dayStr === "sixth" || dayStr === "6") dayNum = 6;
    else if (dayStr === "seventh" || dayStr === "7") dayNum = 7;
    else if (dayStr === "eighth" || dayStr === "8") dayNum = 8;
    else if (dayStr === "ninth" || dayStr === "9") dayNum = 9;
    else if (dayStr === "tenth" || dayStr === "10") dayNum = 10;
    else if (!isNaN(parseInt(dayStr, 10))) dayNum = parseInt(dayStr, 10);

    const targetHour = (dayNum - 1) * 24 + 12;
    actions.push({
      name: "setTimelineForecastHour",
      args: { hour: targetHour, autoPlay: false },
      summary: `Jump timeline to Day ${dayNum} (+${targetHour}h)`
    });
    actionConfirmations.push(`⏱️ Moved forecast timeline to **Day ${dayNum} (+${targetHour}h)**.`);
  }

  // Build final structured response
  let finalReply = "";
  if (factualAnswer) {
    finalReply += factualAnswer;
    if (actionConfirmations.length > 0) {
      finalReply += `\n\n---\n### ✅ Executed Workstation Actions:\n` + actionConfirmations.map(c => `- ${c}`).join("\n");
    }
  } else if (actionConfirmations.length > 0) {
    finalReply = `### ✅ Commands Executed on Workstation:\n` + actionConfirmations.map(c => `- ${c}`).join("\n");
  } else {
    finalReply = `Hello! I am the Alpha Meteo AI Agent.

You can ask global climate and meteorological questions while simultaneously issuing map navigation, layer, and forecast model commands:

🔹 **Sample Dual-Mode Commands:**
- *"Where is the driest inhabited city on Earth and zoom to it"*
- *"Enable the GFS temperature layer and fly to Tehran"*
- *"Activate GFS clouds and jump to Day 3"*`;
  }

  return {
    replyText: finalReply,
    actions,
    groundingSources: [
      { title: "World Meteorological Organization (WMO) Weather Extremes Archive", url: "https://wmo.int" },
      { title: "NASA Earth Observatory Climate Datasets", url: "https://earthobservatory.nasa.gov" },
      { title: "NOAA National Centers for Environmental Information", url: "https://ncei.noaa.gov" }
    ]
  };
}
