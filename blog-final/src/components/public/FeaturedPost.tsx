import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "./PostMeta";

type Featured = {
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

export function FeaturedPost({ post }: { post: Featured }) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 bg-ink text-paper shadow-2xl shadow-ink/15">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(217,90,60,0.35),transparent_34%),linear-gradient(115deg,rgba(17,24,39,0.95),rgba(17,24,39,0.45))]" />
      <Image src={post.featuredImageUrl} alt="" fill priority className="-z-10 object-cover opacity-60" sizes="100vw" />
      <div className="relative grid min-h-[560px] content-end p-7 md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <Link href={`/category/${post.category.slug}`} className="text-xs font-black uppercase tracking-[0.28em] text-copper">Featured / {post.category.name}</Link>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-black leading-[0.95] md:text-7xl">{post.title}</h1>
        </div>
        <div className="mt-8 rounded-[2rem] border border-paper/20 bg-paper/10 p-6 backdrop-blur-md lg:mt-0">
          <p className="text-lg leading-8 text-paper/82">{post.excerpt}</p>
          <div className="mt-6"><PostMeta author={post.author.name} date={post.publishedAt} readTime={post.readTimeMinutes} views={post.viewCount} /></div>
          <Link href={`/posts/${post.slug}`} className="mt-8 inline-flex rounded-full bg-paper px-6 py-3 text-sm font-black text-ink transition hover:bg-copper">Read the dispatch</Link>
        </div>
      </div>
    </section>
  );
}
