import { getCrmServerBaseUrl } from "@/lib/crm-server";

import { normalizeArticleSlugSegment } from "./slug";
import type { ArticleRecord } from "./types";

function crmBase(): string {
  return getCrmServerBaseUrl();
}

/** Опубликованные статьи с CRM (публичный эндпоинт, без токена). */
export async function readArticles(): Promise<ArticleRecord[]> {
  try {
    const res = await fetch(`${crmBase()}/public/articles`, { cache: "no-store" });
    if (!res.ok) {
      console.error("[articles] CRM GET /public/articles", res.status);
      return [];
    }
    const data = (await res.json()) as { items?: unknown };
    return Array.isArray(data.items) ? (data.items as ArticleRecord[]) : [];
  } catch (e) {
    console.error("[articles] readArticles", e);
    return [];
  }
}

export async function writeArticles(_articles: ArticleRecord[]): Promise<void> {
  throw new Error("writeArticles: статьи хранятся в CRM, используйте API CRM или админ-роуты Next.");
}

export async function getArticleBySlug(
  slug: string,
  publishedOnly: boolean,
): Promise<ArticleRecord | null> {
  if (!publishedOnly) {
    return null;
  }
  try {
    const enc = encodeURIComponent(normalizeArticleSlugSegment(slug));
    const res = await fetch(`${crmBase()}/public/articles/slug/${enc}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error("[articles] CRM GET slug", res.status);
      return null;
    }
    return (await res.json()) as ArticleRecord;
  } catch (e) {
    console.error("[articles] getArticleBySlug", e);
    return null;
  }
}
