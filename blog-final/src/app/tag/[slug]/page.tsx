import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/public/BlogCard";
import { getPostsByTag } from "@/lib/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getPostsByTag(slug);
  return { title: tag ? `#${tag.name}` : "Tag", description: "Tagged article archive" };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getPostsByTag(slug);
  if (!tag) notFound();
  const posts = tag.posts.map((item) => item.post).filter((post) => post.status === "published");

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Tag</p>
      <h1 className="mt-3 font-serif text-6xl font-black text-ink">#{tag.name}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
      </div>
    </div>
  );
}
