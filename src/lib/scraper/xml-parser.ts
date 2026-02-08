import { XMLParser } from "fast-xml-parser";
import {
  ParsedXml,
  ParsedMenu,
  ParsedRecipe,
  ScrapedHallMenu,
  ScrapedMeal,
  ScrapedMenuItem,
} from "./types";
import {
  LOCATIONS,
  buildXmlUrl,
  parseMealPeriod,
  normalizeStation,
} from "./constants";

// ── XML parser setup ──

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (_name, jpath) => {
    // Ensure these are always arrays even when there's only one element
    return (
      jpath === "EatecExchange.menu" ||
      jpath === "EatecExchange.menu.recipes.recipe" ||
      jpath === "EatecExchange.menu.recipes.recipe.allergens.allergen" ||
      jpath === "EatecExchange.menu.recipes.recipe.dietaryChoices.dietaryChoice"
    );
  },
});

// ── Helpers ──

function extractDietaryTags(recipe: ParsedRecipe): string[] {
  const tags: string[] = [];

  if (recipe.allergens?.allergen) {
    for (const a of recipe.allergens.allergen) {
      if (a["#text"] === "Yes") {
        tags.push(a["@_id"].toLowerCase());
      }
    }
  }

  if (recipe.dietaryChoices?.dietaryChoice) {
    for (const dc of recipe.dietaryChoices.dietaryChoice) {
      if (dc["#text"] === "Yes") {
        // "Vegan Option" → "vegan"
        tags.push(dc["@_id"].toLowerCase().replace(" option", ""));
      }
    }
  }

  return tags;
}

function extractCarbonFootprint(recipe: ParsedRecipe): number | null {
  const nutrients = recipe["@_nutrients"];
  if (!nutrients) return null;
  const parts = nutrients.split("|");
  // Carbon Footprint is the 20th value (index 19)
  const raw = parts[19]?.trim();
  if (!raw) return null;
  const num = parseFloat(raw);
  return isNaN(num) ? null : num;
}

function parseRecipe(recipe: ParsedRecipe): ScrapedMenuItem {
  return {
    station: normalizeStation(recipe["@_category"]),
    item_name: recipe["@_description"],
    dietary_tags: extractDietaryTags(recipe),
    carbon_footprint: extractCarbonFootprint(recipe),
  };
}

// ── Public API ──

export async function fetchHallXml(
  locationKey: string,
  date: string
): Promise<ParsedXml | null> {
  const url = buildXmlUrl(locationKey, date);
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  return parser.parse(text) as ParsedXml;
}

export function parseHallXml(
  xml: ParsedXml,
  locationKey: string,
  slug: string
): ScrapedHallMenu {
  const meals: ScrapedMeal[] = [];
  const menus: ParsedMenu[] = xml.EatecExchange?.menu ?? [];

  for (const menu of menus) {
    const meal = parseMealPeriod(menu["@_mealperiodname"]);
    if (!meal) continue;

    const startTime = menu["@_mealstarttime"] ?? null;
    const endTime = menu["@_mealendtime"] ?? null;

    const recipes: ParsedRecipe[] = menu.recipes?.recipe ?? [];
    const items = recipes.map(parseRecipe);

    if (items.length > 0) {
      meals.push({ meal, startTime, endTime, items });
    }
  }

  return { locationKey, slug, meals };
}

export async function scrapeAllHalls(
  date: string
): Promise<ScrapedHallMenu[]> {
  const results = await Promise.allSettled(
    LOCATIONS.map(async ({ urlKey, slug }) => {
      const xml = await fetchHallXml(urlKey, date);
      if (!xml) return null;
      return parseHallXml(xml, urlKey, slug);
    })
  );

  const halls: ScrapedHallMenu[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      halls.push(r.value);
    }
  }
  return halls;
}
