"use client";

import { useEffect } from "react";

export function ViewTracker({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    fetch(`/api/posts/${slug}/view`, { method: "POST", keepalive: true }).catch(() => undefined);

    const posts = JSON.parse(localStorage.getItem("recentlyViewedPosts") ?? "[]") as { slug: string; title: string }[];
    const nextPosts = [{ slug, title }, ...posts.filter((post) => post.slug !== slug)].slice(0, 5);
    localStorage.setItem("recentlyViewedPosts", JSON.stringify(nextPosts));
  }, [slug, title]);

  return null;
}
