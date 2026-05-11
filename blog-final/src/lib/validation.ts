import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100).optional().or(z.literal("")),
  description: z.string().max(240).optional().or(z.literal("")),
});

export const tagSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80).optional().or(z.literal("")),
});

export const postSchema = z.object({
  title: z.string().min(4).max(160),
  slug: z.string().min(3).max(180).optional().or(z.literal("")),
  excerpt: z.string().min(20).max(320),
  content: z.string().min(80),
  featuredImageUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]),
  isFeatured: z.boolean().default(false),
});
