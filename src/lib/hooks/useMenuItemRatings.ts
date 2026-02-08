import { useEffect, useState } from "react";
import { getSupabase } from "../supabase";

interface MenuItemRating {
  itemId: string;
  averageRating: number;
  reviewCount: number;
}

export function useMenuItemRatings(menuItemIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, MenuItemRating>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRatings() {
      const supabase = getSupabase();
      if (!supabase || menuItemIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all posts that reference these menu items
      const { data } = await supabase
        .from("posts")
        .select("menu_item_id, rating")
        .eq("type", "review")
        .in("menu_item_id", menuItemIds)
        .not("rating", "is", null);

      if (!data) {
        setLoading(false);
        return;
      }

      // Calculate aggregates
      const aggregates: Record<string, MenuItemRating> = {};

      for (const post of data) {
        if (!post.menu_item_id || post.rating == null) continue;

        if (!aggregates[post.menu_item_id]) {
          aggregates[post.menu_item_id] = {
            itemId: post.menu_item_id,
            averageRating: 0,
            reviewCount: 0,
          };
        }

        const agg = aggregates[post.menu_item_id];
        agg.averageRating =
          (agg.averageRating * agg.reviewCount + post.rating) / (agg.reviewCount + 1);
        agg.reviewCount++;
      }

      setRatings(aggregates);
      setLoading(false);
    }

    loadRatings();
  }, [menuItemIds.join(",")]);

  return { ratings, loading };
}
