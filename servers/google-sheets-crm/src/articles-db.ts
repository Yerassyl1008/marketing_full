import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeArticleSlugSegment } from "./articles-slug.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, "..", "data", "articles.sqlite");

export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  i18n?: Record<string, Record<string, string | undefined>>;
  locale?: string;
};

export function openArticlesDb(
  filePath = process.env.ARTICLES_SQLITE_PATH?.trim() || defaultPath,
): Database.Database {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      body TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      i18n_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
  `);
  return db;
}

function rowToArticle(r: Record<string, unknown>): ArticleRecord {
  let i18n: ArticleRecord["i18n"];
  const ij = r.i18n_json as string | null;
  if (ij) {
    try {
      const parsed = JSON.parse(ij) as unknown;
      if (parsed && typeof parsed === "object") {
        i18n = parsed as ArticleRecord["i18n"];
      }
    } catch {
      i18n = undefined;
    }
  }
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt as string,
    body: r.body as string,
    published: Boolean(r.published),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    ...(i18n ? { i18n } : {}),
  };
}

export function listArticlesAll(db: Database.Database): ArticleRecord[] {
  const rows = db
    .prepare(`SELECT * FROM articles ORDER BY datetime(updated_at) DESC`)
    .all() as Record<string, unknown>[];
  return rows.map(rowToArticle);
}

export function listArticlesPublished(db: Database.Database): ArticleRecord[] {
  const rows = db
    .prepare(
      `SELECT * FROM articles WHERE published = 1 ORDER BY datetime(updated_at) DESC`,
    )
    .all() as Record<string, unknown>[];
  return rows.map(rowToArticle);
}

export function getArticleById(db: Database.Database, id: string): ArticleRecord | null {
  const r = db.prepare(`SELECT * FROM articles WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  return r ? rowToArticle(r) : null;
}

export function getArticleBySlug(
  db: Database.Database,
  rawSlug: string,
  publishedOnly: boolean,
): ArticleRecord | null {
  const wanted = normalizeArticleSlugSegment(rawSlug);
  const rows = (
    publishedOnly
      ? db.prepare(`SELECT * FROM articles WHERE published = 1`).all()
      : db.prepare(`SELECT * FROM articles`).all()
  ) as Record<string, unknown>[];
  for (const r of rows) {
    const a = rowToArticle(r);
    if (normalizeArticleSlugSegment(a.slug) === wanted) {
      if (!publishedOnly || a.published) return a;
    }
  }
  return null;
}

export function insertArticle(db: Database.Database, article: ArticleRecord): void {
  db.prepare(
    `INSERT INTO articles (id, slug, title, excerpt, body, published, created_at, updated_at, i18n_json)
     VALUES (@id, @slug, @title, @excerpt, @body, @published, @created_at, @updated_at, @i18n_json)`,
  ).run({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    published: article.published ? 1 : 0,
    created_at: article.createdAt,
    updated_at: article.updatedAt,
    i18n_json: article.i18n ? JSON.stringify(article.i18n) : null,
  });
}

export function updateArticleRow(db: Database.Database, article: ArticleRecord): void {
  db.prepare(
    `UPDATE articles SET slug = ?, title = ?, excerpt = ?, body = ?, published = ?, updated_at = ?, i18n_json = ?
     WHERE id = ?`,
  ).run(
    article.slug,
    article.title,
    article.excerpt,
    article.body,
    article.published ? 1 : 0,
    article.updatedAt,
    article.i18n ? JSON.stringify(article.i18n) : null,
    article.id,
  );
}

export function deleteArticleById(db: Database.Database, id: string): boolean {
  const info = db.prepare(`DELETE FROM articles WHERE id = ?`).run(id);
  return info.changes > 0;
}
