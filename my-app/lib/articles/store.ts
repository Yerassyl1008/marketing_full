import { promises as fs } from "fs";
import path from "path";

import type { ArticleRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

export async function readArticles(): Promise<ArticleRecord[]> {
  try {
    const raw = await fs.readFile(ARTICLES_FILE, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as ArticleRecord[]) : [];
  } catch {
    return [];
  }
}

export async function writeArticles(articles: ArticleRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

export async function getArticleBySlug(
  locale: string,
  slug: string,
  publishedOnly: boolean,
): Promise<ArticleRecord | null> {
  const list = await readArticles();
  return (
    list.find(
      (a) =>
        a.slug === slug &&
        a.locale === locale &&
        (!publishedOnly || a.published),
    ) ?? null
  );
}
