"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Profile, Post, Comment } from "@/lib/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/layout/Header";
import PostCard from "@/components/feed/PostCard";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tab, setTab] = useState<"posts" | "comments">("posts");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const isOwnProfile = user?.id === params.id;

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const supabase = getSupabase()!;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

      setProfile(profileData);
      setDisplayName(profileData?.display_name || "");
      setBio(profileData?.bio || "");

      // Load posts
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("user_id", params.id)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);

      // Load comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("user_id", params.id)
        .order("created_at", { ascending: false });

      setComments(commentsData || []);

      setLoading(false);
    }

    loadProfile();
  }, [params.id]);

  async function handleSaveProfile() {
    if (!isOwnProfile || !user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
      })
      .eq("id", user.id);

    if (!error) {
      setEditing(false);
      // Reload profile data
      window.location.reload();
    }
  }

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

  if (!profile) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            User not found
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
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Profile header */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-3xl font-bold text-white">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Bio (optional)"
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setDisplayName(profile.display_name);
                          setBio(profile.bio || "");
                        }}
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {profile.display_name}
                      </h1>
                      {isOwnProfile && (
                        <button
                          onClick={() => setEditing(true)}
                          className="text-sm text-orange-500 hover:text-orange-600"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        {profile.bio}
                      </p>
                    )}
                    <div className="mt-3 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span>{posts.length} posts</span>
                      <span>{comments.length} comments</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setTab("posts")}
              className={`px-4 py-2 text-sm font-semibold ${
                tab === "posts"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setTab("comments")}
              className={`px-4 py-2 text-sm font-semibold ${
                tab === "comments"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>

          {/* Content */}
          <div className="mt-4">
            {tab === "posts" ? (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    No posts yet
                  </p>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => router.push(`/post/${post.id}`)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    No comments yet
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
                        {comment.body}
                      </p>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {comment.upvotes - comment.downvotes} points •{" "}
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
