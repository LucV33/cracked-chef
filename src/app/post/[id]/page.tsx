"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockPosts } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import PostCard from "@/components/feed/PostCard";
import CommentSection from "@/components/comments/CommentSection";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase()!;
        const { data } = await supabase
          .from("posts")
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq("id", params.id)
          .single();

        setPost(data);
      } else {
        const mockPost = mockPosts.find((p) => p.id === params.id);
        setPost(mockPost || null);
      }
      setLoading(false);
    }

    loadPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Post not found
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <button
            onClick={() => router.push("/")}
            className="mb-4 flex items-center gap-1 text-sm text-zinc-600 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to feed
          </button>

          <PostCard post={post} />

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
              Comments
            </h2>
            <CommentSection postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
