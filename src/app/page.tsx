"use client";

import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import DiningHallBar from "@/components/dining-halls/DiningHallBar";
import PostFeed from "@/components/feed/PostFeed";
import NewPostModal from "@/components/feed/NewPostModal";

export default function Home() {
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const feedRef = useRef<{ reload: () => void }>(null);

  function handlePostSuccess() {
    // Reload the feed
    window.location.reload();
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onNewPost={() => setShowNewPostModal(true)} />
      <DiningHallBar />
      <PostFeed />
      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
}
