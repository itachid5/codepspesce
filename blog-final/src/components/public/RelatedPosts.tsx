import { BlogCard } from "./BlogCard";

type RelatedPost = Parameters<typeof BlogCard>[0]["post"];

export function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">
      <div className="mb-8 flex items-end justify-between border-b border-ink/10 pb-4">
        <h2 className="font-serif text-4xl font-black text-ink">Related reading</h2>
        <span className="text-xs font-black uppercase tracking-[0.24em] text-ink/45">Same signal</span>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
      </div>
    </section>
  );
}
