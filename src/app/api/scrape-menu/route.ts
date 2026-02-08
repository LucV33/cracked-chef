import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { scrapeAllHalls } from "@/lib/scraper/xml-parser";
import type { ScrapedHallMenu, ScrapedMeal } from "@/lib/scraper/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron or carries the correct secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  const date = dateParam ?? new Date().toISOString().slice(0, 10);

  let supabase;
  try {
    supabase = getServerSupabase();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Supabase service role key not configured" },
      { status: 500 }
    );
  }

  // Scrape all halls
  const halls: ScrapedHallMenu[] = await scrapeAllHalls(date);

  // Look up hall UUIDs by slug
  const { data: hallRows, error: hallError } = await supabase
    .from("dining_halls")
    .select("id, slug");

  if (hallError || !hallRows) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch dining halls" },
      { status: 500 }
    );
  }

  const slugToId = new Map(hallRows.map((h) => [h.slug, h.id as string]));

  let totalMenuItems = 0;
  let totalDailyMenus = 0;

  for (const hall of halls) {
    const hallId = slugToId.get(hall.slug);
    if (!hallId) continue;

    for (const meal of hall.meals) {
      // ── menu_items: delete + insert (fresh data each scrape) ──
      await supabase
        .from("menu_items")
        .delete()
        .eq("dining_hall_id", hallId)
        .eq("date", date)
        .eq("meal", meal.meal);

      const rows = meal.items.map((item) => ({
        dining_hall_id: hallId,
        date,
        meal: meal.meal,
        station: item.station,
        item_name: item.item_name,
        dietary_tags: item.dietary_tags,
        carbon_footprint: item.carbon_footprint,
      }));

      const { error: insertErr } = await supabase
        .from("menu_items")
        .insert(rows);

      if (!insertErr) totalMenuItems += rows.length;

      // ── daily_menus: upsert (UI reads from this JSONB) ──
      const menuItems = meal.items.map((item, i) => ({
        id: `scraped-${i}`,
        name: item.item_name,
        station: item.station,
        is_star: false,
        dietary_tags: item.dietary_tags,
        carbon_footprint: item.carbon_footprint,
      }));

      await upsertDailyMenu(supabase, hallId, date, meal, menuItems);
      totalDailyMenus++;
    }
  }

  return NextResponse.json({
    ok: true,
    date,
    halls_scraped: halls.length,
    menu_items_inserted: totalMenuItems,
    daily_menus_upserted: totalDailyMenus,
  });
}

async function upsertDailyMenu(
  supabase: ReturnType<typeof getServerSupabase>,
  hallId: string,
  date: string,
  meal: ScrapedMeal,
  items: {
    id: string;
    name: string;
    station: string;
    is_star: boolean;
    dietary_tags: string[];
    carbon_footprint: number | null;
  }[]
) {
  // Try update first (matching unique constraint)
  const { data: existing } = await supabase
    .from("daily_menus")
    .select("id")
    .eq("dining_hall_id", hallId)
    .eq("date", date)
    .eq("meal_period", meal.meal)
    .limit(1);

  const timeFields = {
    meal_start_time: meal.startTime ?? null,
    meal_end_time: meal.endTime ?? null,
  };

  if (existing && existing.length > 0) {
    await supabase
      .from("daily_menus")
      .update({ items, ...timeFields })
      .eq("id", existing[0].id);
  } else {
    await supabase.from("daily_menus").insert({
      dining_hall_id: hallId,
      date,
      meal_period: meal.meal,
      items,
      ...timeFields,
    });
  }
}
