import { NextResponse } from "next/server";

import { getArticleBySlug } from "@/lib/articles/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") || "ru").toLowerCase();

  const article = await getArticleBySlug(locale, slug, true);
  if (!article) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const { id, title, excerpt, body, createdAt, updatedAt } = article;
  return NextResponse.json({
    id,
    locale,
    slug,
    title,
    excerpt,
    body,
    createdAt,
    updatedAt,
  });
}
