import { NextResponse } from "next/server";

import { slugifyTitle } from "@/lib/articles/slug";
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
    return NextResponse.json({ detail: "Unauthorized", reason: v.reason }, { status: 401 });
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
    return NextResponse.json({ detail: "Unauthorized", reason: v.reason }, { status: 401 });
  }

  let body: {
    locale?: string;
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

  const locale = (typeof body.locale === "string" ? body.locale : "ru").toLowerCase().slice(0, 8);
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugifyTitle(slugRaw || title);
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const text = typeof body.body === "string" ? body.body : "";
  const published = Boolean(body.published);

  const list = await readArticles();
  if (list.some((a) => a.locale === locale && a.slug === slug)) {
    return NextResponse.json({ detail: "slug exists for this locale" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const article: ArticleRecord = {
    id: crypto.randomUUID(),
    locale,
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
