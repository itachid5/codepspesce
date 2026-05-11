import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all article categories on The Signal Ledger.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Categories</p>
      <h1 className="mt-4 font-serif text-5xl font-black text-ink md:text-7xl">Browse by editorial desk.</h1>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="group rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rust/40 hover:shadow-xl hover:shadow-ink/10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-rust">{category._count.posts} posts</p>
            <h2 className="mt-4 font-serif text-3xl font-black text-ink group-hover:text-rust">{category.name}</h2>
            {category.description ? <p className="mt-3 leading-7 text-ink/62">{category.description}</p> : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
