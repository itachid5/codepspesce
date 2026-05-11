import type { Metadata } from "next";
import { BlogCard } from "@/components/public/BlogCard";
import { getTrendingPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Trending Posts",
  description: "Popular and trending posts from The Signal Ledger.",
};

export default async function TrendingPage() {
  const posts = await getTrendingPosts(30);

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Trending posts</p>
      <h1 className="mt-4 font-serif text-5xl font-black leading-none text-ink md:text-7xl">Stories readers are returning to.</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
      </div>
    </main>
  );
}
