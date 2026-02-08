export type PostType = "recipe" | "review";

export interface DiningHall {
  id: string;
  name: string;
  slug: string;
  gpa: number;
  image_url?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  station: string;
  dietary_tags?: string[];
  carbon_footprint?: number | null;
  item_master_id?: string;
}

export type MealPeriod = "breakfast" | "lunch" | "dinner" | "brunch";

export interface DailyMenu {
  id: string;
  dining_hall_id: string;
  date: string;
  meal_period: MealPeriod;
  items: MenuItem[];
  meal_start_time?: string;
  meal_end_time?: string;
}

export interface MenuItemRecord {
  id: string;
  dining_hall_id: string;
  date: string;
  meal: "brunch" | "dinner";
  station: string;
  item_name: string;
  dietary_tags: string[];
  carbon_footprint: number | null;
  created_at: string;
  item_master_id?: string;
}

export interface Rating {
  id: string;
  dining_hall_id: string;
  user_id: string;
  score: number;
  comment?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  body: string;
  author: string; // legacy - deprecated in favor of user_id
  user_id?: string;
  dining_hall_id?: string;
  menu_item_id?: string; // deprecated - use item_master_id instead
  item_master_id?: string; // reference to canonical item
  tagged_items?: string[]; // item_master IDs for recipes
  rating?: number; // 0.0-4.0 GPA scale for reviews
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  image_url?: string;
  profile?: Profile; // joined data
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  user_id: string;
  body: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  profile?: Profile; // joined data
  replies?: Comment[]; // nested replies
}

export interface Vote {
  id: string;
  post_id?: string;
  comment_id?: string;
  user_id: string;
  vote_type: 1 | -1; // 1 = upvote, -1 = downvote
  created_at: string;
}

export interface ItemMaster {
  id: string;
  canonical_name: string;
  normalized_name: string;
  category: string | null;
  dietary_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DiningHallHours {
  id: string;
  dining_hall_id: string;
  date: string;
  meal_period: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface ItemWithRating extends ItemMaster {
  avg_rating: number;
  review_count: number;
}

export interface DiningHallWithMenu extends DiningHall {
  menu: DailyMenu | null;
}
