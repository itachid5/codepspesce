import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { calculateReadTimeMinutes } from "../src/lib/read-time";

const prisma = new PrismaClient();

const posts = [
  {
    title: "The Quiet Architecture Behind Fast Product Teams",
    slug: "quiet-architecture-fast-product-teams",
    excerpt: "A practical look at the rituals, systems, and editorial discipline that help software teams ship smarter without adding ceremony.",
    category: "Engineering",
    tags: ["Architecture", "Teams"],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
    featured: true,
  },
  {
    title: "Designing Analytics That Editors Actually Trust",
    slug: "designing-analytics-editors-trust",
    excerpt: "View counts are only useful when they are understandable. Here is a pattern for lightweight editorial analytics that stays honest.",
    category: "Product",
    tags: ["Analytics", "CMS"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
    featured: false,
  },
  {
    title: "Why Modern CMS Interfaces Should Feel Like Instruments",
    slug: "modern-cms-interfaces-instruments",
    excerpt: "Publishing tools work best when they are calm, precise, and responsive enough to disappear behind the writing.",
    category: "Design",
    tags: ["CMS", "Design"],
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1600&auto=format&fit=crop",
    featured: false,
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-now";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Managing Editor",
      email: adminEmail,
      passwordHash: await hash(adminPassword, 12),
    },
  });

  for (const post of posts) {
    const category = await prisma.category.upsert({
      where: { slug: post.category.toLowerCase() },
      update: {},
      create: { name: post.category, slug: post.category.toLowerCase(), description: `${post.category} coverage and analysis.` },
    });

    const tagRecords = await Promise.all(
      post.tags.map((tag) =>
        prisma.tag.upsert({
          where: { slug: tag.toLowerCase().replaceAll(" ", "-") },
          update: {},
          create: { name: tag, slug: tag.toLowerCase().replaceAll(" ", "-") },
        }),
      ),
    );

    const content = `${post.excerpt}\n\n## Signal\n\nGreat publishing systems do not begin with decoration. They begin with rhythm: a reliable way to draft, review, publish, measure, and improve. This article explores the operational choices that turn a blog into a living newsroom.\n\n## Practice\n\nThe teams that move fastest tend to protect the reader experience first. They measure views without obsessing over noise, keep taxonomy simple, and make the writing interface direct enough that publishing feels effortless.`;

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content,
        featuredImageUrl: post.image,
        thumbnailUrl: post.image,
        status: "published",
        isFeatured: post.featured,
        publishedAt: new Date(),
        readTimeMinutes: calculateReadTimeMinutes(content),
        viewCount: Math.floor(Math.random() * 900) + 100,
        authorId: admin.id,
        categoryId: category.id,
        tags: { create: tagRecords.map((tag) => ({ tagId: tag.id })) },
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
