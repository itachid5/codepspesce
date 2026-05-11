import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all article tags on The Signal Ledger.",
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Tags</p>
      <h1 className="mt-4 font-serif text-5xl font-black text-ink md:text-7xl">Follow the threads.</h1>
      <div className="mt-10 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tag/${tag.slug}`} className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-black text-ink/70 shadow-sm transition hover:-translate-y-0.5 hover:border-rust/40 hover:text-rust hover:shadow-lg hover:shadow-ink/10">
            #{tag.name} <span className="ml-2 text-ink/35">{tag._count.posts}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
