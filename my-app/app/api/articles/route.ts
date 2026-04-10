import { NextResponse } from "next/server";

import { resolveArticleForLocale } from "@/lib/articles/resolve-display";
import { readArticles } from "@/lib/articles/store";

export const dynamic = "force-dynamic";

/** Публичный список опубликованных статей. ?locale=ru|en|… — поля title/excerpt для этой локали */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") || "ru").toLowerCase();
  const raw = (await readArticles())
    .filter((a) => a.published)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const items = await Promise.all(
    raw.map(async (a) => {
      const view = await resolveArticleForLocale(a, locale);
      return {
        id: a.id,
        locale,
        slug: a.slug,
        title: view.title,
        excerpt: view.excerpt,
        published: a.published,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    }),
  );

  return NextResponse.json({ items });
}
