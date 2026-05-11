import type { Metadata } from "next";
import { BlogCard } from "@/components/public/BlogCard";
import { CategoryFilter } from "@/components/public/CategoryFilter";
import { SearchBar } from "@/components/public/SearchBar";
import { prisma } from "@/lib/db";
import { getLatestPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Latest Posts", description: "Fresh technology and product reporting." };

export default async function PostsPage() {
  const [posts, categories] = await Promise.all([
    getLatestPosts(30),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Archive</p>
        <h1 className="mt-3 font-serif text-6xl font-black leading-none text-ink">All published signals</h1>
      </div>
      <div className="my-8 grid gap-5 lg:grid-cols-[1fr_24rem]">
        <CategoryFilter categories={categories} />
        <SearchBar />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
      </div>
    </div>
  );
}
