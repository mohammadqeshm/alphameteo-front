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
  // Iran - Major Metropolises & Provincial Centers
  "مشهد": { lat: 36.2972, lon: 59.6067, name: "مشهد", country: "ایران", zoom: 9 },
  "mashhad": { lat: 36.2972, lon: 59.6067, name: "Mashhad", country: "Iran", zoom: 9 },
  "تهران": { lat: 35.6892, lon: 51.3890, name: "تهران", country: "ایران", zoom: 9 },
  "tehran": { lat: 35.6892, lon: 51.3890, name: "Tehran", country: "Iran", zoom: 9 },
  "شیراز": { lat: 29.5918, lon: 52.5837, name: "شیراز", country: "ایران", zoom: 9 },
  "shiraz": { lat: 29.5918, lon: 52.5837, name: "Shiraz", country: "Iran", zoom: 9 },
  "اصفهان": { lat: 32.6546, lon: 51.6680, name: "اصفهان", country: "ایران", zoom: 9 },
  "esfahan": { lat: 32.6546, lon: 51.6680, name: "Isfahan", country: "Iran", zoom: 9 },
  "isfahan": { lat: 32.6546, lon: 51.6680, name: "Isfahan", country: "Iran", zoom: 9 },
  "تبریز": { lat: 38.0962, lon: 46.2731, name: "تبریز", country: "ایران", zoom: 9 },
  "tabriz": { lat: 38.0962, lon: 46.2731, name: "Tabriz", country: "Iran", zoom: 9 },
  "اهواز": { lat: 31.3183, lon: 48.6706, name: "اهواز", country: "ایران", zoom: 9 },
  "ahvaz": { lat: 31.3183, lon: 48.6706, name: "Ahvaz", country: "Iran", zoom: 9 },
  "کیش": { lat: 26.5325, lon: 53.9840, name: "جزیره کیش", country: "ایران", zoom: 10 },
  "kish": { lat: 26.5325, lon: 53.9840, name: "Kish Island", country: "Iran", zoom: 10 },
  "قشم": { lat: 26.9585, lon: 56.2721, name: "جزیره قشم", country: "ایران", zoom: 10 },
  "بندرعباس": { lat: 27.1832, lon: 56.2666, name: "بندرعباس", country: "ایران", zoom: 9 },
  "رشت": { lat: 37.2809, lon: 49.5924, name: "رشت (گیلان)", country: "ایران", zoom: 9 },
  "ساری": { lat: 36.5659, lon: 53.0586, name: "ساری (مازندران)", country: "ایران", zoom: 9 },
  "گرگان": { lat: 36.8430, lon: 54.4374, name: "گرگان (گلستان)", country: "ایران", zoom: 9 },
  "ارومیه": { lat: 37.5527, lon: 45.0761, name: "ارومیه", country: "ایران", zoom: 9 },
  "اردبیل": { lat: 38.2498, lon: 48.2933, name: "اردبیل", country: "ایران", zoom: 9 },
  "کرمانشاه": { lat: 34.3277, lon: 47.0778, name: "کرمانشاه", country: "ایران", zoom: 9 },
  "سنندج": { lat: 35.3219, lon: 46.9862, name: "سنندج (کردستان)", country: "ایران", zoom: 9 },
  "همدان": { lat: 34.7983, lon: 48.5146, name: "همدان", country: "ایران", zoom: 9 },
  "زنجان": { lat: 36.6736, lon: 48.4787, name: "زنجان", country: "ایران", zoom: 9 },
  "قزوین": { lat: 36.2797, lon: 50.0049, name: "قزوین", country: "ایران", zoom: 9 },
  "کرج": { lat: 35.8327, lon: 50.9915, name: "کرج (البرز)", country: "ایران", zoom: 9 },
  "اراک": { lat: 34.0954, lon: 49.7013, name: "اراک (مرکزی)", country: "ایران", zoom: 9 },
  "قم": { lat: 34.6401, lon: 50.8764, name: "قم", country: "ایران", zoom: 9 },
  "خرم‌آباد": { lat: 33.4878, lon: 48.3558, name: "خرم‌آباد (لرستان)", country: "ایران", zoom: 9 },
  "خرم اباد": { lat: 33.4878, lon: 48.3558, name: "خرم‌آباد (لرستان)", country: "ایران", zoom: 9 },
  "ایلام": { lat: 33.6374, lon: 46.4227, name: "ایلام", country: "ایران", zoom: 9 },
  "شهرکرد": { lat: 32.3256, lon: 50.8644, name: "شهرکرد (چهارمحال)", country: "ایران", zoom: 9 },
  "یاسوج": { lat: 30.6684, lon: 51.5876, name: "یاسوج (کهگیلویه)", country: "ایران", zoom: 9 },
  "بوشهر": { lat: 28.9234, lon: 50.8203, name: "بوشهر", country: "ایران", zoom: 9 },
  "کرمان": { lat: 30.2839, lon: 57.0834, name: "کرمان", country: "ایران", zoom: 9 },
  "یزد": { lat: 31.8974, lon: 54.3569, name: "یزد", country: "ایران", zoom: 9 },
  "زاهدان": { lat: 29.4963, lon: 60.8629, name: "زاهدان (سیستان و بلوچستان)", country: "ایران", zoom: 9 },
  "چابهار": { lat: 25.2969, lon: 60.6430, name: "چابهار (دریای مکران)", country: "ایران", zoom: 9.5 },
  "سمنان": { lat: 35.5769, lon: 53.3970, name: "سمنان", country: "ایران", zoom: 9 },
  "بیرجند": { lat: 32.8663, lon: 59.2211, name: "بیرجند (خراسان جنوبی)", country: "ایران", zoom: 9 },
  "بجنورد": { lat: 37.4747, lon: 57.3290, name: "بجنورد (خراسان شمالی)", country: "ایران", zoom: 9 },
  "دهلران": { lat: 32.6941, lon: 47.2679, name: "دهلران (ایلام)", country: "ایران", zoom: 9 },
  "شوش": { lat: 32.1942, lon: 48.2436, name: "شوش (خوزستان)", country: "ایران", zoom: 9 },
  "دماوند": { lat: 35.7178, lon: 52.0650, name: "قله دماوند", country: "ایران", zoom: 11 },
  "کویر لوت": { lat: 30.5000, lon: 59.1000, name: "کویر لوت (گرم‌ترین سطح زمین)", country: "ایران", zoom: 8 },
  "گندم بریان": { lat: 31.1000, lon: 57.8000, name: "گندم بریان (کویر لوت)", country: "ایران", zoom: 9 },
  "دشت کویر": { lat: 34.5000, lon: 54.5000, name: "دشت کویر مرکزی", country: "ایران", zoom: 7.5 },
  "خلیج فارس": { lat: 26.5000, lon: 52.0000, name: "خلیج فارس", country: "منطقه دریایی", zoom: 6.5 },
  "دریای خزر": { lat: 39.5000, lon: 51.5000, name: "دریای خزر (کاسپین)", country: "منطقه دریایی", zoom: 6 },
  "دریای عمان": { lat: 24.5000, lon: 59.0000, name: "دریای عمان", country: "اقیانوس هند", zoom: 6.5 },

  // Climate Extremes & World Metropolises
  "آتاکاما": { lat: -24.5000, lon: -69.2500, name: "صحرای آتاکاما (خشک‌ترین بیابان غیرقطبی جهان)", country: "شیلی", zoom: 7.5 },
  "atacama": { lat: -24.5000, lon: -69.2500, name: "Atacama Desert", country: "Chile", zoom: 7.5 },
  "آریکا": { lat: -18.4783, lon: -70.3126, name: "شهر آریکا (خشک‌ترین شهر و منطقه مسکونی جهان)", country: "شیلی", zoom: 9 },
  "arica": { lat: -18.4783, lon: -70.3126, name: "Arica", country: "Chile", zoom: 9 },
  "دره های خشک مک موردو": { lat: -77.5000, lon: 162.5000, name: "دره‌های خشک مک‌موردو (خشک‌ترین و بی‌باران‌ترین نقطه زمین)", country: "جنوبگان", zoom: 6 },
  "مک موردو": { lat: -77.5000, lon: 162.5000, name: "دره‌های خشک مک‌موردو", country: "جنوبگان", zoom: 6 },
  "دره مرگ": { lat: 36.5323, lon: -116.9325, name: "دره مرگ (Furnace Creek, Death Valley)", country: "ایالات متحده", zoom: 8.5 },
  "death valley": { lat: 36.5323, lon: -116.9325, name: "Death Valley", country: "USA", zoom: 8.5 },
  "وستوک": { lat: -78.4644, lon: 106.8373, name: "ایستگاه وستوک (سردترین نقطه کره زمین)", country: "جنوبگان", zoom: 5 },
  "اویمیاکون": { lat: 63.4641, lon: 142.7737, name: "اویمیاکون (سردترین نقطه مسکونی کره زمین)", country: "روسیه (سیبری)", zoom: 8 },
  "لندن": { lat: 51.5074, lon: -0.1278, name: "لندن", country: "بریتانیا", zoom: 9 },
  "london": { lat: 51.5074, lon: -0.1278, name: "London", country: "UK", zoom: 9 },
  "پاریس": { lat: 48.8566, lon: 2.3522, name: "پاریس", country: "فرانسه", zoom: 9 },
  "paris": { lat: 48.8566, lon: 2.3522, name: "Paris", country: "France", zoom: 9 },
  "نیویورک": { lat: 40.7128, lon: -74.0060, name: "نیویورک", country: "ایالات متحده", zoom: 9 },
  "new york": { lat: 40.7128, lon: -74.0060, name: "New York", country: "USA", zoom: 9 },
  "واشنگتن": { lat: 38.9072, lon: -77.0369, name: "واشنگتن دی‌سی", country: "آمریکا", zoom: 9 },
  "لس آنجلس": { lat: 34.0522, lon: -118.2437, name: "لس آنجلس", country: "آمریکا", zoom: 9 },
  "توکیو": { lat: 35.6762, lon: 139.6503, name: "توکیو", country: "ژاپن", zoom: 9 },
  "tokyo": { lat: 35.6762, lon: 139.6503, name: "Tokyo", country: "Japan", zoom: 9 },
  "دبی": { lat: 25.2048, lon: 55.2708, name: "دبی", country: "امارات متحده عربی", zoom: 9 },
  "dubai": { lat: 25.2048, lon: 55.2708, name: "Dubai", country: "UAE", zoom: 9 },
  "ابوظبی": { lat: 24.4539, lon: 54.3773, name: "ابوظبی", country: "امارات", zoom: 9 },
  "دوحه": { lat: 25.2854, lon: 51.5310, name: "دوحه", country: "قطر", zoom: 9 },
  "ریاض": { lat: 24.7136, lon: 46.6753, name: "ریاض", country: "عربستان", zoom: 9 },
  "مکه": { lat: 21.3891, lon: 39.8579, name: "مکه مکرمه", country: "عربستان", zoom: 9.5 },
  "مدینه": { lat: 24.5247, lon: 39.5692, name: "مدینه منوره", country: "عربستان", zoom: 9.5 },
  "استانبول": { lat: 41.0082, lon: 28.9784, name: "استانبول", country: "ترکیه", zoom: 9 },
  "istanbul": { lat: 41.0082, lon: 28.9784, name: "Istanbul", country: "Turkey", zoom: 9 },
  "آنکارا": { lat: 39.9334, lon: 32.8597, name: "آنکارا", country: "ترکیه", zoom: 9 },
  "بغداد": { lat: 33.3152, lon: 44.3661, name: "بغداد", country: "عراق", zoom: 9 },
  "بصره": { lat: 30.5085, lon: 47.7804, name: "بصره", country: "عراق", zoom: 9 },
  "نجف": { lat: 31.9961, lon: 44.3298, name: "نجف اشرف", country: "عراق", zoom: 9 },
  "کربلا": { lat: 32.6160, lon: 44.0249, name: "کربلای معلی", country: "عراق", zoom: 9 },
  "مسکو": { lat: 55.7558, lon: 37.6173, name: "مسکو", country: "روسیه", zoom: 9 },
  "سیدنی": { lat: -33.8688, lon: 151.2093, name: "سیدنی", country: "استرالیا", zoom: 9 },
  "قاهره": { lat: 30.0444, lon: 31.2357, name: "قاهره", country: "مصر", zoom: 9 },
  "پکن": { lat: 39.9042, lon: 116.4074, name: "پکن", country: "چین", zoom: 9 },
  "شانگهای": { lat: 31.2304, lon: 121.4737, name: "شانگهای", country: "چین", zoom: 9 },
  "برلین": { lat: 52.5200, lon: 13.4050, name: "برلین", country: "آلمان", zoom: 9 },
  "رم": { lat: 41.9028, lon: 12.4964, name: "رم", country: "ایتالیا", zoom: 9 },
  "مادرید": { lat: 40.4168, lon: -3.7038, name: "مادرید", country: "اسپانیا", zoom: 9 },
  "آمستردام": { lat: 52.3676, lon: 4.9041, name: "آمستردام", country: "هلند", zoom: 9 },
  "قطب جنوب": { lat: -82.8628, lon: 135.0000, name: "قطب جنوب (ایستگاه وستوک)", country: "جنوبگان", zoom: 4 },
  "قطب شمال": { lat: 85.0000, lon: 0.0000, name: "اقیانوس منجمد شمالی", country: "قطب شمال", zoom: 4 },
};

// Safe word-boundary match helper to prevent partial substring collisions (e.g. preventing "مسکونی" matching "مسکو")
function matchesExactLocationName(text: string, locationKey: string): boolean {
  const cleanKey = locationKey.trim().toLowerCase();
  if (cleanKey.length < 2) return false;

  // For Latin characters
  if (/^[a-z0-9\s]+$/i.test(cleanKey)) {
    const regex = new RegExp(`(?:^|[\\s,،.?!-])${cleanKey}(?:$|[\\s,،.?!-])`, "i");
    return regex.test(text);
  }

  // For Persian/Arabic characters, match as discrete token or preceded/followed by punctuation/space
  const regex = new RegExp(`(?:^|[\\s,،.؟!؛:()«»"\\[\\]])${cleanKey}(?:$|[\\s,،.؟!؛:()«»"\\[\\]])`);
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

  // CASE A: Driest Inhabited City or Driest Place on Earth (آتاکاما / آریکا / مک‌موردو)
  if (lower.includes("خشک") || lower.includes("کم بارش") || lower.includes("بی باران") || lower.includes("کم‌باران") || lower.includes("driest")) {
    if (lower.includes("مسکونی") || lower.includes("شهر") || lower.includes("شهرها") || lower.includes("inhabited") || lower.includes("زندگی")) {
      targetLocation = GLOBAL_LOCATIONS["آریکا"];
      factualAnswer = `### 🏜️ خشک‌ترین نقطه و منطقه مسکونی در جهان:

۱. **خشک‌ترین شهر و منطقه مسکونی جهان:**
   - **شهر آریکا (Arica) در کشور شیلی:** شهر بندری آریکا در حاشیه صحرای آتاکاما به عنوان **خشک‌ترین شهر مسکونی روی کره زمین** ثبت شده است. میانگین بارش سالانه در این شهر تنها **۰.۷۶ میلی‌متر** است و در برهه‌هایی از تاریخ بیش از ۱۴ سال (۱۷۳ ماه متوالی) حتی یک قطره باران در آن نباریده است!

۲. **خشک‌ترین بیابان غیرقطبی جهان:**
   - **صحرای آتاکاما (Atacama Desert - شیلی):** بخش‌های مرکزی این صحرا آنچنان خشک و خالی از رطوبت هستند که دانشمندان ناسا خاک آن را برای شبیه‌سازی شرایط سیاره مریخ آزمایش می‌کنند. برخی ایستگاه‌های هواشناسی در این صحرا هرگز بارندگی ثبت نکرده‌اند.

۳. **خشک‌ترین نقطه کل کره زمین (بدون سکونت):**
   - **دره‌های خشک مک‌موردو (McMurdo Dry Valleys) در قاره جنوبگان:** با رطوبت نزدیک به صفر و بادهای کاتاباتیک شدید (تا ۳۲۰ کیلومتر در ساعت)، در این منطقه به مدت حدود **۲ میلیون سال** هیچ بارشی رخ نداده است.`;
    } else {
      targetLocation = GLOBAL_LOCATIONS["آتاکاما"];
      factualAnswer = `### 🏜️ خشک‌ترین مناطق کره زمین:

۱. **خشک‌ترین نقطه کره زمین (قطبی):**
   - **دره‌های خشک مک‌موردو (جنوبگان):** خشک‌ترین و کم‌رطوبت‌ترین منطقه روی زمین که بیش از ۲ میلیون سال است در آن بارشی رخ نداده است.

۲. **خشک‌ترین منطقه غیرقطبی و مسکونی جهان:**
   - **صحرای آتاکاما و شهر آریکا (شیلی):** با میانگین بارش سالانه کمتر از ۱ میلی‌متر در سال. شهر **آریکا (Arica)** در شیلی کم‌باران‌ترین نقطه مسکونی زمین به شمار می‌آید.

۳. **خشک‌ترین مناطق ایران:**
   - **دشت کویر و کویر لوت:** با میانگین بارش کمتر از ۲۵ تا ۵۰ میلی‌متر در سال، خشک‌ترین اقلیم‌های فلات ایران هستند.`;
    }
  }

  // CASE B: Hottest Point in Iran or World (کویر لوت / اهواز / دره مرگ)
  else if (lower.includes("گرمترین") || lower.includes("گرم‌ترین") || lower.includes("داغ‌ترین") || lower.includes("بیشترین دما") || lower.includes("hottest")) {
    if (lower.includes("ایران") || lower.includes("کشور")) {
      targetLocation = GLOBAL_LOCATIONS["کویر لوت"];
      factualAnswer = `### 🌡️ گرم‌ترین نقطه ایران و بیشترین دمای ثبت‌شده:

۱. **رکورد دمای سطح زمین (ماهواره‌ای ناسا):**
   - **کویر لوت (گندم‌بریان و ریگ یلان):** بر اساس سنجش رادیومتری ماهواره‌های Aqua و Terra ناسا، دمای تابشی سطح زمین در کویر لوت به **۸۰.۸ درجه سانتی‌گراد (۱۷۷.۴°F)** رسید که داغ‌ترین رکورد پوسته زمین در کل کره خاکی است.

۲. **رکورد دمای هوای ایستگاهی (دماسنج سینوپتیک استاندارد):**
   - **اهواز و شوش (خوزستان) و دهلران (ایلام):** در تیرماه ۱۳۹۶ (ژوئن ۲۰۱۷)، ایستگاه هواشناسی رسمی اهواز دمای **۵۴.۰ درجه سانتی‌گراد** را ثبت کرد که بالاترین دمای رسمی ثبت‌شده هوا در تاریخ ایران و آسیا است.`;
    } else {
      targetLocation = GLOBAL_LOCATIONS["دره مرگ"];
      factualAnswer = `### 🌍 داغ‌ترین نقاط جهان:

۱. **دره مرگ (Furnace Creek, Death Valley - کالیفرنیا، آمریکا):** دارای بالاترین دمای ثبت‌شده هوای دماسنجی استاندارد با **۵۴.۰ تا ۵۶.۷ درجه سانتی‌گراد**.
۲. **کویر لوت (ایران):** با ثبت دمای سطحی **۸۰.۸ درجه سانتی‌گراد** توسط ماهواره‌های ناسا، داغ‌ترین پوسته خاکی سیاره زمین است.
۳. **مطربه (کویت) و بصره (عراق):** با دمای ۵۳.۹ درجه سانتی‌گراد از داغ‌ترین شهرهای مسکونی جهان محسوب می‌شوند.`;
    }
  }

  // CASE C: Coldest Point in Iran or World (وستوک / اویمیاکون / سقز / اردبیل)
  else if (lower.includes("سردترین") || lower.includes("خنک‌ترین") || lower.includes("کمترین دما") || lower.includes("coldest")) {
    if (lower.includes("مسکونی") || lower.includes("شهر")) {
      targetLocation = GLOBAL_LOCATIONS["اویمیاکون"];
      factualAnswer = `### ❄️ سردترین نقطه مسکونی جهان:

- **روستای اویمیاکون (Oymyakon) در سیبری روسیه:** به عنوان سردترین مکان مسکونی دائم روی زمین شناخته می‌شود که دمای رسمی **۶۷.۷- درجه سانتی‌گراد (۹۰- درجه فارنهایت)** را در سال ۱۹۳۳ به ثبت رساند. میانگین دمای ماه ژانویه در این منطقه حدود ۵۰- درجه سانتی‌گراد است.`;
    } else {
      targetLocation = GLOBAL_LOCATIONS["وستوک"];
      factualAnswer = `### ❄️ سردترین نقاط کره زمین:

۱. **ایستگاه وستوک (Vostok Station - جنوبگان):** سردترین دمای ثبت‌شده طبیعی بر روی کره زمین به میزان **۸۹.۲- درجه سانتی‌گراد (۱۲۸.۶- درجه فارنهایت)** در ۲۱ ژوئیه ۱۹۸۳ در این ایستگاه ثبت شد.
۲. **اویمیاکون (سیبری، روسیه):** با ۶۷.۷- درجه سانتی‌گراد سردترین نقطه مسکونی جهان است.`;
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
      /(?:برو|زوم کن|ببر|برو به|بریم|انتقال بده|حرکت کن|نمایش بده|نشون بده|fly to|go to|zoom to|show)\s+(?:به|روی|رو|سمت)?\s*([\u0600-\u06FF\w\s]+)/i,
      /([\u0600-\u06FF\w\s]+)\s+(?:رو بیار|رو نشون بده|رو زوم کن|کجاست)/i
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].replace(/رو|روی|نقشه|شهر|کشور|منطقه|زوم|لطفا|مدل|لایه|ابر|بارش|باد|دما|گرمترین|خشکترین|نقطه/g, "").trim();
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
      summary: `انتقال و زوم نقشه به ${targetLocation.name} (${targetLocation.country})`
    });
    actionConfirmations.push(`🗺️ با موفقیت بر روی **${targetLocation.name} (${targetLocation.country})** در مختصات (${targetLocation.lat.toFixed(2)}°, ${targetLocation.lon.toFixed(2)}°) زوم شد.`);
  }

  // ----------------------------------------------------
  // STEP 4: WEATHER MODEL & LAYER INTENT PARSING
  // ----------------------------------------------------
  const isGFS = lower.includes("gfs") || lower.includes("جی اف اس");
  const isECMWF = lower.includes("ecmwf") || lower.includes("ای سی ام");
  const isICON = lower.includes("icon") || lower.includes("آیکون");
  const selectedSourceId = isGFS ? "gfs_025" : isECMWF ? "ecmwf_ifs" : isICON ? "icon_global" : "gfs_025";
  const selectedSourceName = isGFS ? "NOAA GFS 0.25°" : isECMWF ? "ECMWF IFS 0.1°" : isICON ? "DWD ICON" : "NOAA GFS 0.25°";

  if (lower.includes("دما") || lower.includes("temperature") || lower.includes("حرارت") || lower.includes("گرما")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "temp_2m", levelId: "2m", opacity: 85, paletteId: "thermal" },
      summary: `فعال‌سازی لایه دمای ۲ متری مدل ${selectedSourceName}`
    });
    actionConfirmations.push(`🌡️ لایه دمای ۲ متری مدل **${selectedSourceName}** فعال گردید.`);
  } else if (lower.includes("ابر") || lower.includes("cloud") || lower.includes("ابری")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "cloud_total", levelId: "column", opacity: 85, paletteId: "neutral" },
      summary: `فعال‌سازی لایه پوشش ابر مدل ${selectedSourceName}`
    });
    actionConfirmations.push(`☁️ لایه پوشش کلی ابر از مدل **${selectedSourceName}** فعال شد.`);
  } else if (lower.includes("باد") || lower.includes("wind") || lower.includes("توفان")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "wind_10m", levelId: "10m", opacity: 85, paletteId: "wind" },
      summary: `فعال‌سازی لایه بردار و جریان باد مدل ${selectedSourceName}`
    });
    actionConfirmations.push(`💨 لایه خطوط جریان و سرعت باد از مدل **${selectedSourceName}** فعال گردید.`);
  } else if (lower.includes("بارش") || lower.includes("باران") || lower.includes("precipitation") || lower.includes("rain")) {
    actions.push({
      name: "configureCatalogLayer",
      args: { sourceId: selectedSourceId, variableId: "precip_total", levelId: "surface", opacity: 85, paletteId: "precipitation" },
      summary: `فعال‌سازی لایه بارش مدل ${selectedSourceName}`
    });
    actionConfirmations.push(`🌧️ لایه شدت بارندگی از مدل **${selectedSourceName}** بر روی نقشه فعال شد.`);
  }

  // ----------------------------------------------------
  // STEP 5: TIMELINE STEP PARSING
  // ----------------------------------------------------
  const dayMatch = text.match(/روز\s*(اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم|۱|۲|۳|۴|۵|۶|۷|۸|۹|۱۰|\d+)/);
  if (dayMatch && dayMatch[1]) {
    const dayStr = dayMatch[1];
    let dayNum = 1;
    if (dayStr === "اول" || dayStr === "1" || dayStr === "۱") dayNum = 1;
    else if (dayStr === "دوم" || dayStr === "2" || dayStr === "۲") dayNum = 2;
    else if (dayStr === "سوم" || dayStr === "3" || dayStr === "۳") dayNum = 3;
    else if (dayStr === "چهارم" || dayStr === "4" || dayStr === "۴") dayNum = 4;
    else if (dayStr === "پنجم" || dayStr === "5" || dayStr === "۵") dayNum = 5;
    else if (dayStr === "ششم" || dayStr === "6" || dayStr === "۶") dayNum = 6;
    else if (dayStr === "هفتم" || dayStr === "7" || dayStr === "۷") dayNum = 7;
    else if (!isNaN(parseInt(dayStr))) dayNum = parseInt(dayStr);

    const targetHour = (dayNum - 1) * 24 + 12;
    actions.push({
      name: "setTimelineForecastHour",
      args: { hour: targetHour, autoPlay: false },
      summary: `انتقال تایم‌لاین به پیش‌بینی روز ${dayStr} (+${targetHour}h)`
    });
    actionConfirmations.push(`⏱️ نوار زمانی به **روز ${dayStr} (+${targetHour} ساعت)** منتقل شد.`);
  }

  // Build final structured response
  let finalReply = "";
  if (factualAnswer) {
    finalReply += factualAnswer;
    if (actionConfirmations.length > 0) {
      finalReply += `\n\n---\n### ✅ اقدامات اجراشده روی سامانه:\n` + actionConfirmations.map(c => `- ${c}`).join("\n");
    }
  } else if (actionConfirmations.length > 0) {
    finalReply = `### ✅ فرامین روی سامانه اجرا شدند:\n` + actionConfirmations.map(c => `- ${c}`).join("\n");
  } else {
    finalReply = `سلام! من دستیار هوشمند Alpha Meteo هستم.

می‌توانید هم سوالات اقلیمی و علمی جهان را بپرسید و هم فرامین زوم روی مناطق، تغییر لایه‌ها و مدل‌های پیش‌بینی را همزمان صادر فرمایید:

🔹 **نمونه سوالات و فرامین همزمان:**
- *"خشک‌ترین شهر مسکونی جهان کجاست و زوم کن روی اونجا"*
- *"گرم‌ترین نقطه ایران کجاست و ببر روی نقشه"*
- *"مدل GFS لایه ابر رو فعال کن و برو روز سوم"*`;
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
