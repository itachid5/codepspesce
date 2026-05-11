import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/utils";
import { deletePostAction } from "../actions";

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = await prisma.post.findMany({ include: { category: true, author: true }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-rust">CMS</p><h1 className="font-serif text-5xl font-black text-ink">Posts</h1></div><Link href="/admin/posts/new" className="rounded-full bg-ink px-6 py-3 text-sm font-black text-paper hover:bg-rust">New post</Link></div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-sand/50 text-xs font-black uppercase tracking-[0.2em] text-ink/50"><tr><th className="p-4">Title</th><th>Status</th><th>Category</th><th>Views</th><th>Read</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody className="divide-y divide-ink/10">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="p-4 font-bold text-ink">{post.title}</td>
                <td><StatusBadge status={post.status} /></td>
                <td>{post.category.name}</td>
                <td>{formatNumber(post.viewCount)}</td>
                <td>{post.readTimeMinutes} min</td>
                <td>{formatDate(post.publishedAt ?? post.createdAt)}</td>
                <td className="flex gap-3 py-4"><Link href={`/admin/posts/${post.id}/edit`} className="font-black text-rust">Edit</Link><form action={deletePostAction}><input type="hidden" name="id" value={post.id} /><button className="font-black text-ink/45 hover:text-rust">Delete</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
