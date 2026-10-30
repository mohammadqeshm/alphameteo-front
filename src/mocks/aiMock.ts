import { Coordinate, WeatherForecast } from "../types";

/**
 * Client-side deterministic Mock AI Analysis Generator for offline / demo mode.
 * Simulates a high-level synoptic meteorological assessment.
 */
export function generateMockAnalysis(coords: Coordinate, weather: WeatherForecast): string {
  const isHighElev = coords.elevation > 1500;
  return `[GFS INFERENCE MODEL 0.25° RESEARCH BRIEF]

1. BAROCLINIC PROFILE & TURBULENCE ASSESSMENT:
At coordinates ${coords.lat.toFixed(4)}°N, ${coords.lon.toFixed(4)}°E and elevation ${coords.elevation}m, the atmospheric column demonstrates stable geostrophic conditions with a surface pressure of ${weather.pressure} hPa. Ground-level boundary friction indicates a velocity of ${weather.windSpeed} m/s originating from a heading vector of ${weather.windDirection}°. ${isHighElev ? "Orographic barrier friction at this high altitude induces minor mountain turbulence wave formations in low-level flight sectors." : "Boundary-layer shear stresses are quiet, representing optimal conditions with negligible friction velocity."}

2. THERMODYNAMIC & MOISTURE GRADIENTS:
Relative humidity levels are stabilized at ${weather.humidity}%, with precipitable moisture accumulation estimates at ${weather.precipitation} mm. The active 2-meter air temperature is ${weather.temperature} °C, displaying a consistent diurnal trend aligned with the 00Z model run. Total cloud cover is ${weather.clouds}%, consisting primarily of stable stratified cloud bands at the mid-to-lower tropospheric interface.

3. CONVECTIVE TRIGGERS & REGIONAL FORECAST:
Thermodynamic stability is high across the sector with negligible Convective Available Potential Energy (CAPE) buildup. Wave friction heights of ${weather.waves}m are forecast in nearby marine tracks. Operators are advised to monitor upper isobaric charts for any minor jet stream instabilities or moisture convergence vectors in the evening steps.`;
}

/**
 * Client-side deterministic Mock AI Chat Simulator.
 * Provides fallback conversation when GEMINI_API_KEY is not configured or in offline demo mode.
 */
export function generateMockChatResponse(
  userMessage: string,
  coords: Coordinate,
  weather: WeatherForecast | null
): string {
  const msg = userMessage.toLowerCase();
  const isPersian = /[\u0600-\u06FF]/.test(userMessage);

  if (isPersian) {
    if (msg.includes("دما") || msg.includes("گرما") || msg.includes("سرما") || msg.includes("دمای")) {
      return `سلام همکار گرامی. بر اساس تحلیل مدل GFS 0.25° برای موقعیت جغرافیایی فعال شما (${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E):

۱. **تحلیل ترمودینامیکی**: دمای شبیه‌سازی شده در ارتفاع ۲ متری سطح زمین در حال حاضر برابر با **${weather?.temperature ?? 22} درجه سانتی‌گراد** است.
۲. **تغییرات روزانه (Diurnal)**: به دلیل ارتفاع منطقه (${coords.elevation} متر)، تغییرات دمایی تحت پدیده‌های سرمایش تابشی شبانه کوهستانی منظم است.
۳. **وضعیت رطوبتی**: با رطوبت نسبی ${weather?.humidity ?? 60}٪، نقطه شبنم در محدوده پایدار و غیرهمرفتی قرار دارد.

آیا تحلیل ترازهای باد یا فشار هوا در این نقطه را لازم دارید؟`;
    }

    if (msg.includes("باد") || msg.includes("طوفان") || msg.includes("وزش")) {
      return `تحلیل جریانات باد سینوپتیکی برای مختصات انتخاب شده شما:

۱. **سرعت و جهت**: باد در تراز استاندارد ۱۰ متری زمین با سرعت **${weather?.windSpeed ?? 5} متر بر ثانیه** و از جهت **${weather?.windDirection ?? 180} درجه** برآورد شده است.
۲. **گرادیان فشار**: فشار جوی در حدود **${weather?.pressure ?? 1013} هکتوپاسکال** است که گرادیان ملایمی در دشت‌های مجاور ایجاد می‌کند.
۳. **اثرات موج**: شبیه‌سازی امواج برای مناطق دریایی ارتفاع شاخص **${weather?.waves ?? 1.2} متر** را نشان می‌دهد.

با استفاده از منوی ترسیم در سمت چپ (GIS Tools) می‌توانید حوزه‌های تحت تأثیر باد شدید را به صورت دایره یا مستطیل علامت‌گذاری کنید.`;
    }

    if (msg.includes("باران") || msg.includes("بارش") || msg.includes("ابر") || msg.includes("بارندگی")) {
      return `ارزیابی پوشش ابر و پتانسیل بارش مدل GFS:

۱. **پوشش کلی ابر**: در حال حاضر پوشش ابر در این منطقه حدود **${weather?.clouds ?? 40}٪** تخمین زده می‌شود (بیشتر از نوع آلتوکومولوس میانی).
۲. **حجم بارش**: میزان تجمع بارندگی برابر با **${weather?.precipitation ?? 0} میلی‌متر** مدل‌سازی شده است که نشان‌دهنده هوایی پایدار در این گام زمانی است.
۳. **رطوبت نسبی جو**: این شاخص در مقدار **${weather?.humidity ?? 55}٪** قرار دارد که شرایط همگرایی مرطوب شدید را ایجاد نمی‌کند.

تغییرات ناگهانی دما در گام‌های زمانی بعدی را پایش کنید تا هرگونه روند صعودی همرفتی را شناسایی نمایید.`;
    }

    return `به ایستگاه هوش مصنوعی پیشرفته Alpha Meteo خوش آمدید. من دستیار سینوپتیک و پایش اتمسفر شما هستم.

در حال حاضر نقطه تمرکز شما روی نقشه دارای مشخصات زیر است:
- **مختصات جغرافیایی**: عرض ${coords.lat.toFixed(4)}° شمالی / طول ${coords.lon.toFixed(4)}° شرقی
- **ارتفاع از سطح دریا**: ${coords.elevation} متر
- **دمای اتمسفر (۲ متر)**: ${weather?.temperature ?? 15} درجه سانتی‌گراد
- **فشار اتمسفر**: ${weather?.pressure ?? 1013} hPa

کلیک روی نقاط مختلف نقشه فوراً داده‌های هواشناسی و ترازهای GFS را برای آن عرض و طول جغرافیایی شبیه‌سازی می‌کند. چه فاکتور هواشناسی دیگری را پایش کنیم؟`;
  } else {
    if (msg.includes("temp") || msg.includes("heat") || msg.includes("cold") || msg.includes("warm")) {
      return `Meteorological thermal assessment for your focused position (${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E):

1. **Surface Temperature**: Simulated at **${weather?.temperature ?? 20} °C** (2-meter level GFS estimation).
2. **Diurnal Cycle**: Expect moderate solar heating fluxes peaking in steps +12h to +18h, moderated by local elevation friction (${coords.elevation}m).
3. **Relative Humidity**: Current moisture saturation is at **${weather?.humidity ?? 60}%**, keeping dew points well below convective thresholds.

Would you like to analyze atmospheric soundings or isobaric wind contours for this coordinate?`;
    }

    if (msg.includes("wind") || msg.includes("storm") || msg.includes("gale") || msg.includes("gust")) {
      return `Atmospheric fluid dynamic and kinetic vector assessment:

1. **Velocity**: Calculated at **${weather?.windSpeed ?? 6} m/s** at a standard 10-meter measurement level.
2. **Heading Vector**: Aligning to a compass angle of **${weather?.windDirection ?? 240}°**.
3. **Baroclinic Shear**: The local sector exhibits stable geostrophic balance with minor wind shear, translating to a significant wave height estimate of **${weather?.waves ?? 1.5}m** in oceanic zones.

Utilize the Left Ruler tool to measure distance from the focused coordinates to regional pressure centers.`;
    }

    if (msg.includes("rain") || msg.includes("precip") || msg.includes("cloud") || msg.includes("snow")) {
      return `Atmospheric moisture and precipitation profiling:

1. **Total Precipitation**: Active GFS step models **${weather?.precipitation ?? 0} mm** of accumulated precipitation.
2. **Cloud Coverage**: Currently estimated at **${weather?.clouds ?? 50}%** cover, predominantly mid-altitude altocumulus.
3. **Saturation Index**: Relative Humidity is **${weather?.humidity ?? 55}%**, indicating moderate moisture convergence in the lower planetary boundary layer.

If low-level convergence combines with a fall in surface pressure, expect localized stratiform developments.`;
    }

    return `Welcome back, Meteorologist. This is Alpha Meteo's Clinical Intelligence Core.

Active GFS 0.25° Grid Coords:
- **Latitude**: ${coords.lat.toFixed(4)}° N
- **Longitude**: ${coords.lon.toFixed(4)}° E
- **Elevation**: ${coords.elevation} m
- **Surface Pressure**: ${weather?.pressure ?? 1013} hPa

You can click anywhere on the MapLibre viewport to update the live meteorological telemetry card, trigger a Clinical AI Atmospheric Briefing, or use the left toolbar to draw custom alert zones. How can I assist your analysis today?`;
  }
}
