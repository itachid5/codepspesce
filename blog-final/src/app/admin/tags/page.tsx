import { SubmitButton } from "@/components/admin/SubmitButton";
import { Input, Label } from "@/components/ui/Field";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTagAction, deleteTagAction } from "../actions";

export default async function TagsPage() {
  await requireAdmin();
  const tags = await prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[24rem_1fr] lg:px-8">
      <form action={createTagAction} className="h-fit rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Taxonomy</p>
        <h1 className="font-serif text-4xl font-black text-ink">Tags</h1>
        <div className="mt-6 space-y-5"><div><Label>Name</Label><Input name="name" required /></div><div><Label>Slug</Label><Input name="slug" placeholder="optional" /></div><SubmitButton>Create tag</SubmitButton></div>
      </form>
      <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => <div key={tag.id} className="rounded-full border border-ink/10 bg-sand/40 px-4 py-3"><span className="font-bold text-ink">#{tag.name}</span><span className="ml-2 text-sm text-ink/45">{tag._count.posts}</span><form action={deleteTagAction} className="ml-3 inline"><input type="hidden" name="id" value={tag.id} /><button className="text-xs font-black text-rust">Delete</button></form></div>)}
        </div>
      </div>
    </div>
  );
}
