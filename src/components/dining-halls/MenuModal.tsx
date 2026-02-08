"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiningHallWithMenu, MenuItemRecord, DailyMenu, DiningHallHours, ItemMaster } from "@/lib/types";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";
import { mockDiningHallHours, mockItemMaster, mockItemRatings, mockPosts } from "@/lib/mock-data";
import GpaRating from "./GpaRating";

// ── Food emoji mapping ──

const FOOD_EMOJI_MAP: [RegExp, string][] = [
  [/chicken/i, "🍗"],
  [/beef|steak/i, "🥩"],
  [/pork|bacon|ham/i, "🥓"],
  [/fish|salmon|tuna|cod/i, "🐟"],
  [/shrimp|prawn/i, "🦐"],
  [/rice/i, "🍚"],
  [/pasta|noodle|spaghetti|penne|linguine/i, "🍝"],
  [/pizza/i, "🍕"],
  [/burger|hamburger/i, "🍔"],
  [/taco/i, "🌮"],
  [/burrito|wrap/i, "🌯"],
  [/soup|chowder|bisque|stew/i, "🍲"],
  [/salad|slaw/i, "🥗"],
  [/sandwich|sub|hoagie/i, "🥪"],
  [/bread|roll|baguette|toast|cornbread/i, "🍞"],
  [/cake|brownie|cookie|muffin|cupcake|pastry/i, "🍰"],
  [/pie/i, "🥧"],
  [/ice cream|gelato|sorbet/i, "🍦"],
  [/egg|omelet|frittata/i, "🥚"],
  [/pancake|waffle|french toast|crepe/i, "🥞"],
  [/sushi|roll/i, "🍣"],
  [/curry|tikka|masala/i, "🍛"],
  [/fries|potato|tot/i, "🍟"],
  [/corn/i, "🌽"],
  [/broccoli/i, "🥦"],
  [/carrot/i, "🥕"],
  [/pepper/i, "🌶️"],
  [/mushroom|risotto/i, "🍄"],
  [/apple/i, "🍎"],
  [/orange/i, "🍊"],
  [/banana/i, "🍌"],
  [/berry|strawberry|blueberry/i, "🫐"],
  [/tofu|tempeh/i, "🧈"],
  [/cheese|mac/i, "🧀"],
  [/coffee|espresso/i, "☕"],
  [/tea/i, "🍵"],
  [/juice|smoothie/i, "🧃"],
];

function getFoodEmoji(name: string): string {
  for (const [pattern, emoji] of FOOD_EMOJI_MAP) {
    if (pattern.test(name)) return emoji;
  }
  return "🍽️";
}

// ── Time helpers ──

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
}

// ── Meal section ordering ──

interface MealSection {
  mealPeriod: string;
  startTime: string | null;
  endTime: string | null;
  items: EnrichedMenuItem[];
  isNowServing: boolean;
}

interface EnrichedMenuItem extends MenuItemRecord {
  item_master?: ItemMaster;
  avg_rating: number;
  review_count: number;
}

function buildMealSections(
  menuItems: MenuItemRecord[],
  dailyMenus: DailyMenu[],
  hours: DiningHallHours[],
  itemMasterMap: Record<string, ItemMaster>,
  ratingsMap: Record<string, { avg_rating: number; review_count: number }>
): MealSection[] {
  // Group items by meal
  const mealMap = new Map<string, EnrichedMenuItem[]>();

  if (menuItems.length > 0) {
    // Primary path: use rich menu_items data
    for (const item of menuItems) {
      const key = item.meal;
      const enriched: EnrichedMenuItem = {
        ...item,
        item_master: item.item_master_id ? itemMasterMap[item.item_master_id] : undefined,
        avg_rating: item.item_master_id ? (ratingsMap[item.item_master_id]?.avg_rating || 0) : 0,
        review_count: item.item_master_id ? (ratingsMap[item.item_master_id]?.review_count || 0) : 0,
      };
      if (!mealMap.has(key)) mealMap.set(key, []);
      mealMap.get(key)!.push(enriched);
    }
  } else {
    // Fallback: convert daily_menus JSONB items → MenuItemRecord shape
    for (const dm of dailyMenus) {
      const converted: EnrichedMenuItem[] = dm.items.map((item, i) => ({
        id: `${dm.id}-${i}`,
        dining_hall_id: dm.dining_hall_id,
        date: dm.date,
        meal: dm.meal_period as "brunch" | "dinner",
        station: item.station,
        item_name: item.name,
        dietary_tags: item.dietary_tags ?? [],
        carbon_footprint: item.carbon_footprint ?? null,
        created_at: "",
        item_master_id: item.item_master_id,
        item_master: item.item_master_id ? itemMasterMap[item.item_master_id] : undefined,
        avg_rating: item.item_master_id ? (ratingsMap[item.item_master_id]?.avg_rating || 0) : 0,
        review_count: item.item_master_id ? (ratingsMap[item.item_master_id]?.review_count || 0) : 0,
      }));
      mealMap.set(dm.meal_period, converted);
    }
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Build sections with time info from hours
  const sections: MealSection[] = [];
  for (const [meal, items] of mealMap) {
    // Try to get hours from the hours array
    const hoursEntry = hours.find((h) => h.meal_period.toLowerCase() === meal.toLowerCase());
    const startTime = hoursEntry?.start_time ?? null;
    const endTime = hoursEntry?.end_time ?? null;

    let isNowServing = false;
    if (startTime && endTime) {
      const startMin = timeToMinutes(startTime);
      const endMin = timeToMinutes(endTime);
      isNowServing = nowMinutes >= startMin && nowMinutes <= endMin;
    }

    sections.push({ mealPeriod: meal, startTime, endTime, items, isNowServing });
  }

  // Sort: now-serving first, then by start time (upcoming before past)
  sections.sort((a, b) => {
    if (a.isNowServing && !b.isNowServing) return -1;
    if (!a.isNowServing && b.isNowServing) return 1;

    // Both serving or both not: compare start times
    if (a.startTime && b.startTime) {
      const aStart = timeToMinutes(a.startTime);
      const bStart = timeToMinutes(b.startTime);
      // Upcoming meals (start >= now) before past
      const aUpcoming = aStart >= nowMinutes;
      const bUpcoming = bStart >= nowMinutes;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      return aStart - bStart;
    }
    return 0;
  });

  return sections;
}

// ── Station grouping ──

interface StationGroup {
  station: string;
  items: EnrichedMenuItem[];
}

function groupByStation(items: EnrichedMenuItem[]): StationGroup[] {
  const map = new Map<string, EnrichedMenuItem[]>();
  for (const item of items) {
    if (!map.has(item.station)) map.set(item.station, []);
    map.get(item.station)!.push(item);
  }
  return Array.from(map, ([station, items]) => ({ station, items }));
}

// ── Component ──

interface MenuModalProps {
  hall: DiningHallWithMenu;
  menuItems: MenuItemRecord[];
  dailyMenus: DailyMenu[];
  loading: boolean;
  onClose: () => void;
}

export default function MenuModal({
  hall,
  menuItems,
  dailyMenus,
  loading,
  onClose,
}: MenuModalProps) {
  const router = useRouter();
  const [hours, setHours] = useState<DiningHallHours[]>([]);
  const [itemMasterMap, setItemMasterMap] = useState<Record<string, ItemMaster>>({});
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg_rating: number; review_count: number }>>({});

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Load hours and item master data
  useEffect(() => {
    async function loadData() {
      const today = new Date().toISOString().slice(0, 10);

      if (isSupabaseConfigured()) {
        const supabase = getSupabase()!;

        // Fetch hours
        const { data: hoursData } = await supabase
          .from("dining_hall_hours")
          .select("*")
          .eq("dining_hall_id", hall.id)
          .eq("date", today);

        if (hoursData) setHours(hoursData);

        // Fetch item_master for all items
        const itemMasterIds = menuItems
          .map((mi) => mi.item_master_id)
          .filter((id): id is string => !!id);

        if (itemMasterIds.length > 0) {
          const { data: itemMasterData } = await supabase
            .from("item_master")
            .select("*")
            .in("id", itemMasterIds);

          if (itemMasterData) {
            const map: Record<string, ItemMaster> = {};
            for (const item of itemMasterData) {
              map[item.id] = item;
            }
            setItemMasterMap(map);
          }

          // Fetch ratings for these items
          const { data: postsData } = await supabase
            .from("posts")
            .select("item_master_id, rating")
            .eq("type", "review")
            .in("item_master_id", itemMasterIds)
            .not("rating", "is", null);

          if (postsData) {
            const rMap: Record<string, { avg_rating: number; review_count: number }> = {};
            for (const post of postsData) {
              if (!post.item_master_id || post.rating == null) continue;
              if (!rMap[post.item_master_id]) {
                rMap[post.item_master_id] = { avg_rating: 0, review_count: 0 };
              }
              const agg = rMap[post.item_master_id];
              agg.avg_rating =
                (agg.avg_rating * agg.review_count + post.rating) / (agg.review_count + 1);
              agg.review_count++;
            }
            setRatingsMap(rMap);
          }
        }
      } else {
        // Use mock data
        setHours(mockDiningHallHours.filter((h) => h.dining_hall_id === hall.id && h.date === today));

        const map: Record<string, ItemMaster> = {};
        for (const item of mockItemMaster) {
          map[item.id] = item;
        }
        setItemMasterMap(map);

        // Calculate ratings from mock data
        const rMap: Record<string, { avg_rating: number; review_count: number }> = {};
        for (const [itemId, rating] of Object.entries(mockItemRatings)) {
          const reviewCount = mockPosts.filter(
            (p) => p.type === "review" && p.item_master_id === itemId
          ).length;
          rMap[itemId] = { avg_rating: rating, review_count: reviewCount };
        }
        setRatingsMap(rMap);
      }
    }

    loadData();
  }, [hall.id, menuItems]);

  const sections = buildMealSections(menuItems, dailyMenus, hours, itemMasterMap, ratingsMap);

  const handleItemClick = (item: EnrichedMenuItem) => {
    if (item.item_master_id) {
      router.push(`/item/${item.item_master_id}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-zinc-200 bg-white px-6 py-4 rounded-t-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                {hall.name}
              </h2>
              <GpaRating gpa={hall.gpa} />
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Operating hours */}
          {hours.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              {hours.map((h) => (
                <span key={h.id} className="flex items-center gap-1">
                  <span className="font-medium capitalize">{h.meal_period}:</span>
                  <span>
                    {formatTime12h(h.start_time)} - {formatTime12h(h.end_time)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
            </div>
          )}

          {!loading && sections.length === 0 && (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
              No menu data available for today.
            </p>
          )}

          {sections.map((section) => (
            <MealSectionView
              key={section.mealPeriod}
              section={section}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Meal Section ──

function MealSectionView({
  section,
  onItemClick,
}: {
  section: MealSection;
  onItemClick: (item: EnrichedMenuItem) => void;
}) {
  const timeRange =
    section.startTime && section.endTime
      ? `${formatTime12h(section.startTime)} – ${formatTime12h(section.endTime)}`
      : null;

  const stations = groupByStation(section.items);

  return (
    <div>
      {/* Meal header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold capitalize text-zinc-900 dark:text-white">
          {section.mealPeriod}
        </h3>
        {timeRange && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {timeRange}
          </span>
        )}
        {section.isNowServing && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Now Serving
          </span>
        )}
      </div>

      {/* Station groups */}
      <div className="space-y-4">
        {stations.map((group) => (
          <div key={group.station}>
            <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              {group.station}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => (
                <MenuItemRow key={item.id} item={item} onClick={() => onItemClick(item)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Menu Item Row ──

function MenuItemRow({
  item,
  onClick,
}: {
  item: EnrichedMenuItem;
  onClick: () => void;
}) {
  const emoji = getFoodEmoji(item.item_name);

  // Only show halal and vegan tags (simplified as per plan)
  const showVegan = item.dietary_tags.includes("vegan");
  const showHalal = item.dietary_tags.includes("halal");

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 w-full text-left transition-colors cursor-pointer"
    >
      <span className="text-lg shrink-0" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-sm text-zinc-900 dark:text-white flex-1 min-w-0 truncate">
        {item.item_name}
      </span>

      {/* Simplified dietary tags: only vegan and halal */}
      {showVegan && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300 shrink-0">
          🌱
        </span>
      )}
      {showHalal && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 shrink-0">
          🔥
        </span>
      )}

      {/* Average rating (0.0-4.0 scale) - always show */}
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold shrink-0 ${
        item.review_count > 0
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-zinc-400 dark:text-zinc-600'
      }`}>
        {item.avg_rating.toFixed(1)} {item.review_count > 0 && `(${item.review_count})`}
      </span>
    </button>
  );
}
