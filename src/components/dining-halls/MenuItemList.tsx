"use client";

import { useEffect, useState } from "react";
import { ItemWithRating } from "@/lib/types";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";
import { getMockTopRatedItems } from "@/lib/mock-data";

interface MenuItemListProps {
  diningHallId: string;
  date?: string;
}

export default function MenuItemList({ diningHallId, date }: MenuItemListProps) {
  const [topItems, setTopItems] = useState<ItemWithRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopItems() {
      const today = date || new Date().toISOString().slice(0, 10);
      setLoading(true);

      try {
        if (isSupabaseConfigured()) {
          const supabase = getSupabase()!;
          const { data, error } = await supabase.rpc("get_top_rated_items", {
            p_hall_id: diningHallId,
            p_date: today,
            p_limit: 2,
          });

          if (error) {
            console.warn("Supabase RPC failed, falling back to mock data:", error);
            // Fall back to mock data if RPC fails (migration might not be run yet)
            const items = getMockTopRatedItems(diningHallId, today, 2);
            setTopItems(items);
          } else {
            setTopItems(data || []);
          }
        } else {
          // Use mock data
          const items = getMockTopRatedItems(diningHallId, today, 2);
          setTopItems(items);
        }
      } catch (err) {
        console.error("Error loading top items:", err);
        // Final fallback to mock data
        const items = getMockTopRatedItems(diningHallId, today, 2);
        setTopItems(items);
      } finally {
        setLoading(false);
      }
    }

    loadTopItems();
  }, [diningHallId, date]);

  if (loading) {
    return (
      <div className="mt-2 space-y-1">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (topItems.length === 0) {
    return (
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
        No rated items yet
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-1">
      {topItems.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          <span className="flex-shrink-0">⭐</span>
          <span className="flex-1 truncate">{item.canonical_name}</span>
          <span className="flex-shrink-0 font-semibold text-orange-600 dark:text-orange-400">
            {item.avg_rating.toFixed(1)}
          </span>
        </li>
      ))}
    </ul>
  );
}
