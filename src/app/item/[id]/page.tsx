"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ItemMaster, Post } from "@/lib/types";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";
import { mockItemMaster, mockPosts, mockItemRatings } from "@/lib/mock-data";
import PostCard from "@/components/feed/PostCard";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemMaster | null>(null);
  const [reviews, setReviews] = useState<Post[]>([]);
  const [recipes, setRecipes] = useState<Post[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItemData() {
      setLoading(true);

      try {
        if (isSupabaseConfigured()) {
          const supabase = getSupabase()!;

          // Fetch item master
          const { data: itemData } = await supabase
            .from("item_master")
            .select("*")
            .eq("id", itemId)
            .single();

          if (itemData) {
            setItem(itemData);
          }

          // Fetch reviews
          const { data: reviewsData } = await supabase
            .from("posts")
            .select("*, profile:profiles(*)")
            .eq("type", "review")
            .eq("item_master_id", itemId)
            .order("created_at", { ascending: false });

          if (reviewsData) {
            setReviews(reviewsData);

            // Calculate average rating
            const ratingsOnly = reviewsData
              .filter((r) => r.rating != null)
              .map((r) => r.rating!);

            if (ratingsOnly.length > 0) {
              const sum = ratingsOnly.reduce((acc, r) => acc + r, 0);
              setAvgRating(sum / ratingsOnly.length);
              setReviewCount(ratingsOnly.length);
            }
          }

          // Fetch recipes that tag this item
          const { data: recipesData } = await supabase
            .from("posts")
            .select("*, profile:profiles(*)")
            .eq("type", "recipe")
            .contains("tagged_items", [itemId])
            .order("created_at", { ascending: false });

          if (recipesData) {
            setRecipes(recipesData);
          }
        } else {
          // Use mock data
          const mockItem = mockItemMaster.find((im) => im.id === itemId);
          if (mockItem) {
            setItem(mockItem);
          }

          const mockReviews = mockPosts.filter(
            (p) => p.type === "review" && p.item_master_id === itemId
          );
          setReviews(mockReviews);

          // Get rating from mock ratings
          const rating = mockItemRatings[itemId] || 0;
          setAvgRating(rating);
          setReviewCount(mockReviews.length);

          const mockRecipes = mockPosts.filter(
            (p) => p.type === "recipe" && p.tagged_items?.includes(itemId)
          );
          setRecipes(mockRecipes);
        }
      } catch (err) {
        console.error("Error loading item data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadItemData();
  }, [itemId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-orange-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Item Not Found
        </h1>
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-3 flex items-center gap-2 text-sm text-zinc-600 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {item.canonical_name}
              </h1>

              {/* Dietary tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {item.dietary_tags.includes("vegan") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    🌱 Vegan
                  </span>
                )}
                {item.dietary_tags.includes("vegetarian") && !item.dietary_tags.includes("vegan") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    🥬 Vegetarian
                  </span>
                )}
                {item.dietary_tags.includes("halal") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                    🔥 Halal
                  </span>
                )}
                {item.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {item.category}
                  </span>
                )}
              </div>
            </div>

            {/* Rating summary */}
            <div className="flex flex-col items-end gap-1">
              <div className="text-3xl font-bold text-orange-500">
                {avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        {/* Student Reviews Section */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
            Student Reviews
          </h2>

          {reviews.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                No reviews yet. Be the first to review this item!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <PostCard key={review.id} post={review} />
              ))}
            </div>
          )}
        </section>

        {/* Recipes Section */}
        {recipes.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
              Recipes Featuring This Item
            </h2>

            <div className="space-y-4">
              {recipes.map((recipe) => (
                <PostCard key={recipe.id} post={recipe} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
