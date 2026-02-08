"use client";

import { Post } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import VoteButtons from "./VoteButtons";
import PostTypeBadge from "./PostTypeBadge";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  onVoteChange?: () => void;
}

export default function PostCard({ post, onClick, onVoteChange }: PostCardProps) {
  const { user } = useAuth();

  async function handleVote(voteType: 1 | -1) {
    if (!user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    // Check existing vote
    const { data: existing } = await supabase
      .from("post_votes")
      .select("*")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote
        await supabase.from("post_votes").delete().eq("id", existing.id);
      } else {
        // Change vote
        await supabase
          .from("post_votes")
          .update({ vote_type: voteType })
          .eq("id", existing.id);
      }
    } else {
      // New vote
      await supabase.from("post_votes").insert({
        post_id: post.id,
        user_id: user.id,
        vote_type: voteType,
      });
    }

    onVoteChange?.();
  }

  return (
    <div className="flex rounded-xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex-shrink-0 p-4">
        <VoteButtons
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          onVote={user ? handleVote : undefined}
        />
      </div>

      <div
        className="flex-1 min-w-0 py-4 pr-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <PostTypeBadge type={post.type} />
          <span>
            u/{post.profile?.display_name || post.author}
          </span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>

        <h3 className="mt-1 font-semibold text-zinc-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
          {post.title}
        </h3>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="mt-2 max-h-96 w-full rounded-lg object-cover"
          />
        )}

        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
          {post.body}
        </p>

        {/* Post metadata footer */}
        <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <button className="flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2 py-1">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.comment_count || 0} comments</span>
          </button>

          {post.rating != null && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 dark:bg-orange-900/40">
              <span className="text-orange-600 dark:text-orange-400">★</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{post.rating.toFixed(1)}/4.0</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
