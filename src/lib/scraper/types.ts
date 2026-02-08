// ── Parsed XML shapes (what fast-xml-parser gives us) ──

export interface ParsedAllergen {
  "@_id": string;
  "#text": string;
}

export interface ParsedDietaryChoice {
  "@_id": string;
  "#text": string;
}

export interface ParsedRecipe {
  "@_id": string;
  "@_category": string;
  "@_description": string;
  "@_shortName": string;
  "@_nutrients": string;
  allergens?: { allergen: ParsedAllergen[] };
  dietaryChoices?: { dietaryChoice: ParsedDietaryChoice[] };
}

export interface ParsedMenu {
  "@_mealperiodname": string;
  "@_servedate": string;
  "@_location": string;
  "@_mealstarttime"?: string;
  "@_mealendtime"?: string;
  recipes: { recipe: ParsedRecipe[] };
}

export interface ParsedXml {
  EatecExchange: {
    menu: ParsedMenu[];
  };
}

// ── Clean output types ──

export interface ScrapedMenuItem {
  station: string;
  item_name: string;
  dietary_tags: string[];
  carbon_footprint: number | null;
}

export interface ScrapedMeal {
  meal: "brunch" | "dinner";
  startTime: string | null;
  endTime: string | null;
  items: ScrapedMenuItem[];
}

export interface ScrapedHallMenu {
  locationKey: string;
  slug: string;
  meals: ScrapedMeal[];
}
