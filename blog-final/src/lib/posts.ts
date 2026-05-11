import { prisma } from "./db";

export const postInclude = {
  author: true,
  category: true,
  tags: { include: { tag: true } },
} as const;

export async function getFeaturedPost() {
  return prisma.post.findFirst({
    where: { status: "published", isFeatured: true, publishedAt: { not: null } },
    include: postInclude,
    orderBy: [{ publishedAt: "desc" }],
  });
}

export async function getLatestPosts(take = 9, skip = 0) {
  return prisma.post.findMany({
    where: { status: "published", publishedAt: { not: null } },
    include: postInclude,
    orderBy: [{ publishedAt: "desc" }],
    take,
    skip,
  });
}

export async function getTrendingPosts(take = 5) {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const recent = await prisma.dailyPostMetric.groupBy({
    by: ["postId"],
    where: { date: { gte: since } },
    _sum: { views: true },
    orderBy: { _sum: { views: "desc" } },
    take,
  });

  if (recent.length) {
    const posts = await prisma.post.findMany({
      where: { id: { in: recent.map((item) => item.postId) }, status: "published" },
      include: postInclude,
    });
    return recent.flatMap((item) => {
      const post = posts.find((candidate) => candidate.id === item.postId);
      return post ? [post] : [];
    });
  }

  return prisma.post.findMany({
    where: { status: "published", publishedAt: { not: null } },
    include: postInclude,
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: "published" },
    include: postInclude,
  });
}

export async function getRelatedPosts(postId: string, categoryId: string, tagIds: string[], take = 3) {
  return prisma.post.findMany({
    where: {
      id: { not: postId },
      status: "published",
      OR: [{ categoryId }, { tags: { some: { tagId: { in: tagIds } } } }],
    },
    include: postInclude,
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

export async function searchPosts(query: string) {
  const q = query.trim();
  if (!q) return [];
  return prisma.post.findMany({
    where: {
      status: "published",
      OR: [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { content: { contains: q } },
        { category: { name: { contains: q } } },
        { tags: { some: { tag: { name: { contains: q } } } } },
      ],
    },
    include: postInclude,
    orderBy: [{ publishedAt: "desc" }],
    take: 30,
  });
}

export async function getPostsByCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "published" },
        include: postInclude,
        orderBy: { publishedAt: "desc" },
      },
    },
  });
}

export async function getPostsByTag(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          post: { include: postInclude },
        },
      },
    },
  });
}
