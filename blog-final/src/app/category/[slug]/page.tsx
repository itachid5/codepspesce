import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/public/BlogCard";
import { getPostsByCategory } from "@/lib/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPostsByCategory(slug);
  return { title: category ? category.name : "Category", description: category?.description ?? "Category archive" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getPostsByCategory(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Category</p>
      <h1 className="mt-3 font-serif text-6xl font-black text-ink">{category.name}</h1>
      {category.description ? <p className="mt-4 max-w-2xl text-lg text-ink/65">{category.description}</p> : null}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {category.posts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
      </div>
    </div>
  );
}
