import { NextResponse } from "next/server";

import { normalizeArticleSlugSegment, slugifyTitle } from "@/lib/articles/slug";
import { readArticles, writeArticles } from "@/lib/articles/store";
import type { ArticleRecord } from "@/lib/articles/types";
import { revalidateArticlePaths, revalidateBlogPaths } from "@/lib/articles/revalidate-blog";
import { getBearerToken, verifyAdminBearerToken } from "@/lib/verify-admin-bearer";

export const dynamic = "force-dynamic";

async function auth(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const v = await verifyAdminBearerToken(token);
  return v.ok ? token : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await auth(request))) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let patch: Partial<{
    locale: string;
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    published: boolean;
  }>;
  try {
    patch = (await request.json()) as typeof patch;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const list = await readArticles();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const prev = list[idx];
  const oldSlug = prev.slug;

  const next: ArticleRecord = { ...prev };

  if (typeof patch.title === "string" && patch.title.trim()) {
    next.title = patch.title.trim();
  }
  if (typeof patch.excerpt === "string") {
    next.excerpt = patch.excerpt.trim();
  }
  if (typeof patch.body === "string") {
    next.body = patch.body;
  }
  if (typeof patch.published === "boolean") {
    next.published = patch.published;
  }
  if (typeof patch.slug === "string" && patch.slug.trim()) {
    next.slug = slugifyTitle(patch.slug.trim());
  }

  const conflict = list.some(
    (a, i) => i !== idx && normalizeArticleSlugSegment(a.slug) === normalizeArticleSlugSegment(next.slug),
  );
  if (conflict) {
    return NextResponse.json({ detail: "slug exists for this locale" }, { status: 409 });
  }

  next.updatedAt = new Date().toISOString();
  list[idx] = next;
  await writeArticles(list);

  revalidateBlogPaths();
  revalidateArticlePaths(oldSlug);
  if (next.slug !== oldSlug) {
    revalidateArticlePaths(next.slug);
  }

  return NextResponse.json({ item: next });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await auth(request))) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const list = await readArticles();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const slug = list[idx].slug;
  list.splice(idx, 1);
  await writeArticles(list);
  revalidateBlogPaths();
  revalidateArticlePaths(slug);

  return NextResponse.json({ ok: true });
}
