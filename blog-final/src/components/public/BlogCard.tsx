import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "./PostMeta";

type CardPost = {
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl: string;
  readTimeMinutes: number;
  viewCount: number;
  publishedAt: Date | string | null;
  author: { name: string };
  category: { name: string; slug: string };
};

export function BlogCard({ post, priority = false }: { post: CardPost; priority?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
          <Image src={post.featuredImageUrl} alt="" fill priority={priority} loading={priority ? "eager" : "lazy"} className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
        </div>
        <div className="space-y-4 p-6">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-rust">{post.category.name}</span>
          <h2 className="font-serif text-2xl font-black leading-tight text-ink group-hover:text-rust">{post.title}</h2>
          <p className="line-clamp-3 text-sm leading-6 text-ink/65">{post.excerpt}</p>
          <PostMeta author={post.author.name} date={post.publishedAt} readTime={post.readTimeMinutes} views={post.viewCount} />
        </div>
      </Link>
    </article>
  );
}
