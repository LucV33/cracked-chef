import { DiningHallWithMenu } from "@/lib/types";
import GpaRating from "./GpaRating";
import MenuItemList from "./MenuItemList";

interface DiningHallCardProps {
  hall: DiningHallWithMenu;
  onClick?: () => void;
}

export default function DiningHallCard({ hall, onClick }: DiningHallCardProps) {
  return (
    <div
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors cursor-pointer hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
          {hall.name}
        </h3>
        <GpaRating gpa={hall.gpa} />
      </div>
      <MenuItemList diningHallId={hall.id} date={hall.menu?.date} />
    </div>
  );
}
