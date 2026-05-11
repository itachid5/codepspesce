import Link from "next/link";

export function CategoryFilter({ categories }: { categories: { name: string; slug: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/posts" className="rounded-full border border-ink/10 bg-ink px-4 py-2 text-sm font-black text-paper">All</Link>
      {categories.map((category) => <Link key={category.slug} href={`/category/${category.slug}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-black text-ink hover:border-rust hover:text-rust">{category.name}</Link>)}
    </div>
  );
}
