export interface LocationConfig {
  urlKey: string;
  slug: string;
}

export const LOCATIONS: LocationConfig[] = [
  { urlKey: "Cafe_3", slug: "cafe-3" },
  { urlKey: "Clark_Kerr_Campus", slug: "clark-kerr" },
  { urlKey: "Crossroads", slug: "crossroads" },
  { urlKey: "Foothill", slug: "foothill" },
];

const BASE_URL =
  "https://dining.berkeley.edu/wp-content/uploads/menus-exportimport";

export function buildXmlUrl(locationKey: string, date: string): string {
  // date is YYYY-MM-DD, URL needs YYYYMMDD
  const compact = date.replace(/-/g, "");
  return `${BASE_URL}/${locationKey}_${compact}.xml`;
}

export function parseMealPeriod(
  mealPeriodName: string
): "brunch" | "dinner" | null {
  const lower = mealPeriodName.toLowerCase();
  if (lower.includes("brunch")) return "brunch";
  if (lower.includes("dinner")) return "dinner";
  return null;
}

// The XML sometimes uses a date string (e.g. "Saturday Feb 7, 2026") as
// the recipe category instead of a real station name. Detect and replace.
const DATE_LIKE = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s/i;

export function normalizeStation(raw: string): string {
  if (DATE_LIKE.test(raw)) return "General";
  return raw;
}
