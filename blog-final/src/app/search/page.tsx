import type { Metadata } from "next";
import { BlogCard } from "@/components/public/BlogCard";
import { SearchBar } from "@/components/public/SearchBar";
import { searchPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Search", description: "Search the archive." };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const posts = await searchPosts(q);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Search</p>
      <h1 className="mt-3 font-serif text-6xl font-black text-ink">Find the signal</h1>
      <div className="mt-8 max-w-3xl"><SearchBar defaultValue={q} /></div>
      <p className="mt-6 text-sm font-bold text-ink/50">{q ? `${posts.length} result${posts.length === 1 ? "" : "s"} for “${q}”` : "Enter a query to search posts, tags, and categories."}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
      </div>
    </div>
  );
}
