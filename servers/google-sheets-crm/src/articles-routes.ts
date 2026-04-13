import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import type { Express, Request, Response } from "express";
import express from "express";

import {
  deleteArticleById,
  getArticleById,
  getArticleBySlug,
  insertArticle,
  listArticlesAll,
  listArticlesPublished,
  updateArticleRow,
  type ArticleRecord,
} from "./articles-db.js";
import { normalizeArticleSlugSegment, slugifyTitle } from "./articles-slug.js";

function jsonArticle(a: ArticleRecord): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    published: a.published,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
  if (a.i18n) out.i18n = a.i18n;
  return out;
}

export function mountArticleRoutes(
  app: Express,
  articlesDb: Database.Database,
  verifyAdminBearer: (req: Request) => boolean,
): void {
  const publicArticles = express.Router();

  publicArticles.get("/", (_req: Request, res: Response) => {
    const items = listArticlesPublished(articlesDb).map(jsonArticle);
    res.json({ items });
  });

  publicArticles.get("/slug/:slug", (req: Request, res: Response) => {
    let raw = req.params.slug ?? "";
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* keep raw */
    }
    const article = getArticleBySlug(articlesDb, raw, true);
    if (!article) {
      res.status(404).json({ detail: "Not found" });
      return;
    }
    res.json(jsonArticle(article));
  });

  app.use("/public/articles", publicArticles);

  app.get("/articles", (req: Request, res: Response) => {
    if (!verifyAdminBearer(req)) {
      res.status(401).json({ detail: "Authentication required" });
      return;
    }
    const items = listArticlesAll(articlesDb).map(jsonArticle);
    res.json({ items });
  });

  app.post("/articles", (req: Request, res: Response) => {
    if (!verifyAdminBearer(req)) {
      res.status(401).json({ detail: "Authentication required" });
      return;
    }
    const body = req.body ?? {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      res.status(400).json({ detail: "title required" });
      return;
    }
    const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
    const slug = slugifyTitle(slugRaw || title);
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
    const text = typeof body.body === "string" ? body.body : "";
    const published = Boolean(body.published);

    const all = listArticlesAll(articlesDb);
    if (all.some((a) => normalizeArticleSlugSegment(a.slug) === slug)) {
      res.status(409).json({ detail: "slug already exists" });
      return;
    }

    const now = new Date().toISOString();
    const article: ArticleRecord = {
      id: randomUUID(),
      slug,
      title,
      excerpt,
      body: text,
      published,
      createdAt: now,
      updatedAt: now,
    };
    insertArticle(articlesDb, article);
    res.status(201).json({ item: jsonArticle(article) });
  });

  app.patch("/articles/:id", (req: Request, res: Response) => {
    if (!verifyAdminBearer(req)) {
      res.status(401).json({ detail: "Authentication required" });
      return;
    }
    const { id } = req.params;
    const patch = req.body ?? {};
    const prev = getArticleById(articlesDb, id);
    if (!prev) {
      res.status(404).json({ detail: "Not found" });
      return;
    }

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

    const all = listArticlesAll(articlesDb);
    const idx = all.findIndex((a) => a.id === id);
    const conflict = all.some(
      (a, i) =>
        i !== idx && normalizeArticleSlugSegment(a.slug) === normalizeArticleSlugSegment(next.slug),
    );
    if (conflict) {
      res.status(409).json({ detail: "slug exists for this locale" });
      return;
    }

    const oldSlug = prev.slug;
    next.updatedAt = new Date().toISOString();
    updateArticleRow(articlesDb, next);
    res.json({ item: jsonArticle(next), oldSlug });
  });

  app.delete("/articles/:id", (req: Request, res: Response) => {
    if (!verifyAdminBearer(req)) {
      res.status(401).json({ detail: "Authentication required" });
      return;
    }
    const { id } = req.params;
    const prev = getArticleById(articlesDb, id);
    if (!prev) {
      res.status(404).json({ detail: "Not found" });
      return;
    }
    const slug = prev.slug;
    deleteArticleById(articlesDb, id);
    res.json({ ok: true, slug });
  });
}
