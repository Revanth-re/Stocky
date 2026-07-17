import "server-only";

/**
 * Free weather signal for forecasting — Open-Meteo requires no API key
 * (unlike OpenWeatherMap etc.), so this works out of the box with zero
 * extra credentials. Used to nudge demand predictions for weather-sensitive
 * products (cold drinks on hot days, umbrellas/raincoats on rainy days).
 */

const WEATHER_CODE_LABEL: Record<number, string> = {
  0: "clear sky",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "foggy",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "rain showers",
  81: "rain showers",
  82: "violent rain showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "thunderstorm with hail",
};

type GeocodeResult = { latitude: number; longitude: number; name: string };

async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  try {
    const params = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
      next: { revalidate: 60 * 60 * 24 }, // city coordinates don't change — cache a day
    });
    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.results?.[0];
    if (!first) return null;
    return { latitude: first.latitude, longitude: first.longitude, name: first.name };
  } catch (error) {
    console.error("[weather] geocoding failed:", error);
    return null;
  }
}

export type WeatherOutlookDay = { date: string; maxTempC: number; minTempC: number; rainChancePct: number; condition: string };

/**
 * Returns a 7-day outlook for a city, or `null` if the city can't be
 * geocoded / the weather API is unreachable — callers should treat weather
 * as optional enrichment, never a hard dependency.
 */
export async function getWeatherOutlook(city: string): Promise<WeatherOutlookDay[] | null> {
  if (!city?.trim()) return null;

  const location = await geocodeCity(city);
  if (!location) return null;

  try {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode",
      timezone: "auto",
      forecast_days: "7",
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 60 * 60 * 3 }, // refresh every 3 hours
    });
    if (!res.ok) return null;
    const json = await res.json();
    const daily = json?.daily;
    if (!daily?.time) return null;

    return daily.time.map((date: string, i: number) => ({
      date,
      maxTempC: daily.temperature_2m_max[i],
      minTempC: daily.temperature_2m_min[i],
      rainChancePct: daily.precipitation_probability_max[i] ?? 0,
      condition: WEATHER_CODE_LABEL[daily.weathercode[i]] ?? "unknown",
    }));
  } catch (error) {
    console.error("[weather] forecast fetch failed:", error);
    return null;
  }
}

/** Collapses a 7-day outlook into one plain-language sentence for the AI prompt. */
export function summarizeWeatherOutlook(outlook: WeatherOutlookDay[] | null): string {
  if (!outlook || outlook.length === 0) return "Weather data unavailable — do not factor weather into this prediction.";

  const avgMax = Math.round(outlook.reduce((sum, d) => sum + d.maxTempC, 0) / outlook.length);
  const rainyDays = outlook.filter((d) => d.rainChancePct >= 50).length;
  const conditions = [...new Set(outlook.map((d) => d.condition))].join(", ");

  return `Next 7 days: average high ${avgMax}°C, conditions mostly ${conditions}, ${rainyDays} of 7 days with significant rain chance (≥50%).`;
}
