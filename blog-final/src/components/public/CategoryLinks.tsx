"use client";

import { DrawerLink } from "./DrawerLink";

type TaxonomyLink = { id: string; name: string; slug: string; _count?: { posts: number } };

export function CategoryLinks({ categories, onNavigate }: { categories: TaxonomyLink[]; onNavigate?: () => void }) {
  if (!categories.length) return <p className="px-4 py-2 text-sm font-bold text-ink/45">No categories yet.</p>;

  return categories.map((category) => (
    <DrawerLink key={category.id} href={`/category/${category.slug}`} onNavigate={onNavigate} className="flex items-center justify-between gap-4">
      <span>{category.name}</span>
      {category._count ? <span className="rounded-full bg-sand px-2 py-1 text-[0.65rem] text-ink/45">{category._count.posts}</span> : null}
    </DrawerLink>
  ));
}
