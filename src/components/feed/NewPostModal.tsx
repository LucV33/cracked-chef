"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import { MenuItemRecord } from "@/lib/types";

interface NewPostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPostModal({ onClose, onSuccess }: NewPostModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<"review" | "recipe">("review");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [taggedItems, setTaggedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTodaysMenu();
  }, []);

  async function loadTodaysMenu() {
    const supabase = getSupabase();
    if (!supabase) return;

    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("date", today);

    setMenuItems(data || []);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function toggleTaggedItem(itemId: string) {
    setTaggedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  async function handleSubmit() {
    if (!title.trim() || !body.trim() || !user) {
      setError("Title and body are required");
      return;
    }

    if (type === "review" && !selectedMenuItem) {
      setError("Please select a menu item to review");
      return;
    }

    if (type === "recipe" && taggedItems.length === 0) {
      setError("Please tag at least one menu item");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      let imageUrl = null;

      // Upload image if present
      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(data.path);

        imageUrl = urlData.publicUrl;
      }

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        type,
        title,
        body,
        user_id: user.id,
        author: user.email?.split("@")[0] || "anonymous",
        image_url: imageUrl,
        rating: type === "review" ? rating : null,
        menu_item_id: type === "review" ? selectedMenuItem : null,
        tagged_items: type === "recipe" ? taggedItems : [],
      });

      if (postError) throw postError;

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  // Group menu items by dining hall
  const itemsByHall = menuItems.reduce((acc, item) => {
    if (!acc[item.dining_hall_id]) {
      acc[item.dining_hall_id] = [];
    }
    acc[item.dining_hall_id].push(item);
    return acc;
  }, {} as Record<string, MenuItemRecord[]>);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-2xl mx-4 my-8 rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Post type selector */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setType("review")}
            className={`flex-1 rounded-lg px-4 py-2 font-semibold ${
              type === "review"
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            ⭐ Review
          </button>
          <button
            onClick={() => setType("recipe")}
            className={`flex-1 rounded-lg px-4 py-2 font-semibold ${
              type === "recipe"
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            🍳 Recipe
          </button>
        </div>

        {menuItems.length === 0 && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            No menu items available for today. Posts must reference today&apos;s menu.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a catchy title"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {type === "review" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Menu Item
                </label>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Select an item...</option>
                  {Object.entries(itemsByHall).map(([hallId, items]) => (
                    <optgroup key={hallId} label={items[0]?.item_name || "Unknown Hall"}>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_name} ({item.station})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Rating: {rating}/5.0
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-orange-500">
                  {"★".repeat(Math.floor(rating))}
                  {rating % 1 !== 0 && "☆"}
                </div>
              </div>
            </>
          )}

          {type === "recipe" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tag Ingredients (select from today&apos;s menu)
              </label>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-300 p-2 dark:border-zinc-700">
                {menuItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={taggedItems.includes(item.id)}
                      onChange={() => toggleTaggedItem(item.id)}
                      className="rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-zinc-900 dark:text-white">
                      {item.item_name} ({item.station})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                type === "review"
                  ? "Share your thoughts on this dish..."
                  : "Describe your recipe and how to make it..."
              }
              rows={6}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/20 dark:file:text-orange-400"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 max-h-48 rounded-lg object-cover"
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || menuItems.length === 0}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
