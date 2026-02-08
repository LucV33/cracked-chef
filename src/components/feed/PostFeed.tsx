"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";
import { mockPosts } from "@/lib/mock-data";
import PostCard from "./PostCard";

type SortOption = "hot" | "new" | "top";
type TimeFilter = "today" | "all";

export default function PostFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("hot");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  useEffect(() => {
    load();
  }, [sortBy, timeFilter]);

  async function load() {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      let query = supabase.from("posts").select(`
        *,
        profile:profiles(*)
      `);

      // Time filter
      if (timeFilter === "today") {
        const today = new Date().toISOString().slice(0, 10);
        query = query.gte("created_at", `${today}T00:00:00`);
      }

      // Sorting
      if (sortBy === "new") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "top") {
        query = query.order("upvotes", { ascending: false });
      } else {
        // hot - combination of upvotes and recency
        query = query.order("upvotes", { ascending: false });
      }

      const { data } = await query;

      if (data) {
        // Apply hot algorithm client-side for better control
        if (sortBy === "hot") {
          const sorted = [...data].sort((a, b) => {
            const aScore = calculateHotScore(a);
            const bScore = calculateHotScore(b);
            return bScore - aScore;
          });
          setPosts(sorted);
        } else {
          setPosts(data);
        }
        return;
      }
    }
    setPosts(mockPosts);
  }

  function calculateHotScore(post: Post): number {
    const score = post.upvotes - post.downvotes;
    const ageInHours =
      (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    // Reddit hot algorithm: log(score) - age/45
    return Math.log10(Math.max(Math.abs(score), 1)) * Math.sign(score) - ageInHours / 45;
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        {/* Header with tabs and sort */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter("today")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                timeFilter === "today"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                timeFilter === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              All Time
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="hot">🔥 Hot</option>
            <option value="new">🆕 New</option>
            <option value="top">⭐ Top</option>
          </select>
        </div>

        {/* Posts */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                No posts yet. Be the first to post!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => router.push(`/post/${post.id}`)}
                onVoteChange={load}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
