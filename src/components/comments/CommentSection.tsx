"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import CommentThread from "./CommentThread";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [sortBy, setSortBy] = useState<"top" | "new" | "controversial">("top");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    setComments(data || []);
    setLoading(false);
  }

  async function handleSubmitComment() {
    if (!newCommentText.trim() || !user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        body: newCommentText,
      });

      if (!error) {
        setNewCommentText("");
        await loadComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, body: string) {
    if (!user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      parent_id: parentId,
      user_id: user.id,
      body,
    });

    if (!error) {
      await loadComments();
    }
  }

  async function handleVote(commentId: string, voteType: 1 | -1) {
    if (!user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    // Check if user already voted
    const { data: existing } = await supabase
      .from("comment_votes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote
        await supabase
          .from("comment_votes")
          .delete()
          .eq("id", existing.id);
      } else {
        // Change vote
        await supabase
          .from("comment_votes")
          .update({ vote_type: voteType })
          .eq("id", existing.id);
      }
    } else {
      // New vote
      await supabase.from("comment_votes").insert({
        comment_id: commentId,
        user_id: user.id,
        vote_type: voteType,
      });
    }

    await loadComments();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        <button
          onClick={() => setSortBy("top")}
          className={`px-3 py-1 text-sm font-medium rounded ${
            sortBy === "top"
              ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          Top
        </button>
        <button
          onClick={() => setSortBy("new")}
          className={`px-3 py-1 text-sm font-medium rounded ${
            sortBy === "new"
              ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setSortBy("controversial")}
          className={`px-3 py-1 text-sm font-medium rounded ${
            sortBy === "controversial"
              ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          Controversial
        </button>
      </div>

      {/* New comment box */}
      {user && (
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !newCommentText.trim()}
              className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {comments.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <CommentThread
          comments={comments}
          postId={postId}
          onReply={handleReply}
          onVote={handleVote}
          sortBy={sortBy}
        />
      )}
    </div>
  );
}
