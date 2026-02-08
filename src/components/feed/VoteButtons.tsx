"use client";

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  onVote?: (voteType: 1 | -1) => void;
  userVote?: 1 | -1 | null;
  size?: "normal" | "small";
  vertical?: boolean;
}

export default function VoteButtons({
  upvotes,
  downvotes,
  onVote,
  userVote = null,
  size = "normal",
  vertical = true,
}: VoteButtonsProps) {
  const score = upvotes - downvotes;
  const isSmall = size === "small";

  const baseButtonClass = isSmall
    ? "text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-0.5"
    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1";

  const upvoteColor = userVote === 1
    ? "text-orange-500"
    : "text-zinc-400 hover:text-orange-500";

  const downvoteColor = userVote === -1
    ? "text-blue-500"
    : "text-zinc-400 hover:text-blue-500";

  const containerClass = vertical
    ? "flex flex-col items-center gap-0.5"
    : "flex items-center gap-2";

  return (
    <div className={containerClass}>
      <button
        className={`${baseButtonClass} ${upvoteColor} transition-colors`}
        aria-label="Upvote"
        onClick={() => onVote?.(1)}
        disabled={!onVote}
      >
        ▲
      </button>
      <span
        className={`${isSmall ? "text-xs" : "text-sm"} font-semibold text-zinc-700 dark:text-zinc-300`}
      >
        {score}
      </span>
      <button
        className={`${baseButtonClass} ${downvoteColor} transition-colors`}
        aria-label="Downvote"
        onClick={() => onVote?.(-1)}
        disabled={!onVote}
      >
        ▼
      </button>
    </div>
  );
}
