import { formatDate, formatNumber } from "@/lib/utils";

export function PostMeta({ author, date, readTime, views }: { author: string; date?: Date | string | null; readTime: number; views: number }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-black uppercase tracking-[0.18em] text-ink/50">
      <span>{author}</span>
      <span>{formatDate(date)}</span>
      <span>{readTime} min read</span>
      <span>{formatNumber(views)} views</span>
    </div>
  );
}
