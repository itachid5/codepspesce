import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/public/ArticleBody";
import { PostMeta } from "@/components/public/PostMeta";
import { RelatedPosts } from "@/components/public/RelatedPosts";
import { TrendingPosts } from "@/components/public/TrendingPosts";
import { ViewTracker } from "@/components/public/ViewTracker";
import { absoluteUrl, siteName } from "@/lib/seo";
import { getPostBySlug, getRelatedPosts, getTrendingPosts } from "@/lib/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: absoluteUrl(`/posts/${post.slug}`) },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/posts/${post.slug}`),
      siteName,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: [{ url: post.featuredImageUrl, width: 1200, height: 800, alt: post.title }],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const tagIds = post.tags.map((item) => item.tagId);
  const [related, trending] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId, tagIds, 3),
    getTrendingPosts(4),
  ]);

  return (
    <>
      <ViewTracker slug={post.slug} title={post.title} />
      <article>
        <header className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">{post.category.name}</p>
              <h1 className="mt-4 max-w-5xl font-serif text-5xl font-black leading-[0.95] text-ink md:text-7xl">{post.title}</h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-ink/68">{post.excerpt}</p>
              <div className="mt-6"><PostMeta author={post.author.name} date={post.publishedAt} readTime={post.readTimeMinutes} views={post.viewCount} /></div>
            </div>
            <TrendingPosts posts={trending.filter((item) => item?.id !== post.id)} />
          </div>
          <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-[2.5rem] bg-ink/10 shadow-2xl shadow-ink/10">
            <Image src={post.featuredImageUrl} alt="" fill priority className="object-cover" sizes="100vw" />
          </div>
        </header>
        <ArticleBody content={post.content} />
      </article>
      <RelatedPosts posts={related} />
    </>
  );
}
