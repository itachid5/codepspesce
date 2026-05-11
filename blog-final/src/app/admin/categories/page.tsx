import { SubmitButton } from "@/components/admin/SubmitButton";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCategoryAction, deleteCategoryAction } from "../actions";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[24rem_1fr] lg:px-8">
      <form action={createCategoryAction} className="h-fit rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Taxonomy</p>
        <h1 className="font-serif text-4xl font-black text-ink">Categories</h1>
        <div className="mt-6 space-y-5"><div><Label>Name</Label><Input name="name" required /></div><div><Label>Slug</Label><Input name="slug" placeholder="optional" /></div><div><Label>Description</Label><Textarea name="description" className="min-h-24" /></div><SubmitButton>Create category</SubmitButton></div>
      </form>
      <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
        <div className="divide-y divide-ink/10">
          {categories.map((category) => <div key={category.id} className="flex items-center justify-between py-4"><div><p className="font-bold text-ink">{category.name}</p><p className="text-sm text-ink/50">/{category.slug} · {category._count.posts} posts</p></div><form action={deleteCategoryAction}><input type="hidden" name="id" value={category.id} /><button className="text-sm font-black text-rust">Delete</button></form></div>)}
        </div>
      </div>
    </div>
  );
}
