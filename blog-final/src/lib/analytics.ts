import "server-only";

import { cookies, headers } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { prisma } from "./db";

const VISITOR_COOKIE = "visitor_id";
const DEDUPE_MS = 1000 * 60 * 60 * 24;

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function startOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function recordPostView(postId: string) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;

  if (!visitorId) {
    visitorId = randomUUID();
    cookieStore.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const forwardedFor = headerStore.get("x-forwarded-for") ?? "";
  const userAgent = headerStore.get("user-agent") ?? "unknown";
  const visitorKey = hashValue(`${visitorId}:${postId}`);
  const since = new Date(Date.now() - DEDUPE_MS);

  const existing = await prisma.viewEvent.findFirst({
    where: { postId, visitorKey, createdAt: { gte: since } },
    select: { id: true },
  });

  if (existing) return { counted: false };

  await prisma.$transaction([
    prisma.viewEvent.create({
      data: {
        postId,
        visitorKey,
        ipHash: forwardedFor ? hashValue(forwardedFor.split(",")[0] ?? "") : null,
        userAgent: hashValue(userAgent),
      },
    }),
    prisma.post.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } }),
    prisma.dailyPostMetric.upsert({
      where: { postId_date: { postId, date: startOfDay() } },
      create: { postId, date: startOfDay(), views: 1 },
      update: { views: { increment: 1 } },
    }),
  ]);

  return { counted: true };
}
