import { NextResponse } from "next/server";

import { normalizeArticleSlugSegment, slugifyTitle } from "@/lib/articles/slug";
import { readArticles, writeArticles } from "@/lib/articles/store";
import type { ArticleRecord } from "@/lib/articles/types";
import { revalidateArticlePaths, revalidateBlogPaths } from "@/lib/articles/revalidate-blog";
import { getBearerToken, verifyAdminBearerToken } from "@/lib/verify-admin-bearer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const v = await verifyAdminBearerToken(token);
  if (!v.ok) {
    return NextResponse.json(
      {
        detail: "Unauthorized",
        reason: v.reason,
        ...(v.detail ? { hint: v.detail } : {}),
      },
      { status: 401 },
    );
  }

  const items = await readArticles();
  items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const v = await verifyAdminBearerToken(token);
  if (!v.ok) {
    return NextResponse.json(
      {
        detail: "Unauthorized",
        reason: v.reason,
        ...(v.detail ? { hint: v.detail } : {}),
      },
      { status: 401 },
    );
  }

  let body: {
    slug?: string;
    title?: string;
    excerpt?: string;
    body?: string;
    published?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ detail: "title required" }, { status: 400 });
  }

  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugifyTitle(slugRaw || title);
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const text = typeof body.body === "string" ? body.body : "";
  const published = Boolean(body.published);

  const list = await readArticles();
  if (list.some((a) => normalizeArticleSlugSegment(a.slug) === slug)) {
    return NextResponse.json({ detail: "slug already exists" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const article: ArticleRecord = {
    id: crypto.randomUUID(),
    slug,
    title,
    excerpt,
    body: text,
    published,
    createdAt: now,
    updatedAt: now,
  };

  list.push(article);
  await writeArticles(list);
  revalidateBlogPaths();
  revalidateArticlePaths(slug);

  return NextResponse.json({ item: article }, { status: 201 });
}
