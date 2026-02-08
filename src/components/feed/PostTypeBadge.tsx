import { PostType } from "@/lib/types";

interface PostTypeBadgeProps {
  type: PostType;
}

export default function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const style =
    type === "recipe"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {type === "recipe" ? "Recipe" : "Review"}
    </span>
  );
}
