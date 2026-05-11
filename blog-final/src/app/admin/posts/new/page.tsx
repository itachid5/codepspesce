import { PostEditor } from "@/components/admin/PostEditor";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPostAction } from "../../actions";

export default async function NewPostPage() {
  await requireAdmin();
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">New dispatch</p>
      <h1 className="mb-8 font-serif text-5xl font-black text-ink">Create post</h1>
      <PostEditor action={createPostAction} categories={categories} tags={tags} />
    </div>
  );
}
