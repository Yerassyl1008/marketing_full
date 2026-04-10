import { NextResponse } from "next/server";

import { resolveArticleForLocale } from "@/lib/articles/resolve-display";
import { getArticleBySlug } from "@/lib/articles/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") || "ru").toLowerCase();

  const article = await getArticleBySlug(slug, true);
  if (!article) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const view = await resolveArticleForLocale(article, locale);
  const { id, slug: articleSlug, createdAt, updatedAt } = article;
  return NextResponse.json({
    id,
    locale,
    slug: articleSlug,
    title: view.title,
    excerpt: view.excerpt,
    body: view.body,
    createdAt,
    updatedAt,
  });
}
