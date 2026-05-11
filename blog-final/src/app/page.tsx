import Link from "next/link";
import { BlogCard } from "@/components/public/BlogCard";
import { CategoryFilter } from "@/components/public/CategoryFilter";
import { FeaturedPost } from "@/components/public/FeaturedPost";
import { SearchBar } from "@/components/public/SearchBar";
import { TrendingPosts } from "@/components/public/TrendingPosts";
import { prisma } from "@/lib/db";
import { getFeaturedPost, getLatestPosts, getTrendingPosts } from "@/lib/posts";

export default async function Home() {
  const [featured, latest, trending, categories] = await Promise.all([
    getFeaturedPost(),
    getLatestPosts(6),
    getTrendingPosts(5),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">{featured ? <FeaturedPost post={featured} /> : <div className="rounded-[2rem] bg-white p-10">Publish your first featured post from the admin dashboard.</div>}</div>
        <div className="min-w-0 space-y-6">
          <SearchBar />
          <TrendingPosts posts={trending} />
        </div>
      </div>

      <section className="mb-10 flex flex-col gap-5 border-y border-ink/10 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Browse the desk</p>
          <h2 className="font-serif text-4xl font-black text-ink">Latest reports</h2>
        </div>
        <CategoryFilter categories={categories} />
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {latest.map((post, index) => <BlogCard key={post.id} post={post} priority={index < 2} />)}
      </div>

      <div className="mt-12 text-center">
        <Link href="/posts" className="inline-flex rounded-full border border-ink/15 bg-white px-7 py-3 text-sm font-black text-ink hover:border-rust hover:text-rust">View all posts</Link>
      </div>
    </div>
  );
}
