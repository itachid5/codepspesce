import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePostAction } from "../../../actions";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { tags: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Edit dispatch</p>
      <h1 className="mb-8 font-serif text-5xl font-black text-ink">{post.title}</h1>
      <PostEditor
        action={updatePostAction.bind(null, post.id)}
        categories={categories}
        tags={tags}
        defaults={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featuredImageUrl: post.featuredImageUrl,
          thumbnailUrl: post.thumbnailUrl,
          categoryId: post.categoryId,
          status: post.status,
          isFeatured: post.isFeatured,
          tagIds: post.tags.map((item) => item.tagId),
        }}
      />
    </div>
  );
}
