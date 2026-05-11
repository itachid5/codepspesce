import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { siteName } from "@/lib/seo";
import { SiteDrawer } from "./SiteDrawer";

export async function Navbar() {
  const [categories, tags, featuredPosts, popularPosts, adminUser] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } }),
    prisma.post.findMany({ where: { status: "published", isFeatured: true }, select: { id: true, title: true, slug: true }, orderBy: { publishedAt: "desc" }, take: 4 }),
    prisma.post.findMany({ where: { status: "published" }, select: { id: true, title: true, slug: true, viewCount: true }, orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }], take: 4 }),
    getAdminUser(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <SiteDrawer categories={categories} tags={tags} featuredPosts={featuredPosts} popularPosts={popularPosts} isAdmin={Boolean(adminUser)} />
          <Link href="/" className="min-w-0 truncate font-serif text-xl font-black tracking-tight text-ink transition hover:text-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:text-2xl">
            {siteName}
          </Link>
        </div>
        <div className="hidden items-center gap-6 text-sm font-bold text-ink/70 md:flex">
          <Link href="/posts" className="transition hover:text-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper">Latest</Link>
          {categories.slice(0, 5).map((category) => <Link key={category.id} href={`/category/${category.slug}`} className="transition hover:text-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper">{category.name}</Link>)}
          <Link href="/search" className="transition hover:text-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper">Search</Link>
        </div>
        <Link href="/admin" className="hidden shrink-0 rounded-full border border-ink/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-ink transition hover:border-rust hover:text-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:inline-flex">Admin</Link>
      </nav>
    </header>
  );
}
