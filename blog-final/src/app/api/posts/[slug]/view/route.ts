import { NextResponse } from "next/server";
import { recordPostView } from "@/lib/analytics";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!post || post.status !== "published") return NextResponse.json({ counted: false }, { status: 404 });
  const result = await recordPostView(post.id);
  return NextResponse.json(result);
}
