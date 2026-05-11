"use client";

import { DrawerLink } from "./DrawerLink";

type TaxonomyLink = { id: string; name: string; slug: string; _count?: { posts: number } };

export function TagLinks({ tags, onNavigate }: { tags: TaxonomyLink[]; onNavigate?: () => void }) {
  if (!tags.length) return <p className="px-4 py-2 text-sm font-bold text-ink/45">No tags yet.</p>;

  return tags.map((tag) => (
    <DrawerLink key={tag.id} href={`/tag/${tag.slug}`} onNavigate={onNavigate} className="flex items-center justify-between gap-4">
      <span>#{tag.name}</span>
      {tag._count ? <span className="rounded-full bg-sand px-2 py-1 text-[0.65rem] text-ink/45">{tag._count.posts}</span> : null}
    </DrawerLink>
  ));
}
