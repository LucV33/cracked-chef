"use client";

import { useState } from "react";
import { Comment, Profile } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import VoteButtons from "../feed/VoteButtons";

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  onReply: (parentId: string, body: string) => Promise<void>;
  onVote: (commentId: string, voteType: 1 | -1) => Promise<void>;
  sortBy?: "top" | "new" | "controversial";
}

export default function CommentThread({
  comments,
  postId,
  onReply,
  onVote,
  sortBy = "top",
}: CommentThreadProps) {
  // Build nested structure
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  for (const comment of comments) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentMap.get(comment.id)!);
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  }

  // Sort comments
  const sortComments = (comments: Comment[]) => {
    return comments.sort((a, b) => {
      if (sortBy === "new") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "controversial") {
        const aControversy = Math.min(a.upvotes, a.downvotes);
        const bControversy = Math.min(b.upvotes, b.downvotes);
        return bControversy - aControversy;
      } else {
        // top
        return b.upvotes - a.upvotes;
      }
    });
  };

  const sortedRoots = sortComments([...rootComments]);

  return (
    <div className="space-y-4">
      {sortedRoots.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onReply={onReply}
          onVote={onVote}
          depth={0}
        />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (parentId: string, body: string) => Promise<void>;
  onVote: (commentId: string, voteType: 1 | -1) => Promise<void>;
  depth: number;
}

function CommentItem({
  comment,
  postId,
  onReply,
  onVote,
  depth,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const maxDepth = 8;
  const indentPx = Math.min(depth, maxDepth) * 16;

  async function handleSubmitReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyBox(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const timeAgo = getTimeAgo(comment.created_at);
  const score = comment.upvotes - comment.downvotes;

  return (
    <div style={{ marginLeft: `${indentPx}px` }}>
      <div className="group">
        {/* Collapse line */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 cursor-pointer hover:bg-orange-400 dark:hover:bg-orange-500"
            style={{ marginLeft: `${indentPx - 8}px` }}
            onClick={() => setCollapsed(!collapsed)}
          />
        )}

        <div className="flex gap-2">
          <VoteButtons
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            onVote={(type) => onVote(comment.id, type)}
            size="small"
            vertical
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {comment.profile?.avatar_url ? (
                <img
                  src={comment.profile.avatar_url}
                  alt={comment.profile.display_name}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-300 text-[10px] font-bold dark:bg-zinc-700">
                  {comment.profile?.display_name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {comment.profile?.display_name || "Anonymous"}
              </span>
              <span>•</span>
              <span>{score} points</span>
              <span>•</span>
              <span>{timeAgo}</span>
              {depth > 0 && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hover:underline"
                  >
                    {collapsed ? "[+]" : "[\u2212]"}
                  </button>
                </>
              )}
            </div>

            {!collapsed && (
              <>
                <p className="mt-1 text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
                  {comment.body}
                </p>

                <div className="mt-1 flex items-center gap-3 text-xs">
                  {user && (
                    <button
                      onClick={() => setShowReplyBox(!showReplyBox)}
                      className="font-medium text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
                    >
                      Reply
                    </button>
                  )}
                </div>

                {showReplyBox && (
                  <div className="mt-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="What are your thoughts?"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      rows={3}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleSubmitReply}
                        disabled={submitting || !replyText.trim()}
                        className="rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                      >
                        {submitting ? "Posting..." : "Reply"}
                      </button>
                      <button
                        onClick={() => {
                          setShowReplyBox(false);
                          setReplyText("");
                        }}
                        className="rounded-lg px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        onReply={onReply}
                        onVote={onVote}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
