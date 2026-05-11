"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, requireAdmin, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateReadTimeMinutes } from "@/lib/read-time";
import { createSlug } from "@/lib/utils";
import { categorySchema, loginSchema, postSchema, tagSchema } from "@/lib/validation";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function postDataFromForm(formData: FormData) {
  return postSchema.parse({
    title: stringValue(formData, "title"),
    slug: stringValue(formData, "slug"),
    excerpt: stringValue(formData, "excerpt"),
    content: stringValue(formData, "content"),
    featuredImageUrl: stringValue(formData, "featuredImageUrl"),
    thumbnailUrl: stringValue(formData, "thumbnailUrl"),
    categoryId: stringValue(formData, "categoryId"),
    tagIds: formData.getAll("tagIds").filter((value): value is string => typeof value === "string"),
    status: stringValue(formData, "status"),
    isFeatured: formData.get("isFeatured") === "on",
  });
}

export async function loginAction(formData: FormData) {
  const data = loginSchema.parse({ email: stringValue(formData, "email"), password: stringValue(formData, "password") });
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) redirect("/admin/login?error=1");
  await createAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function createPostAction(formData: FormData) {
  const admin = await requireAdmin();
  const data = postDataFromForm(formData);
  const slug = data.slug ? createSlug(data.slug) : createSlug(data.title);
  const readTimeMinutes = calculateReadTimeMinutes(data.content);

  if (data.isFeatured) await prisma.post.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } });

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImageUrl: data.featuredImageUrl,
      thumbnailUrl: data.thumbnailUrl || data.featuredImageUrl,
      categoryId: data.categoryId,
      authorId: admin.id,
      status: data.status,
      isFeatured: data.isFeatured,
      readTimeMinutes,
      publishedAt: data.status === "published" ? new Date() : null,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
  });

  revalidatePath("/");
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function updatePostAction(postId: string, formData: FormData) {
  await requireAdmin();
  const data = postDataFromForm(formData);
  const existing = await prisma.post.findUniqueOrThrow({ where: { id: postId } });
  const slug = data.slug ? createSlug(data.slug) : createSlug(data.title);
  const readTimeMinutes = calculateReadTimeMinutes(data.content);

  if (data.isFeatured) await prisma.post.updateMany({ where: { isFeatured: true, id: { not: postId } }, data: { isFeatured: false } });

  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId } }),
    prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImageUrl: data.featuredImageUrl,
        thumbnailUrl: data.thumbnailUrl || data.featuredImageUrl,
        categoryId: data.categoryId,
        status: data.status,
        isFeatured: data.isFeatured,
        readTimeMinutes,
        publishedAt: data.status === "published" ? existing.publishedAt ?? new Date() : null,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  redirect("/admin/posts");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = stringValue(formData, "id");
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({ name: stringValue(formData, "name"), slug: stringValue(formData, "slug"), description: stringValue(formData, "description") });
  await prisma.category.create({ data: { name: data.name, slug: data.slug ? createSlug(data.slug) : createSlug(data.name), description: data.description || null } });
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: stringValue(formData, "id") } });
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function createTagAction(formData: FormData) {
  await requireAdmin();
  const data = tagSchema.parse({ name: stringValue(formData, "name"), slug: stringValue(formData, "slug") });
  await prisma.tag.create({ data: { name: data.name, slug: data.slug ? createSlug(data.slug) : createSlug(data.name) } });
  revalidatePath("/");
  redirect("/admin/tags");
}

export async function deleteTagAction(formData: FormData) {
  await requireAdmin();
  await prisma.tag.delete({ where: { id: stringValue(formData, "id") } });
  revalidatePath("/");
  redirect("/admin/tags");
}
