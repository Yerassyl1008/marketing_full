import { NextResponse } from "next/server";

import { readArticles } from "@/lib/articles/store";

export const dynamic = "force-dynamic";

/** Публичный список опубликованных статей. ?locale=ru */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") || "ru").toLowerCase();
  const all = await readArticles();
  const items = all
    .filter((a) => a.published && a.locale === locale)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map(({ id, locale: loc, slug, title, excerpt, published, createdAt, updatedAt }) => ({
      id,
      locale: loc,
      slug,
      title,
      excerpt,
      published,
      createdAt,
      updatedAt,
    }));

  return NextResponse.json({ items });
}
