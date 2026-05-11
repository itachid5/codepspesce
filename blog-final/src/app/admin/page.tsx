import Link from "next/link";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function AdminDashboard() {
  await requireAdmin();
  const [posts, published, drafts, views, recent] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.findMany({ include: { category: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Overview</p><h1 className="font-serif text-5xl font-black text-ink">Publishing dashboard</h1></div>
        <Link href="/admin/posts/new" className="rounded-full bg-ink px-6 py-3 text-sm font-black text-paper hover:bg-rust">New post</Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <StatsCard label="Total posts" value={posts} detail={`${published} published`} />
        <StatsCard label="Drafts" value={drafts} />
        <StatsCard label="Views" value={formatNumber(views._sum.viewCount ?? 0)} />
        <StatsCard label="Published" value={published} />
      </div>
      <section className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-3xl font-black text-ink">Recent posts</h2>
        <div className="mt-5 divide-y divide-ink/10">
          {recent.map((post) => (
            <div key={post.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
              <div><p className="font-bold text-ink">{post.title}</p><p className="text-sm text-ink/50">{post.category.name} · {formatDate(post.updatedAt)}</p></div>
              <div className="flex items-center gap-3"><StatusBadge status={post.status} /><Link href={`/admin/posts/${post.id}/edit`} className="text-sm font-black text-rust">Edit</Link></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
