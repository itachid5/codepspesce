import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

type Trending = {
  id: string;
  title: string;
  slug: string;
  featuredImageUrl: string;
  readTimeMinutes: number;
  viewCount: number;
  category: { name: string; slug: string };
};

export function TrendingPosts({ posts }: { posts: Trending[] }) {
  if (!posts.length) return null;

  return (
    <aside className="rounded-[2rem] border border-ink/10 bg-sand p-5">
      <h2 className="text-xs font-black uppercase tracking-[0.28em] text-ink/50">Trending now</h2>
      <div className="mt-5 space-y-5">
        {posts.map((post, index) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className="group grid grid-cols-[3rem_1fr] gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-ink/10">
              <Image src={post.featuredImageUrl} alt="" fill className="object-cover" sizes="48px" />
            </div>
            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-rust">#{index + 1} · {post.category.name}</p>
              <h3 className="mt-1 font-serif text-lg font-black leading-tight text-ink group-hover:text-rust">{post.title}</h3>
              <p className="mt-1 text-xs font-bold text-ink/45">{formatNumber(post.viewCount)} views · {post.readTimeMinutes} min</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
